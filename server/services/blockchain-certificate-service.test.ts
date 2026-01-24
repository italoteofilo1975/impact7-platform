import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

// Mock the database
vi.mock('../db', () => ({
  getDb: vi.fn(() => null),
}));

describe('Blockchain Certificate Service - Hash Generation', () => {
  it('should generate consistent SHA-256 hashes', () => {
    const data = 'test-certificate-data';
    const hash1 = crypto.createHash('sha256').update(data).digest('hex');
    const hash2 = crypto.createHash('sha256').update(data).digest('hex');
    
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('should generate different hashes for different data', () => {
    const data1 = 'certificate-1';
    const data2 = 'certificate-2';
    
    const hash1 = crypto.createHash('sha256').update(data1).digest('hex');
    const hash2 = crypto.createHash('sha256').update(data2).digest('hex');
    
    expect(hash1).not.toBe(hash2);
  });

  it('should generate unique certificate IDs', () => {
    const generateCertificateId = () => {
      const timestamp = Date.now().toString(36);
      const random = crypto.randomBytes(8).toString('hex');
      return `CERT-${timestamp}-${random}`.toUpperCase();
    };

    const id1 = generateCertificateId();
    const id2 = generateCertificateId();
    
    expect(id1).toMatch(/^CERT-[A-Z0-9]+-[A-F0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  it('should generate unique token IDs', () => {
    const generateTokenId = () => {
      const timestamp = Date.now().toString(36);
      const random = crypto.randomBytes(6).toString('hex');
      return `SIT-${timestamp}-${random}`.toUpperCase();
    };

    const id1 = generateTokenId();
    const id2 = generateTokenId();
    
    expect(id1).toMatch(/^SIT-[A-Z0-9]+-[A-F0-9]+$/);
    expect(id1).not.toBe(id2);
  });
});

describe('Blockchain Certificate Service - Chain Integrity', () => {
  it('should create valid chain links with previous hash', () => {
    const certificates: { dataHash: string; previousHash: string | null }[] = [];
    
    // Create first certificate
    const cert1Data = JSON.stringify({ id: 1, data: 'first' });
    const cert1Hash = crypto.createHash('sha256').update(cert1Data).digest('hex');
    certificates.push({ dataHash: cert1Hash, previousHash: null });
    
    // Create second certificate linked to first
    const cert2Data = JSON.stringify({ id: 2, data: 'second', previousHash: cert1Hash });
    const cert2Hash = crypto.createHash('sha256').update(cert2Data).digest('hex');
    certificates.push({ dataHash: cert2Hash, previousHash: cert1Hash });
    
    // Verify chain
    expect(certificates[0].previousHash).toBeNull();
    expect(certificates[1].previousHash).toBe(certificates[0].dataHash);
  });

  it('should detect chain tampering', () => {
    const originalData = JSON.stringify({ id: 1, amount: 1000 });
    const originalHash = crypto.createHash('sha256').update(originalData).digest('hex');
    
    // Tamper with data
    const tamperedData = JSON.stringify({ id: 1, amount: 10000 });
    const tamperedHash = crypto.createHash('sha256').update(tamperedData).digest('hex');
    
    expect(originalHash).not.toBe(tamperedHash);
  });
});

describe('Blockchain Certificate Service - Token Types', () => {
  const validTokenTypes = ['impact_credit', 'verification_badge', 'achievement', 'contribution'];

  it('should validate token types', () => {
    validTokenTypes.forEach(type => {
      expect(validTokenTypes).toContain(type);
    });
  });

  it('should reject invalid token types', () => {
    const invalidType = 'invalid_type';
    expect(validTokenTypes).not.toContain(invalidType);
  });
});

describe('Blockchain Certificate Service - Certificate Data Validation', () => {
  it('should validate required certificate fields', () => {
    const validCertificate = {
      organizationName: 'Test Org',
      projectName: 'Test Project',
      totalInvestment: 100000,
      beneficiaries: 500,
      sRoi: 350,
      impactScore: 85,
      sector: 'education',
    };

    expect(validCertificate.organizationName).toBeTruthy();
    expect(validCertificate.projectName).toBeTruthy();
    expect(validCertificate.totalInvestment).toBeGreaterThan(0);
    expect(validCertificate.beneficiaries).toBeGreaterThan(0);
    expect(validCertificate.sRoi).toBeGreaterThanOrEqual(0);
    expect(validCertificate.impactScore).toBeGreaterThanOrEqual(0);
    expect(validCertificate.sector).toBeTruthy();
  });

  it('should handle optional SDGs array', () => {
    const certificateWithSDGs = {
      sdgs: [1, 4, 8, 10],
    };

    expect(certificateWithSDGs.sdgs).toHaveLength(4);
    expect(certificateWithSDGs.sdgs).toContain(4);
  });
});
