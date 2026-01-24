/**
 * Rate Limiter específico para OAuth Clients
 * Permite configuração granular de limites por client
 */

import { notifyOwner } from "../../_core/notification";

interface RateLimitConfig {
  requestsPerHour: number;
  requestsPerMinute: number;
  burstLimit: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
  minuteCount: number;
  minuteStart: number;
  burstCount: number;
  burstStart: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Configurações padrão por tipo de client
const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  free: {
    requestsPerHour: 100,
    requestsPerMinute: 10,
    burstLimit: 5,
  },
  basic: {
    requestsPerHour: 1000,
    requestsPerMinute: 50,
    burstLimit: 20,
  },
  pro: {
    requestsPerHour: 10000,
    requestsPerMinute: 200,
    burstLimit: 50,
  },
  enterprise: {
    requestsPerHour: 100000,
    requestsPerMinute: 1000,
    burstLimit: 200,
  },
};

// Armazenamento em memória (em produção, usar Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();
const clientConfigs = new Map<string, RateLimitConfig>();
const alertsSent = new Map<string, number>();

// Constantes de tempo
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const BURST_WINDOW_MS = 1000; // 1 segundo
const ALERT_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutos

/**
 * Configura limites personalizados para um OAuth client
 */
export function setClientRateLimit(
  clientId: string,
  config: Partial<RateLimitConfig>
): void {
  const baseConfig = DEFAULT_CONFIGS.basic;
  clientConfigs.set(clientId, {
    ...baseConfig,
    ...config,
  });
}

/**
 * Obtém configuração de rate limit para um client
 */
export function getClientRateLimit(clientId: string): RateLimitConfig {
  return clientConfigs.get(clientId) || DEFAULT_CONFIGS.basic;
}

/**
 * Remove configuração personalizada de um client
 */
export function removeClientRateLimit(clientId: string): void {
  clientConfigs.delete(clientId);
}

/**
 * Verifica e atualiza rate limit para um OAuth client
 */
export function checkOAuthRateLimit(
  clientId: string,
  endpoint?: string
): RateLimitResult {
  const config = getClientRateLimit(clientId);
  const now = Date.now();
  const key = endpoint ? `${clientId}:${endpoint}` : clientId;
  
  // Obter ou criar entrada
  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = {
      count: 0,
      windowStart: now,
      minuteCount: 0,
      minuteStart: now,
      burstCount: 0,
      burstStart: now,
    };
    rateLimitStore.set(key, entry);
  }
  
  // Reset janela horária se expirou
  if (now - entry.windowStart >= HOUR_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }
  
  // Reset janela de minuto se expirou
  if (now - entry.minuteStart >= MINUTE_MS) {
    entry.minuteCount = 0;
    entry.minuteStart = now;
  }
  
  // Reset janela de burst se expirou
  if (now - entry.burstStart >= BURST_WINDOW_MS) {
    entry.burstCount = 0;
    entry.burstStart = now;
  }
  
  // Verificar limites
  const hourlyRemaining = config.requestsPerHour - entry.count;
  const minuteRemaining = config.requestsPerMinute - entry.minuteCount;
  const burstRemaining = config.burstLimit - entry.burstCount;
  
  // Calcular reset time
  const hourReset = Math.ceil((entry.windowStart + HOUR_MS - now) / 1000);
  const minuteReset = Math.ceil((entry.minuteStart + MINUTE_MS - now) / 1000);
  const burstReset = Math.ceil((entry.burstStart + BURST_WINDOW_MS - now) / 1000);
  
  // Verificar se algum limite foi excedido
  if (burstRemaining <= 0) {
    sendRateLimitAlert(clientId, "burst", config.burstLimit);
    return {
      allowed: false,
      limit: config.burstLimit,
      remaining: 0,
      reset: burstReset,
      retryAfter: burstReset,
    };
  }
  
  if (minuteRemaining <= 0) {
    sendRateLimitAlert(clientId, "minute", config.requestsPerMinute);
    return {
      allowed: false,
      limit: config.requestsPerMinute,
      remaining: 0,
      reset: minuteReset,
      retryAfter: minuteReset,
    };
  }
  
  if (hourlyRemaining <= 0) {
    sendRateLimitAlert(clientId, "hour", config.requestsPerHour);
    return {
      allowed: false,
      limit: config.requestsPerHour,
      remaining: 0,
      reset: hourReset,
      retryAfter: hourReset,
    };
  }
  
  // Incrementar contadores
  entry.count++;
  entry.minuteCount++;
  entry.burstCount++;
  
  // Alertar se próximo do limite (80%)
  if (entry.count === Math.floor(config.requestsPerHour * 0.8)) {
    sendRateLimitWarning(clientId, entry.count, config.requestsPerHour);
  }
  
  return {
    allowed: true,
    limit: config.requestsPerHour,
    remaining: hourlyRemaining - 1,
    reset: hourReset,
  };
}

/**
 * Obtém uso atual de rate limit para um client
 */
export function getClientUsage(clientId: string): {
  hourly: { used: number; limit: number; remaining: number; resetIn: number };
  minute: { used: number; limit: number; remaining: number; resetIn: number };
  burst: { used: number; limit: number; remaining: number; resetIn: number };
} {
  const config = getClientRateLimit(clientId);
  const entry = rateLimitStore.get(clientId);
  const now = Date.now();
  
  if (!entry) {
    return {
      hourly: { used: 0, limit: config.requestsPerHour, remaining: config.requestsPerHour, resetIn: 3600 },
      minute: { used: 0, limit: config.requestsPerMinute, remaining: config.requestsPerMinute, resetIn: 60 },
      burst: { used: 0, limit: config.burstLimit, remaining: config.burstLimit, resetIn: 1 },
    };
  }
  
  // Verificar se janelas expiraram
  const hourlyUsed = (now - entry.windowStart >= HOUR_MS) ? 0 : entry.count;
  const minuteUsed = (now - entry.minuteStart >= MINUTE_MS) ? 0 : entry.minuteCount;
  const burstUsed = (now - entry.burstStart >= BURST_WINDOW_MS) ? 0 : entry.burstCount;
  
  return {
    hourly: {
      used: hourlyUsed,
      limit: config.requestsPerHour,
      remaining: Math.max(0, config.requestsPerHour - hourlyUsed),
      resetIn: Math.max(0, Math.ceil((entry.windowStart + HOUR_MS - now) / 1000)),
    },
    minute: {
      used: minuteUsed,
      limit: config.requestsPerMinute,
      remaining: Math.max(0, config.requestsPerMinute - minuteUsed),
      resetIn: Math.max(0, Math.ceil((entry.minuteStart + MINUTE_MS - now) / 1000)),
    },
    burst: {
      used: burstUsed,
      limit: config.burstLimit,
      remaining: Math.max(0, config.burstLimit - burstUsed),
      resetIn: Math.max(0, Math.ceil((entry.burstStart + BURST_WINDOW_MS - now) / 1000)),
    },
  };
}

/**
 * Gera headers de rate limit para resposta HTTP
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": (Math.floor(Date.now() / 1000) + result.reset).toString(),
  };
  
  if (result.retryAfter) {
    headers["Retry-After"] = result.retryAfter.toString();
  }
  
  return headers;
}

/**
 * Envia alerta quando rate limit é excedido
 */
async function sendRateLimitAlert(
  clientId: string,
  limitType: string,
  limit: number
): Promise<void> {
  const alertKey = `${clientId}:${limitType}`;
  const lastAlert = alertsSent.get(alertKey) || 0;
  const now = Date.now();
  
  // Evitar spam de alertas
  if (now - lastAlert < ALERT_COOLDOWN_MS) {
    return;
  }
  
  alertsSent.set(alertKey, now);
  
  try {
    await notifyOwner({
      title: `⚠️ Rate Limit Excedido - OAuth Client`,
      content: `
O OAuth client ${clientId} excedeu o limite de ${limitType}:
- Limite: ${limit} requisições
- Tipo: ${limitType === "hour" ? "por hora" : limitType === "minute" ? "por minuto" : "burst"}
- Horário: ${new Date().toISOString()}

Considere ajustar os limites ou entrar em contato com o desenvolvedor.
      `.trim(),
    });
  } catch (error) {
    console.error("[OAuthRateLimiter] Falha ao enviar alerta:", error);
  }
}

/**
 * Envia aviso quando próximo do limite
 */
async function sendRateLimitWarning(
  clientId: string,
  current: number,
  limit: number
): Promise<void> {
  const alertKey = `${clientId}:warning`;
  const lastAlert = alertsSent.get(alertKey) || 0;
  const now = Date.now();
  
  if (now - lastAlert < ALERT_COOLDOWN_MS) {
    return;
  }
  
  alertsSent.set(alertKey, now);
  
  try {
    await notifyOwner({
      title: `⚡ Rate Limit Warning - OAuth Client`,
      content: `
O OAuth client ${clientId} está próximo do limite:
- Uso atual: ${current}/${limit} (${Math.round(current / limit * 100)}%)
- Horário: ${new Date().toISOString()}
      `.trim(),
    });
  } catch (error) {
    console.error("[OAuthRateLimiter] Falha ao enviar warning:", error);
  }
}

/**
 * Limpa dados de rate limit para um client
 */
export function clearClientRateLimit(clientId: string): void {
  // Limpar todas as entradas relacionadas ao client
  const keysToDelete: string[] = [];
  Array.from(rateLimitStore.keys()).forEach(key => {
    if (key === clientId || key.startsWith(`${clientId}:`)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

/**
 * Obtém estatísticas globais de rate limiting
 */
export function getRateLimitStats(): {
  totalClients: number;
  totalRequests: number;
  clientsNearLimit: number;
  clientsOverLimit: number;
} {
  let totalRequests = 0;
  let clientsNearLimit = 0;
  let clientsOverLimit = 0;
  const uniqueClients = new Set<string>();
  
  Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
    const clientId = key.split(":")[0];
    uniqueClients.add(clientId);
    
    const config = getClientRateLimit(clientId);
    totalRequests += entry.count;
    
    const usage = entry.count / config.requestsPerHour;
    if (usage >= 1) {
      clientsOverLimit++;
    } else if (usage >= 0.8) {
      clientsNearLimit++;
    }
  });
  
  return {
    totalClients: uniqueClients.size,
    totalRequests,
    clientsNearLimit,
    clientsOverLimit,
  };
}

// Limpeza periódica de entradas expiradas
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
    // Remover entradas com mais de 2 horas sem uso
    if (now - entry.windowStart > 2 * HOUR_MS) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
  
  // Limpar alertas antigos
  Array.from(alertsSent.entries()).forEach(([key, timestamp]) => {
    if (now - timestamp > ALERT_COOLDOWN_MS * 2) {
      alertsSent.delete(key);
    }
  });
}, 30 * 60 * 1000); // A cada 30 minutos
