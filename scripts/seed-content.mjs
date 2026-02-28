/**
 * Seed de conteúdo SET7 - Blog, Eventos, Fórum e Cursos
 * Execute: node scripts/seed-content.mjs
 */
import mysql from 'mysql2/promise';
import { config } from 'dotenv';
config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL não encontrada'); process.exit(1); }

const now = Date.now();

// blogPosts: id, title, slug, excerpt, content, featuredImage, author, category, tags, status, publishedAt, viewCount, createdAt, updatedAt
const blogPosts = [
  {
    title: 'Introdução ao Método IMPACT7: A Matemática do Impacto Social',
    slug: 'introducao-metodo-impact7-matematica-impacto-social',
    excerpt: 'Descubra como o expoente 7 e o modelo C⁷ × S-ROI transformam a mensuração de impacto social em ciência aplicada.',
    content: '# Introdução ao Método IMPACT7\n\nO Método IMPACT7 é uma abordagem científica para mensuração e maximização do impacto social. Baseado na fórmula **Impacto = C⁷ × S-ROI**, onde C representa o Coeficiente Contextual e S-ROI é o Retorno Social sobre Investimento.',
    featuredImage: '',
    author: 'Equipe IMPACT7',
    category: 'Metodologia',
    tags: JSON.stringify(['impact7', 'metodologia', 'sroi']),
    status: 'published',
    publishedAt: now - 7 * 24 * 60 * 60 * 1000,
    viewCount: 0,
    createdAt: now - 7 * 24 * 60 * 60 * 1000,
    updatedAt: now,
  },
  {
    title: 'S-ROI: Como Calcular o Retorno Social sobre Investimento',
    slug: 'sroi-como-calcular-retorno-social-investimento',
    excerpt: 'Guia prático para calcular o S-ROI do seu projeto social usando proxies financeiros validados e a metodologia SROI Network.',
    content: '# S-ROI: Retorno Social sobre Investimento\n\nO S-ROI é a métrica central do Método IMPACT7. Ele traduz o valor social gerado em termos financeiros comparáveis.',
    featuredImage: '',
    author: 'Equipe IMPACT7',
    category: 'Metodologia',
    tags: JSON.stringify(['sroi', 'mensuração', 'impacto']),
    status: 'published',
    publishedAt: now - 14 * 24 * 60 * 60 * 1000,
    viewCount: 0,
    createdAt: now - 14 * 24 * 60 * 60 * 1000,
    updatedAt: now,
  },
  {
    title: 'Gates e Checklists SET7: Garantindo Qualidade em Cada Fase',
    slug: 'gates-checklists-set7-qualidade-cada-fase',
    excerpt: 'Como os 7 Gates de Qualidade do SET7 garantem que projetos de impacto social avancem apenas quando estão prontos.',
    content: '# Gates e Checklists SET7\n\nO SET7 utiliza um sistema de Gates (portões de qualidade) para garantir que projetos avancem apenas quando atendem critérios mínimos de qualidade.',
    featuredImage: '',
    author: 'Equipe IMPACT7',
    category: 'SET7',
    tags: JSON.stringify(['set7', 'gates', 'qualidade']),
    status: 'published',
    publishedAt: now - 3 * 24 * 60 * 60 * 1000,
    viewCount: 0,
    createdAt: now - 3 * 24 * 60 * 60 * 1000,
    updatedAt: now,
  },
];

// events: id, title, slug, description, eventType, location, virtualLink, startsAt, endsAt, maxAttendees, registrationDeadline, featuredImage, status, createdAt, updatedAt
const events = [
  {
    title: 'Workshop: Calculando S-ROI na Prática',
    slug: 'workshop-calculando-sroi-pratica',
    description: 'Aprenda a calcular o Retorno Social sobre Investimento do seu projeto usando a metodologia IMPACT7 e ferramentas práticas.',
    eventType: 'workshop',
    location: 'Online (Zoom)',
    virtualLink: 'https://zoom.us/j/impact7-sroi',
    startsAt: now + 7 * 24 * 60 * 60 * 1000,
    endsAt: now + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
    maxAttendees: 50,
    registrationDeadline: now + 6 * 24 * 60 * 60 * 1000,
    featuredImage: '',
    status: 'published',
    createdAt: now,
    updatedAt: now,
  },
  {
    title: 'Webinar: Tendências em Impacto Social 2025',
    slug: 'webinar-tendencias-impacto-social-2025',
    description: 'Especialistas discutem as principais tendências em mensuração de impacto social, ESG e finanças sociais para 2025.',
    eventType: 'webinar',
    location: 'Online (YouTube Live)',
    virtualLink: 'https://youtube.com/live/impact7-2025',
    startsAt: now + 14 * 24 * 60 * 60 * 1000,
    endsAt: now + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
    maxAttendees: 500,
    registrationDeadline: now + 13 * 24 * 60 * 60 * 1000,
    featuredImage: '',
    status: 'published',
    createdAt: now,
    updatedAt: now,
  },
  {
    title: 'Conferência IMPACT7 2025',
    slug: 'conferencia-impact7-2025',
    description: 'O maior evento de impacto social do Brasil. Dois dias de palestras, workshops e networking com líderes do setor.',
    eventType: 'conference',
    location: 'São Paulo, SP',
    virtualLink: null,
    startsAt: now + 60 * 24 * 60 * 60 * 1000,
    endsAt: now + 62 * 24 * 60 * 60 * 1000,
    maxAttendees: 300,
    registrationDeadline: now + 55 * 24 * 60 * 60 * 1000,
    featuredImage: '',
    status: 'published',
    createdAt: now,
    updatedAt: now,
  },
];

// forumCategories: id, name, slug, description, displayOrder, isActive, createdAt
const forumCategories = [
  { name: 'Metodologia IMPACT7', slug: 'metodologia-impact7', description: 'Discussões sobre o Método IMPACT7 e suas aplicações', displayOrder: 1, isActive: 1, createdAt: now },
  { name: 'Calculadora S-ROI', slug: 'calculadora-sroi', description: 'Dúvidas e dicas sobre o uso da calculadora de S-ROI', displayOrder: 2, isActive: 1, createdAt: now },
  { name: 'Cases de Sucesso', slug: 'cases-sucesso', description: 'Compartilhe e discuta casos reais de impacto social', displayOrder: 3, isActive: 1, createdAt: now },
  { name: 'Ferramentas e Recursos', slug: 'ferramentas-recursos', description: 'Templates, planilhas e outros recursos úteis', displayOrder: 4, isActive: 1, createdAt: now },
];

// courses: id, title, slug, description, instructor, duration, level, price, featuredImage, status, publishedAt, createdAt, updatedAt
const courses = [
  {
    title: 'Fundamentos do Método IMPACT7',
    slug: 'fundamentos-metodo-impact7',
    description: 'Aprenda os conceitos fundamentais do Método IMPACT7: a fórmula C⁷ × S-ROI, as 7 dimensões contextuais e como aplicá-las em projetos reais.',
    instructor: 'Equipe IMPACT7',
    duration: 120,
    level: 'beginner',
    price: 0,
    featuredImage: '',
    status: 'published',
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    title: 'Calculando S-ROI: Da Teoria à Prática',
    slug: 'calculando-sroi-teoria-pratica',
    description: 'Curso prático sobre cálculo de S-ROI. Aprenda a mapear stakeholders, identificar outcomes, monetizar impactos e calcular o retorno social.',
    instructor: 'Equipe IMPACT7',
    duration: 240,
    level: 'intermediate',
    price: 19700,
    featuredImage: '',
    status: 'published',
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    title: 'SET7 Avançado: Gates, Agentes e Automação',
    slug: 'set7-avancado-gates-agentes-automacao',
    description: 'Domine o framework SET7 completo: configure gates de qualidade, implemente agentes de IA e automatize o monitoramento de impacto.',
    instructor: 'Equipe IMPACT7',
    duration: 360,
    level: 'advanced',
    price: 39700,
    featuredImage: '',
    status: 'published',
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
];

async function seed() {
  const conn = await mysql.createConnection(DB_URL);
  const inserted = { blogPosts: 0, events: 0, forumCategories: 0, courses: 0 };

  for (const post of blogPosts) {
    const [existing] = await conn.execute('SELECT id FROM blogPosts WHERE slug = ?', [post.slug]);
    if (existing.length === 0) {
      await conn.execute(
        `INSERT INTO blogPosts (title, slug, excerpt, content, featuredImage, author, category, tags, status, publishedAt, viewCount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [post.title, post.slug, post.excerpt, post.content, post.featuredImage, post.author, post.category, post.tags, post.status, post.publishedAt, post.viewCount, post.createdAt, post.updatedAt]
      );
      inserted.blogPosts++;
    }
  }

  for (const event of events) {
    const [existing] = await conn.execute('SELECT id FROM events WHERE slug = ?', [event.slug]);
    if (existing.length === 0) {
      await conn.execute(
        `INSERT INTO events (title, slug, description, eventType, location, virtualLink, startsAt, endsAt, maxAttendees, registrationDeadline, featuredImage, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [event.title, event.slug, event.description, event.eventType, event.location, event.virtualLink, event.startsAt, event.endsAt, event.maxAttendees, event.registrationDeadline, event.featuredImage, event.status, event.createdAt, event.updatedAt]
      );
      inserted.events++;
    }
  }

  for (const cat of forumCategories) {
    const [existing] = await conn.execute('SELECT id FROM forumCategories WHERE slug = ?', [cat.slug]);
    if (existing.length === 0) {
      await conn.execute(
        `INSERT INTO forumCategories (name, slug, description, displayOrder, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
        [cat.name, cat.slug, cat.description, cat.displayOrder, cat.isActive, cat.createdAt]
      );
      inserted.forumCategories++;
    }
  }

  for (const course of courses) {
    const [existing] = await conn.execute('SELECT id FROM courses WHERE slug = ?', [course.slug]);
    if (existing.length === 0) {
      await conn.execute(
        `INSERT INTO courses (title, slug, description, instructor, duration, level, price, featuredImage, status, publishedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [course.title, course.slug, course.description, course.instructor, course.duration, course.level, course.price, course.featuredImage, course.status, course.publishedAt, course.createdAt, course.updatedAt]
      );
      inserted.courses++;
    }
  }

  await conn.end();
  console.log('Seed concluído:', inserted);
}

seed().catch(e => { console.error(e); process.exit(1); });
