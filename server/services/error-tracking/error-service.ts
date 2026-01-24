/**
 * Error Tracking Service - SET7.06 Operação e Observabilidade
 * 
 * Sistema de rastreamento de erros integrado.
 * Pode ser facilmente substituído por Sentry em produção.
 */

interface ErrorEvent {
  id: string;
  timestamp: number;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context: {
    userId?: string;
    sessionId?: string;
    url?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
  };
  tags: Record<string, string>;
  extra: Record<string, unknown>;
  fingerprint: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
}

interface ErrorStats {
  total: number;
  byLevel: Record<string, number>;
  byFingerprint: Map<string, ErrorEvent>;
  recentErrors: ErrorEvent[];
}

class ErrorTracker {
  private errors: Map<string, ErrorEvent> = new Map();
  private recentErrors: ErrorEvent[] = [];
  private readonly maxRecentErrors = 100;
  private readonly maxUniqueErrors = 500;
  private stats = {
    total: 0,
    byLevel: { error: 0, warning: 0, info: 0 },
  };

  /**
   * Capture an error
   */
  captureError(
    error: Error | string,
    context: Partial<ErrorEvent['context']> = {},
    extra: Record<string, unknown> = {},
    tags: Record<string, string> = {}
  ): string {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;
    
    // Generate fingerprint for grouping similar errors
    const fingerprint = this.generateFingerprint(message, stack);
    
    const existingError = this.errors.get(fingerprint);
    
    if (existingError) {
      // Update existing error
      existingError.count++;
      existingError.lastSeen = Date.now();
      existingError.context = { ...existingError.context, ...context };
      this.stats.total++;
      return existingError.id;
    }
    
    // Create new error event
    const id = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const errorEvent: ErrorEvent = {
      id,
      timestamp: now,
      level: 'error',
      message,
      stack,
      context,
      tags: {
        environment: process.env.NODE_ENV || 'development',
        ...tags,
      },
      extra,
      fingerprint,
      count: 1,
      firstSeen: now,
      lastSeen: now,
    };
    
    // Store error
    this.errors.set(fingerprint, errorEvent);
    this.recentErrors.unshift(errorEvent);
    
    // Maintain limits
    if (this.recentErrors.length > this.maxRecentErrors) {
      this.recentErrors.pop();
    }
    
    if (this.errors.size > this.maxUniqueErrors) {
      // Remove oldest error
      const oldest = Array.from(this.errors.values())
        .sort((a, b) => a.lastSeen - b.lastSeen)[0];
      if (oldest) {
        this.errors.delete(oldest.fingerprint);
      }
    }
    
    // Update stats
    this.stats.total++;
    this.stats.byLevel.error++;
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorTracker] ${id}:`, message);
      if (stack) console.error(stack);
    }
    
    return id;
  }

  /**
   * Capture a warning
   */
  captureWarning(
    message: string,
    context: Partial<ErrorEvent['context']> = {},
    extra: Record<string, unknown> = {}
  ): string {
    const fingerprint = this.generateFingerprint(message);
    const id = `warn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const event: ErrorEvent = {
      id,
      timestamp: now,
      level: 'warning',
      message,
      context,
      tags: { environment: process.env.NODE_ENV || 'development' },
      extra,
      fingerprint,
      count: 1,
      firstSeen: now,
      lastSeen: now,
    };
    
    this.recentErrors.unshift(event);
    if (this.recentErrors.length > this.maxRecentErrors) {
      this.recentErrors.pop();
    }
    
    this.stats.total++;
    this.stats.byLevel.warning++;
    
    return id;
  }

  /**
   * Capture info message
   */
  captureInfo(
    message: string,
    context: Partial<ErrorEvent['context']> = {},
    extra: Record<string, unknown> = {}
  ): string {
    const id = `info_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const event: ErrorEvent = {
      id,
      timestamp: now,
      level: 'info',
      message,
      context,
      tags: { environment: process.env.NODE_ENV || 'development' },
      extra,
      fingerprint: this.generateFingerprint(message),
      count: 1,
      firstSeen: now,
      lastSeen: now,
    };
    
    this.recentErrors.unshift(event);
    if (this.recentErrors.length > this.maxRecentErrors) {
      this.recentErrors.pop();
    }
    
    this.stats.total++;
    this.stats.byLevel.info++;
    
    return id;
  }

  /**
   * Get error by ID
   */
  getError(id: string): ErrorEvent | undefined {
    return this.recentErrors.find(e => e.id === id);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 50): ErrorEvent[] {
    return this.recentErrors.slice(0, limit);
  }

  /**
   * Get grouped errors (by fingerprint)
   */
  getGroupedErrors(): ErrorEvent[] {
    return Array.from(this.errors.values())
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get error statistics
   */
  getStats(): ErrorStats {
    return {
      total: this.stats.total,
      byLevel: { ...this.stats.byLevel },
      byFingerprint: new Map(this.errors),
      recentErrors: this.recentErrors.slice(0, 10),
    };
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors.clear();
    this.recentErrors = [];
    this.stats = { total: 0, byLevel: { error: 0, warning: 0, info: 0 } };
  }

  /**
   * Generate fingerprint for error grouping
   */
  private generateFingerprint(message: string, stack?: string): string {
    // Use first line of stack or message for grouping
    const key = stack 
      ? stack.split('\n').slice(0, 2).join('\n')
      : message;
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `fp_${Math.abs(hash).toString(36)}`;
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// ============================================
// Express Middleware
// ============================================

import { Request, Response, NextFunction } from 'express';

/**
 * Error tracking middleware for Express
 */
export function errorTrackingMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errorId = errorTracker.captureError(err, {
    userId: (req as any).user?.id,
    sessionId: req.cookies?.sessionId,
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('user-agent'),
    ip: req.ip,
  }, {
    body: req.body,
    query: req.query,
    params: req.params,
  });
  
  // Add error ID to response for debugging
  res.setHeader('X-Error-Id', errorId);
  
  next(err);
}

/**
 * Request tracking middleware
 */
export function requestTrackingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Track slow requests
    if (duration > 5000) {
      errorTracker.captureWarning(`Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`, {
        url: req.originalUrl,
        method: req.method,
      }, {
        duration,
        statusCode: res.statusCode,
      });
    }
    
    // Track errors
    if (res.statusCode >= 500) {
      errorTracker.captureError(`Server error: ${res.statusCode} on ${req.method} ${req.originalUrl}`, {
        url: req.originalUrl,
        method: req.method,
      }, {
        statusCode: res.statusCode,
        duration,
      });
    }
  });
  
  next();
}

// ============================================
// Frontend Error Handler
// ============================================

/**
 * Frontend error handler (to be called from client)
 */
export function handleFrontendError(
  message: string,
  stack?: string,
  context?: Record<string, unknown>
): string {
  return errorTracker.captureError(
    stack ? Object.assign(new Error(message), { stack }) : message,
    {},
    context || {},
    { source: 'frontend' }
  );
}

export type { ErrorEvent, ErrorStats };
