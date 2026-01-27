/**
 * SET7 TASKLOG Service
 * Ledger de microatividades auditável para ROI
 * 
 * Conforme SET7 V3.0 - Parte 0 (SET7.START) e Apêndice E (Templates Operacionais)
 */

import { getDb } from "../../db";
import { set7Tasklog, set7AuditLog } from "../../../drizzle/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

// Tipos para o TASKLOG
export type TaskType = "planning" | "execution" | "validation" | "documentation" | "review";
export type AgentType = "vertical" | "horizontal" | "orchestrator" | "human";
export type TaskStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type GateStatus = "pending" | "pass" | "fail" | "mitigation";

// Bases da Taxonomia SET7 (Apêndice A)
export type TaxonomyBase = 
  | "STR" // Estratégia
  | "PRD" // Produto
  | "EXP" // Experiência
  | "ARC" // Arquitetura
  | "DAT" // Dados
  | "INT" // Integração
  | "SEC" // Segurança
  | "GOV" // Governança
  | "OPS" // Operações
  | "RES" // Resiliência
  | "ECO" // Economia
  | "AIO" // IA/Agentes
  | "EXE" // Execução
  | "COM"; // Comunicação

export interface CreateTaskInput {
  phase: string;
  taskType: TaskType;
  taskName: string;
  description?: string;
  agentId: string;
  agentType: AgentType;
  agentName: string;
  taxonomyBase?: TaxonomyBase;
  taxonomySubbase?: string;
  taxonomyTags?: string[];
  gateId?: string;
}

export interface UpdateTaskInput {
  tokensInput?: number;
  tokensOutput?: number;
  modelUsed?: string;
  executionTimeMs?: number;
  costUsd?: number;
  status?: TaskStatus;
  result?: Record<string, unknown>;
  errorMessage?: string;
  outputArtifacts?: string[];
  gateStatus?: GateStatus;
}

/**
 * Criar nova entrada no TASKLOG
 */
export async function createTask(input: CreateTaskInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const taskId = `task_${randomUUID().replace(/-/g, "").substring(0, 16)}`;
  
  const [task] = await db.insert(set7Tasklog).values({
    taskId,
    phase: input.phase,
    taskType: input.taskType,
    taskName: input.taskName,
    description: input.description,
    agentId: input.agentId,
    agentType: input.agentType,
    agentName: input.agentName,
    taxonomyBase: input.taxonomyBase,
    taxonomySubbase: input.taxonomySubbase,
    taxonomyTags: input.taxonomyTags ? JSON.stringify(input.taxonomyTags) : null,
    gateId: input.gateId,
    status: "pending",
    startedAt: Date.now(),
  
          createdAt: Date.now(),
        }).$returningId();

  // Registrar no audit log
  await logAuditEvent({
    eventType: "task_created",
    phase: input.phase,
    agentId: input.agentId,
    taskId,
    description: `Task criada: ${input.taskName}`,
    details: { input },
    severity: "info",
  });

  return { taskId, id: task.id };
}

/**
 * Iniciar execução de uma task
 */
export async function startTask(taskId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(set7Tasklog)
    .set({
      status: "running",
      startedAt: Date.now(),
    })
    .where(eq(set7Tasklog.taskId, taskId));

  return { success: true };
}

/**
 * Completar uma task com sucesso
 */
export async function completeTask(taskId: string, input: UpdateTaskInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const tokensTotal = (input.tokensInput || 0) + (input.tokensOutput || 0);
  
  await db.update(set7Tasklog)
    .set({
      status: "completed",
      tokensInput: input.tokensInput || 0,
      tokensOutput: input.tokensOutput || 0,
      tokensTotal,
      modelUsed: input.modelUsed,
      executionTimeMs: input.executionTimeMs || 0,
      costUsd: input.costUsd || 0,
      result: input.result ? JSON.stringify(input.result) : null,
      outputArtifacts: input.outputArtifacts ? JSON.stringify(input.outputArtifacts) : null,
      gateStatus: input.gateStatus,
      completedAt: Date.now(),
    })
    .where(eq(set7Tasklog.taskId, taskId));

  // Registrar no audit log
  const [task] = await db.select().from(set7Tasklog).where(eq(set7Tasklog.taskId, taskId));
  
  await logAuditEvent({
    eventType: "task_completed",
    phase: task?.phase,
    agentId: task?.agentId,
    taskId,
    description: `Task completada: ${task?.taskName}`,
    details: { tokensTotal, executionTimeMs: input.executionTimeMs, costUsd: input.costUsd },
    severity: "info",
  });

  return { success: true, tokensTotal };
}

/**
 * Falhar uma task
 */
export async function failTask(taskId: string, errorMessage: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(set7Tasklog)
    .set({
      status: "failed",
      errorMessage,
      completedAt: Date.now(),
    })
    .where(eq(set7Tasklog.taskId, taskId));

  const [task] = await db.select().from(set7Tasklog).where(eq(set7Tasklog.taskId, taskId));

  await logAuditEvent({
    eventType: "task_failed",
    phase: task?.phase,
    agentId: task?.agentId,
    taskId,
    description: `Task falhou: ${task?.taskName}`,
    details: { errorMessage },
    severity: "error",
  });

  return { success: true };
}

/**
 * Cancelar uma task
 */
export async function cancelTask(taskId: string, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(set7Tasklog)
    .set({
      status: "cancelled",
      errorMessage: reason,
      completedAt: Date.now(),
    })
    .where(eq(set7Tasklog.taskId, taskId));

  return { success: true };
}

/**
 * Buscar task por ID
 */
export async function getTask(taskId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [task] = await db.select().from(set7Tasklog).where(eq(set7Tasklog.taskId, taskId));
  
  if (task) {
    return {
      ...task,
      taxonomyTags: task.taxonomyTags ? JSON.parse(task.taxonomyTags) : [],
      result: task.result ? JSON.parse(task.result) : null,
      outputArtifacts: task.outputArtifacts ? JSON.parse(task.outputArtifacts) : [],
    };
  }
  
  return null;
}

/**
 * Listar tasks com filtros
 */
export async function listTasks(filters?: {
  phase?: string;
  agentId?: string;
  status?: TaskStatus;
  taxonomyBase?: TaxonomyBase;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  
  if (filters?.phase) {
    conditions.push(eq(set7Tasklog.phase, filters.phase));
  }
  if (filters?.agentId) {
    conditions.push(eq(set7Tasklog.agentId, filters.agentId));
  }
  if (filters?.status) {
    conditions.push(eq(set7Tasklog.status, filters.status));
  }
  if (filters?.taxonomyBase) {
    conditions.push(eq(set7Tasklog.taxonomyBase, filters.taxonomyBase));
  }
  if (filters?.startDate) {
    conditions.push(gte(set7Tasklog.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(set7Tasklog.createdAt, filters.endDate));
  }

  const tasks = await db.select()
    .from(set7Tasklog)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(set7Tasklog.createdAt))
    .limit(filters?.limit || 100)
    .offset(filters?.offset || 0);

  return tasks.map((task) => ({
    ...task,
    taxonomyTags: task.taxonomyTags ? JSON.parse(task.taxonomyTags) : [],
    result: task.result ? JSON.parse(task.result) : null,
    outputArtifacts: task.outputArtifacts ? JSON.parse(task.outputArtifacts) : [],
  }));
}

/**
 * Obter métricas agregadas do TASKLOG
 */
export async function getTasklogMetrics(filters?: {
  phase?: string;
  agentId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) return {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    avgExecutionTimeMs: 0,
    successRate: 0,
  };
  
  const conditions = [];
  
  if (filters?.phase) {
    conditions.push(eq(set7Tasklog.phase, filters.phase));
  }
  if (filters?.agentId) {
    conditions.push(eq(set7Tasklog.agentId, filters.agentId));
  }
  if (filters?.startDate) {
    conditions.push(gte(set7Tasklog.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(set7Tasklog.createdAt, filters.endDate));
  }

  const [metrics] = await db.select({
    totalTasks: sql<number>`COUNT(*)`,
    completedTasks: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
    failedTasks: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
    totalTokens: sql<number>`SUM(tokensTotal)`,
    totalCostUsd: sql<number>`SUM(costUsd)`,
    avgExecutionTimeMs: sql<number>`AVG(executionTimeMs)`,
    successRate: sql<number>`(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0))`,
  })
    .from(set7Tasklog)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    totalTasks: Number(metrics?.totalTasks || 0),
    completedTasks: Number(metrics?.completedTasks || 0),
    failedTasks: Number(metrics?.failedTasks || 0),
    totalTokens: Number(metrics?.totalTokens || 0),
    totalCostUsd: Number(metrics?.totalCostUsd || 0),
    avgExecutionTimeMs: Number(metrics?.avgExecutionTimeMs || 0),
    successRate: Number(metrics?.successRate || 0),
  };
}

/**
 * Obter métricas por fase
 */
export async function getMetricsByPhase() {
  const db = await getDb();
  if (!db) return [];
  
  const metrics = await db.select({
    phase: set7Tasklog.phase,
    totalTasks: sql<number>`COUNT(*)`,
    completedTasks: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
    totalTokens: sql<number>`SUM(tokensTotal)`,
    totalCostUsd: sql<number>`SUM(costUsd)`,
    avgExecutionTimeMs: sql<number>`AVG(executionTimeMs)`,
  })
    .from(set7Tasklog)
    .groupBy(set7Tasklog.phase)
    .orderBy(set7Tasklog.phase);

  return metrics.map((m) => ({
    phase: m.phase,
    totalTasks: Number(m.totalTasks || 0),
    completedTasks: Number(m.completedTasks || 0),
    totalTokens: Number(m.totalTokens || 0),
    totalCostUsd: Number(m.totalCostUsd || 0),
    avgExecutionTimeMs: Number(m.avgExecutionTimeMs || 0),
  }));
}

/**
 * Obter métricas por agente
 */
export async function getMetricsByAgent() {
  const db = await getDb();
  if (!db) return [];
  
  const metrics = await db.select({
    agentId: set7Tasklog.agentId,
    agentName: set7Tasklog.agentName,
    agentType: set7Tasklog.agentType,
    totalTasks: sql<number>`COUNT(*)`,
    completedTasks: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
    totalTokens: sql<number>`SUM(tokensTotal)`,
    totalCostUsd: sql<number>`SUM(costUsd)`,
    avgExecutionTimeMs: sql<number>`AVG(executionTimeMs)`,
  })
    .from(set7Tasklog)
    .groupBy(set7Tasklog.agentId, set7Tasklog.agentName, set7Tasklog.agentType)
    .orderBy(desc(sql`SUM(tokensTotal)`));

  return metrics.map((m) => ({
    agentId: m.agentId,
    agentName: m.agentName,
    agentType: m.agentType,
    totalTasks: Number(m.totalTasks || 0),
    completedTasks: Number(m.completedTasks || 0),
    totalTokens: Number(m.totalTokens || 0),
    totalCostUsd: Number(m.totalCostUsd || 0),
    avgExecutionTimeMs: Number(m.avgExecutionTimeMs || 0),
  }));
}

/**
 * Exportar TASKLOG para CSV (conforme SET7_TASKLOG.csv do Apêndice E)
 */
export async function exportTasklogToCsv(filters?: {
  phase?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const tasks = await listTasks({ ...filters, limit: 10000 });
  
  const headers = [
    "taskId",
    "phase",
    "taskType",
    "taskName",
    "agentId",
    "agentType",
    "agentName",
    "taxonomyBase",
    "taxonomySubbase",
    "tokensInput",
    "tokensOutput",
    "tokensTotal",
    "modelUsed",
    "executionTimeMs",
    "costUsd",
    "status",
    "gateId",
    "gateStatus",
    "startedAt",
    "completedAt",
    "createdAt",
  ];

  const rows = tasks.map((task) => [
    task.taskId,
    task.phase,
    task.taskType,
    task.taskName,
    task.agentId,
    task.agentType,
    task.agentName,
    task.taxonomyBase || "",
    task.taxonomySubbase || "",
    task.tokensInput,
    task.tokensOutput,
    task.tokensTotal,
    task.modelUsed || "",
    task.executionTimeMs,
    task.costUsd,
    task.status,
    task.gateId || "",
    task.gateStatus || "",
    task.startedAt ? new Date(task.startedAt).toISOString() : "",
    task.completedAt ? new Date(task.completedAt).toISOString() : "",
    task.createdAt ? new Date(task.createdAt).toISOString() : "",
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  
  return csv;
}

// ============================================================================
// AUDIT LOG
// ============================================================================

interface AuditEventInput {
  eventType: typeof set7AuditLog.$inferInsert["eventType"];
  phase?: string;
  agentId?: string;
  taskId?: string;
  gateId?: string;
  integrationId?: string;
  description: string;
  details?: Record<string, unknown>;
  userId?: number;
  userName?: string;
  severity?: "info" | "warning" | "error" | "critical";
}

/**
 * Registrar evento no audit log
 */
export async function logAuditEvent(input: AuditEventInput) {
  const db = await getDb();
  if (!db) return { auditId: null };
  
  const auditId = `audit_${randomUUID().replace(/-/g, "").substring(0, 16)}`;
  
  await db.insert(set7AuditLog).values({
    auditId,
    eventType: input.eventType,
    phase: input.phase,
    agentId: input.agentId,
    taskId: input.taskId,
    gateId: input.gateId,
    integrationId: input.integrationId,
    description: input.description,
    details: input.details ? JSON.stringify(input.details) : null,
    userId: input.userId,
    userName: input.userName,
    severity: input.severity || "info",
  
          createdAt: Date.now(),
        });

  return { auditId };
}

/**
 * Listar eventos do audit log
 */
export async function listAuditEvents(filters?: {
  eventType?: typeof set7AuditLog.$inferInsert["eventType"];
  phase?: string;
  severity?: "info" | "warning" | "error" | "critical";
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  
  if (filters?.eventType) {
    conditions.push(eq(set7AuditLog.eventType, filters.eventType));
  }
  if (filters?.phase) {
    conditions.push(eq(set7AuditLog.phase, filters.phase));
  }
  if (filters?.severity) {
    conditions.push(eq(set7AuditLog.severity, filters.severity));
  }
  if (filters?.startDate) {
    conditions.push(gte(set7AuditLog.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(set7AuditLog.createdAt, filters.endDate));
  }

  const events = await db.select()
    .from(set7AuditLog)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(set7AuditLog.createdAt))
    .limit(filters?.limit || 100)
    .offset(filters?.offset || 0);

  return events.map((event) => ({
    ...event,
    details: event.details ? JSON.parse(event.details) : null,
  }));
}
