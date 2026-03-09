import { router, publicProcedure, adminProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { cmsPages } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const cmsRouter = router({
  // Público: buscar página por slug
  getPage: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [page] = await db.select().from(cmsPages)
        .where(eq(cmsPages.slug, input.slug));
      return page ?? null;
    }),

  // Público: listar páginas publicadas
  listPages: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: cmsPages.id,
        slug: cmsPages.slug,
        title: cmsPages.title,
        metaDescription: cmsPages.metaDescription,
        isPublished: cmsPages.isPublished,
        updatedAt: cmsPages.updatedAt,
      }).from(cmsPages).orderBy(cmsPages.slug);
    }),

  // Admin: listar todas as páginas
  adminList: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(cmsPages).orderBy(cmsPages.slug);
    }),

  // Admin: criar página
  create: adminProcedure
    .input(z.object({
      slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
      title: z.string().min(2).max(500),
      content: z.string().optional(),
      metaDescription: z.string().max(500).optional(),
      isPublished: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const now = Date.now();
      const [result] = await db.insert(cmsPages).values({
        slug: input.slug,
        title: input.title,
        content: input.content ?? '',
        metaDescription: input.metaDescription,
        isPublished: input.isPublished ? 1 : 0,
        updatedBy: ctx.user.id,
        createdAt: now,
        updatedAt: now,
      }).$returningId();
      return { success: true, id: result.id };
    }),

  // Admin: atualizar página
  update: adminProcedure
    .input(z.object({
      id: z.number().int().positive(),
      title: z.string().min(2).max(500).optional(),
      content: z.string().optional(),
      metaDescription: z.string().max(500).optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {
        updatedAt: Date.now(),
        updatedBy: ctx.user.id,
      };
      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
      if (data.isPublished !== undefined) updateData.isPublished = data.isPublished ? 1 : 0;
      await db.update(cmsPages).set(updateData).where(eq(cmsPages.id, id));
      return { success: true };
    }),

  // Admin: excluir página
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.delete(cmsPages).where(eq(cmsPages.id, input.id));
      return { success: true };
    }),
});
