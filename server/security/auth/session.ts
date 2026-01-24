/**
 * Session Management Module
 * Camada 1: Autenticação e Autorização
 * 
 * Implementa gerenciamento de sessão com timeout e detecção de anomalias
 */

import * as crypto from 'crypto';

// Configurações de sessão
const SESSION_CONFIG = {
  timeout: 30 * 60 * 1000, // 30 minutos em ms
  maxConcurrentSessions: 5,
  loginRateLimit: {
    attempts: 5,
    window: 15 * 60 * 1000, // 15 minutos
    blockDuration: 60 * 60 * 1000, // 1 hora
  },
  anomalyDetection: {
    maxDistanceKm: 500, // Distância máxima em km entre logins
    minTimeBetweenLocations: 60 * 60 * 1000, // 1 hora mínimo para "viajar"
  },
};

// Interface para sessão
interface Session {
  id: string;
  userId: string;
  ip: string;
  userAgent: string;
  location?: GeoLocation;
  deviceFingerprint: string;
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
}

// Interface para localização geográfica
interface GeoLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

// Interface para tentativa de login
interface LoginAttempt {
  ip: string;
  timestamp: number;
  success: boolean;
  userId?: string;
}

// Interface para resultado de verificação de anomalia
interface AnomalyCheckResult {
  isAnomaly: boolean;
  reason?: string;
  riskScore: number; // 0-100
}

// Armazenamento em memória (em produção, usar Redis)
const sessions = new Map<string, Session>();
const loginAttempts = new Map<string, LoginAttempt[]>();
const blockedIPs = new Map<string, number>(); // IP -> unblock timestamp

/**
 * Gerar ID de sessão seguro
 */
function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Gerar fingerprint de dispositivo
 */
export function generateDeviceFingerprint(userAgent: string, ip: string, acceptLanguage?: string): string {
  const data = `${userAgent}|${ip}|${acceptLanguage || ''}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Criar nova sessão
 */
export function createSession(
  userId: string,
  ip: string,
  userAgent: string,
  location?: GeoLocation
): Session {
  const now = Date.now();
  const session: Session = {
    id: generateSessionId(),
    userId,
    ip,
    userAgent,
    location,
    deviceFingerprint: generateDeviceFingerprint(userAgent, ip),
    createdAt: now,
    lastActivity: now,
    expiresAt: now + SESSION_CONFIG.timeout,
  };
  
  sessions.set(session.id, session);
  
  // Limpar sessões antigas do usuário se exceder limite
  cleanupUserSessions(userId);
  
  return session;
}

/**
 * Obter sessão por ID
 */
export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  
  if (!session) return null;
  
  // Verificar se expirou
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session;
}

/**
 * Atualizar atividade da sessão
 */
export function touchSession(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  
  if (!session) return false;
  
  const now = Date.now();
  
  // Verificar timeout por inatividade
  if (now - session.lastActivity > SESSION_CONFIG.timeout) {
    sessions.delete(sessionId);
    return false;
  }
  
  session.lastActivity = now;
  session.expiresAt = now + SESSION_CONFIG.timeout;
  
  return true;
}

/**
 * Invalidar sessão
 */
export function invalidateSession(sessionId: string): void {
  sessions.delete(sessionId);
}

/**
 * Invalidar todas as sessões de um usuário (logout de todos dispositivos)
 */
export function invalidateAllUserSessions(userId: string): number {
  let count = 0;
  const toDelete: string[] = [];
  
  sessions.forEach((session, id) => {
    if (session.userId === userId) {
      toDelete.push(id);
    }
  });
  
  toDelete.forEach(id => {
    sessions.delete(id);
    count++;
  });
  
  return count;
}

/**
 * Limpar sessões antigas do usuário
 */
function cleanupUserSessions(userId: string): void {
  const userSessions: Session[] = [];
  
  sessions.forEach((session) => {
    if (session.userId === userId) {
      userSessions.push(session);
    }
  });
  
  // Ordenar por última atividade (mais recente primeiro)
  userSessions.sort((a, b) => b.lastActivity - a.lastActivity);
  
  // Remover sessões excedentes
  if (userSessions.length > SESSION_CONFIG.maxConcurrentSessions) {
    const toRemove = userSessions.slice(SESSION_CONFIG.maxConcurrentSessions);
    for (const session of toRemove) {
      sessions.delete(session.id);
    }
  }
}

/**
 * Registrar tentativa de login
 */
export function recordLoginAttempt(ip: string, success: boolean, userId?: string): void {
  const attempt: LoginAttempt = {
    ip,
    timestamp: Date.now(),
    success,
    userId,
  };
  
  const attempts = loginAttempts.get(ip) || [];
  attempts.push(attempt);
  
  // Manter apenas tentativas dentro da janela
  const windowStart = Date.now() - SESSION_CONFIG.loginRateLimit.window;
  const recentAttempts = attempts.filter(a => a.timestamp > windowStart);
  
  loginAttempts.set(ip, recentAttempts);
}

/**
 * Verificar se IP está bloqueado
 */
export function isIPBlocked(ip: string): boolean {
  const unblockTime = blockedIPs.get(ip);
  
  if (!unblockTime) return false;
  
  if (Date.now() > unblockTime) {
    blockedIPs.delete(ip);
    return false;
  }
  
  return true;
}

/**
 * Verificar rate limit de login
 */
export function checkLoginRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; blockedUntil?: number } {
  // Verificar se já está bloqueado
  if (isIPBlocked(ip)) {
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: blockedIPs.get(ip),
    };
  }
  
  const attempts = loginAttempts.get(ip) || [];
  const windowStart = Date.now() - SESSION_CONFIG.loginRateLimit.window;
  const recentFailedAttempts = attempts.filter(
    a => a.timestamp > windowStart && !a.success
  );
  
  const remaining = SESSION_CONFIG.loginRateLimit.attempts - recentFailedAttempts.length;
  
  if (remaining <= 0) {
    // Bloquear IP
    const blockedUntil = Date.now() + SESSION_CONFIG.loginRateLimit.blockDuration;
    blockedIPs.set(ip, blockedUntil);
    
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil,
    };
  }
  
  return {
    allowed: true,
    remainingAttempts: remaining,
  };
}

/**
 * Calcular distância entre duas coordenadas (Haversine formula)
 */
function calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.latitude)) * Math.cos(toRad(loc2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Detectar anomalia de login
 */
export function detectLoginAnomaly(
  userId: string,
  newIp: string,
  newLocation?: GeoLocation,
  newDeviceFingerprint?: string
): AnomalyCheckResult {
  let riskScore = 0;
  const reasons: string[] = [];
  
  // Buscar sessões anteriores do usuário
  const userSessions: Session[] = [];
  sessions.forEach((session) => {
    if (session.userId === userId) {
      userSessions.push(session);
    }
  });
  
  if (userSessions.length === 0) {   // Primeiro login, sem histórico para comparar
    return { isAnomaly: false, riskScore: 10 };
  }
  
  // Ordenar por última atividade
  userSessions.sort((a, b) => b.lastActivity - a.lastActivity);
  const lastSession = userSessions[0];
  
  // Verificar mudança de IP
  if (lastSession.ip !== newIp) {
    riskScore += 20;
    reasons.push('IP diferente do último login');
  }
  
  // Verificar mudança de dispositivo
  if (newDeviceFingerprint && lastSession.deviceFingerprint !== newDeviceFingerprint) {
    riskScore += 30;
    reasons.push('Dispositivo diferente');
  }
  
  // Verificar viagem impossível
  if (newLocation && lastSession.location) {
    const distance = calculateDistance(lastSession.location, newLocation);
    const timeDiff = Date.now() - lastSession.lastActivity;
    
    if (distance > SESSION_CONFIG.anomalyDetection.maxDistanceKm) {
      const minTimeRequired = (distance / 900) * 60 * 60 * 1000; // 900 km/h (avião)
      
      if (timeDiff < minTimeRequired) {
        riskScore += 50;
        reasons.push(`Viagem impossível: ${Math.round(distance)}km em ${Math.round(timeDiff / 60000)} minutos`);
      }
    }
  }
  
  const isAnomaly = riskScore >= 50;
  
  return {
    isAnomaly,
    reason: reasons.join('; '),
    riskScore: Math.min(riskScore, 100),
  };
}

/**
 * Obter todas as sessões ativas de um usuário
 */
export function getUserActiveSessions(userId: string): Session[] {
  const userSessions: Session[] = [];
  const now = Date.now();
  
  sessions.forEach((session) => {
    if (session.userId === userId && session.expiresAt > now) {
      userSessions.push(session);
    }
  });
  
  return userSessions.sort((a, b) => b.lastActivity - a.lastActivity);
}

/**
 * Limpar sessões expiradas (executar periodicamente)
 */
export function cleanupExpiredSessions(): number {
  const now = Date.now();
  let count = 0;
  
  const toDelete: string[] = [];
  sessions.forEach((session, id) => {
    if (session.expiresAt < now) {
      toDelete.push(id);
    }
  });
  toDelete.forEach(id => {
    sessions.delete(id);
    count++;
  });
  
  return count;
}

export const sessionConfig = SESSION_CONFIG;
