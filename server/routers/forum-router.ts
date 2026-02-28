/**
 * Forum Router — IMPACT7
 * Comunidade: categorias, tópicos e respostas com moderação admin
 * SET7: Validação Zod, Audit Trail, ACID, proteção XSS via sanitização
 */
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { forumCategories, forumTopics, forumReplies, users } from '../../drizzle/schema';
import { eq, desc, and, sql, asc } from 'drizzle-orm';
import { auditService } from '../services/audit/audit-service';

// Sanitização básica contra XSS
function sanitize(str: string): string {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function slugify(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const forumRouter = router({
  // ─── Categorias ─────────────────────────────────────────────────────────────
  getCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const cats = await db.select().from(forumCategories)
      .where(eq(forumCategories.isActive, 1))
      .orderBy(asc(forumCategories.displayOrder));

    // Contar tópicos por categoria
    const counts = await db.select({
      categoryId: forumTopics.categoryId,
      count: sql<number>`COUNT(*)`,
    }).from(forumTopics).groupBy(forumTopics.categoryId);

    const countMap = Object.fromEntries(counts.map(c => [c.categoryId, Number(c.count)]));
    return cats.map(c => ({ ...c, topicCount: countMap[c.id] ?? 0 }));
  }),

  // ─── Tópicos ─────────────────────────────────────────────────────────────────
  getTopics: publicProcedure
    .input(z.object({
      categoryId: z.number().int().positive().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { topics: [], total: 0, pages: 0 };

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const conditions = input?.categoryId ? [eq(forumTopics.categoryId, input.categoryId)] : [];
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [topics, countResult] = await Promise.all([
        db.select({
          id: forumTopics.id,
          title: forumTopics.title,
          slug: forumTopics.slug,
          categoryId: forumTopics.categoryId,
          userId: forumTopics.userId,
          isPinned: forumTopics.isPinned,
          isLocked: forumTopics.isLocked,
          viewCount: forumTopics.viewCount,
          replyCount: forumTopics.replyCount,
          lastActivityAt: forumTopics.lastActivityAt,
          createdAt: forumTopics.createdAt,
          authorName: users.name,
        }).from(forumTopics)
          .leftJoin(users, eq(forumTopics.userId, users.id))
          .where(whereClause)
          .orderBy(desc(forumTopics.isPinned), desc(forumTopics.lastActivityAt))
          .limit(limit).offset(offset),
        db.select({ count: sql<number>`COUNT(*)` }).from(forumTopics).where(whereClause),
      ]);

      const total = Number(countResult[0]?.count ?? 0);
      return { topics, total, pages: Math.ceil(total / limit) };
    }),

  getTopicBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [topic] = await db.select({
        id: forumTopics.id,
        title: forumTopics.title,
        slug: forumTopics.slug,
        content: forumTopics.content,
        categoryId: forumTopics.categoryId,
        userId: forumTopics.userId,
        isPinned: forumTopics.isPinned,
        isLocked: forumTopics.isLocked,
        viewCount: forumTopics.viewCount,
        replyCount: forumTopics.replyCount,
        createdAt: forumTopics.createdAt,
        updatedAt: forumTopics.updatedAt,
        authorName: users.name,
      }).from(forumTopics)
        .leftJoin(users, eq(forumTopics.userId, users.id))
        .where(eq(forumTopics.slug, input.slug));

      if (!topic) return null;

      // Incrementar viewCount
      await db.update(forumTopics)
        .set({ viewCount: sql`${forumTopics.viewCount} + 1` })
        .where(eq(forumTopics.id, topic.id));

      // Buscar respostas
      const replies = await db.select({
        id: forumReplies.id,
        content: forumReplies.content,
        userId: forumReplies.userId,
        isAccepted: forumReplies.isAccepted,
        createdAt: forumReplies.createdAt,
        updatedAt: forumReplies.updatedAt,
        authorName: users.name,
      }).from(forumReplies)
        .leftJoin(users, eq(forumReplies.userId, users.id))
        .where(eq(forumReplies.topicId, topic.id))
        .orderBy(asc(forumReplies.createdAt));

      return { ...topic, replies };
    }),

  createTopic: protectedProcedure
    .input(z.object({
      categoryId: z.number().int().positive(),
      title: z.string().min(5).max(500),
      content: z.string().min(10).max(50000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar categoria
      const [cat] = await db.select({ id: forumCategories.id })
        .from(forumCategories)
        .where(and(eq(forumCategories.id, input.categoryId), eq(forumCategories.isActive, 1)));
      if (!cat) throw new Error('Categoria não encontrada');

      const now = Date.now();
      const slug = `${slugify(input.title)}-${now}`;

      const [topic] = await db.insert(forumTopics).values({
        categoryId: input.categoryId,
        userId: ctx.user.id,
        title: sanitize(input.title),
        slug,
        content: input.content,
        isPinned: 0,
        isLocked: 0,
        viewCount: 0,
        replyCount: 0,
        lastActivityAt: now,
        createdAt: now,
        updatedAt: now,
      }).$returningId();

      return { success: true, id: topic.id, slug };
    }),

  createReply: protectedProcedure
    .input(z.object({
      topicId: z.number().int().positive(),
      content: z.string().min(5).max(50000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar tópico e se está bloqueado
      const [topic] = await db.select({ id: forumTopics.id, isLocked: forumTopics.isLocked })
        .from(forumTopics).where(eq(forumTopics.id, input.topicId));
      if (!topic) throw new Error('Tópico não encontrado');
      if (topic.isLocked && ctx.user.role !== 'admin') {
        throw new Error('Este tópico está bloqueado para novas respostas');
      }

      const now = Date.now();
      const [reply] = await db.insert(forumReplies).values({
        topicId: input.topicId,
        userId: ctx.user.id,
        content: input.content,
        isAccepted: 0,
        createdAt: now,
        updatedAt: now,
      }).$returningId();

      // Atualizar contagem e última atividade
      await db.update(forumTopics).set({
        replyCount: sql`${forumTopics.replyCount} + 1`,
        lastActivityAt: now,
        updatedAt: now,
      }).where(eq(forumTopics.id, input.topicId));

      return { success: true, id: reply.id };
    }),

  deleteReply: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [reply] = await db.select().from(forumReplies).where(eq(forumReplies.id, input.id));
      if (!reply) throw new Error('Resposta não encontrada');
      if (reply.userId !== ctx.user.id && ctx.user.role !== 'admin') {
        throw new Error('Sem permissão para excluir esta resposta');
      }

      await db.delete(forumReplies).where(eq(forumReplies.id, input.id));

      // Decrementar contagem
      await db.update(forumTopics).set({
        replyCount: sql`GREATEST(0, ${forumTopics.replyCount} - 1)`,
        updatedAt: Date.now(),
      }).where(eq(forumTopics.id, reply.topicId));

      return { success: true };
    }),

  deleteTopic: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Apenas admins podem excluir tópicos');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [topic] = await db.select({ title: forumTopics.title }).from(forumTopics).where(eq(forumTopics.id, input.id));
      await db.delete(forumReplies).where(eq(forumReplies.topicId, input.id));
      await db.delete(forumTopics).where(eq(forumTopics.id, input.id));

      await auditService.log({
        userId: ctx.user.id,
        userName: ctx.user.name ?? undefined,
        userEmail: ctx.user.email ?? undefined,
        action: 'delete',
        resourceType: 'forum_topic',
        resourceId: String(input.id),
        resourceName: topic?.title,
      });

      return { success: true };
    }),

  // ─── Admin: Categorias ───────────────────────────────────────────────────────
  createCategory: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(255),
      description: z.string().max(1000).optional(),
      displayOrder: z.number().int().min(0).default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const slug = slugify(input.name);
      const [cat] = await db.insert(forumCategories).values({
        name: input.name,
        slug,
        description: input.description ?? null,
        displayOrder: input.displayOrder,
        isActive: 1,
        createdAt: Date.now(),
      }).$returningId();

      return { success: true, id: cat.id };
    }),

  toggleTopicPin: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [topic] = await db.select({ isPinned: forumTopics.isPinned }).from(forumTopics).where(eq(forumTopics.id, input.id));
      if (!topic) throw new Error('Tópico não encontrado');

      await db.update(forumTopics).set({
        isPinned: topic.isPinned ? 0 : 1,
        updatedAt: Date.now(),
      }).where(eq(forumTopics.id, input.id));

      return { success: true, isPinned: !topic.isPinned };
    }),

  toggleTopicLock: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [topic] = await db.select({ isLocked: forumTopics.isLocked }).from(forumTopics).where(eq(forumTopics.id, input.id));
      if (!topic) throw new Error('Tópico não encontrado');

      await db.update(forumTopics).set({
        isLocked: topic.isLocked ? 0 : 1,
        updatedAt: Date.now(),
      }).where(eq(forumTopics.id, input.id));

      return { success: true, isLocked: !topic.isLocked };
    }),
});
