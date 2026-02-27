/**
 * SET7 TokensOps Service
 * Disciplina de tokens com budgets, circuit breakers e alertas
 * 
 * Conforme SET7 V3.0 - Apêndice D (Estratégia de Tokens)
 */

import { getDb } from "../../db";
import { set7TokenBudgets } from "../../../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logAuditEvent } from "./tasklog-service";

// Tipos
export type BudgetScope = "project" | "phase" | "flow" | "agent" | "user";
export type PeriodType = "daily" | "weekly" | "monthly" | "project" | "unlimited";
export type BudgetStatus = "active" | "warning" | "critical" | "exceeded" | "paused";

// Custos por modelo (USD por 1M tokens)
export const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.50, output: 10.00 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "gpt-4-turbo": { input: 10.00, output: 30.00 },
  "gpt-3.5-turbo": { input: 0.50, output: 1.50 },
  "claude-3-opus": { input: 15.00, output: 75.00 },
  "claude-3-sonnet": { input: 3.00, output: 15.00 },
  "claude-3-haiku": { input: 0.25, output: 1.25 },
  "claude-3.5-sonnet": { input: 3.00, output: 15.00 },
};

export interface CreateBudgetInput {
  scope: BudgetScope;
  scopeId: string;
  scopeName: string;
  budgetTokens: number;
  budgetUsd: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  periodType: PeriodType;
  periodStart?: Date;
  periodEnd?: Date;
}

export interface TokenUsageInput {
  budgetId: string;
  tokensInput: number;
  tokensOutput: number;
  modelUsed: string;
}

/**
 * Calcular custo em USD baseado no modelo e tokens
 */
export function calculateCost(tokensInput: number, tokensOutput: number, modelUsed: string): number {
  const costs = MODEL_COSTS[modelUsed] || MODEL_COSTS["gpt-4o"];
  const inputCost = (tokensInput / 1_000_000) * costs.input;
  const outputCost = (tokensOutput / 1_000_000) * costs.output;
  return Math.round((inputCost + outputCost) * 100); // Retorna em centavos
}

/**
 * Criar novo budget de tokens
 */
export async function createBudget(input: CreateBudgetInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const budgetId = `budget_${randomUUID().replace(/-/g, "").substring(0, 16)}`;
  
  const [budget] = await db.insert(set7TokenBudgets).values({
    budgetId,
    scope: input.scope,
    scopeId: input.scopeId,
    scopeName: input.scopeName,
    budgetTokens: input.budgetTokens,
    budgetUsd: input.budgetUsd,
    warningThreshold: input.warningThreshold || 80,
    criticalThreshold: input.criticalThreshold || 95,
    periodType: input.periodType,
    periodStart: input.periodStart ? (input.periodStart instanceof Date ? input.periodStart.getTime() : input.periodStart) : undefined,
    periodEnd: input.periodEnd ? (input.periodEnd instanceof Date ? input.periodEnd.getTime() : input.periodEnd) : undefined,
    status: "active",
    updatedAt: Date.now(),
    createdAt: Date.now(),
  }).$returningId();

  return { budgetId, id: budget.id };
}

/**
 * Registrar uso de tokens e verificar limites
 */
export async function recordTokenUsage(input: TokenUsageInput): Promise<{
  success: boolean;
  budgetStatus: BudgetStatus;
  usagePercentage: number;
  circuitBreakerTriggered: boolean;
  message?: string;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [budget] = await db.select()
    .from(set7TokenBudgets)
    .where(eq(set7TokenBudgets.budgetId, input.budgetId));
  
  if (!budget) {
    return {
      success: false,
      budgetStatus: "active",
      usagePercentage: 0,
      circuitBreakerTriggered: false,
      message: "Budget not found",
    };
  }
  
  // Verificar se circuit breaker já foi acionado
  if (budget.circuitBreakerTriggered) {
    return {
      success: false,
      budgetStatus: "exceeded",
      usagePercentage: 100,
      circuitBreakerTriggered: true,
      message: "Circuit breaker ativo - consumo bloqueado",
    };
  }
  
  // Calcular novos valores
  const tokensUsed = input.tokensInput + input.tokensOutput;
  const costUsd = calculateCost(input.tokensInput, input.tokensOutput, input.modelUsed);
  
  const newUsedTokens = budget.usedTokens + tokensUsed;
  const newUsedUsd = budget.usedUsd + costUsd;
  
  // Calcular porcentagem de uso
  const tokenPercentage = (newUsedTokens / budget.budgetTokens) * 100;
  const usdPercentage = (newUsedUsd / budget.budgetUsd) * 100;
  const usagePercentage = Math.max(tokenPercentage, usdPercentage);
  
  // Determinar novo status
  let newStatus: BudgetStatus = "active";
  let circuitBreakerTriggered = false;
  
  if (usagePercentage >= 100) {
    newStatus = "exceeded";
    circuitBreakerTriggered = true;
    
    await logAuditEvent({
      eventType: "budget_exceeded",
      description: `Budget excedido: ${budget.scopeName}`,
      details: { 
        budgetId: input.budgetId, 
        usagePercentage,
        usedTokens: newUsedTokens,
        budgetTokens: budget.budgetTokens,
      },
      severity: "critical",
    });
  } else if (usagePercentage >= budget.criticalThreshold) {
    newStatus = "critical";
    
    await logAuditEvent({
      eventType: "budget_warning",
      description: `Budget em nível crítico: ${budget.scopeName}`,
      details: { budgetId: input.budgetId, usagePercentage },
      severity: "error",
    });
  } else if (usagePercentage >= budget.warningThreshold) {
    newStatus = "warning";
    
    await logAuditEvent({
      eventType: "budget_warning",
      description: `Budget em alerta: ${budget.scopeName}`,
      details: { budgetId: input.budgetId, usagePercentage },
      severity: "warning",
    });
  }
  
  // Atualizar budget
  await db.update(set7TokenBudgets)
    .set({
      usedTokens: newUsedTokens,
      usedUsd: newUsedUsd,
      status: newStatus,
      circuitBreakerTriggered: circuitBreakerTriggered ? 1 : 0,
      circuitBreakerAt: circuitBreakerTriggered ? Date.now() : undefined,
      circuitBreakerReason: circuitBreakerTriggered ? "Budget limit exceeded" : undefined,
    })
    .where(eq(set7TokenBudgets.budgetId, input.budgetId));

  return {
    success: !circuitBreakerTriggered,
    budgetStatus: newStatus,
    usagePercentage: Math.round(usagePercentage),
    circuitBreakerTriggered,
    message: circuitBreakerTriggered 
      ? "Circuit breaker acionado - consumo bloqueado"
      : newStatus === "critical"
        ? "Atenção: budget em nível crítico"
        : newStatus === "warning"
          ? "Alerta: budget acima do limite de aviso"
          : undefined,
  };
}

/**
 * Verificar se pode consumir tokens (pré-check)
 */
export async function canConsumeTokens(budgetId: string, estimatedTokens: number): Promise<{
  allowed: boolean;
  reason?: string;
  currentUsage: number;
  remainingTokens: number;
}> {
  const db = await getDb();
  if (!db) return { allowed: false, reason: "Database not available", currentUsage: 0, remainingTokens: 0 };
  
  const [budget] = await db.select()
    .from(set7TokenBudgets)
    .where(eq(set7TokenBudgets.budgetId, budgetId));
  
  if (!budget) {
    return { allowed: false, reason: "Budget not found", currentUsage: 0, remainingTokens: 0 };
  }
  
  if (budget.circuitBreakerTriggered) {
    return { 
      allowed: false, 
      reason: "Circuit breaker ativo", 
      currentUsage: 100,
      remainingTokens: 0,
    };
  }
  
  if (budget.status === "paused") {
    return { 
      allowed: false, 
      reason: "Budget pausado", 
      currentUsage: Math.round((budget.usedTokens / budget.budgetTokens) * 100),
      remainingTokens: budget.budgetTokens - budget.usedTokens,
    };
  }
  
  const remainingTokens = budget.budgetTokens - budget.usedTokens;
  
  if (estimatedTokens > remainingTokens) {
    return {
      allowed: false,
      reason: `Tokens insuficientes: necessário ${estimatedTokens}, disponível ${remainingTokens}`,
      currentUsage: Math.round((budget.usedTokens / budget.budgetTokens) * 100),
      remainingTokens,
    };
  }
  
  return {
    allowed: true,
    currentUsage: Math.round((budget.usedTokens / budget.budgetTokens) * 100),
    remainingTokens,
  };
}

/**
 * Buscar budget por ID
 */
export async function getBudget(budgetId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [budget] = await db.select()
    .from(set7TokenBudgets)
    .where(eq(set7TokenBudgets.budgetId, budgetId));
  
  if (budget) {
    return {
      ...budget,
      usagePercentage: Math.round((budget.usedTokens / budget.budgetTokens) * 100),
      usdUsagePercentage: Math.round((budget.usedUsd / budget.budgetUsd) * 100),
      remainingTokens: budget.budgetTokens - budget.usedTokens,
      remainingUsd: budget.budgetUsd - budget.usedUsd,
    };
  }
  
  return null;
}

/**
 * Listar budgets
 */
export async function listBudgets(filters?: {
  scope?: BudgetScope;
  status?: BudgetStatus;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const budgets = await db.select()
    .from(set7TokenBudgets)
    .orderBy(desc(set7TokenBudgets.createdAt))
    .limit(filters?.limit || 100)
    .offset(filters?.offset || 0);

  return budgets.map((budget) => ({
    ...budget,
    usagePercentage: Math.round((budget.usedTokens / budget.budgetTokens) * 100),
    usdUsagePercentage: Math.round((budget.usedUsd / budget.budgetUsd) * 100),
    remainingTokens: budget.budgetTokens - budget.usedTokens,
    remainingUsd: budget.budgetUsd - budget.usedUsd,
  }));
}

/**
 * Resetar circuit breaker
 */
export async function resetCircuitBreaker(budgetId: string, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(set7TokenBudgets)
    .set({
      circuitBreakerTriggered: 0,
      circuitBreakerAt: null,
      circuitBreakerReason: null,
      status: "active",
    })
    .where(eq(set7TokenBudgets.budgetId, budgetId));

  await logAuditEvent({
    eventType: "circuit_breaker",
    description: `Circuit breaker resetado: ${reason}`,
    details: { budgetId },
    severity: "info",
  });

  return { success: true };
}

/**
 * Pausar budget
 */
export async function pauseBudget(budgetId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(set7TokenBudgets)
    .set({ status: "paused" })
    .where(eq(set7TokenBudgets.budgetId, budgetId));

  return { success: true };
}

/**
 * Reativar budget
 */
export async function resumeBudget(budgetId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [budget] = await db.select()
    .from(set7TokenBudgets)
    .where(eq(set7TokenBudgets.budgetId, budgetId));
  
  if (!budget) throw new Error("Budget not found");
  
  // Determinar status baseado no uso atual
  const usagePercentage = (budget.usedTokens / budget.budgetTokens) * 100;
  let newStatus: BudgetStatus = "active";
  
  if (usagePercentage >= 100) {
    newStatus = "exceeded";
  } else if (usagePercentage >= budget.criticalThreshold) {
    newStatus = "critical";
  } else if (usagePercentage >= budget.warningThreshold) {
    newStatus = "warning";
  }
  
  await db.update(set7TokenBudgets)
    .set({ status: newStatus })
    .where(eq(set7TokenBudgets.budgetId, budgetId));

  return { success: true, status: newStatus };
}

/**
 * Aumentar budget
 */
export async function increaseBudget(budgetId: string, additionalTokens: number, additionalUsd: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [budget] = await db.select()
    .from(set7TokenBudgets)
    .where(eq(set7TokenBudgets.budgetId, budgetId));
  
  if (!budget) throw new Error("Budget not found");
  
  const newBudgetTokens = budget.budgetTokens + additionalTokens;
  const newBudgetUsd = budget.budgetUsd + additionalUsd;
  
  // Recalcular status
  const usagePercentage = (budget.usedTokens / newBudgetTokens) * 100;
  let newStatus: BudgetStatus = "active";
  
  if (usagePercentage >= 100) {
    newStatus = "exceeded";
  } else if (usagePercentage >= budget.criticalThreshold) {
    newStatus = "critical";
  } else if (usagePercentage >= budget.warningThreshold) {
    newStatus = "warning";
  }
  
  await db.update(set7TokenBudgets)
    .set({
      budgetTokens: newBudgetTokens,
      budgetUsd: newBudgetUsd,
      status: newStatus,
      circuitBreakerTriggered: newStatus !== "exceeded" ? 0 : budget.circuitBreakerTriggered,
    })
    .where(eq(set7TokenBudgets.budgetId, budgetId));

  return { 
    success: true, 
    newBudgetTokens, 
    newBudgetUsd,
    status: newStatus,
  };
}

/**
 * Obter estatísticas globais de tokens
 */
export async function getTokensStats() {
  const db = await getDb();
  if (!db) return {
    totalBudgets: 0,
    totalBudgetTokens: 0,
    totalUsedTokens: 0,
    totalBudgetUsd: 0,
    totalUsedUsd: 0,
    globalUsagePercentage: 0,
    activeBudgets: 0,
    warningBudgets: 0,
    criticalBudgets: 0,
    exceededBudgets: 0,
  };
  
  const budgets = await db.select().from(set7TokenBudgets);
  
  const stats = {
    totalBudgets: budgets.length,
    totalBudgetTokens: budgets.reduce((sum, b) => sum + b.budgetTokens, 0),
    totalUsedTokens: budgets.reduce((sum, b) => sum + b.usedTokens, 0),
    totalBudgetUsd: budgets.reduce((sum, b) => sum + b.budgetUsd, 0),
    totalUsedUsd: budgets.reduce((sum, b) => sum + b.usedUsd, 0),
    globalUsagePercentage: 0,
    activeBudgets: budgets.filter(b => b.status === "active").length,
    warningBudgets: budgets.filter(b => b.status === "warning").length,
    criticalBudgets: budgets.filter(b => b.status === "critical").length,
    exceededBudgets: budgets.filter(b => b.status === "exceeded").length,
  };
  
  if (stats.totalBudgetTokens > 0) {
    stats.globalUsagePercentage = Math.round((stats.totalUsedTokens / stats.totalBudgetTokens) * 100);
  }
  
  return stats;
}

/**
 * Obter recomendação de modelo baseado no budget disponível
 */
export function recommendModel(budgetId: string, estimatedTokens: number, taskComplexity: "low" | "medium" | "high"): string {
  // Recomendação baseada na complexidade da tarefa
  switch (taskComplexity) {
    case "low":
      return "gpt-4o-mini"; // Mais econômico
    case "medium":
      return "gpt-4o"; // Balanceado
    case "high":
      return "gpt-4o"; // Alta qualidade
    default:
      return "gpt-4o";
  }
}
