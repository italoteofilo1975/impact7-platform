import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emailDigestService } from './email-digest-service';

describe('EmailDigestService', () => {
  describe('generateDigestEmailHTML', () => {
    it('deve gerar HTML válido para digest diário', () => {
      const digest = {
        userId: 1,
        userEmail: 'test@example.com',
        userName: 'João Silva',
        frequency: 'daily' as const,
        notifications: [
          {
            id: 1,
            type: 'case_approved',
            title: 'Case Aprovado',
            message: 'Seu case foi aprovado!',
            createdAt: Date.now(),
          },
        ],
      };

      const html = emailDigestService.generateDigestEmailHTML(digest);

      expect(html).toContain('João Silva');
      expect(html).toContain('últimas 24 horas');
      expect(html).toContain('Case Aprovado');
      expect(html).toContain('Seu case foi aprovado!');
      expect(html).toContain('IMPACT7');
    });

    it('deve gerar HTML válido para digest semanal', () => {
      const digest = {
        userId: 1,
        userEmail: 'test@example.com',
        userName: 'Maria Santos',
        frequency: 'weekly' as const,
        notifications: [
          {
            id: 1,
            type: 'certificate_issued',
            title: 'Certificado Emitido',
            message: 'Seu certificado está pronto!',
            createdAt: Date.now(),
          },
          {
            id: 2,
            type: 'token_earned',
            title: 'Tokens Ganhos',
            message: 'Você ganhou 50 tokens!',
            createdAt: Date.now(),
          },
        ],
      };

      const html = emailDigestService.generateDigestEmailHTML(digest);

      expect(html).toContain('Maria Santos');
      expect(html).toContain('última semana');
      expect(html).toContain('Certificado Emitido');
      expect(html).toContain('Tokens Ganhos');
      expect(html).toContain('2');
    });

    it('deve incluir link para notificações', () => {
      const digest = {
        userId: 1,
        userEmail: 'test@example.com',
        userName: 'Test User',
        frequency: 'daily' as const,
        notifications: [],
      };

      const html = emailDigestService.generateDigestEmailHTML(digest);

      expect(html).toContain('/notificacoes');
    });
  });

  describe('generateDigestEmailText', () => {
    it('deve gerar texto plano para digest', () => {
      const digest = {
        userId: 1,
        userEmail: 'test@example.com',
        userName: 'Pedro Costa',
        frequency: 'daily' as const,
        notifications: [
          {
            id: 1,
            type: 'info',
            title: 'Informação',
            message: 'Uma mensagem de teste',
            createdAt: Date.now(),
          },
        ],
      };

      const text = emailDigestService.generateDigestEmailText(digest);

      expect(text).toContain('Pedro Costa');
      expect(text).toContain('últimas 24 horas');
      expect(text).toContain('Informação');
      expect(text).toContain('Uma mensagem de teste');
    });

    it('deve listar múltiplas notificações', () => {
      const digest = {
        userId: 1,
        userEmail: 'test@example.com',
        userName: 'Ana Lima',
        frequency: 'weekly' as const,
        notifications: [
          {
            id: 1,
            type: 'success',
            title: 'Sucesso 1',
            message: 'Mensagem 1',
            createdAt: Date.now(),
          },
          {
            id: 2,
            type: 'warning',
            title: 'Aviso 2',
            message: 'Mensagem 2',
            createdAt: Date.now(),
          },
        ],
      };

      const text = emailDigestService.generateDigestEmailText(digest);

      expect(text).toContain('Sucesso 1');
      expect(text).toContain('Aviso 2');
      expect(text).toContain('2 notificação');
    });
  });

  describe('getStatus', () => {
    it('deve retornar status do serviço', () => {
      const status = emailDigestService.getStatus();

      expect(status).toHaveProperty('lastDailyRun');
      expect(status).toHaveProperty('lastWeeklyRun');
      expect(status).toHaveProperty('nextDailyRun');
      expect(status).toHaveProperty('nextWeeklyRun');
    });

    it('deve calcular próxima execução diária', () => {
      const status = emailDigestService.getStatus();
      const now = new Date();

      expect(status.nextDailyRun).toBeInstanceOf(Date);
      expect(status.nextDailyRun.getTime()).toBeGreaterThan(now.getTime());
    });

    it('deve calcular próxima execução semanal', () => {
      const status = emailDigestService.getStatus();
      const now = new Date();

      expect(status.nextWeeklyRun).toBeInstanceOf(Date);
      expect(status.nextWeeklyRun.getTime()).toBeGreaterThan(now.getTime());
    });
  });
});
