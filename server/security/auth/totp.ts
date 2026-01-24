/**
 * TOTP (Time-based One-Time Password) Security Module
 * Camada 1: Autenticação e Autorização
 * 
 * Implementa 2FA com TOTP e backup codes conforme MYFIPE
 */

import * as crypto from 'crypto';

// Configurações TOTP
const TOTP_CONFIG = {
  digits: 6,
  period: 30, // segundos
  algorithm: 'sha1' as const,
  window: 1, // permitir 1 período antes/depois
  issuer: 'IMPACT7',
  backupCodeCount: 10,
  backupCodeLength: 8,
};

// Interface para resultado de verificação
interface TOTPVerifyResult {
  valid: boolean;
  usedBackupCode?: boolean;
  error?: string;
}

// Interface para setup de 2FA
interface TOTPSetup {
  secret: string;
  otpauthUrl: string;
  backupCodes: string[];
  qrCodeData: string;
}

/**
 * Gerar secret TOTP (Base32)
 */
export function generateTOTPSecret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

/**
 * Codificar em Base32
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';
  
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  
  return output;
}

/**
 * Decodificar Base32
 */
function base32Decode(encoded: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanInput = encoded.replace(/=+$/, '').toUpperCase();
  
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  
  for (let i = 0; i < cleanInput.length; i++) {
    const idx = alphabet.indexOf(cleanInput[i]);
    if (idx === -1) continue;
    
    value = (value << 5) | idx;
    bits += 5;
    
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  
  return Buffer.from(output);
}

/**
 * Gerar TOTP para um timestamp específico
 */
function generateTOTP(secret: string, timestamp: number): string {
  const key = base32Decode(secret);
  const counter = Math.floor(timestamp / 1000 / TOTP_CONFIG.period);
  
  // Converter counter para buffer de 8 bytes (big-endian)
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));
  
  // Calcular HMAC-SHA1
  const hmac = crypto.createHmac(TOTP_CONFIG.algorithm, key);
  hmac.update(counterBuffer);
  const hash = hmac.digest();
  
  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0x0f;
  const binary = 
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  
  const otp = binary % Math.pow(10, TOTP_CONFIG.digits);
  return otp.toString().padStart(TOTP_CONFIG.digits, '0');
}

/**
 * Verificar código TOTP
 */
export function verifyTOTP(secret: string, code: string): boolean {
  const now = Date.now();
  
  // Verificar código atual e janelas adjacentes
  for (let i = -TOTP_CONFIG.window; i <= TOTP_CONFIG.window; i++) {
    const timestamp = now + (i * TOTP_CONFIG.period * 1000);
    const expectedCode = generateTOTP(secret, timestamp);
    
    if (timingSafeEqual(code, expectedCode)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Comparação segura contra timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Gerar backup codes criptografados
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < TOTP_CONFIG.backupCodeCount; i++) {
    const code = crypto.randomBytes(TOTP_CONFIG.backupCodeLength / 2)
      .toString('hex')
      .toUpperCase();
    codes.push(code);
  }
  
  return codes;
}

/**
 * Hash backup code para armazenamento seguro (PBKDF2-SHA256)
 */
export function hashBackupCode(code: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(
    code.toUpperCase(),
    salt,
    100000, // iterations
    32, // key length
    'sha256'
  );
  
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verificar backup code contra hash armazenado
 */
export function verifyBackupCode(code: string, storedHash: string): boolean {
  try {
    const [saltHex, hashHex] = storedHash.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const storedHashBuffer = Buffer.from(hashHex, 'hex');
    
    const hash = crypto.pbkdf2Sync(
      code.toUpperCase(),
      salt,
      100000,
      32,
      'sha256'
    );
    
    return crypto.timingSafeEqual(hash, storedHashBuffer);
  } catch {
    return false;
  }
}

/**
 * Gerar URL otpauth para QR code
 */
export function generateOTPAuthURL(secret: string, userEmail: string): string {
  const encodedIssuer = encodeURIComponent(TOTP_CONFIG.issuer);
  const encodedEmail = encodeURIComponent(userEmail);
  
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${TOTP_CONFIG.digits}&period=${TOTP_CONFIG.period}`;
}

/**
 * Setup completo de 2FA para um usuário
 */
export function setup2FA(userEmail: string): TOTPSetup {
  const secret = generateTOTPSecret();
  const otpauthUrl = generateOTPAuthURL(secret, userEmail);
  const backupCodes = generateBackupCodes();
  
  // Dados para QR code (pode ser usado com biblioteca de QR)
  const qrCodeData = otpauthUrl;
  
  return {
    secret,
    otpauthUrl,
    backupCodes,
    qrCodeData,
  };
}

/**
 * Verificar 2FA (código TOTP ou backup code)
 */
export function verify2FA(
  code: string,
  totpSecret: string,
  hashedBackupCodes: string[]
): TOTPVerifyResult {
  // Primeiro, tentar verificar como TOTP
  if (code.length === TOTP_CONFIG.digits && /^\d+$/.test(code)) {
    if (verifyTOTP(totpSecret, code)) {
      return { valid: true, usedBackupCode: false };
    }
  }
  
  // Se não for TOTP válido, tentar como backup code
  const cleanCode = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  for (let i = 0; i < hashedBackupCodes.length; i++) {
    if (verifyBackupCode(cleanCode, hashedBackupCodes[i])) {
      return { valid: true, usedBackupCode: true };
    }
  }
  
  return { valid: false, error: 'Invalid 2FA code' };
}

/**
 * Gerar código TOTP atual (para testes)
 */
export function getCurrentTOTP(secret: string): string {
  return generateTOTP(secret, Date.now());
}

export const totpConfig = TOTP_CONFIG;
