/**
 * Jarvis Knowledge Base Service
 * Gerencia a base de conhecimento do IMPACT7 para RAG
 */

// Documentos da base de conhecimento IMPACT7
export const IMPACT7_KNOWLEDGE_BASE = {
  // Fundamentação Científica
  ciencia: {
    teoriaInformacao: {
      titulo: "Teoria da Informação - Claude Shannon",
      conteudo: `A eficácia do IMPACT7 é fundamentada na Teoria da Informação de Claude Shannon. 
      Identificamos a "Crise do Contexto" como um estado de alta entropia organizacional.
      
      PROBLEMA: A perda de sinal (propósito) ao longo da cadeia de comando gera dissipação de energia (recursos).
      
      SOLUÇÃO: O IMPACT7 atua como um filtro de redução de entropia, restaurando a integridade do sinal antes da execução.
      
      A entropia organizacional pode ser medida pela fórmula: H = -Σ p(x) log₂ p(x)
      Onde p(x) representa a probabilidade de cada estado possível do sistema.`,
      tags: ["ciência", "entropia", "shannon", "informação"]
    },
    cienciaCognitiva: {
      titulo: "Ciência Cognitiva - Lei de Miller",
      conteudo: `A arquitetura do método respeita os limites biológicos do processamento humano.
      
      LEI DE MILLER: O cérebro humano processa 7±2 itens simultaneamente (George Miller, 1956).
      
      TEORIA DA CARGA COGNITIVA: John Sweller demonstrou que a memória de trabalho tem capacidade limitada.
      
      OTIMIZAÇÃO IMPACT7: A regra 7x7x77 funciona como mecanismo de "chunking", 
      agrupando informações em blocos gerenciáveis para reduzir a carga cognitiva.
      
      Aplicações práticas:
      - 7 Pilares do método (não mais, não menos)
      - 7 Recursos por ciclo (7R)
      - 7 Valores mínimos de entrega (7V)
      - Ciclos de 77 unidades temporais (77T)`,
      tags: ["cognitiva", "miller", "sweller", "chunking", "memória"]
    },
    sistemasComplexos: {
      titulo: "Sistemas Adaptativos Complexos",
      conteudo: `Comunidades são sistemas adaptativos complexos que se auto-organizam.
      
      CARACTERÍSTICAS:
      - Emergência: propriedades surgem da interação entre partes
      - Auto-organização: ordem emerge sem controle centralizado
      - Adaptação: o sistema evolui em resposta ao ambiente
      - Não-linearidade: pequenas mudanças podem ter grandes efeitos
      
      APLICAÇÃO NO IMPACT7:
      O pilar da Independência utiliza princípios de organização bottom-up.
      Regras simples geram ordem complexa e resiliente sem controle centralizado.
      
      Exemplo: Uma comunidade treinada com os 7 pilares desenvolve 
      capacidade de resolver problemas novos sem intervenção externa.`,
      tags: ["complexidade", "emergência", "auto-organização", "adaptação"]
    }
  },

  // Modelo Matemático
  matematica: {
    equacaoGeral: {
      titulo: "Equação Geral do Impacto",
      conteudo: `A equação fundamental do IMPACT7:

      I = (E × C⁷) / R

      Onde:
      - I = Impacto mensurável (resultado final)
      - E = Energia (recursos investidos: tempo, dinheiro, pessoas)
      - C = Contexto preservado (0 a 1, onde 1 = contexto 100% preservado)
      - R = Resistência do sistema (fricções, barreiras, ineficiências)

      O EXPOENTE 7:
      O expoente 7 demonstra matematicamente que pequenas perdas de contexto 
      resultam em quedas catastróficas de impacto.
      
      Exemplo numérico:
      - Se C = 0.9 (90% do contexto preservado): C⁷ = 0.478
      - Se C = 0.8 (80% do contexto preservado): C⁷ = 0.210
      - Se C = 0.7 (70% do contexto preservado): C⁷ = 0.082
      
      Uma perda de apenas 30% do contexto resulta em 92% de perda de impacto!`,
      tags: ["equação", "impacto", "contexto", "matemática"]
    },
    unidades: {
      titulo: "Unidades de Medida IMPACT7",
      conteudo: `O método utiliza três unidades fundamentais:

      7R - UNIDADE DE RECURSO
      Alocação modular de recursos para evitar desperdício e forçar priorização.
      Cada projeto deve ter exatamente 7 recursos-chave identificados.
      
      7V - UNIDADE DE VALOR
      KPIs mínimos de entrega por ciclo.
      Se output < 7V, o processo está ineficiente e precisa de ajuste.
      
      77T - CICLO TEMPORAL
      Gestão de tempo em ciclos de 77 unidades (dias, horas, ou sprints).
      Induz foco e urgência produtiva sem burnout.
      
      S-ROI - RETORNO SOCIAL SOBRE INVESTIMENTO
      Meta: S-ROI ≥ 7x
      Cada unidade monetária investida deve gerar 7x em valor social.
      
      Fórmula S-ROI = (Valor Social Gerado) / (Investimento Total)`,
      tags: ["7R", "7V", "77T", "S-ROI", "métricas"]
    },
    sRoi: {
      titulo: "Cálculo do S-ROI",
      conteudo: `O S-ROI (Social Return on Investment) é calculado assim:

      S-ROI = Valor Social Total / Investimento Total

      COMPONENTES DO VALOR SOCIAL:
      1. Impacto Direto: benefícios mensuráveis aos beneficiários
      2. Impacto Indireto: efeitos em famílias e comunidade
      3. Impacto Sistêmico: mudanças em políticas ou práticas
      
      CLASSIFICAÇÃO S-ROI:
      - Excelente: S-ROI ≥ 10x
      - Muito Bom: S-ROI 7x - 9.9x
      - Bom: S-ROI 5x - 6.9x
      - Moderado: S-ROI 3x - 4.9x
      - Baixo: S-ROI < 3x
      
      BENCHMARK IMPACT7:
      - S-ROI Mínimo Recomendado: 7x
      - S-ROI Médio (Projetos Sociais): 3-4x
      - S-ROI Top 10% (com IMPACT7): 12x+`,
      tags: ["S-ROI", "retorno", "investimento", "social", "cálculo"]
    }
  },

  // Os 7 Pilares
  pilares: {
    imersao: {
      titulo: "Pilar 1: Imersão",
      conteudo: `IMERSÃO - O primeiro pilar do IMPACT7

      DEFINIÇÃO:
      Etnografia digital e mergulho profundo no contexto antes de qualquer ação.
      
      OBJETIVO:
      Entender verdadeiramente o problema antes de propor soluções.
      
      FERRAMENTAS:
      - Entrevistas em profundidade com stakeholders
      - Observação participante na comunidade
      - Análise de dados históricos e narrativas
      - Mapeamento de redes de relacionamento
      
      OUTPUTS:
      - Mapa de Contexto completo
      - Personas dos beneficiários
      - Jornada atual do problema
      - Hipóteses iniciais validadas
      
      ERRO COMUM:
      Pular esta fase para "economizar tempo" resulta em soluções 
      desconectadas da realidade, desperdiçando recursos.`,
      tags: ["imersão", "etnografia", "contexto", "pesquisa"]
    },
    ideacao: {
      titulo: "Pilar 2: Ideação",
      conteudo: `IDEAÇÃO - O segundo pilar do IMPACT7

      DEFINIÇÃO:
      Canvas colaborativo e co-criação de soluções com a comunidade.
      
      PRINCÍPIO:
      "Nada sobre nós, sem nós" - soluções devem ser co-criadas 
      com os beneficiários, não impostas de fora.
      
      FERRAMENTAS:
      - Design Thinking adaptado para impacto social
      - Canvas IMPACT7 de Ideação
      - Prototipagem rápida de conceitos
      - Votação e priorização coletiva
      
      OUTPUTS:
      - 3-5 conceitos de solução validados
      - Protótipos de baixa fidelidade
      - Critérios de sucesso definidos pela comunidade
      - Roadmap inicial de implementação
      
      MÉTRICA:
      % de ideias que vieram diretamente dos beneficiários (meta: >50%)`,
      tags: ["ideação", "co-criação", "design thinking", "canvas"]
    },
    implementacao: {
      titulo: "Pilar 3: Implementação",
      conteudo: `IMPLEMENTAÇÃO - O terceiro pilar do IMPACT7

      DEFINIÇÃO:
      Micro-ciclos de 77 unidades e prototipagem rápida.
      
      PRINCÍPIO:
      Falhar rápido, aprender rápido, ajustar rápido.
      
      METODOLOGIA:
      - Ciclos de 77 dias (ou 77 horas para projetos menores)
      - Entregas incrementais a cada ciclo
      - Validação contínua com beneficiários
      - Documentação de aprendizados
      
      REGRAS:
      1. Nunca mais de 7 recursos ativos por ciclo (7R)
      2. Mínimo de 7 entregas de valor por ciclo (7V)
      3. Revisão obrigatória ao final de cada 77T
      
      OUTPUTS:
      - MVP funcional ao final do primeiro ciclo
      - Métricas de progresso documentadas
      - Lista de ajustes para próximo ciclo`,
      tags: ["implementação", "ciclos", "77T", "MVP", "prototipagem"]
    },
    iteracao: {
      titulo: "Pilar 4: Iteração",
      conteudo: `ITERAÇÃO - O quarto pilar do IMPACT7

      DEFINIÇÃO:
      Feedback loops contínuos e melhoria sistemática.
      
      PRINCÍPIO:
      O primeiro plano nunca sobrevive ao contato com a realidade.
      A iteração transforma erros em aprendizado.
      
      CICLO DE ITERAÇÃO:
      1. MEDIR: Coletar dados de desempenho
      2. APRENDER: Analisar o que funcionou e o que não funcionou
      3. AJUSTAR: Modificar abordagem baseado em evidências
      4. REPETIR: Iniciar novo ciclo com melhorias
      
      FERRAMENTAS:
      - Dashboard de métricas em tempo real
      - Retrospectivas semanais com equipe
      - Feedback estruturado de beneficiários
      - A/B testing de abordagens
      
      MÉTRICA:
      Velocidade de iteração (tempo entre identificar problema e implementar solução)`,
      tags: ["iteração", "feedback", "melhoria contínua", "aprendizado"]
    },
    impacto: {
      titulo: "Pilar 5: Impacto",
      conteudo: `IMPACTO - O quinto pilar do IMPACT7

      DEFINIÇÃO:
      Dashboard S-ROI e mensuração rigorosa de resultados.
      
      PRINCÍPIO:
      "O que não é medido não é gerenciado" - mas medir errado 
      é pior do que não medir.
      
      FRAMEWORK DE MENSURAÇÃO:
      1. OUTPUTS: O que foi entregue (quantidade)
      2. OUTCOMES: Mudanças de comportamento (qualidade)
      3. IMPACT: Transformação de longo prazo (sustentabilidade)
      
      MÉTRICAS OBRIGATÓRIAS:
      - S-ROI (Retorno Social sobre Investimento)
      - NPS dos beneficiários
      - Taxa de retenção/engajamento
      - Custo por beneficiário impactado
      
      FERRAMENTAS:
      - Dashboard IMPACT7 automatizado
      - Relatórios mensais de impacto
      - Auditorias trimestrais independentes`,
      tags: ["impacto", "métricas", "S-ROI", "mensuração", "dashboard"]
    },
    inspiracao: {
      titulo: "Pilar 6: Inspiração",
      conteudo: `INSPIRAÇÃO - O sexto pilar do IMPACT7

      DEFINIÇÃO:
      Storytelling estratégico e engajamento de parceiros.
      
      PRINCÍPIO:
      Dados convencem a mente, histórias movem o coração.
      Impacto real merece ser contado.
      
      ELEMENTOS DO STORYTELLING IMPACT7:
      1. HERÓI: O beneficiário (não a organização)
      2. JORNADA: Da situação inicial à transformação
      3. OBSTÁCULOS: Desafios superados
      4. TRANSFORMAÇÃO: Mudança mensurável
      5. CHAMADA: Convite para outros se juntarem
      
      CANAIS:
      - Relatórios de impacto visuais
      - Vídeos de depoimentos
      - Cases de estudo detalhados
      - Apresentações para investidores
      
      MÉTRICA:
      Taxa de conversão de prospects em parceiros/doadores`,
      tags: ["inspiração", "storytelling", "engajamento", "parceiros"]
    },
    independencia: {
      titulo: "Pilar 7: Independência",
      conteudo: `INDEPENDÊNCIA - O sétimo pilar do IMPACT7

      DEFINIÇÃO:
      LMS integrado e empoderamento comunitário para sustentabilidade.
      
      PRINCÍPIO:
      O objetivo final é tornar a intervenção desnecessária.
      Sucesso = comunidade autônoma.
      
      ESTRATÉGIAS:
      1. CAPACITAÇÃO: Treinar líderes locais
      2. TRANSFERÊNCIA: Passar gestão para a comunidade
      3. SUSTENTABILIDADE: Criar fontes de receita própria
      4. REDE: Conectar com outras comunidades
      
      FERRAMENTAS:
      - LMS (Learning Management System) com cursos
      - Certificação de "Guardiões IMPACT7"
      - Toolkit de replicação do método
      - Rede de alumni e mentoria entre pares
      
      MÉTRICA DE SUCESSO:
      % de projetos que continuam operando 2+ anos 
      após encerramento da intervenção externa (meta: >70%)`,
      tags: ["independência", "empoderamento", "sustentabilidade", "capacitação"]
    }
  },

  // Framework Tecnológico
  tecnologia: {
    contextLake: {
      titulo: "Context Lake - Data Lake Contextual",
      conteudo: `CONTEXT LAKE - Preservação da Memória Contextual

      DEFINIÇÃO:
      Data lake especializado para armazenamento de dados não estruturados 
      que preservam o contexto do projeto.
      
      TIPOS DE DADOS:
      - Histórico organizacional e narrativas
      - Transcrições de entrevistas
      - Documentos culturais da comunidade
      - Registros de decisões e justificativas
      - Fotos, vídeos e áudios contextuais
      
      DIFERENCIAL:
      Diferente de bancos de dados tradicionais, o Context Lake 
      preserva o "porquê" além do "o quê".
      
      TECNOLOGIAS:
      - Vector embeddings para busca semântica
      - Graph database para relacionamentos
      - Time-series para evolução temporal
      - NLP para extração de insights`,
      tags: ["context lake", "dados", "memória", "contexto"]
    },
    aiCore: {
      titulo: "AI Core - Context Keeper",
      conteudo: `AI CORE (CONTEXT KEEPER) - Guardião do Contexto

      DEFINIÇÃO:
      Agentes de IA que monitoram a comunicação da equipe em tempo real,
      alertando sobre desvios de propósito e sugerindo correções.
      
      FUNCIONALIDADES:
      1. MONITORAMENTO: Analisa comunicações da equipe
      2. DETECÇÃO: Identifica sinais de perda de contexto
      3. ALERTA: Notifica quando há desvio do propósito
      4. SUGESTÃO: Propõe correções baseadas no Context Lake
      
      INDICADORES DE ALERTA:
      - Linguagem desalinhada com valores do projeto
      - Decisões que contradizem aprendizados anteriores
      - Falta de referência aos beneficiários
      - Métricas de vaidade vs. métricas de impacto
      
      INTEGRAÇÃO:
      - Slack, Teams, Email
      - Documentos compartilhados
      - Reuniões gravadas`,
      tags: ["IA", "context keeper", "monitoramento", "alertas"]
    },
    modulos: {
      titulo: "Os 7 Módulos do IMPACT7-OS",
      conteudo: `IMPACT7-OS - Sistema Operacional de Impacto

      MÓDULO 1: IMERSÃO
      Ferramentas de etnografia digital e pesquisa contextual.
      
      MÓDULO 2: IDEAÇÃO
      Canvas colaborativo e sistema de co-criação.
      
      MÓDULO 3: IMPLEMENTAÇÃO
      Gestão de ciclos 77T e tracking de entregas.
      
      MÓDULO 4: ITERAÇÃO
      Dashboard de feedback e sistema de retrospectivas.
      
      MÓDULO 5: IMPACTO
      Calculadora S-ROI e relatórios automatizados.
      
      MÓDULO 6: INSPIRAÇÃO
      Gerador de cases e toolkit de storytelling.
      
      MÓDULO 7: INDEPENDÊNCIA
      LMS integrado e certificação de guardiões.
      
      INTEGRAÇÃO:
      Todos os módulos compartilham dados através do Context Lake,
      garantindo consistência e preservação do contexto.`,
      tags: ["módulos", "IMPACT7-OS", "plataforma", "software"]
    }
  },

  // Casos de Estudo Reais
  casosEstudo: {
    casoBrasil: {
      titulo: "Caso de Estudo: Comunidade Esperança - Brasil",
      conteudo: `CASO DE ESTUDO: COMUNIDADE ESPERANÇA - SÃO PAULO, BRASIL

      CONTEXTO INICIAL:
      - Comunidade de 2.500 famílias em situação de vulnerabilidade
      - Taxa de desemprego: 47%
      - Evasão escolar: 32%
      - Investimento anterior de R$ 1.2M sem resultados mensuráveis
      
      INTERVENÇÃO IMPACT7:
      - Duração: 18 meses (3 ciclos de 77T)
      - Investimento: R$ 450.000
      - Equipe: 4 facilitadores + 12 líderes comunitários
      
      RESULTADOS APÓS 18 MESES:
      - Desemprego: 47% → 18% (-62%)
      - Evasão escolar: 32% → 8% (-75%)
      - Renda média familiar: +127%
      - 3 cooperativas criadas e autossustentáveis
      - 89 microempreendedores formados
      
      S-ROI CALCULADO: 14.2x
      Cada R$ 1 investido gerou R$ 14.20 em valor social.
      
      FATORES DE SUCESSO:
      1. Imersão de 45 dias antes de qualquer ação
      2. Co-criação com 100% das soluções validadas pela comunidade
      3. Líderes locais como protagonistas desde o início
      4. Métricas compartilhadas semanalmente com todos`,
      tags: ["caso", "brasil", "comunidade", "resultados", "S-ROI"]
    },
    casoPortugal: {
      titulo: "Caso de Estudo: Projeto Renascer - Portugal",
      conteudo: `CASO DE ESTUDO: PROJETO RENASCER - PORTO, PORTUGAL

      CONTEXTO INICIAL:
      - Bairro social com 800 famílias
      - Alto índice de isolamento social em idosos (67%)
      - Conflitos intergeracionais frequentes
      - Tentativas anteriores de intervenção falharam
      
      INTERVENÇÃO IMPACT7:
      - Duração: 12 meses (2 ciclos de 77T)
      - Investimento: € 180.000
      - Foco: Integração intergeracional
      
      RESULTADOS:
      - Isolamento em idosos: 67% → 23% (-66%)
      - Conflitos reportados: -78%
      - 45 pares de mentoria jovem-idoso formados
      - 2 negócios sociais criados pela comunidade
      - Modelo replicado em 3 outros bairros
      
      S-ROI CALCULADO: 9.8x
      
      INOVAÇÃO APLICADA:
      - "Cafés de Histórias" semanais conectando gerações
      - App comunitário desenvolvido por jovens locais
      - Horta urbana gerida intergeracionalmente`,
      tags: ["caso", "portugal", "idosos", "intergeracional", "S-ROI"]
    },
    casoONG: {
      titulo: "Caso de Estudo: ONG Transformação Digital",
      conteudo: `CASO DE ESTUDO: TRANSFORMAÇÃO DE ONG TRADICIONAL

      CONTEXTO INICIAL:
      - ONG com 15 anos de atuação em educação
      - Dificuldade em mensurar impacto real
      - Dependência de um único financiador (85%)
      - Equipe desmotivada e alta rotatividade
      
      DESAFIO:
      Transformar operações para modelo IMPACT7 sem interromper serviços.
      
      INTERVENÇÃO:
      - Fase 1: Diagnóstico e Imersão (30 dias)
      - Fase 2: Redesenho de processos (45 dias)
      - Fase 3: Implementação gradual (6 meses)
      - Fase 4: Consolidação e escala (6 meses)
      
      RESULTADOS APÓS 12 MESES:
      - S-ROI documentado: 8.7x (antes: não mensurável)
      - Diversificação: 85% → 45% dependência de um financiador
      - 4 novos parceiros institucionais
      - Rotatividade de equipe: 40% → 12%
      - NPS de beneficiários: 34 → 72
      
      LIÇÕES APRENDIDAS:
      1. Mudança cultural leva tempo - respeitar o ritmo
      2. Quick wins iniciais constroem confiança
      3. Dados são aliados, não ameaças
      4. Comunicação transparente é essencial`,
      tags: ["caso", "ONG", "transformação", "institucional", "S-ROI"]
    },
    casoEducacao: {
      titulo: "Caso de Estudo: Rede de Escolas Públicas",
      conteudo: `CASO DE ESTUDO: REDE MUNICIPAL DE EDUCAÇÃO

      CONTEXTO INICIAL:
      - 23 escolas municipais
      - IDEB médio: 4.2 (meta: 6.0)
      - Evasão no ensino médio: 28%
      - Orçamento limitado para inovação
      
      INTERVENÇÃO IMPACT7:
      - Piloto em 5 escolas (primeiro ciclo 77T)
      - Expansão para 23 escolas (segundo ciclo)
      - Investimento total: R$ 890.000
      
      METODOLOGIA:
      1. Imersão com professores, alunos e famílias
      2. Co-criação de soluções por escola
      3. Rede de troca entre escolas
      4. Dashboard unificado de métricas
      
      RESULTADOS (24 MESES):
      - IDEB médio: 4.2 → 5.8 (+38%)
      - Evasão: 28% → 11% (-61%)
      - Engajamento de professores: +89%
      - 12 práticas inovadoras documentadas e replicadas
      
      S-ROI CALCULADO: 11.3x
      
      SUSTENTABILIDADE:
      Modelo incorporado à política municipal de educação.`,
      tags: ["caso", "educação", "escolas", "IDEB", "S-ROI", "público"]
    }
  },

  // FAQs Frequentes
  faqs: {
    oquee: {
      titulo: "FAQ: O que é o IMPACT7?",
      conteudo: `PERGUNTA: O que é o IMPACT7?

      RESPOSTA:
      O IMPACT7 é um método científico para maximizar o impacto social de projetos 
      e organizações. Baseado em 7 pilares (Imersão, Ideação, Implementação, 
      Iteração, Impacto, Inspiração e Independência), o método combina:
      
      - Fundamentação científica (Teoria da Informação, Ciência Cognitiva)
      - Modelo matemático (Equação I = E × C⁷ / R)
      - Framework tecnológico (Context Lake, AI Core)
      - Métricas rigorosas (S-ROI, 7R, 7V, 77T)
      
      O diferencial é a preservação do contexto: garantir que o propósito 
      original não se perca durante a execução.`,
      tags: ["FAQ", "o que é", "definição", "introdução"]
    },
    paraquem: {
      titulo: "FAQ: Para quem é o IMPACT7?",
      conteudo: `PERGUNTA: Para quem é o IMPACT7?

      RESPOSTA:
      O IMPACT7 é ideal para:
      
      1. ONGs E ORGANIZAÇÕES SOCIAIS
         - Que querem mensurar e aumentar seu impacto
         - Que precisam prestar contas a financiadores
         - Que buscam sustentabilidade de longo prazo
      
      2. EMPRESAS COM PROGRAMAS DE RSC
         - Que querem ir além do "greenwashing"
         - Que buscam impacto real e mensurável
         - Que querem engajar colaboradores
      
      3. GOVERNOS E POLÍTICAS PÚBLICAS
         - Que precisam otimizar recursos escassos
         - Que querem evidências para tomada de decisão
         - Que buscam escalar programas que funcionam
      
      4. INVESTIDORES DE IMPACTO
         - Que querem avaliar projetos com rigor
         - Que buscam maximizar retorno social
         - Que precisam de métricas comparáveis
      
      5. EMPREENDEDORES SOCIAIS
         - Que estão começando um projeto
         - Que querem evitar erros comuns
         - Que buscam um framework comprovado`,
      tags: ["FAQ", "público", "para quem", "ONGs", "empresas"]
    },
    quantocusta: {
      titulo: "FAQ: Quanto custa implementar o IMPACT7?",
      conteudo: `PERGUNTA: Quanto custa implementar o IMPACT7?

      RESPOSTA:
      O investimento varia conforme o escopo:
      
      AUTOESTUDO (Gratuito a R$ 497)
      - E-book gratuito com fundamentos
      - Curso online completo: R$ 497
      - Acesso à comunidade de prática
      
      CONSULTORIA GUIADA (R$ 5.000 - R$ 25.000)
      - Diagnóstico inicial
      - Workshops de capacitação
      - Acompanhamento por 3-6 meses
      - Ideal para ONGs pequenas/médias
      
      IMPLEMENTAÇÃO COMPLETA (R$ 50.000 - R$ 200.000)
      - Projeto customizado
      - Equipe dedicada
      - Tecnologia IMPACT7-OS
      - Acompanhamento por 12-24 meses
      - Ideal para grandes organizações
      
      ROI TÍPICO:
      Projetos IMPACT7 têm S-ROI médio de 8-12x, 
      significando que o investimento se paga muitas vezes.`,
      tags: ["FAQ", "custo", "preço", "investimento", "ROI"]
    },
    quantotempo: {
      titulo: "FAQ: Quanto tempo leva para ver resultados?",
      conteudo: `PERGUNTA: Quanto tempo leva para ver resultados?

      RESPOSTA:
      O IMPACT7 trabalha com ciclos de 77 unidades temporais (77T):
      
      PRIMEIROS 30 DIAS:
      - Diagnóstico completo
      - Mapa de contexto
      - Primeiras métricas baseline
      
      PRIMEIRO CICLO 77T (77 dias):
      - MVP de solução implementado
      - Primeiros resultados mensuráveis
      - Ajustes baseados em feedback
      
      TRÊS CICLOS 77T (231 dias / ~8 meses):
      - Resultados consolidados
      - S-ROI calculável com confiança
      - Modelo pronto para escala
      
      LONGO PRAZO (12-24 meses):
      - Transformação sustentável
      - Comunidade/organização autônoma
      - Modelo replicável documentado
      
      IMPORTANTE:
      Resultados rápidos são possíveis, mas transformação real leva tempo.
      O método equilibra urgência com sustentabilidade.`,
      tags: ["FAQ", "tempo", "resultados", "prazo", "77T"]
    },
    diferenciais: {
      titulo: "FAQ: O que diferencia o IMPACT7 de outros métodos?",
      conteudo: `PERGUNTA: O que diferencia o IMPACT7 de outros métodos?

      RESPOSTA:
      Principais diferenciais:
      
      1. FUNDAMENTAÇÃO CIENTÍFICA
         - Baseado em Teoria da Informação (Shannon)
         - Respeita limites cognitivos (Lei de Miller)
         - Modelo matemático testável
      
      2. FOCO NO CONTEXTO
         - A maioria dos métodos ignora a "Crise do Contexto"
         - IMPACT7 trata preservação de contexto como prioridade
         - Tecnologia dedicada (Context Lake, AI Core)
      
      3. MÉTRICAS RIGOROSAS
         - S-ROI padronizado e comparável
         - Sistema 7R/7V/77T para gestão
         - Dashboard em tempo real
      
      4. SUSTENTABILIDADE INTEGRADA
         - Pilar de Independência desde o início
         - Objetivo: tornar intervenção desnecessária
         - Capacitação de líderes locais
      
      5. TECNOLOGIA PROPRIETÁRIA
         - IMPACT7-OS: plataforma completa
         - IA para preservação de contexto
         - Integração de todos os pilares
      
      COMPARAÇÃO:
      - Design Thinking: foca em soluções, não em contexto
      - Lean Startup: foca em velocidade, não em impacto social
      - Theory of Change: descritivo, não prescritivo`,
      tags: ["FAQ", "diferenciais", "comparação", "vantagens"]
    },
    comomecar: {
      titulo: "FAQ: Como começar com o IMPACT7?",
      conteudo: `PERGUNTA: Como começar com o IMPACT7?

      RESPOSTA:
      Passos recomendados para iniciar:
      
      PASSO 1: APRENDER OS FUNDAMENTOS
      - Baixe o e-book gratuito no site
      - Assista aos vídeos introdutórios
      - Leia os casos de estudo
      
      PASSO 2: FAZER O DIAGNÓSTICO
      - Use a Calculadora de Impacto online
      - Avalie seu projeto atual
      - Identifique gaps de contexto
      
      PASSO 3: ESCOLHER O CAMINHO
      Opção A - Autoestudo:
        - Curso online + comunidade
        - Ideal para projetos pequenos
      
      Opção B - Consultoria:
        - Agende uma conversa com especialista
        - Diagnóstico personalizado
        - Plano de implementação
      
      Opção C - Parceria:
        - Para grandes organizações
        - Implementação completa
        - Tecnologia + acompanhamento
      
      PASSO 4: PRIMEIRO CICLO 77T
      - Comece com um projeto piloto
      - Aplique os 7 pilares
      - Documente aprendizados
      
      CONTATO:
      - WhatsApp: (11) 99999-9999
      - Email: contato@impact7.com.br
      - Site: www.impact7.com.br`,
      tags: ["FAQ", "começar", "primeiros passos", "início"]
    },
    calculadora: {
      titulo: "FAQ: Como funciona a Calculadora de Impacto?",
      conteudo: `PERGUNTA: Como funciona a Calculadora de Impacto?

      RESPOSTA:
      A Calculadora de Impacto aplica a equação I = (E × C⁷) / R:
      
      PARÂMETROS DE ENTRADA:
      
      1. ENERGIA (E) - Recursos investidos
         - Orçamento total do projeto
         - Horas de trabalho da equipe
         - Recursos materiais
         Escala: 1-10 (1=mínimo, 10=máximo)
      
      2. CONTEXTO (C) - Preservação do propósito
         - Clareza da missão
         - Alinhamento da equipe
         - Conexão com beneficiários
         Escala: 0-1 (0=perdido, 1=100% preservado)
      
      3. RESISTÊNCIA (R) - Barreiras e fricções
         - Burocracia
         - Conflitos internos
         - Barreiras externas
         Escala: 1-10 (1=mínima, 10=máxima)
      
      SAÍDA:
      - Índice de Impacto (I)
      - S-ROI estimado
      - Recomendações de melhoria
      - Comparação com benchmarks
      
      INTERPRETAÇÃO:
      - I > 7: Excelente potencial de impacto
      - I 4-7: Bom, com espaço para melhoria
      - I < 4: Necessita revisão urgente`,
      tags: ["FAQ", "calculadora", "equação", "impacto", "S-ROI"]
    }
  }
};

// Tipos
export interface KnowledgeDocument {
  titulo: string;
  conteudo: string;
  tags: string[];
  categoria: string;
  subcategoria: string;
}

// Função para buscar documentos relevantes
export function searchKnowledge(query: string, limit: number = 3): KnowledgeDocument[] {
  const results: KnowledgeDocument[] = [];
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  // Flatten knowledge base
  const allDocs: KnowledgeDocument[] = [];
  
  for (const [categoria, subcategorias] of Object.entries(IMPACT7_KNOWLEDGE_BASE)) {
    for (const [subcategoria, doc] of Object.entries(subcategorias)) {
      allDocs.push({
        ...doc,
        categoria,
        subcategoria
      });
    }
  }

  // Score each document
  const scored = allDocs.map(doc => {
    let score = 0;
    const docText = `${doc.titulo} ${doc.conteudo} ${doc.tags.join(' ')}`.toLowerCase();
    
    // Exact phrase match
    if (docText.includes(queryLower)) {
      score += 10;
    }
    
    // Word matches
    for (const word of queryWords) {
      if (word.length < 3) continue;
      if (docText.includes(word)) {
        score += 2;
      }
      // Tag match (higher weight)
      if (doc.tags.some(tag => tag.toLowerCase().includes(word))) {
        score += 5;
      }
      // Title match (highest weight)
      if (doc.titulo.toLowerCase().includes(word)) {
        score += 8;
      }
    }
    
    return { doc, score };
  });

  // Sort by score and return top results
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.doc);
}

// Função para obter contexto formatado para o LLM
export function getContextForLLM(query: string): string {
  const relevantDocs = searchKnowledge(query, 3);
  
  if (relevantDocs.length === 0) {
    return "Não encontrei informações específicas sobre esse tema na base de conhecimento IMPACT7.";
  }
  
  let context = "CONTEXTO DA BASE DE CONHECIMENTO IMPACT7:\n\n";
  
  for (const doc of relevantDocs) {
    context += `### ${doc.titulo}\n`;
    context += `${doc.conteudo}\n\n`;
  }
  
  return context;
}

// Função para listar todas as categorias
export function listCategories(): string[] {
  return Object.keys(IMPACT7_KNOWLEDGE_BASE);
}

// Função para obter documentos por categoria
export function getDocumentsByCategory(categoria: string): KnowledgeDocument[] {
  const cat = IMPACT7_KNOWLEDGE_BASE[categoria as keyof typeof IMPACT7_KNOWLEDGE_BASE];
  if (!cat) return [];
  
  return Object.entries(cat).map(([subcategoria, doc]) => ({
    ...doc,
    categoria,
    subcategoria
  }));
}
