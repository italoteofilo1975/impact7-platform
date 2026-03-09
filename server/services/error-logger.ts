import { getDb } from '../db';
import { errorLogs } from '../../drizzle/schema';
import { desc, eq, and, gte } from 'drizzle-orm';

export interface ErrorLogInput {
  level?: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  userId?: number;
  userEmail?: string;
  path?: string;
  method?: string;
  statusCode?: number;
}

export const errorLogger = {
  async log(input: ErrorLogInput): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;
      await db.insert(errorLogs).values({
        level: input.level ?? 'error',
        message: input.message.substring(0, 65535),
        stack: input.stack ? input.stack.substring(0, 65535) : undefined,
        context: input.context,
        userId: input.userId,
        userEmail: input.userEmail,
        path: input.path,
        method: input.method,
        statusCode: input.statusCode,
        resolved: 0,
        createdAt: Date.now(),
      });
    } catch {
      // Silently fail to avoid recursive error loops
    }
  },

  async list(options?: { level?: string; resolved?: boolean; limit?: number; offset?: number; since?: number }) {
    const db = await getDb();
    if (!db) return { logs: [], total: 0 };
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const conditions = [];
    if (options?.level) conditions.push(eq(errorLogs.level, options.level));
    if (options?.resolved !== undefined) conditions.push(eq(errorLogs.resolved, options.resolved ? 1 : 0));
    if (options?.since) conditions.push(gte(errorLogs.createdAt, options.since));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const [logs, countResult] = await Promise.all([
      db.select().from(errorLogs)
        .where(whereClause)
        .orderBy(desc(errorLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: errorLogs.id }).from(errorLogs).where(whereClause),
    ]);
    return { logs, total: countResult.length };
  },

  async resolve(id: number): Promise<void> {
    const db = await getDb();
    if (!db) return;
    await db.update(errorLogs).set({ resolved: 1, resolvedAt: Date.now() }).where(eq(errorLogs.id, id));
  },

  async stats() {
    const db = await getDb();
    if (!db) return { total: 0, errors: 0, warnings: 0, unresolved: 0 };
    const since24h = Date.now() - 24 * 60 * 60 * 1000;
    const all = await db.select({
      level: errorLogs.level,
      resolved: errorLogs.resolved,
      createdAt: errorLogs.createdAt,
    }).from(errorLogs);
    return {
      total: all.length,
      errors: all.filter(l => l.level === 'error').length,
      warnings: all.filter(l => l.level === 'warn').length,
      unresolved: all.filter(l => l.resolved === 0).length,
      last24h: all.filter(l => l.createdAt >= since24h).length,
    };
  },
};
