import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

await conn.execute(`
  CREATE TABLE IF NOT EXISTS errorLogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level VARCHAR(20) NOT NULL DEFAULT 'error',
    message TEXT NOT NULL,
    stack TEXT,
    context JSON,
    userId INT,
    userEmail VARCHAR(255),
    path VARCHAR(500),
    method VARCHAR(10),
    statusCode INT,
    resolved INT DEFAULT 0,
    resolvedAt BIGINT,
    createdAt BIGINT NOT NULL
  )
`);
console.log('✅ Tabela errorLogs criada');

await conn.end();
