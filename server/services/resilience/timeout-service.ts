/**
 * Timeout Service
 * SET7.07 - Resiliência e Evolução
 * 
 * Implementa timeouts explícitos para todas as operações
 */

export interface TimeoutConfig {
  name: string;
  timeout: number;        // Timeout em ms
  retries: number;        // Número de retries
  retryDelay: number;     // Delay entre retries em ms
  exponentialBackoff: boolean;
}

// Default timeout configurations
export const DEFAULT_TIMEOUTS: Record<string, TimeoutConfig> = {
  llm: {
    name: "llm",
    timeout: 60000,       // 60 seconds for LLM
    retries: 2,
    retryDelay: 1000,
    exponentialBackoff: true,
  },
  database: {
    name: "database",
    timeout: 10000,       // 10 seconds
    retries: 3,
    retryDelay: 500,
    exponentialBackoff: true,
  },
  email: {
    name: "email",
    timeout: 30000,       // 30 seconds
    retries: 2,
    retryDelay: 2000,
    exponentialBackoff: false,
  },
  stripe: {
    name: "stripe",
    timeout: 30000,       // 30 seconds
    retries: 2,
    retryDelay: 1000,
    exponentialBackoff: true,
  },
  storage: {
    name: "storage",
    timeout: 60000,       // 60 seconds for file uploads
    retries: 2,
    retryDelay: 1000,
    exponentialBackoff: true,
  },
  webhook: {
    name: "webhook",
    timeout: 10000,       // 10 seconds
    retries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
  },
  http: {
    name: "http",
    timeout: 15000,       // 15 seconds for general HTTP
    retries: 2,
    retryDelay: 1000,
    exponentialBackoff: true,
  },
};

// Timeout error class
export class TimeoutError extends Error {
  constructor(
    public readonly operation: string,
    public readonly timeout: number,
    public readonly attempt: number
  ) {
    super(`Operation '${operation}' timed out after ${timeout}ms (attempt ${attempt})`);
    this.name = "TimeoutError";
  }
}

// Retry error class
export class RetryExhaustedError extends Error {
  constructor(
    public readonly operation: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(`Operation '${operation}' failed after ${attempts} attempts: ${lastError.message}`);
    this.name = "RetryExhaustedError";
  }
}

// Execute with timeout
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeout: number,
  operation: string = "unknown"
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(operation, timeout, 1));
    }, timeout);

    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

// Execute with retry
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<TimeoutConfig> & { name: string }
): Promise<T> {
  const fullConfig: TimeoutConfig = {
    ...DEFAULT_TIMEOUTS[config.name] || DEFAULT_TIMEOUTS.http,
    ...config,
  };

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= fullConfig.retries + 1; attempt++) {
    try {
      const result = await withTimeout(fn, fullConfig.timeout, fullConfig.name);
      return result;
    } catch (error) {
      lastError = error as Error;
      
      console.log(`[Timeout] ${fullConfig.name}: Attempt ${attempt} failed: ${lastError.message}`);
      
      if (attempt <= fullConfig.retries) {
        const delay = fullConfig.exponentialBackoff
          ? fullConfig.retryDelay * Math.pow(2, attempt - 1)
          : fullConfig.retryDelay;
        
        console.log(`[Timeout] ${fullConfig.name}: Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw new RetryExhaustedError(fullConfig.name, fullConfig.retries + 1, lastError!);
}

// Sleep helper
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Execute with timeout and circuit breaker
export async function withResiliency<T>(
  name: string,
  fn: () => Promise<T>,
  options?: {
    timeout?: number;
    retries?: number;
    fallback?: () => T | Promise<T>;
  }
): Promise<T> {
  const config = DEFAULT_TIMEOUTS[name] || DEFAULT_TIMEOUTS.http;
  
  try {
    return await withRetry(fn, {
      name,
      timeout: options?.timeout || config.timeout,
      retries: options?.retries ?? config.retries,
    });
  } catch (error) {
    if (options?.fallback) {
      console.log(`[Timeout] ${name}: Using fallback after error: ${(error as Error).message}`);
      return options.fallback();
    }
    throw error;
  }
}

// Create a wrapper function with built-in timeout
export function createTimeoutWrapper<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T,
  options?: Partial<TimeoutConfig>
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return withRetry(() => fn(...args), { name, ...options });
  }) as T;
}

// Get timeout config for a service
export function getTimeoutConfig(name: string): TimeoutConfig {
  return DEFAULT_TIMEOUTS[name] || DEFAULT_TIMEOUTS.http;
}

// Update timeout config at runtime
export function updateTimeoutConfig(name: string, config: Partial<TimeoutConfig>): void {
  if (DEFAULT_TIMEOUTS[name]) {
    DEFAULT_TIMEOUTS[name] = { ...DEFAULT_TIMEOUTS[name], ...config };
  } else {
    DEFAULT_TIMEOUTS[name] = { ...DEFAULT_TIMEOUTS.http, name, ...config };
  }
}

export default {
  withTimeout,
  withRetry,
  withResiliency,
  createTimeoutWrapper,
  getTimeoutConfig,
  updateTimeoutConfig,
  TimeoutError,
  RetryExhaustedError,
  DEFAULT_TIMEOUTS,
};
