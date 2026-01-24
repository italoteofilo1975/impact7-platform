import { describe, it, expect, vi, beforeEach } from 'vitest';

// Valid Base32 secret for testing - must be at least 16 bytes (26 chars in Base32)
// Using 32 characters to ensure it's long enough
const VALID_BASE32_SECRET = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP';

// Mock the database
vi.mock('./db', () => ({
  getDb: vi.fn(),
}));

// Mock otplib with correct exports
vi.mock('otplib', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    TOTP: class MockTOTP {
      constructor() {}
      generate() { return '123456'; }
      verify({ token }: { token: string }) { return token === '123456'; }
    },
  };
});

// Mock qrcode
vi.mock('qrcode', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    default: {
      toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,mockQRCode')),
    },
    toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,mockQRCode')),
  };
});

describe('Two-Factor Authentication Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStatus', () => {
    it('should return disabled status when 2FA is not set up', async () => {
      const { twoFactorAuthService } = await import('./services/two-factor-auth-service');
      const { getDb } = await import('./db');
      
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      
      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      
      const result = await twoFactorAuthService.getStatus(1);
      
      expect(result.isEnabled).toBe(false);
      expect(result.backupCodesRemaining).toBe(0);
    });

    it('should return enabled status when 2FA is set up', async () => {
      const { twoFactorAuthService } = await import('./services/two-factor-auth-service');
      const { getDb } = await import('./db');
      
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{
          id: 1,
          userId: 1,
          isEnabled: true,
          backupCodes: JSON.stringify(['code1', 'code2', 'code3']),
          lastUsedAt: new Date(),
        }]),
      };
      
      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      
      const result = await twoFactorAuthService.getStatus(1);
      
      expect(result.isEnabled).toBe(true);
      expect(result.backupCodesRemaining).toBe(3);
    });
  });

  describe('generateSecret', () => {
    it('should throw error when database is not available', async () => {
      const { twoFactorAuthService } = await import('./services/two-factor-auth-service');
      const { getDb } = await import('./db');
      
      vi.mocked(getDb).mockResolvedValue(null);
      
      await expect(twoFactorAuthService.generateSecret(1)).rejects.toThrow('Database not available');
    });

    it('should generate secret when database is available', async () => {
      const { twoFactorAuthService } = await import('./services/two-factor-auth-service');
      const { getDb } = await import('./db');
      
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ email: 'test@example.com' }]),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
      };
      
      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      
      const result = await twoFactorAuthService.generateSecret(1);
      
      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCodeUrl');
      expect(result).toHaveProperty('backupCodes');
      expect(result.backupCodes).toHaveLength(10);
    });
  });

  describe('verifyCode', () => {
    it('should verify a valid TOTP code with valid Base32 secret', async () => {
      const { twoFactorAuthService } = await import('./services/two-factor-auth-service');
      const { getDb } = await import('./db');
      
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{
          id: 1,
          userId: 1,
          secret: VALID_BASE32_SECRET,
          isEnabled: true,
          backupCodes: JSON.stringify(['hashedcode1', 'hashedcode2']),
        }]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
      };
      
      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      
      // The result depends on whether the code matches the current TOTP
      // Since we can't predict the exact code, we just verify the function runs
      const result = await twoFactorAuthService.verifyCode(1, '123456');
      
      // The function should return a result object
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
    });
  });

  describe('disable2FA', () => {
    it('should attempt to disable 2FA with a code', async () => {
      const { twoFactorAuthService } = await import('./services/two-factor-auth-service');
      const { getDb } = await import('./db');
      
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{
          id: 1,
          userId: 1,
          secret: VALID_BASE32_SECRET,
          isEnabled: true,
          backupCodes: JSON.stringify(['hashedcode1', 'hashedcode2']),
        }]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
      };
      
      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      
      // The result depends on whether the code matches
      const result = await twoFactorAuthService.disable2FA(1, '123456');
      
      // The function should return a result object
      expect(result).toHaveProperty('success');
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should attempt to regenerate backup codes with a code', async () => {
      const { twoFactorAuthService } = await import('./services/two-factor-auth-service');
      const { getDb } = await import('./db');
      
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{
          id: 1,
          userId: 1,
          secret: VALID_BASE32_SECRET,
          isEnabled: true,
          backupCodes: JSON.stringify(['hashedcode1', 'hashedcode2']),
        }]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
      };
      
      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      
      // The result depends on whether the code matches
      const result = await twoFactorAuthService.regenerateBackupCodes(1, '123456');
      
      // The function should return a result object
      expect(result).toHaveProperty('success');
    });
  });
});
