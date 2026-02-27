import { getDb } from "../db";
import { executeRawQuery } from "../db-raw";
import { sql } from "drizzle-orm";

export interface AuditLogEntry {
  userId: number | null;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}

export const auditLogService = {
  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;

      await executeRawQuery(
        'INSERT INTO auditLogs (userId, action, resource, resourceId, details, ipAddress, userAgent, status, errorMessage, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [entry.userId, entry.action, entry.resource, entry.resourceId || null, entry.details ? JSON.stringify(entry.details) : null, entry.ipAddress || null, entry.userAgent || null, entry.status, entry.errorMessage || null]
      );
    } catch (error) {
      // Don't throw - audit logging should not break the main flow
      console.error('[AuditLog] Failed to log entry:', error);
    }
  },

  /**
   * Log a successful action
   */
  async logSuccess(
    userId: number | null,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    return this.log({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      status: 'success',
    });
  },

  /**
   * Log a failed action
   */
  async logFailure(
    userId: number | null,
    action: string,
    resource: string,
    errorMessage: string,
    resourceId?: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    return this.log({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      status: 'failure',
      errorMessage,
    });
  },

  /**
   * Get audit logs with filters
   */
  async getLogs(filters: {
    userId?: number;
    action?: string;
    resource?: string;
    status?: 'success' | 'failure';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const db = await getDb();
    if (!db) return [];

    let query = 'SELECT * FROM auditLogs WHERE 1=1';
    const params: any[] = [];

    if (filters.userId) {
      query += ' AND userId = ?';
      params.push(filters.userId);
    }
    if (filters.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }
    if (filters.resource) {
      query += ' AND resource = ?';
      params.push(filters.resource);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.startDate) {
      query += ' AND createdAt >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND createdAt <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY createdAt DESC';
    query += ` LIMIT ${filters.limit || 100}`;
    if (filters.offset) {
      query += ` OFFSET ${filters.offset}`;
    }

    const result = await executeRawQuery(query);
    return (result as any)[0] || [];
  },

  /**
   * Get audit log statistics
   */
  async getStats(days: number = 30): Promise<{
    totalActions: number;
    successRate: number;
    topActions: { action: string; count: number }[];
    topResources: { resource: string; count: number }[];
    dailyTrend: { date: string; count: number }[];
  }> {
    const db = await getDb();
    if (!db) {
      return {
        totalActions: 0,
        successRate: 0,
        topActions: [],
        topResources: [],
        dailyTrend: [],
      };
    }

    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;

    // Total actions
    const totalResult = await executeRawQuery(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = \'success\' THEN 1 ELSE 0 END) as success FROM auditLogs WHERE createdAt >= ?',
      [startDate]
    );
    const totals = (totalResult as any)[0][0] || { total: 0, success: 0 };

    // Top actions
    const actionsResult = await executeRawQuery(
      'SELECT action, COUNT(*) as count FROM auditLogs WHERE createdAt >= ? GROUP BY action ORDER BY count DESC LIMIT 10',
      [startDate]
    );

    // Top resources
    const resourcesResult = await executeRawQuery(
      'SELECT resource, COUNT(*) as count FROM auditLogs WHERE createdAt >= ? GROUP BY resource ORDER BY count DESC LIMIT 10',
      [startDate]
    );

    // Daily trend
    const trendResult = await executeRawQuery(
      'SELECT DATE(createdAt) as date, COUNT(*) as count FROM auditLogs WHERE createdAt >= ? GROUP BY DATE(createdAt) ORDER BY date ASC',
      [startDate]
    );

    return {
      totalActions: Number(totals.total),
      successRate: totals.total > 0 ? (Number(totals.success) / Number(totals.total)) * 100 : 0,
      topActions: (actionsResult as any)[0] || [],
      topResources: (resourcesResult as any)[0] || [],
      dailyTrend: (trendResult as any)[0] || [],
    };
  },
};

// Audit action types
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  TWO_FACTOR_ENABLED: 'auth.2fa_enabled',
  TWO_FACTOR_DISABLED: 'auth.2fa_disabled',
  TWO_FACTOR_VERIFIED: 'auth.2fa_verified',
  
  // User management
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  ROLE_CHANGED: 'user.role_changed',
  
  // API tokens
  TOKEN_CREATED: 'token.created',
  TOKEN_REVOKED: 'token.revoked',
  
  // Cases
  CASE_CREATED: 'case.created',
  CASE_UPDATED: 'case.updated',
  CASE_DELETED: 'case.deleted',
  CASE_APPROVED: 'case.approved',
  CASE_REJECTED: 'case.rejected',
  
  // Calculations
  CALCULATION_CREATED: 'calculation.created',
  CALCULATION_EXPORTED: 'calculation.exported',
  
  // Payments
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  
  // Admin actions
  SETTINGS_UPDATED: 'admin.settings_updated',
  DATA_EXPORTED: 'admin.data_exported',
  DATA_IMPORTED: 'admin.data_imported',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];
