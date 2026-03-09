import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

await conn.execute(`
  CREATE TABLE IF NOT EXISTS cmsPages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    content LONGTEXT,
    metaDescription VARCHAR(500),
    isPublished INT DEFAULT 1,
    updatedBy INT,
    createdAt BIGINT NOT NULL,
    updatedAt BIGINT NOT NULL
  )
`);
console.log('✅ Tabela cmsPages criada');

// Seed das páginas institucionais padrão
const now = Date.now();
const pages = [
  { slug: 'sobre', title: 'Sobre Nós', content: '# Sobre a IMPACT7\n\nA IMPACT7 é uma plataforma de inovação social exponencial...', metaDescription: 'Conheça a IMPACT7 e nossa missão de transformar o mundo através da inovação social.' },
  { slug: 'missao-visao-valores', title: 'Missão, Visão e Valores', content: '## Missão\n\nAcelerar a inovação social exponencial...\n\n## Visão\n\nSer a principal plataforma...\n\n## Valores\n\n- Impacto real\n- Transparência\n- Colaboração', metaDescription: 'Nossa missão, visão e valores que guiam a IMPACT7.' },
  { slug: 'termos-de-uso', title: 'Termos de Uso', content: '# Termos de Uso\n\nAo utilizar a plataforma IMPACT7, você concorda com os seguintes termos...', metaDescription: 'Termos de uso da plataforma IMPACT7.' },
  { slug: 'politica-de-privacidade', title: 'Política de Privacidade', content: '# Política de Privacidade\n\nA IMPACT7 está comprometida com a proteção dos seus dados pessoais conforme a LGPD...', metaDescription: 'Política de privacidade e proteção de dados da IMPACT7.' },
  { slug: 'cookie-policy', title: 'Política de Cookies', content: '# Política de Cookies\n\nUtilizamos cookies para melhorar sua experiência na plataforma...', metaDescription: 'Como utilizamos cookies na plataforma IMPACT7.' },
];

for (const page of pages) {
  await conn.execute(
    `INSERT IGNORE INTO cmsPages (slug, title, content, metaDescription, isPublished, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, ?, ?)`,
    [page.slug, page.title, page.content, page.metaDescription, now, now]
  );
}
console.log('✅ Páginas institucionais seed inseridas');

await conn.end();
