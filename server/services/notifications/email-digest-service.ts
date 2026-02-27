import { getDb } from '../../db';
import { notificationPreferences, users } from '../../../drizzle/schema';
import { eq, and, gt, isNull, or } from 'drizzle-orm';
import { notificationPersistenceService } from './notification-persistence-service';

export interface DigestConfig {
  frequency: 'daily' | 'weekly';
  lastSentAt?: Date;
}

export interface DigestNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  createdAt: number;
}

export interface UserDigest {
  userId: number;
  userEmail: string;
  userName: string;
  notifications: DigestNotification[];
  frequency: 'daily' | 'weekly';
}

/**
 * Email Digest Service
 * Handles batch email notifications for users who prefer digest mode
 */
class EmailDigestService {
  private lastDailyRun: Date | null = null;
  private lastWeeklyRun: Date | null = null;

  /**
   * Get users who have digest enabled with their preferences
   */
  async getUsersWithDigestEnabled(frequency: 'daily' | 'weekly'): Promise<Array<{
    userId: number;
    email: string;
    name: string;
  }>> {
    const db = await getDb();
    if (!db) return [];

    const prefs = await db
      .select({
        userId: notificationPreferences.userId,
        email: users.email,
        name: users.name,
      })
      .from(notificationPreferences)
      .innerJoin(users, eq(notificationPreferences.userId, users.id))
      .where(
        and(
          eq(notificationPreferences.emailEnabled, 1),
          eq(notificationPreferences.emailDigestFrequency, frequency)
        )
      );

    return prefs.filter(p => p.email).map(p => ({
      userId: p.userId,
      email: p.email!,
      name: p.name || 'Usuário',
    }));
  }

  /**
   * Get unread notifications for a user since a specific date
   */
  async getUnreadNotificationsSince(userId: number, since: Date): Promise<DigestNotification[]> {
    const result = await notificationPersistenceService.getByUserId(userId, {
      unreadOnly: true,
      startDate: new Date(since).toISOString(),
      limit: 50,
    });

    return result.notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      createdAt: n.createdAt,
    }));
  }

  /**
   * Generate digest data for all users with a specific frequency
   */
  async generateDigests(frequency: 'daily' | 'weekly'): Promise<UserDigest[]> {
    const users = await this.getUsersWithDigestEnabled(frequency);
    const digests: UserDigest[] = [];

    // Calculate the time range based on frequency
    const now = new Date();
    const since = frequency === 'daily'
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    for (const user of users) {
      const notifications = await this.getUnreadNotificationsSince(user.userId, since);
      
      if (notifications.length > 0) {
        digests.push({
          userId: user.userId,
          userEmail: user.email,
          userName: user.name,
          notifications,
          frequency,
        });
      }
    }

    return digests;
  }

  /**
   * Generate HTML email content for a digest
   */
  generateDigestEmailHTML(digest: UserDigest): string {
    const periodLabel = digest.frequency === 'daily' ? 'últimas 24 horas' : 'última semana';
    const notificationRows = digest.notifications.map(n => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: ${this.getTypeColor(n.type)}; color: white; font-size: 11px; text-transform: uppercase;">${n.type}</span>
          </div>
          <h4 style="margin: 8px 0 4px 0; color: #333;">${n.title}</h4>
          <p style="margin: 0; color: #666; font-size: 14px;">${n.message}</p>
          <small style="color: #999;">${new Date(n.createdAt).toLocaleString('pt-BR')}</small>
        </td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumo de Notificações - IMPACT7</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">📬 Resumo de Notificações</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">IMPACT7 - ${periodLabel}</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 24px;">
      <p style="color: #333; margin: 0 0 16px 0;">Olá <strong>${digest.userName}</strong>,</p>
      <p style="color: #666; margin: 0 0 24px 0;">
        Você tem <strong>${digest.notifications.length}</strong> notificação(ões) não lida(s) nas ${periodLabel}:
      </p>
      
      <table style="width: 100%; border-collapse: collapse; background: #fafafa; border-radius: 8px; overflow: hidden;">
        ${notificationRows}
      </table>
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://impact7.manus.space/notificacoes" style="display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Ver Todas as Notificações
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f5f5f5; padding: 16px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        Você está recebendo este email porque optou pelo resumo ${digest.frequency === 'daily' ? 'diário' : 'semanal'}.
        <br>
        <a href="https://impact7.manus.space/notificacoes/preferencias" style="color: #f97316;">Alterar preferências</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text email content for a digest
   */
  generateDigestEmailText(digest: UserDigest): string {
    const periodLabel = digest.frequency === 'daily' ? 'últimas 24 horas' : 'última semana';
    const notificationList = digest.notifications.map(n => 
      `- [${n.type.toUpperCase()}] ${n.title}\n  ${n.message}\n  ${new Date(n.createdAt).toLocaleString('pt-BR')}`
    ).join('\n\n');

    return `
Resumo de Notificações - IMPACT7
${periodLabel}

Olá ${digest.userName},

Você tem ${digest.notifications.length} notificação(ões) não lida(s):

${notificationList}

---
Ver todas as notificações: https://impact7.manus.space/notificacoes
Alterar preferências: https://impact7.manus.space/notificacoes/preferencias
    `.trim();
  }

  /**
   * Get color for notification type
   */
  private getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      info: '#3b82f6',
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      case_pending: '#f97316',
      case_approved: '#22c55e',
      case_rejected: '#ef4444',
      certificate_issued: '#a855f7',
      token_earned: '#f59e0b',
      system: '#64748b',
    };
    return colors[type] || '#64748b';
  }

  /**
   * Send digest emails using Manus notification service
   */
  async sendDigestEmails(frequency: 'daily' | 'weekly'): Promise<{
    sent: number;
    failed: number;
    digests: UserDigest[];
  }> {
    const digests = await this.generateDigests(frequency);
    let sent = 0;
    let failed = 0;

    for (const digest of digests) {
      try {
        // In production, this would use the email notification service
        // For now, we log the digest
        console.log(`[EmailDigest] Would send ${frequency} digest to ${digest.userEmail} with ${digest.notifications.length} notifications`);
        sent++;
      } catch (error) {
        console.error(`[EmailDigest] Failed to send digest to ${digest.userEmail}:`, error);
        failed++;
      }
    }

    // Update last run time
    if (frequency === 'daily') {
      this.lastDailyRun = new Date();
    } else {
      this.lastWeeklyRun = new Date();
    }

    return { sent, failed, digests };
  }

  /**
   * Get digest service status
   */
  getStatus(): {
    lastDailyRun: Date | null;
    lastWeeklyRun: Date | null;
    nextDailyRun: Date;
    nextWeeklyRun: Date;
  } {
    const now = new Date();
    
    // Daily runs at 8 AM
    const nextDaily = new Date(now);
    nextDaily.setHours(8, 0, 0, 0);
    if (nextDaily <= now) {
      nextDaily.setDate(nextDaily.getDate() + 1);
    }

    // Weekly runs on Monday at 8 AM
    const nextWeekly = new Date(now);
    nextWeekly.setHours(8, 0, 0, 0);
    const daysUntilMonday = (8 - nextWeekly.getDay()) % 7 || 7;
    nextWeekly.setDate(nextWeekly.getDate() + daysUntilMonday);

    return {
      lastDailyRun: this.lastDailyRun,
      lastWeeklyRun: this.lastWeeklyRun,
      nextDailyRun: nextDaily,
      nextWeeklyRun: nextWeekly,
    };
  }
}

// Singleton instance
export const emailDigestService = new EmailDigestService();
