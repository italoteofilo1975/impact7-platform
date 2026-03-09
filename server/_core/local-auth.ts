/**
 * Local Authentication Service
 *
 * Provides email + password authentication without external OAuth providers.
 * Uses bcrypt for password hashing and JWT for session management.
 *
 * Password Reset Flow:
 * 1. User requests reset → token stored in DB (1h TTL) → notifyOwner + link shown in UI
 * 2. User clicks link → token validated → new password set → token invalidated
 * Note: When E4 (Resend.com) is configured, replace notifyOwner with direct email.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { Express, Request, Response } from 'express';
import * as db from '../db';
import { getSessionCookieOptions } from './cookies';
import { ENV } from './env';
import { notifyOwner } from './notification';

const COOKIE_NAME = 'session';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

interface JWTPayload {
  userId: number;
  email: string;
  name?: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a JWT session token
 */
export function createSessionToken(userId: number, email: string, name: string | null, role: string): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId,
    email,
    name: name || undefined,
    role,
  };

  return jwt.sign(payload, ENV.jwtSecret, {
    expiresIn: '365d',
  });
}

/**
 * Verify and decode a JWT session token
 */
export function verifySessionToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, ENV.jwtSecret) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Store a password reset token in the database
 */
async function storeResetToken(userId: number, token: string): Promise<void> {
  const mysql = await import('mysql2/promise');
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  try {
    // Invalidate any existing tokens for this user
    await conn.execute(
      'UPDATE password_reset_tokens SET usedAt = ? WHERE userId = ? AND usedAt IS NULL',
      [Date.now(), userId]
    );
    // Insert new token
    await conn.execute(
      'INSERT INTO password_reset_tokens (userId, token, expiresAt, createdAt) VALUES (?, ?, ?, ?)',
      [userId, token, Date.now() + RESET_TOKEN_TTL_MS, Date.now()]
    );
  } finally {
    await conn.end();
  }
}

/**
 * Validate a reset token and return the userId if valid
 */
async function validateResetToken(token: string): Promise<number | null> {
  const mysql = await import('mysql2/promise');
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  try {
    const [rows] = await conn.execute(
      'SELECT userId, expiresAt, usedAt FROM password_reset_tokens WHERE token = ? LIMIT 1',
      [token]
    ) as any[];
    if (!rows || rows.length === 0) return null;
    const row = rows[0];
    if (row.usedAt) return null; // Already used
    if (Date.now() > row.expiresAt) return null; // Expired
    return row.userId;
  } finally {
    await conn.end();
  }
}

/**
 * Mark a reset token as used
 */
async function markTokenUsed(token: string): Promise<void> {
  const mysql = await import('mysql2/promise');
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  try {
    await conn.execute(
      'UPDATE password_reset_tokens SET usedAt = ? WHERE token = ?',
      [Date.now(), token]
    );
  } finally {
    await conn.end();
  }
}

/**
 * Register local authentication routes
 */
export function registerLocalAuthRoutes(app: Express) {

  // Register new user
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }

      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }

      const passwordHash = await hashPassword(password);

      const userId = await db.createLocalUser({
        email,
        name: name || null,
        passwordHash,
        loginMethod: 'local',
        role: 'user',
      });

      const sessionToken = createSessionToken(userId, email, name || null, 'user');
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, userId });
    } catch (error) {
      console.error('[LocalAuth] Registration failed', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login existing user
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await db.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      await db.updateUserLastSignedIn(user.id);

      const sessionToken = createSessionToken(user.id, user.email!, user.name, user.role);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        userId: user.id,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('[LocalAuth] Login failed', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.json({ success: true });
  });

  // Request password reset
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      const user = await db.getUserByEmail(email);
      if (!user) {
        // Security: don't reveal if email exists
        res.json({ success: true, message: 'Se o email existir, um link de recuperação será enviado.' });
        return;
      }

      // Generate a secure random token (not JWT — stored in DB for single-use validation)
      const resetToken = crypto.randomBytes(48).toString('hex');
      await storeResetToken(user.id, resetToken);

      // Build the reset URL
      const baseUrl = process.env.VITE_APP_URL || 'https://impact7plat-5ljsracn.manus.space';
      const resetUrl = `${baseUrl}/redefinir-senha?token=${resetToken}`;

      // Notify owner via Manus notification (fallback until Resend.com is configured)
      try {
        await notifyOwner({
          title: `🔑 Solicitação de recuperação de senha`,
          content: `O usuário ${user.email} (ID: ${user.id}) solicitou recuperação de senha.\n\nLink de reset (válido por 1 hora):\n${resetUrl}\n\nSe você não reconhece esta solicitação, ignore esta mensagem.`,
        });
      } catch (notifyError) {
        console.warn('[LocalAuth] Failed to notify owner about password reset:', notifyError);
      }

      console.log(`[LocalAuth] Password reset requested for ${email}. Reset URL: ${resetUrl}`);

      // Return the reset URL in development / when no email service is configured
      // In production with Resend.com configured (E4), this should NOT return the token
      const isDev = process.env.NODE_ENV !== 'production';
      res.json({
        success: true,
        message: 'Se o email existir, um link de recuperação será enviado.',
        ...(isDev ? { resetUrl } : {}),
      });
    } catch (error) {
      console.error('[LocalAuth] Forgot password failed', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  });

  // Validate reset token (GET — used by frontend to check if token is valid before showing form)
  app.get('/api/auth/validate-reset-token', async (req: Request, res: Response) => {
    try {
      const { token } = req.query as { token: string };
      if (!token) {
        res.status(400).json({ valid: false, error: 'Token is required' });
        return;
      }
      const userId = await validateResetToken(token);
      res.json({ valid: !!userId });
    } catch (error) {
      console.error('[LocalAuth] Validate reset token failed', error);
      res.status(500).json({ valid: false, error: 'Failed to validate token' });
    }
  });

  // Reset password with token
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: 'Token and new password are required' });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres' });
        return;
      }

      // Validate token from DB (single-use, time-limited)
      const userId = await validateResetToken(token);
      if (!userId) {
        res.status(401).json({ error: 'Token inválido ou expirado. Solicite um novo link.' });
        return;
      }

      // Hash new password
      const passwordHash = await hashPassword(newPassword);

      // Update password
      await db.updateUserPassword(userId, passwordHash);

      // Mark token as used (single-use enforcement)
      await markTokenUsed(token);

      console.log(`[LocalAuth] Password reset successful for userId: ${userId}`);
      res.json({ success: true, message: 'Senha atualizada com sucesso!' });
    } catch (error) {
      console.error('[LocalAuth] Reset password failed', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });
}
