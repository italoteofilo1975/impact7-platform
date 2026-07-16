/**
 * SET7 Agents Service
 * Arquitetura de Agentes com Kill Switch e permissões
 * 
 * Conforme SET7 V3.0 - Apêndice B (Arquitetura de Agentes)
 */

import { getDb } from "../../db";
import { set7Agents } from "../../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logAuditEvent } from "./tasklog-service";

// Tipos
export type AgentType = "vertical" | "horizontal" | "orchestrator";
export type HookType = "roi" | "tokens" | "quality" | "security" | "gtl";
export type AgentStatus = "active" | "paused" | "disabled" | "killed";

// Agentes Verticais (por fase SET7)
export const VERTICAL_AGENTS = {
  "agent-set7-01": { name: "Agente Estratégia", phase: "SET7.01", description: "Direção Estratégica, Escopo e Matriz de Intenção" },
  "agent-set7-02": { name: "Agente Arquitetura", phase: "SET7.02", description: "Domínio, Arquitetura e Decomposição Sistêmica" },
  "agent-set7-03": { name: "Agente Integração", phase: "SET7.03", description: "Contratos, APIs e Integrações por Hash/QR Code" },
  "agent-set7-04": { name: "Agente Segurança", phase: "SET7.04", description: "Segurança, Governança e Confiança" },
  "agent-set7-05": { name: "Agente Construção", phase: "SET7.05", description: "Construção Performática (Back, Front, Experiência)" },
  "agent-set7-06": { name: "Agente Operação", phase: "SET7.06", description: "Operação, Observabilidade e Eficiência Cognitiva" },
  "agent-set7-07": { name: "Agente Resiliência", phase: "SET7.07", description: "Resiliência, Continuidade e Evolução" },
};

// Agentes Horizontais (hooks transversais)
export const HORIZONTAL_AGENTS = {
  "agent-hook-roi": { name: "Hook ROI", hookType: "roi" as HookType, description: "Monitora ROI e valor entregue vs. custo" },
  "agent-hook-tokens": { name: "Hook Tokens", hookType: "tokens" as HookType, description: "Controla consumo de tokens e budgets" },
  "agent-hook-quality": { name: "Hook Quality", hookType: "quality" as HookType, description: "Valida qualidade dos artefatos" },
  "agent-hook-security": { name: "Hook Security", hookType: "security" as HookType, description: "Verifica conformidade de segurança" },
  "agent-hook-gtl": { name: "Hook GTL", hookType: "gtl" as HookType, description: "Gerencia Go-to-Live e deployment" },
};

export interface CreateAgentInput {
  name: string;
  description?: string;
  agentType: AgentType;
  phase?: string;
  hookType?: HookType;
  defaultModel?: string;
  allowedModels?: string[];
  maxTokensPerRequest?: number;
  maxTokensPerDay?: number;
  permissions?: string[];
  canReadFiles?: boolean;
  canWriteFiles?: boolean;
  canExecuteCode?: boolean;
  canAccessNetwork?: boolean;
  canAccessDatabase?: boolean;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  defaultModel?: string;
  allowedModels?: string[];
  maxTokensPerRequest?: number;
  maxTokensPerDay?: number;
  permissions?: string[];
  canReadFiles?: boolean;
  canWriteFiles?: boolean;
  canExecuteCode?: boolean;
  canAccessNetwork?: boolean;
  canAccessDatabase?: boolean;
  status?: AgentStatus;
}

/**
 * Criar novo agente
 */
export async function createAgent(input: CreateAgentInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const agentId = `agent_${randomUUID().replace(/-/g, "").substring(0, 16)}`;
  
  const [agent] = await db.insert(set7Agents).values({
    agentId,
    name: input.name,
    description: input.description,
    agentType: input.agentType,
    phase: input.phase,
    hookType: input.hookType,
    defaultModel: input.defaultModel || "gpt-4o",
    allowedModels: input.allowedModels ? JSON.stringify(input.allowedModels) : JSON.stringify(["gpt-4o", "gpt-4o-mini"]),
    maxTokensPerRequest: input.maxTokensPerRequest || 4000,
    maxTokensPerDay: input.maxTokensPerDay || 100000,
    permissions: input.permissions ? JSON.stringify(input.permissions) : null,
    canReadFiles: input.canReadFiles ? 1 : 0,
    canWriteFiles: input.canWriteFiles ? 1 : 0,
    canExecuteCode: input.canExecuteCode ? 1 : 0,
    canAccessNetwork: input.canAccessNetwork ? 1 : 0,
    canAccessDatabase: input.canAccessDatabase ? 1 : 0,
    status: "active",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }).returning({ id: set7Agents.id });

  await logAuditEvent({
    eventType: "agent_started",
    agentId,
    description: `Agente criado: ${input.name}`,
    details: { agentType: input.agentType, phase: input.phase },
    severity: "info",
  });

  return { agentId, id: agent.id };
}

/**
 * Buscar agente por ID
 */
export async function getAgent(agentId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [agent] = await db.select()
    .from(set7Agents)
    .where(eq(set7Agents.agentId, agentId));
  
  if (agent) {
    return {
      ...agent,
      allowedModels: agent.allowedModels ? JSON.parse(agent.allowedModels) : [],
      permissions: agent.permissions ? JSON.parse(agent.permissions) : [],
    };
  }
  
  return null;
}

/**
 * Listar agentes
 */
export async function listAgents(filters?: {
  agentType?: AgentType;
  status?: AgentStatus;
  phase?: string;
  hookType?: HookType;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const agents = await db.select()
    .from(set7Agents)
    .orderBy(desc(set7Agents.createdAt))
    .limit(filters?.limit || 100)
    .offset(filters?.offset || 0);

  return agents.map((agent) => ({
    ...agent,
    allowedModels: agent.allowedModels ? JSON.parse(agent.allowedModels) : [],
    permissions: agent.permissions ? JSON.parse(agent.permissions) : [],
  }));
}

/**
 * Atualizar agente
 */
export async function updateAgent(agentId: string, input: UpdateAgentInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(set7Agents)
    .set({
      name: input.name,
      description: input.description,
      defaultModel: input.defaultModel,
      allowedModels: input.allowedModels ? JSON.stringify(input.allowedModels) : undefined,
      maxTokensPerRequest: input.maxTokensPerRequest,
      maxTokensPerDay: input.maxTokensPerDay,
      permissions: input.permissions ? JSON.stringify(input.permissions) : undefined,
      canReadFiles: input.canReadFiles !== undefined ? (input.canReadFiles ? 1 : 0) : undefined,
      canWriteFiles: input.canWriteFiles !== undefined ? (input.canWriteFiles ? 1 : 0) : undefined,
      canExecuteCode: input.canExecuteCode !== undefined ? (input.canExecuteCode ? 1 : 0) : undefined,
      canAccessNetwork: input.canAccessNetwork !== undefined ? (input.canAccessNetwork ? 1 : 0) : undefined,
      canAccessDatabase: input.canAccessDatabase !== undefined ? (input.canAccessDatabase ? 1 : 0) : undefined,
      status: input.status,
    })
    .where(eq(set7Agents.agentId, agentId));

  return { success: true };
}

/**
 * Ativar Kill Switch para um agente
 */
export async function triggerKillSwitch(agentId: string, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [agent] = await db.select()
    .from(set7Agents)
    .where(eq(set7Agents.agentId, agentId));
  
  if (!agent) throw new Error("Agent not found");
  
  await db.update(set7Agents)
    .set({
      status: "killed",
      killSwitchTriggered: 1,
      killSwitchReason: reason,
      killSwitchAt: Date.now(),
    })
    .where(eq(set7Agents.agentId, agentId));

  await logAuditEvent({
    eventType: "agent_killed",
    agentId,
    description: `Kill Switch acionado para agente: ${agent.name}`,
    details: { reason },
    severity: "critical",
  });

  return { success: true };
}

/**
 * Resetar Kill Switch
 */
export async function resetKillSwitch(agentId: string, approvedBy: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(set7Agents)
    .set({
      status: "active",
      killSwitchTriggered: 0,
      killSwitchReason: null,
      killSwitchAt: null,
    })
    .where(eq(set7Agents.agentId, agentId));

  await logAuditEvent({
    eventType: "agent_started",
    agentId,
    description: `Kill Switch resetado - aprovado por: ${approvedBy}`,
    severity: "warning",
  });

  return { success: true };
}

/**
 * Pausar agente
 */
export async function pauseAgent(agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(set7Agents)
    .set({ status: "paused" })
    .where(eq(set7Agents.agentId, agentId));

  await logAuditEvent({
    eventType: "agent_stopped",
    agentId,
    description: "Agente pausado",
    severity: "info",
  });

  return { success: true };
}

/**
 * Reativar agente
 */
export async function resumeAgent(agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [agent] = await db.select()
    .from(set7Agents)
    .where(eq(set7Agents.agentId, agentId));
  
  if (!agent) throw new Error("Agent not found");
  
  if (agent.killSwitchTriggered) {
    throw new Error("Cannot resume agent with active kill switch");
  }
  
  await db.update(set7Agents)
    .set({ status: "active" })
    .where(eq(set7Agents.agentId, agentId));

  await logAuditEvent({
    eventType: "agent_started",
    agentId,
    description: "Agente reativado",
    severity: "info",
  });

  return { success: true };
}

/**
 * Registrar execução de task por agente
 */
export async function recordAgentExecution(agentId: string, tokensUsed: number, executionTimeMs: number, success: boolean) {
  const db = await getDb();
  if (!db) return;
  
  const [agent] = await db.select()
    .from(set7Agents)
    .where(eq(set7Agents.agentId, agentId));
  
  if (!agent) return;
  
  const newTotalTasks = agent.totalTasksExecuted + 1;
  const newTotalTokens = agent.totalTokensUsed + tokensUsed;
  const newAvgTime = Math.round(
    (agent.avgExecutionTimeMs * agent.totalTasksExecuted + executionTimeMs) / newTotalTasks
  );
  
  // Calcular nova taxa de sucesso
  const currentSuccesses = Math.round(agent.totalTasksExecuted * agent.successRate / 100);
  const newSuccesses = currentSuccesses + (success ? 1 : 0);
  const newSuccessRate = Math.round((newSuccesses / newTotalTasks) * 100);
  
  await db.update(set7Agents)
    .set({
      totalTasksExecuted: newTotalTasks,
      totalTokensUsed: newTotalTokens,
      avgExecutionTimeMs: newAvgTime,
      successRate: newSuccessRate,
      lastActiveAt: Date.now(),
    })
    .where(eq(set7Agents.agentId, agentId));
}

/**
 * Verificar permissões do agente
 */
export async function checkAgentPermission(agentId: string, permission: string): Promise<boolean> {
  const agent = await getAgent(agentId);
  
  if (!agent) return false;
  if (agent.status !== "active") return false;
  
  // Verificar permissões específicas
  switch (permission) {
    case "read_files":
      return agent.canReadFiles === 1;
    case "write_files":
      return agent.canWriteFiles === 1;
    case "execute_code":
      return agent.canExecuteCode === 1;
    case "access_network":
      return agent.canAccessNetwork === 1;
    case "access_database":
      return agent.canAccessDatabase === 1;
    default:
      return agent.permissions.includes(permission);
  }
}

/**
 * Obter estatísticas dos agentes
 */
export async function getAgentsStats() {
  const db = await getDb();
  if (!db) return {
    totalAgents: 0,
    activeAgents: 0,
    pausedAgents: 0,
    killedAgents: 0,
    totalTasksExecuted: 0,
    totalTokensUsed: 0,
    avgSuccessRate: 0,
  };
  
  const agents = await db.select().from(set7Agents);
  
  const stats = {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === "active").length,
    pausedAgents: agents.filter(a => a.status === "paused").length,
    killedAgents: agents.filter(a => a.status === "killed").length,
    totalTasksExecuted: agents.reduce((sum, a) => sum + a.totalTasksExecuted, 0),
    totalTokensUsed: agents.reduce((sum, a) => sum + a.totalTokensUsed, 0),
    avgSuccessRate: 0,
  };
  
  if (agents.length > 0) {
    stats.avgSuccessRate = Math.round(
      agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length
    );
  }
  
  return stats;
}

/**
 * Inicializar agentes padrão do SET7
 */
export async function initializeDefaultAgents() {
  const db = await getDb();
  if (!db) return { success: false };
  
  // Verificar se já existem agentes
  const existingAgents = await db.select().from(set7Agents);
  if (existingAgents.length > 0) {
    return { success: true, message: "Agents already initialized" };
  }
  
  // Criar agentes verticais
  for (const [id, config] of Object.entries(VERTICAL_AGENTS)) {
    await createAgent({
      name: config.name,
      description: config.description,
      agentType: "vertical",
      phase: config.phase,
      defaultModel: "gpt-4o",
      canReadFiles: true,
      canWriteFiles: true,
      canAccessDatabase: true,
    });
  }
  
  // Criar agentes horizontais (hooks)
  for (const [id, config] of Object.entries(HORIZONTAL_AGENTS)) {
    await createAgent({
      name: config.name,
      description: config.description,
      agentType: "horizontal",
      hookType: config.hookType,
      defaultModel: "gpt-4o-mini", // Hooks usam modelo mais econômico
      canReadFiles: true,
      canAccessDatabase: true,
    });
  }
  
  // Criar orquestrador
  await createAgent({
    name: "Orquestrador SET7",
    description: "Coordena agentes verticais e horizontais, gerencia fluxo de trabalho",
    agentType: "orchestrator",
    defaultModel: "gpt-4o",
    canReadFiles: true,
    canWriteFiles: true,
    canExecuteCode: true,
    canAccessNetwork: true,
    canAccessDatabase: true,
  });
  
  return { success: true, message: "Default agents initialized" };
}
