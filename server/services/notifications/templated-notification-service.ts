import { notificationTemplateService } from './notification-template-service';
import { notificationPersistenceService, NotificationType } from './notification-persistence-service';
import { sseNotificationService } from '../sse/sse-notification-service';

export interface TemplatedNotificationInput {
  templateCode: string;
  userId: number;
  variables: Record<string, string>;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

export interface NotificationResult {
  success: boolean;
  notificationId?: number;
  title?: string;
  message?: string;
  error?: string;
}

/**
 * Templated Notification Service
 * Sends notifications using templates with variable substitution
 */
class TemplatedNotificationService {
  /**
   * Send a notification using a template
   */
  async sendTemplatedNotification(input: TemplatedNotificationInput): Promise<NotificationResult> {
    try {
      // Try to render the template
      const rendered = await notificationTemplateService.renderNotification(
        input.templateCode,
        input.variables
      );

      let title: string;
      let message: string;
      let type: NotificationType;

      if (rendered.success && rendered.title && rendered.message) {
        title = rendered.title;
        message = rendered.message;
        type = (rendered.type as NotificationType) || 'info';
      } else {
        // Use fallback if template not found or inactive
        title = input.fallbackTitle || 'Notificação';
        message = input.fallbackMessage || 'Você tem uma nova notificação.';
        type = 'info';
        console.warn(`[TemplatedNotification] Template ${input.templateCode} not found, using fallback`);
      }

      // Persist the notification
      const notification = await notificationPersistenceService.create({
        userId: input.userId,
        type,
        title,
        message,
      });

      const notificationId = notification?.id || Date.now();

      // Send via SSE for real-time delivery
      sseNotificationService.broadcastToUser(input.userId.toString(), {
        id: `notif_${notificationId}`,
        type,
        title,
        message,
        timestamp: Date.now(),
        data: { notificationId },
      });

      return {
        success: true,
        notificationId,
        title,
        message,
      };
    } catch (error) {
      console.error('[TemplatedNotification] Error sending notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send case approval notification
   */
  async sendCaseApprovalNotification(params: {
    userId: number;
    caseName: string;
    caseId: number;
    reviewerName: string;
    userName: string;
  }): Promise<NotificationResult> {
    return this.sendTemplatedNotification({
      templateCode: 'case_approved_default',
      userId: params.userId,
      variables: {
        userName: params.userName,
        caseName: params.caseName,
        caseId: params.caseId.toString(),
        reviewerName: params.reviewerName,
        approvalDate: new Date().toLocaleDateString('pt-BR'),
      },
      fallbackTitle: `🎉 Case "${params.caseName}" Aprovado!`,
      fallbackMessage: `Parabéns! Seu case foi aprovado e está disponível para a comunidade.`,
    });
  }

  /**
   * Send case rejection notification
   */
  async sendCaseRejectionNotification(params: {
    userId: number;
    caseName: string;
    caseId: number;
    rejectionReason: string;
    userName: string;
  }): Promise<NotificationResult> {
    return this.sendTemplatedNotification({
      templateCode: 'case_rejected_default',
      userId: params.userId,
      variables: {
        userName: params.userName,
        caseName: params.caseName,
        caseId: params.caseId.toString(),
        rejectionReason: params.rejectionReason,
      },
      fallbackTitle: `❌ Case "${params.caseName}" Necessita Revisão`,
      fallbackMessage: `Seu case precisa de ajustes. Motivo: ${params.rejectionReason}`,
    });
  }

  /**
   * Send certificate issued notification
   */
  async sendCertificateIssuedNotification(params: {
    userId: number;
    certificateId: string;
    certificateHash: string;
    projectName: string;
    impactScore: number;
    userName: string;
  }): Promise<NotificationResult> {
    return this.sendTemplatedNotification({
      templateCode: 'certificate_issued_default',
      userId: params.userId,
      variables: {
        userName: params.userName,
        certificateId: params.certificateId,
        certificateHash: params.certificateHash,
        projectName: params.projectName,
        impactScore: params.impactScore.toFixed(1),
      },
      fallbackTitle: '📜 Certificado de Impacto Emitido',
      fallbackMessage: `Seu certificado para "${params.projectName}" foi emitido com sucesso!`,
    });
  }

  /**
   * Send token earned notification
   */
  async sendTokenEarnedNotification(params: {
    userId: number;
    tokenAmount: number;
    tokenType: string;
    reason: string;
    userName: string;
  }): Promise<NotificationResult> {
    return this.sendTemplatedNotification({
      templateCode: 'token_earned_default',
      userId: params.userId,
      variables: {
        userName: params.userName,
        tokenAmount: params.tokenAmount.toString(),
        tokenType: params.tokenType,
        reason: params.reason,
      },
      fallbackTitle: `🪙 Você ganhou ${params.tokenAmount} tokens!`,
      fallbackMessage: `Parabéns! Você ganhou tokens por: ${params.reason}`,
    });
  }

  /**
   * Send case pending notification (for admins)
   */
  async sendCasePendingNotification(params: {
    userId: number;
    caseName: string;
    caseId: number;
    submitterName: string;
  }): Promise<NotificationResult> {
    return this.sendTemplatedNotification({
      templateCode: 'case_pending_default',
      userId: params.userId,
      variables: {
        caseName: params.caseName,
        caseId: params.caseId.toString(),
        submitterName: params.submitterName,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
      fallbackTitle: `📋 Novo Case Pendente: ${params.caseName}`,
      fallbackMessage: `Um novo case foi submetido por ${params.submitterName} e aguarda revisão.`,
    });
  }
}

// Singleton instance
export const templatedNotificationService = new TemplatedNotificationService();
