/**
 * System Metrics Service
 * SET7.06 - Operação e Observabilidade
 * 
 * Coleta e expõe métricas de sistema para monitoramento
 */

import { getDb } from "../db";
import { users, leads, contacts, caseSubmissions, notifications, auditLogs } from "../../drizzle/schema";
import { sql, count, gte, and, eq } from "drizzle-orm";

// Interfaces
export interface SystemMetrics {
  timestamp: number;
  uptime: number;
  memory: MemoryMetrics;
  database: DatabaseMetrics;
  application: ApplicationMetrics;
  performance: PerformanceMetrics;
  slos: SLOMetrics;
}

export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  heapUsedPercent: number;
}

export interface DatabaseMetrics {
  totalUsers: number;
  totalLeads: number;
  totalContacts: number;
  totalCases: number;
  pendingCases: number;
  totalNotifications: number;
  unreadNotifications: number;
  totalAuditLogs: number;
}

export interface ApplicationMetrics {
  activeUsers24h: number;
  newLeads24h: number;
  newLeads7d: number;
  casesSubmitted24h: number;
  casesApproved24h: number;
  notificationsSent24h: number;
}

export interface PerformanceMetrics {
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  requestsPerMinute: number;
}

export interface SLOMetrics {
  availability: SLOStatus;
  latency: SLOStatus;
  errorRate: SLOStatus;
  overall: SLOStatus;
}

export interface SLOStatus {
  target: number;
  current: number;
  status: "healthy" | "warning" | "critical";
  budget: number;
  budgetRemaining: number;
}

// SLO Targets
const SLO_TARGETS = {
  availability: 99.5, // 99.5% uptime
  latencyP95: 500, // 500ms p95
  errorRate: 1, // 1% max error rate
};

// In-memory metrics storage
let requestMetrics: { timestamp: number; duration: number; error: boolean }[] = [];
const MAX_METRICS_HISTORY = 10000;

// Track request
export function trackRequest(duration: number, error: boolean = false) {
  requestMetrics.push({
    timestamp: Date.now(),
    duration,
    error,
  });
  
  // Keep only recent metrics
  if (requestMetrics.length > MAX_METRICS_HISTORY) {
    requestMetrics = requestMetrics.slice(-MAX_METRICS_HISTORY);
  }
}

// Get memory metrics
function getMemoryMetrics(): MemoryMetrics {
  const mem = process.memoryUsage();
  return {
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    external: mem.external,
    rss: mem.rss,
    heapUsedPercent: Math.round((mem.heapUsed / mem.heapTotal) * 100),
  };
}

// Get database metrics
async function getDatabaseMetrics(): Promise<DatabaseMetrics> {
  const db = await getDb();
  if (!db) {
    return {
      totalUsers: 0,
      totalLeads: 0,
      totalContacts: 0,
      totalCases: 0,
      pendingCases: 0,
      totalNotifications: 0,
      unreadNotifications: 0,
      totalAuditLogs: 0,
    };
  }
  
  const [
    usersResult,
    leadsResult,
    contactsResult,
    casesResult,
    pendingCasesResult,
    notificationsResult,
    unreadNotificationsResult,
    auditLogsResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(leads),
    db.select({ count: count() }).from(contacts),
    db.select({ count: count() }).from(caseSubmissions),
    db.select({ count: count() }).from(caseSubmissions).where(eq(caseSubmissions.status, "pending")),
    db.select({ count: count() }).from(notifications),
    db.select({ count: count() }).from(notifications).where(eq(notifications.isRead, 0)),
    db.select({ count: count() }).from(auditLogs),
  ]);

  return {
    totalUsers: usersResult[0]?.count || 0,
    totalLeads: leadsResult[0]?.count || 0,
    totalContacts: contactsResult[0]?.count || 0,
    totalCases: casesResult[0]?.count || 0,
    pendingCases: pendingCasesResult[0]?.count || 0,
    totalNotifications: notificationsResult[0]?.count || 0,
    unreadNotifications: unreadNotificationsResult[0]?.count || 0,
    totalAuditLogs: auditLogsResult[0]?.count || 0,
  };
}

// Get application metrics
async function getApplicationMetrics(): Promise<ApplicationMetrics> {
  const db = await getDb();
  if (!db) {
    return {
      activeUsers24h: 0,
      newLeads24h: 0,
      newLeads7d: 0,
      casesSubmitted24h: 0,
      casesApproved24h: 0,
      notificationsSent24h: 0,
    };
  }
  
  const now = Date.now();
  const yesterday = now - 24 * 60 * 60 * 1000;
  const lastWeek = now - 7 * 24 * 60 * 60 * 1000;

  const [
    activeUsers24hResult,
    newLeads24hResult,
    newLeads7dResult,
    casesSubmitted24hResult,
    casesApproved24hResult,
    notificationsSent24hResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(users).where(gte(users.updatedAt, yesterday)),
    db.select({ count: count() }).from(leads).where(gte(leads.createdAt, yesterday)),
    db.select({ count: count() }).from(leads).where(gte(leads.createdAt, lastWeek)),
    db.select({ count: count() }).from(caseSubmissions).where(gte(caseSubmissions.createdAt, yesterday)),
    db.select({ count: count() }).from(caseSubmissions).where(
      and(
        gte(caseSubmissions.updatedAt, yesterday),
        eq(caseSubmissions.status, "approved")
      )
    ),
    db.select({ count: count() }).from(notifications).where(gte(notifications.createdAt, yesterday)),
  ]);

  return {
    activeUsers24h: activeUsers24hResult[0]?.count || 0,
    newLeads24h: newLeads24hResult[0]?.count || 0,
    newLeads7d: newLeads7dResult[0]?.count || 0,
    casesSubmitted24h: casesSubmitted24hResult[0]?.count || 0,
    casesApproved24h: casesApproved24hResult[0]?.count || 0,
    notificationsSent24h: notificationsSent24hResult[0]?.count || 0,
  };
}

// Get performance metrics
function getPerformanceMetrics(): PerformanceMetrics {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  
  // Filter recent metrics
  const recentMetrics = requestMetrics.filter(m => m.timestamp > fiveMinutesAgo);
  const lastMinuteMetrics = requestMetrics.filter(m => m.timestamp > oneMinuteAgo);
  
  if (recentMetrics.length === 0) {
    return {
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      requestsPerMinute: 0,
    };
  }
  
  // Calculate percentiles
  const durations = recentMetrics.map(m => m.duration).sort((a, b) => a - b);
  const p95Index = Math.floor(durations.length * 0.95);
  const p99Index = Math.floor(durations.length * 0.99);
  
  const errors = recentMetrics.filter(m => m.error).length;
  
  return {
    avgResponseTime: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    p95ResponseTime: durations[p95Index] || 0,
    p99ResponseTime: durations[p99Index] || 0,
    errorRate: Math.round((errors / recentMetrics.length) * 100 * 100) / 100,
    requestsPerMinute: lastMinuteMetrics.length,
  };
}

// Calculate SLO status
function calculateSLOStatus(target: number, current: number, isLowerBetter: boolean = false): SLOStatus {
  const budget = 100 - target;
  let budgetUsed: number;
  let status: "healthy" | "warning" | "critical";
  
  if (isLowerBetter) {
    // For metrics like error rate where lower is better
    budgetUsed = current;
    if (current <= target * 0.5) status = "healthy";
    else if (current <= target) status = "warning";
    else status = "critical";
  } else {
    // For metrics like availability where higher is better
    budgetUsed = 100 - current;
    if (current >= target) status = "healthy";
    else if (current >= target - budget / 2) status = "warning";
    else status = "critical";
  }
  
  return {
    target,
    current,
    status,
    budget,
    budgetRemaining: Math.max(0, budget - budgetUsed),
  };
}

// Get SLO metrics
function getSLOMetrics(performance: PerformanceMetrics): SLOMetrics {
  // Simulate availability based on error rate
  const availability = 100 - performance.errorRate;
  
  // Latency SLO (p95 should be under target)
  const latencyCompliance = performance.p95ResponseTime <= SLO_TARGETS.latencyP95 
    ? 100 
    : Math.max(0, 100 - ((performance.p95ResponseTime - SLO_TARGETS.latencyP95) / SLO_TARGETS.latencyP95) * 100);
  
  const availabilitySLO = calculateSLOStatus(SLO_TARGETS.availability, availability);
  const latencySLO = calculateSLOStatus(100, latencyCompliance);
  const errorRateSLO = calculateSLOStatus(SLO_TARGETS.errorRate, performance.errorRate, true);
  
  // Overall status
  const statuses = [availabilitySLO.status, latencySLO.status, errorRateSLO.status];
  let overallStatus: "healthy" | "warning" | "critical" = "healthy";
  if (statuses.includes("critical")) overallStatus = "critical";
  else if (statuses.includes("warning")) overallStatus = "warning";
  
  return {
    availability: availabilitySLO,
    latency: latencySLO,
    errorRate: errorRateSLO,
    overall: {
      target: 100,
      current: statuses.filter(s => s === "healthy").length / statuses.length * 100,
      status: overallStatus,
      budget: 0,
      budgetRemaining: 0,
    },
  };
}

// Get all system metrics
export async function getSystemMetrics(): Promise<SystemMetrics> {
  const [databaseMetrics, applicationMetrics] = await Promise.all([
    getDatabaseMetrics(),
    getApplicationMetrics(),
  ]);
  
  const memoryMetrics = getMemoryMetrics();
  const performanceMetrics = getPerformanceMetrics();
  const sloMetrics = getSLOMetrics(performanceMetrics);
  
  return {
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: memoryMetrics,
    database: databaseMetrics,
    application: applicationMetrics,
    performance: performanceMetrics,
    slos: sloMetrics,
  };
}

// Get metrics history (for charts)
export function getMetricsHistory(minutes: number = 60): { timestamp: number; duration: number; error: boolean }[] {
  const cutoff = Date.now() - minutes * 60 * 1000;
  return requestMetrics.filter(m => m.timestamp > cutoff);
}

// Health check
export async function healthCheck(): Promise<{ status: "healthy" | "degraded" | "unhealthy"; checks: Record<string, boolean> }> {
  const checks: Record<string, boolean> = {
    database: false,
    memory: false,
    uptime: false,
  };
  
  try {
    // Database check
    const db = await getDb();
    if (db) {
      await db.select({ count: count() }).from(users);
      checks.database = true;
    }
  } catch (e) {
    checks.database = false;
  }
  
  // Memory check (less than 90% heap used)
  const mem = process.memoryUsage();
  checks.memory = (mem.heapUsed / mem.heapTotal) < 0.9;
  
  // Uptime check (at least 1 minute)
  checks.uptime = process.uptime() > 60;
  
  const allPassing = Object.values(checks).every(v => v);
  const anyFailing = Object.values(checks).some(v => !v);
  
  return {
    status: allPassing ? "healthy" : anyFailing ? "unhealthy" : "degraded",
    checks,
  };
}

export default {
  trackRequest,
  getSystemMetrics,
  getMetricsHistory,
  healthCheck,
};
