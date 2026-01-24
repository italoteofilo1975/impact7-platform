/**
 * Query Optimization Service
 * Provides optimized database queries with indexing recommendations
 */

import { getDb } from '../db';
import { executeRawQuery } from '../db-raw';
import { sql } from 'drizzle-orm';

interface QueryStats {
  queryTime: number;
  rowsExamined: number;
  rowsReturned: number;
}

interface IndexRecommendation {
  table: string;
  columns: string[];
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Execute query with timing
 */
export async function executeWithTiming<T>(
  queryFn: () => Promise<T>
): Promise<{ result: T; timing: number }> {
  const start = performance.now();
  const result = await queryFn();
  const timing = performance.now() - start;
  return { result, timing };
}

/**
 * Analyze slow queries and provide recommendations
 */
export function getIndexRecommendations(): IndexRecommendation[] {
  // Based on common query patterns in the application
  return [
    {
      table: 'leads',
      columns: ['email'],
      reason: 'Frequent lookups by email for duplicate checking',
      priority: 'high',
    },
    {
      table: 'leads',
      columns: ['createdAt'],
      reason: 'Sorting and filtering by creation date',
      priority: 'medium',
    },
    {
      table: 'calculations',
      columns: ['userId', 'createdAt'],
      reason: 'User-specific calculations with date ordering',
      priority: 'high',
    },
    {
      table: 'jarvisSessions',
      columns: ['sessionId'],
      reason: 'Session lookup for chat continuity',
      priority: 'high',
    },
    {
      table: 'jarvisMessages',
      columns: ['sessionId', 'createdAt'],
      reason: 'Message retrieval by session with ordering',
      priority: 'high',
    },
    {
      table: 'auditLogs',
      columns: ['userId', 'createdAt'],
      reason: 'User activity audit trails',
      priority: 'medium',
    },
    {
      table: 'auditLogs',
      columns: ['resourceType', 'resourceId'],
      reason: 'Resource-specific audit lookups',
      priority: 'medium',
    },
    {
      table: 'newsletterSubscribers',
      columns: ['email'],
      reason: 'Email uniqueness and lookup',
      priority: 'high',
    },
    {
      table: 'contacts',
      columns: ['status', 'createdAt'],
      reason: 'Admin filtering by status with date ordering',
      priority: 'medium',
    },
    {
      table: 'pageViews',
      columns: ['sessionId', 'createdAt'],
      reason: 'Analytics session tracking',
      priority: 'low',
    },
  ];
}

/**
 * Generate SQL for creating recommended indexes
 */
export function generateIndexSQL(): string[] {
  const recommendations = getIndexRecommendations();
  
  return recommendations.map(rec => {
    const indexName = `idx_${rec.table}_${rec.columns.join('_')}`;
    const columns = rec.columns.join(', ');
    return `CREATE INDEX IF NOT EXISTS ${indexName} ON ${rec.table} (${columns});`;
  });
}

/**
 * Query optimization tips for common patterns
 */
export const queryOptimizationTips = {
  pagination: `
    Use cursor-based pagination instead of OFFSET for large datasets:
    - Instead of: SELECT * FROM table LIMIT 10 OFFSET 1000
    - Use: SELECT * FROM table WHERE id > last_seen_id LIMIT 10
  `,
  
  selectFields: `
    Always select only needed fields:
    - Instead of: SELECT * FROM users
    - Use: SELECT id, name, email FROM users
  `,
  
  batchInserts: `
    Use batch inserts for multiple records:
    - Instead of: Multiple INSERT statements
    - Use: INSERT INTO table VALUES (...), (...), (...)
  `,
  
  avoidNPlusOne: `
    Avoid N+1 queries by using JOINs or batch loading:
    - Instead of: Query users, then query each user's posts separately
    - Use: JOIN or batch load all posts for fetched users
  `,
  
  useIndexes: `
    Ensure WHERE clauses use indexed columns:
    - Primary keys and unique constraints are automatically indexed
    - Add indexes for frequently filtered/sorted columns
  `,
};

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  latency: number;
  error?: string;
}> {
  const start = performance.now();
  
  try {
    const db = await getDb();
    if (!db) {
      return {
        connected: false,
        latency: 0,
        error: 'Database not available',
      };
    }
    
    // Simple query to check connection
    await executeRawQuery(sql`SELECT 1`);
    
    const latency = performance.now() - start;
    
    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      latency: performance.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get table statistics (estimated row counts)
 */
export async function getTableStats(): Promise<Record<string, number>> {
  try {
    const db = await getDb();
    if (!db) {
      return {};
    }
    
    // This is MySQL-specific
    const result = await executeRawQuery(sql`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);
    
    const stats: Record<string, number> = {};
    if (Array.isArray(result) && result.length > 0) {
      const rows = result[0] as unknown as Array<{ TABLE_NAME: string; TABLE_ROWS: number }>;
      if (Array.isArray(rows)) {
        for (const row of rows) {
          stats[row.TABLE_NAME] = row.TABLE_ROWS || 0;
        }
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Failed to get table stats:', error);
    return {};
  }
}

export default {
  executeWithTiming,
  getIndexRecommendations,
  generateIndexSQL,
  queryOptimizationTips,
  checkDatabaseHealth,
  getTableStats,
};
