/**
 * Security Module Tests
 * Testes unitários para as 12 camadas de segurança MYFIPE
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Camada 1: Autenticação
import {
  createAccessToken,
  createRefreshToken,
  verifyToken,
  rotateRefreshToken,
  isTokenExpiringSoon,
} from '../auth/jwt';

import {
  generateTOTPSecret,
  verifyTOTP,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
  setup2FA,
  getCurrentTOTP,
} from '../auth/totp';

import {
  createSession,
  getSession,
  touchSession,
  invalidateSession,
  checkLoginRateLimit,
  detectLoginAnomaly,
} from '../auth/session';

// Camada 2-3: Criptografia
import {
  encrypt,
  decrypt,
  encryptField,
  decryptField,
  encryptWithPassword,
  decryptWithPassword,
} from '../encryption/aes';

import {
  hashPassword,
  verifyPassword,
  hashPBKDF2,
  verifyPBKDF2,
  sha256,
  checkPasswordStrength,
} from '../encryption/hash';

// Camada 4-5: Validação e Sanitização
import {
  validateEmail,
  validateCPF,
  validateCNPJ,
  validatePhone,
  validateURL,
  validateCreditCard,
} from '../validation/input';

import {
  escapeHtml,
  sanitizeHtml,
  sanitizeJs,
  sanitizeFilename,
  sanitizeUserInput,
} from '../validation/sanitization';

// Camada 6: Rate Limiting
import {
  checkIPLimit,
  checkUserLimit,
  checkLoginLimit,
  blockIP,
  unblockIP,
} from '../api/rate-limiter';

// Camada 8: Auditoria
import {
  createAuditLog,
  searchAuditLogs,
  verifyAuditChainIntegrity,
  logLogin,
  logLoginFailed,
} from '../audit/logger';

// Camada 9: Detecção de Fraude
import {
  analyzeTransactionRisk,
  analyzeLoginRisk,
  generateDeviceFingerprint,
} from '../fraud/risk-scoring';

// Camada 12: Compliance
import {
  recordConsent,
  hasActiveConsent,
  revokeConsent,
  createDSAR,
  generateDataAccessReport,
  checkCompliance,
} from '../audit/compliance';

describe('Camada 1: Autenticação e Autorização', () => {
  describe('JWT RS256', () => {
    it('deve criar access token válido', () => {
      const token = createAccessToken('user123', 'test@example.com', 'user');
      expect(token).toBeDefined();
      expect(token.split('.').length).toBe(3);
    });

    it('deve verificar token válido', () => {
      const token = createAccessToken('user123', 'test@example.com', 'user');
      const result = verifyToken(token);
      
      expect(result.valid).toBe(true);
      expect(result.payload?.sub).toBe('user123');
      expect(result.payload?.email).toBe('test@example.com');
    });

    it('deve rejeitar token inválido', () => {
      const result = verifyToken('invalid.token.here');
      expect(result.valid).toBe(false);
    });

    it('deve criar e rotacionar refresh token', () => {
      const refreshToken = createRefreshToken('user123', 'test@example.com', 'user');
      const rotated = rotateRefreshToken(refreshToken);
      
      expect(rotated).not.toBeNull();
      expect(rotated?.accessToken).toBeDefined();
      expect(rotated?.refreshToken).toBeDefined();
    });
  });

  describe('2FA TOTP', () => {
    it('deve gerar secret TOTP válido', () => {
      const secret = generateTOTPSecret();
      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThan(16);
    });

    it('deve verificar código TOTP correto', () => {
      const secret = generateTOTPSecret();
      const code = getCurrentTOTP(secret);
      
      expect(verifyTOTP(secret, code)).toBe(true);
    });

    it('deve rejeitar código TOTP incorreto', () => {
      const secret = generateTOTPSecret();
      expect(verifyTOTP(secret, '000000')).toBe(false);
    });

    it('deve gerar e verificar backup codes', () => {
      const codes = generateBackupCodes();
      expect(codes.length).toBe(10);
      
      const hashed = hashBackupCode(codes[0]);
      expect(verifyBackupCode(codes[0], hashed)).toBe(true);
      expect(verifyBackupCode('wrongcode', hashed)).toBe(false);
    });

    it('deve fazer setup completo de 2FA', () => {
      const setup = setup2FA('test@example.com');
      
      expect(setup.secret).toBeDefined();
      expect(setup.otpauthUrl).toContain('otpauth://totp/');
      expect(setup.backupCodes.length).toBe(10);
    });
  });

  describe('Gerenciamento de Sessão', () => {
    it('deve criar sessão válida', () => {
      const session = createSession('user123', '192.168.1.1', 'Mozilla/5.0');
      
      expect(session.id).toBeDefined();
      expect(session.userId).toBe('user123');
      expect(session.ip).toBe('192.168.1.1');
    });

    it('deve obter sessão existente', () => {
      const session = createSession('user456', '192.168.1.2', 'Chrome');
      const retrieved = getSession(session.id);
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.userId).toBe('user456');
    });

    it('deve atualizar atividade da sessão', () => {
      const session = createSession('user789', '192.168.1.3', 'Firefox');
      const touched = touchSession(session.id);
      
      expect(touched).toBe(true);
    });

    it('deve invalidar sessão', () => {
      const session = createSession('user101', '192.168.1.4', 'Safari');
      invalidateSession(session.id);
      
      expect(getSession(session.id)).toBeNull();
    });
  });
});

describe('Camada 2-3: Proteção de Dados', () => {
  describe('Criptografia AES-256-GCM', () => {
    it('deve criptografar e descriptografar dados', () => {
      const plaintext = 'Dados sensíveis para teste';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('deve criptografar campos individuais', () => {
      const cpf = '123.456.789-00';
      const encrypted = encryptField(cpf);
      const decrypted = decryptField(encrypted);
      
      expect(decrypted).toBe(cpf);
    });

    it('deve criptografar com senha', () => {
      const data = 'Dados protegidos por senha';
      const password = 'minha-senha-forte';
      
      const encrypted = encryptWithPassword(data, password);
      const decrypted = decryptWithPassword(encrypted, password);
      
      expect(decrypted).toBe(data);
    });
  });

  describe('Hash de Senhas', () => {
    it('deve fazer hash de senha com bcrypt', async () => {
      const password = 'MinhaSenh@123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });

    it('deve verificar senha correta', async () => {
      const password = 'MinhaSenh@456';
      const hash = await hashPassword(password);
      
      expect(await verifyPassword(password, hash)).toBe(true);
    });

    it('deve rejeitar senha incorreta', async () => {
      const password = 'MinhaSenh@789';
      const hash = await hashPassword(password);
      
      expect(await verifyPassword('senhaerrada', hash)).toBe(false);
    });

    it('deve verificar força da senha', () => {
      const weak = checkPasswordStrength('123456');
      const strong = checkPasswordStrength('MinhaSenh@Forte123!');
      
      expect(weak.isStrong).toBe(false);
      expect(strong.isStrong).toBe(true);
      expect(strong.score).toBeGreaterThan(60);
    });
  });
});

describe('Camada 4-5: Validação e Sanitização', () => {
  describe('Validação de Entrada', () => {
    it('deve validar email correto', () => {
      const result = validateEmail('teste@exemplo.com.br');
      expect(result.valid).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      const result = validateEmail('email-invalido');
      expect(result.valid).toBe(false);
    });

    it('deve validar CPF correto', () => {
      const result = validateCPF('529.982.247-25');
      expect(result.valid).toBe(true);
    });

    it('deve rejeitar CPF inválido', () => {
      const result = validateCPF('111.111.111-11');
      expect(result.valid).toBe(false);
    });

    it('deve validar CNPJ correto', () => {
      const result = validateCNPJ('11.222.333/0001-81');
      expect(result.valid).toBe(true);
    });

    it('deve validar telefone E.164', () => {
      const result = validatePhone('+5511999999999');
      expect(result.valid).toBe(true);
    });

    it('deve validar URL segura', () => {
      const result = validateURL('https://example.com/path');
      expect(result.valid).toBe(true);
    });

    it('deve rejeitar URL com protocolo perigoso', () => {
      const result = validateURL('javascript:alert(1)');
      expect(result.valid).toBe(false);
    });

    it('deve validar cartão de crédito (Luhn)', () => {
      const result = validateCreditCard('4111111111111111');
      expect(result.valid).toBe(true);
    });
  });

  describe('Sanitização', () => {
    it('deve escapar HTML', () => {
      const input = '<script>alert("xss")</script>';
      const escaped = escapeHtml(input);
      
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });

    it('deve sanitizar HTML removendo scripts', () => {
      const input = '<p>Texto</p><script>malicious()</script>';
      const sanitized = sanitizeHtml(input);
      
      expect(sanitized).toContain('<p>Texto</p>');
      expect(sanitized).not.toContain('script');
    });

    it('deve sanitizar para JavaScript', () => {
      const input = "'; DROP TABLE users; --";
      const sanitized = sanitizeJs(input);
      
      // sanitizeJs escapa aspas simples com backslash
      expect(sanitized).toContain("\\'");
      expect(sanitized).not.toBe(input);
    });

    it('deve sanitizar nome de arquivo', () => {
      const input = '../../../etc/passwd';
      const sanitized = sanitizeFilename(input);
      
      expect(sanitized).not.toContain('..');
      expect(sanitized).not.toContain('/');
    });

    it('deve sanitizar input de usuário completamente', () => {
      const input = '<script>alert(1)</script>  texto  normal  ';
      const sanitized = sanitizeUserInput(input);
      
      expect(sanitized).not.toContain('<');
      // escapeHtml também escapa /
      expect(sanitized).toContain('&lt;script&gt;');
      expect(sanitized).toContain('texto normal');
    });
  });
});

describe('Camada 6: Rate Limiting', () => {
  it('deve permitir requisições dentro do limite', () => {
    const result = checkIPLimit('10.0.0.1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it('deve bloquear IP manualmente', () => {
    blockIP('10.0.0.99', 60000);
    const result = checkIPLimit('10.0.0.99');
    
    expect(result.allowed).toBe(false);
    
    unblockIP('10.0.0.99');
  });

  it('deve verificar rate limit de login', () => {
    const result = checkLoginLimit('10.0.0.2');
    expect(result.allowed).toBe(true);
  });
});

describe('Camada 8: Auditoria', () => {
  it('deve criar log de auditoria', () => {
    const log = createAuditLog({
      eventType: 'auth.login',
      userId: 'user123',
      action: 'User logged in',
      success: true,
    });
    
    expect(log.id).toBeDefined();
    expect(log.hash).toBeDefined();
    expect(log.eventType).toBe('auth.login');
  });

  it('deve mascarar dados sensíveis', () => {
    const log = createAuditLog({
      eventType: 'user.updated',
      userId: 'user123',
      action: 'Password changed',
      details: { password: 'secret123', email: 'test@test.com' },
      success: true,
    });
    
    expect(log.details?.password).toBe('***MASKED***');
    expect(log.details?.email).toBe('test@test.com');
  });

  it('deve verificar integridade da cadeia de logs', () => {
    logLogin('user1', 'user1@test.com', '1.1.1.1', 'Chrome');
    logLogin('user2', 'user2@test.com', '2.2.2.2', 'Firefox');
    
    const integrity = verifyAuditChainIntegrity();
    expect(integrity.valid).toBe(true);
  });

  it('deve buscar logs por filtro', () => {
    logLoginFailed('hacker@test.com', '3.3.3.3', 'Bot', 'Invalid password');
    
    const results = searchAuditLogs({
      eventTypes: ['auth.login_failed'],
    });
    
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('Camada 9: Detecção de Fraude', () => {
  it('deve gerar device fingerprint', () => {
    const fingerprint = generateDeviceFingerprint(
      'Mozilla/5.0 Chrome',
      '1920x1080',
      'America/Sao_Paulo'
    );
    
    expect(fingerprint).toBeDefined();
    expect(fingerprint.length).toBe(32);
  });

  it('deve analisar risco de transação', () => {
    const result = analyzeTransactionRisk({
      id: 'tx123',
      userId: 'user123',
      amount: 100,
      currency: 'BRL',
      timestamp: Date.now(),
      ip: '192.168.1.1',
      deviceFingerprint: 'abc123',
    });
    
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(['low', 'medium', 'high', 'critical']).toContain(result.level);
    expect(['allow', 'review', 'block']).toContain(result.action);
  });

  it('deve analisar risco de login', () => {
    const result = analyzeLoginRisk({
      userId: 'user456',
      ip: '192.168.1.2',
      deviceFingerprint: 'def456',
    });
    
    expect(result.score).toBeDefined();
    expect(result.factors.length).toBeGreaterThan(0);
  });
});

describe('Camada 12: Compliance LGPD', () => {
  it('deve registrar consentimento', () => {
    const consent = recordConsent({
      userId: 'user123',
      type: 'marketing',
      granted: true,
      ip: '192.168.1.1',
      version: '1.0',
    });
    
    expect(consent.userId).toBe('user123');
    expect(consent.granted).toBe(true);
  });

  it('deve verificar consentimento ativo', () => {
    recordConsent({
      userId: 'user456',
      type: 'analytics',
      granted: true,
      ip: '192.168.1.2',
      version: '1.0',
    });
    
    expect(hasActiveConsent('user456', 'analytics')).toBe(true);
    expect(hasActiveConsent('user456', 'marketing')).toBe(false);
  });

  it('deve revogar consentimento', async () => {
    // Usar userId único para evitar conflito com outros testes
    const uniqueUserId = 'user-revoke-' + Date.now() + '-' + Math.random();
    
    recordConsent({
      userId: uniqueUserId,
      type: 'profiling',
      granted: true,
      ip: '192.168.1.3',
      version: '1.0',
    });
    
    // Verificar que está ativo antes de revogar
    expect(hasActiveConsent(uniqueUserId, 'profiling')).toBe(true);
    
    // Aguardar 1ms para garantir timestamp diferente
    await new Promise(resolve => setTimeout(resolve, 1));
    
    revokeConsent(uniqueUserId, 'profiling', '192.168.1.3');
    
    // Após revogar, deve estar inativo
    expect(hasActiveConsent(uniqueUserId, 'profiling')).toBe(false);
  });

  it('deve criar solicitação de titular (DSAR)', () => {
    const dsar = createDSAR({
      userId: 'user101',
      type: 'access',
    });
    
    expect(dsar.id).toBeDefined();
    expect(dsar.status).toBe('pending');
    expect(dsar.type).toBe('access');
  });

  it('deve gerar relatório de acesso a dados', () => {
    const report = generateDataAccessReport('user123', {
      name: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678900',
    });
    
    expect(report.reportId).toBeDefined();
    expect(report.dataCategories).toBeDefined();
    expect(report.processingPurposes.length).toBeGreaterThan(0);
  });

  it('deve verificar conformidade geral', () => {
    const compliance = checkCompliance();
    
    expect(compliance).toHaveProperty('compliant');
    expect(compliance).toHaveProperty('issues');
    expect(compliance).toHaveProperty('recommendations');
  });
});
