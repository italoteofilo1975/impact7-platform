/**
 * Error Monitoring Service
 * Centralized error tracking and reporting for production
 */

import { getDb } from '../db';
import { auditLogs } from '../../drizzle/schema';

interface ErrorContext {
  userId?: number;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  additionalData?: Record<string, unknown>;
}

interface ErrorReport {
  id: string;
  timestamp: number;
  level: 'error' | 'warning' | 'critical';
  message: string;
  stack?: string;
  context: ErrorContext;
  fingerprint: string;
}

// In-memory error buffer for batch processing
const errorBuffer: ErrorReport[] = [];
const MAX_BUFFER_SIZE = 100;
const FLUSH_INTERVAL = 60000; // 1 minute

// Error occurrence tracking for rate limiting alerts
const errorOccurrences: Map<string, { count: number; firstSeen: Date; lastSeen: Date }> = new Map();

/**
 * Generate a unique error fingerprint for deduplication
 */
function generateFingerprint(error: Error, context: ErrorContext): string {
  const parts = [
    error.name,
    error.message.substring(0, 100),
    context.endpoint || 'unknown',
    error.stack?.split('\n')[1]?.trim() || '',
  ];
  
  // Simple hash function
  let hash = 0;
  const str = parts.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Capture and track an error
 */
export async function captureError(
  error: Error,
  context: ErrorContext = {},
  level: 'error' | 'warning' | 'critical' = 'error'
): Promise<ErrorReport> {
  const timestamp = new Date();
  const fingerprint = generateFingerprint(error, context);
  
  const report: ErrorReport = {
    id: generateRequestId(),
    timestamp,
    level,
    message: error.message,
    stack: error.stack,
    context,
    fingerprint,
  };
  
  // Track error occurrences
  const existing = errorOccurrences.get(fingerprint);
  if (existing) {
    existing.count++;
    existing.lastSeen = timestamp;
  } else {
    errorOccurrences.set(fingerprint, {
      count: 1,
      firstSeen: timestamp,
      lastSeen: timestamp,
    });
  }
  
  // Add to buffer
  errorBuffer.push(report);
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${level.toUpperCase()}] ${error.message}`, {
      fingerprint,
      context,
      stack: error.stack,
    });
  }
  
  // Flush buffer if full
  if (errorBuffer.length >= MAX_BUFFER_SIZE) {
    await flushErrorBuffer();
  }
  
  // Alert on critical errors
  if (level === 'critical') {
    await alertCriticalError(report);
  }
  
  return report;
}

/**
 * Capture exception with automatic context extraction
 */
export async function captureException(
  error: unknown,
  context: ErrorContext = {}
): Promise<ErrorReport | null> {
  if (error instanceof Error) {
    return captureError(error, context);
  }
  
  // Convert non-Error to Error
  const wrappedError = new Error(
    typeof error === 'string' ? error : JSON.stringify(error)
  );
  return captureError(wrappedError, context);
}

/**
 * Capture a warning message
 */
export async function captureWarning(
  message: string,
  context: ErrorContext = {}
): Promise<ErrorReport> {
  const error = new Error(message);
  return captureError(error, context, 'warning');
}

/**
 * Flush error buffer to persistent storage
 */
async function flushErrorBuffer(): Promise<void> {
  if (errorBuffer.length === 0) return;
  
  const errors = [...errorBuffer];
  errorBuffer.length = 0;
  
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[ErrorMonitoring] Database not available, errors not persisted');
      return;
    }
    
    // Store errors in audit logs
    for (const report of errors) {
      await db.insert(auditLogs).values({
        action: 'create', // Using 'create' as generic action for error logging
        resourceType: `error_${report.level}`,
        resourceId: report.fingerprint,
        resourceName: report.message.substring(0, 255),
        userId: report.context.userId || null,
        metadata: JSON.stringify({
          message: report.message,
          stack: report.stack,
          context: report.context,
          fingerprint: report.fingerprint,
          errorLevel: report.level,
        }),
        ipAddress: report.context.ip || null,
        userAgent: report.context.userAgent || null,
      });
    }
    
    console.log(`[ErrorMonitoring] Flushed ${errors.length} errors to storage`);
  } catch (err) {
    console.error('[ErrorMonitoring] Failed to flush errors:', err);
    // Re-add errors to buffer
    errorBuffer.push(...errors);
  }
}

/**
 * Alert on critical errors
 */
async function alertCriticalError(report: ErrorReport): Promise<void> {
  // Log critical error prominently
  console.error('🚨 CRITICAL ERROR 🚨', {
    id: report.id,
    message: report.message,
    fingerprint: report.fingerprint,
    context: report.context,
  });
  
  // In production, this would send to notification service
  // For now, we just log it
}

/**
 * Get error statistics
 */
export function getErrorStats(): {
  totalErrors: number;
  uniqueErrors: number;
  errorsByLevel: Record<string, number>;
  topErrors: Array<{ fingerprint: string; count: number; message: string }>;
} {
  const stats = {
    totalErrors: 0,
    uniqueErrors: errorOccurrences.size,
    errorsByLevel: { error: 0, warning: 0, critical: 0 },
    topErrors: [] as Array<{ fingerprint: string; count: number; message: string }>,
  };
  
  // Count total errors
  errorOccurrences.forEach((data) => {
    stats.totalErrors += data.count;
  });
  
  // Get top errors
  const sortedErrors = Array.from(errorOccurrences.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
  
  stats.topErrors = sortedErrors.map(([fingerprint, data]) => ({
    fingerprint,
    count: data.count,
    message: '', // Would need to store message with fingerprint
  }));
  
  return stats;
}

/**
 * Clear old error occurrences (call periodically)
 */
export function cleanupOldErrors(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
  const cutoff = new Date(Date.now() - maxAgeMs);
  
  errorOccurrences.forEach((data, fingerprint) => {
    if (data.lastSeen < cutoff) {
      errorOccurrences.delete(fingerprint);
    }
  });
}

/**
 * Express error middleware
 */
export function errorMiddleware(
  err: Error,
  req: { method?: string; path?: string; headers?: Record<string, string>; ip?: string },
  _res: unknown,
  next: (err?: Error) => void
): void {
  captureError(err, {
    endpoint: req.path,
    method: req.method,
    userAgent: req.headers?.['user-agent'],
    ip: req.ip,
  });
  
  next(err);
}

// Start periodic flush
setInterval(() => {
  flushErrorBuffer().catch(console.error);
}, FLUSH_INTERVAL);

// Cleanup old errors daily
setInterval(() => {
  cleanupOldErrors();
}, 24 * 60 * 60 * 1000);

export default {
  captureError,
  captureException,
  captureWarning,
  getErrorStats,
  cleanupOldErrors,
  errorMiddleware,
};
