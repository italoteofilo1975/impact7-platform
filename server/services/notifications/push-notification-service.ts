/**
 * Push Notification Service
 * SET7.06 - Operação, Observabilidade e Eficiência Cognitiva
 * 
 * Sistema de notificações push para alertas P1/P2
 * Integrado com Manus Notify
 */

import { notifyOwner } from "../../_core/notification";
import { Alert, AlertSeverity } from "../alerts/alert-service";

// Tipos
export interface NotificationPreferences {
  userId: string;
  enabledSeverities: AlertSeverity[];
  enableEmail: boolean;
  enablePush: boolean;
  quietHoursStart?: number; // 0-23
  quietHoursEnd?: number; // 0-23
  timezone: string;
}

export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sentAt: number;
  readAt?: number;
  severity: AlertSeverity;
}

// Store em memória (em produção seria no banco de dados)
const userPreferences: Map<string, NotificationPreferences> = new Map();
const notificationHistory: PushNotification[] = [];
const MAX_HISTORY = 500;

// Preferências padrão
const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'userId'> = {
  enabledSeverities: ['P1', 'P2'],
  enableEmail: true,
  enablePush: true,
  timezone: 'America/Sao_Paulo',
};

/**
 * Obtém preferências de notificação do usuário
 */
export function getUserPreferences(userId: string): NotificationPreferences {
  const prefs = userPreferences.get(userId);
  if (prefs) return prefs;
  
  // Retorna preferências padrão
  return {
    userId,
    ...DEFAULT_PREFERENCES,
  };
}

/**
 * Atualiza preferências de notificação do usuário
 */
export function updateUserPreferences(
  userId: string,
  updates: Partial<Omit<NotificationPreferences, 'userId'>>
): NotificationPreferences {
  const current = getUserPreferences(userId);
  const updated = { ...current, ...updates };
  userPreferences.set(userId, updated);
  return updated;
}

/**
 * Verifica se está em horário silencioso
 */
function isQuietHours(prefs: NotificationPreferences): boolean {
  if (prefs.quietHoursStart === undefined || prefs.quietHoursEnd === undefined) {
    return false;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  
  // Horário silencioso pode cruzar meia-noite (ex: 22-06)
  if (prefs.quietHoursStart > prefs.quietHoursEnd) {
    return currentHour >= prefs.quietHoursStart || currentHour < prefs.quietHoursEnd;
  }
  
  return currentHour >= prefs.quietHoursStart && currentHour < prefs.quietHoursEnd;
}

/**
 * Verifica se deve enviar notificação para o usuário
 */
function shouldNotify(userId: string, severity: AlertSeverity): boolean {
  const prefs = getUserPreferences(userId);
  
  // Verificar se severidade está habilitada
  if (!prefs.enabledSeverities.includes(severity)) {
    return false;
  }
  
  // Verificar horário silencioso (P1 ignora horário silencioso)
  if (severity !== 'P1' && isQuietHours(prefs)) {
    return false;
  }
  
  return prefs.enablePush || prefs.enableEmail;
}

/**
 * Gera ID único para notificação
 */
function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Envia notificação push para um alerta
 */
export async function sendAlertNotification(
  alert: Alert,
  targetUserIds?: string[]
): Promise<{ sent: number; failed: number }> {
  const results = { sent: 0, failed: 0 };
  
  // Se não especificou usuários, envia para o owner
  if (!targetUserIds || targetUserIds.length === 0) {
    try {
      const success = await notifyOwner({
        title: alert.title,
        content: formatAlertContent(alert),
      });
      
      if (success) {
        results.sent++;
        recordNotification('owner', alert);
      } else {
        results.failed++;
      }
    } catch (error) {
      console.error('[PUSH] Erro ao enviar notificação:', error);
      results.failed++;
    }
    return results;
  }
  
  // Enviar para usuários específicos
  for (const userId of targetUserIds) {
    if (!shouldNotify(userId, alert.severity)) {
      continue;
    }
    
    try {
      const success = await notifyOwner({
        title: alert.title,
        content: formatAlertContent(alert),
      });
      
      if (success) {
        results.sent++;
        recordNotification(userId, alert);
      } else {
        results.failed++;
      }
    } catch (error) {
      console.error(`[PUSH] Erro ao enviar notificação para ${userId}:`, error);
      results.failed++;
    }
  }
  
  return results;
}

/**
 * Formata conteúdo do alerta para notificação
 */
function formatAlertContent(alert: Alert): string {
  const timestamp = new Date(alert.timestamp).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  });
  
  return `
🚨 ${alert.severity} - ${alert.title}

${alert.message}

📍 Fonte: ${alert.source}
⏰ Horário: ${timestamp}

Acesse o dashboard de monitoramento para mais detalhes.
  `.trim();
}

/**
 * Registra notificação no histórico
 */
function recordNotification(userId: string, alert: Alert): void {
  const notification: PushNotification = {
    id: generateNotificationId(),
    userId,
    title: alert.title,
    body: alert.message,
    data: { alertId: alert.id, source: alert.source },
    sentAt: Date.now(),
    severity: alert.severity,
  };
  
  notificationHistory.push(notification);
  
  // Manter limite de histórico
  if (notificationHistory.length > MAX_HISTORY) {
    notificationHistory.shift();
  }
}

/**
 * Obtém histórico de notificações do usuário
 */
export function getUserNotifications(
  userId: string,
  limit: number = 50
): PushNotification[] {
  return notificationHistory
    .filter(n => n.userId === userId || n.userId === 'owner')
    .slice(-limit)
    .reverse();
}

/**
 * Marca notificação como lida
 */
export function markNotificationAsRead(notificationId: string): boolean {
  const notification = notificationHistory.find(n => n.id === notificationId);
  if (notification) {
    notification.readAt = Date.now();
    return true;
  }
  return false;
}

/**
 * Obtém contagem de notificações não lidas
 */
export function getUnreadCount(userId: string): number {
  return notificationHistory.filter(
    n => (n.userId === userId || n.userId === 'owner') && !n.readAt
  ).length;
}

/**
 * Envia notificação de teste
 */
export async function sendTestNotification(userId: string): Promise<boolean> {
  try {
    const success = await notifyOwner({
      title: '🧪 Notificação de Teste',
      content: `
Esta é uma notificação de teste do sistema IMPACT7.

Se você recebeu esta mensagem, as notificações estão funcionando corretamente.

Horário: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
      `.trim(),
    });
    
    if (success) {
      recordNotification(userId, {
        id: 'test',
        severity: 'P4',
        title: 'Notificação de Teste',
        message: 'Teste de notificação realizado com sucesso',
        source: 'TEST',
        timestamp: Date.now(),
        acknowledged: true,
      });
    }
    
    return success;
  } catch (error) {
    console.error('[PUSH] Erro ao enviar notificação de teste:', error);
    return false;
  }
}

/**
 * Estatísticas de notificações
 */
export function getNotificationStats(): {
  total: number;
  bySeverity: Record<AlertSeverity, number>;
  last24h: number;
  readRate: number;
} {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  const total = notificationHistory.length;
  const last24h = notificationHistory.filter(n => n.sentAt > oneDayAgo).length;
  const readCount = notificationHistory.filter(n => n.readAt).length;
  
  const bySeverity: Record<AlertSeverity, number> = {
    P1: notificationHistory.filter(n => n.severity === 'P1').length,
    P2: notificationHistory.filter(n => n.severity === 'P2').length,
    P3: notificationHistory.filter(n => n.severity === 'P3').length,
    P4: notificationHistory.filter(n => n.severity === 'P4').length,
  };
  
  return {
    total,
    bySeverity,
    last24h,
    readRate: total > 0 ? readCount / total : 0,
  };
}


