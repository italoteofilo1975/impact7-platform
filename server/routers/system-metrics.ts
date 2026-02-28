/**
 * System Metrics Router
 * SET7.06 - Operação e Observabilidade
 */

import { z } from "zod";
import { router, adminProcedure, publicProcedure } from "../_core/trpc";
import { 
  getSystemMetrics, 
  getMetricsHistory, 
  healthCheck,
  trackRequest 
} from "../services/system-metrics-service";
import { getLatencyStats } from "../middleware/security-headers";

export const systemMetricsRouter = router({
  // Get all system metrics (admin only)
  getMetrics: adminProcedure.query(async () => {
    return await getSystemMetrics();
  }),

  // Get metrics history for charts (admin only)
  getHistory: adminProcedure
    .input(z.object({
      minutes: z.number().min(1).max(1440).default(60),
    }))
    .query(async ({ input }) => {
      const history = getMetricsHistory(input.minutes);
      
      // Aggregate by minute for charting
      const aggregated: Record<number, { count: number; totalDuration: number; errors: number }> = {};
      
      history.forEach(m => {
        const minute = Math.floor(m.timestamp / 60000) * 60000;
        if (!aggregated[minute]) {
          aggregated[minute] = { count: 0, totalDuration: 0, errors: 0 };
        }
        aggregated[minute].count++;
        aggregated[minute].totalDuration += m.duration;
        if (m.error) aggregated[minute].errors++;
      });
      
      return Object.entries(aggregated).map(([timestamp, data]) => ({
        timestamp: parseInt(timestamp),
        requestCount: data.count,
        avgDuration: Math.round(data.totalDuration / data.count),
        errorCount: data.errors,
        errorRate: Math.round((data.errors / data.count) * 100 * 100) / 100,
      })).sort((a, b) => a.timestamp - b.timestamp);
    }),

  // Health check endpoint (public)
  health: publicProcedure.query(async () => {
    return await healthCheck();
  }),

  // Get SLO summary (admin only)
  getSLOs: adminProcedure.query(async () => {
    const metrics = await getSystemMetrics();
    return {
      slos: metrics.slos,
      targets: {
        availability: 99.5,
        latencyP95: 500,
        errorRate: 1,
      },
    };
  }),

  // Get database stats (admin only)
  getDatabaseStats: adminProcedure.query(async () => {
    const metrics = await getSystemMetrics();
    return metrics.database;
  }),

  // Get application stats (admin only)
  getApplicationStats: adminProcedure.query(async () => {
    const metrics = await getSystemMetrics();
    return metrics.application;
  }),

  // Get real latency stats from request middleware (admin only)
  getLatencyStats: adminProcedure.query(() => {
    const stats = getLatencyStats();
    return {
      ...stats,
      sloP95Target: 500,
      sloP95Status: stats.p95 === 0 ? "healthy" : stats.p95 < 500 ? "healthy" : stats.p95 < 1000 ? "warning" : "critical",
      sloP99Target: 1000,
      sloP99Status: stats.p99 === 0 ? "healthy" : stats.p99 < 1000 ? "healthy" : stats.p99 < 2000 ? "warning" : "critical",
    };
  }),

  // Get memory stats (admin only)
  getMemoryStats: adminProcedure.query(async () => {
    const metrics = await getSystemMetrics();
    return {
      ...metrics.memory,
      uptime: metrics.uptime,
      uptimeFormatted: formatUptime(metrics.uptime),
    };
  }),
});

// Helper to format uptime
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.join(" ") || "< 1m";
}

export default systemMetricsRouter;
