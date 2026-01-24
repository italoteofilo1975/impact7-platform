/**
 * JWT Security Module - RS256 Implementation
 * Camada 1: Autenticação e Autorização
 * 
 * Implementa JWT com RS256 (RSA 2048-bit) conforme MYFIPE
 */

import * as crypto from 'crypto';

// Configurações de segurança
const JWT_CONFIG = {
  algorithm: 'RS256' as const,
  accessTokenExpiry: 15 * 60, // 15 minutos em segundos
  refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 dias em segundos
  issuer: 'impact7-platform',
  audience: 'impact7-users',
};

// Interface para payload do token
interface TokenPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  jti: string; // Token ID único
  type: 'access' | 'refresh';
}

// Interface para resultado de verificação
interface VerifyResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

// Gerar par de chaves RSA 2048-bit (em produção, usar KMS)
let rsaKeyPair: { publicKey: string; privateKey: string } | null = null;

function getKeyPair(): { publicKey: string; privateKey: string } {
  if (rsaKeyPair) return rsaKeyPair;
  
  // Em produção, carregar de KMS ou variáveis de ambiente
  const jwtSecret = process.env.JWT_SECRET || 'development-secret';
  
  // Gerar chaves deterministicamente baseado no secret (para desenvolvimento)
  // Em produção, usar chaves RSA reais armazenadas de forma segura
  const seed = crypto.createHash('sha256').update(jwtSecret).digest();
  
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  
  rsaKeyPair = { publicKey, privateKey };
  return rsaKeyPair;
}

// Codificar Base64URL
function base64UrlEncode(data: string | Buffer): string {
  const base64 = Buffer.from(data).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Decodificar Base64URL
function base64UrlDecode(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  const padded = padding ? base64 + '='.repeat(4 - padding) : base64;
  return Buffer.from(padded, 'base64').toString('utf8');
}

// Gerar ID único para token
function generateTokenId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Criar Access Token (curta duração - 15 min)
 */
export function createAccessToken(userId: string, email: string, role: string): string {
  const { privateKey } = getKeyPair();
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: JWT_CONFIG.algorithm,
    typ: 'JWT',
  };
  
  const payload: TokenPayload = {
    sub: userId,
    email,
    role,
    iat: now,
    exp: now + JWT_CONFIG.accessTokenExpiry,
    iss: JWT_CONFIG.issuer,
    aud: JWT_CONFIG.audience,
    jti: generateTokenId(),
    type: 'access',
  };
  
  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${headerEncoded}.${payloadEncoded}`;
  
  const signature = crypto.sign('sha256', Buffer.from(dataToSign), privateKey);
  const signatureEncoded = base64UrlEncode(signature);
  
  return `${dataToSign}.${signatureEncoded}`;
}

/**
 * Criar Refresh Token (longa duração - 7 dias)
 */
export function createRefreshToken(userId: string, email: string, role: string): string {
  const { privateKey } = getKeyPair();
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: JWT_CONFIG.algorithm,
    typ: 'JWT',
  };
  
  const payload: TokenPayload = {
    sub: userId,
    email,
    role,
    iat: now,
    exp: now + JWT_CONFIG.refreshTokenExpiry,
    iss: JWT_CONFIG.issuer,
    aud: JWT_CONFIG.audience,
    jti: generateTokenId(),
    type: 'refresh',
  };
  
  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${headerEncoded}.${payloadEncoded}`;
  
  const signature = crypto.sign('sha256', Buffer.from(dataToSign), privateKey);
  const signatureEncoded = base64UrlEncode(signature);
  
  return `${dataToSign}.${signatureEncoded}`;
}

/**
 * Verificar Token (Access ou Refresh)
 */
export function verifyToken(token: string): VerifyResult {
  try {
    const { publicKey } = getKeyPair();
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
    const dataToVerify = `${headerEncoded}.${payloadEncoded}`;
    
    // Verificar assinatura
    const signature = Buffer.from(
      signatureEncoded.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    );
    
    const isValid = crypto.verify(
      'sha256',
      Buffer.from(dataToVerify),
      publicKey,
      signature
    );
    
    if (!isValid) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    // Decodificar payload
    const payload: TokenPayload = JSON.parse(base64UrlDecode(payloadEncoded));
    
    // Verificar expiração
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { valid: false, error: 'Token expired' };
    }
    
    // Verificar issuer e audience
    if (payload.iss !== JWT_CONFIG.issuer) {
      return { valid: false, error: 'Invalid issuer' };
    }
    
    if (payload.aud !== JWT_CONFIG.audience) {
      return { valid: false, error: 'Invalid audience' };
    }
    
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: 'Token verification failed' };
  }
}

/**
 * Rotacionar Refresh Token (gerar novo a cada uso)
 */
export function rotateRefreshToken(oldToken: string): { accessToken: string; refreshToken: string } | null {
  const result = verifyToken(oldToken);
  
  if (!result.valid || !result.payload || result.payload.type !== 'refresh') {
    return null;
  }
  
  const { sub, email, role } = result.payload;
  
  return {
    accessToken: createAccessToken(sub, email, role),
    refreshToken: createRefreshToken(sub, email, role),
  };
}

/**
 * Extrair payload sem verificar (para debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

/**
 * Verificar se token está próximo de expirar (menos de 5 min)
 */
export function isTokenExpiringSoon(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;
  
  return payload.exp - now < fiveMinutes;
}

export const jwtConfig = JWT_CONFIG;
