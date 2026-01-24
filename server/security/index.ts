/**
 * Security Module Index
 * Implementação das 12 Camadas de Segurança Enterprise (MYFIPE)
 * 
 * Este módulo exporta todos os componentes de segurança da plataforma IMPACT7
 */

// Camada 1: Autenticação e Autorização
export * from './auth/jwt';
export * from './auth/totp';
export {
  createSession,
  getSession,
  touchSession,
  invalidateSession,
  invalidateAllUserSessions,
  recordLoginAttempt,
  isIPBlocked,
  checkLoginRateLimit,
  detectLoginAnomaly,
  getUserActiveSessions,
  cleanupExpiredSessions,
  sessionConfig,
  generateDeviceFingerprint as generateSessionDeviceFingerprint,
} from './auth/session';

// Camada 2-3: Proteção de Dados
export {
  encrypt,
  decrypt,
  encryptWithPassword,
  decryptWithPassword,
  encryptField,
  decryptField,
  encryptObject,
  decryptObject,
  generateKey,
  exportKey,
  importKey,
  rotateKey,
  aesConfig,
  verifyIntegrity as verifyAesIntegrity,
} from './encryption/aes';
export * from './encryption/hash';

// Camada 4-5: Proteção contra Injeção e Ataques Web
export * from './validation/input';
export * from './validation/sanitization';

// Camada 6: Rate Limiting e DDoS Protection
export * from './api/rate-limiter';

// Camada 8: Auditoria e Logging
export * from './audit/logger';

// Camada 9: Detecção de Fraude
export {
  analyzeTransactionRisk,
  analyzeLoginRisk,
  getUserRiskProfile,
  resetUserProfile,
  getFraudStats,
  fraudConfig,
  generateDeviceFingerprint as generateFraudDeviceFingerprint,
} from './fraud/risk-scoring';

// Camada 12: Compliance LGPD/GDPR
export * from './audit/compliance';

/**
 * Configuração centralizada de segurança
 */
export const securityConfig = {
  // JWT
  jwt: {
    algorithm: 'RS256',
    accessTokenExpiry: 15 * 60, // 15 minutos
    refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 dias
  },
  
  // 2FA
  totp: {
    digits: 6,
    period: 30,
    backupCodes: 10,
  },
  
  // Sessão
  session: {
    timeout: 30 * 60 * 1000, // 30 minutos
    maxConcurrent: 5,
  },
  
  // Rate Limiting
  rateLimit: {
    ipRequestsPerHour: 1000,
    userRequestsPerHour: 5000,
    loginAttemptsPerWindow: 5,
    loginWindowMinutes: 15,
    blockDurationHours: 1,
  },
  
  // Criptografia
  encryption: {
    algorithm: 'aes-256-gcm',
    hashCostFactor: 12,
    pbkdf2Iterations: 100000,
  },
  
  // Fraude
  fraud: {
    lowRiskThreshold: 30,
    mediumRiskThreshold: 60,
    highRiskThreshold: 80,
  },
  
  // Compliance
  compliance: {
    dataRetentionYears: 3,
    transactionRetentionYears: 5,
    auditLogRetentionDays: 365,
  },
};

/**
 * Inicializar módulos de segurança
 */
export function initializeSecurity(): void {
  console.log('[Security] Initializing security modules...');
  
  // Configurar limpeza periódica
  setInterval(() => {
    // Limpar sessões expiradas
    const { cleanupExpiredSessions } = require('./auth/session');
    cleanupExpiredSessions();
    
    // Limpar entradas de rate limit expiradas
    const { cleanupExpiredEntries } = require('./api/rate-limiter');
    cleanupExpiredEntries();
  }, 5 * 60 * 1000); // A cada 5 minutos
  
  console.log('[Security] Security modules initialized');
}

/**
 * Verificar status de segurança
 */
export function getSecurityStatus(): {
  modules: Record<string, boolean>;
  compliance: { compliant: boolean; issues: string[] };
  stats: Record<string, any>;
} {
  const { checkCompliance } = require('./audit/compliance');
  const { getAuditStats } = require('./audit/logger');
  const { getRateLimitStats } = require('./api/rate-limiter');
  const { getFraudStats } = require('./fraud/risk-scoring');
  
  return {
    modules: {
      jwt: true,
      totp: true,
      session: true,
      encryption: true,
      validation: true,
      rateLimiting: true,
      auditLogging: true,
      fraudDetection: true,
      compliance: true,
    },
    compliance: checkCompliance(),
    stats: {
      audit: getAuditStats(),
      rateLimit: getRateLimitStats(),
      fraud: getFraudStats(),
    },
  };
}
