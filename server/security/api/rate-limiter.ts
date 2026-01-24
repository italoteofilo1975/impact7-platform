/**
 * Rate Limiting Module
 * Camada 6: Rate Limiting e DDoS Protection
 * 
 * Implementa rate limiting por IP, usuário e endpoint conforme MYFIPE
 */

// Configurações de rate limiting
const RATE_LIMIT_CONFIG = {
  // Limites por IP
  ip: {
    requests: 1000,
    window: 60 * 60 * 1000, // 1 hora
  },
  // Limites por usuário autenticado
  user: {
    requests: 5000,
    window: 60 * 60 * 1000, // 1 hora
  },
  // Limites por endpoint
  endpoint: {
    requests: 100,
    window: 60 * 1000, // 1 minuto
  },
  // Limites para login
  login: {
    requests: 5,
    window: 15 * 60 * 1000, // 15 minutos
    blockDuration: 60 * 60 * 1000, // 1 hora
  },
  // Limites para API keys
  apiKey: {
    requests: 10000,
    window: 60 * 60 * 1000, // 1 hora
  },
  // Exponential backoff
  backoff: {
    initialDelay: 1000, // 1 segundo
    maxDelay: 60000, // 1 minuto
    multiplier: 2,
  },
};

// Interface para entrada de rate limit
interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
  blocked?: boolean;
  blockedUntil?: number;
  backoffDelay?: number;
}

// Interface para resultado de verificação
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
  blockedUntil?: number;
}

// Armazenamento em memória (em produção, usar Redis)
const ipLimits = new Map<string, RateLimitEntry>();
const userLimits = new Map<string, RateLimitEntry>();
const endpointLimits = new Map<string, RateLimitEntry>();
const apiKeyLimits = new Map<string, RateLimitEntry>();
const loginLimits = new Map<string, RateLimitEntry>();

// Lista de IPs confiáveis (whitelist)
const trustedIPs = new Set<string>([
  '127.0.0.1',
  '::1',
  // Adicionar IPs de admin/parceiros aqui
]);

/**
 * Verificar rate limit genérico
 */
function checkLimit(
  store: Map<string, RateLimitEntry>,
  key: string,
  config: { requests: number; window: number; blockDuration?: number }
): RateLimitResult {
  const now = Date.now();
  let entry = store.get(key);
  
  // Criar nova entrada se não existir
  if (!entry) {
    entry = {
      count: 0,
      firstRequest: now,
      lastRequest: now,
    };
    store.set(key, entry);
  }
  
  // Verificar se está bloqueado
  if (entry.blocked && entry.blockedUntil) {
    if (now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.blockedUntil,
        blockedUntil: entry.blockedUntil,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
      };
    }
    // Desbloquear
    entry.blocked = false;
    entry.blockedUntil = undefined;
    entry.count = 0;
    entry.firstRequest = now;
  }
  
  // Verificar se janela expirou
  if (now - entry.firstRequest > config.window) {
    entry.count = 0;
    entry.firstRequest = now;
    entry.backoffDelay = undefined;
  }
  
  // Incrementar contador
  entry.count++;
  entry.lastRequest = now;
  
  // Calcular remaining
  const remaining = Math.max(0, config.requests - entry.count);
  const resetAt = entry.firstRequest + config.window;
  
  // Verificar se excedeu limite
  if (entry.count > config.requests) {
    // Aplicar bloqueio se configurado
    if (config.blockDuration) {
      entry.blocked = true;
      entry.blockedUntil = now + config.blockDuration;
    }
    
    // Calcular retry-after com backoff
    const backoffDelay = calculateBackoff(entry);
    entry.backoffDelay = backoffDelay;
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.blockedUntil || resetAt,
      retryAfter: Math.ceil(backoffDelay / 1000),
      blockedUntil: entry.blockedUntil,
    };
  }
  
  return {
    allowed: true,
    remaining,
    resetAt,
  };
}

/**
 * Calcular delay com exponential backoff
 */
function calculateBackoff(entry: RateLimitEntry): number {
  const { initialDelay, maxDelay, multiplier } = RATE_LIMIT_CONFIG.backoff;
  
  const currentDelay = entry.backoffDelay || initialDelay;
  const newDelay = Math.min(currentDelay * multiplier, maxDelay);
  
  return newDelay;
}

/**
 * Verificar rate limit por IP
 */
export function checkIPLimit(ip: string): RateLimitResult {
  // IPs confiáveis não têm limite
  if (trustedIPs.has(ip)) {
    return { allowed: true, remaining: Infinity, resetAt: 0 };
  }
  
  return checkLimit(ipLimits, ip, RATE_LIMIT_CONFIG.ip);
}

/**
 * Verificar rate limit por usuário
 */
export function checkUserLimit(userId: string): RateLimitResult {
  return checkLimit(userLimits, userId, RATE_LIMIT_CONFIG.user);
}

/**
 * Verificar rate limit por endpoint
 */
export function checkEndpointLimit(endpoint: string, identifier: string): RateLimitResult {
  const key = `${endpoint}:${identifier}`;
  return checkLimit(endpointLimits, key, RATE_LIMIT_CONFIG.endpoint);
}

/**
 * Verificar rate limit por API key
 */
export function checkAPIKeyLimit(apiKey: string): RateLimitResult {
  return checkLimit(apiKeyLimits, apiKey, RATE_LIMIT_CONFIG.apiKey);
}

/**
 * Verificar rate limit de login
 */
export function checkLoginLimit(ip: string): RateLimitResult {
  return checkLimit(loginLimits, ip, RATE_LIMIT_CONFIG.login);
}

/**
 * Registrar tentativa de login falha
 */
export function recordFailedLogin(ip: string): void {
  const entry = loginLimits.get(ip);
  if (entry) {
    entry.count++;
    entry.lastRequest = Date.now();
  }
}

/**
 * Resetar limite de login após sucesso
 */
export function resetLoginLimit(ip: string): void {
  loginLimits.delete(ip);
}

/**
 * Adicionar IP à whitelist
 */
export function addTrustedIP(ip: string): void {
  trustedIPs.add(ip);
}

/**
 * Remover IP da whitelist
 */
export function removeTrustedIP(ip: string): void {
  trustedIPs.delete(ip);
}

/**
 * Verificar se IP está na whitelist
 */
export function isIPTrusted(ip: string): boolean {
  return trustedIPs.has(ip);
}

/**
 * Bloquear IP manualmente
 */
export function blockIP(ip: string, duration: number = RATE_LIMIT_CONFIG.login.blockDuration): void {
  const now = Date.now();
  ipLimits.set(ip, {
    count: Infinity,
    firstRequest: now,
    lastRequest: now,
    blocked: true,
    blockedUntil: now + duration,
  });
}

/**
 * Desbloquear IP manualmente
 */
export function unblockIP(ip: string): void {
  ipLimits.delete(ip);
}

/**
 * Obter estatísticas de rate limiting
 */
export function getRateLimitStats(): {
  ipLimits: number;
  userLimits: number;
  endpointLimits: number;
  apiKeyLimits: number;
  loginLimits: number;
  trustedIPs: number;
} {
  return {
    ipLimits: ipLimits.size,
    userLimits: userLimits.size,
    endpointLimits: endpointLimits.size,
    apiKeyLimits: apiKeyLimits.size,
    loginLimits: loginLimits.size,
    trustedIPs: trustedIPs.size,
  };
}

/**
 * Limpar entradas expiradas (executar periodicamente)
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  let cleaned = 0;
  
  const cleanup = (store: Map<string, RateLimitEntry>, window: number) => {
    const toDelete: string[] = [];
    store.forEach((entry, key) => {
      if (now - entry.lastRequest > window * 2) {
        toDelete.push(key);
      }
    });
    toDelete.forEach(key => {
      store.delete(key);
      cleaned++;
    });
  };
  
  cleanup(ipLimits, RATE_LIMIT_CONFIG.ip.window);
  cleanup(userLimits, RATE_LIMIT_CONFIG.user.window);
  cleanup(endpointLimits, RATE_LIMIT_CONFIG.endpoint.window);
  cleanup(apiKeyLimits, RATE_LIMIT_CONFIG.apiKey.window);
  cleanup(loginLimits, RATE_LIMIT_CONFIG.login.window);
  
  return cleaned;
}

/**
 * Gerar headers de rate limit para resposta HTTP
 */
export function generateRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
  };
  
  if (!result.allowed) {
    headers['Retry-After'] = (result.retryAfter || 60).toString();
  }
  
  return headers;
}

/**
 * Middleware de rate limiting (para Express)
 */
export function rateLimitMiddleware(options: {
  type: 'ip' | 'user' | 'endpoint' | 'apiKey' | 'login';
  keyExtractor?: (req: any) => string;
} = { type: 'ip' }) {
  return (req: any, res: any, next: any) => {
    let key: string;
    let result: RateLimitResult;
    
    switch (options.type) {
      case 'ip':
        key = req.ip || req.connection?.remoteAddress || 'unknown';
        result = checkIPLimit(key);
        break;
      case 'user':
        key = req.user?.id || 'anonymous';
        result = checkUserLimit(key);
        break;
      case 'endpoint':
        key = req.ip || 'unknown';
        result = checkEndpointLimit(req.path, key);
        break;
      case 'apiKey':
        key = req.headers['x-api-key'] || 'no-key';
        result = checkAPIKeyLimit(key);
        break;
      case 'login':
        key = req.ip || 'unknown';
        result = checkLoginLimit(key);
        break;
      default:
        key = options.keyExtractor?.(req) || req.ip || 'unknown';
        result = checkIPLimit(key);
    }
    
    // Adicionar headers
    const headers = generateRateLimitHeaders(result);
    Object.entries(headers).forEach(([name, value]) => {
      res.setHeader(name, value);
    });
    
    if (!result.allowed) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: result.retryAfter,
      });
      return;
    }
    
    next();
  };
}

// Iniciar limpeza periódica
setInterval(() => {
  cleanupExpiredEntries();
}, 5 * 60 * 1000); // A cada 5 minutos

export const rateLimitConfig = RATE_LIMIT_CONFIG;
