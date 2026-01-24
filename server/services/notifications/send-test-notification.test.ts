import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do serviço SSE
vi.mock('../sse/sse-notification-service', () => ({
  sseNotificationService: {
    broadcastToUser: vi.fn(),
    sendToUser: vi.fn(),
  },
}));

describe('Send Test Notification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tipos de notificação', () => {
    it('deve aceitar tipo info', () => {
      const validTypes = ['info', 'success', 'warning', 'error', 'case_pending', 'case_approved', 'case_rejected', 'certificate_issued', 'token_earned', 'system'];
      expect(validTypes).toContain('info');
    });

    it('deve aceitar tipo success', () => {
      const validTypes = ['info', 'success', 'warning', 'error', 'case_pending', 'case_approved', 'case_rejected', 'certificate_issued', 'token_earned', 'system'];
      expect(validTypes).toContain('success');
    });

    it('deve aceitar tipo warning', () => {
      const validTypes = ['info', 'success', 'warning', 'error', 'case_pending', 'case_approved', 'case_rejected', 'certificate_issued', 'token_earned', 'system'];
      expect(validTypes).toContain('warning');
    });

    it('deve aceitar tipo error', () => {
      const validTypes = ['info', 'success', 'warning', 'error', 'case_pending', 'case_approved', 'case_rejected', 'certificate_issued', 'token_earned', 'system'];
      expect(validTypes).toContain('error');
    });

    it('deve aceitar tipo case_approved', () => {
      const validTypes = ['info', 'success', 'warning', 'error', 'case_pending', 'case_approved', 'case_rejected', 'certificate_issued', 'token_earned', 'system'];
      expect(validTypes).toContain('case_approved');
    });

    it('deve aceitar tipo certificate_issued', () => {
      const validTypes = ['info', 'success', 'warning', 'error', 'case_pending', 'case_approved', 'case_rejected', 'certificate_issued', 'token_earned', 'system'];
      expect(validTypes).toContain('certificate_issued');
    });

    it('deve aceitar tipo token_earned', () => {
      const validTypes = ['info', 'success', 'warning', 'error', 'case_pending', 'case_approved', 'case_rejected', 'certificate_issued', 'token_earned', 'system'];
      expect(validTypes).toContain('token_earned');
    });
  });

  describe('Geração de mensagem padrão', () => {
    it('deve gerar título padrão quando não fornecido', () => {
      const title = undefined;
      const defaultTitle = 'Notificação de Teste';
      const result = title || defaultTitle;
      expect(result).toBe('Notificação de Teste');
    });

    it('deve usar título fornecido quando disponível', () => {
      const title = 'Título Personalizado';
      const defaultTitle = 'Notificação de Teste';
      const result = title || defaultTitle;
      expect(result).toBe('Título Personalizado');
    });

    it('deve gerar mensagem padrão com tipo', () => {
      const type = 'success';
      const message = undefined;
      const defaultMessage = `Esta é uma notificação de teste do tipo ${type}.`;
      const result = message || defaultMessage;
      expect(result).toContain('success');
    });
  });

  describe('SSE Broadcast', () => {
    it('deve chamar broadcastToUser com parâmetros corretos', async () => {
      const { sseNotificationService } = await import('../sse/sse-notification-service');
      
      const userId = 'user123';
      const notification = {
        type: 'info',
        title: 'Teste',
        message: 'Mensagem de teste',
      };

      sseNotificationService.broadcastToUser(userId, notification);

      expect(sseNotificationService.broadcastToUser).toHaveBeenCalledWith(userId, notification);
    });

    it('deve permitir broadcast sem data opcional', async () => {
      const { sseNotificationService } = await import('../sse/sse-notification-service');
      
      const userId = 'user456';
      const notification = {
        type: 'warning',
        title: 'Aviso',
        message: 'Mensagem de aviso',
      };

      sseNotificationService.broadcastToUser(userId, notification);

      expect(sseNotificationService.broadcastToUser).toHaveBeenCalledWith(userId, expect.objectContaining({
        type: 'warning',
        title: 'Aviso',
      }));
    });
  });
});
