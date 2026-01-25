/**
 * Serviço de Alertas de Anomalias
 * Detecta e notifica sobre comportamentos anormais na API
 */

import { getMetricsSummary, getEndpointStats, TIME_RANGES } from './api-metrics-service';
import { notifyOwner } from '../../_core/notification';

export interface AnomalyConfig {
  errorRateThreshold: number; // % de erros para alertar
  latencyThreshold: number; // ms de latência para alertar
  requestSpikeMultiplier: number; // multiplicador de requisições para alertar
  checkIntervalMs: number; // intervalo de verificação
}

export interface Anomaly {
  id: string;
  type: 'error_rate' | 'high_latency' | 'request_spike' | 'service_down';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  endpoint?: string;
  detectedAt: Date;
  acknowledged: boolean;
}

const DEFAULT_CONFIG: AnomalyConfig = {
  errorRateThreshold: 5, // 5% de erros
  latencyThreshold: 2000, // 2 segundos
  requestSpikeMultiplier: 3, // 3x o normal
  checkIntervalMs: 60000, // 1 minuto
};

class AnomalyAlertService {
  private config: AnomalyConfig;
  private anomalies: Map<string, Anomaly> = new Map();
  private baselineMetrics: { avgRequests: number; avgLatency: number; avgErrorRate: number } | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  
  constructor(config: Partial<AnomalyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Iniciar monitoramento de anomalias
   */
  start(): void {
    if (this.checkInterval) return;
    
    // Calcular baseline inicial
    this.updateBaseline();
    
    // Verificar anomalias periodicamente
    this.checkInterval = setInterval(() => {
      this.checkForAnomalies();
    }, this.config.checkIntervalMs);
    
    console.log('[AnomalyAlert] Monitoramento iniciado');
  }
  
  /**
   * Parar monitoramento
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
  
  /**
   * Atualizar baseline de métricas
   */
  private updateBaseline(): void {
    const summary = getMetricsSummary(TIME_RANGES.DAY);
    this.baselineMetrics = {
      avgRequests: summary.totalRequests / 24, // por hora
      avgLatency: summary.avgResponseTime,
      avgErrorRate: (summary.totalErrors / summary.totalRequests) * 100,
    };
  }
  
  /**
   * Verificar anomalias
   */
  private async checkForAnomalies(): Promise<void> {
    const summary = getMetricsSummary(TIME_RANGES.HOUR);
    const endpoints = getEndpointStats(TIME_RANGES.HOUR);
    
    // Verificar taxa de erro global
    const errorRate = (summary.totalErrors / summary.totalRequests) * 100;
    if (errorRate > this.config.errorRateThreshold) {
      await this.createAnomaly({
        type: 'error_rate',
        severity: errorRate > this.config.errorRateThreshold * 2 ? 'critical' : 'warning',
        message: `Taxa de erro elevada: ${errorRate.toFixed(2)}%`,
        value: errorRate,
        threshold: this.config.errorRateThreshold,
      });
    }
    
    // Verificar latência por endpoint
    for (const endpoint of endpoints) {
      if (endpoint.avgResponseTime > this.config.latencyThreshold) {
        await this.createAnomaly({
          type: 'high_latency',
          severity: endpoint.avgResponseTime > this.config.latencyThreshold * 2 ? 'critical' : 'warning',
          message: `Latência elevada em ${endpoint.endpoint}: ${endpoint.avgResponseTime.toFixed(0)}ms`,
          value: endpoint.avgResponseTime,
          threshold: this.config.latencyThreshold,
          endpoint: endpoint.endpoint,
        });
      }
    }
    
    // Verificar spike de requisições
    if (this.baselineMetrics && summary.totalRequests > this.baselineMetrics.avgRequests * this.config.requestSpikeMultiplier) {
      await this.createAnomaly({
        type: 'request_spike',
        severity: 'warning',
        message: `Spike de requisições: ${summary.totalRequests} (normal: ${this.baselineMetrics.avgRequests.toFixed(0)})`,
        value: summary.totalRequests,
        threshold: this.baselineMetrics.avgRequests * this.config.requestSpikeMultiplier,
      });
    }
  }
  
  /**
   * Criar anomalia e notificar
   */
  private async createAnomaly(data: Omit<Anomaly, 'id' | 'detectedAt' | 'acknowledged'>): Promise<void> {
    const id = `anomaly_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const anomaly: Anomaly = {
      ...data,
      id,
      detectedAt: Date.now(),
      acknowledged: false,
    };
    
    this.anomalies.set(id, anomaly);
    
    // Notificar owner se crítico
    if (anomaly.severity === 'critical') {
      try {
        await notifyOwner({
          title: `[CRITICAL] ${anomaly.type.toUpperCase()}`,
          content: anomaly.message,
        });
      } catch (error) {
        console.error('[AnomalyAlert] Erro ao notificar:', error);
      }
    }
    
    console.log(`[AnomalyAlert] ${anomaly.severity.toUpperCase()}: ${anomaly.message}`);
  }
  
  /**
   * Obter anomalias ativas
   */
  getActiveAnomalies(): Anomaly[] {
    return Array.from(this.anomalies.values())
      .filter(a => !a.acknowledged)
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }
  
  /**
   * Obter todas as anomalias
   */
  getAllAnomalies(limit: number = 100): Anomaly[] {
    return Array.from(this.anomalies.values())
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
      .slice(0, limit);
  }
  
  /**
   * Reconhecer anomalia
   */
  acknowledgeAnomaly(id: string): boolean {
    const anomaly = this.anomalies.get(id);
    if (anomaly) {
      anomaly.acknowledged = true;
      return true;
    }
    return false;
  }
  
  /**
   * Obter configuração atual
   */
  getConfig(): AnomalyConfig {
    return { ...this.config };
  }
  
  /**
   * Atualizar configuração
   */
  updateConfig(config: Partial<AnomalyConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Obter estatísticas de anomalias
   */
  getStats(): { total: number; active: number; critical: number; warning: number } {
    const all = Array.from(this.anomalies.values());
    return {
      total: all.length,
      active: all.filter(a => !a.acknowledged).length,
      critical: all.filter(a => a.severity === 'critical').length,
      warning: all.filter(a => a.severity === 'warning').length,
    };
  }
}

export const anomalyAlertService = new AnomalyAlertService();
