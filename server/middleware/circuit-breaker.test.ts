import { describe, it, expect, beforeEach } from 'vitest';
import { 
  CircuitBreaker, 
  CircuitState, 
  CircuitBreakerError,
  llmCircuitBreaker,
  dbCircuitBreaker,
  getAllCircuitBreakerStatus 
} from './circuit-breaker';

describe('Circuit Breaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      name: 'TEST',
      failureThreshold: 3,
      resetTimeout: 1000,
      halfOpenRequests: 1,
    });
  });

  describe('Estado Inicial', () => {
    it('deve iniciar no estado CLOSED', () => {
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('deve ter métricas zeradas', () => {
      const metrics = breaker.getMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(0);
    });
  });

  describe('Execução com Sucesso', () => {
    it('deve permitir execução quando CLOSED', async () => {
      const result = await breaker.execute(async () => 'success');
      expect(result).toBe('success');
    });

    it('deve incrementar métricas de sucesso', async () => {
      await breaker.execute(async () => 'success');
      const metrics = breaker.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
    });

    it('deve manter estado CLOSED após sucesso', async () => {
      await breaker.execute(async () => 'success');
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });
  });

  describe('Execução com Falha', () => {
    it('deve propagar erro e incrementar contador de falhas', async () => {
      await expect(breaker.execute(async () => {
        throw new Error('test error');
      })).rejects.toThrow('test error');
      
      const metrics = breaker.getMetrics();
      expect(metrics.failedRequests).toBe(1);
    });

    it('deve abrir circuito após atingir threshold', async () => {
      // Simular 3 falhas (threshold)
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(async () => {
            throw new Error('test error');
          });
        } catch (e) {
          // Esperado
        }
      }
      
      expect(breaker.getState()).toBe(CircuitState.OPEN);
    });
  });

  describe('Estado OPEN', () => {
    beforeEach(async () => {
      // Abrir o circuito
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(async () => {
            throw new Error('test error');
          });
        } catch (e) {
          // Esperado
        }
      }
    });

    it('deve bloquear requisições quando OPEN', async () => {
      await expect(breaker.execute(async () => 'success')).rejects.toThrow(CircuitBreakerError);
    });

    it('deve usar fallback quando configurado', async () => {
      const breakerWithFallback = new CircuitBreaker({
        name: 'TEST_FALLBACK',
        failureThreshold: 1,
        resetTimeout: 1000,
        halfOpenRequests: 1,
        fallback: async () => 'fallback_value',
      });

      // Abrir circuito
      try {
        await breakerWithFallback.execute(async () => {
          throw new Error('test error');
        });
      } catch (e) {
        // Esperado
      }

      // Próxima requisição deve usar fallback
      const result = await breakerWithFallback.execute(async () => 'success');
      expect(result).toBe('fallback_value');
    });
  });

  describe('Reset', () => {
    it('deve resetar para estado inicial', async () => {
      // Gerar algumas falhas
      try {
        await breaker.execute(async () => {
          throw new Error('test error');
        });
      } catch (e) {
        // Esperado
      }

      breaker.reset();
      
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
      const metrics = breaker.getMetrics();
      // Métricas são mantidas após reset
      expect(metrics.failedRequests).toBe(1);
    });
  });

  describe('Circuit Breakers Pré-configurados', () => {
    it('deve ter LLM circuit breaker configurado', () => {
      expect(llmCircuitBreaker).toBeDefined();
      expect(llmCircuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('deve ter DB circuit breaker configurado', () => {
      expect(dbCircuitBreaker).toBeDefined();
      expect(dbCircuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('deve retornar status de todos os breakers', () => {
      const status = getAllCircuitBreakerStatus();
      
      expect(status.llm).toBeDefined();
      expect(status.database).toBeDefined();
      expect(status.externalServices).toBeDefined();
    });
  });
});
