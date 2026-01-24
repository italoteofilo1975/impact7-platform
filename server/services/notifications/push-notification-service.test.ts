import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUserPreferences,
  updateUserPreferences,
  getUserNotifications,
  markNotificationAsRead,
  getUnreadCount,
  getNotificationStats,
} from './push-notification-service';

describe('Push Notification Service', () => {
  const testUserId = 'test-user-123';

  describe('getUserPreferences', () => {
    it('deve retornar preferências padrão para novo usuário', () => {
      const prefs = getUserPreferences('new-user-456');
      
      expect(prefs.userId).toBe('new-user-456');
      expect(prefs.enabledSeverities).toContain('P1');
      expect(prefs.enabledSeverities).toContain('P2');
      expect(prefs.enableEmail).toBe(true);
      expect(prefs.enablePush).toBe(true);
      expect(prefs.timezone).toBe('America/Sao_Paulo');
    });
  });

  describe('updateUserPreferences', () => {
    it('deve atualizar preferências do usuário', () => {
      const updated = updateUserPreferences(testUserId, {
        enabledSeverities: ['P1'],
        enableEmail: false,
      });
      
      expect(updated.enabledSeverities).toEqual(['P1']);
      expect(updated.enableEmail).toBe(false);
      expect(updated.enablePush).toBe(true); // Não alterado
    });

    it('deve manter preferências anteriores ao atualizar parcialmente', () => {
      updateUserPreferences(testUserId, { enableEmail: true });
      const updated = updateUserPreferences(testUserId, { enablePush: false });
      
      expect(updated.enableEmail).toBe(true);
      expect(updated.enablePush).toBe(false);
    });

    it('deve configurar horário silencioso', () => {
      const updated = updateUserPreferences(testUserId, {
        quietHoursStart: 22,
        quietHoursEnd: 7,
      });
      
      expect(updated.quietHoursStart).toBe(22);
      expect(updated.quietHoursEnd).toBe(7);
    });
  });

  describe('getUserNotifications', () => {
    it('deve retornar lista vazia para usuário sem notificações', () => {
      const notifications = getUserNotifications('no-notifications-user');
      
      expect(notifications).toEqual([]);
    });

    it('deve respeitar limite de notificações', () => {
      const notifications = getUserNotifications(testUserId, 5);
      
      expect(notifications.length).toBeLessThanOrEqual(5);
    });
  });

  describe('markNotificationAsRead', () => {
    it('deve retornar false para notificação inexistente', () => {
      const result = markNotificationAsRead('non-existent-notification');
      
      expect(result).toBe(false);
    });
  });

  describe('getUnreadCount', () => {
    it('deve retornar contagem de não lidas', () => {
      const count = getUnreadCount(testUserId);
      
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getNotificationStats', () => {
    it('deve retornar estatísticas válidas', () => {
      const stats = getNotificationStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('bySeverity');
      expect(stats).toHaveProperty('last24h');
      expect(stats).toHaveProperty('readRate');
      
      expect(stats.bySeverity).toHaveProperty('P1');
      expect(stats.bySeverity).toHaveProperty('P2');
      expect(stats.bySeverity).toHaveProperty('P3');
      expect(stats.bySeverity).toHaveProperty('P4');
      
      expect(stats.readRate).toBeGreaterThanOrEqual(0);
      expect(stats.readRate).toBeLessThanOrEqual(1);
    });
  });
});
