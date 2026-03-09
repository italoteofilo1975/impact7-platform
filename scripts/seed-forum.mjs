import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const now = Date.now();

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

const topics = [
  // Categoria 1 — Metodologia IMPACT7
  {
    categoryId: 1, userId: 1, isPinned: 1, isLocked: 0,
    title: 'Bem-vindos ao Fórum IMPACT7 — Leia antes de postar!',
    content: `Bem-vindos à Comunidade IMPACT7!\n\nEste é o espaço para profissionais de impacto social, investidores de impacto, gestores de ONGs e empreendedores sociais trocarem experiências, tirarem dúvidas e colaborarem na construção de um ecossistema de inovação social mais forte.\n\n**Regras da comunidade:**\n- Seja respeitoso e construtivo\n- Compartilhe experiências reais e concretas\n- Cite fontes quando compartilhar dados ou pesquisas\n- Evite autopromoção excessiva\n\nQualquer dúvida, entre em contato com a equipe IMPACT7. Boas discussões!`,
  },
  {
    categoryId: 1, userId: 1, isPinned: 0, isLocked: 0,
    title: 'Como o Método IMPACT7 se diferencia de outras abordagens de gestão de impacto?',
    content: `Tenho estudado diferentes metodologias de gestão de impacto social (SROI, B Impact Assessment, IRIS+) e estou curioso sobre o que torna o Método IMPACT7 único.\n\nAlguém que já implementou o método pode compartilhar:\n- Quais foram os principais diferenciais percebidos na prática?\n- Como a integração dos 7 pilares funciona no dia a dia?\n- Quais desafios encontraram na implementação?`,
  },
  {
    categoryId: 1, userId: 1, isPinned: 0, isLocked: 0,
    title: 'Teoria da Mudança: como vocês constroem a sua?',
    content: `A Teoria da Mudança é um dos elementos mais importantes — e mais desafiadores — de qualquer projeto de impacto social.\n\nGostaria de entender como a comunidade aborda a construção da Teoria da Mudança:\n- Usam alguma ferramenta específica (Miro, planilhas, software dedicado)?\n- Como validam as hipóteses causais?\n- Com que frequência revisam a Teoria da Mudança?\n\nCompartilhem suas experiências!`,
  },
  // Categoria 2 — Calculadora S-ROI
  {
    categoryId: 2, userId: 1, isPinned: 1, isLocked: 0,
    title: 'Guia de uso da Calculadora S-ROI IMPACT7',
    content: `Este tópico serve como guia de referência para o uso da Calculadora S-ROI IMPACT7.\n\n**Como usar:**\n1. Acesse a Calculadora em /calculadora\n2. Preencha os dados do seu projeto (investimento, beneficiários, outcomes)\n3. Defina os proxies financeiros para cada outcome\n4. Aplique os ajustes de Deadweight, Attribution e Drop-off\n5. Gere o relatório com o S-ROI calculado\n\n**Dúvidas frequentes:**\n- O que é Deadweight? É a porção do outcome que teria acontecido mesmo sem a intervenção\n- O que é Attribution? É a fração do outcome atribuível especificamente ao seu projeto\n- O que é Drop-off? É a redução do impacto ao longo do tempo\n\nPoste suas dúvidas neste tópico!`,
  },
  {
    categoryId: 2, userId: 1, isPinned: 0, isLocked: 0,
    title: 'Proxies financeiros: como escolher os valores corretos?',
    content: `Uma das maiores dificuldades no cálculo do S-ROI é a escolha de proxies financeiros adequados para outcomes sociais.\n\nPor exemplo: como valorar financeiramente "1 jovem que não entrou para o tráfico" ou "1 família que saiu da extrema pobreza"?\n\nAlguém tem referências de bancos de dados de proxies financeiros para o contexto brasileiro? Já vi o IRIS+ e o HACT da UNICEF, mas ambos são muito focados no contexto internacional.`,
  },
  // Categoria 3 — Cases de Sucesso
  {
    categoryId: 3, userId: 1, isPinned: 0, isLocked: 0,
    title: 'Compartilhe seu case de impacto social!',
    content: `Este tópico é um convite para a comunidade compartilhar cases reais de impacto social.\n\nNão precisa ser um case perfeito — o importante é a aprendizagem. Compartilhe:\n- O problema social que seu projeto endereça\n- A solução implementada\n- Os resultados alcançados (mesmo que parciais)\n- As lições aprendidas\n\nVamos construir juntos um repositório de referências para o ecossistema de impacto social brasileiro!`,
  },
  // Categoria 4 — Ferramentas e Recursos
  {
    categoryId: 4, userId: 1, isPinned: 0, isLocked: 0,
    title: 'Quais ferramentas vocês usam para gestão de projetos de impacto?',
    content: `Estou montando o stack de ferramentas para gerenciar nossos projetos de impacto social e gostaria de saber o que a comunidade usa.\n\nEspecificamente:\n- Gestão de projetos (Asana, Notion, Monday?)\n- Coleta de dados de campo (KoboToolbox, ODK?)\n- Análise e visualização de dados (Power BI, Tableau, Google Data Studio?)\n- Comunicação com beneficiários\n\nQualquer recomendação é bem-vinda!`,
  },
];

for (const t of topics) {
  const slug = `${slugify(t.title)}-${Date.now()}`;
  await conn.execute(
    'INSERT INTO forumTopics (categoryId, userId, title, slug, content, isPinned, isLocked, viewCount, replyCount, lastActivityAt, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,0,0,?,?,?)',
    [t.categoryId, t.userId, t.title, slug, t.content, t.isPinned, t.isLocked, now, now, now]
  );
}

console.log('✅ ' + topics.length + ' tópicos iniciais inseridos no fórum');
await conn.end();
