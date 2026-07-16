import { getPool } from "./db";

/**
 * Converte placeholders posicionais do MySQL (?) para o formato do Postgres ($1, $2, ...).
 */
function toPgPlaceholders(query: string): string {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
}

/**
 * Execute raw SQL query and return all results
 * Use this for complex queries that are hard to express with Drizzle ORM
 */
export async function executeRawQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const sql = await getPool();
  if (!sql) {
    throw new Error("Database not available");
  }

  try {
    // postgres-js retorna o array de linhas direto (nao [rows, fields] como mysql2).
    const rows = await sql.unsafe(toPgPlaceholders(query), params);
    return rows as unknown as T[];
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
  const sql = await getPool();
  if (!sql) {
    throw new Error("Database not available");
  }

  try {
    // postgres-js retorna um array com metadados: .count = linhas afetadas.
    const result: any = await sql.unsafe(toPgPlaceholders(query), params);
    return {
      changes: result.count ?? 0,
      // Postgres nao expoe insertId; use o id retornado por um RETURNING, se houver.
      lastInsertRowid: result[0]?.id ?? 0,
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
  const sql = await getPool();
  if (!sql) {
    throw new Error("Database not available");
  }

  try {
    await sql.begin(async (tx) => {
      for (const query of queries) {
        await tx.unsafe(query);
      }
    });
  } catch (error) {
    console.error('[Database] Error executing transaction', error);
    throw error;
  }
}
