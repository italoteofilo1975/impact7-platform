/**
 * Serviço de API Pública
 * Gerenciamento de API keys e autenticação para integrações externas
 */

import { getDb } from "../../db";
import { apiKeys } from "../../../drizzle/schema";
import { eq, and, gte, isNull, or } from "drizzle-orm";
import crypto from "crypto";

// Gerar API key
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `imp7_${crypto.randomBytes(32).toString("hex")}`;
  const prefix = key.substring(0, 12);
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  return { key, prefix, hash };
}

// Criar nova API key
export async function createApiKey(
  userId: number,
  name: string,
  permissions: string[] = ["cases:read"],
  rateLimit: number = 1000,
  expiresInDays?: number
): Promise<{ key: string; id: number } | null> {
  const db = await getDb();
  if (!db) return null;
  
  const { key, prefix, hash } = generateApiKey();
  
  const expiresAt = expiresInDays 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;
  
  const result = await db.insert(apiKeys).values({
    userId,
    name,
    keyHash: hash,
    keyPrefix: prefix,
    permissions: JSON.stringify(permissions),
    rateLimit,
    expiresAt,
    isActive: true,
  
          createdAt: Date.now(),
        });
  
  const insertId = result[0]?.insertId;
  if (!insertId) return null;
  
  return { key, id: insertId };
}

// Validar API key
export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  userId?: number;
  permissions?: string[];
  rateLimit?: number;
  error?: string;
}> {
  const db = await getDb();
  if (!db) return { valid: false, error: "Database not available" };
  
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  
  const results = await db.select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.keyHash, hash),
        eq(apiKeys.isActive, true),
        or(
          isNull(apiKeys.expiresAt),
          gte(apiKeys.expiresAt, Date.now())
        )
      )
    );
  
  if (results.length === 0) {
    return { valid: false, error: "Invalid or expired API key" };
  }
  
  const apiKey = results[0];
  
  // Atualizar lastUsedAt
  await db.update(apiKeys)
    .set({ lastUsedAt: Date.now() })
    .where(eq(apiKeys.id, apiKey.id));
  
  return {
    valid: true,
    userId: apiKey.userId,
    permissions: apiKey.permissions ? JSON.parse(apiKey.permissions) : [],
    rateLimit: apiKey.rateLimit,
  };
}

// Listar API keys do usuário
export async function listUserApiKeys(userId: number): Promise<Array<{
  id: number;
  name: string;
  keyPrefix: string;
  permissions: string[];
  rateLimit: number;
  lastUsedAt: Date | null;
  expiresAt: number | null;
  isActive: boolean;
  createdAt: number;
}>> {
  const db = await getDb();
  if (!db) return [];
  
  const keys = await db.select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId));
  
  return keys.map(k => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    permissions: k.permissions ? JSON.parse(k.permissions) : [],
    rateLimit: k.rateLimit,
    lastUsedAt: k.lastUsedAt,
    expiresAt: k.expiresAt,
    isActive: k.isActive,
    createdAt: k.createdAt,
  }));
}

// Revogar API key
export async function revokeApiKey(userId: number, keyId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.update(apiKeys)
    .set({ isActive: false })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));
  
  return true;
}

// Rate limiting em memória
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(keyPrefix: string, limit: number): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  
  let entry = rateLimitStore.get(keyPrefix);
  
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + hourMs };
    rateLimitStore.set(keyPrefix, entry);
  }
  
  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }
  
  entry.count++;
  
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// Permissões disponíveis
export const API_PERMISSIONS = {
  "cases:read": "Ler cases públicos",
  "cases:list": "Listar todos os cases",
  "cases:stats": "Acessar estatísticas agregadas",
  "calculator:use": "Usar calculadora de impacto",
  "sdgs:read": "Ler informações de ODS",
};
