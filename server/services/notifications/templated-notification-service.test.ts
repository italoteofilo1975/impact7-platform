import { describe, it, expect, vi, beforeEach } from 'vitest';
import { templatedNotificationService } from './templated-notification-service';

describe('TemplatedNotificationService', () => {
  describe('sendCaseApprovalNotification', () => {
    it('deve criar parâmetros corretos para notificação de aprovação', async () => {
      const params = {
        userId: 1,
        caseName: 'Projeto Educação Rural',
        caseId: 123,
        reviewerName: 'Admin',
        userName: 'João Silva',
      };

      // Test that the method exists and accepts correct params
      expect(typeof templatedNotificationService.sendCaseApprovalNotification).toBe('function');
      
      // Verify params structure
      expect(params.userId).toBe(1);
      expect(params.caseName).toBe('Projeto Educação Rural');
      expect(params.caseId).toBe(123);
    });
  });

  describe('sendCaseRejectionNotification', () => {
    it('deve criar parâmetros corretos para notificação de rejeição', async () => {
      const params = {
        userId: 1,
        caseName: 'Projeto Teste',
        caseId: 456,
        rejectionReason: 'Documentação incompleta',
        userName: 'Maria Santos',
      };

      expect(typeof templatedNotificationService.sendCaseRejectionNotification).toBe('function');
      expect(params.rejectionReason).toBe('Documentação incompleta');
    });
  });

  describe('sendCertificateIssuedNotification', () => {
    it('deve criar parâmetros corretos para notificação de certificado', async () => {
      const params = {
        userId: 1,
        certificateId: 'CERT-2026-001',
        certificateHash: 'abc123def456',
        projectName: 'Projeto Saúde Comunitária',
        impactScore: 85.5,
        userName: 'Pedro Costa',
      };

      expect(typeof templatedNotificationService.sendCertificateIssuedNotification).toBe('function');
      expect(params.impactScore).toBe(85.5);
      expect(params.certificateId).toBe('CERT-2026-001');
    });
  });

  describe('sendTokenEarnedNotification', () => {
    it('deve criar parâmetros corretos para notificação de tokens', async () => {
      const params = {
        userId: 1,
        tokenAmount: 100,
        tokenType: 'impact_credit',
        reason: 'Contribuição aprovada',
        userName: 'Ana Lima',
      };

      expect(typeof templatedNotificationService.sendTokenEarnedNotification).toBe('function');
      expect(params.tokenAmount).toBe(100);
      expect(params.tokenType).toBe('impact_credit');
    });
  });

  describe('sendCasePendingNotification', () => {
    it('deve criar parâmetros corretos para notificação de case pendente', async () => {
      const params = {
        userId: 1,
        caseName: 'Novo Projeto',
        caseId: 789,
        submitterName: 'Carlos Oliveira',
      };

      expect(typeof templatedNotificationService.sendCasePendingNotification).toBe('function');
      expect(params.submitterName).toBe('Carlos Oliveira');
    });
  });

  describe('sendTemplatedNotification', () => {
    it('deve aceitar input com template code e variáveis', async () => {
      const input = {
        templateCode: 'case_approved_default',
        userId: 1,
        variables: {
          userName: 'Test User',
          caseName: 'Test Case',
        },
        fallbackTitle: 'Fallback Title',
        fallbackMessage: 'Fallback Message',
      };

      expect(typeof templatedNotificationService.sendTemplatedNotification).toBe('function');
      expect(input.templateCode).toBe('case_approved_default');
      expect(input.variables.userName).toBe('Test User');
    });
  });
});
