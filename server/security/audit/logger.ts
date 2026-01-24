/**
 * Audit Logger Module
 * Camada 8: Auditoria e Logging
 * 
 * Implementa logging imutável de operações sensíveis conforme MYFIPE
 */

import * as crypto from 'crypto';

// Configurações de auditoria
const AUDIT_CONFIG = {
  retentionDays: 365, // 1 ano
  maxLogSize: 10000, // Máximo de logs em memória
  hashAlgorithm: 'sha256' as const,
  sensitiveFields: ['password', 'token', 'secret', 'apiKey', 'creditCard', 'cvv'],
};

// Tipos de eventos de auditoria
export type AuditEventType =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login_failed'
  | 'auth.2fa_enabled'
  | 'auth.2fa_disabled'
  | 'auth.password_changed'
  | 'auth.session_created'
  | 'auth.session_invalidated'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.role_changed'
  | 'data.created'
  | 'data.updated'
  | 'data.deleted'
  | 'data.exported'
  | 'api.key_created'
  | 'api.key_revoked'
  | 'api.request'
  | 'payment.initiated'
  | 'payment.completed'
  | 'payment.failed'
  | 'security.anomaly_detected'
  | 'security.rate_limit_exceeded'
  | 'security.blocked_ip'
  | 'admin.config_changed'
  | 'admin.user_impersonated'
  | 'system.error'
  | 'system.startup'
  | 'system.shutdown';

// Níveis de severidade
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

// Interface para entrada de log de auditoria
interface AuditLogEntry {
  id: string;
  timestamp: number;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  resource?: string;
  resourceId?: string;
  action: string;
  details?: Record<string, any>;
  previousValue?: any;
  newValue?: any;
  success: boolean;
  errorMessage?: string;
  hash: string;
  previousHash: string;
}

// Interface para filtros de busca
interface AuditSearchFilters {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: AuditEventType[];
  userId?: string;
  ip?: string;
  severity?: AuditSeverity[];
  success?: boolean;
  resource?: string;
}

// Armazenamento em memória (em produção, usar banco de dados)
const auditLogs: AuditLogEntry[] = [];
let lastHash = 'genesis';

/**
 * Gerar ID único para log
 */
function generateLogId(): string {
  return `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Calcular hash do log (para imutabilidade)
 */
function calculateHash(entry: Omit<AuditLogEntry, 'hash'>): string {
  const data = JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp,
    eventType: entry.eventType,
    userId: entry.userId,
    action: entry.action,
    previousHash: entry.previousHash,
  });
  
  return crypto.createHash(AUDIT_CONFIG.hashAlgorithm).update(data).digest('hex');
}

/**
 * Mascarar campos sensíveis
 */
function maskSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const masked = Array.isArray(data) ? [...data] : { ...data };
  
  for (const key of Object.keys(masked)) {
    const lowerKey = key.toLowerCase();
    
    // Verificar se é campo sensível
    if (AUDIT_CONFIG.sensitiveFields.some(f => lowerKey.includes(f))) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  
  return masked;
}

/**
 * Criar entrada de log de auditoria
 */
export function createAuditLog(params: {
  eventType: AuditEventType;
  severity?: AuditSeverity;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  resource?: string;
  resourceId?: string;
  action: string;
  details?: Record<string, any>;
  previousValue?: any;
  newValue?: any;
  success?: boolean;
  errorMessage?: string;
}): AuditLogEntry {
  const {
    eventType,
    severity = 'info',
    userId,
    userEmail,
    ip,
    userAgent,
    requestId,
    resource,
    resourceId,
    action,
    details,
    previousValue,
    newValue,
    success = true,
    errorMessage,
  } = params;
  
  const entry: Omit<AuditLogEntry, 'hash'> = {
    id: generateLogId(),
    timestamp: Date.now(),
    eventType,
    severity,
    userId,
    userEmail,
    ip,
    userAgent,
    requestId,
    resource,
    resourceId,
    action,
    details: details ? maskSensitiveData(details) : undefined,
    previousValue: previousValue ? maskSensitiveData(previousValue) : undefined,
    newValue: newValue ? maskSensitiveData(newValue) : undefined,
    success,
    errorMessage,
    previousHash: lastHash,
  };
  
  const hash = calculateHash(entry);
  const fullEntry: AuditLogEntry = { ...entry, hash };
  
  // Atualizar hash anterior
  lastHash = hash;
  
  // Adicionar ao armazenamento
  auditLogs.push(fullEntry);
  
  // Limpar logs antigos se exceder limite
  if (auditLogs.length > AUDIT_CONFIG.maxLogSize) {
    auditLogs.shift();
  }
  
  // Log no console para debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[AUDIT] ${eventType}: ${action}`, {
      userId,
      ip,
      success,
      severity,
    });
  }
  
  return fullEntry;
}

/**
 * Buscar logs de auditoria
 */
export function searchAuditLogs(filters: AuditSearchFilters): AuditLogEntry[] {
  let results = [...auditLogs];
  
  if (filters.startDate) {
    const startTime = filters.startDate.getTime();
    results = results.filter(log => log.timestamp >= startTime);
  }
  
  if (filters.endDate) {
    const endTime = filters.endDate.getTime();
    results = results.filter(log => log.timestamp <= endTime);
  }
  
  if (filters.eventTypes?.length) {
    results = results.filter(log => filters.eventTypes!.includes(log.eventType));
  }
  
  if (filters.userId) {
    results = results.filter(log => log.userId === filters.userId);
  }
  
  if (filters.ip) {
    results = results.filter(log => log.ip === filters.ip);
  }
  
  if (filters.severity?.length) {
    results = results.filter(log => filters.severity!.includes(log.severity));
  }
  
  if (filters.success !== undefined) {
    results = results.filter(log => log.success === filters.success);
  }
  
  if (filters.resource) {
    results = results.filter(log => log.resource === filters.resource);
  }
  
  return results.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Obter log por ID
 */
export function getAuditLogById(id: string): AuditLogEntry | undefined {
  return auditLogs.find(log => log.id === id);
}

/**
 * Verificar integridade da cadeia de logs
 */
export function verifyAuditChainIntegrity(): {
  valid: boolean;
  brokenAt?: string;
  totalLogs: number;
} {
  if (auditLogs.length === 0) {
    return { valid: true, totalLogs: 0 };
  }
  
  let previousHash = 'genesis';
  
  for (const log of auditLogs) {
    // Verificar hash anterior
    if (log.previousHash !== previousHash) {
      return {
        valid: false,
        brokenAt: log.id,
        totalLogs: auditLogs.length,
      };
    }
    
    // Recalcular hash
    const { hash, ...entryWithoutHash } = log;
    const calculatedHash = calculateHash(entryWithoutHash);
    
    if (calculatedHash !== hash) {
      return {
        valid: false,
        brokenAt: log.id,
        totalLogs: auditLogs.length,
      };
    }
    
    previousHash = hash;
  }
  
  return { valid: true, totalLogs: auditLogs.length };
}

/**
 * Exportar logs para formato JSON
 */
export function exportAuditLogs(filters?: AuditSearchFilters): string {
  const logs = filters ? searchAuditLogs(filters) : auditLogs;
  
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    totalLogs: logs.length,
    integrityCheck: verifyAuditChainIntegrity(),
    logs,
  }, null, 2);
}

/**
 * Obter estatísticas de auditoria
 */
export function getAuditStats(): {
  totalLogs: number;
  byEventType: Record<string, number>;
  bySeverity: Record<string, number>;
  successRate: number;
  last24Hours: number;
} {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  const byEventType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  let successCount = 0;
  let last24Hours = 0;
  
  for (const log of auditLogs) {
    // Por tipo de evento
    byEventType[log.eventType] = (byEventType[log.eventType] || 0) + 1;
    
    // Por severidade
    bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
    
    // Taxa de sucesso
    if (log.success) successCount++;
    
    // Últimas 24 horas
    if (log.timestamp >= oneDayAgo) last24Hours++;
  }
  
  return {
    totalLogs: auditLogs.length,
    byEventType,
    bySeverity,
    successRate: auditLogs.length > 0 ? (successCount / auditLogs.length) * 100 : 100,
    last24Hours,
  };
}

// Helpers para eventos comuns

/**
 * Log de login bem-sucedido
 */
export function logLogin(userId: string, email: string, ip: string, userAgent: string): AuditLogEntry {
  return createAuditLog({
    eventType: 'auth.login',
    severity: 'info',
    userId,
    userEmail: email,
    ip,
    userAgent,
    action: 'User logged in successfully',
    success: true,
  });
}

/**
 * Log de login falho
 */
export function logLoginFailed(email: string, ip: string, userAgent: string, reason: string): AuditLogEntry {
  return createAuditLog({
    eventType: 'auth.login_failed',
    severity: 'warning',
    userEmail: email,
    ip,
    userAgent,
    action: 'Login attempt failed',
    details: { reason },
    success: false,
    errorMessage: reason,
  });
}

/**
 * Log de logout
 */
export function logLogout(userId: string, ip: string): AuditLogEntry {
  return createAuditLog({
    eventType: 'auth.logout',
    severity: 'info',
    userId,
    ip,
    action: 'User logged out',
    success: true,
  });
}

/**
 * Log de anomalia de segurança
 */
export function logSecurityAnomaly(
  userId: string | undefined,
  ip: string,
  anomalyType: string,
  details: Record<string, any>
): AuditLogEntry {
  return createAuditLog({
    eventType: 'security.anomaly_detected',
    severity: 'critical',
    userId,
    ip,
    action: `Security anomaly detected: ${anomalyType}`,
    details,
    success: false,
  });
}

/**
 * Log de rate limit excedido
 */
export function logRateLimitExceeded(ip: string, endpoint: string, userId?: string): AuditLogEntry {
  return createAuditLog({
    eventType: 'security.rate_limit_exceeded',
    severity: 'warning',
    userId,
    ip,
    resource: endpoint,
    action: 'Rate limit exceeded',
    success: false,
  });
}

/**
 * Log de alteração de dados
 */
export function logDataChange(
  eventType: 'data.created' | 'data.updated' | 'data.deleted',
  userId: string,
  resource: string,
  resourceId: string,
  previousValue?: any,
  newValue?: any
): AuditLogEntry {
  return createAuditLog({
    eventType,
    severity: 'info',
    userId,
    resource,
    resourceId,
    action: `Data ${eventType.split('.')[1]}`,
    previousValue,
    newValue,
    success: true,
  });
}

export const auditConfig = AUDIT_CONFIG;
