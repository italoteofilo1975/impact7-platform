/**
 * Circuit Breaker Service
 * SET7.07 - Resiliência e Evolução
 * 
 * Implementa padrão circuit breaker para integrações externas
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;      // Número de falhas para abrir o circuito
  successThreshold: number;      // Número de sucessos para fechar o circuito
  timeout: number;               // Tempo em ms para tentar novamente após abrir
  resetTimeout: number;          // Tempo em ms para resetar contadores
}

export interface CircuitBreakerStats {
  name: string;
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: Date | null;
  lastSuccess: Date | null;
  totalCalls: number;
  totalFailures: number;
  totalSuccesses: number;
  openedAt: Date | null;
  closedAt: Date | null;
}

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: Date | null;
  lastSuccess: Date | null;
  totalCalls: number;
  totalFailures: number;
  totalSuccesses: number;
  openedAt: Date | null;
  closedAt: Date | null;
  nextAttempt: number;
}

// Default configurations for different services
export const DEFAULT_CONFIGS: Record<string, CircuitBreakerConfig> = {
  llm: {
    name: "llm",
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000,      // 30 seconds
    resetTimeout: 60000, // 1 minute
  },
  database: {
    name: "database",
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 10000,      // 10 seconds
    resetTimeout: 30000, // 30 seconds
  },
  email: {
    name: "email",
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 60000,      // 1 minute
    resetTimeout: 120000, // 2 minutes
  },
  stripe: {
    name: "stripe",
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000,      // 30 seconds
    resetTimeout: 60000, // 1 minute
  },
  storage: {
    name: "storage",
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 15000,      // 15 seconds
    resetTimeout: 30000, // 30 seconds
  },
  webhook: {
    name: "webhook",
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 60000,      // 1 minute
    resetTimeout: 120000, // 2 minutes
  },
};

// In-memory circuit breaker states
const circuitBreakers = new Map<string, CircuitBreakerState>();

// Initialize circuit breaker
function initCircuitBreaker(config: CircuitBreakerConfig): CircuitBreakerState {
  return {
    state: "CLOSED",
    failures: 0,
    successes: 0,
    lastFailure: null,
    lastSuccess: null,
    totalCalls: 0,
    totalFailures: 0,
    totalSuccesses: 0,
    openedAt: null,
    closedAt: Date.now(),
    nextAttempt: 0,
  };
}

// Get or create circuit breaker
function getCircuitBreaker(name: string): CircuitBreakerState {
  if (!circuitBreakers.has(name)) {
    const config = DEFAULT_CONFIGS[name] || {
      name,
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 30000,
      resetTimeout: 60000,
    };
    circuitBreakers.set(name, initCircuitBreaker(config));
  }
  return circuitBreakers.get(name)!;
}

// Get config for circuit breaker
function getConfig(name: string): CircuitBreakerConfig {
  return DEFAULT_CONFIGS[name] || {
    name,
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 30000,
    resetTimeout: 60000,
  };
}

// Check if circuit allows request
export function canExecute(name: string): boolean {
  const cb = getCircuitBreaker(name);
  const config = getConfig(name);
  
  switch (cb.state) {
    case "CLOSED":
      return true;
    case "OPEN":
      if (Date.now() >= cb.nextAttempt) {
        // Transition to HALF_OPEN
        cb.state = "HALF_OPEN";
        cb.successes = 0;
        console.log(`[CircuitBreaker] ${name}: OPEN -> HALF_OPEN`);
        return true;
      }
      return false;
    case "HALF_OPEN":
      return true;
    default:
      return true;
  }
}

// Record success
export function recordSuccess(name: string): void {
  const cb = getCircuitBreaker(name);
  const config = getConfig(name);
  
  cb.totalCalls++;
  cb.totalSuccesses++;
  cb.lastSuccess = new Date();
  cb.successes++;
  
  if (cb.state === "HALF_OPEN") {
    if (cb.successes >= config.successThreshold) {
      cb.state = "CLOSED";
      cb.failures = 0;
      cb.closedAt = new Date();
      console.log(`[CircuitBreaker] ${name}: HALF_OPEN -> CLOSED`);
    }
  } else if (cb.state === "CLOSED") {
    // Reset failures on success
    cb.failures = 0;
  }
}

// Record failure
export function recordFailure(name: string, error?: Error): void {
  const cb = getCircuitBreaker(name);
  const config = getConfig(name);
  
  cb.totalCalls++;
  cb.totalFailures++;
  cb.lastFailure = new Date();
  cb.failures++;
  
  console.log(`[CircuitBreaker] ${name}: Failure recorded (${cb.failures}/${config.failureThreshold})`);
  
  if (cb.state === "HALF_OPEN") {
    // Any failure in HALF_OPEN opens the circuit
    cb.state = "OPEN";
    cb.openedAt = new Date();
    cb.nextAttempt = Date.now() + config.timeout;
    console.log(`[CircuitBreaker] ${name}: HALF_OPEN -> OPEN`);
  } else if (cb.state === "CLOSED" && cb.failures >= config.failureThreshold) {
    cb.state = "OPEN";
    cb.openedAt = new Date();
    cb.nextAttempt = Date.now() + config.timeout;
    console.log(`[CircuitBreaker] ${name}: CLOSED -> OPEN`);
  }
}

// Execute with circuit breaker
export async function executeWithCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  fallback?: () => T | Promise<T>
): Promise<T> {
  if (!canExecute(name)) {
    console.log(`[CircuitBreaker] ${name}: Circuit is OPEN, rejecting request`);
    if (fallback) {
      return fallback();
    }
    throw new Error(`Circuit breaker ${name} is OPEN`);
  }
  
  try {
    const result = await fn();
    recordSuccess(name);
    return result;
  } catch (error) {
    recordFailure(name, error as Error);
    if (fallback) {
      return fallback();
    }
    throw error;
  }
}

// Get circuit breaker stats
export function getCircuitBreakerStats(name: string): CircuitBreakerStats {
  const cb = getCircuitBreaker(name);
  return {
    name,
    state: cb.state,
    failures: cb.failures,
    successes: cb.successes,
    lastFailure: cb.lastFailure,
    lastSuccess: cb.lastSuccess,
    totalCalls: cb.totalCalls,
    totalFailures: cb.totalFailures,
    totalSuccesses: cb.totalSuccesses,
    openedAt: cb.openedAt,
    closedAt: cb.closedAt,
  };
}

// Get all circuit breaker stats
export function getAllCircuitBreakerStats(): CircuitBreakerStats[] {
  const stats: CircuitBreakerStats[] = [];
  
  // Include all default configs
  Object.keys(DEFAULT_CONFIGS).forEach(name => {
    stats.push(getCircuitBreakerStats(name));
  });
  
  // Include any additional circuit breakers
  circuitBreakers.forEach((_, name) => {
    if (!DEFAULT_CONFIGS[name]) {
      stats.push(getCircuitBreakerStats(name));
    }
  });
  
  return stats;
}

// Reset circuit breaker
export function resetCircuitBreaker(name: string): void {
  const config = getConfig(name);
  circuitBreakers.set(name, initCircuitBreaker(config));
  console.log(`[CircuitBreaker] ${name}: Reset to CLOSED`);
}

// Reset all circuit breakers
export function resetAllCircuitBreakers(): void {
  circuitBreakers.forEach((_, name) => {
    resetCircuitBreaker(name);
  });
}

// Create a circuit breaker wrapper for a function
export function withCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T,
  fallback?: (...args: Parameters<T>) => ReturnType<T>
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return executeWithCircuitBreaker(
      name,
      () => fn(...args),
      fallback ? () => fallback(...args) : undefined
    );
  }) as T;
}

export default {
  canExecute,
  recordSuccess,
  recordFailure,
  executeWithCircuitBreaker,
  getCircuitBreakerStats,
  getAllCircuitBreakerStats,
  resetCircuitBreaker,
  resetAllCircuitBreakers,
  withCircuitBreaker,
  DEFAULT_CONFIGS,
};
