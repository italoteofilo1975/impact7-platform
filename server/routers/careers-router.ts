import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { jobOpenings } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const careersRouter = router({
  // Listar vagas ativas (público)
  list: publicProcedure
    .input(
      z.object({
        department: z.string().optional(),
        type: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(jobOpenings)
        .where(eq(jobOpenings.isActive, 1))
        .orderBy(desc(jobOpenings.isNew), desc(jobOpenings.createdAt));

      let filtered = rows;
      if (input?.department) {
        const dept = input.department.toLowerCase();
        filtered = filtered.filter((r) => r.department?.toLowerCase() === dept);
      }
      if (input?.type) {
        const t = input.type.toLowerCase();
        filtered = filtered.filter((r) => r.type?.toLowerCase() === t);
      }
      return filtered;
    }),

  // Obter vaga por ID (público)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [row] = await db
        .select()
        .from(jobOpenings)
        .where(eq(jobOpenings.id, input.id));
      return row ?? null;
    }),

  // Admin: listar todas (ativas e inativas)
  adminList: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(jobOpenings)
      .orderBy(desc(jobOpenings.createdAt));
  }),

  // Admin: criar vaga
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3),
        department: z.string().optional(),
        location: z.string().optional(),
        type: z.string().optional(),
        salaryRange: z.string().optional(),
        description: z.string().optional(),
        requirements: z.array(z.string()).optional(),
        benefits: z.array(z.string()).optional(),
        isActive: z.boolean().default(true),
        isNew: z.boolean().default(true),
        applyUrl: z.string().optional(),
        closingDate: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const now = Date.now();
      const [row] = await db.insert(jobOpenings).values({
        title: input.title,
        department: input.department,
        location: input.location,
        type: input.type,
        salaryRange: input.salaryRange,
        description: input.description,
        requirements: input.requirements,
        benefits: input.benefits,
        isActive: input.isActive ? 1 : 0,
        isNew: input.isNew ? 1 : 0,
        applyUrl: input.applyUrl,
        closingDate: input.closingDate,
        createdAt: now,
        updatedAt: now,
      }).returning({ id: jobOpenings.id });
      const newId = row?.id ?? 0;
      // Audit trail
      try {
        const { auditService } = await import('../services/audit/audit-service');
        await auditService.log({
          userId: ctx.user.id,
          userName: ctx.user.name || undefined,
          userEmail: ctx.user.email || undefined,
          action: 'create',
          resourceType: 'job_opening',
          resourceId: String(newId),
          resourceName: input.title,
          newValue: { title: input.title, department: input.department, isActive: input.isActive },
        });
      } catch { /* audit não bloqueia */ }
      return { success: true, id: newId };
    }),

  // Admin: atualizar vaga
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(3).optional(),
        department: z.string().optional(),
        location: z.string().optional(),
        type: z.string().optional(),
        salaryRange: z.string().optional(),
        description: z.string().optional(),
        requirements: z.array(z.string()).optional(),
        benefits: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        isNew: z.boolean().optional(),
        applyUrl: z.string().optional(),
        closingDate: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { id, isActive, isNew, ...rest } = input;
      // Buscar estado anterior para audit
      const [prev] = await db.select().from(jobOpenings).where(eq(jobOpenings.id, id));
      const updates: Record<string, unknown> = {
        ...rest,
        updatedAt: Date.now(),
      };
      if (isActive !== undefined) updates.isActive = isActive ? 1 : 0;
      if (isNew !== undefined) updates.isNew = isNew ? 1 : 0;

      await db
        .update(jobOpenings)
        .set(updates)
        .where(eq(jobOpenings.id, id));
      // Audit trail
      try {
        const { auditService } = await import('../services/audit/audit-service');
        await auditService.log({
          userId: ctx.user.id,
          userName: ctx.user.name || undefined,
          userEmail: ctx.user.email || undefined,
          action: 'update',
          resourceType: 'job_opening',
          resourceId: String(id),
          resourceName: prev?.title || input.title,
          previousValue: { isActive: prev?.isActive, title: prev?.title },
          newValue: { ...updates },
        });
      } catch { /* audit não bloqueia */ }
      return { success: true };
    }),

  // Admin: excluir vaga
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [prev] = await db.select().from(jobOpenings).where(eq(jobOpenings.id, input.id));
      await db.delete(jobOpenings).where(eq(jobOpenings.id, input.id));
      // Audit trail
      try {
        const { auditService } = await import('../services/audit/audit-service');
        await auditService.log({
          userId: ctx.user.id,
          userName: ctx.user.name || undefined,
          userEmail: ctx.user.email || undefined,
          action: 'delete',
          resourceType: 'job_opening',
          resourceId: String(input.id),
          resourceName: prev?.title,
          previousValue: { title: prev?.title, isActive: prev?.isActive },
        });
      } catch { /* audit não bloqueia */ }
      return { success: true };
    }),
});
