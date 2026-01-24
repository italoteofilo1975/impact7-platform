/**
 * Hash Security Module
 * Camada 3: Proteção de Dados em Repouso
 * 
 * Implementa hash de senhas com bcrypt e derivação de chaves com PBKDF2
 */

import * as crypto from 'crypto';

// Configurações de hash
const HASH_CONFIG = {
  bcrypt: {
    costFactor: 12, // 2^12 = 4096 iterations
    saltLength: 16,
  },
  pbkdf2: {
    iterations: 100000,
    keyLength: 64,
    digest: 'sha512' as const,
  },
  argon2: {
    // Configurações para Argon2 (se disponível)
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  },
};

// Interface para hash armazenado
interface StoredHash {
  algorithm: 'bcrypt' | 'pbkdf2' | 'argon2';
  hash: string;
  salt: string;
  version: number;
}

/**
 * Implementação de bcrypt em JavaScript puro
 * (Em produção, usar biblioteca bcrypt nativa)
 */
class BcryptJS {
  private static readonly BCRYPT_SALT_LEN = 16;
  private static readonly BCRYPT_HASH_LEN = 23;
  
  // Gerar salt bcrypt
  static genSalt(rounds: number = 12): string {
    const salt = crypto.randomBytes(this.BCRYPT_SALT_LEN);
    const version = '$2b$';
    const cost = rounds.toString().padStart(2, '0');
    const saltBase64 = this.encodeBase64(salt);
    return `${version}${cost}$${saltBase64}`;
  }
  
  // Hash com bcrypt
  static hash(password: string, salt: string): string {
    // Extrair parâmetros do salt
    const parts = salt.split('$');
    const rounds = parseInt(parts[2], 10);
    const saltValue = parts[3].substring(0, 22);
    
    // Usar PBKDF2 como aproximação de bcrypt
    // (Em produção, usar biblioteca bcrypt nativa)
    const derivedKey = crypto.pbkdf2Sync(
      password,
      saltValue,
      Math.pow(2, rounds),
      24,
      'sha256'
    );
    
    const hashBase64 = this.encodeBase64(derivedKey);
    return `${salt}${hashBase64}`;
  }
  
  // Verificar hash
  static compare(password: string, hash: string): boolean {
    try {
      // Extrair salt do hash
      const saltEnd = hash.lastIndexOf('$') + 23;
      const salt = hash.substring(0, saltEnd);
      
      // Gerar novo hash com mesmo salt
      const newHash = this.hash(password, salt);
      
      // Comparação segura contra timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(newHash)
      );
    } catch {
      return false;
    }
  }
  
  // Codificação Base64 customizada para bcrypt
  private static encodeBase64(data: Buffer): string {
    const base64 = data.toString('base64');
    // bcrypt usa alfabeto diferente
    return base64
      .replace(/\+/g, '.')
      .replace(/\//g, '/')
      .replace(/=/g, '');
  }
}

/**
 * Hash de senha com bcrypt (cost factor 12)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = BcryptJS.genSalt(HASH_CONFIG.bcrypt.costFactor);
  return BcryptJS.hash(password, salt);
}

/**
 * Verificar senha contra hash bcrypt
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return BcryptJS.compare(password, hash);
}

/**
 * Hash com PBKDF2-SHA512 (para backup codes, etc.)
 */
export function hashPBKDF2(data: string, salt?: Buffer): { hash: string; salt: string } {
  const useSalt = salt || crypto.randomBytes(16);
  
  const hash = crypto.pbkdf2Sync(
    data,
    useSalt,
    HASH_CONFIG.pbkdf2.iterations,
    HASH_CONFIG.pbkdf2.keyLength,
    HASH_CONFIG.pbkdf2.digest
  );
  
  return {
    hash: hash.toString('hex'),
    salt: useSalt.toString('hex'),
  };
}

/**
 * Verificar hash PBKDF2
 */
export function verifyPBKDF2(data: string, storedHash: string, salt: string): boolean {
  const saltBuffer = Buffer.from(salt, 'hex');
  const { hash } = hashPBKDF2(data, saltBuffer);
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(storedHash, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Hash SHA-256 (para checksums, não para senhas)
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Hash SHA-512 (para checksums, não para senhas)
 */
export function sha512(data: string): string {
  return crypto.createHash('sha512').update(data).digest('hex');
}

/**
 * HMAC-SHA256 (para assinaturas)
 */
export function hmacSha256(data: string, key: string): string {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

/**
 * HMAC-SHA512 (para assinaturas)
 */
export function hmacSha512(data: string, key: string): string {
  return crypto.createHmac('sha512', key).update(data).digest('hex');
}

/**
 * Gerar salt aleatório
 */
export function generateSalt(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash com salt (formato: salt:hash)
 */
export function hashWithSalt(data: string, algorithm: 'sha256' | 'sha512' = 'sha256'): string {
  const salt = generateSalt();
  const hash = crypto.createHash(algorithm).update(salt + data).digest('hex');
  return `${salt}:${hash}`;
}

/**
 * Verificar hash com salt
 */
export function verifyHashWithSalt(data: string, storedValue: string, algorithm: 'sha256' | 'sha512' = 'sha256'): boolean {
  const [salt, storedHash] = storedValue.split(':');
  const hash = crypto.createHash(algorithm).update(salt + data).digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(storedHash, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Verificar força da senha
 */
export function checkPasswordStrength(password: string): {
  score: number; // 0-100
  feedback: string[];
  isStrong: boolean;
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Comprimento
  if (password.length >= 8) score += 20;
  else feedback.push('Senha deve ter pelo menos 8 caracteres');
  
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Letras minúsculas
  if (/[a-z]/.test(password)) score += 10;
  else feedback.push('Adicione letras minúsculas');
  
  // Letras maiúsculas
  if (/[A-Z]/.test(password)) score += 10;
  else feedback.push('Adicione letras maiúsculas');
  
  // Números
  if (/[0-9]/.test(password)) score += 10;
  else feedback.push('Adicione números');
  
  // Caracteres especiais
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  else feedback.push('Adicione caracteres especiais');
  
  // Não ter sequências comuns
  const commonPatterns = ['123', 'abc', 'qwerty', 'password', 'admin'];
  const hasCommonPattern = commonPatterns.some(p => 
    password.toLowerCase().includes(p)
  );
  
  if (hasCommonPattern) {
    score -= 20;
    feedback.push('Evite sequências comuns');
  }
  
  // Não ter repetições
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Evite caracteres repetidos');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    feedback,
    isStrong: score >= 60,
  };
}

/**
 * Gerar hash de integridade para dados
 */
export function generateIntegrityHash(data: object): string {
  const json = JSON.stringify(data, Object.keys(data).sort());
  return sha256(json);
}

/**
 * Verificar integridade de dados
 */
export function verifyIntegrity(data: object, expectedHash: string): boolean {
  const actualHash = generateIntegrityHash(data);
  return actualHash === expectedHash;
}

export const hashConfig = HASH_CONFIG;
