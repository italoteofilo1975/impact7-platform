import { getDb } from '../../db';
import { notifications, type InsertNotification, type Notification } from '../../../drizzle/schema';
import { eq, desc, and, sql, gte } from 'drizzle-orm';

export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'case_pending' 
  | 'case_approved' 
  | 'case_rejected' 
  | 'certificate_issued' 
  | 'token_earned' 
  | 'system';

export interface CreateNotificationInput {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export const notificationPersistenceService = {
  /**
   * Create a new notification
   */
  async create(input: CreateNotificationInput): Promise<Notification | null> {
    const db = await getDb();
    if (!db) return null;
    const result = await db.insert(notifications).values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      metadata: input.metadata,
      createdAt: Date.now(),
    });
    
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, Number(result[0].insertId)));
    
    return notification;
  },

  /**
   * Get notifications for a user with pagination
   */
  async getByUserId(
    userId: number, 
    options: { 
      limit?: number; 
      offset?: number; 
      type?: NotificationType;
      unreadOnly?: boolean;
      startDate?: string;
    } = {}
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const db = await getDb();
    if (!db) return { notifications: [], total: 0, unreadCount: 0 };
    const { limit = 20, offset = 0, type, unreadOnly, startDate } = options;

    const conditions = [eq(notifications.userId, userId)];
    
    if (type) {
      conditions.push(eq(notifications.type, type));
    }
    
    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, 0));
    }
    
    if (startDate) {
      conditions.push(gte(notifications.createdAt, new Date(startDate).getTime()));
    }

    const [notificationList, countResult, unreadResult] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(...conditions)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0))),
    ]);

    return {
      notifications: notificationList,
      total: Number(countResult[0]?.count || 0),
      unreadCount: Number(unreadResult[0]?.count || 0),
    };
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;
    const result = await db
      .update(notifications)
      .set({ isRead: 1, readAt: Date.now() })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
    
    return result[0].affectedRows > 0;
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<number> {
    const db = await getDb();
    if (!db) return 0;
    const result = await db
      .update(notifications)
      .set({ isRead: 1, readAt: Date.now() })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));
    
    return result[0].affectedRows;
  },

  /**
   * Delete a notification
   */
  async delete(notificationId: number, userId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;
    const result = await db
      .delete(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
    
    return result[0].affectedRows > 0;
  },

  /**
   * Delete all read notifications older than specified days
   */
  async cleanupOldNotifications(userId: number, daysOld: number = 30): Promise<number> {
    const db = await getDb();
    if (!db) return 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, 1),
          sql`${notifications.createdAt} < ${cutoffDate}`
        )
      );
    
    return result[0].affectedRows;
  },

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: number): Promise<number> {
    const db = await getDb();
    if (!db) return 0;
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));
    
    return Number(result[0]?.count || 0);
  },
};
