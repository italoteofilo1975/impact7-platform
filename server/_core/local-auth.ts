/**
 * Local Authentication Service
 * 
 * Provides email + password authentication without external OAuth providers.
 * Uses bcrypt for password hashing and JWT for session management.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Express, Request, Response } from 'express';
import * as db from '../db';
import { getSessionCookieOptions } from './cookies';
import { ENV } from './env';

const COOKIE_NAME = 'session';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

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
    expiresIn: '365d', // 1 year
  });
}

/**
 * Verify and decode a JWT session token
 */
export function verifySessionToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, ENV.jwtSecret) as JWTPayload;
  } catch (error) {
    return null;
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
      
      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }
      
      // Hash password
      const passwordHash = await hashPassword(password);
      
      // Create user
      const userId = await db.createLocalUser({
        email,
        name: name || null,
        passwordHash,
        loginMethod: 'local',
        role: 'user',
      });
      
      // Create session token
      const sessionToken = createSessionToken(userId, email, name || null, 'user');
      
      // Set cookie
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
      
      // Get user by email
      const user = await db.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }
      
      // Verify password
      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }
      
      // Update last signed in
      await db.updateUserLastSignedIn(user.id);
      
      // Create session token
      const sessionToken = createSessionToken(user.id, user.email!, user.name, user.role);
      
      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      
      res.json({ success: true, userId: user.id });
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
        // Don't reveal if email exists
        res.json({ success: true, message: 'If the email exists, a reset link will be sent' });
        return;
      }
      
      // Generate reset token (valid for 1 hour)
      const resetToken = jwt.sign({ userId: user.id, email: user.email }, ENV.jwtSecret, {
        expiresIn: '1h',
      });
      
      // TODO: Send email with reset link
      // For now, just return the token (in production, send via email)
      console.log(`[LocalAuth] Password reset token for ${email}: ${resetToken}`);
      
      res.json({ 
        success: true, 
        message: 'If the email exists, a reset link will be sent',
        // Remove this in production:
        resetToken,
      });
    } catch (error) {
      console.error('[LocalAuth] Forgot password failed', error);
      res.status(500).json({ error: 'Failed to process request' });
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
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }
      
      // Verify token
      const payload = verifySessionToken(token);
      if (!payload || !payload.userId) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }
      
      // Hash new password
      const passwordHash = await hashPassword(newPassword);
      
      // Update password
      await db.updateUserPassword(payload.userId, passwordHash);
      
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('[LocalAuth] Reset password failed', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });
}
