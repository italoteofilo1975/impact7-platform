import { getDb } from '../../db';
import { auditLogs, type InsertAuditLog } from '../../../drizzle/schema';
import { desc, eq, and, gte, lte, like, or } from 'drizzle-orm';

export type AuditAction = 
  | 'create' | 'update' | 'delete' | 'login' | 'logout'
  | 'approve' | 'reject' | 'export' | 'import' | 'config_change';

export interface AuditLogEntry {
  userId?: number;
  userName?: string;
  userEmail?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

class AuditService {
  /**
   * Log an administrative action
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.error('[Audit] Database not available');
        return;
      }

      await db.insert(auditLogs).values({
        userId: entry.userId,
        userName: entry.userName,
        userEmail: entry.userEmail,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        resourceName: entry.resourceName,
        previousValue: entry.previousValue ? JSON.stringify(entry.previousValue) : null,
        newValue: entry.newValue ? JSON.stringify(entry.newValue) : null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      
          createdAt: Date.now(),
        });
    } catch (error) {
      console.error('[Audit] Failed to log action:', error);
    }
  }

  /**
   * Get audit logs with optional filters
   */
  async getLogs(filters?: {
    userId?: number;
    action?: AuditAction;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const db = await getDb();
    if (!db) return { logs: [], total: 0 };

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    // Build conditions
    const conditions: ReturnType<typeof eq>[] = [];

    if (filters?.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }
    if (filters?.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }
    if (filters?.resourceType) {
      conditions.push(eq(auditLogs.resourceType, filters.resourceType));
    }
    if (filters?.startDate) {
      conditions.push(gte(auditLogs.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(auditLogs.createdAt, filters.endDate));
    }

    // Get logs
    let query = db.select().from(auditLogs);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const logs = await query
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const allLogs = await db.select().from(auditLogs);
    let filteredLogs = allLogs;
    
    if (filters?.userId) {
      filteredLogs = filteredLogs.filter(l => l.userId === filters.userId);
    }
    if (filters?.action) {
      filteredLogs = filteredLogs.filter(l => l.action === filters.action);
    }
    if (filters?.resourceType) {
      filteredLogs = filteredLogs.filter(l => l.resourceType === filters.resourceType);
    }
    if (filters?.startDate) {
      filteredLogs = filteredLogs.filter(l => new Date(l.createdAt) >= filters.startDate!);
    }
    if (filters?.endDate) {
      filteredLogs = filteredLogs.filter(l => new Date(l.createdAt) <= filters.endDate!);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredLogs = filteredLogs.filter(l => 
        l.userName?.toLowerCase().includes(searchLower) ||
        l.userEmail?.toLowerCase().includes(searchLower) ||
        l.resourceName?.toLowerCase().includes(searchLower) ||
        l.resourceType.toLowerCase().includes(searchLower)
      );
    }

    return {
      logs: logs.map(log => ({
        ...log,
        previousValue: log.previousValue ? JSON.parse(log.previousValue) : null,
        newValue: log.newValue ? JSON.parse(log.newValue) : null,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
      })),
      total: filteredLogs.length,
    };
  }

  /**
   * Get audit statistics
   */
  async getStats() {
    const db = await getDb();
    if (!db) return { total: 0, byAction: {}, byResource: {}, recentActivity: [] };

    const allLogs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));

    // Count by action
    const byAction: Record<string, number> = {};
    allLogs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
    });

    // Count by resource type
    const byResource: Record<string, number> = {};
    allLogs.forEach(log => {
      byResource[log.resourceType] = (byResource[log.resourceType] || 0) + 1;
    });

    // Recent activity (last 24 hours)
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    const recentLogs = allLogs.filter(log => new Date(log.createdAt) >= dayAgo);

    // Group by hour
    const hourlyActivity: Record<string, number> = {};
    recentLogs.forEach(log => {
      const hour = new Date(log.createdAt).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    return {
      total: allLogs.length,
      byAction,
      byResource,
      recentActivity: Object.entries(hourlyActivity).map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
      })),
      todayCount: recentLogs.length,
    };
  }

  /**
   * Get distinct resource types
   */
  async getResourceTypes(): Promise<string[]> {
    const db = await getDb();
    if (!db) return [];

    const logs = await db.select({ resourceType: auditLogs.resourceType }).from(auditLogs);
    const types = new Set(logs.map(l => l.resourceType));
    return Array.from(types).sort();
  }

  /**
   * Export audit logs as CSV
   */
  async exportCsv(filters?: {
    startDate?: Date;
    endDate?: Date;
    action?: AuditAction;
    resourceType?: string;
  }): Promise<{ csv: string; count: number }> {
    const { logs } = await this.getLogs({ ...filters, limit: 10000 });

    const headers = [
      'ID', 'Data', 'Usuário', 'Email', 'Ação', 'Tipo de Recurso',
      'ID do Recurso', 'Nome do Recurso', 'IP', 'User Agent'
    ];

    const rows = logs.map(log => [
      log.id,
      new Date(log.createdAt).toISOString(),
      `"${(log.userName || '').replace(/"/g, '""')}"`,
      log.userEmail || '',
      log.action,
      log.resourceType,
      log.resourceId || '',
      `"${(log.resourceName || '').replace(/"/g, '""')}"`,
      log.ipAddress || '',
      `"${(log.userAgent || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    return { csv, count: logs.length };
  }
}

export const auditService = new AuditService();
