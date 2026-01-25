import { getDb } from '../../db';
import { users, notifications } from '../../../drizzle/schema';
import { eq, and, isNull, lt, sql } from 'drizzle-orm';

export type NotificationType = 
  | 'info' | 'success' | 'warning' | 'error'
  | 'case_pending' | 'case_approved' | 'case_rejected'
  | 'certificate_issued' | 'token_earned' | 'system';

// Tipos de notificação que devem ser enviados por email
const EMAIL_WORTHY_TYPES: NotificationType[] = [
  'case_approved',
  'case_rejected',
  'certificate_issued',
  'token_earned',
  'warning',
  'error',
];

interface EmailNotification {
  userId: number;
  userEmail: string;
  userName: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Templates de email por tipo de notificação
function getEmailTemplate(notification: EmailNotification): EmailTemplate {
  const baseUrl = process.env.VITE_APP_URL || 'https://impact7.manus.space';
  const linkButton = notification.link 
    ? `<a href="${baseUrl}${notification.link}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">Ver Detalhes</a>`
    : '';

  const templates: Record<NotificationType, { subject: string; emoji: string }> = {
    case_approved: { subject: '✅ Seu case foi aprovado!', emoji: '✅' },
    case_rejected: { subject: '❌ Seu case precisa de ajustes', emoji: '❌' },
    certificate_issued: { subject: '🏆 Novo certificado emitido!', emoji: '🏆' },
    token_earned: { subject: '🪙 Você ganhou tokens de impacto!', emoji: '🪙' },
    warning: { subject: '⚠️ Aviso importante', emoji: '⚠️' },
    error: { subject: '🚨 Ação necessária', emoji: '🚨' },
    info: { subject: 'ℹ️ Informação', emoji: 'ℹ️' },
    success: { subject: '✅ Sucesso', emoji: '✅' },
    case_pending: { subject: '📋 Case pendente de revisão', emoji: '📋' },
    system: { subject: '🔔 Notificação do sistema', emoji: '🔔' },
  };

  const template = templates[notification.type] || templates.info;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Método IMPACT7</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Plataforma de Impacto Social</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin: 0 0 16px 0;">Olá, <strong>${notification.userName}</strong>!</p>
    
    <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #1e3a5f;">
        ${template.emoji} ${notification.title}
      </h2>
      <p style="margin: 0; color: #64748b;">${notification.message}</p>
    </div>
    
    ${linkButton}
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
      Você está recebendo este email porque tem uma conta na plataforma IMPACT7.
      <br>
      <a href="${baseUrl}/notificacoes" style="color: #2563eb;">Gerenciar preferências de notificação</a>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
    <p style="margin: 0;">© 2026 Método IMPACT7. Todos os direitos reservados.</p>
  </div>
</body>
</html>`;

  const text = `
Olá, ${notification.userName}!

${template.emoji} ${notification.title}

${notification.message}

${notification.link ? `Ver detalhes: ${baseUrl}${notification.link}` : ''}

---
Você está recebendo este email porque tem uma conta na plataforma IMPACT7.
Gerenciar preferências: ${baseUrl}/notificacoes
`;

  return {
    subject: template.subject,
    html,
    text,
  };
}

// Serviço de notificações por email
export const emailNotificationService = {
  // Verificar se o tipo de notificação deve ser enviado por email
  shouldSendEmail(type: NotificationType): boolean {
    return EMAIL_WORTHY_TYPES.includes(type);
  },

  // Enviar email de notificação
  async sendNotificationEmail(notification: EmailNotification): Promise<boolean> {
    try {
      const template = getEmailTemplate(notification);
      
      // Usar o serviço de email existente ou API de email
      const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/notification/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        },
        body: JSON.stringify({
          to: notification.userEmail,
          subject: template.subject,
          html: template.html,
          text: template.text,
        }),
      });

      if (!response.ok) {
        console.error('[EmailNotification] Failed to send email:', await response.text());
        return false;
      }

      console.log(`[EmailNotification] Email sent to ${notification.userEmail}: ${template.subject}`);
      return true;
    } catch (error) {
      console.error('[EmailNotification] Error sending email:', error);
      return false;
    }
  },

  // Processar notificações pendentes e enviar emails
  async processUnsentNotifications(): Promise<number> {
    const db = await getDb();
    if (!db) return 0;

    try {
      // Buscar notificações não enviadas por email dos últimos 24h
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const pendingNotifications = await db
        .select({
          notification: notifications,
          user: users,
        })
        .from(notifications)
        .innerJoin(users, eq(notifications.userId, users.id))
        .where(
          and(
            isNull(notifications.emailSentAt),
            sql`${notifications.createdAt} > ${oneDayAgo.toISOString()}`
          )
        )
        .limit(50);

      let sentCount = 0;

      for (const { notification, user } of pendingNotifications) {
        const type = notification.type as NotificationType;
        
        // Verificar se deve enviar email para este tipo
        if (!this.shouldSendEmail(type)) {
          continue;
        }

        // Verificar preferências do usuário (se implementado)
        // TODO: Verificar tabela de preferências

        const success = await this.sendNotificationEmail({
          userId: user.id,
          userEmail: user.email || '',
          userName: user.name || 'Usuário',
          type,
          title: notification.title,
          message: notification.message,
          link: notification.link || undefined,
        });

        if (success) {
          // Marcar como enviado
          await db
            .update(notifications)
            .set({ emailSentAt: Date.now() })
            .where(eq(notifications.id, notification.id));
          
          sentCount++;
        }
      }

      return sentCount;
    } catch (error) {
      console.error('[EmailNotification] Error processing notifications:', error);
      return 0;
    }
  },

  // Enviar email imediatamente para uma notificação específica
  async sendImmediateEmail(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    try {
      // Buscar dados do usuário
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        console.error('[EmailNotification] User not found:', userId);
        return false;
      }

      // Verificar se deve enviar email
      if (!this.shouldSendEmail(type)) {
        return false;
      }

      return this.sendNotificationEmail({
        userId: user.id,
        userEmail: user.email || '',
        userName: user.name || 'Usuário',
        type,
        title,
        message,
        link,
      });
    } catch (error) {
      console.error('[EmailNotification] Error sending immediate email:', error);
      return false;
    }
  },
};

export default emailNotificationService;
