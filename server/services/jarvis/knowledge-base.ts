/**
 * Jarvis Knowledge Base Service
 * Gerencia a base de conhecimento do Método Impact7 para RAG.
 *
 * Conteúdo alinhado ao Método Impact7 real, tal como descrito nos dois livros (Livro do
 * Método, Livro da Metodologia) e implementado na plataforma (shared/ive-mapping.ts,
 * shared/sroi-calculator.ts, server/services/impact/*). Nenhum caso de estudo, número de
 * clientes ou faturamento é inventado aqui — o método está em fase inicial / piloto, e a
 * base é explícita sobre isso, seguindo a norma de zero travessões (sem impact-washing).
 */

// Documentos da base de conhecimento Impact7
export const IMPACT7_KNOWLEDGE_BASE = {
  // O método em si
  metodo: {
    oQueE: {
      titulo: "O que é o Método Impact7",
      conteudo: `O Impact7 é uma fábrica de ativos exponenciais.

      A unidade atômica do método não é a pessoa, é o ATIVO: um curso, uma tecnologia,
      uma comunidade, um serviço. "Impactar" alguém significa "acender" (ignitar) essa
      pessoa através de um ativo — ela entra em contato com o ativo, avança em profundidade
      de engajamento, e em algum ponto cruza o limiar em que passa a contar como impacto
      real, não apenas exposição.

      O método organiza esse processo em dois funis complementares:
      - O Funil IVE (Origem, Ideação, Validação, Prototipação, Produtização, Operação,
        Escala) descreve o estágio de maturidade do próprio ATIVO.
      - O Funil IMPACTA (Informar, Motivar, Preparar, Ativar, Conectar, Transformar,
        Amplificar) descreve a profundidade de engajamento de uma PESSOA com um ativo.

      Em cima disso, o método usa um Motor Duplo (trilha comercial e trilha social) e um
      S-ROI honesto, com desconto explícito por atribuição, deadweight e drop-off, para
      nunca inflar o número de impacto reportado.`,
      tags: ["método", "impact7", "ativo", "fábrica de ativos", "definição"]
    },
    conceitoDeAtivo: {
      titulo: "O conceito de Ativo",
      conteudo: `No Impact7, um ATIVO é qualquer coisa reutilizável que gera engajamento e,
      eventualmente, impacto: um curso, uma tecnologia, uma comunidade, um serviço.

      Por que o ativo é a unidade, e não a pessoa impactada diretamente? Porque um ativo bem
      construído é o que permite que o impacto se repita e se multiplique sem depender de
      esforço manual repetido — é o mecanismo de escala do método. Cada iniciativa dentro do
      ecossistema Impact7 gira em torno de um ou mais ativos que avançam pelo Funil IVE, da
      Origem até a Escala.`,
      tags: ["ativo", "método", "escala", "definição"]
    }
  },

  // Funil IVE — o estágio de maturidade do ativo/iniciativa
  funilIve: {
    definicao: {
      titulo: "Funil IVE — os 7 estágios do ativo",
      conteudo: `O Funil IVE descreve os sete estágios pelos quais um ativo ou iniciativa
      passa, do surgimento à escala:

      1. ORIGEM (D0) — o ponto de partida, antes de qualquer validação.
      2. IDEAÇÃO — a ideia do ativo está sendo formulada.
      3. VALIDAÇÃO — testando se a ideia resolve um problema real.
      4. PROTOTIPAÇÃO — construindo uma primeira versão funcional.
      5. PRODUTIZAÇÃO — transformando o protótipo em algo entregável de forma repetível.
      6. OPERAÇÃO — o ativo está rodando de forma estável, com beneficiários reais.
      7. ESCALA — o ativo está sendo multiplicado além do contexto original.

      No código da plataforma, esse estágio fica registrado no campo stageIve de cada
      iniciativa (ver shared/ive-mapping.ts, constante IVE_STAGES). Cada iniciativa avança
      estágio a estágio; não há atalho de Origem direto para Escala.`,
      tags: ["funil ive", "estágios", "ativo", "stageIve", "origem", "escala"]
    }
  },

  // Funil IMPACTA — a profundidade de engajamento de uma pessoa
  funilImpacta: {
    definicao: {
      titulo: "Funil IMPACTA — os 7 níveis de engajamento",
      conteudo: `O Funil IMPACTA mede o quão fundo o engajamento de uma pessoa com um ativo
      chegou, em ordem crescente de profundidade:

      1. INFORMAR — a pessoa teve o primeiro contato/exposição ao ativo.
      2. MOTIVAR — a pessoa demonstrou algum interesse ativo (clicou, voltou).
      3. PREPARAR — a pessoa deu o primeiro passo de uso real. Este é o LIMIAR DE IMPACTO:
         a partir daqui a pessoa conta oficialmente como impactada.
      4. ATIVAR — a pessoa completou uma ação/tarefa concreta dentro do ativo.
      5. CONECTAR — a pessoa se conectou com outras pessoas em torno do ativo (comunidade,
         pares).
      6. TRANSFORMAR — um resultado sustentado e confirmado foi observado na vida da pessoa.
      7. AMPLIFICAR — a pessoa indicou outras pessoas ou criou conteúdo a partir do ativo,
         gerando um efeito de segunda ordem.

      Abaixo do nível 3 (Preparar) a pessoa está apenas em EXPOSIÇÃO — ainda não conta como
      impacto. Nos códigos reais isso vive em shared/ive-mapping.ts: IMPACTA_ORDER define os
      sete níveis e IMPACT_THRESHOLD_LEVEL = 3 marca o limiar.`,
      tags: ["funil impacta", "engajamento", "níveis", "limiar de impacto", "preparar"]
    },
    camadas: {
      titulo: "As 3 camadas de impacto acima do limiar",
      conteudo: `Uma vez que a pessoa cruza o limiar (nível 3, Preparar), ela entra em uma
      das três camadas de impacto, em ordem crescente de peso probatório:

      CAMADA IMPACTO (níveis 3 a 5 — Preparar, Ativar, Conectar)
      É a camada do "gatilho": a pessoa cruzou o limiar e está engajada, mas o resultado de
      transformação ainda não foi confirmado. Cada pessoa nesta camada conta como um
      "gatilho" no S-ROI.

      CAMADA TRANSFORMAÇÃO (nível 6 — Transformar)
      Um subconjunto MEDIDO da camada de impacto: são as pessoas para quem um resultado
      sustentado foi de fato confirmado (não presumido). Cada transformação também é um
      gatilho, mas com peso maior no cálculo de valor social.

      CAMADA ESTEIRA (nível 7 — Amplificar)
      A camada de PROJEÇÃO de efeito de segunda ordem (indicações, conteúdo criado por
      quem foi impactado). A esteira NUNCA é somada ao S-ROI monetário auditado — ela é
      contada e reportada separadamente, como esteiraProjecao, exatamente para não inflar
      artificialmente o número oficial de impacto.

      Essa separação (impacto / transformação / esteira) é o que sustenta a honestidade do
      S-ROI: só o que foi de fato medido entra na conta oficial.`,
      tags: ["camadas", "impacto", "transformação", "esteira", "gatilho", "s-roi"]
    }
  },

  // Motor Duplo
  motorDuplo: {
    definicao: {
      titulo: "Motor Duplo — trilha comercial e trilha social",
      conteudo: `O Impact7 opera com um Motor Duplo: duas trilhas de retorno, com metas e
      naturezas de custo diferentes, rodando em paralelo.

      TRILHA COMERCIAL
      Alvo de retorno de aproximadamente 10x. Financeiramente sustentada dentro do próprio
      ecossistema IMTS.

      TRILHA SOCIAL
      Alvo de retorno de aproximadamente 100x, viabilizada através de uma organização sem
      fins lucrativos parceira, o Instituto Expand.

      As duas trilhas também diferem na natureza do custo:
      - CUSTO FIXO IMTS: o que a própria IMTS paga para operar o ativo (o denominador do
        S-ROI, custoImts).
      - CUSTO VARIÁVEL EXTERNALIZADO: na trilha social, o custo por beneficiário adicional
        não é pago pela plataforma — é custeado por parceiros externos e doadores, o que é
        o que permite à trilha social buscar uma meta de retorno tão mais alta que a
        comercial sem inflar o custo fixo interno.`,
      tags: ["motor duplo", "trilha comercial", "trilha social", "instituto expand", "custo"]
    }
  },

  // S-ROI honesto
  sroi: {
    formulaHonesta: {
      titulo: "S-ROI honesto — a fórmula auditável",
      conteudo: `O S-ROI do Impact7 é calculado de forma auditável, nunca por estimativa
      solta. A fórmula (implementada em shared/sroi-calculator.ts, função calcSroi, e usada
      tanto no cálculo real quanto em qualquer simulação ilustrativa) é:

      valorSocialBruto = gatilhos × valorGatilho + transformações × valorTransformação
      fatorDesconto = atribuição × (1 − deadweight) × (1 − dropOff)
      valorSocial = valorSocialBruto × fatorDesconto
      S-ROI = valorSocial / custoImts

      Onde:
      - gatilhos = pessoas únicas que cruzaram o limiar de impacto (camadas impacto +
        transformação, deduplicadas por identidade, contando pelo maior nível já alcançado).
      - transformações = subconjunto de gatilhos com resultado sustentado confirmado.
      - valorGatilho / valorTransformação = proxies de valor monetário por gatilho e por
        transformação, definidos por iniciativa.
      - atribuição = percentual de crédito que a iniciativa pode honestamente reivindicar
        pelo resultado (não age sozinha no mundo real).
      - deadweight = percentual do resultado que teria acontecido de qualquer forma, mesmo
        sem a iniciativa.
      - dropOff = percentual do efeito que se perde ao longo do tempo.
      - custoImts = custo fixo real pago pela IMTS para operar a iniciativa.

      A camada esteira (Amplificar) NUNCA entra nessa conta — é só projeção, reportada à
      parte (esteiraProjecao).`,
      tags: ["s-roi", "fórmula", "gatilhos", "transformações", "auditável", "calcSroi"]
    },
    tresDescontos: {
      titulo: "Os 3 fatores de desconto do S-ROI",
      conteudo: `O S-ROI honesto nunca reporta o valor social bruto sem desconto. Três
      fatores multiplicativos reduzem o número antes de virar S-ROI oficial:

      1. ATRIBUIÇÃO — quanto do resultado observado pode ser honestamente creditado à
         iniciativa, e não a outros fatores concorrentes (outras organizações, contexto
         econômico, esforço da própria pessoa).
      2. DEADWEIGHT — a fração do resultado que teria ocorrido de qualquer forma, mesmo sem
         a iniciativa existir.
      3. DROP-OFF — a perda de efeito ao longo do tempo (um resultado medido hoje pode não
         se sustentar integralmente daqui a um ano).

      Os três se multiplicam entre si (não se somam) para formar o fatorDesconto, o que
      torna o desconto final naturalmente mais severo do que qualquer um dos três fatores
      isolados — de propósito, para que o método erre para o lado conservador, nunca para o
      lado inflado. A faixa realista de S-ROI depois desses descontos fica em torno de 3x a
      10x; um número de duas dezenas de vezes é tratado como sinal de premissa de valor
      inflada, não como troféu.`,
      tags: ["desconto", "atribuição", "deadweight", "drop-off", "s-roi", "honestidade"]
    },
    alavancagem: {
      titulo: "Alavancagem — gatilhos por real de custo fixo",
      conteudo: `Além do S-ROI (que é monetário), o método acompanha a ALAVANCAGEM:

      alavancagem = gatilhos / custoImts

      Ou seja, quantas pessoas cruzaram o limiar de impacto para cada real de custo fixo
      pago pela IMTS. É uma métrica operacional complementar ao S-ROI: enquanto o S-ROI
      responde "quanto valor social por real investido", a alavancagem responde "quantas
      pessoas impactadas por real investido", sem depender dos proxies de valor monetário.`,
      tags: ["alavancagem", "gatilhos", "custo", "métrica"]
    }
  },

  // Bifurcação de Capital
  bifurcacao: {
    rubrica: {
      titulo: "Bifurcação de Capital",
      conteudo: `A Bifurcação de Capital é o ponto de decisão em que uma iniciativa madura
      é avaliada para decidir se ela permanece dentro do ecossistema IMTS ou se torna um
      empreendimento autônomo (spin-off).

      A avaliação usa uma rubrica de 5 critérios, cada um pontuado de 0 a 10 e com pesos
      diferentes:

      - Autonomia de mercado (peso ×2)
      - Margem vs. equity (peso ×2)
      - Sinergia com o ecossistema (peso ×1)
      - Necessidade de capital (peso ×1)
      - Velocidade exigida (peso ×1)

      O score ponderado resultante define o caminho:
      - Score ≤ 6: a iniciativa permanece dentro do ecossistema IMTS.
      - Score entre 7 e 9: modelo híbrido.
      - Score ≥ 10: a iniciativa se torna um empreendimento autônomo (spin-off).

      Esse mecanismo existe para que a decisão de "soltar" um ativo do ecossistema seja
      baseada em critérios explícitos e ponderados, não em intuição.`,
      tags: ["bifurcação de capital", "spin-off", "rubrica", "autonomia", "critérios"]
    }
  },

  // Ecossistema IMTS
  ecossistema: {
    imts: {
      titulo: "Impact7 dentro do Ecossistema IMTS",
      conteudo: `O Impact7 não é uma empresa isolada: é um produto da estrutura transversal
      "Fábrica de Método", dentro do Ecossistema IMTS mais amplo.

      O Ecossistema IMTS é organizado em 9 círculos organizacionais, liderado pela CEO
      Kamilla Marques e pelo fundador e CVO Ítalo Teófilo. A Fábrica de Método, responsável
      por produzir e manter o Método Impact7 (os livros e sua implementação na plataforma),
      é liderada por Ítalo Filho.

      Essa estrutura importa para entender o Impact7 como método: ele não foi desenhado
      isoladamente, é parte de um ecossistema maior que também opera a trilha comercial e a
      trilha social do Motor Duplo.`,
      tags: ["ecossistema imts", "fábrica de método", "organização", "círculos"]
    }
  },

  // O piloto real documentado
  piloto: {
    jornadaImpact7: {
      titulo: "Piloto Jornada Impact7 — o primeiro ativo real",
      conteudo: `O Impact7 está em fase de piloto. O primeiro ativo real desenhado para
      validar o método de ponta a ponta é a "Jornada Impact7": uma jornada educacional
      instrumentada, um curso de 6 a 8 aulas, com acompanhamento de mentor de IA por
      aluno — o único formato em que os sete níveis do Funil IMPACTA são medidos por
      eventos que a plataforma já captura, sem integração adicional.

      No banco de dados real, isso existe como a iniciativa "Piloto 01" (tenant Instituto
      Expand, modo social, estágio IVE Operação). Os parâmetros econômicos de partida
      (valor por gatilho, valor por transformação, atribuição) são explicitamente
      ILUSTRATIVOS até o piloto rodar e calibrar os números reais — o piloto existe
      exatamente para substituir esses valores por dados medidos.

      O piloto define 4 gates de avaliação antes de qualquer iniciativa ser considerada
      validada: qualificação (estabilidade do funil), custo por usuário, S-ROI dentro da
      faixa realista (3x–10x, nunca inflado), e auditabilidade (um terceiro cético consegue
      refazer a conta a partir da trilha de auditoria e chegar ao mesmo número).

      IMPORTANTE: até o piloto concluir e os gates serem avaliados, não existem resultados
      finais, números de S-ROI auditado ou contagem de beneficiários reais a divulgar. Ainda estamos na fase de medir, não de anunciar
      resultado.`,
      tags: ["piloto", "jornada impact7", "instituto expand", "gates", "fase inicial"]
    }
  },

  // FAQs Frequentes
  faqs: {
    oquee: {
      titulo: "FAQ: O que é o Impact7?",
      conteudo: `PERGUNTA: O que é o Impact7?

      RESPOSTA:
      O Impact7 é um método para transformar iniciativas de impacto social em uma fábrica
      de ativos exponenciais — cursos, tecnologias, comunidades e serviços desenhados para
      multiplicar o número de pessoas que cruzam o limiar de impacto real, com um S-ROI
      medido de forma honesta (nunca inflado) e uma trilha de auditoria completa.

      O método combina o Funil IVE (maturidade do ativo), o Funil IMPACTA (profundidade de
      engajamento da pessoa), um Motor Duplo de retorno (comercial e social) e a fórmula do
      S-ROI honesto, com três fatores de desconto (atribuição, deadweight, drop-off).`,
      tags: ["FAQ", "o que é", "definição", "introdução"]
    },
    paraquem: {
      titulo: "FAQ: Para quem é o Impact7?",
      conteudo: `PERGUNTA: Para quem é o Impact7?

      RESPOSTA:
      O Impact7 é pensado para organizações e iniciativas que:

      - Constroem ou operam ativos de impacto social (cursos, comunidades, serviços,
        tecnologias) e querem medir o resultado real, não só o alcance bruto.
      - Precisam prestar contas com uma trilha de auditoria, não com estimativa solta.
      - Trabalham com um modelo de retorno duplo: parte comercial, parte social, com
        parceiros como o Instituto Expand viabilizando a trilha social.
      - Estão dispostas a aceitar um S-ROI descontado por atribuição, deadweight e
        drop-off — ou seja, um número mais conservador, mas defensável.

      O método está em fase de piloto (ver "Piloto Jornada Impact7"), então hoje ele é mais
      adequado para quem quer participar da validação inicial do que para quem busca um
      produto já maduro e testado em escala.`,
      tags: ["FAQ", "público", "para quem", "piloto"]
    },
    quantocusta: {
      titulo: "FAQ: Quanto custa o Impact7?",
      conteudo: `PERGUNTA: Quanto custa o Impact7?

      RESPOSTA:
      O Impact7 está em fase inicial / piloto — ainda não existe uma tabela de preços
      pública e validada para divulgar aqui, e este assistente não vai inventar valores de
      planos ou pacotes. Para uma conversa sobre custo e escopo, o caminho correto é falar
      diretamente com a equipe do Ecossistema IMTS.

      O que já está claro no método: o custo relevante para o S-ROI é o custoImts (o custo
      fixo que a própria IMTS paga para operar cada iniciativa). Na trilha social, o custo
      variável por beneficiário adicional é externalizado — custeado por parceiros e
      doadores, não pela plataforma.`,
      tags: ["FAQ", "custo", "preço", "investimento", "piloto"]
    },
    quantotempo: {
      titulo: "FAQ: Quanto tempo leva para ver resultado?",
      conteudo: `PERGUNTA: Quanto tempo leva para ver resultado no Impact7?

      RESPOSTA:
      Depende do estágio do ativo no Funil IVE. Um ativo começa em Origem e precisa passar
      por Ideação, Validação, Prototipação e Produtização antes de chegar a Operação — só aí
      é possível medir engajamento real pelo Funil IMPACTA.

      No piloto atual (Jornada Impact7), o cronograma de referência é de aproximadamente 12
      semanas: as primeiras semanas são de produção do ativo e soft launch, o meio do
      período é de coorte real rodando e sendo acompanhada, e o final do período é dedicado
      à medição de transformação e ao cálculo do S-ROI auditável. Esse é o cronograma de UM
      piloto específico, não uma promessa genérica de prazo para qualquer iniciativa.`,
      tags: ["FAQ", "tempo", "prazo", "funil ive", "piloto"]
    },
    diferenciais: {
      titulo: "FAQ: O que diferencia o Impact7 de outros métodos?",
      conteudo: `PERGUNTA: O que diferencia o Impact7 de outros métodos de impacto social?

      RESPOSTA:
      Os principais diferenciais do método:

      1. UNIDADE DE MEDIDA É O ATIVO, NÃO A PESSOA
         O foco é construir ativos reutilizáveis (cursos, tecnologias, comunidades,
         serviços) que multiplicam o impacto, em vez de depender de esforço manual
         repetido por beneficiário.

      2. LIMIAR DE IMPACTO EXPLÍCITO
         Nem todo contato conta como impacto. Só a partir do nível 3 (Preparar) do Funil
         IMPACTA uma pessoa passa a contar oficialmente — abaixo disso é só exposição.

      3. S-ROI COM DESCONTO HONESTO
         O valor social bruto é sempre descontado por atribuição, deadweight e drop-off
         antes de virar o número oficial. A camada de projeção (esteira/Amplificar) nunca é
         somada ao número auditado.

      4. AUDITABILIDADE
         Cada cálculo de S-ROI é registrado em uma trilha de auditoria; um terceiro cético
         deve conseguir refazer a conta e chegar ao mesmo resultado.

      5. MOTOR DUPLO
         Retorno comercial e retorno social são acompanhados separadamente, com naturezas
         de custo diferentes (custo fixo IMTS vs. custo variável externalizado).`,
      tags: ["FAQ", "diferenciais", "comparação", "vantagens", "s-roi honesto"]
    },
    comomecar: {
      titulo: "FAQ: Como começar com o Impact7?",
      conteudo: `PERGUNTA: Como começar com o Impact7?

      RESPOSTA:
      Como o método está em fase de piloto, o caminho de entrada hoje é diferente do de um
      produto maduro:

      1. ENTENDER O MÉTODO
         Compreender o Funil IVE (maturidade do ativo) e o Funil IMPACTA (profundidade de
         engajamento) — são os dois eixos que organizam qualquer iniciativa no método.

      2. IDENTIFICAR UM ATIVO
         Definir qual ativo (curso, tecnologia, comunidade, serviço) sua organização já tem
         ou pode construir rapidamente, que sirva de base para medir impacto real.

      3. CONVERSAR COM A EQUIPE DO ECOSSISTEMA IMTS
         Para avaliar se sua iniciativa se encaixa na fase de piloto atual, ou aguardar a
         próxima fase de abertura do método.

      Este assistente não substitui essa conversa direta — ele pode explicar o método e
      simular ilustrativamente o cálculo de S-ROI, mas decisões de parceria e escopo
      dependem da equipe humana.`,
      tags: ["FAQ", "começar", "primeiros passos", "início", "piloto"]
    },
    calculadora: {
      titulo: "FAQ: Como funciona a simulação de S-ROI do Jarvis?",
      conteudo: `PERGUNTA: Como funciona a calculadora/simulação de S-ROI do Jarvis?

      RESPOSTA:
      A simulação usa exatamente a mesma fórmula do S-ROI honesto usada no motor de
      mensuração real da plataforma (shared/sroi-calculator.ts):

      valorSocialBruto = gatilhos × valorGatilho + transformações × valorTransformação
      fatorDesconto = atribuição × (1 − deadweight) × (1 − dropOff)
      S-ROI = (valorSocialBruto × fatorDesconto) / custoImts

      PARÂMETROS DE ENTRADA (todos definidos por quem está simulando, não vêm do banco):
      - Gatilhos e transformações estimados
      - Valor por gatilho e valor por transformação (em reais)
      - Percentual de atribuição, deadweight e drop-off
      - Custo fixo IMTS estimado (em reais)

      MUITO IMPORTANTE: essa é uma SIMULAÇÃO ILUSTRATIVA com números hipotéticos que a
      pessoa usuária informa. Ela não lê nem grava nada no banco de dados, não corresponde a
      nenhuma iniciativa real registrada na plataforma, e o resultado nunca deve ser tratado
      como um S-ROI auditado de fato.`,
      tags: ["FAQ", "calculadora", "simulação", "s-roi", "ilustrativo"]
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
    return "Não encontrei informações específicas sobre esse tema na base de conhecimento do Impact7.";
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
