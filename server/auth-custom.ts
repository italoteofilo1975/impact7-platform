/**
 * Sistema de Autenticação Customizado, local por e-mail e senha
 * Implementação própria de JWT e gerenciamento de sessões
 */

import { SignJWT, jwtVerify } from "jose";
import type { Request, Response } from "express";
import { getDb } from "./db";

// Em producao, JWT_SECRET e obrigatorio, um segredo hardcoded no repositorio permitiria
// a qualquer um com acesso ao codigo forjar sessoes validas, inclusive de admin.
// Em desenvolvimento local, um fallback claramente rotulado como inseguro evita travar o boot.
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET obrigatorio em producao. Configure a variavel de ambiente antes de iniciar o servidor.",
  );
}
const JWT_SECRET = process.env.JWT_SECRET || "impact7-dev-only-insecure-secret-nao-usar-em-producao";
const COOKIE_NAME = "app_session_id";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

interface SessionPayload {
  userId: number;
  openId: string;
  email: string;
  role: string;
  name?: string;
}

/**
 * Criar token JWT customizado
 */
export async function createCustomJWT(payload: SessionPayload): Promise<string> {
  const secretKey = new TextEncoder().encode(JWT_SECRET);
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + ONE_YEAR_MS) / 1000);

  return new SignJWT({
    userId: payload.userId,
    openId: payload.openId,
    email: payload.email,
    role: payload.role,
    name: payload.name || "",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .setIssuedAt(Math.floor(issuedAt / 1000))
    .sign(secretKey);
}

/**
 * Verificar token JWT customizado
 */
export async function verifyCustomJWT(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);

    return {
      userId: payload.userId as number,
      openId: payload.openId as string,
      email: payload.email as string,
      role: payload.role as string,
      name: payload.name as string,
    };
  } catch (error) {
    console.error("[Auth] JWT verification failed:", error);
    return null;
  }
}

/**
 * Parsear cookies do header
 */
function parseCookies(cookieHeader?: string): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.split("=");
    const value = rest.join("=").trim();
    if (name && value) {
      cookies.set(name.trim(), value);
    }
  });

  return cookies;
}

/**
 * Autenticar requisição via cookie JWT
 */
export async function authenticateCustomRequest(req: Request): Promise<any | null> {
  try {
    // Ler cookie
    const cookies = parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);

    if (!sessionCookie) {
      console.log("[Auth] No session cookie found");
      return null;
    }

    // Verificar JWT
    const session = await verifyCustomJWT(sessionCookie);
    if (!session) {
      console.log("[Auth] Invalid JWT token");
      return null;
    }

    // Buscar usuário no banco
    const db = await getDb();
    if (!db) {
      console.error("[Auth] Database not available");
      return null;
    }

    const { users } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      console.log("[Auth] User not found in database:", session.userId);
      return null;
    }

    console.log("[Auth] User authenticated:", user.email);
    return user;
  } catch (error) {
    console.error("[Auth] Authentication error:", error);
    return null;
  }
}

/**
 * Fazer logout e limpar sessão
 */
export function customLogout(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  console.log("[Auth] Logout successful");
}

export { COOKIE_NAME };
