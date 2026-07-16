/**
 * ============================================================================
 * CONSTANTES SET7 - VALORES FUNDAMENTAIS DA METODOLOGIA
 * ============================================================================
 * 
 * Constantes utilizadas em toda a plataforma IMPACT7 para garantir
 * consistência e alinhamento com a metodologia SET7.
 */

// ============================================================================
// AS 7 CAPACIDADES (C⁷) — OS 7 C's CANÔNICOS DO MÉTODO IMPACTA SETE
// ============================================================================
//
// CANONIZADO pelo fundador em 2026-07-16 (decisão D3 do documento
// S7_BUNKER/00_ESTRATEGIA/METODO_IMPACTA_SETE_CANONICO.md).
//
// Estes 7 rótulos são a versão UNIFICADA oficial: funcionam simultaneamente
// como "Capacidades multiplicadoras" (fator C⁷ da equação I=(E×C⁷)/R) e como
// "Dimensões do Contexto". As antigas "Dimensões do Contexto" do material de
// marketing (Cultural/Comunitário/Capacitário/Conectivo/Cognitivo/
// Colaborativo/Continuativo) foram reancoradas como aspectos destes 7 C's —
// ver SEVEN_CS_CONTEXTUAL_MAP abaixo. NÃO renomear sem nova decisão do fundador.
// ============================================================================

export const SEVEN_CAPABILITIES = [
  {
    id: 'consciencia',
    name: {
      pt: 'Consciência',
      en: 'Awareness',
      es: 'Conciencia',
    },
    description: {
      pt: 'Compreensão profunda do contexto, desafios e oportunidades',
      en: 'Deep understanding of context, challenges and opportunities',
      es: 'Comprensión profunda del contexto, desafíos y oportunidades',
    },
    icon: '🧠',
    color: '#6366f1',
  },
  {
    id: 'competencia',
    name: {
      pt: 'Competência',
      en: 'Competence',
      es: 'Competencia',
    },
    description: {
      pt: 'Habilidades e conhecimentos necessários para executar',
      en: 'Skills and knowledge needed to execute',
      es: 'Habilidades y conocimientos necesarios para ejecutar',
    },
    icon: '🎯',
    color: '#8b5cf6',
  },
  {
    id: 'conexao',
    name: {
      pt: 'Conexão',
      en: 'Connection',
      es: 'Conexión',
    },
    description: {
      pt: 'Redes e relacionamentos que amplificam o impacto',
      en: 'Networks and relationships that amplify impact',
      es: 'Redes y relaciones que amplifican el impacto',
    },
    icon: '🔗',
    color: '#a855f7',
  },
  {
    id: 'colaboracao',
    name: {
      pt: 'Colaboração',
      en: 'Collaboration',
      es: 'Colaboración',
    },
    description: {
      pt: 'Trabalho conjunto para alcançar objetivos comuns',
      en: 'Working together to achieve common goals',
      es: 'Trabajo conjunto para alcanzar objetivos comunes',
    },
    icon: '🤝',
    color: '#d946ef',
  },
  {
    id: 'criatividade',
    name: {
      pt: 'Criatividade',
      en: 'Creativity',
      es: 'Creatividad',
    },
    description: {
      pt: 'Inovação e pensamento disruptivo para soluções únicas',
      en: 'Innovation and disruptive thinking for unique solutions',
      es: 'Innovación y pensamiento disruptivo para soluciones únicas',
    },
    icon: '💡',
    color: '#ec4899',
  },
  {
    id: 'compromisso',
    name: {
      pt: 'Compromisso',
      en: 'Commitment',
      es: 'Compromiso',
    },
    description: {
      pt: 'Dedicação e responsabilidade com os resultados',
      en: 'Dedication and responsibility for results',
      es: 'Dedicación y responsabilidad con los resultados',
    },
    icon: '💪',
    color: '#f43f5e',
  },
  {
    id: 'continuidade',
    name: {
      pt: 'Continuidade',
      en: 'Continuity',
      es: 'Continuidad',
    },
    description: {
      pt: 'Sustentabilidade e perenidade das transformações',
      en: 'Sustainability and permanence of transformations',
      es: 'Sostenibilidad y permanencia de las transformaciones',
    },
    icon: '♾️',
    color: '#ef4444',
  },
] as const;

// ============================================================================
// MAPA DE RECONCILIAÇÃO — Dimensões do Contexto (marketing) → 7 C's canônicos
// ============================================================================
//
// Documenta a decisão D3 canonizada: como as antigas "Dimensões do Contexto"
// (usadas na página de marketing Matematica.tsx) se mapeiam nos 7 C's oficiais.
// Fonte da verdade = SEVEN_CAPABILITIES acima. Este mapa serve apenas para
// alinhar discurso de marketing e produto sem duplicar listas divergentes.

export const SEVEN_CS_CONTEXTUAL_MAP = {
  consciencia: ['Cognitivo', 'Cultural'],
  competencia: ['Capacitário'],
  conexao: ['Conectivo'],
  colaboracao: ['Colaborativo', 'Comunitário'],
  criatividade: [],
  compromisso: [],
  continuidade: ['Continuativo'],
} as const;


// ============================================================================
// OS 7 MÓDULOS DO MÉTODO
// ============================================================================

export const SEVEN_MODULES = [
  {
    id: 'diagnostico',
    name: {
      pt: 'Diagnóstico',
      en: 'Diagnosis',
      es: 'Diagnóstico',
    },
    description: {
      pt: 'Análise profunda do contexto e identificação de oportunidades',
      en: 'Deep analysis of context and identification of opportunities',
      es: 'Análisis profundo del contexto e identificación de oportunidades',
    },
    phase: 'SET7.01',
  },
  {
    id: 'estrategia',
    name: {
      pt: 'Estratégia',
      en: 'Strategy',
      es: 'Estrategia',
    },
    description: {
      pt: 'Definição de direção, metas e plano de ação',
      en: 'Definition of direction, goals and action plan',
      es: 'Definición de dirección, metas y plan de acción',
    },
    phase: 'SET7.02',
  },
  {
    id: 'engajamento',
    name: {
      pt: 'Engajamento',
      en: 'Engagement',
      es: 'Compromiso',
    },
    description: {
      pt: 'Mobilização e alinhamento de stakeholders',
      en: 'Mobilization and alignment of stakeholders',
      es: 'Movilización y alineación de stakeholders',
    },
    phase: 'SET7.03',
  },
  {
    id: 'execucao',
    name: {
      pt: 'Execução',
      en: 'Execution',
      es: 'Ejecución',
    },
    description: {
      pt: 'Implementação das iniciativas com excelência',
      en: 'Implementation of initiatives with excellence',
      es: 'Implementación de iniciativas con excelencia',
    },
    phase: 'SET7.04',
  },
  {
    id: 'medicao',
    name: {
      pt: 'Medição',
      en: 'Measurement',
      es: 'Medición',
    },
    description: {
      pt: 'Monitoramento e avaliação de resultados',
      en: 'Monitoring and evaluation of results',
      es: 'Monitoreo y evaluación de resultados',
    },
    phase: 'SET7.05',
  },
  {
    id: 'aprendizado',
    name: {
      pt: 'Aprendizado',
      en: 'Learning',
      es: 'Aprendizaje',
    },
    description: {
      pt: 'Captura e disseminação de conhecimento',
      en: 'Capture and dissemination of knowledge',
      es: 'Captura y diseminación de conocimiento',
    },
    phase: 'SET7.06',
  },
  {
    id: 'escala',
    name: {
      pt: 'Escala',
      en: 'Scale',
      es: 'Escala',
    },
    description: {
      pt: 'Ampliação e replicação do impacto',
      en: 'Expansion and replication of impact',
      es: 'Ampliación y replicación del impacto',
    },
    phase: 'SET7.07',
  },
] as const;

// ============================================================================
// FRAMEWORKS TECNOLÓGICOS
// ============================================================================

export const TECH_FRAMEWORKS = {
  '7R': {
    name: 'Framework 7R',
    description: {
      pt: 'Os 7 pilares de resiliência tecnológica',
      en: 'The 7 pillars of technological resilience',
      es: 'Los 7 pilares de resiliencia tecnológica',
    },
    pillars: [
      'Redundância',
      'Recuperação',
      'Resiliência',
      'Responsividade',
      'Rastreabilidade',
      'Regulação',
      'Retroalimentação',
    ],
  },
  '7V': {
    name: 'Framework 7V',
    description: {
      pt: 'Os 7 vetores de valor',
      en: 'The 7 value vectors',
      es: 'Los 7 vectores de valor',
    },
    vectors: [
      'Velocidade',
      'Volume',
      'Variedade',
      'Veracidade',
      'Valor',
      'Visibilidade',
      'Viabilidade',
    ],
  },
  '77T': {
    name: 'Framework 77T',
    description: {
      pt: 'As 77 tecnologias habilitadoras',
      en: 'The 77 enabling technologies',
      es: 'Las 77 tecnologías habilitadoras',
    },
    categories: [
      'IA e Machine Learning',
      'Blockchain e DLT',
      'Cloud e Edge Computing',
      'IoT e Sensores',
      'Big Data e Analytics',
      'Segurança e Privacidade',
      'Experiência do Usuário',
    ],
  },
};

// ============================================================================
// ODS (OBJETIVOS DE DESENVOLVIMENTO SUSTENTÁVEL)
// ============================================================================

export const SDG_GOALS = [
  { id: 1, name: 'Erradicação da Pobreza', color: '#E5243B' },
  { id: 2, name: 'Fome Zero', color: '#DDA63A' },
  { id: 3, name: 'Saúde e Bem-Estar', color: '#4C9F38' },
  { id: 4, name: 'Educação de Qualidade', color: '#C5192D' },
  { id: 5, name: 'Igualdade de Gênero', color: '#FF3A21' },
  { id: 6, name: 'Água Potável e Saneamento', color: '#26BDE2' },
  { id: 7, name: 'Energia Limpa e Acessível', color: '#FCC30B' },
  { id: 8, name: 'Trabalho Decente e Crescimento Econômico', color: '#A21942' },
  { id: 9, name: 'Indústria, Inovação e Infraestrutura', color: '#FD6925' },
  { id: 10, name: 'Redução das Desigualdades', color: '#DD1367' },
  { id: 11, name: 'Cidades e Comunidades Sustentáveis', color: '#FD9D24' },
  { id: 12, name: 'Consumo e Produção Responsáveis', color: '#BF8B2E' },
  { id: 13, name: 'Ação Contra a Mudança Global do Clima', color: '#3F7E44' },
  { id: 14, name: 'Vida na Água', color: '#0A97D9' },
  { id: 15, name: 'Vida Terrestre', color: '#56C02B' },
  { id: 16, name: 'Paz, Justiça e Instituições Eficazes', color: '#00689D' },
  { id: 17, name: 'Parcerias e Meios de Implementação', color: '#19486A' },
] as const;

// ============================================================================
// SETORES DE IMPACTO
// ============================================================================

export const IMPACT_SECTORS = [
  { id: 'education', name: { pt: 'Educação', en: 'Education', es: 'Educación' } },
  { id: 'health', name: { pt: 'Saúde', en: 'Health', es: 'Salud' } },
  { id: 'environment', name: { pt: 'Meio Ambiente', en: 'Environment', es: 'Medio Ambiente' } },
  { id: 'social', name: { pt: 'Assistência Social', en: 'Social Assistance', es: 'Asistencia Social' } },
  { id: 'culture', name: { pt: 'Cultura', en: 'Culture', es: 'Cultura' } },
  { id: 'technology', name: { pt: 'Tecnologia', en: 'Technology', es: 'Tecnología' } },
  { id: 'agriculture', name: { pt: 'Agricultura', en: 'Agriculture', es: 'Agricultura' } },
  { id: 'housing', name: { pt: 'Habitação', en: 'Housing', es: 'Vivienda' } },
  { id: 'employment', name: { pt: 'Emprego', en: 'Employment', es: 'Empleo' } },
  { id: 'governance', name: { pt: 'Governança', en: 'Governance', es: 'Gobernanza' } },
] as const;

// ============================================================================
// NÍVEIS DE MATURIDADE SET7
// ============================================================================

export const MATURITY_LEVELS = [
  {
    level: 1,
    name: { pt: 'Inicial', en: 'Initial', es: 'Inicial' },
    description: { 
      pt: 'Processos ad-hoc, sem padronização',
      en: 'Ad-hoc processes, no standardization',
      es: 'Procesos ad-hoc, sin estandarización',
    },
    minCompliance: 0,
    maxCompliance: 20,
  },
  {
    level: 2,
    name: { pt: 'Gerenciado', en: 'Managed', es: 'Gestionado' },
    description: {
      pt: 'Processos básicos estabelecidos',
      en: 'Basic processes established',
      es: 'Procesos básicos establecidos',
    },
    minCompliance: 21,
    maxCompliance: 40,
  },
  {
    level: 3,
    name: { pt: 'Definido', en: 'Defined', es: 'Definido' },
    description: {
      pt: 'Processos documentados e padronizados',
      en: 'Documented and standardized processes',
      es: 'Procesos documentados y estandarizados',
    },
    minCompliance: 41,
    maxCompliance: 60,
  },
  {
    level: 4,
    name: { pt: 'Quantificado', en: 'Quantified', es: 'Cuantificado' },
    description: {
      pt: 'Processos medidos e controlados',
      en: 'Measured and controlled processes',
      es: 'Procesos medidos y controlados',
    },
    minCompliance: 61,
    maxCompliance: 80,
  },
  {
    level: 5,
    name: { pt: 'Otimizado', en: 'Optimized', es: 'Optimizado' },
    description: {
      pt: 'Melhoria contínua e inovação',
      en: 'Continuous improvement and innovation',
      es: 'Mejora continua e innovación',
    },
    minCompliance: 81,
    maxCompliance: 100,
  },
] as const;

// ============================================================================
// EXPORTAÇÃO
// ============================================================================

export default {
  SEVEN_CAPABILITIES,
  SEVEN_MODULES,
  TECH_FRAMEWORKS,
  SDG_GOALS,
  IMPACT_SECTORS,
  MATURITY_LEVELS,
};
