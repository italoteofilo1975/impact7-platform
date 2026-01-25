import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

async function generateSchema() {
  console.log('🔧 Connecting to MySQL...');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: 'default' });

  console.log('📝 Generating CREATE TABLE statements...');
  
  // Get all table names from schema
  const tables = Object.keys(schema).filter(key => 
    schema[key] && typeof schema[key] === 'object' && schema[key][Symbol.for('drizzle:Name')]
  );

  console.log(`\n✅ Found ${tables.length} tables in schema:\n`);
  
  for (const tableName of tables) {
    const table = schema[tableName];
    console.log(`  - ${tableName}`);
  }

  console.log('\n🎯 Use drizzle-kit introspect to generate SQL from existing schema');
  console.log('   or manually create tables using webdev_execute_sql tool\n');

  await connection.end();
}

generateSchema().catch(console.error);
