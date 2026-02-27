/**
 * Rate Limiting Middleware
 * SET7.04 - Segurança, Governança e Confiança
 * 
 * Implementa proteção contra flood de requisições
 * com limites diferenciados por tipo de endpoint
 */

import rateLimit, { type Options } from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';

// Store para tracking de requisições em memória
// Em produção, considerar usar Redis para ambientes distribuídos
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Configurações de rate limit por categoria de endpoint
 */
export const RATE_LIMIT_CONFIG = {
  // Endpoints gerais da API
  general: {
    windowMs: 60 * 1000, // 1 minuto
    max: 100, // 100 requisições por minuto
    message: 'Muitas requisições. Por favor, aguarde um momento.',
  },
  
  // Endpoints de autenticação (mais restritivo para prevenir brute force)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 tentativas por 15 minutos
    message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
  },
  
  // Jarvis IA (muito restritivo devido ao custo de tokens)
  jarvis: {
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // 10 mensagens por minuto
    message: 'Limite de mensagens atingido. Aguarde um momento para continuar conversando com o Jarvis.',
  },
  
  // Calculadora (moderado)
  calculator: {
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // 30 cálculos por minuto
    message: 'Muitos cálculos realizados. Aguarde um momento.',
  },
  
  // Formulários e leads (prevenir spam)
  forms: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 submissões por hora
    message: 'Limite de envios atingido. Tente novamente mais tarde.',
  },
  
  // Analytics (muito permissivo)
  analytics: {
    windowMs: 60 * 1000, // 1 minuto
    max: 200, // 200 eventos por minuto
    message: 'Limite de eventos atingido.',
  },

  // Endpoints admin (restritivo — previne abuso, força bruta e enumeração de dados)
  // Achado L1-01 da Colisão SET7: endpoints admin sem rate limiting
  admin: {
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // 10 requisições por minuto por IP
    message: 'Limite de requisições admin atingido. Aguarde 1 minuto antes de tentar novamente.',
  },
};

/**
 * Cria um rate limiter com configuração específica
 */
function createRateLimiter(config: typeof RATE_LIMIT_CONFIG.general) {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: { error: config.message },
    standardHeaders: true, // Retorna headers RateLimit-*
    legacyHeaders: false, // Desabilita headers X-RateLimit-*
    validate: false, // Desabilitar validação de trust proxy
    // Usar keyGenerator padrão (baseado em IP) para evitar problemas com IPv6
    // O user ID será considerado no contexto do tRPC
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000),
      });
    },
  });
}

// Rate limiters pré-configurados
export const generalLimiter = createRateLimiter(RATE_LIMIT_CONFIG.general);
export const authLimiter = createRateLimiter(RATE_LIMIT_CONFIG.auth);
export const jarvisLimiter = createRateLimiter(RATE_LIMIT_CONFIG.jarvis);
export const calculatorLimiter = createRateLimiter(RATE_LIMIT_CONFIG.calculator);
export const formsLimiter = createRateLimiter(RATE_LIMIT_CONFIG.forms);
export const analyticsLimiter = createRateLimiter(RATE_LIMIT_CONFIG.analytics);

/**
 * Rate limiter para endpoints admin
 * Aplica limite de 10 req/min por IP conforme achado L1-01 da Colisão SET7
 */
export const adminLimiter = createRateLimiter(RATE_LIMIT_CONFIG.admin);

/**
 * Middleware que aplica rate limiting baseado no path da requisição
 */
export function dynamicRateLimiter(req: Request, res: Response, next: NextFunction) {
  const path = req.path.toLowerCase();
  
  // Determinar qual limiter usar baseado no path

  // Admin endpoints: mais restritivo (10 req/min) — achado L1-01 da Colisão SET7
  // Detecta tanto /api/trpc/admin.* quanto /api/admin/*
  if (path.includes('admin')) {
    return adminLimiter(req, res, next);
  }

  if (path.includes('/auth') || path.includes('/oauth')) {
    return authLimiter(req, res, next);
  }
  
  if (path.includes('/jarvis')) {
    return jarvisLimiter(req, res, next);
  }
  
  if (path.includes('/calculator') || path.includes('/calculate')) {
    return calculatorLimiter(req, res, next);
  }
  
  if (path.includes('/lead') || path.includes('/contact') || path.includes('/form')) {
    return formsLimiter(req, res, next);
  }
  
  if (path.includes('/analytics') || path.includes('/track')) {
    return analyticsLimiter(req, res, next);
  }
  
  // Default: limiter geral
  return generalLimiter(req, res, next);
}

/**
 * Middleware para adicionar headers informativos de rate limit
 */
export function rateLimitHeaders(req: Request, res: Response, next: NextFunction) {
  // Adicionar header customizado indicando que rate limiting está ativo
  res.setHeader('X-RateLimit-Policy', 'active');
  next();
}

/**
 * Função para verificar status do rate limit de um usuário
 * Útil para exibir informações no frontend
 */
export function getRateLimitStatus(key: string, config: typeof RATE_LIMIT_CONFIG.general) {
  const data = requestCounts.get(key);
  const now = Date.now();
  
  if (!data || now > data.resetTime) {
    return {
      remaining: config.max,
      total: config.max,
      resetIn: config.windowMs,
      isLimited: false,
    };
  }
  
  const remaining = Math.max(0, config.max - data.count);
  return {
    remaining,
    total: config.max,
    resetIn: data.resetTime - now,
    isLimited: remaining === 0,
  };
}

/**
 * Limpar entradas expiradas do cache (executar periodicamente)
 */
export function cleanupExpiredEntries() {
  const now = Date.now();
  const entries = Array.from(requestCounts.entries());
  for (const [key, data] of entries) {
    if (now > data.resetTime) {
      requestCounts.delete(key);
    }
  }
}

// Limpar cache a cada 5 minutos
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
