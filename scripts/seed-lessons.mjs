import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const now = Date.now();

const lessons = [
  // Curso 1 — Fundamentos do Método IMPACT7
  { courseId: 1, title: 'O que é Inovação Social?', content: 'Nesta aula introdutória, exploramos o conceito de inovação social, sua diferença em relação à inovação tecnológica convencional, e por que ela é fundamental para resolver os desafios mais complexos da sociedade contemporânea.', videoUrl: null, duration: 15, orderIndex: 1, isFree: 1, createdAt: now, updatedAt: now },
  { courseId: 1, title: 'Apresentando o Método IMPACT7', content: 'Conheça o Método IMPACT7: sua origem, filosofia e os 7 pilares que estruturam uma abordagem sistêmica para gerar impacto social mensurável.', videoUrl: null, duration: 20, orderIndex: 2, isFree: 1, createdAt: now, updatedAt: now },
  { courseId: 1, title: 'Mapeamento de Stakeholders', content: 'Aprenda a identificar e mapear todos os atores envolvidos em um projeto de impacto social: beneficiários diretos e indiretos, financiadores, parceiros e a comunidade.', videoUrl: null, duration: 25, orderIndex: 3, isFree: 0, createdAt: now, updatedAt: now },
  { courseId: 1, title: 'Teoria da Mudança', content: 'A Teoria da Mudança é o coração de qualquer projeto de impacto social. Aprenda a construir uma Teoria da Mudança robusta, conectando atividades, outputs, outcomes e impacto de forma lógica e verificável.', videoUrl: null, duration: 30, orderIndex: 4, isFree: 0, createdAt: now, updatedAt: now },
  { courseId: 1, title: 'Indicadores de Impacto', content: 'Como medir o que realmente importa? Aprenda a selecionar e construir indicadores de impacto alinhados ao IRIS+ e aos ODS da ONU.', videoUrl: null, duration: 35, orderIndex: 5, isFree: 0, createdAt: now, updatedAt: now },
  // Curso 2 — Calculando S-ROI
  { courseId: 2, title: 'Introdução ao S-ROI', content: 'O Social Return on Investment (S-ROI) é a metodologia mais reconhecida internacionalmente para medir o valor social gerado por projetos e organizações.', videoUrl: null, duration: 20, orderIndex: 1, isFree: 1, createdAt: now, updatedAt: now },
  { courseId: 2, title: 'Identificando Outcomes e Valores', content: 'O coração do cálculo S-ROI está na identificação correta dos outcomes e na atribuição de valores financeiros a mudanças sociais. Aprenda técnicas como Willingness to Pay, Cost Savings e Financial Proxies.', videoUrl: null, duration: 40, orderIndex: 2, isFree: 0, createdAt: now, updatedAt: now },
  { courseId: 2, title: 'Deadweight, Attribution e Drop-off', content: 'Três ajustes fundamentais que tornam o S-ROI rigoroso: Deadweight, Attribution e Drop-off. Exemplos práticos com casos reais.', videoUrl: null, duration: 45, orderIndex: 3, isFree: 0, createdAt: now, updatedAt: now },
  { courseId: 2, title: 'Calculando o S-ROI na Prática', content: 'Utilizaremos a Calculadora S-ROI do IMPACT7 para calcular o retorno social de um projeto real. Passo a passo, do levantamento de dados ao relatório final.', videoUrl: null, duration: 60, orderIndex: 4, isFree: 0, createdAt: now, updatedAt: now },
  { courseId: 2, title: 'Comunicando Resultados de Impacto', content: 'Aprenda a comunicar seus resultados de forma eficaz para diferentes audiências: investidores, beneficiários, governo e mídia.', videoUrl: null, duration: 30, orderIndex: 5, isFree: 0, createdAt: now, updatedAt: now },
  // Curso 3 — SET7 Avançado
  { courseId: 3, title: 'Arquitetura do Sistema SET7', content: 'Uma visão aprofundada da arquitetura do Sistema SET7: como os 7 componentes se integram para criar um sistema de gestão de impacto de classe enterprise.', videoUrl: null, duration: 35, orderIndex: 1, isFree: 1, createdAt: now, updatedAt: now },
  { courseId: 3, title: 'Configurando e Gerenciando Gates', content: 'Os Gates são pontos de controle de qualidade do processo de inovação social. Aprenda a configurar Gates personalizados, definir condições de passagem e ações automáticas.', videoUrl: null, duration: 50, orderIndex: 2, isFree: 0, createdAt: now, updatedAt: now },
  { courseId: 3, title: 'Orquestrando Agentes de IA', content: 'O SET7 usa agentes de IA especializados para automatizar análises, cálculos e relatórios. Aprenda a configurar, monitorar e orquestrar agentes.', videoUrl: null, duration: 55, orderIndex: 3, isFree: 0, createdAt: now, updatedAt: now },
  { courseId: 3, title: 'NFRs e Qualidade Sistêmica', content: 'Requisitos Não-Funcionais (NFRs) garantem que o sistema opere com qualidade, segurança e conformidade. Aprenda a definir, monitorar e reportar NFRs críticos.', videoUrl: null, duration: 40, orderIndex: 4, isFree: 0, createdAt: now, updatedAt: now },
  { courseId: 3, title: 'Automação e Escala com SET7', content: 'Como usar o SET7 para escalar projetos de impacto social de forma sustentável. Automação de relatórios, integração com sistemas externos e estratégias de crescimento.', videoUrl: null, duration: 60, orderIndex: 5, isFree: 0, createdAt: now, updatedAt: now },
];

for (const l of lessons) {
  await conn.execute(
    'INSERT INTO courseLessons (courseId, title, content, videoUrl, duration, orderIndex, isFree, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?)',
    [l.courseId, l.title, l.content, l.videoUrl, l.duration, l.orderIndex, l.isFree, l.createdAt, l.updatedAt]
  );
}
console.log('✅ ' + lessons.length + ' aulas inseridas nos 3 cursos');
await conn.end();
