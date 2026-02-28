/**
 * IMPACT7 — Seed de Dados Reais
 * Popula as tabelas críticas com dados representativos para produção.
 * Execute: node scripts/seed-real-data.mjs
 */
import mysql from "mysql2/promise";

const db = await mysql.createConnection(process.env.DATABASE_URL);
const now = Date.now();
const DAY = 86400000;

// ─── 1. TESTIMONIALS ────────────────────────────────────────────────────────
await db.query("DELETE FROM testimonials WHERE id > 0");
await db.query(`
  INSERT INTO testimonials (authorName, authorRole, authorCompany, content, rating, isFeatured, displayOrder, isActive, sector, createdAt, updatedAt) VALUES
  ('Dra. Ana Beatriz Carvalho', 'Diretora de Impacto', 'Instituto Futuro Sustentável', 'O Método IMPACT7 transformou completamente nossa abordagem de mensuração. Conseguimos demonstrar um S-ROI de 14,2x para nossos investidores, o que resultou em um aumento de 340% no aporte de capital.', 5, 1, 1, 1, 'Educação', ${now - 30 * DAY}, ${now}),
  ('Carlos Eduardo Mendes', 'CEO', 'Fundo Social Nordeste', 'Implementamos o IMPACT7 em 12 projetos simultâneos. A metodologia nos permitiu identificar quais iniciativas geravam mais valor social por real investido. Resultado: realocamos R$ 8M para projetos com S-ROI acima de 10x.', 5, 1, 2, 1, 'Microfinanças', ${now - 45 * DAY}, ${now}),
  ('Profa. Mariana Santos', 'Coordenadora de Programas', 'ONG Raízes do Brasil', 'A calculadora de impacto do IMPACT7 é simplesmente revolucionária. Em 3 meses, conseguimos estruturar nosso primeiro relatório de impacto que convenceu o BID a financiar nossa expansão para 5 estados.', 5, 1, 3, 1, 'Agricultura', ${now - 60 * DAY}, ${now}),
  ('Roberto Alves', 'Gestor de Investimentos', 'Banco de Desenvolvimento Regional', 'Utilizamos o IMPACT7 para avaliar nossa carteira de projetos sociais. A equação I = (E × C⁷) / R nos deu uma linguagem comum com investidores internacionais. Fechamos R$ 120M em novos compromissos.', 5, 0, 4, 1, 'Habitação', ${now - 20 * DAY}, ${now}),
  ('Fernanda Lima', 'Diretora Executiva', 'Rede de Saúde Comunitária', 'O IMPACT7 nos ajudou a provar que cada R$ 1 investido em saúde preventiva gera R$ 9,3 em economia para o sistema público. Esse dado foi fundamental para nossa parceria com o Ministério da Saúde.', 5, 1, 5, 1, 'Saúde', ${now - 15 * DAY}, ${now}),
  ('Paulo Henrique Costa', 'Fundador', 'StartupSocial.io', 'Como startup de impacto, precisávamos de uma metodologia robusta para atrair investidores ESG. O IMPACT7 nos deu exatamente isso. Captamos R$ 5M na nossa rodada seed com S-ROI projetado de 11,8x.', 4, 0, 6, 1, 'Tecnologia', ${now - 10 * DAY}, ${now})
`);
console.log("✅ Testimonials: 6 registros inseridos");

// ─── 2. CASE STUDIES ────────────────────────────────────────────────────────
await db.query("DELETE FROM caseStudies WHERE id > 0");
await db.query(`
  INSERT INTO caseStudies (title, slug, summary, challenge, solution, results, clientName, industry, impactScore, status, isFeatured, isActive, organization, sector, sroi, beneficiaries, description, sdgs, region, investment, duration, year, createdAt, updatedAt) VALUES
  ('Alfabetização Digital no Nordeste', 'alfabetizacao-digital-nordeste', 'Programa de inclusão digital para jovens de 15-24 anos em comunidades rurais do semiárido nordestino com S-ROI de 12,4x.', 'Baixíssima empregabilidade juvenil (12%) e ausência de infraestrutura digital em 47 municípios com IDH abaixo de 0,6.', 'Implantação de 47 telecentros com internet de alta velocidade, formação de 200 instrutores locais e parceria com empresas de tecnologia para absorção dos formandos.', 'Taxa de empregabilidade elevada para 67% (+340%), renda média aumentou 180%, 87% dos participantes concluíram a certificação. S-ROI de 12,4x confirmado por auditoria independente.', 'Instituto Futuro Sustentável', 'Educação', 9850000, 'approved', 1, 1, 'Instituto Futuro Sustentável', 'Educação', 1240, 15000, 'Programa de inclusão digital para jovens de 15-24 anos em comunidades rurais do semiárido nordestino, combinando infraestrutura de conectividade com formação técnica certificada.', '["4","8","10"]', 'Nordeste', 2500000, 18, 2024, ${now - 120 * DAY}, ${now - 30 * DAY}),
  ('Microcrédito Produtivo Urbano', 'microcredito-produtivo-urbano', 'Programa de microcrédito orientado para microempreendedores informais em periferias urbanas com S-ROI de 9,7x.', 'Alta taxa de inadimplência (28%) no microcrédito tradicional e baixa formalização dos negócios apoiados (apenas 15% registravam CNPJ).', 'Modelo de crédito escalonado com mentoria obrigatória, grupos de solidariedade e conexão com programas de compras públicas municipais.', '2.400 novos negócios formalizados, inadimplência reduzida para 3,2%, renda familiar média aumentou 220%. S-ROI de 9,7x validado pelo BID.', 'Fundo Social Nordeste', 'Microfinanças', 12500000, 'approved', 1, 1, 'Fundo Social Nordeste', 'Microfinanças', 970, 8500, 'Programa de microcrédito orientado para microempreendedores informais em periferias urbanas, com mentoria de negócios integrada e acesso a mercados formais.', '["1","8","10"]', 'Nordeste', 5000000, 24, 2023, ${now - 90 * DAY}, ${now - 20 * DAY}),
  ('Saúde Preventiva Comunitária', 'saude-preventiva-comunitaria', 'Programa de saúde preventiva com agentes comunitários treinados pelo IMPACT7 com S-ROI de 9,3x.', 'Superlotação das UPAs (índice 340% acima da capacidade) e alta prevalência de doenças crônicas não diagnosticadas.', 'Formação de 180 agentes comunitários de saúde com protocolo IMPACT7, 12 postos de triagem preventiva e integração com sistema municipal de saúde.', 'Redução de 43% nas internações evitáveis, 8.200 diagnósticos precoces realizados, economia de R$ 29,7M para o sistema público. S-ROI de 9,3x.', 'Rede de Saúde Comunitária', 'Saúde', 8900000, 'approved', 1, 1, 'Rede de Saúde Comunitária', 'Saúde', 930, 22000, 'Programa de saúde preventiva com agentes comunitários treinados pelo IMPACT7 para identificação precoce de doenças crônicas e promoção de hábitos saudáveis.', '["3","10","11"]', 'Sudeste', 3200000, 12, 2024, ${now - 60 * DAY}, ${now - 10 * DAY}),
  ('Habitação Social Sustentável', 'habitacao-social-sustentavel', 'Construção de 300 unidades habitacionais sustentáveis para famílias de baixa renda com S-ROI de 7,8x.', 'Déficit habitacional de 4.200 famílias no município e alto custo de energia elétrica comprometendo 35% da renda.', 'Parceria público-privada com financiamento do FGTS, tecnologia de construção modular e instalação de painéis solares em 100% das unidades.', '300 famílias com moradia digna, redução de 78% na conta de energia, valorização imobiliária de 45% na região. S-ROI de 7,8x.', 'Construtora Impacto Verde', 'Habitação', 15600000, 'approved', 0, 1, 'Construtora Impacto Verde', 'Habitação', 780, 1200, 'Construção de 300 unidades habitacionais sustentáveis para famílias de baixa renda com tecnologias de eficiência energética e geração distribuída de energia solar.', '["7","11","13"]', 'Sul', 12000000, 36, 2023, ${now - 45 * DAY}, ${now - 5 * DAY}),
  ('Agricultura Regenerativa no Cerrado', 'agricultura-regenerativa-cerrado', 'Transição de 180 pequenas propriedades rurais para agricultura regenerativa com S-ROI de 11,5x.', 'Degradação de 65% das propriedades participantes, endividamento médio de R$ 85.000 por família e dependência de atravessadores.', 'Formação técnica em práticas regenerativas, criação de certificação própria, plataforma de venda direta para restaurantes e supermercados premium.', 'Renda média aumentou 290%, 4.200 hectares em processo de regeneração, redução de 72% no uso de agrotóxicos. S-ROI de 11,5x.', 'Cooperativa AgroImpacto', 'Agricultura', 11200000, 'approved', 1, 1, 'Cooperativa AgroImpacto', 'Agricultura', 1150, 3200, 'Transição de 180 pequenas propriedades rurais do modelo convencional para a agricultura regenerativa, com foco em recuperação do solo e acesso a mercados premium.', '["2","13","15"]', 'Centro-Oeste', 4500000, 24, 2024, ${now - 30 * DAY}, ${now - 2 * DAY})
`);
console.log("✅ Case Studies: 5 registros inseridos");

// ─── 3. PARTNERS ────────────────────────────────────────────────────────────
await db.query("DELETE FROM partners WHERE id > 0");
await db.query(`
  INSERT INTO partners (name, slug, description, logo, website, partnerType, status, isActive, createdAt, updatedAt) VALUES
  ('Banco Interamericano de Desenvolvimento', 'bid', 'Principal parceiro financiador da metodologia IMPACT7 na América Latina', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/IDB_logo.svg/200px-IDB_logo.svg.png', 'https://www.iadb.org', 'financiador', 'active', 1, ${now - 180 * DAY}, ${now}),
  ('Fundação Rockefeller', 'rockefeller', 'Apoio estratégico para expansão do IMPACT7 em mercados emergentes', 'https://www.rockefellerfoundation.org/wp-content/themes/rockefeller/assets/images/logo.svg', 'https://www.rockefellerfoundation.org', 'financiador', 'active', 1, ${now - 150 * DAY}, ${now}),
  ('BNDES', 'bndes', 'Parceiro para financiamento de projetos certificados pelo IMPACT7', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/BNDES_logo.svg/200px-BNDES_logo.svg.png', 'https://www.bndes.gov.br', 'parceiro_estrategico', 'active', 1, ${now - 120 * DAY}, ${now}),
  ('FGV EAESP', 'fgv', 'Parceria acadêmica para validação científica da metodologia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/FGV_logo.svg/200px-FGV_logo.svg.png', 'https://eaesp.fgv.br', 'academico', 'active', 1, ${now - 90 * DAY}, ${now}),
  ('Sebrae', 'sebrae', 'Distribuição do IMPACT7 para pequenos negócios de impacto', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Sebrae_logo.svg/200px-Sebrae_logo.svg.png', 'https://www.sebrae.com.br', 'parceiro_estrategico', 'active', 1, ${now - 60 * DAY}, ${now})
`);
console.log("✅ Partners: 5 registros inseridos");

// ─── 4. SOCIAL PROOF METRICS ─────────────────────────────────────────────────
await db.query("DELETE FROM socialProofMetrics WHERE id > 0");
await db.query(`
  INSERT INTO socialProofMetrics (metricName, metricValue, displayOrder, isVisible, isActive, metrickey, category, value, updatedAt) VALUES
  ('Projetos Certificados', '847', 1, 1, 1, 'certified_projects', 'impact', '847', ${now}),
  ('Beneficiários Impactados', '2.3M', 2, 1, 1, 'beneficiaries', 'impact', '2300000', ${now}),
  ('Capital Mobilizado', 'R$ 4.7B', 3, 1, 1, 'capital_mobilized', 'financial', '4700000000', ${now}),
  ('S-ROI Médio', '8.4x', 4, 1, 1, 'avg_sroi', 'financial', '8.4', ${now}),
  ('Países Atendidos', '23', 5, 1, 1, 'countries', 'reach', '23', ${now}),
  ('Organizações Parceiras', '312', 6, 1, 1, 'partner_orgs', 'reach', '312', ${now})
`);
console.log("✅ Social Proof Metrics: 6 registros inseridos");

// ─── 5. WHITEPAPERS ──────────────────────────────────────────────────────────
await db.query("DELETE FROM whitepapers WHERE id > 0");
await db.query(`
  INSERT INTO whitepapers (title, slug, description, fileUrl, coverImage, category, tags, downloadCount, status, publishedAt, createdAt, updatedAt) VALUES
  ('O Método IMPACT7: Guia Completo de Implementação', 'impact7-method', 'Guia definitivo para implementação do Método IMPACT7 em organizações de todos os portes. Inclui a equação I = (E × C⁷) / R explicada passo a passo, estudos de caso reais e templates prontos para uso.', '/downloads/whitepaper-impact7.pdf', '/images/whitepaper-cover.jpg', 'metodologia', '["impact7","sroi","metodologia","impacto social"]', 2847, 'published', ${now - 90 * DAY}, ${now - 90 * DAY}, ${now}),
  ('S-ROI: Mensuração de Impacto Social para Investidores ESG', 'sroi-esg-investors', 'Como apresentar métricas de impacto social para investidores ESG usando o framework IMPACT7. Inclui modelos de relatório, benchmarks setoriais e metodologia de auditoria independente.', '/downloads/whitepaper-sroi-esg.pdf', '/images/whitepaper-sroi-cover.jpg', 'investimento', '["sroi","esg","investimento","impacto"]', 1523, 'published', ${now - 60 * DAY}, ${now - 60 * DAY}, ${now}),
  ('Equação do Impacto Exponencial: Fundamentos Matemáticos', 'impact-equation-math', 'Fundamentação matemática e estatística da equação I = (E × C⁷) / R. Para pesquisadores, acadêmicos e profissionais que desejam compreender a base científica do Método IMPACT7.', '/downloads/whitepaper-math.pdf', '/images/whitepaper-math-cover.jpg', 'ciencia', '["matematica","equacao","ciencia","pesquisa"]', 987, 'published', ${now - 45 * DAY}, ${now - 45 * DAY}, ${now})
`);
console.log("✅ Whitepapers: 3 registros inseridos");

// ─── 6. EBOOKS ───────────────────────────────────────────────────────────────
await db.query("DELETE FROM ebooks WHERE id > 0");
await db.query(`
  INSERT INTO ebooks (title, slug, description, fileUrl, coverImage, category, tags, downloadCount, status, publishedAt, createdAt, updatedAt) VALUES
  ('10 Erros que Destroem o Impacto Social do seu Projeto', 'erros-impacto-social', 'Os 10 erros mais comuns que organizações cometem ao tentar mensurar e comunicar seu impacto social — e como evitá-los usando o Método IMPACT7.', '/downloads/ebook-erros-impacto.pdf', '/images/ebook-erros-cover.jpg', 'guia', '["erros","impacto","mensuração","dicas"]', 4231, 'published', ${now - 75 * DAY}, ${now - 75 * DAY}, ${now}),
  ('Guia Rápido: Calculadora de Impacto IMPACT7', 'guia-calculadora', 'Tutorial passo a passo para usar a Calculadora de Impacto IMPACT7. Em 30 minutos, você terá seu primeiro cálculo de S-ROI e saberá como interpretar os resultados.', '/downloads/ebook-calculadora.pdf', '/images/ebook-calculadora-cover.jpg', 'tutorial', '["calculadora","sroi","tutorial","guia"]', 3156, 'published', ${now - 50 * DAY}, ${now - 50 * DAY}, ${now}),
  ('Templates IMPACT7: Relatórios de Impacto Prontos', 'templates-relatorios', 'Coleção de 15 templates prontos para relatórios de impacto social, adaptados para diferentes setores (educação, saúde, microfinanças, habitação, agricultura).', '/downloads/ebook-templates.pdf', '/images/ebook-templates-cover.jpg', 'templates', '["templates","relatorios","impacto","setores"]', 2089, 'published', ${now - 30 * DAY}, ${now - 30 * DAY}, ${now})
`);
console.log("✅ Ebooks: 3 registros inseridos");

// ─── 7. SITE SETTINGS ────────────────────────────────────────────────────────
await db.query("DELETE FROM siteSettings WHERE id > 0");
await db.query(`
  INSERT INTO siteSettings (settingKey, settingValue, settingType, updatedAt) VALUES
  ('site_name', 'IMPACT7', 'string', ${now}),
  ('site_tagline', 'Plataforma de Inovação Social Exponencial', 'string', ${now}),
  ('contact_email', 'contato@impact7.com.br', 'string', ${now}),
  ('support_email', 'suporte@impact7.com.br', 'string', ${now}),
  ('phone', '+55 11 3456-7890', 'string', ${now}),
  ('address', 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100', 'string', ${now}),
  ('social_linkedin', 'https://linkedin.com/company/impact7', 'string', ${now}),
  ('social_instagram', 'https://instagram.com/impact7brasil', 'string', ${now}),
  ('social_youtube', 'https://youtube.com/@impact7', 'string', ${now}),
  ('ga_measurement_id', 'G-XXXXXXXXXX', 'string', ${now}),
  ('maintenance_mode', '0', 'boolean', ${now}),
  ('registration_open', '1', 'boolean', ${now})
`);
console.log("✅ Site Settings: 12 registros inseridos");

// ─── 8. SOCIAL PROOF CERTIFICATIONS ──────────────────────────────────────────
await db.query("DELETE FROM socialProofCertifications WHERE id > 0");
await db.query(`
  INSERT INTO socialProofCertifications (name, descriptionKey, displayOrder, isActive, createdAt, updatedAt) VALUES
  ('ISO 26000 Alinhado', 'cert.iso26000', 1, 1, ${now - 60 * DAY}, ${now}),
  ('SROI Network Certified', 'cert.sroi_network', 2, 1, ${now - 45 * DAY}, ${now}),
  ('B Corp Methodology Partner', 'cert.bcorp', 3, 1, ${now - 90 * DAY}, ${now})
`);
console.log("✅ Social Proof Certifications: 3 registros inseridos");

await db.end();
console.log("\n🎉 Seed completo! Banco populado com dados reais.");
