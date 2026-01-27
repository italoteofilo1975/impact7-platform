/**
 * Serviço de Logs de Auditoria
 * Registra ações sensíveis para compliance e segurança
 */

export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.register"
  | "user.update_profile"
  | "user.delete_account"
  | "admin.access"
  | "admin.update_user"
  | "admin.delete_user"
  | "case.create"
  | "case.update"
  | "case.delete"
  | "case.approve"
  | "case.reject"
  | "api_key.create"
  | "api_key.revoke"
  | "oauth_client.create"
  | "oauth_client.delete"
  | "webhook.create"
  | "webhook.delete"
  | "calculation.create"
  | "export.data"
  | "settings.update";

export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: AuditAction;
  severity: AuditSeverity;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
}

// Armazenamento em memória (em produção, usar banco de dados)
const auditLogs: AuditLogEntry[] = [];
const MAX_LOGS = 10000;

/**
 * Determinar severidade baseado na ação
 */
function getSeverity(action: AuditAction): AuditSeverity {
  const criticalActions: AuditAction[] = [
    "user.delete_account",
    "admin.delete_user",
    "case.delete",
    "api_key.revoke",
    "oauth_client.delete",
  ];
  
  const warningActions: AuditAction[] = [
    "admin.access",
    "admin.update_user",
    "case.approve",
    "case.reject",
    "settings.update",
  ];
  
  if (criticalActions.includes(action)) return "critical";
  if (warningActions.includes(action)) return "warning";
  return "info";
}

/**
 * Registrar entrada de auditoria
 */
export function logAudit(params: {
  action: AuditAction;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
}): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    action: params.action,
    severity: getSeverity(params.action),
    userId: params.userId,
    userName: params.userName,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    resource: params.resource,
    resourceId: params.resourceId,
    details: params.details,
    success: params.success ?? true,
    errorMessage: params.errorMessage,
  };
  
  // Adicionar ao início (mais recentes primeiro)
  auditLogs.unshift(entry);
  
  // Limitar tamanho
  if (auditLogs.length > MAX_LOGS) {
    auditLogs.pop();
  }
  
  // Log para console em desenvolvimento
  const logLevel = entry.severity === "critical" ? "error" : 
                   entry.severity === "warning" ? "warn" : "info";
  console[logLevel](`[AUDIT] ${entry.action}`, {
    userId: entry.userId,
    resource: entry.resource,
    success: entry.success,
  });
  
  return entry;
}

/**
 * Buscar logs de auditoria
 */
export function getAuditLogs(params?: {
  userId?: string;
  action?: AuditAction;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): { logs: AuditLogEntry[]; total: number } {
  let filtered = [...auditLogs];
  
  if (params?.userId) {
    filtered = filtered.filter(log => log.userId === params.userId);
  }
  
  if (params?.action) {
    filtered = filtered.filter(log => log.action === params.action);
  }
  
  if (params?.severity) {
    filtered = filtered.filter(log => log.severity === params.severity);
  }
  
  if (params?.startDate) {
    const startTimestamp = params.startDate.getTime();
    filtered = filtered.filter(log => log.timestamp >= startTimestamp);
  }
  
  if (params?.endDate) {
    const endTimestamp = params.endDate.getTime();
    filtered = filtered.filter(log => log.timestamp <= endTimestamp);
  }
  
  const total = filtered.length;
  const offset = params?.offset ?? 0;
  const limit = params?.limit ?? 50;
  
  return {
    logs: filtered.slice(offset, offset + limit),
    total,
  };
}

/**
 * Obter estatísticas de auditoria
 */
export function getAuditStats(): {
  total: number;
  bySeverity: Record<AuditSeverity, number>;
  byAction: Record<string, number>;
  recentCritical: AuditLogEntry[];
  failedActions: number;
} {
  const bySeverity: Record<AuditSeverity, number> = {
    info: 0,
    warning: 0,
    critical: 0,
  };
  
  const byAction: Record<string, number> = {};
  let failedActions = 0;
  
  for (const log of auditLogs) {
    bySeverity[log.severity]++;
    byAction[log.action] = (byAction[log.action] || 0) + 1;
    if (!log.success) failedActions++;
  }
  
  const recentCritical = auditLogs
    .filter(log => log.severity === "critical")
    .slice(0, 10);
  
  return {
    total: auditLogs.length,
    bySeverity,
    byAction,
    recentCritical,
    failedActions,
  };
}

/**
 * Exportar logs para análise
 */
export function exportAuditLogs(format: "json" | "csv"): string {
  if (format === "json") {
    return JSON.stringify(auditLogs, null, 2);
  }
  
  // CSV
  const headers = [
    "id", "timestamp", "action", "severity", "userId", "userName",
    "ipAddress", "resource", "resourceId", "success", "errorMessage"
  ];
  
  const rows = auditLogs.map(log => [
    log.id,
    new Date(log.timestamp).toISOString(),
    log.action,
    log.severity,
    log.userId || "",
    log.userName || "",
    log.ipAddress || "",
    log.resource || "",
    log.resourceId || "",
    log.success.toString(),
    log.errorMessage || "",
  ]);
  
  return [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");
}

/**
 * Limpar logs antigos
 */
export function cleanupOldLogs(daysToKeep: number = 90): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const initialCount = auditLogs.length;
  const cutoffTimestamp = cutoffDate.getTime();
  const filtered = auditLogs.filter(log => log.timestamp >= cutoffTimestamp);
  
  auditLogs.length = 0;
  auditLogs.push(...filtered);
  
  return initialCount - auditLogs.length;
}
