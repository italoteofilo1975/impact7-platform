/**
 * AES-256-GCM Encryption Module
 * Camada 3: Proteção de Dados em Repouso
 * 
 * Implementa criptografia simétrica para dados sensíveis
 */

import * as crypto from 'crypto';

// Configurações de criptografia
const AES_CONFIG = {
  algorithm: 'aes-256-gcm' as const,
  keyLength: 32, // 256 bits
  ivLength: 12, // 96 bits (recomendado para GCM)
  authTagLength: 16, // 128 bits
  saltLength: 16,
  iterations: 100000, // PBKDF2 iterations
};

// Interface para dados criptografados
interface EncryptedData {
  ciphertext: string; // Base64
  iv: string; // Base64
  authTag: string; // Base64
  salt?: string; // Base64 (se usar derivação de chave)
}

// Cache de chaves derivadas (em produção, usar KMS)
const keyCache = new Map<string, Buffer>();

/**
 * Derivar chave de uma senha usando PBKDF2
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  const cacheKey = `${password}:${salt.toString('hex')}`;
  
  if (keyCache.has(cacheKey)) {
    return keyCache.get(cacheKey)!;
  }
  
  const key = crypto.pbkdf2Sync(
    password,
    salt,
    AES_CONFIG.iterations,
    AES_CONFIG.keyLength,
    'sha256'
  );
  
  keyCache.set(cacheKey, key);
  return key;
}

/**
 * Obter chave mestra do ambiente
 */
function getMasterKey(): Buffer {
  const secret = process.env.JWT_SECRET || 'development-master-key';
  const salt = Buffer.from('impact7-master-salt', 'utf8');
  return deriveKey(secret, salt);
}

/**
 * Criptografar dados com AES-256-GCM
 */
export function encrypt(plaintext: string, customKey?: Buffer): EncryptedData {
  const key = customKey || getMasterKey();
  const iv = crypto.randomBytes(AES_CONFIG.ivLength);
  
  const cipher = crypto.createCipheriv(AES_CONFIG.algorithm, key, iv, {
    authTagLength: AES_CONFIG.authTagLength,
  });
  
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  return {
    ciphertext,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Descriptografar dados com AES-256-GCM
 */
export function decrypt(encryptedData: EncryptedData, customKey?: Buffer): string {
  const key = customKey || getMasterKey();
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const authTag = Buffer.from(encryptedData.authTag, 'base64');
  
  const decipher = crypto.createDecipheriv(AES_CONFIG.algorithm, key, iv, {
    authTagLength: AES_CONFIG.authTagLength,
  });
  
  decipher.setAuthTag(authTag);
  
  let plaintext = decipher.update(encryptedData.ciphertext, 'base64', 'utf8');
  plaintext += decipher.final('utf8');
  
  return plaintext;
}

/**
 * Criptografar com senha (inclui salt)
 */
export function encryptWithPassword(plaintext: string, password: string): EncryptedData {
  const salt = crypto.randomBytes(AES_CONFIG.saltLength);
  const key = deriveKey(password, salt);
  
  const encrypted = encrypt(plaintext, key);
  encrypted.salt = salt.toString('base64');
  
  return encrypted;
}

/**
 * Descriptografar com senha
 */
export function decryptWithPassword(encryptedData: EncryptedData, password: string): string {
  if (!encryptedData.salt) {
    throw new Error('Salt is required for password-based decryption');
  }
  
  const salt = Buffer.from(encryptedData.salt, 'base64');
  const key = deriveKey(password, salt);
  
  return decrypt(encryptedData, key);
}

/**
 * Criptografar campo sensível (CPF, CNPJ, etc.)
 * Retorna string única para armazenamento
 */
export function encryptField(value: string): string {
  const encrypted = encrypt(value);
  return `${encrypted.iv}:${encrypted.authTag}:${encrypted.ciphertext}`;
}

/**
 * Descriptografar campo sensível
 */
export function decryptField(encryptedValue: string): string {
  const [iv, authTag, ciphertext] = encryptedValue.split(':');
  return decrypt({ iv, authTag, ciphertext });
}

/**
 * Criptografar objeto JSON
 */
export function encryptObject<T extends object>(obj: T): string {
  const json = JSON.stringify(obj);
  return encryptField(json);
}

/**
 * Descriptografar objeto JSON
 */
export function decryptObject<T extends object>(encryptedValue: string): T {
  const json = decryptField(encryptedValue);
  return JSON.parse(json);
}

/**
 * Gerar chave aleatória
 */
export function generateKey(): Buffer {
  return crypto.randomBytes(AES_CONFIG.keyLength);
}

/**
 * Exportar chave para armazenamento seguro (Base64)
 */
export function exportKey(key: Buffer): string {
  return key.toString('base64');
}

/**
 * Importar chave de string Base64
 */
export function importKey(keyString: string): Buffer {
  return Buffer.from(keyString, 'base64');
}

/**
 * Verificar integridade de dados criptografados
 */
export function verifyIntegrity(encryptedData: EncryptedData, customKey?: Buffer): boolean {
  try {
    decrypt(encryptedData, customKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Rotacionar chave (re-criptografar com nova chave)
 */
export function rotateKey(
  encryptedData: EncryptedData,
  oldKey: Buffer,
  newKey: Buffer
): EncryptedData {
  const plaintext = decrypt(encryptedData, oldKey);
  return encrypt(plaintext, newKey);
}

export const aesConfig = AES_CONFIG;
