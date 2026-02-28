/**
 * Blog Router — IMPACT7
 * Endpoints públicos e admin para gestão de artigos do blog
 */
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { blogPosts } from '../../drizzle/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { blogCache } from '../services/cache/cache-service';
import { auditService } from '../services/audit/audit-service';

export const blogRouter = router({
  // ─── Público ────────────────────────────────────────────────────────────────
  list: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(9),
      category: z.string().optional(),
      featured: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 9;
      const cacheKey = `blog:list:${JSON.stringify(input ?? {})}`;
      const cached = blogCache.get(cacheKey);
      if (cached) return cached as { posts: unknown[]; total: number; pages: number };

      const db = await getDb();
      if (!db) return { posts: [], total: 0, pages: 0 };

      const conditions: ReturnType<typeof eq>[] = [eq(blogPosts.status, 'published')];
      if (input?.category) conditions.push(eq(blogPosts.category, input.category));
      // featured filter removed - column does not exist in DB

      const whereClause = and(...conditions);
      const offset = (page - 1) * limit;

      const [posts, countResult] = await Promise.all([
        db.select().from(blogPosts)
          .where(whereClause)
          .orderBy(desc(blogPosts.publishedAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`COUNT(*)` }).from(blogPosts).where(whereClause),
      ]);

      const total = Number(countResult[0]?.count ?? 0);
      const result = { posts, total, pages: Math.ceil(total / limit) };
      blogCache.set(cacheKey, result);
      return result;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const cacheKey = `blog:slug:${input.slug}`;
      const cached = blogCache.get(cacheKey);
      if (cached) return cached;

      const db = await getDb();
      if (!db) return null;

      const [post] = await db.select().from(blogPosts)
        .where(and(eq(blogPosts.slug, input.slug), eq(blogPosts.status, 'published')));

      if (post) blogCache.set(cacheKey, post);
      return post ?? null;
    }),

  getCategories: publicProcedure.query(async () => {
    const cacheKey = 'blog:categories';
    const cached = blogCache.get(cacheKey);
    if (cached) return cached as string[];

    const db = await getDb();
    if (!db) return [];

    const rows = await db.selectDistinct({ category: blogPosts.category })
      .from(blogPosts)
      .where(and(eq(blogPosts.status, 'published'), sql`${blogPosts.category} IS NOT NULL`));

    const categories = rows.map(r => r.category).filter(Boolean) as string[];
    blogCache.set(cacheKey, categories);
    return categories;
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
      if (!db) return { posts: [], total: 0 };

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const conditions = input?.status ? [eq(blogPosts.status, input.status)] : [];
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [posts, countResult] = await Promise.all([
        db.select().from(blogPosts)
          .where(whereClause)
          .orderBy(desc(blogPosts.createdAt))
          .limit(limit).offset(offset),
        db.select({ count: sql<number>`COUNT(*)` }).from(blogPosts).where(whereClause),
      ]);

      return { posts, total: Number(countResult[0]?.count ?? 0) };
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(3).max(200),
      slug: z.string().min(3).max(200),
      excerpt: z.string().max(500).optional(),
      content: z.string().min(10),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      coverImage: z.string().url().optional().or(z.literal('')),
      status: z.enum(['draft', 'published']).default('draft'),

    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const now = Date.now();
      const [post] = await db.insert(blogPosts).values({
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt ?? null,
        content: input.content,
        category: input.category ?? null,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        featuredImage: input.coverImage || null,
        author: ctx.user.name ?? 'IMPACT7',
        status: input.status,
        publishedAt: input.status === 'published' ? now : null,
        createdAt: now,
        updatedAt: now,
      }).$returningId();

      blogCache.invalidatePattern('blog:*');

      await auditService.log({
        userId: ctx.user.id,
        userName: ctx.user.name ?? undefined,
        userEmail: ctx.user.email ?? undefined,
        action: 'create',
        resourceType: 'blog_post',
        resourceId: String(post.id),
        resourceName: input.title,
      });

      return { success: true, id: post.id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(3).max(200).optional(),
      slug: z.string().min(3).max(200).optional(),
      excerpt: z.string().max(500).optional(),
      content: z.string().min(10).optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      coverImage: z.string().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),

    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, tags, coverImage, ...rest } = input;
      const updateData: Record<string, unknown> = { ...rest, updatedAt: Date.now() };
      if (tags !== undefined) updateData.tags = JSON.stringify(tags);
      if (coverImage !== undefined) updateData.featuredImage = coverImage;
      if (rest.status === 'published') {
        const [existing] = await db.select({ publishedAt: blogPosts.publishedAt })
          .from(blogPosts).where(eq(blogPosts.id, id));
        if (!existing?.publishedAt) updateData.publishedAt = Date.now();
      }

      await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, id));
      blogCache.invalidatePattern('blog:*');

      await auditService.log({
        userId: ctx.user.id,
        userName: ctx.user.name ?? undefined,
        userEmail: ctx.user.email ?? undefined,
        action: 'update',
        resourceType: 'blog_post',
        resourceId: String(id),
        newValue: updateData,
      });

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [post] = await db.select({ title: blogPosts.title })
        .from(blogPosts).where(eq(blogPosts.id, input.id));
      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      blogCache.invalidatePattern('blog:*');

      await auditService.log({
        userId: ctx.user.id,
        userName: ctx.user.name ?? undefined,
        userEmail: ctx.user.email ?? undefined,
        action: 'delete',
        resourceType: 'blog_post',
        resourceId: String(input.id),
        resourceName: post?.title,
      });

      return { success: true };
    }),
});
