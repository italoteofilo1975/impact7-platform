/**
 * Search Router — IMPACT7
 * Busca global em cases, blog, cursos e fórum
 */
import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { caseStudies, blogPosts, courses, forumTopics } from "../../drizzle/schema";
import { eq, like, or, and, desc } from "drizzle-orm";

export const searchRouter = router({
  global: publicProcedure
    .input(
      z.object({
        query: z.string().min(2).max(200),
        types: z.array(z.enum(["cases", "blog", "courses", "forum"])).optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { results: [], total: 0 };

      const { query, limit } = input;
      const types = input.types ?? ["cases", "blog", "courses", "forum"];
      const q = `%${query}%`;

      const results: Array<{
        id: number;
        type: "case" | "blog" | "course" | "forum";
        title: string;
        excerpt: string | null;
        url: string;
        meta?: string | null;
      }> = [];

      // ── Cases ──────────────────────────────────────────────────────────────
      if (types.includes("cases")) {
        const caseRows = await db
          .select({
            id: caseStudies.id,
            title: caseStudies.title,
            description: caseStudies.description,
            organization: caseStudies.organization,
            sector: caseStudies.sector,
          })
          .from(caseStudies)
          .where(
            and(
              eq(caseStudies.isActive, 1),
              or(
                like(caseStudies.title, q),
                like(caseStudies.description, q),
                like(caseStudies.organization, q),
                like(caseStudies.sector, q)
              )
            )
          )
          .limit(Math.ceil(limit / 4));

        for (const row of caseRows) {
          results.push({
            id: row.id,
            type: "case",
            title: row.title,
            excerpt: row.description ? row.description.slice(0, 120) : null,
            url: `/casos/${row.id}`,
            meta: row.organization ?? row.sector,
          });
        }
      }

      // ── Blog ───────────────────────────────────────────────────────────────
      if (types.includes("blog")) {
        const blogRows = await db
          .select({
            id: blogPosts.id,
            title: blogPosts.title,
            excerpt: blogPosts.excerpt,
            slug: blogPosts.slug,
            category: blogPosts.category,
          })
          .from(blogPosts)
          .where(
            and(
              eq(blogPosts.status, "published"),
              or(
                like(blogPosts.title, q),
                like(blogPosts.excerpt, q),
                like(blogPosts.content, q),
                like(blogPosts.category, q)
              )
            )
          )
          .orderBy(desc(blogPosts.publishedAt))
          .limit(Math.ceil(limit / 4));

        for (const row of blogRows) {
          results.push({
            id: row.id,
            type: "blog",
            title: row.title,
            excerpt: row.excerpt ? row.excerpt.slice(0, 120) : null,
            url: `/blog/${row.slug}`,
            meta: row.category,
          });
        }
      }

      // ── Courses ────────────────────────────────────────────────────────────
      if (types.includes("courses")) {
        const courseRows = await db
          .select({
            id: courses.id,
            title: courses.title,
            description: courses.description,
            instructor: courses.instructor,
            level: courses.level,
          })
          .from(courses)
          .where(
            and(
              eq(courses.status, "published"),
              or(
                like(courses.title, q),
                like(courses.description, q),
                like(courses.instructor, q)
              )
            )
          )
          .limit(Math.ceil(limit / 4));

        for (const row of courseRows) {
          results.push({
            id: row.id,
            type: "course",
            title: row.title,
            excerpt: row.description ? row.description.slice(0, 120) : null,
            url: `/cursos`,
            meta: row.level ?? row.instructor,
          });
        }
      }

      // ── Forum ──────────────────────────────────────────────────────────────
      if (types.includes("forum")) {
        const forumRows = await db
          .select({
            id: forumTopics.id,
            title: forumTopics.title,
            content: forumTopics.content,
            categoryId: forumTopics.categoryId,
          })
          .from(forumTopics)
          .where(
            and(
              eq(forumTopics.isPinned, 0),
              or(
                like(forumTopics.title, q),
                like(forumTopics.content, q)
              )
            )
          )
          .orderBy(desc(forumTopics.createdAt))
          .limit(Math.ceil(limit / 4));

        for (const row of forumRows) {
          results.push({
            id: row.id,
            type: "forum",
            title: row.title,
            excerpt: row.content ? row.content.slice(0, 120) : null,
            url: `/comunidade`,
            meta: null,
          });
        }
      }

      return {
        results: results.slice(0, limit),
        total: results.length,
        query,
      };
    }),
});
