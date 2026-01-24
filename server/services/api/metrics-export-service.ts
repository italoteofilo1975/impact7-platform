/**
 * Serviço de Exportação de Métricas
 * Permite exportar métricas em CSV e JSON
 */

import { getMetricsSummary, getEndpointStats, getClientStats, getTimeSeries, getErrorMetrics, TIME_RANGES } from './api-metrics-service';

const TIME_RANGE_MAP: Record<string, number> = {
  hour: TIME_RANGES.HOUR,
  day: TIME_RANGES.DAY,
  week: TIME_RANGES.WEEK,
  month: TIME_RANGES.WEEK * 4,
};

export interface ExportOptions {
  format: 'csv' | 'json';
  timeRange: 'hour' | 'day' | 'week' | 'month';
  includeEndpoints?: boolean;
  includeClients?: boolean;
  includeErrors?: boolean;
  includeTimeSeries?: boolean;
}

export interface ExportResult {
  data: string;
  filename: string;
  mimeType: string;
}

class MetricsExportService {
  /**
   * Exportar métricas completas
   */
  async exportMetrics(options: ExportOptions): Promise<ExportResult> {
    const { format, timeRange, includeEndpoints = true, includeClients = true, includeErrors = true, includeTimeSeries = true } = options;
    
    // Coletar dados
    const data: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      timeRange,
      summary: getMetricsSummary(TIME_RANGE_MAP[timeRange] || TIME_RANGES.HOUR),
    };
    
    if (includeEndpoints) {
      data.endpoints = getEndpointStats(TIME_RANGE_MAP[timeRange] || TIME_RANGES.HOUR);
    }
    
    if (includeClients) {
      data.clients = getClientStats(TIME_RANGE_MAP[timeRange] || TIME_RANGES.HOUR);
    }
    
    if (includeErrors) {
      data.errors = getErrorMetrics(TIME_RANGES.HOUR).recentErrors;
    }
    
    if (includeTimeSeries) {
      data.timeSeries = getTimeSeries(TIME_RANGE_MAP[timeRange] || TIME_RANGES.HOUR);
    }
    
    // Formatar saída
    if (format === 'json') {
      return {
        data: JSON.stringify(data, null, 2),
        filename: `metrics-export-${timeRange}-${Date.now()}.json`,
        mimeType: 'application/json',
      };
    }
    
    // CSV format
    const csvData = this.convertToCSV(data);
    return {
      data: csvData,
      filename: `metrics-export-${timeRange}-${Date.now()}.csv`,
      mimeType: 'text/csv',
    };
  }
  
  /**
   * Exportar apenas endpoints
   */
  async exportEndpoints(timeRange: 'hour' | 'day' | 'week'): Promise<ExportResult> {
    const endpoints = getEndpointStats(TIME_RANGE_MAP[timeRange] || TIME_RANGES.HOUR);
    
    const headers = ['Endpoint', 'Method', 'Requests', 'Avg Latency (ms)', 'P95 (ms)', 'P99 (ms)', 'Error Rate (%)'];
    const rows = endpoints.map((e) => [
      e.endpoint,
      e.method,
      e.totalRequests.toString(),
      e.avgResponseTime.toFixed(2),
      e.p95ResponseTime.toFixed(2),
      e.p99ResponseTime.toFixed(2),
      ((e.errorCount / e.totalRequests) * 100).toFixed(2),
    ]);
    
    const csv = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
    
    return {
      data: csv,
      filename: `endpoints-export-${timeRange}-${Date.now()}.csv`,
      mimeType: 'text/csv',
    };
  }
  
  /**
   * Exportar apenas erros
   */
  async exportErrors(timeRange: 'hour' | 'day' | 'week'): Promise<ExportResult> {
    const errors = getErrorMetrics(TIME_RANGES.HOUR).recentErrors;
    
    const headers = ['Timestamp', 'Endpoint', 'Method', 'Status', 'Message', 'Client'];
    const rows = errors.map((e: { timestamp: number; endpoint: string; statusCode: number; clientId: string }) => [
      new Date(e.timestamp).toISOString(),
      e.endpoint,
      'GET',
      e.statusCode.toString(),
      '"Error"',
      e.clientId || 'anonymous',
    ]);
    
    const csv = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
    
    return {
      data: csv,
      filename: `errors-export-${timeRange}-${Date.now()}.csv`,
      mimeType: 'text/csv',
    };
  }
  
  /**
   * Converter objeto para CSV
   */
  private convertToCSV(data: Record<string, unknown>): string {
    const lines: string[] = [];
    
    // Summary section
    lines.push('=== SUMMARY ===');
    const summary = data.summary as Record<string, unknown>;
    if (summary) {
      Object.entries(summary).forEach(([key, value]) => {
        lines.push(`${key},${value}`);
      });
    }
    lines.push('');
    
    // Endpoints section
    if (data.endpoints) {
      lines.push('=== ENDPOINTS ===');
      lines.push('Endpoint,Method,Requests,Avg Latency,P95,P99,Error Rate');
      const endpoints = data.endpoints as Array<Record<string, unknown>>;
      endpoints.forEach(e => {
        lines.push(`${e.endpoint},${e.method},${e.requests},${e.avgLatency},${e.p95},${e.p99},${e.errorRate}`);
      });
      lines.push('');
    }
    
    // Clients section
    if (data.clients) {
      lines.push('=== CLIENTS ===');
      lines.push('Client ID,Name,Requests,Errors,Last Request');
      const clients = data.clients as Array<Record<string, unknown>>;
      clients.forEach(c => {
        lines.push(`${c.clientId},${c.name},${c.requests},${c.errors},${c.lastRequest}`);
      });
      lines.push('');
    }
    
    // Errors section
    if (data.errors) {
      lines.push('=== ERRORS ===');
      lines.push('Timestamp,Endpoint,Method,Status,Message');
      const errors = data.errors as Array<Record<string, unknown>>;
      errors.slice(0, 100).forEach(e => {
        lines.push(`${e.timestamp},${e.endpoint},${e.method},${e.status},"${String(e.message).replace(/"/g, '""')}"`);
      });
    }
    
    return lines.join('\n');
  }
}

export const metricsExportService = new MetricsExportService();
