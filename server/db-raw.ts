import { getPool } from "./db";

/**
 * Execute raw SQL query and return all results
 * Use this for complex queries that are hard to express with Drizzle ORM
 */
export async function executeRawQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const pool = await getPool();
  if (!pool) {
    throw new Error("Database not available");
  }
  
  try {
    const [rows] = await pool.query(query, params);
    return rows as T[];
  } catch (error) {
    console.error(`[Database] Error executing query: ${query}`, error);
    throw error;
  }
}

/**
 * Execute raw SQL statement (INSERT, UPDATE, DELETE)
 * Returns info about the operation (affectedRows, insertId)
 */
export async function executeRawStatement(query: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number | bigint }> {
  const pool = await getPool();
  if (!pool) {
    throw new Error("Database not available");
  }
  
  try {
    const [result]: any = await pool.query(query, params);
    return {
      changes: result.affectedRows || 0,
      lastInsertRowid: result.insertId || 0
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
  const pool = await getPool();
  if (!pool) {
    throw new Error("Database not available");
  }
  
  let connection: Awaited<ReturnType<typeof pool.getConnection>> | null = null;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    for (const query of queries) {
      await connection.query(query);
    }
    
    await connection.commit();
    connection.release();
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('[Database] Error executing transaction', error);
    throw error;
  }
}
