/**
 * Conteúdo canônico de seed da Base de Conhecimento (RAG do Jarvis).
 * ------------------------------------------------------------------
 * Documentos-base sobre o Método Impacta Sete, alinhados às decisões
 * canônicas do fundador (ver S7_BUNKER/00_ESTRATEGIA/DECISOES_CANONICAS.md).
 * A ingestão é idempotente por `title` (ver seedKnowledgeBase em rag-service).
 */

export interface SeedDocument {
  title: string;
  category: string;
  tags: string;
  content: string;
}

export const KB_SEED_DOCUMENTS: SeedDocument[] = [
  {
    title: "O que é o Método Impacta Sete",
    category: "metodo",
    tags: "método,impact7,visão,imts",
    content:
      "O Método Impacta Sete (IMPACT7) é uma metodologia de inovação social exponencial que combina ciência cognitiva, modelagem matemática e engenharia de software para maximizar o retorno social sobre o investimento (S-ROI). Ele se organiza em três camadas complementares: (1) os 7 Pilares 'I', que são a identidade voltada ao cliente; (2) o modelo matemático da Equação do Impacto com os 7 C's e o S-ROI; e (3) o Método SET7 de engenharia, que estrutura a construção de sistemas transformadores. Faz parte do ecossistema IMTS.",
  },
  {
    title: "Os 7 Pilares I do Método Impacta Sete",
    category: "metodo",
    tags: "pilares,7i,identidade",
    content:
      "Os 7 Pilares 'I' são a sétupla primária do método, voltada ao cliente: 1) Imersão — mergulhar no contexto e no problema real; 2) Ideação — gerar hipóteses e soluções; 3) Implementação — colocar em prática; 4) Iteração — aprender e ajustar em ciclos; 5) Impacto — mensurar a transformação gerada; 6) Inspiração — engajar e mobilizar pessoas; 7) Independência — tornar a transformação autossustentável. As demais 'sétuplas' do método (fases SET7, módulos, 7R, 7V) são frameworks internos de apoio, subordinados a estes pilares.",
  },
  {
    title: "A Equação do Impacto",
    category: "modelo-matematico",
    tags: "equação,impacto,fórmula,c7",
    content:
      "A Equação do Impacto é I = (E × C⁷) / R, onde: I = Impacto (resultado mensurável da transformação social, índice de 0 a 1000); E = Engajamento (nível de envolvimento e participação dos stakeholders); C⁷ = as 7 Capacidades/C's do Contexto elevadas à sétima potência (o fator multiplicador exponencial); R = Resistência (fatores que reduzem ou dificultam o impacto). O impacto cresce de forma exponencial com as capacidades do contexto e é amplificado pelo engajamento, sendo atenuado pela resistência.",
  },
  {
    title: "Os 7 C's do Contexto",
    category: "modelo-matematico",
    tags: "7cs,capacidades,contexto",
    content:
      "Os 7 C's são as capacidades multiplicadoras do Método Impacta Sete (o fator C⁷ da Equação do Impacto): 1) Consciência — compreensão profunda do contexto, desafios e oportunidades; 2) Competência — habilidades e conhecimentos necessários para executar; 3) Conexão — redes e relacionamentos que amplificam o impacto; 4) Colaboração — trabalho conjunto para alcançar objetivos comuns; 5) Criatividade — inovação e pensamento disruptivo; 6) Compromisso — dedicação e responsabilidade com os resultados; 7) Continuidade — sustentabilidade e perenidade das transformações. Esta é a lista oficial canonizada (decisão DC-002).",
  },
  {
    title: "S-ROI — Retorno Social sobre o Investimento",
    category: "modelo-matematico",
    tags: "sroi,retorno,benchmark",
    content:
      "O S-ROI (Social Return on Investment) mede o valor social gerado por unidade de investimento. É calculado como o valor social estimado dividido pelo investimento realizado. Benchmarks oficiais (decisão DC-004): S-ROI excelente ≥ 5× (retorno excepcional); bom entre 3× e 5× (acima da média do setor); médio entre 1× e 3× (na média do setor); abaixo de 1× indica necessidade de otimização. A calculadora do IMPACT7 também deriva o custo por beneficiário e o impacto por unidade investida.",
  },
  {
    title: "O Método SET7 — Fases de Engenharia",
    category: "set7",
    tags: "set7,fases,engenharia,gates",
    content:
      "O Método SET7 estrutura a construção de Sistemas Exponenciais Transformadores em 7 fases (mais o protocolo de entrada START), cada uma com objetivos, atividades, artefatos e um gate de aprovação: SET7.START (Protocolo de Entrada); SET7.01 (Direção Estratégica, Escopo e Matriz de Intenção); SET7.02 (Domínio, Arquitetura e Decomposição Sistêmica); SET7.03 (Contratos, APIs e Integrações); SET7.04 (Segurança, Governança e Confiança); SET7.05 (Construção Performática — back, front e experiência); SET7.06 (Operação, Observabilidade e Eficiência Cognitiva); SET7.07 (Resiliência, Continuidade e Evolução). Não existem '14 fases' — apenas estas 7 (+ START).",
  },
  {
    title: "Jarvis — Assistente de IA do IMPACT7",
    category: "jarvis",
    tags: "jarvis,ia,rag,assistente",
    content:
      "O Jarvis é o assistente de inteligência artificial do IMPACT7. Ele responde dúvidas sobre o método, executa a calculadora de impacto e oferece mentoria. Usa RAG (Retrieval-Augmented Generation): recupera os documentos mais relevantes desta base de conhecimento por similaridade semântica e os injeta como contexto no modelo de linguagem, produzindo respostas fundamentadas e citando as fontes utilizadas.",
  },
  {
    title: "Conformidade e Acessibilidade do IMPACT7",
    category: "governanca",
    tags: "wcag,acessibilidade,versão,conformidade",
    content:
      "A versão oficial da metodologia é a 2.0 (decisão DC-007). O alvo oficial de acessibilidade é WCAG 2.2 AA, aplicado a toda a experiência da plataforma; a conformidade AAA é tratada como meta aspiracional, não como requisito. A plataforma segue o Método SET7 para governança, segurança (RBAC/ABAC), observabilidade e trilhas de auditoria.",
  },
];
