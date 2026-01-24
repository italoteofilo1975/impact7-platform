import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('./data/impact7.db');

// Hash da senha
const passwordHash = bcrypt.hashSync('123456set7', 10);

// Criar ou atualizar usuário admin
const stmt = db.prepare(`
  INSERT INTO users (openId, name, email, passwordHash, loginMethod, role, createdAt, updatedAt, lastSignedIn)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(email) DO UPDATE SET
    passwordHash = excluded.passwordHash,
    role = excluded.role,
    updatedAt = excluded.updatedAt
`);

const now = Math.floor(Date.now() / 1000);

try {
  stmt.run(
    'italo-teofilo-imts', // openId único
    'Italo Teófilo',
    'italo.teofilo@imts.com.br',
    passwordHash,
    'custom',
    'admin',
    now,
    now,
    now
  );
  console.log('✅ Usuário admin criado com sucesso!');
  console.log('Email: italo.teofilo@imts.com.br');
  console.log('Senha: 123456set7');
  console.log('Role: admin');
} catch (error) {
  console.error('❌ Erro ao criar usuário:', error);
}

db.close();
