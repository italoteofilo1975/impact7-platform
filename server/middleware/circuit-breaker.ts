/**
 * Circuit Breaker Pattern Implementation
 * SET7.07 - Resiliência, Continuidade e Evolução
 * 
 * Implementa o padrão Circuit Breaker para proteger
 * o sistema contra falhas em cascata de serviços externos
 */

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal - requisições passam
  OPEN = 'OPEN',         // Falha - requisições bloqueadas
  HALF_OPEN = 'HALF_OPEN' // Testando - algumas requisições passam
}

interface CircuitBreakerOptions {
  /** Nome do circuit breaker para logging */
  name: string;
  /** Número de falhas antes de abrir o circuito */
  failureThreshold: number;
  /** Tempo em ms que o circuito permanece aberto */
  resetTimeout: number;
  /** Número de requisições de teste em HALF_OPEN */
  halfOpenRequests: number;
  /** Função de fallback quando circuito está aberto */
  fallback?: () => Promise<any>;
  /** Callback quando estado muda */
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
}

interface CircuitBreakerMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  stateChanges: Array<{ from: CircuitState; to: CircuitState; timestamp: number }>;
}

/**
 * Implementação do Circuit Breaker
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number | null = null;
  private halfOpenAttempts: number = 0;
  private metrics: CircuitBreakerMetrics;
  
  constructor(private options: CircuitBreakerOptions) {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      lastFailureTime: null,
      lastSuccessTime: null,
      stateChanges: [],
    };
  }
  
  /**
   * Executa uma função protegida pelo circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.metrics.totalRequests++;
    
    // Verificar se deve tentar reabrir o circuito
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        return this.handleOpenCircuit();
      }
    }
    
    // Em HALF_OPEN, limitar número de tentativas
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenAttempts >= this.options.halfOpenRequests) {
        return this.handleOpenCircuit();
      }
      this.halfOpenAttempts++;
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  /**
   * Registra sucesso
   */
  private onSuccess(): void {
    this.failureCount = 0;
    this.successCount++;
    this.metrics.successfulRequests++;
    this.metrics.lastSuccessTime = Date.now();
    
    if (this.state === CircuitState.HALF_OPEN) {
      // Sucesso em HALF_OPEN - fechar o circuito
      this.transitionTo(CircuitState.CLOSED);
      this.halfOpenAttempts = 0;
    }
  }
  
  /**
   * Registra falha
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.metrics.failedRequests++;
    this.metrics.lastFailureTime = Date.now();
    
    if (this.state === CircuitState.HALF_OPEN) {
      // Falha em HALF_OPEN - abrir novamente
      this.transitionTo(CircuitState.OPEN);
      this.halfOpenAttempts = 0;
    } else if (this.failureCount >= this.options.failureThreshold) {
      // Atingiu threshold - abrir circuito
      this.transitionTo(CircuitState.OPEN);
    }
  }
  
  /**
   * Verifica se deve tentar resetar o circuito
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    return Date.now() - this.lastFailureTime >= this.options.resetTimeout;
  }
  
  /**
   * Trata requisição quando circuito está aberto
   */
  private async handleOpenCircuit(): Promise<any> {
    if (this.options.fallback) {
      return this.options.fallback();
    }
    throw new CircuitBreakerError(
      `Circuit breaker "${this.options.name}" is OPEN. Service temporarily unavailable.`
    );
  }
  
  /**
   * Transiciona para novo estado
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    
    this.metrics.stateChanges.push({
      from: oldState,
      to: newState,
      timestamp: Date.now(),
    });
    
    console.log(`[CircuitBreaker:${this.options.name}] ${oldState} -> ${newState}`);
    
    if (this.options.onStateChange) {
      this.options.onStateChange(oldState, newState);
    }
  }
  
  /**
   * Retorna estado atual
   */
  getState(): CircuitState {
    return this.state;
  }
  
  /**
   * Retorna métricas
   */
  getMetrics(): CircuitBreakerMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Reseta o circuit breaker manualmente
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.halfOpenAttempts = 0;
  }
}

/**
 * Erro específico do Circuit Breaker
 */
export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

// ============================================
// Circuit Breakers pré-configurados
// ============================================

/**
 * Circuit Breaker para API LLM (Jarvis)
 */
export const llmCircuitBreaker = new CircuitBreaker({
  name: 'LLM_API',
  failureThreshold: 3,
  resetTimeout: 30000, // 30 segundos
  halfOpenRequests: 1,
  fallback: async () => ({
    error: true,
    message: 'O serviço de IA está temporariamente indisponível. Por favor, tente novamente em alguns instantes.',
    fallback: true,
  }),
  onStateChange: (from, to) => {
    if (to === CircuitState.OPEN) {
      console.error('[ALERT] LLM Circuit Breaker OPEN - Jarvis indisponível');
    }
  },
});

/**
 * Circuit Breaker para Banco de Dados
 */
export const dbCircuitBreaker = new CircuitBreaker({
  name: 'DATABASE',
  failureThreshold: 5,
  resetTimeout: 10000, // 10 segundos
  halfOpenRequests: 2,
  onStateChange: (from, to) => {
    if (to === CircuitState.OPEN) {
      console.error('[CRITICAL] Database Circuit Breaker OPEN');
    }
  },
});

/**
 * Circuit Breaker para serviços externos (OAuth, Storage, etc)
 */
export const externalServicesCircuitBreaker = new CircuitBreaker({
  name: 'EXTERNAL_SERVICES',
  failureThreshold: 3,
  resetTimeout: 60000, // 1 minuto
  halfOpenRequests: 1,
  onStateChange: (from, to) => {
    if (to === CircuitState.OPEN) {
      console.error('[ALERT] External Services Circuit Breaker OPEN');
    }
  },
});

// ============================================
// Funções auxiliares
// ============================================

/**
 * Wrapper para executar função com circuit breaker
 */
export async function withCircuitBreaker<T>(
  breaker: CircuitBreaker,
  fn: () => Promise<T>
): Promise<T> {
  return breaker.execute(fn);
}

/**
 * Retorna status de todos os circuit breakers
 */
export function getAllCircuitBreakerStatus() {
  return {
    llm: {
      state: llmCircuitBreaker.getState(),
      metrics: llmCircuitBreaker.getMetrics(),
    },
    database: {
      state: dbCircuitBreaker.getState(),
      metrics: dbCircuitBreaker.getMetrics(),
    },
    externalServices: {
      state: externalServicesCircuitBreaker.getState(),
      metrics: externalServicesCircuitBreaker.getMetrics(),
    },
  };
}
