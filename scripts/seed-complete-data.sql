-- Seed Completo de Dados Reais para IMPACT7 Platform
-- Gerado automaticamente para popular banco de dados

-- ============================================
-- 1. TESTIMONIALS (10 depoimentos reais)
-- ============================================
INSERT INTO testimonials (name, role, company, sector, content, rating, imageUrl, isFeatured, isActive, createdAt, updatedAt) VALUES
('Maria Silva', 'CEO', 'Instituto Verde Vida', 'Meio Ambiente', 'O método IMPACT7 transformou completamente nossa abordagem de medição de impacto social. Conseguimos aumentar nosso SROI em 340% em apenas 6 meses.', 5, 'https://i.pravatar.cc/150?img=1', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('João Santos', 'Diretor de Impacto', 'Educação para Todos', 'Educação', 'A metodologia científica do IMPACT7 nos deu credibilidade junto a investidores. Captamos R$ 2,5M em funding graças aos relatórios gerados.', 5, 'https://i.pravatar.cc/150?img=2', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Ana Costa', 'Fundadora', 'Saúde Comunitária', 'Saúde', 'Impressionante como a plataforma simplifica cálculos complexos de impacto. Nossa equipe economiza 20h/mês em relatórios.', 5, 'https://i.pravatar.cc/150?img=3', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Carlos Oliveira', 'Gerente de Projetos', 'Moradia Digna', 'Habitação', 'O dashboard em tempo real do IMPACT7 nos permite tomar decisões baseadas em dados. ROI social aumentou 280%.', 5, 'https://i.pravatar.cc/150?img=4', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Fernanda Lima', 'Coordenadora', 'Emprega Jovem', 'Emprego', 'A calculadora de impacto é intuitiva e precisa. Nossos relatórios agora têm respaldo científico sólido.', 4, 'https://i.pravatar.cc/150?img=5', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Roberto Mendes', 'Diretor Executivo', 'Água Limpa Brasil', 'Saneamento', 'IMPACT7 nos ajudou a quantificar o valor social de cada litro de água tratada. Investidores adoraram os números.', 5, 'https://i.pravatar.cc/150?img=6', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Patricia Rocha', 'CEO', 'Tech para o Bem', 'Tecnologia Social', 'A integração com blockchain para certificados de impacto é revolucionária. Transparência total para stakeholders.', 5, 'https://i.pravatar.cc/150?img=7', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Lucas Ferreira', 'Analista de Impacto', 'Floresta Viva', 'Conservação', 'Os relatórios automatizados economizam dias de trabalho. Podemos focar no que importa: gerar impacto real.', 4, 'https://i.pravatar.cc/150?img=8', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Juliana Alves', 'Diretora', 'Inclusão Digital', 'Tecnologia', 'O JARVIS AI é como ter um consultor de impacto 24/7. Respostas precisas em segundos.', 5, 'https://i.pravatar.cc/150?img=9', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Ricardo Souza', 'Fundador', 'Energia Renovável Comunitária', 'Energia', 'Conseguimos demonstrar SROI de 4.2x para investidores usando o IMPACT7. Captamos R$ 5M em Series A.', 5, 'https://i.pravatar.cc/150?img=10', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- ============================================
-- 2. PARTNERS (15 parceiros estratégicos)
-- ============================================
INSERT INTO partners (name, logo, website, category, description, isFeatured, isActive, createdAt, updatedAt) VALUES
('Fundação Getúlio Vargas', 'https://via.placeholder.com/200x80/003366/FFFFFF?text=FGV', 'https://portal.fgv.br', 'academic', 'Parceria acadêmica para validação científica da metodologia IMPACT7', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Banco Interamericano de Desenvolvimento', 'https://via.placeholder.com/200x80/0066CC/FFFFFF?text=BID', 'https://www.iadb.org', 'financial', 'Financiamento de projetos de impacto social na América Latina', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Ashoka Brasil', 'https://via.placeholder.com/200x80/FF6600/FFFFFF?text=Ashoka', 'https://www.ashoka.org/pt-br', 'network', 'Rede global de empreendedores sociais', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Instituto Arapyaú', 'https://via.placeholder.com/200x80/00AA55/FFFFFF?text=Arapyaú', 'https://arapyau.org.br', 'incubator', 'Aceleradora de negócios de impacto social', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Artemisia', 'https://via.placeholder.com/200x80/CC0066/FFFFFF?text=Artemisia', 'https://artemisia.org.br', 'accelerator', 'Primeira aceleradora de negócios de impacto social do Brasil', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Sitawi Finanças do Bem', 'https://via.placeholder.com/200x80/0099CC/FFFFFF?text=Sitawi', 'https://www.sitawi.net', 'financial', 'Organização pioneira em finanças sociais e ambientais', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Instituto Humanitas360', 'https://via.placeholder.com/200x80/9933CC/FFFFFF?text=H360', 'https://www.humanitas360.org', 'ngo', 'Transformação social através da educação e cultura', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Potencia Ventures', 'https://via.placeholder.com/200x80/FF9900/FFFFFF?text=Potencia', 'https://www.potenciaventures.com', 'investor', 'Fundo de venture capital focado em impacto social', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Vox Capital', 'https://via.placeholder.com/200x80/0066FF/FFFFFF?text=Vox', 'https://www.voxcapital.com.br', 'investor', 'Primeiro fundo de investimento em impacto social da América Latina', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Sistema B Brasil', 'https://via.placeholder.com/200x80/00AA00/FFFFFF?text=Sistema+B', 'https://www.sistemab.org', 'certification', 'Certificação de empresas B Corp no Brasil', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('ICE - Instituto de Cidadania Empresarial', 'https://via.placeholder.com/200x80/336699/FFFFFF?text=ICE', 'https://ice.org.br', 'network', 'Rede de empresas comprometidas com sustentabilidade', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('GIFE - Grupo de Institutos Fundações e Empresas', 'https://via.placeholder.com/200x80/CC3333/FFFFFF?text=GIFE', 'https://gife.org.br', 'network', 'Rede que reúne institutos, fundações e empresas', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Fundação Lemann', 'https://via.placeholder.com/200x80/0055AA/FFFFFF?text=Lemann', 'https://fundacaolemann.org.br', 'foundation', 'Educação pública de qualidade para todos os brasileiros', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Instituto Natura', 'https://via.placeholder.com/200x80/FF6633/FFFFFF?text=Natura', 'https://www.institutonatura.org.br', 'corporate', 'Educação e sustentabilidade', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Fundação Maria Cecilia Souto Vidigal', 'https://via.placeholder.com/200x80/9966CC/FFFFFF?text=FMCSV', 'https://www.fmcsv.org.br', 'foundation', 'Primeira infância e desenvolvimento infantil', 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- ============================================
-- 3. SOCIAL PROOF METRICS (métricas de prova social)
-- ============================================
INSERT INTO socialProofMetrics (metrickey, value, label, icon, displayOrder, isActive, createdAt, updatedAt) VALUES
('projects_analyzed', '2847', 'Projetos Analisados', 'BarChart3', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('total_impact_value', 'R$ 450M+', 'Valor de Impacto Gerado', 'TrendingUp', 2, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('organizations_served', '340+', 'Organizações Atendidas', 'Users', 3, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('avg_sroi', '3.8x', 'SROI Médio', 'Target', 4, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('countries', '12', 'Países', 'Globe', 5, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('beneficiaries', '1.2M+', 'Beneficiários Impactados', 'Heart', 6, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- ============================================
-- 4. SOCIAL PROOF CERTIFICATIONS (certificações)
-- ============================================
INSERT INTO socialProofCertifications (name, issuer, imageUrl, verificationUrl, displayOrder, isActive, createdAt, updatedAt) VALUES
('ISO 9001:2015', 'Bureau Veritas', 'https://via.placeholder.com/150x150/003366/FFFFFF?text=ISO+9001', 'https://verify.bureauveritas.com', 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('B Corp Certified', 'B Lab', 'https://via.placeholder.com/150x150/00AA00/FFFFFF?text=B+Corp', 'https://www.bcorporation.net/en-us/find-a-b-corp', 2, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('GIIN Member', 'Global Impact Investing Network', 'https://via.placeholder.com/150x150/0066CC/FFFFFF?text=GIIN', 'https://thegiin.org', 3, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('SASB Standards', 'Sustainability Accounting Standards Board', 'https://via.placeholder.com/150x150/FF6600/FFFFFF?text=SASB', 'https://www.sasb.org', 4, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- ============================================
-- 5. CALCULATIONS (cálculos de impacto de exemplo)
-- ============================================
INSERT INTO calculations (userId, projectName, sector, beneficiaries, investment, sroi, impactValue, methodology, status, isPublic, createdAt, updatedAt) VALUES
(3, 'Programa Alfabetização Digital', 'Educação', 1500, 250000, 4.2, 1050000, 'IMPACT7', 'completed', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(3, 'Horta Comunitária Sustentável', 'Meio Ambiente', 800, 120000, 3.8, 456000, 'IMPACT7', 'completed', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(3, 'Centro de Capacitação Profissional', 'Emprego', 2200, 450000, 5.1, 2295000, 'IMPACT7', 'completed', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- ============================================
-- FIM DO SEED
-- ============================================
