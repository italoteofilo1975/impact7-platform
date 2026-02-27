/**
 * Blockchain Certificate Service
 * 
 * Provides blockchain-style certificate issuance and verification
 * for impact projects. Uses SHA-256 hashing for immutability and
 * chain verification.
 */

import { getDb } from '../db';
import { 
  impactCertificates, 
  impactTokens, 
  tokenTransactions,
  type ImpactCertificate, 
  type ImpactToken,
  type TokenTransaction 
} from '../../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import crypto from 'crypto';

export interface CertificateData {
  organizationName: string;
  projectName: string;
  projectDescription?: string;
  totalInvestment: number;
  beneficiaries: number;
  sRoi: number;
  impactScore: number;
  sector: string;
  sdgs?: number[];
}

export interface TokenData {
  name: string;
  description?: string;
  tokenType: 'impact_credit' | 'verification_badge' | 'achievement' | 'contribution';
  amount?: number;
  value?: number;
}

/**
 * Generate SHA-256 hash of data
 */
function generateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate unique certificate ID
 */
function generateCertificateId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  return `CERT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate unique token ID
 */
function generateTokenId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(6).toString('hex');
  return `SIT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Get the last certificate hash for chain linking
 */
async function getLastCertificateHash(): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const lastCert = await db
    .select({ dataHash: impactCertificates.dataHash })
    .from(impactCertificates)
    .orderBy(desc(impactCertificates.id))
    .limit(1);

  return lastCert[0]?.dataHash || null;
}

/**
 * Get current block number (simulated)
 */
async function getCurrentBlockNumber(): Promise<number> {
  const db = await getDb();
  if (!db) return 1;

  const result = await db
    .select({ maxBlock: sql<number>`COALESCE(MAX(${impactCertificates.blockNumber}), 0)` })
    .from(impactCertificates);

  return (result[0]?.maxBlock || 0) + 1;
}

/**
 * Issue a new impact certificate
 */
export async function issueCertificate(
  userId: number | null,
  data: CertificateData
): Promise<ImpactCertificate> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const certificateId = generateCertificateId();
  const previousHash = await getLastCertificateHash();
  const blockNumber = await getCurrentBlockNumber();

  // Create data string for hashing
  const dataString = JSON.stringify({
    certificateId,
    ...data,
    previousHash,
    blockNumber,
    timestamp: Date.now(),
  });

  const dataHash = generateHash(dataString);

  // Insert certificate
  const insertResult = await db.insert(impactCertificates).values({
    certificateId,
    userId,
    organizationName: data.organizationName,
    projectName: data.projectName,
    projectDescription: data.projectDescription,
    totalInvestment: data.totalInvestment,
    beneficiaries: data.beneficiaries,
    sRoi: data.sRoi,
    impactScore: data.impactScore,
    sector: data.sector,
    sdgs: data.sdgs ? JSON.stringify(data.sdgs) : null,
    previousHash,
    dataHash,
    blockNumber,
    verificationStatus: 'pending',
    issuedAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const certId = Number((insertResult as unknown as { insertId?: number | bigint }[])[0]?.insertId ?? 0);

  // Fetch and return the certificate
  const certs = await db
    .select()
    .from(impactCertificates)
    .where(eq(impactCertificates.id, certId))
    .limit(1);

  return certs[0];
}

/**
 * Verify a certificate by ID
 */
export async function verifyCertificate(
  certificateId: string
): Promise<{ valid: boolean; certificate: ImpactCertificate | null; chainValid: boolean }> {
  const db = await getDb();
  if (!db) return { valid: false, certificate: null, chainValid: false };

  const certs = await db
    .select()
    .from(impactCertificates)
    .where(eq(impactCertificates.certificateId, certificateId))
    .limit(1);

  if (certs.length === 0) {
    return { valid: false, certificate: null, chainValid: false };
  }

  const cert = certs[0];

  // Verify the certificate hasn't been revoked
  const isRevoked = cert.verificationStatus === 'revoked' as typeof cert.verificationStatus;
  if (isRevoked) {
    return { valid: false, certificate: cert, chainValid: false };
  }

  // Verify chain integrity (check if previous hash matches)
  let chainValid = true;
  if (cert.previousHash) {
    const prevCerts = await db
      .select()
      .from(impactCertificates)
      .where(eq(impactCertificates.dataHash, cert.previousHash))
      .limit(1);

    chainValid = prevCerts.length > 0;
  }

  return {
    valid: cert.verificationStatus !== 'revoked',
    certificate: cert,
    chainValid,
  };
}

/**
 * Verify certificate by admin
 */
export async function approveCertificate(
  certificateId: string,
  verifierId: number
): Promise<ImpactCertificate | null> {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(impactCertificates)
    .set({
      verificationStatus: 'verified',
      verifiedBy: verifierId,
      verifiedAt: Date.now(),
    })
    .where(eq(impactCertificates.certificateId, certificateId));

  const certs = await db
    .select()
    .from(impactCertificates)
    .where(eq(impactCertificates.certificateId, certificateId))
    .limit(1);

  return certs[0] || null;
}

/**
 * Revoke a certificate
 */
export async function revokeCertificate(
  certificateId: string,
  verifierId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(impactCertificates)
    .set({
      verificationStatus: 'revoked',
      verifiedBy: verifierId,
      verifiedAt: Date.now(),
    })
    .where(eq(impactCertificates.certificateId, certificateId));

  return true;
}

/**
 * Get all certificates for a user/organization
 */
export async function getUserCertificates(
  userId: number,
  limit: number = 20
): Promise<ImpactCertificate[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(impactCertificates)
    .where(eq(impactCertificates.userId, userId))
    .orderBy(desc(impactCertificates.issuedAt))
    .limit(limit);
}

/**
 * Get public certificates (verified only)
 */
export async function getPublicCertificates(
  limit: number = 50
): Promise<ImpactCertificate[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(impactCertificates)
    .where(eq(impactCertificates.verificationStatus, 'verified'))
    .orderBy(desc(impactCertificates.issuedAt))
    .limit(limit);
}

// ============ TOKEN FUNCTIONS ============

/**
 * Mint a new impact token
 */
export async function mintToken(
  userId: number | null,
  organizationId: number | null,
  certificateId: number | null,
  data: TokenData
): Promise<ImpactToken> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const tokenId = generateTokenId();

  // Create transaction hash
  const transactionData = JSON.stringify({
    tokenId,
    type: 'mint',
    userId,
    organizationId,
    certificateId,
    ...data,
    timestamp: Date.now(),
  });
  const transactionHash = generateHash(transactionData);

  // Insert token
  const insertResult = await db.insert(impactTokens).values({
    tokenId,
    userId,
    organizationId,
    certificateId,
    tokenType: data.tokenType,
    amount: data.amount ?? 1,
    value: data.value ?? 0,
    name: data.name,
    description: data.description,
    status: 'active',
    mintedAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const newTokenId = Number((insertResult as unknown as { insertId?: number | bigint }[])[0]?.insertId ?? 0);

  // Record mint transaction
  await db.insert(tokenTransactions).values({
    tokenId: newTokenId,
    transactionType: 'mint',
    toUserId: userId,
    amount: data.amount ?? 1,
    transactionHash,
    createdAt: Date.now(),
  });

  // Fetch and return the token
  const tokens = await db
    .select()
    .from(impactTokens)
    .where(eq(impactTokens.id, newTokenId))
    .limit(1);

  return tokens[0];
}

/**
 * Transfer a token to another user
 */
export async function transferToken(
  tokenId: number,
  fromUserId: number,
  toUserId: number
): Promise<ImpactToken | null> {
  const db = await getDb();
  if (!db) return null;

  // Get current token
  const tokens = await db
    .select()
    .from(impactTokens)
    .where(
      and(
        eq(impactTokens.id, tokenId),
        eq(impactTokens.userId, fromUserId),
        eq(impactTokens.status, 'active')
      )
    )
    .limit(1);

  if (tokens.length === 0) return null;

  const token = tokens[0];

  // Get previous transaction hash
  const prevTransactions = await db
    .select()
    .from(tokenTransactions)
    .where(eq(tokenTransactions.tokenId, tokenId))
    .orderBy(desc(tokenTransactions.id))
    .limit(1);

  const previousTransactionHash = prevTransactions[0]?.transactionHash || null;

  // Create new transaction hash
  const transactionData = JSON.stringify({
    tokenId: token.tokenId,
    type: 'transfer',
    fromUserId,
    toUserId,
    previousTransactionHash,
    timestamp: Date.now(),
  });
  const transactionHash = generateHash(transactionData);

  // Update token ownership
  await db
    .update(impactTokens)
    .set({
      userId: toUserId,
      previousOwner: fromUserId,
      transferCount: sql`${impactTokens.transferCount} + 1`,
    })
    .where(eq(impactTokens.id, tokenId));

  // Record transfer transaction
  await db.insert(tokenTransactions).values({
    tokenId,
    transactionType: 'transfer',
    fromUserId,
    toUserId,
    amount: token.amount,
    transactionHash,
    previousTransactionHash,
    createdAt: Date.now(),
  });

  // Fetch and return updated token
  const updatedTokens = await db
    .select()
    .from(impactTokens)
    .where(eq(impactTokens.id, tokenId))
    .limit(1);

  return updatedTokens[0] || null;
}

/**
 * Get user's tokens
 */
export async function getUserTokens(
  userId: number,
  limit: number = 50
): Promise<ImpactToken[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(impactTokens)
    .where(
      and(
        eq(impactTokens.userId, userId),
        eq(impactTokens.status, 'active')
      )
    )
    .orderBy(desc(impactTokens.mintedAt))
    .limit(limit);
}

/**
 * Get token transaction history
 */
export async function getTokenTransactions(
  tokenId: number
): Promise<TokenTransaction[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(tokenTransactions)
    .where(eq(tokenTransactions.tokenId, tokenId))
    .orderBy(desc(tokenTransactions.createdAt));
}

/**
 * Get organization token stats
 */
export async function getOrganizationTokenStats(
  organizationId: number
): Promise<{ totalTokens: number; totalValue: number; byType: Record<string, number> }> {
  const db = await getDb();
  if (!db) return { totalTokens: 0, totalValue: 0, byType: {} };

  const tokens = await db
    .select()
    .from(impactTokens)
    .where(
      and(
        eq(impactTokens.organizationId, organizationId),
        eq(impactTokens.status, 'active')
      )
    );

  const byType: Record<string, number> = {};
  let totalValue = 0;

  tokens.forEach((token: ImpactToken) => {
    byType[token.tokenType] = (byType[token.tokenType] || 0) + token.amount;
    totalValue += token.value;
  });

  return {
    totalTokens: tokens.length,
    totalValue,
    byType,
  };
}

export default {
  // Certificate functions
  issueCertificate,
  verifyCertificate,
  approveCertificate,
  revokeCertificate,
  getUserCertificates,
  getPublicCertificates,
  
  // Token functions
  mintToken,
  transferToken,
  getUserTokens,
  getTokenTransactions,
  getOrganizationTokenStats,
  
  // Utility functions
  generateHash,
};
