import { describe, it, expect, beforeEach } from 'vitest';
import { errorTracker, handleFrontendError } from './error-service';

describe('Error Tracking Service', () => {
  beforeEach(() => {
    errorTracker.clear();
  });

  describe('captureError', () => {
    it('deve capturar erro com string', () => {
      const id = errorTracker.captureError('Test error');
      
      expect(id).toMatch(/^err_/);
      
      const stats = errorTracker.getStats();
      expect(stats.total).toBe(1);
      expect(stats.byLevel.error).toBe(1);
    });

    it('deve capturar erro com Error object', () => {
      const error = new Error('Test error');
      const id = errorTracker.captureError(error);
      
      expect(id).toMatch(/^err_/);
      
      const recentErrors = errorTracker.getRecentErrors(1);
      expect(recentErrors[0].stack).toBeDefined();
    });

    it('deve agrupar erros similares por fingerprint', () => {
      const id1 = errorTracker.captureError('Same error message');
      const id2 = errorTracker.captureError('Same error message');
      
      // Should return same ID for grouped errors
      expect(id1).toBe(id2);
      
      const grouped = errorTracker.getGroupedErrors();
      expect(grouped.length).toBe(1);
      expect(grouped[0].count).toBe(2);
    });

    it('deve incluir contexto no erro', () => {
      errorTracker.captureError('Error with context', {
        userId: 'user123',
        url: '/api/test',
      });
      
      const recentErrors = errorTracker.getRecentErrors(1);
      expect(recentErrors[0].context.userId).toBe('user123');
      expect(recentErrors[0].context.url).toBe('/api/test');
    });
  });

  describe('captureWarning', () => {
    it('deve capturar warning', () => {
      const id = errorTracker.captureWarning('Test warning');
      
      expect(id).toMatch(/^warn_/);
      
      const stats = errorTracker.getStats();
      expect(stats.byLevel.warning).toBe(1);
    });
  });

  describe('captureInfo', () => {
    it('deve capturar info', () => {
      const id = errorTracker.captureInfo('Test info');
      
      expect(id).toMatch(/^info_/);
      
      const stats = errorTracker.getStats();
      expect(stats.byLevel.info).toBe(1);
    });
  });

  describe('getRecentErrors', () => {
    it('deve retornar erros recentes em ordem decrescente', () => {
      errorTracker.captureError('Error 1');
      errorTracker.captureWarning('Warning 1');
      errorTracker.captureInfo('Info 1');
      
      const recent = errorTracker.getRecentErrors(10);
      
      expect(recent.length).toBe(3);
      expect(recent[0].level).toBe('info'); // Most recent
      expect(recent[2].level).toBe('error'); // Oldest
    });

    it('deve respeitar limite', () => {
      for (let i = 0; i < 10; i++) {
        errorTracker.captureError(`Error ${i}`);
      }
      
      const recent = errorTracker.getRecentErrors(5);
      expect(recent.length).toBe(5);
    });
  });

  describe('getGroupedErrors', () => {
    it('deve retornar erros agrupados ordenados por contagem', () => {
      errorTracker.captureError('Frequent error');
      errorTracker.captureError('Frequent error');
      errorTracker.captureError('Frequent error');
      errorTracker.captureError('Rare error');
      
      const grouped = errorTracker.getGroupedErrors();
      
      expect(grouped[0].count).toBe(3);
      expect(grouped[1].count).toBe(1);
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas corretas', () => {
      errorTracker.captureError('Error 1');
      errorTracker.captureError('Error 2');
      errorTracker.captureWarning('Warning 1');
      errorTracker.captureInfo('Info 1');
      
      const stats = errorTracker.getStats();
      
      expect(stats.total).toBe(4);
      expect(stats.byLevel.error).toBe(2);
      expect(stats.byLevel.warning).toBe(1);
      expect(stats.byLevel.info).toBe(1);
    });
  });

  describe('clear', () => {
    it('deve limpar todos os erros', () => {
      errorTracker.captureError('Error 1');
      errorTracker.captureWarning('Warning 1');
      
      errorTracker.clear();
      
      const stats = errorTracker.getStats();
      expect(stats.total).toBe(0);
      expect(errorTracker.getRecentErrors().length).toBe(0);
    });
  });

  describe('handleFrontendError', () => {
    it('deve capturar erro do frontend', () => {
      const id = handleFrontendError('Frontend error', 'at Component.render');
      
      expect(id).toMatch(/^err_/);
      
      const recentErrors = errorTracker.getRecentErrors(1);
      expect(recentErrors[0].tags.source).toBe('frontend');
    });
  });
});
