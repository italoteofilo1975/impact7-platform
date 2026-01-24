/**
 * Jarvis AI Service
 * Assistente inteligente do IMPACT7 com RAG e skills especializadas
 */

import { invokeLLM } from "../../_core/llm";
import { llmCircuitBreaker, CircuitBreakerError } from "../../middleware/circuit-breaker";
import { getContextForLLM, searchKnowledge } from "./knowledge-base";

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

export interface CalculatorInput {
  investment: number;
  contextScore: number;
  resistanceScore: number;
  beneficiaries: number;
  duration: number;
}

// System prompt do Jarvis - RESTRITO AO ESCOPO IMPACT7
const JARVIS_SYSTEM_PROMPT = `Você é o Jarvis, o assistente inteligente EXCLUSIVO do Método IMPACT7 e da plataforma IMPACT7.

SOBRE VOCÊ:
- Você é especialista APENAS em impacto social, metodologia IMPACT7, SET7 e transformação organizacional
- Você tem acesso à base de conhecimento completa do IMPACT7
- Você pode calcular o S-ROI de projetos usando a equação I = (E × C⁷) / R
- Você oferece mentoria personalizada para organizações de impacto

SUAS CAPACIDADES:
1. CONHECIMENTO: Responder perguntas sobre o Método IMPACT7, SET7, seus pilares, equações e aplicações
2. CALCULADORA: Calcular o S-ROI e índice de impacto de projetos
3. MENTORIA: Oferecer orientação estratégica para maximizar impacto social
4. ANÁLISE: Analisar casos e sugerir melhorias baseadas no método
5. PLATAFORMA: Explicar funcionalidades da plataforma IMPACT7, planos, preços e recursos

RESTRIÇÕES IMPORTANTES - VOCÊ NÃO DEVE:
- Responder perguntas que NÃO estejam relacionadas ao IMPACT7, SET7, impacto social ou à plataforma
- Fornecer informações sobre outros assuntos como programação geral, receitas, entretenimento, etc.
- Ajudar com tarefas que não sejam relacionadas ao escopo do IMPACT7
- Inventar informações sobre o método - use apenas a base de conhecimento

QUANDO RECEBER PERGUNTAS FORA DO ESCOPO:
- Educadamente informe que você é especializado EXCLUSIVAMENTE em IMPACT7 e impacto social
- NÃO tente responder parcialmente - redirecione completamente para o escopo
- Sugira reformular a pergunta relacionando ao contexto de impacto social
- Ofereça ajuda com temas relacionados ao IMPACT7
- NUNCA forneça código de programação, receitas, piadas ou conteúdo não relacionado

EXEMPLOS DE RESPOSTAS PARA PERGUNTAS FORA DO ESCOPO:
- "Como programar em Python?" → "Sou especializado em impacto social e metodologia IMPACT7. Posso ajudá-lo a calcular o S-ROI do seu projeto ou explicar os 7 pilares do método."
- "Qual a receita de bolo?" → "Minha especialidade é transformar organizações de impacto social. Posso ajudar com análise de projetos sociais ou mentoria estratégica."
- "Conte uma piada" → "Prefiro focar em gerar impacto positivo! Posso explicar como o Método IMPACT7 já transformou mais de 500 organizações."

TEMAS PERMITIDOS:
- Método IMPACT7 e seus 7 pilares (Imersão, Mapeamento, Prototipação, Avaliação, Consolidação, Transformação, Iteração)
- SET7 (Sistema de Engenharia de Transformação)
- Cálculo de S-ROI e impacto social
- Gestão de projetos de impacto
- ESG, ODS, sustentabilidade
- Investimento de impacto
- Empreendedorismo social
- Funcionalidades da plataforma IMPACT7
- Planos e preços da plataforma
- Casos de sucesso e cases de impacto

DIRETRIZES:
- Seja sempre útil, preciso e empático
- Use linguagem clara e acessível
- Quando relevante, cite os pilares ou conceitos do IMPACT7
- Se não souber algo DENTRO do escopo, admita e sugira onde encontrar a informação
- Mantenha foco EXCLUSIVO em impacto social e transformação positiva

FORMATO DE RESPOSTA:
- Use markdown para formatação
- Destaque conceitos importantes em **negrito**
- Use listas quando apropriado
- Seja conciso mas completo`;

// Skills do Jarvis
export const jarvisSkills = {
  // Skill: Calculadora de Impacto
  calculator: async (input: CalculatorInput): Promise<JarvisResponse> => {
    const { investment, contextScore, resistanceScore, beneficiaries, duration } = input;
    
    // Normalizar scores (0-10 para 0-1)
    const C = contextScore / 10;
    const R = Math.max(resistanceScore / 10, 0.1); // Evitar divisão por zero
    
    // Calcular impacto: I = (E × C⁷) / R
    const impactScore = Math.round((investment * Math.pow(C, 7)) / R);
    
    // Calcular valor social estimado
    const socialValue = Math.round(impactScore * beneficiaries * (duration / 12));
    
    // Calcular S-ROI
    const sRoi = Math.round((socialValue / investment) * 10) / 10;
    
    // Classificar resultado
    let rating: string;
    let recommendation: string;
    
    if (sRoi >= 10) {
      rating = "Excelente";
      recommendation = "Projeto com potencial excepcional! Considere escalar e documentar como case de sucesso.";
    } else if (sRoi >= 7) {
      rating = "Muito Bom";
      recommendation = "Projeto bem alinhado com os princípios IMPACT7. Foque em manter o contexto preservado.";
    } else if (sRoi >= 5) {
      rating = "Bom";
      recommendation = "Bom potencial. Revise o pilar de Imersão para aumentar o alinhamento contextual.";
    } else if (sRoi >= 3) {
      rating = "Moderado";
      recommendation = "Há espaço para melhoria. Recomendamos aplicar o ciclo completo de Iteração.";
    } else {
      rating = "Baixo";
      recommendation = "Alto risco de desperdício de recursos. Recomendamos voltar à fase de Imersão.";
    }
    
    const message = `## Resultado da Análise de Impacto

### Métricas Calculadas
| Métrica | Valor |
|---------|-------|
| **Índice de Impacto** | ${impactScore.toLocaleString('pt-BR')} |
| **S-ROI Estimado** | ${sRoi}x |
| **Valor Social Projetado** | R$ ${socialValue.toLocaleString('pt-BR')} |
| **Classificação** | **${rating}** |

### Equação Aplicada
\`I = (E × C⁷) / R\`
- E (Investimento): R$ ${investment.toLocaleString('pt-BR')}
- C (Contexto): ${contextScore}/10 → ${C.toFixed(2)}
- R (Resistência): ${resistanceScore}/10 → ${R.toFixed(2)}

### Recomendação
${recommendation}

### Benchmarks de Referência
- S-ROI Mínimo Recomendado: **7x**
- S-ROI Médio (Projetos Sociais): **3-4x**
- S-ROI Top 10% (IMPACT7): **12x+**`;

    return {
      message,
      skill: "calculator",
      data: {
        impactScore,
        sRoi,
        socialValue,
        rating,
        recommendation
      }
    };
  },

  // Skill: Mentoria
  mentorship: async (topic: string, context: string): Promise<JarvisResponse> => {
    const knowledgeContext = getContextForLLM(topic);
    
    const messages: JarvisMessage[] = [
      { role: "system", content: JARVIS_SYSTEM_PROMPT },
      { role: "system", content: knowledgeContext },
      { 
        role: "user", 
        content: `Preciso de mentoria sobre: ${topic}\n\nContexto adicional: ${context}\n\nPor favor, forneça orientação estratégica baseada no Método IMPACT7.`
      }
    ];
    
    const response = await invokeLLM({ messages });
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
    const report = `# Relatório de Impacto IMPACT7

## Dados do Projeto
${Object.entries(projectData).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

## Análise Metodológica

### Alinhamento com os 7 Pilares
Este relatório foi gerado automaticamente pelo Jarvis, assistente do Método IMPACT7.

### Recomendações
1. Revise periodicamente os indicadores de impacto
2. Mantenha a documentação do Context Lake atualizada
3. Realize ciclos de iteração a cada 77 dias

---
*Gerado por Jarvis AI - Método IMPACT7*
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
  conversationHistory: JarvisMessage[] = []
): Promise<JarvisResponse> {
  // Detectar intenção e skill
  const lowerMessage = userMessage.toLowerCase();
  
  // Detectar pedido de cálculo
  if (
    lowerMessage.includes("calcul") ||
    lowerMessage.includes("s-roi") ||
    lowerMessage.includes("impacto") && lowerMessage.includes("projeto")
  ) {
    // Extrair números da mensagem se houver
    const numbers = userMessage.match(/\d+/g);
    if (numbers && numbers.length >= 3) {
      return jarvisSkills.calculator({
        investment: parseInt(numbers[0]) || 100000,
        contextScore: Math.min(parseInt(numbers[1]) || 5, 10),
        resistanceScore: Math.min(parseInt(numbers[2]) || 3, 10),
        beneficiaries: parseInt(numbers[3]) || 1000,
        duration: parseInt(numbers[4]) || 12
      });
    }
  }
  
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
    // Executar LLM com circuit breaker para resiliência
    const response = await llmCircuitBreaker.execute(() => invokeLLM({ messages }));
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
    console.error("[Jarvis] Error:", error);
    
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
    "O que é o Método IMPACT7?",
    "Como calcular o S-ROI do meu projeto?",
    "Explique a equação I = (E × C⁷) / R",
    "Quais são os 7 pilares do IMPACT7?",
    "Como aplicar o pilar da Imersão?",
    "O que é o Context Lake?",
    "Como medir impacto social?",
    "Qual a diferença entre output e outcome?"
  ];
}
