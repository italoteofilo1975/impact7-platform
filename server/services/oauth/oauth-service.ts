/**
 * Serviço OAuth2
 * Implementação do fluxo Authorization Code com PKCE
 */

import { getDb } from "../../db";
import { oauthClients, oauthAuthCodes, oauthTokens } from "../../../drizzle/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import crypto from "crypto";

// Configurações
const AUTH_CODE_EXPIRY_MINUTES = 10;
const ACCESS_TOKEN_EXPIRY_HOURS = 1;
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

// Escopos disponíveis
export const OAUTH_SCOPES = {
  "cases:read": "Ler cases públicos",
  "cases:list": "Listar todos os cases",
  "cases:stats": "Acessar estatísticas agregadas",
  "calculator:use": "Usar calculadora de impacto",
  "sdgs:read": "Ler informações de ODS",
  "profile:read": "Ler perfil do usuário",
} as const;

export type OAuthScope = keyof typeof OAUTH_SCOPES;

// Gerar strings aleatórias
function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString("hex").substring(0, length);
}

// Hash SHA-256
function sha256(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

// Base64 URL encode
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Criar OAuth client
export async function createOAuthClient(
  userId: number,
  name: string,
  description: string,
  redirectUris: string[],
  scopes: OAuthScope[]
): Promise<{ clientId: string; clientSecret: string } | null> {
  const db = await getDb();
  if (!db) return null;
  
  const clientId = `imp7_${generateRandomString(32)}`;
  const clientSecret = generateRandomString(64);
  const clientSecretHash = sha256(clientSecret);
  
  await db.insert(oauthClients).values({
    userId,
    name,
    description,
    clientId,
    clientSecretHash,
    redirectUris: JSON.stringify(redirectUris),
    scopes: JSON.stringify(scopes),
    isActive: 1,
  
          createdAt: Date.now(),
        });
  
  return { clientId, clientSecret };
}

// Listar OAuth clients do usuário
export async function listUserOAuthClients(userId: number): Promise<Array<{
  id: number;
  name: string;
  description: string | null;
  clientId: string;
  redirectUris: string[];
  scopes: OAuthScope[];
  isActive: boolean;
  createdAt: number;
}>> {
  const db = await getDb();
  if (!db) return [];
  
  const clients = await db.select()
    .from(oauthClients)
    .where(eq(oauthClients.userId, userId));
  
  return clients.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    clientId: c.clientId,
    redirectUris: c.redirectUris ? JSON.parse(c.redirectUris) : [],
    scopes: c.scopes ? JSON.parse(c.scopes) : [],
    isActive: c.isActive,
    createdAt: c.createdAt,
  }));
}

// Validar OAuth client
export async function validateOAuthClient(
  clientId: string,
  redirectUri: string,
  scopes: OAuthScope[]
): Promise<{ valid: boolean; error?: string; client?: { name: string; userId: number } }> {
  const db = await getDb();
  if (!db) return { valid: false, error: "Database not available" };
  
  const clients = await db.select()
    .from(oauthClients)
    .where(and(eq(oauthClients.clientId, clientId), eq(oauthClients.isActive, 1)));
  
  if (clients.length === 0) {
    return { valid: false, error: "Invalid client_id" };
  }
  
  const client = clients[0];
  const allowedRedirectUris: string[] = client.redirectUris ? JSON.parse(client.redirectUris) : [];
  const allowedScopes: OAuthScope[] = client.scopes ? JSON.parse(client.scopes) : [];
  
  // Validar redirect_uri
  if (!allowedRedirectUris.includes(redirectUri)) {
    return { valid: false, error: "Invalid redirect_uri" };
  }
  
  // Validar scopes
  const invalidScopes = scopes.filter(s => !allowedScopes.includes(s));
  if (invalidScopes.length > 0) {
    return { valid: false, error: `Invalid scopes: ${invalidScopes.join(", ")}` };
  }
  
  return { valid: true, client: { name: client.name, userId: client.userId } };
}

// Gerar authorization code
export async function generateAuthCode(
  clientId: string,
  userId: number,
  redirectUri: string,
  scopes: OAuthScope[],
  codeChallenge?: string,
  codeChallengeMethod?: "plain" | "S256"
): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  const code = generateRandomString(64);
  const expiresAt = new Date(Date.now() + AUTH_CODE_EXPIRY_MINUTES * 60 * 1000);
  
  await db.insert(oauthAuthCodes).values({
    clientId,
    userId,
    code,
    redirectUri,
    scopes: JSON.stringify(scopes),
    codeChallenge: codeChallenge || null,
    codeChallengeMethod: codeChallengeMethod || null,
    expiresAt,
  
          createdAt: Date.now(),
        });
  
  return code;
}

// Trocar authorization code por tokens
export async function exchangeCodeForTokens(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string,
  codeVerifier?: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scopes: OAuthScope[];
} | { error: string }> {
  const db = await getDb();
  if (!db) return { error: "Database not available" };
  
  // Validar client
  const clients = await db.select()
    .from(oauthClients)
    .where(and(eq(oauthClients.clientId, clientId), eq(oauthClients.isActive, 1)));
  
  if (clients.length === 0) {
    return { error: "Invalid client_id" };
  }
  
  const client = clients[0];
  
  // Validar client_secret
  if (sha256(clientSecret) !== client.clientSecretHash) {
    return { error: "Invalid client_secret" };
  }
  
  // Buscar authorization code
  const codes = await db.select()
    .from(oauthAuthCodes)
    .where(and(
      eq(oauthAuthCodes.code, code),
      eq(oauthAuthCodes.clientId, clientId),
      gte(oauthAuthCodes.expiresAt, Date.now())
    ));
  
  if (codes.length === 0) {
    return { error: "Invalid or expired code" };
  }
  
  const authCode = codes[0];
  
  // Validar redirect_uri
  if (authCode.redirectUri !== redirectUri) {
    return { error: "Invalid redirect_uri" };
  }
  
  // Validar PKCE se presente
  if (authCode.codeChallenge) {
    if (!codeVerifier) {
      return { error: "code_verifier required" };
    }
    
    let computedChallenge: string;
    if (authCode.codeChallengeMethod === "S256") {
      computedChallenge = base64UrlEncode(sha256(codeVerifier));
    } else {
      computedChallenge = codeVerifier;
    }
    
    if (computedChallenge !== authCode.codeChallenge) {
      return { error: "Invalid code_verifier" };
    }
  }
  
  // Deletar authorization code (single use)
  await db.delete(oauthAuthCodes).where(eq(oauthAuthCodes.id, authCode.id));
  
  // Gerar tokens
  const accessToken = generateRandomString(64);
  const refreshToken = generateRandomString(64);
  const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
  const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  await db.insert(oauthTokens).values({
    clientId,
    userId: authCode.userId,
    accessToken,
    refreshToken,
    scopes: authCode.scopes,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  
          createdAt: Date.now(),
        });
  
  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY_HOURS * 60 * 60,
    scopes: authCode.scopes ? JSON.parse(authCode.scopes) : [],
  };
}

// Refresh tokens
export async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scopes: OAuthScope[];
} | { error: string }> {
  const db = await getDb();
  if (!db) return { error: "Database not available" };
  
  // Validar client
  const clients = await db.select()
    .from(oauthClients)
    .where(and(eq(oauthClients.clientId, clientId), eq(oauthClients.isActive, 1)));
  
  if (clients.length === 0) {
    return { error: "Invalid client_id" };
  }
  
  const client = clients[0];
  
  // Validar client_secret
  if (sha256(clientSecret) !== client.clientSecretHash) {
    return { error: "Invalid client_secret" };
  }
  
  // Buscar refresh token
  const tokens = await db.select()
    .from(oauthTokens)
    .where(and(
      eq(oauthTokens.refreshToken, refreshToken),
      eq(oauthTokens.clientId, clientId),
      gte(oauthTokens.refreshTokenExpiresAt, Date.now())
    ));
  
  if (tokens.length === 0) {
    return { error: "Invalid or expired refresh_token" };
  }
  
  const oldToken = tokens[0];
  
  // Deletar token antigo
  await db.delete(oauthTokens).where(eq(oauthTokens.id, oldToken.id));
  
  // Gerar novos tokens
  const newAccessToken = generateRandomString(64);
  const newRefreshToken = generateRandomString(64);
  const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
  const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  await db.insert(oauthTokens).values({
    clientId,
    userId: oldToken.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    scopes: oldToken.scopes,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  
          createdAt: Date.now(),
        });
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY_HOURS * 60 * 60,
    scopes: oldToken.scopes ? JSON.parse(oldToken.scopes) : [],
  };
}

// Validar access token
export async function validateAccessToken(accessToken: string): Promise<{
  valid: boolean;
  userId?: number;
  scopes?: OAuthScope[];
  error?: string;
}> {
  const db = await getDb();
  if (!db) return { valid: false, error: "Database not available" };
  
  const tokens = await db.select()
    .from(oauthTokens)
    .where(and(
      eq(oauthTokens.accessToken, accessToken),
      gte(oauthTokens.accessTokenExpiresAt, Date.now())
    ));
  
  if (tokens.length === 0) {
    return { valid: false, error: "Invalid or expired access_token" };
  }
  
  const token = tokens[0];
  
  return {
    valid: true,
    userId: token.userId,
    scopes: token.scopes ? JSON.parse(token.scopes) : [],
  };
}

// Revogar tokens de um client
export async function revokeClientTokens(clientId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(oauthTokens).where(eq(oauthTokens.clientId, clientId));
  await db.delete(oauthAuthCodes).where(eq(oauthAuthCodes.clientId, clientId));
}

// Deletar OAuth client
export async function deleteOAuthClient(userId: number, clientId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  // Verificar propriedade
  const clients = await db.select()
    .from(oauthClients)
    .where(and(eq(oauthClients.clientId, clientId), eq(oauthClients.userId, userId)));
  
  if (clients.length === 0) return false;
  
  // Revogar tokens
  await revokeClientTokens(clientId);
  
  // Deletar client
  await db.delete(oauthClients).where(eq(oauthClients.clientId, clientId));
  
  return true;
}

// Regenerar client secret
export async function regenerateClientSecret(
  userId: number,
  clientId: string
): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  // Verificar propriedade
  const clients = await db.select()
    .from(oauthClients)
    .where(and(eq(oauthClients.clientId, clientId), eq(oauthClients.userId, userId)));
  
  if (clients.length === 0) return null;
  
  const newSecret = generateRandomString(64);
  const newSecretHash = sha256(newSecret);
  
  await db.update(oauthClients)
    .set({ clientSecretHash: newSecretHash })
    .where(eq(oauthClients.clientId, clientId));
  
  // Revogar tokens existentes
  await revokeClientTokens(clientId);
  
  return newSecret;
}
