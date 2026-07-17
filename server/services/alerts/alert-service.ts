/**
 * Alert Service
 * SET7.06 - Operação, Observabilidade e Eficiência Cognitiva
 * 
 * Sistema de alertas em produção, pelo adaptador de notificações da plataforma
 */

import { notifyOwner } from "../../_core/notification";
import { getAllCircuitBreakerStatus, CircuitState } from "../../middleware/circuit-breaker";

// Tipos
export type AlertSeverity = 'P1' | 'P2' | 'P3' | 'P4';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  timestamp: number;
  acknowledged: boolean;
  resolvedAt?: number;
}

export interface AlertRule {
  id: string;
  name: string;
  severity: AlertSeverity;
  condition: (metrics: SystemMetrics) => boolean;
  message: (metrics: SystemMetrics) => string;
  cooldownMs: number;
}

export interface SystemMetrics {
  // API Metrics
  apiAvailability: number;
  apiLatencyP95: number;
  apiErrorRate: number;
  
  // Jarvis Metrics
  jarvisLatencyP95: number;
  jarvisErrorRate: number;
  
  // Database Metrics
  dbConnectionsActive: number;
  dbConnectionsMax: number;
  dbQueryLatencyP95: number;
  
  // Circuit Breaker Status
  circuitBreakers: {
    llm: CircuitState;
    database: CircuitState;
    externalServices: CircuitState;
  };
  
  // System
  timestamp: number;
}

// Store de alertas em memória
const activeAlerts: Map<string, Alert> = new Map();
const alertHistory: Alert[] = [];
const lastAlertTime: Map<string, number> = new Map();

// Métricas coletadas (simuladas - em produção viria de um sistema de métricas real)
let currentMetrics: SystemMetrics = {
  apiAvailability: 1.0,
  apiLatencyP95: 200,
  apiErrorRate: 0.001,
  jarvisLatencyP95: 2000,
  jarvisErrorRate: 0.01,
  dbConnectionsActive: 5,
  dbConnectionsMax: 100,
  dbQueryLatencyP95: 50,
  circuitBreakers: {
    llm: CircuitState.CLOSED,
    database: CircuitState.CLOSED,
    externalServices: CircuitState.CLOSED,
  },
  timestamp: Date.now(),
};

// Regras de alerta
const alertRules: AlertRule[] = [
  // P1 - Crítico
  {
    id: 'API_DOWN',
    name: 'API Indisponível',
    severity: 'P1',
    condition: (m) => m.apiAvailability < 0.95,
    message: (m) => `API com disponibilidade de ${(m.apiAvailability * 100).toFixed(1)}% (SLO: 99.9%)`,
    cooldownMs: 5 * 60 * 1000, // 5 minutos
  },
  {
    id: 'CIRCUIT_BREAKER_OPEN',
    name: 'Circuit Breaker Aberto',
    severity: 'P1',
    condition: (m) => m.circuitBreakers.llm === CircuitState.OPEN || m.circuitBreakers.database === CircuitState.OPEN,
    message: (m) => {
      const open = [];
      if (m.circuitBreakers.llm === CircuitState.OPEN) open.push('LLM');
      if (m.circuitBreakers.database === CircuitState.OPEN) open.push('Database');
      return `Circuit Breaker(s) aberto(s): ${open.join(', ')}`;
    },
    cooldownMs: 5 * 60 * 1000,
  },
  {
    id: 'ERROR_RATE_CRITICAL',
    name: 'Taxa de Erro Crítica',
    severity: 'P1',
    condition: (m) => m.apiErrorRate > 0.10,
    message: (m) => `Taxa de erro da API em ${(m.apiErrorRate * 100).toFixed(1)}% (limite: 10%)`,
    cooldownMs: 5 * 60 * 1000,
  },
  
  // P2 - Alto
  {
    id: 'LATENCY_DEGRADED',
    name: 'Latência Degradada',
    severity: 'P2',
    condition: (m) => m.apiLatencyP95 > 1000,
    message: (m) => `Latência p95 da API em ${m.apiLatencyP95}ms (SLO: 500ms)`,
    cooldownMs: 15 * 60 * 1000, // 15 minutos
  },
  {
    id: 'JARVIS_SLOW',
    name: 'Jarvis Lento',
    severity: 'P2',
    condition: (m) => m.jarvisLatencyP95 > 10000,
    message: (m) => `Latência p95 do Jarvis em ${m.jarvisLatencyP95}ms (SLO: 5000ms)`,
    cooldownMs: 30 * 60 * 1000, // 30 minutos
  },
  {
    id: 'DB_CONNECTIONS_HIGH',
    name: 'Conexões DB Altas',
    severity: 'P2',
    condition: (m) => (m.dbConnectionsActive / m.dbConnectionsMax) > 0.7,
    message: (m) => `Pool de conexões em ${((m.dbConnectionsActive / m.dbConnectionsMax) * 100).toFixed(0)}% (limite: 70%)`,
    cooldownMs: 15 * 60 * 1000,
  },
  
  // P3 - Médio
  {
    id: 'ERROR_RATE_ELEVATED',
    name: 'Taxa de Erro Elevada',
    severity: 'P3',
    condition: (m) => m.apiErrorRate > 0.01 && m.apiErrorRate <= 0.10,
    message: (m) => `Taxa de erro da API em ${(m.apiErrorRate * 100).toFixed(2)}% (normal: <1%)`,
    cooldownMs: 60 * 60 * 1000, // 1 hora
  },
  {
    id: 'JARVIS_ERROR_RATE',
    name: 'Erros do Jarvis',
    severity: 'P3',
    condition: (m) => m.jarvisErrorRate > 0.05,
    message: (m) => `Taxa de erro do Jarvis em ${(m.jarvisErrorRate * 100).toFixed(1)}%`,
    cooldownMs: 60 * 60 * 1000,
  },
];

/**
 * Gera ID único para alerta
 */
function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Verifica se está em cooldown
 */
function isInCooldown(ruleId: string, cooldownMs: number): boolean {
  const lastTime = lastAlertTime.get(ruleId);
  if (!lastTime) return false;
  return Date.now() - lastTime < cooldownMs;
}

/**
 * Dispara um alerta
 */
async function triggerAlert(rule: AlertRule, metrics: SystemMetrics): Promise<void> {
  // Verificar cooldown
  if (isInCooldown(rule.id, rule.cooldownMs)) {
    return;
  }
  
  const alert: Alert = {
    id: generateAlertId(),
    severity: rule.severity,
    title: `[${rule.severity}] ${rule.name}`,
    message: rule.message(metrics),
    source: rule.id,
    timestamp: Date.now(),
    acknowledged: false,
  };
  
  // Registrar alerta
  activeAlerts.set(alert.id, alert);
  alertHistory.push(alert);
  lastAlertTime.set(rule.id, Date.now());
  
  console.log(`[ALERT] ${alert.title}: ${alert.message}`);
  
  // Enviar notificação para P1 e P2
  if (rule.severity === 'P1' || rule.severity === 'P2') {
    try {
      await notifyOwner({
        title: alert.title,
        content: `${alert.message}\n\nTimestamp: ${new Date(alert.timestamp).toISOString()}`,
      });
    } catch (error) {
      console.error('[ALERT] Falha ao enviar notificação:', error);
    }
  }
}

/**
 * Verifica todas as regras de alerta
 */
export async function checkAlerts(): Promise<void> {
  // Atualizar métricas de circuit breaker
  const cbStatus = getAllCircuitBreakerStatus();
  currentMetrics.circuitBreakers = {
    llm: cbStatus.llm.state,
    database: cbStatus.database.state,
    externalServices: cbStatus.externalServices.state,
  };
  currentMetrics.timestamp = Date.now();
  
  // Verificar cada regra
  for (const rule of alertRules) {
    try {
      if (rule.condition(currentMetrics)) {
        await triggerAlert(rule, currentMetrics);
      }
    } catch (error) {
      console.error(`[ALERT] Erro ao verificar regra ${rule.id}:`, error);
    }
  }
}

/**
 * Atualiza métricas (chamado por outros serviços)
 */
export function updateMetrics(updates: Partial<SystemMetrics>): void {
  currentMetrics = { ...currentMetrics, ...updates, timestamp: Date.now() };
}

/**
 * Retorna métricas atuais
 */
export function getMetrics(): SystemMetrics {
  return { ...currentMetrics };
}

/**
 * Retorna alertas ativos
 */
export function getActiveAlerts(): Alert[] {
  return Array.from(activeAlerts.values());
}

/**
 * Retorna histórico de alertas
 */
export function getAlertHistory(limit: number = 100): Alert[] {
  return alertHistory.slice(-limit);
}

/**
 * Reconhece um alerta
 */
export function acknowledgeAlert(alertId: string): boolean {
  const alert = activeAlerts.get(alertId);
  if (alert) {
    alert.acknowledged = true;
    return true;
  }
  return false;
}

/**
 * Resolve um alerta
 */
export function resolveAlert(alertId: string): boolean {
  const alert = activeAlerts.get(alertId);
  if (alert) {
    alert.resolvedAt = Date.now();
    activeAlerts.delete(alertId);
    return true;
  }
  return false;
}

/**
 * Retorna resumo do sistema de alertas
 */
export function getAlertSummary() {
  const active = getActiveAlerts();
  return {
    totalActive: active.length,
    bySeverity: {
      P1: active.filter(a => a.severity === 'P1').length,
      P2: active.filter(a => a.severity === 'P2').length,
      P3: active.filter(a => a.severity === 'P3').length,
      P4: active.filter(a => a.severity === 'P4').length,
    },
    unacknowledged: active.filter(a => !a.acknowledged).length,
    lastCheck: currentMetrics.timestamp,
    metrics: currentMetrics,
  };
}

// Iniciar verificação periódica de alertas (a cada 30 segundos)
let alertCheckInterval: NodeJS.Timeout | null = null;

export function startAlertMonitoring(): void {
  if (alertCheckInterval) return;
  
  console.log('[ALERT] Iniciando monitoramento de alertas...');
  alertCheckInterval = setInterval(checkAlerts, 30 * 1000);
  
  // Verificar imediatamente
  checkAlerts();
}

export function stopAlertMonitoring(): void {
  if (alertCheckInterval) {
    clearInterval(alertCheckInterval);
    alertCheckInterval = null;
    console.log('[ALERT] Monitoramento de alertas parado.');
  }
}
