import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const testUsers = [
  { name: 'Visitante Teste', email: 'visitante@test.impact7.com', password: 'Test@123456', role: 'user' },
  { name: 'Usuario Comum', email: 'usuario@test.impact7.com', password: 'Test@123456', role: 'user' },
  { name: 'Admin Teste', email: 'admin@test.impact7.com', password: 'Test@123456', role: 'admin' },
];

const now = Date.now();

for (const u of testUsers) {
  const hash = await bcrypt.hash(u.password, 10);
  try {
    await conn.execute(
      `INSERT INTO users (name, email, passwordHash, loginMethod, role, createdAt, updatedAt, lastSignedIn)
       VALUES (?, ?, ?, 'local', ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), passwordHash=VALUES(passwordHash)`,
      [u.name, u.email, hash, u.role, now, now, now]
    );
    console.log(`✅ Created/Updated: ${u.email} | role: ${u.role} | password: ${u.password}`);
  } catch (e) {
    console.log(`⚠️ Error for ${u.email}:`, e.message);
  }
}

const [rows] = await conn.execute(
  'SELECT id, name, email, role, loginMethod FROM users WHERE email LIKE "%test.impact7.com"'
);
console.log('\n📋 Test users in DB:');
rows.forEach(r => console.log(`  [${r.id}] ${r.name} <${r.email}> role=${r.role}`));

await conn.end();
console.log('\n✅ Done! Login at /login with password: Test@123456');
