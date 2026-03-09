/**
 * Courses Router — IMPACT7
 * Trilhas de aprendizado: cursos, aulas e matrículas
 * SET7: Validação Zod, Audit Trail, ACID, cache
 */
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { courses, courseLessons, courseEnrollments, users } from '../../drizzle/schema';
import { eq, desc, and, sql, asc } from 'drizzle-orm';
import { auditService } from '../services/audit/audit-service';

function slugify(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

export const coursesRouter = router({
  // ─── Público ────────────────────────────────────────────────────────────────
  list: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(12),
      level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { courses: [], total: 0, pages: 0 };

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 12;
      const offset = (page - 1) * limit;

      const conditions = [eq(courses.status, 'published')];
      if (input?.level) conditions.push(eq(courses.level, input.level));
      const whereClause = and(...conditions);

      const [rows, countResult, lessonCounts] = await Promise.all([
        db.select().from(courses).where(whereClause)
          .orderBy(desc(courses.publishedAt)).limit(limit).offset(offset),
        db.select({ count: sql<number>`COUNT(*)` }).from(courses).where(whereClause),
        db.select({ courseId: courseLessons.courseId, count: sql<number>`COUNT(*)` })
          .from(courseLessons).groupBy(courseLessons.courseId),
      ]);

      const lessonMap = Object.fromEntries(lessonCounts.map(l => [l.courseId, Number(l.count)]));
      const total = Number(countResult[0]?.count ?? 0);

      return {
        courses: rows.map(c => ({ ...c, lessonCount: lessonMap[c.id] ?? 0 })),
        total,
        pages: Math.ceil(total / limit),
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [course] = await db.select().from(courses)
        .where(and(eq(courses.slug, input.slug), eq(courses.status, 'published')));
      if (!course) return null;

      const lessons = await db.select().from(courseLessons)
        .where(eq(courseLessons.courseId, course.id))
        .orderBy(asc(courseLessons.orderIndex));

      const [enrollCount] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(courseEnrollments).where(eq(courseEnrollments.courseId, course.id));

      return { ...course, lessons, enrollmentCount: Number(enrollCount?.count ?? 0) };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const [course] = await db.select().from(courses)
        .where(eq(courses.id, input.id));
      if (!course) return null;

      const lessons = await db.select().from(courseLessons)
        .where(eq(courseLessons.courseId, course.id))
        .orderBy(asc(courseLessons.orderIndex));

      const [enrollCount] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(courseEnrollments).where(eq(courseEnrollments.courseId, course.id));

      let enrollment = null;
      if (ctx.user) {
        const [enr] = await db.select().from(courseEnrollments)
          .where(and(
            eq(courseEnrollments.courseId, course.id),
            eq(courseEnrollments.userId, ctx.user.id)
          ));
        enrollment = enr ?? null;
      }

      return { ...course, lessons, enrollmentCount: Number(enrollCount?.count ?? 0), enrollment };
    }),

  // ─── Matrícula ───────────────────────────────────────────────────────────────
  enroll: protectedProcedure
    .input(z.object({ courseId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [course] = await db.select({ id: courses.id, status: courses.status })
        .from(courses).where(eq(courses.id, input.courseId));
      if (!course || course.status !== 'published') throw new Error('Curso não disponível');

      const [existing] = await db.select({ id: courseEnrollments.id })
        .from(courseEnrollments)
        .where(and(eq(courseEnrollments.courseId, input.courseId), eq(courseEnrollments.userId, ctx.user.id)));
      if (existing) throw new Error('Você já está matriculado neste curso');

      const [enrollment] = await db.insert(courseEnrollments).values({
        courseId: input.courseId,
        userId: ctx.user.id,
        progress: 0,
        enrolledAt: Date.now(),
      }).$returningId();

      return { success: true, enrollmentId: enrollment.id };
    }),

  getMyEnrollments: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db.select({
      id: courseEnrollments.id,
      courseId: courseEnrollments.courseId,
      progress: courseEnrollments.progress,
      completedAt: courseEnrollments.completedAt,
      enrolledAt: courseEnrollments.enrolledAt,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      courseFeaturedImage: courses.featuredImage,
      courseLevel: courses.level,
    }).from(courseEnrollments)
      .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .where(eq(courseEnrollments.userId, ctx.user.id))
      .orderBy(desc(courseEnrollments.enrolledAt));
  }),

  updateProgress: protectedProcedure
    .input(z.object({
      courseId: z.number().int().positive(),
      progress: z.number().int().min(0).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const now = Date.now();
      const updateData: Record<string, unknown> = { progress: input.progress };
      if (input.progress >= 100) updateData.completedAt = now;

      await db.update(courseEnrollments).set(updateData)
        .where(and(
          eq(courseEnrollments.courseId, input.courseId),
          eq(courseEnrollments.userId, ctx.user.id)
        ));

      return { success: true };
    }),

  // ─── Admin ──────────────────────────────────────────────────────────────────
  adminList: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
      status: z.enum(['draft', 'published', 'archived']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) return { courses: [], total: 0 };

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const conditions = input?.status ? [eq(courses.status, input.status)] : [];
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db.select().from(courses).where(whereClause)
          .orderBy(desc(courses.createdAt)).limit(limit).offset(offset),
        db.select({ count: sql<number>`COUNT(*)` }).from(courses).where(whereClause),
      ]);

      return { courses: rows, total: Number(countResult[0]?.count ?? 0) };
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(3).max(500),
      description: z.string().optional(),
      instructor: z.string().max(255).optional(),
      duration: z.number().int().positive().optional(),
      level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      price: z.number().min(0).optional(),
      featuredImage: z.string().url().optional().or(z.literal('')),
      status: z.enum(['draft', 'published']).default('draft'),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const now = Date.now();
      const slug = `${slugify(input.title)}-${now}`;

      const [course] = await db.insert(courses).values({
        title: input.title,
        slug,
        description: input.description ?? null,
        instructor: input.instructor ?? null,
        duration: input.duration ?? null,
        level: input.level ?? null,
        price: input.price != null ? String(input.price) : null,
        featuredImage: input.featuredImage || null,
        status: input.status,
        publishedAt: input.status === 'published' ? now : null,
        createdAt: now,
        updatedAt: now,
      }).$returningId();

      await auditService.log({
        userId: ctx.user.id,
        userName: ctx.user.name ?? undefined,
        userEmail: ctx.user.email ?? undefined,
        action: 'create',
        resourceType: 'course',
        resourceId: String(course.id),
        resourceName: input.title,
      });

      return { success: true, id: course.id, slug };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number().int().positive(),
      title: z.string().min(3).max(500).optional(),
      description: z.string().optional(),
      instructor: z.string().max(255).optional(),
      duration: z.number().int().positive().optional(),
      level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      price: z.number().min(0).optional(),
      featuredImage: z.string().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const { id, price, ...rest } = input;
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const updateData: Record<string, unknown> = { ...rest, updatedAt: Date.now() };
      if (price !== undefined) updateData.price = String(price);
      if (rest.status === 'published') {
        const [existing] = await db.select({ publishedAt: courses.publishedAt }).from(courses).where(eq(courses.id, id));
        if (!existing?.publishedAt) updateData.publishedAt = Date.now();
      }

      await db.update(courses).set(updateData).where(eq(courses.id, id));

      await auditService.log({
        userId: ctx.user.id,
        userName: ctx.user.name ?? undefined,
        userEmail: ctx.user.email ?? undefined,
        action: 'update',
        resourceType: 'course',
        resourceId: String(id),
        newValue: updateData,
      });

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [course] = await db.select({ title: courses.title }).from(courses).where(eq(courses.id, input.id));
      await db.delete(courseEnrollments).where(eq(courseEnrollments.courseId, input.id));
      await db.delete(courseLessons).where(eq(courseLessons.courseId, input.id));
      await db.delete(courses).where(eq(courses.id, input.id));

      await auditService.log({
        userId: ctx.user.id,
        userName: ctx.user.name ?? undefined,
        userEmail: ctx.user.email ?? undefined,
        action: 'delete',
        resourceType: 'course',
        resourceId: String(input.id),
        resourceName: course?.title,
      });

      return { success: true };
    }),

  // ─── Aulas ───────────────────────────────────────────────────────────────────
  createLesson: protectedProcedure
    .input(z.object({
      courseId: z.number().int().positive(),
      title: z.string().min(3).max(500),
      content: z.string().optional(),
      videoUrl: z.string().url().optional().or(z.literal('')),
      duration: z.number().int().positive().optional(),
      orderIndex: z.number().int().min(0).default(0),
      isFree: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const now = Date.now();
      const [lesson] = await db.insert(courseLessons).values({
        courseId: input.courseId,
        title: input.title,
        content: input.content ?? null,
        videoUrl: input.videoUrl || null,
        duration: input.duration ?? null,
        orderIndex: input.orderIndex,
        isFree: input.isFree ? 1 : 0,
        createdAt: now,
        updatedAt: now,
      }).$returningId();

      return { success: true, id: lesson.id };
    }),

  // Obter aula individual por ID (com verificação de acesso)
  getLesson: publicProcedure
    .input(z.object({
      lessonId: z.number().int().positive(),
      courseId: z.number().int().positive(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const [lesson] = await db.select().from(courseLessons)
        .where(and(eq(courseLessons.id, input.lessonId), eq(courseLessons.courseId, input.courseId)));
      if (!lesson) return null;
      // Verificar acesso: aula gratuita ou usuário matriculado
      let hasAccess = !!lesson.isFree;
      if (!hasAccess && ctx.user) {
        const [enrollment] = await db.select({ id: courseEnrollments.id })
          .from(courseEnrollments)
          .where(and(
            eq(courseEnrollments.courseId, input.courseId),
            eq(courseEnrollments.userId, ctx.user.id)
          ));
        hasAccess = !!enrollment;
      }
      return { ...lesson, hasAccess };
    }),

  // Marcar aula como concluída e atualizar progresso
  markLessonComplete: protectedProcedure
    .input(z.object({
      lessonId: z.number().int().positive(),
      courseId: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const [enrollment] = await db.select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.courseId, input.courseId),
          eq(courseEnrollments.userId, ctx.user.id)
        ));
      if (!enrollment) throw new Error('Você não está matriculado neste curso');
      const [totalRow] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(courseLessons).where(eq(courseLessons.courseId, input.courseId));
      const total = Number(totalRow?.count ?? 1);
      const completedLessons: number[] = JSON.parse((enrollment as any).completedLessons || '[]');
      if (!completedLessons.includes(input.lessonId)) completedLessons.push(input.lessonId);
      const newProgress = Math.min(100, Math.round((completedLessons.length / total) * 100));
      const updateData: Record<string, unknown> = {
        progress: newProgress,
        completedLessons: JSON.stringify(completedLessons),
      };
      if (newProgress >= 100) updateData.completedAt = Date.now();
      await db.update(courseEnrollments).set(updateData)
        .where(and(
          eq(courseEnrollments.courseId, input.courseId),
          eq(courseEnrollments.userId, ctx.user.id)
        ));
      return { success: true, progress: newProgress, completedLessons };
    }),

  deleteLesson: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(courseLessons).where(eq(courseLessons.id, input.id));
      return { success: true };
    }),

  getEnrollments: protectedProcedure
    .input(z.object({ courseId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) return [];

      return db.select({
        id: courseEnrollments.id,
        userId: courseEnrollments.userId,
        progress: courseEnrollments.progress,
        completedAt: courseEnrollments.completedAt,
        enrolledAt: courseEnrollments.enrolledAt,
        userName: users.name,
        userEmail: users.email,
      }).from(courseEnrollments)
        .leftJoin(users, eq(courseEnrollments.userId, users.id))
        .where(eq(courseEnrollments.courseId, input.courseId))
        .orderBy(desc(courseEnrollments.enrolledAt));
    }),
});
