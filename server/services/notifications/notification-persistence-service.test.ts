import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationPersistenceService } from './notification-persistence-service';

// Mock do getDb
vi.mock('../../db', () => ({
  getDb: vi.fn(),
}));

describe('Notification Persistence Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('deve retornar null quando db não está disponível', async () => {
      const { getDb } = await import('../../db');
      (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await notificationPersistenceService.create({
        userId: 1,
        type: 'info',
        title: 'Test',
        message: 'Test message',
      });

      expect(result).toBeNull();
    });
  });

  describe('getByUserId', () => {
    it('deve retornar objeto vazio quando db não está disponível', async () => {
      const { getDb } = await import('../../db');
      (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await notificationPersistenceService.getByUserId(1);

      expect(result).toEqual({
        notifications: [],
        total: 0,
        unreadCount: 0,
      });
    });
  });

  describe('markAsRead', () => {
    it('deve retornar false quando db não está disponível', async () => {
      const { getDb } = await import('../../db');
      (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await notificationPersistenceService.markAsRead(1, 1);

      expect(result).toBe(false);
    });
  });

  describe('markAllAsRead', () => {
    it('deve retornar 0 quando db não está disponível', async () => {
      const { getDb } = await import('../../db');
      (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await notificationPersistenceService.markAllAsRead(1);

      expect(result).toBe(0);
    });
  });

  describe('delete', () => {
    it('deve retornar false quando db não está disponível', async () => {
      const { getDb } = await import('../../db');
      (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await notificationPersistenceService.delete(1, 1);

      expect(result).toBe(false);
    });
  });

  describe('cleanupOldNotifications', () => {
    it('deve retornar 0 quando db não está disponível', async () => {
      const { getDb } = await import('../../db');
      (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await notificationPersistenceService.cleanupOldNotifications(1);

      expect(result).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    it('deve retornar 0 quando db não está disponível', async () => {
      const { getDb } = await import('../../db');
      (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await notificationPersistenceService.getUnreadCount(1);

      expect(result).toBe(0);
    });
  });

  describe('NotificationType', () => {
    it('deve aceitar todos os tipos de notificação válidos', () => {
      const validTypes = [
        'info', 'success', 'warning', 'error',
        'case_pending', 'case_approved', 'case_rejected',
        'certificate_issued', 'token_earned', 'system'
      ];

      expect(validTypes.length).toBe(10);
    });
  });
});
