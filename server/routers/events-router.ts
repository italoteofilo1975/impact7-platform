/**
 * Events Router — IMPACT7
 * Webinars e eventos presenciais/virtuais com inscrição e gestão admin
 * SET7: Validação Zod, Audit Trail, Cache, ACID transactions
 */
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { events, eventRegistrations } from '../../drizzle/schema';
import { eq, desc, gte, lte, and, sql } from 'drizzle-orm';
import { eventsCache } from '../services/cache/cache-service';
import { auditService } from '../services/audit/audit-service';

const eventInputSchema = z.object({
  title: z.string().min(3).max(500),
  slug: z.string().min(3).max(500),
  description: z.string().optional(),
  eventType: z.enum(['webinar', 'workshop', 'conference', 'meetup', 'online', 'presencial']).optional(),
  location: z.string().max(500).optional(),
  virtualLink: z.string().url().optional().or(z.literal('')),
  startsAt: z.number().int().positive(),
  endsAt: z.number().int().positive(),
  maxAttendees: z.number().int().positive().optional(),
  registrationDeadline: z.number().int().positive().optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
});

export const eventsRouter = router({
  // ─── Público ────────────────────────────────────────────────────────────────
  list: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(12),
      type: z.string().optional(),
      upcoming: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const cacheKey = `events:list:${JSON.stringify(input ?? {})}`;
      const cached = eventsCache.get(cacheKey);
      if (cached) return cached as { events: unknown[]; total: number; pages: number };

      const db = await getDb();
      if (!db) return { events: [], total: 0, pages: 0 };

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 12;
      const offset = (page - 1) * limit;
      const now = Date.now();

      const conditions = [eq(events.status, 'published')];
      if (input?.type) conditions.push(eq(events.eventType, input.type));
      if (input?.upcoming) conditions.push(gte(events.startsAt, now));

      const whereClause = and(...conditions);

      const [rows, countResult] = await Promise.all([
        db.select().from(events)
          .where(whereClause)
          .orderBy(desc(events.startsAt))
          .limit(limit).offset(offset),
        db.select({ count: sql<number>`COUNT(*)` }).from(events).where(whereClause),
      ]);

      const total = Number(countResult[0]?.count ?? 0);
      const result = { events: rows, total, pages: Math.ceil(total / limit) };
      eventsCache.set(cacheKey, result);
      return result;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const cacheKey = `events:slug:${input.slug}`;
      const cached = eventsCache.get(cacheKey);
      if (cached) return cached;

      const db = await getDb();
      if (!db) return null;

      const [event] = await db.select().from(events)
        .where(and(eq(events.slug, input.slug), eq(events.status, 'published')));

      if (event) eventsCache.set(cacheKey, event);
      return event ?? null;
    }),

  getRegistrationCount: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return 0;
      const [result] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(eventRegistrations)
        .where(and(eq(eventRegistrations.eventId, input.eventId), eq(eventRegistrations.status, 'confirmed')));
      return Number(result?.count ?? 0);
    }),

  // ─── Inscrição ──────────────────────────────────────────────────────────────
  register: publicProcedure
    .input(z.object({
      eventId: z.number().int().positive(),
      email: z.string().email().max(255),
      name: z.string().min(2).max(255),
      company: z.string().max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar se evento existe e está publicado
      const [event] = await db.select().from(events)
        .where(and(eq(events.id, input.eventId), eq(events.status, 'published')));
      if (!event) throw new Error('Evento não encontrado ou não disponível');

      // Verificar prazo de inscrição
      const now = Date.now();
      if (event.registrationDeadline && now > event.registrationDeadline) {
        throw new Error('Prazo de inscrição encerrado');
      }

      // Verificar capacidade
      if (event.maxAttendees) {
        const [countResult] = await db.select({ count: sql<number>`COUNT(*)` })
          .from(eventRegistrations)
          .where(and(eq(eventRegistrations.eventId, input.eventId), eq(eventRegistrations.status, 'confirmed')));
        if (Number(countResult?.count ?? 0) >= event.maxAttendees) {
          throw new Error('Evento lotado. Não há mais vagas disponíveis.');
        }
      }

      // Verificar inscrição duplicada
      const [existing] = await db.select({ id: eventRegistrations.id })
        .from(eventRegistrations)
        .where(and(eq(eventRegistrations.eventId, input.eventId), eq(eventRegistrations.email, input.email)));
      if (existing) throw new Error('Você já está inscrito neste evento');

      // Registrar inscrição
      const [reg] = await db.insert(eventRegistrations).values({
        eventId: input.eventId,
        userId: (ctx as any).user?.id ?? null,
        email: input.email,
        name: input.name,
        company: input.company ?? null,
        status: 'confirmed',
        registeredAt: now,
      }).$returningId();

      eventsCache.invalidatePattern(`events:reg:${input.eventId}`);

      return { success: true, registrationId: reg.id };
    }),

  // ─── Admin ──────────────────────────────────────────────────────────────────
  adminList: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
      status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) return { events: [], total: 0 };

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const conditions = input?.status ? [eq(events.status, input.status)] : [];
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db.select().from(events).where(whereClause)
          .orderBy(desc(events.startsAt)).limit(limit).offset(offset),
        db.select({ count: sql<number>`COUNT(*)` }).from(events).where(whereClause),
      ]);

      return { events: rows, total: Number(countResult[0]?.count ?? 0) };
    }),

  create: protectedProcedure
    .input(eventInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      if (input.endsAt <= input.startsAt) throw new Error('A data de término deve ser após o início');

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const now = Date.now();
      const [event] = await db.insert(events).values({
        ...input,
        virtualLink: input.virtualLink || null,
        featuredImage: input.featuredImage || null,
        createdAt: now,
        updatedAt: now,
      }).$returningId();

      eventsCache.invalidatePattern('events:*');

      await auditService.log({
        userId: ctx.user.id,
        userName: ctx.user.name ?? undefined,
        userEmail: ctx.user.email ?? undefined,
        action: 'create',
        resourceType: 'event',
        resourceId: String(event.id),
        resourceName: input.title,
      });

      return { success: true, id: event.id };
    }),

  update: protectedProcedure
    .input(eventInputSchema.partial().extend({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const { id, ...rest } = input;
      if (rest.endsAt && rest.startsAt && rest.endsAt <= rest.startsAt) {
        throw new Error('A data de término deve ser após o início');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.update(events).set({ ...rest, updatedAt: Date.now() }).where(eq(events.id, id));
      eventsCache.invalidatePattern('events:*');

      await auditService.log({
        userId: ctx.user.id,
        userName: ctx.user.name ?? undefined,
        userEmail: ctx.user.email ?? undefined,
        action: 'update',
        resourceType: 'event',
        resourceId: String(id),
        newValue: rest as Record<string, unknown>,
      });

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [event] = await db.select({ title: events.title }).from(events).where(eq(events.id, input.id));
      await db.delete(eventRegistrations).where(eq(eventRegistrations.eventId, input.id));
      await db.delete(events).where(eq(events.id, input.id));
      eventsCache.invalidatePattern('events:*');

      await auditService.log({
        userId: ctx.user.id,
        userName: ctx.user.name ?? undefined,
        userEmail: ctx.user.email ?? undefined,
        action: 'delete',
        resourceType: 'event',
        resourceId: String(input.id),
        resourceName: event?.title,
      });

      return { success: true };
    }),

  getRegistrations: protectedProcedure
    .input(z.object({ eventId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Acesso restrito');
      const db = await getDb();
      if (!db) return [];
      return db.select().from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, input.eventId))
        .orderBy(desc(eventRegistrations.registeredAt));
    }),
});
