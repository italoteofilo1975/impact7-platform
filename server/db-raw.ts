import { getSqlite } from "./db";

/**
 * Execute raw SQL query and return all results
 * Use this for complex queries that are hard to express with Drizzle ORM
 */
export async function executeRawQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const sqlite = await getSqlite();
  if (!sqlite) {
    throw new Error("Database not available");
  }
  
  try {
    const stmt = sqlite.prepare(query);
    const result = stmt.all(...params);
    return result as T[];
  } catch (error) {
    console.error(`[Database] Error executing query: ${query}`, error);
    throw error;
  }
}

/**
 * Execute raw SQL statement (INSERT, UPDATE, DELETE)
 * Returns info about the operation (changes, lastInsertRowid)
 */
export async function executeRawStatement(query: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number | bigint }> {
  const sqlite = await getSqlite();
  if (!sqlite) {
    throw new Error("Database not available");
  }
  
  try {
    const stmt = sqlite.prepare(query);
    const result = stmt.run(...params);
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid
    };
  } catch (error) {
    console.error(`[Database] Error executing statement: ${query}`, error);
    throw error;
  }
}

/**
 * Execute multiple raw SQL statements in a transaction
 */
export async function executeRawTransaction(queries: string[]): Promise<void> {
  const sqlite = await getSqlite();
  if (!sqlite) {
    throw new Error("Database not available");
  }
  
  const transaction = sqlite.transaction(() => {
    for (const query of queries) {
      sqlite.exec(query);
    }
  });
  
  try {
    transaction();
  } catch (error) {
    console.error('[Database] Error executing transaction', error);
    throw error;
  }
}
