/**
 * SET7 Gates Service
 * Condições de avanço entre fases com checklists
 * 
 * Conforme SET7 V3.0 - Apêndice C (Gates e Checklists)
 */

import { getDb } from "../../db";
import { set7Gates } from "../../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logAuditEvent } from "./tasklog-service";

// Tipos
export type GateMode = "mvp" | "standard" | "enterprise" | "regulated";
export type GateStatus = "pending" | "in_progress" | "pass" | "fail" | "mitigation";

// Checklists por fase e modo (conforme Apêndice C)
export const GATE_CHECKLISTS: Record<string, Record<GateMode, string[]>> = {
  "SET7.01": {
    mvp: [
      "Objetivo de negócio definido",
      "Stakeholders identificados",
      "Escopo mínimo documentado",
    ],
    standard: [
      "Objetivo de negócio definido",
      "Stakeholders identificados e mapeados",
      "Escopo completo documentado",
      "Matriz de Intenção preenchida",
      "Riscos iniciais identificados",
    ],
    enterprise: [
      "Objetivo de negócio definido e validado",
      "Stakeholders identificados, mapeados e priorizados",
      "Escopo completo documentado e aprovado",
      "Matriz de Intenção preenchida e validada",
      "Riscos iniciais identificados e classificados",
      "Business case aprovado",
      "Sponsor executivo designado",
    ],
    regulated: [
      "Objetivo de negócio definido e validado",
      "Stakeholders identificados, mapeados e priorizados",
      "Escopo completo documentado e aprovado",
      "Matriz de Intenção preenchida e validada",
      "Riscos iniciais identificados e classificados",
      "Business case aprovado",
      "Sponsor executivo designado",
      "Compliance inicial verificado",
      "Requisitos regulatórios mapeados",
    ],
  },
  "SET7.02": {
    mvp: [
      "Domínio principal definido",
      "Arquitetura básica documentada",
      "Componentes essenciais identificados",
    ],
    standard: [
      "Domínio principal definido",
      "Subdomínios mapeados",
      "Arquitetura documentada",
      "Componentes identificados e priorizados",
      "Dependências mapeadas",
      "Decisões arquiteturais registradas (ADRs)",
    ],
    enterprise: [
      "Domínio principal definido",
      "Subdomínios mapeados e bounded contexts definidos",
      "Arquitetura documentada e revisada",
      "Componentes identificados, priorizados e estimados",
      "Dependências mapeadas e riscos avaliados",
      "ADRs completos e aprovados",
      "Padrões de integração definidos",
      "Capacidade de escala projetada",
    ],
    regulated: [
      "Domínio principal definido",
      "Subdomínios mapeados e bounded contexts definidos",
      "Arquitetura documentada, revisada e auditável",
      "Componentes identificados, priorizados e estimados",
      "Dependências mapeadas e riscos avaliados",
      "ADRs completos e aprovados",
      "Padrões de integração definidos",
      "Capacidade de escala projetada",
      "Requisitos de auditoria atendidos",
      "Segregação de dados planejada",
    ],
  },
  "SET7.03": {
    mvp: [
      "APIs principais definidas",
      "Contratos básicos documentados",
    ],
    standard: [
      "APIs definidas e versionadas",
      "Contratos documentados com schemas",
      "Integrações mapeadas",
      "Hash de identidade gerado",
      "QR Code de verificação criado",
    ],
    enterprise: [
      "APIs definidas, versionadas e documentadas",
      "Contratos com schemas validados",
      "Integrações mapeadas e testadas",
      "Hash de identidade gerado e verificado",
      "QR Code de verificação criado",
      "SLAs definidos",
      "Fallbacks implementados",
    ],
    regulated: [
      "APIs definidas, versionadas e documentadas",
      "Contratos com schemas validados e auditáveis",
      "Integrações mapeadas, testadas e certificadas",
      "Hash de identidade gerado, verificado e registrado",
      "QR Code de verificação criado",
      "SLAs definidos e monitorados",
      "Fallbacks implementados e testados",
      "Logs de integração auditáveis",
    ],
  },
  "SET7.04": {
    mvp: [
      "Autenticação básica implementada",
      "Dados sensíveis protegidos",
    ],
    standard: [
      "Autenticação implementada",
      "Autorização por roles",
      "Dados sensíveis criptografados",
      "OWASP Top 10 verificado",
      "Kill Switch configurado",
    ],
    enterprise: [
      "Autenticação MFA implementada",
      "RBAC completo",
      "Criptografia em trânsito e repouso",
      "OWASP Top 10 verificado e mitigado",
      "Kill Switch configurado e testado",
      "Audit trail implementado",
      "Penetration test realizado",
    ],
    regulated: [
      "Autenticação MFA implementada",
      "RBAC completo com segregação de funções",
      "Criptografia em trânsito e repouso (AES-256)",
      "OWASP Top 10 verificado e mitigado",
      "Kill Switch configurado e testado",
      "Audit trail completo e imutável",
      "Penetration test realizado e aprovado",
      "Certificações de segurança obtidas",
      "DPO designado",
    ],
  },
  "SET7.05": {
    mvp: [
      "Backend funcional",
      "Frontend básico",
      "Fluxo principal funcionando",
    ],
    standard: [
      "Backend completo e testado",
      "Frontend responsivo",
      "Fluxos principais funcionando",
      "Testes unitários (>70%)",
      "Performance baseline definida",
    ],
    enterprise: [
      "Backend completo, testado e documentado",
      "Frontend responsivo e acessível (WCAG 2.1)",
      "Todos os fluxos funcionando",
      "Testes unitários (>80%)",
      "Testes de integração",
      "Performance otimizada",
      "Observabilidade implementada",
    ],
    regulated: [
      "Backend completo, testado e documentado",
      "Frontend responsivo e acessível (WCAG 2.1 AA)",
      "Todos os fluxos funcionando e auditáveis",
      "Testes unitários (>90%)",
      "Testes de integração e E2E",
      "Performance otimizada e monitorada",
      "Observabilidade completa",
      "Código revisado e aprovado",
    ],
  },
  "SET7.06": {
    mvp: [
      "Deploy automatizado",
      "Logs básicos",
      "Monitoramento de uptime",
    ],
    standard: [
      "CI/CD implementado",
      "Logs estruturados",
      "Métricas de negócio",
      "Alertas configurados",
      "Runbooks básicos",
    ],
    enterprise: [
      "CI/CD completo com gates",
      "Logs estruturados e centralizados",
      "Métricas de negócio e técnicas",
      "Alertas inteligentes",
      "Runbooks completos",
      "SRE practices implementadas",
      "Chaos engineering básico",
    ],
    regulated: [
      "CI/CD completo com gates e aprovações",
      "Logs estruturados, centralizados e imutáveis",
      "Métricas de negócio, técnicas e compliance",
      "Alertas inteligentes com escalação",
      "Runbooks completos e testados",
      "SRE practices implementadas",
      "Chaos engineering",
      "Audit logs de operações",
    ],
  },
  "SET7.07": {
    mvp: [
      "Backup configurado",
      "Plano de rollback",
    ],
    standard: [
      "Backup automatizado e testado",
      "Plano de rollback documentado",
      "RTO/RPO definidos",
      "Plano de continuidade básico",
    ],
    enterprise: [
      "Backup automatizado, testado e verificado",
      "Rollback automatizado",
      "RTO/RPO definidos e testados",
      "BCP completo",
      "DR site configurado",
      "Testes de recuperação periódicos",
    ],
    regulated: [
      "Backup automatizado, testado e auditável",
      "Rollback automatizado e documentado",
      "RTO/RPO definidos, testados e certificados",
      "BCP completo e aprovado",
      "DR site configurado e testado",
      "Testes de recuperação periódicos e documentados",
      "Plano de comunicação de crise",
      "Simulações de desastre realizadas",
    ],
  },
};

export interface CreateGateInput {
  phase: string;
  gateName: string;
  description?: string;
  mode: GateMode;
  humanApprovalRequired?: boolean;
}

export interface UpdateGateInput {
  status?: GateStatus;
  evidences?: Record<string, unknown>;
  mitigationPlan?: string;
  mitigationDeadline?: number;
}

/**
 * Criar novo gate
 */
export async function createGate(input: CreateGateInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const gateId = `gate_${randomUUID().replace(/-/g, "").substring(0, 16)}`;
  
  // Obter checklist para a fase e modo
  const checklistItems = GATE_CHECKLISTS[input.phase]?.[input.mode] || [];
  
  const [gate] = await db.insert(set7Gates).values({
    gateId,
    phase: input.phase,
    gateName: input.gateName,
    description: input.description,
    mode: input.mode,
    checklistItems: JSON.stringify(checklistItems),
    requiredItems: JSON.stringify(checklistItems), // Todos são obrigatórios por padrão
    status: "pending",
    humanApprovalRequired: (input.humanApprovalRequired || input.mode === "regulated") ? 1 : 0,
    updatedAt: Date.now(),
    createdAt: Date.now(),
  }).$returningId();

  return { gateId, id: gate.id, checklistItems };
}

/**
 * Buscar gate por ID
 */
export async function getGate(gateId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [gate] = await db.select()
    .from(set7Gates)
    .where(eq(set7Gates.gateId, gateId));
  
  if (gate) {
    return {
      ...gate,
      checklistItems: gate.checklistItems ? JSON.parse(gate.checklistItems) : [],
      requiredItems: gate.requiredItems ? JSON.parse(gate.requiredItems) : [],
      evidences: gate.evidences ? JSON.parse(gate.evidences) : {},
    };
  }
  
  return null;
}

/**
 * Listar gates
 */
export async function listGates(filters?: {
  phase?: string;
  mode?: GateMode;
  status?: GateStatus;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const gates = await db.select()
    .from(set7Gates)
    .orderBy(desc(set7Gates.createdAt))
    .limit(filters?.limit || 100)
    .offset(filters?.offset || 0);

  return gates.map((gate) => ({
    ...gate,
    checklistItems: gate.checklistItems ? JSON.parse(gate.checklistItems) : [],
    requiredItems: gate.requiredItems ? JSON.parse(gate.requiredItems) : [],
    evidences: gate.evidences ? JSON.parse(gate.evidences) : {},
  }));
}

/**
 * Submeter evidência para um item do checklist
 */
export async function submitEvidence(gateId: string, item: string, evidence: {
  description: string;
  artifacts?: string[];
  submittedBy: string;
  submittedAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const gate = await getGate(gateId);
  if (!gate) throw new Error("Gate not found");
  
  const evidences = gate.evidences || {};
  evidences[item] = {
    ...evidence,
    submittedAt: evidence.submittedAt || new Date(),
    verified: false,
  };
  
  // Verificar se todos os itens têm evidência
  const allItemsHaveEvidence = gate.requiredItems.every(
    (reqItem: string) => evidences[reqItem]?.description
  );
  
  await db.update(set7Gates)
    .set({
      evidences: JSON.stringify(evidences),
      status: allItemsHaveEvidence ? "in_progress" : "pending",
    })
    .where(eq(set7Gates.gateId, gateId));

  return { success: true, allItemsHaveEvidence };
}

/**
 * Avaliar gate (aprovar ou reprovar)
 */
export async function evaluateGate(gateId: string, evaluation: {
  passed: boolean;
  evaluatedBy: number;
  evaluatorName: string;
  comments?: string;
  mitigationPlan?: string;
  mitigationDeadline?: number;
}): Promise<{
  success: boolean;
  status: GateStatus;
  message: string;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const gate = await getGate(gateId);
  if (!gate) throw new Error("Gate not found");
  
  let newStatus: GateStatus;
  let message: string;
  
  if (evaluation.passed) {
    newStatus = "pass";
    message = "Gate aprovado com sucesso";
    
    await logAuditEvent({
      eventType: "gate_passed",
      gateId,
      phase: gate.phase,
      description: `Gate aprovado: ${gate.gateName}`,
      details: { evaluatedBy: evaluation.evaluatorName },
      userId: evaluation.evaluatedBy,
      userName: evaluation.evaluatorName,
      severity: "info",
    });
  } else if (evaluation.mitigationPlan) {
    newStatus = "mitigation";
    message = "Gate em mitigação - plano de ação definido";
    
    await logAuditEvent({
      eventType: "gate_mitigated",
      gateId,
      phase: gate.phase,
      description: `Gate em mitigação: ${gate.gateName}`,
      details: { 
        mitigationPlan: evaluation.mitigationPlan,
        deadline: evaluation.mitigationDeadline,
      },
      userId: evaluation.evaluatedBy,
      userName: evaluation.evaluatorName,
      severity: "warning",
    });
  } else {
    newStatus = "fail";
    message = "Gate reprovado - ação corretiva necessária";
    
    await logAuditEvent({
      eventType: "gate_failed",
      gateId,
      phase: gate.phase,
      description: `Gate reprovado: ${gate.gateName}`,
      details: { comments: evaluation.comments },
      userId: evaluation.evaluatedBy,
      userName: evaluation.evaluatorName,
      severity: "error",
    });
  }
  
  await db.update(set7Gates)
    .set({
      status: newStatus,
      approvedBy: evaluation.passed ? evaluation.evaluatedBy : undefined,
      approvedAt: evaluation.passed ? Date.now() : undefined,
      mitigationPlan: evaluation.mitigationPlan,
      mitigationDeadline: evaluation.mitigationDeadline,
      mitigationApprovedBy: evaluation.mitigationPlan ? evaluation.evaluatedBy : undefined,
    })
    .where(eq(set7Gates.gateId, gateId));

  return { success: true, status: newStatus, message };
}

/**
 * Verificar se pode avançar para próxima fase
 */
export async function canAdvancePhase(currentPhase: string): Promise<{
  canAdvance: boolean;
  blockers: string[];
  pendingGates: string[];
}> {
  const db = await getDb();
  if (!db) return { canAdvance: false, blockers: ["Database not available"], pendingGates: [] };
  
  const gates = await db.select()
    .from(set7Gates)
    .where(eq(set7Gates.phase, currentPhase));
  
  const blockers: string[] = [];
  const pendingGates: string[] = [];
  
  for (const gate of gates) {
    if (gate.status === "pending" || gate.status === "in_progress") {
      pendingGates.push(gate.gateName);
      blockers.push(`Gate pendente: ${gate.gateName}`);
    } else if (gate.status === "fail") {
      blockers.push(`Gate reprovado: ${gate.gateName}`);
    } else if (gate.status === "mitigation") {
      if (gate.mitigationDeadline && new Date(gate.mitigationDeadline) < new Date()) {
        blockers.push(`Mitigação expirada: ${gate.gateName}`);
      }
    }
  }
  
  return {
    canAdvance: blockers.length === 0,
    blockers,
    pendingGates,
  };
}

/**
 * Obter progresso do gate
 */
export async function getGateProgress(gateId: string): Promise<{
  totalItems: number;
  completedItems: number;
  percentage: number;
  missingItems: string[];
}> {
  const gate = await getGate(gateId);
  if (!gate) return { totalItems: 0, completedItems: 0, percentage: 0, missingItems: [] };
  
  const totalItems = gate.requiredItems.length;
  const completedItems = gate.requiredItems.filter(
    (item: string) => gate.evidences[item]?.verified
  ).length;
  
  const missingItems = gate.requiredItems.filter(
    (item: string) => !gate.evidences[item]?.description
  );
  
  return {
    totalItems,
    completedItems,
    percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
    missingItems,
  };
}

/**
 * Inicializar gates para todas as fases
 */
export async function initializeProjectGates(mode: GateMode) {
  const phases = ["SET7.01", "SET7.02", "SET7.03", "SET7.04", "SET7.05", "SET7.06", "SET7.07"];
  const createdGates = [];
  
  for (const phase of phases) {
    const result = await createGate({
      phase,
      gateName: `Gate ${phase}`,
      description: `Condições de avanço para ${phase}`,
      mode,
      humanApprovalRequired: mode === "regulated" || mode === "enterprise",
    });
    createdGates.push(result);
  }
  
  return { success: true, gates: createdGates };
}

/**
 * Obter estatísticas dos gates
 */
export async function getGatesStats() {
  const db = await getDb();
  if (!db) return {
    totalGates: 0,
    passedGates: 0,
    failedGates: 0,
    pendingGates: 0,
    inMitigation: 0,
    overallProgress: 0,
  };
  
  const gates = await db.select().from(set7Gates);
  
  const stats = {
    totalGates: gates.length,
    passedGates: gates.filter(g => g.status === "pass").length,
    failedGates: gates.filter(g => g.status === "fail").length,
    pendingGates: gates.filter(g => g.status === "pending" || g.status === "in_progress").length,
    inMitigation: gates.filter(g => g.status === "mitigation").length,
    overallProgress: 0,
  };
  
  if (stats.totalGates > 0) {
    stats.overallProgress = Math.round((stats.passedGates / stats.totalGates) * 100);
  }
  
  return stats;
}
