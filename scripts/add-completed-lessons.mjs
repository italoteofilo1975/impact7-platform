import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('DESCRIBE courseEnrollments');
const fields = rows.map(r => r.Field);
console.log('Fields:', fields.join(', '));

if (!fields.includes('completedLessons')) {
  await conn.execute("ALTER TABLE courseEnrollments ADD COLUMN completedLessons TEXT DEFAULT NULL");
  console.log('✅ Added completedLessons column');
} else {
  console.log('✅ completedLessons already exists');
}

await conn.end();
