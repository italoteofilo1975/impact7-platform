import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Get all tables
const [tables] = await connection.query("SHOW TABLES");
console.log(`Found ${tables.length} tables in database`);

// Get structure of first 5 tables as sample
for (let i = 0; i < Math.min(5, tables.length); i++) {
  const tableName = Object.values(tables[i])[0];
  console.log(`\n=== Table: ${tableName} ===`);
  const [columns] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
  columns.forEach(col => {
    console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key} ${col.Default !== null ? `DEFAULT ${col.Default}` : ''}`);
  });
}

await connection.end();
