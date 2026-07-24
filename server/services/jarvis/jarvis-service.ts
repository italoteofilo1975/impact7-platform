/**
 * Jarvis AI Service
 * Assistente inteligente do Método Impact7 com RAG e skills especializadas
 */

import { invokeLLM } from "../../_core/llm";
import type { LlmProvider } from "../../_core/llm";
import { llmCircuitBreaker, CircuitBreakerError } from "../../middleware/circuit-breaker";
import { getContextForLLM, searchKnowledge } from "./knowledge-base";
import { calcSroi } from "../../../shared/sroi-calculator";

// Tipos
export interface JarvisMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface JarvisResponse {
  message: string;
  sources?: string[];
  skill?: string;
  data?: Record<string, unknown>;
}

// Entrada da simulação ilustrativa de S-ROI do Jarvis. Unidades amigáveis para quem
// digita (reais, percentuais 0-100) — convertidas para as unidades de calcSroi (centavos,
// bps) antes de chamar a função pura compartilhada com o motor real (shared/sroi-calculator.ts).
// Isto NUNCA toca no banco nem em nenhuma iniciativa real: é so uma simulacao com os
// numeros que a pessoa usuaria informar.
export interface CalculatorInput {
  gatilhos: number;
  transformacoes: number;
  valorGatilhoReais: number;
  valorTransformacaoReais: number;
  atribuicaoPercent: number; // 0-100
  deadweightPercent?: number; // 0-100, default 0
  dropOffPercent?: number; // 0-100, default 0
  custoImtsReais: number;
}

// System prompt do Jarvis - RESTRITO AO ESCOPO IMPACT7
const JARVIS_SYSTEM_PROMPT = `Você é o Jarvis, o assistente inteligente EXCLUSIVO do Método Impact7 e da plataforma Impact7.

SOBRE VOCÊ:
- Você é especialista APENAS no Método Impact7, impacto social e transformação organizacional através de ativos exponenciais
- Você tem acesso à base de conhecimento do Impact7: Funil IVE, Funil IMPACTA, Motor Duplo, S-ROI honesto e Bifurcação de Capital
- Você pode simular ilustrativamente o S-ROI de uma iniciativa usando a fórmula honesta do método (gatilhos, transformações, atribuição, deadweight, drop-off)
- Você oferece mentoria estratégica baseada no método

SOBRE O MÉTODO (use isso, e só isso, para falar de conceitos):
- O Impact7 é uma fábrica de ativos exponenciais: a unidade central é o ATIVO (curso, tecnologia, comunidade, serviço), não a pessoa
- Funil IVE: os 7 estágios de maturidade de um ativo — Origem, Ideação, Validação, Prototipação, Produtização, Operação, Escala
- Funil IMPACTA: os 7 níveis de engajamento de uma pessoa — Informar, Motivar, Preparar (limiar de impacto), Ativar, Conectar, Transformar, Amplificar
- Camadas acima do limiar: impacto (níveis 3-5), transformação (nível 6, subconjunto medido), esteira (nível 7, projeção — nunca somada ao S-ROI oficial)
- Motor Duplo: trilha comercial (meta ~10x) e trilha social (meta ~100x, via Instituto Expand)
- S-ROI honesto: valorSocialBruto = gatilhos×valorGatilho + transformações×valorTransformação, descontado por atribuição × (1-deadweight) × (1-dropOff), dividido pelo custo fixo IMTS. Faixa realista: 3x a 10x
- Bifurcação de Capital: rubrica de 5 critérios ponderados que decide se uma iniciativa madura fica no ecossistema ou vira spin-off
- O método está em fase de PILOTO (o "Piloto Jornada Impact7") — não invente números de clientes, faturamento ou casos de sucesso que não estão na base de conhecimento

SUAS CAPACIDADES:
1. CONHECIMENTO: Responder perguntas sobre o Método Impact7 (Funil IVE, Funil IMPACTA, Motor Duplo, S-ROI honesto, Bifurcação de Capital)
2. CALCULADORA: Simular ilustrativamente o S-ROI de uma iniciativa hipotética
3. MENTORIA: Oferecer orientação estratégica baseada no método
4. PLATAFORMA: Explicar funcionalidades da plataforma Impact7

RESTRIÇÕES IMPORTANTES - VOCÊ NÃO DEVE:
- Responder perguntas que NÃO estejam relacionadas ao Impact7, impacto social ou à plataforma
- Fornecer informações sobre outros assuntos como programação geral, receitas, entretenimento, etc.
- Ajudar com tarefas que não sejam relacionadas ao escopo do Impact7
- Inventar informações sobre o método - use apenas a base de conhecimento
- Inventar números de clientes, faturamento, casos de sucesso ou resultados de S-ROI reais - o método está em fase de piloto
- Apresentar qualquer resultado da calculadora como se fosse um S-ROI auditado real: é sempre uma simulação ilustrativa

QUANDO RECEBER PERGUNTAS FORA DO ESCOPO:
- Educadamente informe que você é especializado EXCLUSIVAMENTE em Impact7 e impacto social
- NÃO tente responder parcialmente - redirecione completamente para o escopo
- Sugira reformular a pergunta relacionando ao contexto de impacto social
- Ofereça ajuda com temas relacionados ao Impact7
- NUNCA forneça código de programação, receitas, piadas ou conteúdo não relacionado

EXEMPLOS DE RESPOSTAS PARA PERGUNTAS FORA DO ESCOPO:
- "Como programar em Python?" → "Sou especializado no Método Impact7 e impacto social. Posso ajudá-lo a entender o Funil IVE, o Funil IMPACTA ou simular ilustrativamente um S-ROI."
- "Qual a receita de bolo?" → "Minha especialidade é o Método Impact7. Posso ajudar com o Motor Duplo, o S-ROI honesto ou mentoria estratégica de impacto."
- "Conte uma piada" → "Prefiro focar em impacto! Posso explicar como funciona o Funil IMPACTA e o limiar de impacto do método."

TEMAS PERMITIDOS:
- Método Impact7: Funil IVE, Funil IMPACTA, Motor Duplo, S-ROI honesto, Bifurcação de Capital
- Gestão de ativos e iniciativas de impacto
- ESG, ODS, sustentabilidade
- Investimento de impacto
- Empreendedorismo social
- Funcionalidades da plataforma Impact7
- O piloto atual do método (Jornada Impact7)

DIRETRIZES:
- Seja sempre útil, preciso e empático
- Use linguagem clara e acessível
- Quando relevante, cite os conceitos exatos do Impact7 (funis, camadas, fórmula)
- Se não souber algo DENTRO do escopo, admita e sugira onde encontrar a informação
- Mantenha foco EXCLUSIVO em impacto social e transformação positiva
- Nunca apresente números hipotéticos como se fossem dados reais auditados

FORMATO DE RESPOSTA:
- Use markdown para formatação
- Destaque conceitos importantes em **negrito**
- Use listas quando apropriado
- Seja conciso mas completo`;

function clampPercent(value: number | undefined): number {
  if (value === undefined || Number.isNaN(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
}

// Skills do Jarvis
export const jarvisSkills = {
  // Skill: Simulação ilustrativa de S-ROI
  calculator: async (input: CalculatorInput): Promise<JarvisResponse> => {
    const atribuicaoBps = Math.round(clampPercent(input.atribuicaoPercent) * 100);
    const deadweightBps = Math.round(clampPercent(input.deadweightPercent) * 100);
    const dropOffBps = Math.round(clampPercent(input.dropOffPercent) * 100);

    const calculo = calcSroi({
      gatilhos: Math.max(0, Math.round(input.gatilhos)),
      transformacoes: Math.max(0, Math.round(input.transformacoes)),
      valorGatilhoCents: Math.round(input.valorGatilhoReais * 100),
      valorTransformacaoCents: Math.round(input.valorTransformacaoReais * 100),
      atribuicaoBps,
      deadweightBps,
      dropOffBps,
      custoImtsCents: Math.round(input.custoImtsReais * 100),
    });

    const fmt = (n: number) =>
      n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    let rating: string;
    if (calculo.sroi >= 10) {
      rating = "Acima da faixa realista (revisar premissas de valor)";
    } else if (calculo.sroi >= 7) {
      rating = "Muito Bom";
    } else if (calculo.sroi >= 5) {
      rating = "Bom";
    } else if (calculo.sroi >= 3) {
      rating = "Dentro da faixa esperada";
    } else {
      rating = "Abaixo da faixa esperada";
    }

    const message = `## Simulação Ilustrativa de S-ROI

> **Atenção:** isto é uma simulação com números hipotéticos informados por você. Não é um S-ROI auditado, não veio do banco de dados e não corresponde a nenhuma iniciativa real da plataforma.

### Memória de cálculo
| Item | Valor |
|---|---|
| Gatilhos | ${calculo.gatilhos} |
| Transformações | ${calculo.transformacoes} |
| Valor social bruto | R$ ${fmt(calculo.valorSocialBruto)} |
| Fator de desconto (atribuição × (1-deadweight) × (1-dropOff)) | ${(calculo.fatorDesconto * 100).toFixed(1)}% |
| Valor social (após desconto) | R$ ${fmt(calculo.valorSocial)} |
| Custo IMTS | R$ ${fmt(calculo.custo)} |
| **S-ROI simulado** | **${calculo.sroi.toFixed(2)}x** |
| Alavancagem (gatilhos atribuíveis / custo, sempre como faixa) | ${calculo.alavancagemLow.toFixed(4)} a ${calculo.alavancagemHigh.toFixed(4)} |
| Faixa de sensibilidade | ${calculo.sensibilidade.sroiLow.toFixed(2)}x – ${calculo.sensibilidade.sroiHigh.toFixed(2)}x |

### Classificação (ilustrativa)
${rating}

### Referência do método
A faixa realista de S-ROI honesto (após os três descontos) é de **3x a 10x**. Um resultado
de duas dezenas de vezes normalmente indica que os proxies de valor por gatilho ou por
transformação estão otimistas demais — vale revisar as premissas, não comemorar o número.`;

    return {
      message,
      skill: "calculator",
      data: {
        ...calculo,
        rating,
        illustrative: true,
      }
    };
  },

  // Skill: Mentoria
  mentorship: async (topic: string, context: string, provider?: LlmProvider): Promise<JarvisResponse> => {
    const knowledgeContext = getContextForLLM(topic);

    const messages: JarvisMessage[] = [
      { role: "system", content: JARVIS_SYSTEM_PROMPT },
      { role: "system", content: knowledgeContext },
      {
        role: "user",
        content: `Preciso de mentoria sobre: ${topic}\n\nContexto adicional: ${context}\n\nPor favor, forneça orientação estratégica baseada no Método Impact7.`
      }
    ];

    const response = await invokeLLM({ messages, provider });
    const rawContent = response.choices[0]?.message?.content;
    const assistantMessage = typeof rawContent === 'string' ? rawContent : "Desculpe, não consegui processar sua solicitação.";

    return {
      message: assistantMessage,
      skill: "mentorship",
      sources: searchKnowledge(topic, 3).map(doc => doc.titulo)
    };
  },

  // Skill: Exportação de Relatório
  exportReport: async (projectData: Record<string, unknown>): Promise<JarvisResponse> => {
    const report = `# Relatório Impact7

## Dados do Projeto
${Object.entries(projectData).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

## Análise Metodológica

### Posição no Funil IVE / Funil IMPACTA
Este relatório foi gerado automaticamente pelo Jarvis, assistente do Método Impact7.
Nenhum número acima que não venha explicitamente dos dados do projeto informado deve ser
tratado como medição auditada.

### Recomendações
1. Revise periodicamente os indicadores de engajamento (Funil IMPACTA) e de maturidade do ativo (Funil IVE)
2. Mantenha a trilha de auditoria do S-ROI atualizada
3. Reavalie o fator de desconto (atribuição, deadweight, drop-off) a cada ciclo de medição

---
*Gerado por Jarvis AI - Método Impact7*
*Data: ${new Date().toLocaleDateString('pt-BR')}*`;

    return {
      message: report,
      skill: "export",
      data: { format: "markdown", generatedAt: new Date().toISOString() }
    };
  }
};

// Função principal de chat do Jarvis
export async function chatWithJarvis(
  userMessage: string,
  conversationHistory: JarvisMessage[] = [],
  provider?: LlmProvider
): Promise<JarvisResponse> {
  // Buscar contexto relevante na base de conhecimento
  const knowledgeContext = getContextForLLM(userMessage);

  // Construir mensagens para o LLM
  const messages: JarvisMessage[] = [
    { role: "system", content: JARVIS_SYSTEM_PROMPT },
    { role: "system", content: knowledgeContext },
    ...conversationHistory.slice(-10), // Últimas 10 mensagens
    { role: "user", content: userMessage }
  ];

  try {
    console.log("[Jarvis] Iniciando chat com mensagem:", userMessage);
    console.log("[Jarvis] Histórico de mensagens:", conversationHistory.length);

    // Executar LLM com circuit breaker para resiliência
    console.log("[Jarvis] Executando LLM via circuit breaker...");
    const response = await llmCircuitBreaker.execute(() => invokeLLM({ messages, provider }));
    console.log("[Jarvis] Resposta do LLM recebida com sucesso");
    const rawContent = response.choices[0]?.message?.content;
    const assistantMessage = typeof rawContent === 'string' ? rawContent :
      "Desculpe, não consegui processar sua solicitação. Por favor, tente novamente.";

    // Identificar fontes usadas
    const relevantDocs = searchKnowledge(userMessage, 3);
    const sources = relevantDocs.map(doc => doc.titulo);

    return {
      message: assistantMessage,
      sources: sources.length > 0 ? sources : undefined
    };
  } catch (error) {
    console.error("[Jarvis] Erro capturado:", error);
    console.error("[Jarvis] Stack trace:", error instanceof Error ? error.stack : 'N/A');
    console.error("[Jarvis] Tipo de erro:", error instanceof CircuitBreakerError ? 'CircuitBreakerError' : error?.constructor?.name);

    // Verificar se é erro do circuit breaker
    if (error instanceof CircuitBreakerError) {
      return {
        message: "O serviço de IA está temporariamente indisponível devido a alta demanda. Por favor, tente novamente em alguns instantes. Enquanto isso, você pode explorar nossa documentação ou usar a calculadora de impacto."
      };
    }

    return {
      message: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente em alguns instantes."
    };
  }
}

// Função para obter sugestões de perguntas
export function getSuggestedQuestions(): string[] {
  return [
    "O que é o Método Impact7?",
    "O que é o Funil IVE?",
    "Como funciona o Funil IMPACTA e o limiar de impacto?",
    "O que é o Motor Duplo?",
    "Como funciona o S-ROI honesto e seus três descontos?",
    "O que é a Bifurcação de Capital?",
    "O que diferencia gatilho, transformação e esteira?",
    "Como está o piloto atual do Impact7?"
  ];
}
