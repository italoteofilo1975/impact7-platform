import { TOTP, generateSecret as otpGenerateSecret, verify as otpVerify, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { createHash, randomBytes } from 'crypto';
import { getDb } from '../db';
import { twoFactorAuth, twoFactorSessions, users } from '../../drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';

// Create TOTP instance with configuration
const totp = new TOTP({
  digits: 6,
  period: 30, // 30 seconds
});

const APP_NAME = 'IMPACT7';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes for 2FA verification
const BACKUP_CODES_COUNT = 10;

/**
 * Generate a new TOTP secret for a user
 */
export async function generateSecret(userId: number): Promise<{
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Check if user exists
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    throw new Error('User not found');
  }

  // Generate new secret
  const secret = otpGenerateSecret();
  
  // Generate backup codes
  const backupCodes = generateBackupCodes();
  const hashedBackupCodes = backupCodes.map(code => hashCode(code));

  // Create OTP auth URL for QR code
  const accountName = user.email || user.name || `user_${userId}`;
  const otpAuthUrl = generateURI({
    secret,
    issuer: APP_NAME,
    label: accountName,
    algorithm: 'sha1',
    digits: 6,
    period: 30,
  });

  // Generate QR code as data URL
  const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl, {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  // Check if 2FA record exists
  const [existing] = await db.select().from(twoFactorAuth).where(eq(twoFactorAuth.userId, userId)).limit(1);

  if (existing) {
    // Update existing record
    await db.update(twoFactorAuth)
      .set({
        secret,
        backupCodes: JSON.stringify(hashedBackupCodes),
        backupCodesUsed: 0,
        isVerified: false,
        isEnabled: false,
        failedAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(twoFactorAuth.userId, userId));
  } else {
    // Create new record
    await db.insert(twoFactorAuth).values({
      userId,
      secret,
      backupCodes: JSON.stringify(hashedBackupCodes),
      isEnabled: false,
      isVerified: false,
    });
  }

  return {
    secret,
    qrCodeUrl,
    backupCodes,
  };
}

/**
 * Verify a TOTP code and enable 2FA
 */
export async function verifyAndEnable(userId: number, code: string): Promise<{
  success: boolean;
  message: string;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const [tfa] = await db.select().from(twoFactorAuth).where(eq(twoFactorAuth.userId, userId)).limit(1);

  if (!tfa) {
    return { success: false, message: '2FA not configured. Please setup first.' };
  }

  // Check if locked out
  if (tfa.lockedUntil && new Date(tfa.lockedUntil) > new Date()) {
    const remainingMinutes = Math.ceil((new Date(tfa.lockedUntil).getTime() - Date.now()) / 60000);
    return { success: false, message: `Account locked. Try again in ${remainingMinutes} minutes.` };
  }

  // Verify the code
  const isValid = otpVerify({ token: code, secret: tfa.secret });

  if (!isValid) {
    // Increment failed attempts
    const newFailedAttempts = tfa.failedAttempts + 1;
    const updates: Record<string, unknown> = {
      failedAttempts: newFailedAttempts,
    };

    // Lock account if too many failed attempts
    if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    }

    await db.update(twoFactorAuth)
      .set(updates)
      .where(eq(twoFactorAuth.userId, userId));

    return { 
      success: false, 
      message: `Invalid code. ${MAX_FAILED_ATTEMPTS - newFailedAttempts} attempts remaining.` 
    };
  }

  // Enable 2FA
  await db.update(twoFactorAuth)
    .set({
      isEnabled: true,
      isVerified: true,
      failedAttempts: 0,
      lockedUntil: null,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(twoFactorAuth.userId, userId));

  return { success: true, message: '2FA enabled successfully.' };
}

/**
 * Verify a TOTP code during login
 */
export async function verifyCode(userId: number, code: string): Promise<{
  success: boolean;
  message: string;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const [tfa] = await db.select().from(twoFactorAuth).where(eq(twoFactorAuth.userId, userId)).limit(1);

  if (!tfa || !tfa.isEnabled) {
    return { success: true, message: '2FA not enabled.' };
  }

  // Check if locked out
  if (tfa.lockedUntil && new Date(tfa.lockedUntil) > new Date()) {
    const remainingMinutes = Math.ceil((new Date(tfa.lockedUntil).getTime() - Date.now()) / 60000);
    return { success: false, message: `Account locked. Try again in ${remainingMinutes} minutes.` };
  }

  // First try TOTP code
  const verifyResult = await otpVerify({ token: code, secret: tfa.secret });
  // VerifyResult can be null (invalid) or an object with delta (valid)
  let isValid = verifyResult !== null;

  // If TOTP fails, try backup codes
  if (!isValid && tfa.backupCodes) {
    const hashedCode = hashCode(code);
    const backupCodes: string[] = JSON.parse(tfa.backupCodes);
    const codeIndex = backupCodes.indexOf(hashedCode);

    if (codeIndex !== -1) {
      // Remove used backup code
      backupCodes.splice(codeIndex, 1);
      await db.update(twoFactorAuth)
        .set({
          backupCodes: JSON.stringify(backupCodes),
          backupCodesUsed: tfa.backupCodesUsed + 1,
          updatedAt: new Date(),
        })
        .where(eq(twoFactorAuth.userId, userId));
      
      isValid = true as boolean;
    }
  }

  if (!isValid) {
    // Increment failed attempts
    const newFailedAttempts = tfa.failedAttempts + 1;
    const updates: Record<string, unknown> = {
      failedAttempts: newFailedAttempts,
    };

    if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    }

    await db.update(twoFactorAuth)
      .set(updates)
      .where(eq(twoFactorAuth.userId, userId));

    return { 
      success: false, 
      message: `Invalid code. ${MAX_FAILED_ATTEMPTS - newFailedAttempts} attempts remaining.` 
    };
  }

  // Reset failed attempts on success
  await db.update(twoFactorAuth)
    .set({
      failedAttempts: 0,
      lockedUntil: null,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(twoFactorAuth.userId, userId));

  return { success: true, message: 'Code verified successfully.' };
}

/**
 * Disable 2FA for a user
 */
export async function disable2FA(userId: number, code: string): Promise<{
  success: boolean;
  message: string;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Verify code first
  const verification = await verifyCode(userId, code);
  if (!verification.success) {
    return verification;
  }

  // Disable 2FA
  await db.update(twoFactorAuth)
    .set({
      isEnabled: false,
      isVerified: false,
      secret: otpGenerateSecret(), // Generate new secret to invalidate old one
      backupCodes: null,
      backupCodesUsed: 0,
      updatedAt: new Date(),
    })
    .where(eq(twoFactorAuth.userId, userId));

  return { success: true, message: '2FA disabled successfully.' };
}

/**
 * Get 2FA status for a user
 */
export async function getStatus(userId: number): Promise<{
  isEnabled: boolean;
  isVerified: boolean;
  backupCodesRemaining: number;
  lastUsedAt: Date | null;
}> {
  const db = await getDb();
  if (!db) {
    return {
      isEnabled: false,
      isVerified: false,
      backupCodesRemaining: 0,
      lastUsedAt: null,
    };
  }

  const [tfa] = await db.select().from(twoFactorAuth).where(eq(twoFactorAuth.userId, userId)).limit(1);

  if (!tfa) {
    return {
      isEnabled: false,
      isVerified: false,
      backupCodesRemaining: 0,
      lastUsedAt: null,
    };
  }

  const backupCodes: string[] = tfa.backupCodes ? JSON.parse(tfa.backupCodes) : [];

  return {
    isEnabled: tfa.isEnabled,
    isVerified: tfa.isVerified,
    backupCodesRemaining: backupCodes.length,
    lastUsedAt: tfa.lastUsedAt,
  };
}

/**
 * Check if user has 2FA enabled
 */
export async function is2FAEnabled(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [tfa] = await db.select().from(twoFactorAuth).where(eq(twoFactorAuth.userId, userId)).limit(1);

  return tfa?.isEnabled ?? false;
}

/**
 * Create a 2FA verification session
 */
export async function createVerificationSession(userId: number, ipAddress?: string, userAgent?: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const sessionToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

  await db.insert(twoFactorSessions).values({
    userId,
    sessionToken,
    expiresAt,
    ipAddress,
    userAgent,
  });

  return sessionToken;
}

/**
 * Verify a 2FA session
 */
export async function verifySession(sessionToken: string): Promise<{
  valid: boolean;
  userId?: number;
}> {
  const db = await getDb();
  if (!db) return { valid: false };

  const [session] = await db.select()
    .from(twoFactorSessions)
    .where(and(
      eq(twoFactorSessions.sessionToken, sessionToken),
      gt(twoFactorSessions.expiresAt, new Date()),
    ))
    .limit(1);

  if (!session) {
    return { valid: false };
  }

  return { valid: true, userId: session.userId };
}

/**
 * Mark a 2FA session as verified
 */
export async function markSessionVerified(sessionToken: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(twoFactorSessions)
    .set({
      isVerified: true,
      verifiedAt: new Date(),
    })
    .where(eq(twoFactorSessions.sessionToken, sessionToken));
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(userId: number, code: string): Promise<{
  success: boolean;
  backupCodes?: string[];
  message: string;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Verify current code first
  const verification = await verifyCode(userId, code);
  if (!verification.success) {
    return { success: false, message: verification.message };
  }

  // Generate new backup codes
  const backupCodes = generateBackupCodes();
  const hashedBackupCodes = backupCodes.map(code => hashCode(code));

  await db.update(twoFactorAuth)
    .set({
      backupCodes: JSON.stringify(hashedBackupCodes),
      backupCodesUsed: 0,
      updatedAt: new Date(),
    })
    .where(eq(twoFactorAuth.userId, userId));

  return {
    success: true,
    backupCodes,
    message: 'Backup codes regenerated successfully.',
  };
}

// Helper functions

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    // Generate 8-character alphanumeric code
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

function hashCode(code: string): string {
  return createHash('sha256').update(code.toUpperCase()).digest('hex');
}

export const twoFactorAuthService = {
  generateSecret,
  verifyAndEnable,
  verifyCode,
  disable2FA,
  getStatus,
  is2FAEnabled,
  createVerificationSession,
  verifySession,
  markSessionVerified,
  regenerateBackupCodes,
};
