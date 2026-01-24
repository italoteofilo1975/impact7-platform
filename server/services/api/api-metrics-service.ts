/**
 * Serviço de Métricas de Uso da API
 * Coleta e analisa métricas de uso por endpoint, cliente e tempo
 */

interface RequestMetric {
  endpoint: string;
  method: string;
  clientId: string;
  statusCode: number;
  responseTime: number;
  timestamp: number;
  userAgent?: string;
  ip?: string;
}

interface EndpointStats {
  endpoint: string;
  method: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
}

interface ClientStats {
  clientId: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
  topEndpoints: { endpoint: string; count: number }[];
  lastRequest: number;
}

interface TimeSeriesPoint {
  timestamp: number;
  requests: number;
  errors: number;
  avgResponseTime: number;
}

// Armazenamento em memória (em produção, usar TimescaleDB ou InfluxDB)
const metricsStore: RequestMetric[] = [];
const MAX_METRICS = 100000; // Manter últimas 100k requisições

// Constantes
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * Registra uma métrica de requisição
 */
export function recordMetric(metric: Omit<RequestMetric, "timestamp">): void {
  const fullMetric: RequestMetric = {
    ...metric,
    timestamp: Date.now(),
  };
  
  metricsStore.push(fullMetric);
  
  // Limitar tamanho do store
  if (metricsStore.length > MAX_METRICS) {
    metricsStore.splice(0, metricsStore.length - MAX_METRICS);
  }
}

/**
 * Obtém estatísticas por endpoint
 */
export function getEndpointStats(timeRange: number = HOUR_MS): EndpointStats[] {
  const now = Date.now();
  const cutoff = now - timeRange;
  
  // Filtrar métricas no período
  const recentMetrics = metricsStore.filter(m => m.timestamp >= cutoff);
  
  // Agrupar por endpoint
  const endpointMap = new Map<string, RequestMetric[]>();
  recentMetrics.forEach(metric => {
    const key = `${metric.method}:${metric.endpoint}`;
    const existing = endpointMap.get(key) || [];
    existing.push(metric);
    endpointMap.set(key, existing);
  });
  
  // Calcular estatísticas
  const stats: EndpointStats[] = [];
  
  endpointMap.forEach((metrics, key) => {
    const [method, endpoint] = key.split(":");
    const responseTimes = metrics.map(m => m.responseTime).sort((a, b) => a - b);
    const successCount = metrics.filter(m => m.statusCode >= 200 && m.statusCode < 400).length;
    const errorCount = metrics.filter(m => m.statusCode >= 400).length;
    
    stats.push({
      endpoint,
      method,
      totalRequests: metrics.length,
      successCount,
      errorCount,
      avgResponseTime: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
      p50ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.5)] || 0,
      p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)] || 0,
      p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)] || 0,
      requestsPerMinute: Math.round(metrics.length / (timeRange / MINUTE_MS) * 10) / 10,
      errorRate: Math.round((errorCount / metrics.length) * 100 * 10) / 10,
    });
  });
  
  // Ordenar por total de requisições
  return stats.sort((a, b) => b.totalRequests - a.totalRequests);
}

/**
 * Obtém estatísticas por cliente
 */
export function getClientStats(timeRange: number = HOUR_MS): ClientStats[] {
  const now = Date.now();
  const cutoff = now - timeRange;
  
  const recentMetrics = metricsStore.filter(m => m.timestamp >= cutoff);
  
  // Agrupar por cliente
  const clientMap = new Map<string, RequestMetric[]>();
  recentMetrics.forEach(metric => {
    const existing = clientMap.get(metric.clientId) || [];
    existing.push(metric);
    clientMap.set(metric.clientId, existing);
  });
  
  const stats: ClientStats[] = [];
  
  clientMap.forEach((metrics, clientId) => {
    const responseTimes = metrics.map(m => m.responseTime);
    const successCount = metrics.filter(m => m.statusCode >= 200 && m.statusCode < 400).length;
    const errorCount = metrics.filter(m => m.statusCode >= 400).length;
    
    // Top endpoints para este cliente
    const endpointCounts = new Map<string, number>();
    metrics.forEach(m => {
      const count = endpointCounts.get(m.endpoint) || 0;
      endpointCounts.set(m.endpoint, count + 1);
    });
    
    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    stats.push({
      clientId,
      totalRequests: metrics.length,
      successCount,
      errorCount,
      avgResponseTime: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
      topEndpoints,
      lastRequest: Math.max(...metrics.map(m => m.timestamp)),
    });
  });
  
  return stats.sort((a, b) => b.totalRequests - a.totalRequests);
}

/**
 * Obtém série temporal de métricas
 */
export function getTimeSeries(
  timeRange: number = HOUR_MS,
  bucketSize: number = MINUTE_MS
): TimeSeriesPoint[] {
  const now = Date.now();
  const cutoff = now - timeRange;
  
  const recentMetrics = metricsStore.filter(m => m.timestamp >= cutoff);
  
  // Criar buckets
  const buckets = new Map<number, RequestMetric[]>();
  const bucketCount = Math.ceil(timeRange / bucketSize);
  
  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = cutoff + (i * bucketSize);
    buckets.set(bucketStart, []);
  }
  
  // Distribuir métricas nos buckets
  recentMetrics.forEach(metric => {
    const bucketStart = cutoff + Math.floor((metric.timestamp - cutoff) / bucketSize) * bucketSize;
    const bucket = buckets.get(bucketStart);
    if (bucket) {
      bucket.push(metric);
    }
  });
  
  // Calcular pontos da série
  const series: TimeSeriesPoint[] = [];
  
  buckets.forEach((metrics, timestamp) => {
    const errors = metrics.filter(m => m.statusCode >= 400).length;
    const responseTimes = metrics.map(m => m.responseTime);
    
    series.push({
      timestamp,
      requests: metrics.length,
      errors,
      avgResponseTime: responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0,
    });
  });
  
  return series.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Obtém resumo geral das métricas
 */
export function getMetricsSummary(timeRange: number = HOUR_MS): {
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  uniqueClients: number;
  topEndpoint: string | null;
  slowestEndpoint: string | null;
  requestsPerMinute: number;
} {
  const now = Date.now();
  const cutoff = now - timeRange;
  
  const recentMetrics = metricsStore.filter(m => m.timestamp >= cutoff);
  
  if (recentMetrics.length === 0) {
    return {
      totalRequests: 0,
      totalErrors: 0,
      errorRate: 0,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      uniqueClients: 0,
      topEndpoint: null,
      slowestEndpoint: null,
      requestsPerMinute: 0,
    };
  }
  
  const errors = recentMetrics.filter(m => m.statusCode >= 400);
  const responseTimes = recentMetrics.map(m => m.responseTime).sort((a, b) => a - b);
  const uniqueClients = new Set(recentMetrics.map(m => m.clientId)).size;
  
  // Top endpoint
  const endpointCounts = new Map<string, number>();
  recentMetrics.forEach(m => {
    const count = endpointCounts.get(m.endpoint) || 0;
    endpointCounts.set(m.endpoint, count + 1);
  });
  
  let topEndpoint: string | null = null;
  let maxCount = 0;
  endpointCounts.forEach((count, endpoint) => {
    if (count > maxCount) {
      maxCount = count;
      topEndpoint = endpoint;
    }
  });
  
  // Slowest endpoint (média)
  const endpointTimes = new Map<string, number[]>();
  recentMetrics.forEach(m => {
    const times = endpointTimes.get(m.endpoint) || [];
    times.push(m.responseTime);
    endpointTimes.set(m.endpoint, times);
  });
  
  let slowestEndpoint: string | null = null;
  let maxAvgTime = 0;
  endpointTimes.forEach((times, endpoint) => {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    if (avg > maxAvgTime) {
      maxAvgTime = avg;
      slowestEndpoint = endpoint;
    }
  });
  
  return {
    totalRequests: recentMetrics.length,
    totalErrors: errors.length,
    errorRate: Math.round((errors.length / recentMetrics.length) * 100 * 10) / 10,
    avgResponseTime: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
    p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)] || 0,
    uniqueClients,
    topEndpoint,
    slowestEndpoint,
    requestsPerMinute: Math.round(recentMetrics.length / (timeRange / MINUTE_MS) * 10) / 10,
  };
}

/**
 * Obtém métricas de erros
 */
export function getErrorMetrics(timeRange: number = HOUR_MS): {
  byStatusCode: { code: number; count: number }[];
  byEndpoint: { endpoint: string; count: number; rate: number }[];
  recentErrors: { timestamp: number; endpoint: string; statusCode: number; clientId: string }[];
} {
  const now = Date.now();
  const cutoff = now - timeRange;
  
  const recentMetrics = metricsStore.filter(m => m.timestamp >= cutoff);
  const errorMetrics = recentMetrics.filter(m => m.statusCode >= 400);
  
  // Por status code
  const statusCounts = new Map<number, number>();
  errorMetrics.forEach(m => {
    const count = statusCounts.get(m.statusCode) || 0;
    statusCounts.set(m.statusCode, count + 1);
  });
  
  const byStatusCode = Array.from(statusCounts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);
  
  // Por endpoint
  const endpointErrors = new Map<string, number>();
  const endpointTotals = new Map<string, number>();
  
  recentMetrics.forEach(m => {
    const total = endpointTotals.get(m.endpoint) || 0;
    endpointTotals.set(m.endpoint, total + 1);
    
    if (m.statusCode >= 400) {
      const errors = endpointErrors.get(m.endpoint) || 0;
      endpointErrors.set(m.endpoint, errors + 1);
    }
  });
  
  const byEndpoint = Array.from(endpointErrors.entries())
    .map(([endpoint, count]) => ({
      endpoint,
      count,
      rate: Math.round((count / (endpointTotals.get(endpoint) || 1)) * 100 * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count);
  
  // Erros recentes
  const recentErrors = errorMetrics
    .slice(-20)
    .reverse()
    .map(m => ({
      timestamp: m.timestamp,
      endpoint: m.endpoint,
      statusCode: m.statusCode,
      clientId: m.clientId,
    }));
  
  return { byStatusCode, byEndpoint, recentErrors };
}

/**
 * Limpa métricas antigas
 */
export function cleanupOldMetrics(maxAge: number = DAY_MS): number {
  const cutoff = Date.now() - maxAge;
  const initialLength = metricsStore.length;
  
  // Remover métricas antigas
  let i = 0;
  while (i < metricsStore.length && metricsStore[i].timestamp < cutoff) {
    i++;
  }
  
  if (i > 0) {
    metricsStore.splice(0, i);
  }
  
  return initialLength - metricsStore.length;
}

/**
 * Obtém contagem total de métricas armazenadas
 */
export function getMetricsCount(): number {
  return metricsStore.length;
}

// Limpeza periódica (a cada hora)
setInterval(() => {
  const removed = cleanupOldMetrics();
  if (removed > 0) {
    console.log(`[ApiMetrics] Removidas ${removed} métricas antigas`);
  }
}, HOUR_MS);

// Exportar constantes úteis
export const TIME_RANGES = {
  MINUTE: MINUTE_MS,
  HOUR: HOUR_MS,
  DAY: DAY_MS,
  WEEK: 7 * DAY_MS,
};
