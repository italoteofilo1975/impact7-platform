import { describe, it, expect } from 'vitest';
import { RATE_LIMIT_CONFIG, getRateLimitStatus, cleanupExpiredEntries } from './rate-limiter';

describe('Rate Limiter', () => {
  describe('RATE_LIMIT_CONFIG', () => {
    it('deve ter configuração para endpoints gerais', () => {
      expect(RATE_LIMIT_CONFIG.general).toBeDefined();
      expect(RATE_LIMIT_CONFIG.general.max).toBe(100);
      expect(RATE_LIMIT_CONFIG.general.windowMs).toBe(60 * 1000);
    });

    it('deve ter configuração mais restritiva para auth', () => {
      expect(RATE_LIMIT_CONFIG.auth).toBeDefined();
      expect(RATE_LIMIT_CONFIG.auth.max).toBe(10);
      expect(RATE_LIMIT_CONFIG.auth.windowMs).toBe(15 * 60 * 1000);
    });

    it('deve ter configuração restritiva para Jarvis', () => {
      expect(RATE_LIMIT_CONFIG.jarvis).toBeDefined();
      expect(RATE_LIMIT_CONFIG.jarvis.max).toBe(10);
      expect(RATE_LIMIT_CONFIG.jarvis.windowMs).toBe(60 * 1000);
    });

    it('deve ter configuração para calculadora', () => {
      expect(RATE_LIMIT_CONFIG.calculator).toBeDefined();
      expect(RATE_LIMIT_CONFIG.calculator.max).toBe(30);
    });

    it('deve ter configuração restritiva para formulários', () => {
      expect(RATE_LIMIT_CONFIG.forms).toBeDefined();
      expect(RATE_LIMIT_CONFIG.forms.max).toBe(5);
      expect(RATE_LIMIT_CONFIG.forms.windowMs).toBe(60 * 60 * 1000);
    });

    it('deve ter configuração permissiva para analytics', () => {
      expect(RATE_LIMIT_CONFIG.analytics).toBeDefined();
      expect(RATE_LIMIT_CONFIG.analytics.max).toBe(200);
    });
  });

  describe('getRateLimitStatus', () => {
    it('deve retornar status inicial quando não há requisições', () => {
      const status = getRateLimitStatus('test-key-1', RATE_LIMIT_CONFIG.general);
      
      expect(status.remaining).toBe(RATE_LIMIT_CONFIG.general.max);
      expect(status.total).toBe(RATE_LIMIT_CONFIG.general.max);
      expect(status.isLimited).toBe(false);
    });
  });

  describe('cleanupExpiredEntries', () => {
    it('deve executar sem erros', () => {
      expect(() => cleanupExpiredEntries()).not.toThrow();
    });
  });

  describe('Mensagens de erro', () => {
    it('deve ter mensagens em português', () => {
      expect(RATE_LIMIT_CONFIG.general.message).toContain('requisições');
      expect(RATE_LIMIT_CONFIG.auth.message).toContain('autenticação');
      expect(RATE_LIMIT_CONFIG.jarvis.message).toContain('Jarvis');
    });
  });
});
