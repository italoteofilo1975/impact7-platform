import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const now = Date.now();

await conn.execute(`CREATE TABLE IF NOT EXISTS jobOpenings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  department VARCHAR(255),
  location VARCHAR(255),
  type VARCHAR(100),
  salaryRange VARCHAR(255),
  description TEXT,
  requirements JSON,
  benefits JSON,
  isActive TINYINT(1) DEFAULT 1,
  isNew TINYINT(1) DEFAULT 0,
  applyUrl VARCHAR(1000),
  closingDate BIGINT,
  createdAt BIGINT,
  updatedAt BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

const vagas = [
  {
    title: 'Desenvolvedor(a) Full Stack Sênior',
    department: 'Engenharia',
    location: 'Remoto',
    type: 'Tempo Integral',
    salaryRange: 'R$15.000 – R$22.000',
    description: 'Buscamos um(a) desenvolvedor(a) experiente para liderar projetos de plataforma de impacto social, trabalhando com React, Node.js e TypeScript em um ambiente de alta autonomia e propósito.',
    requirements: JSON.stringify(['5+ anos de experiência com React e Node.js', 'TypeScript avançado', 'Experiência com bancos de dados relacionais', 'Familiaridade com metodologias ágeis']),
    benefits: JSON.stringify(['Trabalho 100% remoto', 'Plano de saúde', 'Stock options', 'Orçamento anual para cursos e conferências']),
    isActive: 1, isNew: 1,
  },
  {
    title: 'Analista de Impacto Social',
    department: 'Impacto & Pesquisa',
    location: 'São Paulo (híbrido)',
    type: 'Tempo Integral',
    salaryRange: 'R$8.000 – R$12.000',
    description: 'Analise e mensure o impacto de projetos sociais usando a metodologia IMPACT7, apoiando clientes na construção de Teorias da Mudança e cálculos de S-ROI.',
    requirements: JSON.stringify(['Formação em Ciências Sociais, Economia ou áreas afins', 'Conhecimento em métricas de impacto (SROI, IRIS+)', 'Excel ou Google Sheets avançado', 'Experiência com ONGs ou setor público é um diferencial']),
    benefits: JSON.stringify(['Trabalho híbrido (3x presencial)', 'Plano de saúde', 'Vale-refeição', 'Participação em eventos do setor']),
    isActive: 1, isNew: 1,
  },
  {
    title: 'Product Designer (UX/UI)',
    department: 'Design',
    location: 'Remoto',
    type: 'Tempo Integral',
    salaryRange: 'R$10.000 – R$15.000',
    description: 'Procuramos um(a) designer apaixonado(a) por criar experiências que transformam vidas, com foco em acessibilidade e impacto social real.',
    requirements: JSON.stringify(['3+ anos de experiência em UX/UI', 'Figma avançado', 'Experiência com Design Systems', 'Portfólio com casos de uso reais']),
    benefits: JSON.stringify(['Trabalho 100% remoto', 'Plano de saúde', 'Orçamento para equipamentos', 'Licença parental estendida']),
    isActive: 1, isNew: 0,
  },
  {
    title: 'Especialista em Customer Success',
    department: 'Customer Success',
    location: 'São Paulo ou Remoto',
    type: 'Tempo Integral',
    salaryRange: 'R$7.000 – R$11.000',
    description: 'Acompanhe clientes na jornada de implementação do Método IMPACT7, garantindo adoção, satisfação e renovação de contratos.',
    requirements: JSON.stringify(['2+ anos em Customer Success ou Consultoria', 'Habilidade de comunicação e apresentação', 'Experiência com CRM (HubSpot, Salesforce)', 'Interesse genuíno em impacto social']),
    benefits: JSON.stringify(['Trabalho híbrido flexível', 'Plano de saúde', 'Comissão por renovação', 'Treinamento no Método IMPACT7']),
    isActive: 1, isNew: 0,
  },
];

for (const v of vagas) {
  await conn.execute(
    'INSERT INTO jobOpenings (title, department, location, type, salaryRange, description, requirements, benefits, isActive, isNew, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
    [v.title, v.department, v.location, v.type, v.salaryRange, v.description, v.requirements, v.benefits, v.isActive, v.isNew, now, now]
  );
}

console.log('✅ Tabela jobOpenings criada e ' + vagas.length + ' vagas inseridas');
await conn.end();
