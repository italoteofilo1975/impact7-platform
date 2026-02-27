import { getDb } from "../../db";
import { referrals } from "../../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export const referralService = {
  /**
   * Generate a unique referral code for a user
   */
  async generateReferralCode(userId: number): Promise<string> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const code = nanoid(8).toUpperCase();
    
    // Check if user already has a referral entry
    const existing = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .limit(1);
    
    if (existing.length === 0) {
      // Create initial referral entry for tracking
      await db.insert(referrals).values({
        referrerId: userId,
        referrerCode: code,
        status: "pending",
        invitedAt: Date.now(),
      });
      return code;
    }
    
    return existing[0].referrerCode;
  },

  /**
   * Get referral code for a user
   */
  async getReferralCode(userId: number): Promise<string | null> {
    const db = await getDb();
    if (!db) return null;
    
    const result = await db
      .select({ code: referrals.referrerCode })
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .limit(1);
    
    return result.length > 0 ? result[0].code : null;
  },

  /**
   * Track a referral invitation
   */
  async trackInvitation(referrerCode: string, referredEmail: string): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;
    
    // Find the referrer
    const referrer = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerCode, referrerCode))
      .limit(1);
    
    if (referrer.length === 0) return false;
    
    // Check if this email was already invited
    const existing = await db
      .select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referrerCode, referrerCode),
          eq(referrals.referredEmail, referredEmail)
        )
      )
      .limit(1);
    
    if (existing.length > 0) return false;
    
    // Create new referral tracking
    await db.insert(referrals).values({
      referrerId: referrer[0].referrerId,
      referrerCode: referrerCode,
      referredEmail: referredEmail,
      status: "pending",
      referrerRewardType: "tokens",
      referrerRewardAmount: 100,
      referredRewardType: "discount",
      referredRewardAmount: 10,
      invitedAt: Date.now(),
    });
    
    return true;
  },

  /**
   * Mark referral as signed up
   */
  async markSignedUp(referredEmail: string, referredUserId: number): Promise<void> {
    const db = await getDb();
    if (!db) return;
    
    await db
      .update(referrals)
      .set({
        referredId: referredUserId,
        status: "signed_up",
        signedUpAt: Date.now(),
      })
      .where(
        and(
          eq(referrals.referredEmail, referredEmail),
          eq(referrals.status, "pending")
        )
      );
  },

  /**
   * Mark referral as converted (paid subscription)
   */
  async markConverted(referredUserId: number): Promise<void> {
    const db = await getDb();
    if (!db) return;
    
    await db
      .update(referrals)
      .set({
        status: "converted",
        convertedAt: Date.now(),
      })
      .where(
        and(
          eq(referrals.referredId, referredUserId),
          eq(referrals.status, "signed_up")
        )
      );
  },

  /**
   * Get referral stats for a user
   */
  async getStats(userId: number) {
    const db = await getDb();
    if (!db) return { total: 0, pending: 0, signedUp: 0, converted: 0, rewarded: 0, totalTokensEarned: 0 };
    
    const stats = await db
      .select({
        total: sql<number>`COUNT(*)`,
        pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
        signedUp: sql<number>`SUM(CASE WHEN status = 'signed_up' THEN 1 ELSE 0 END)`,
        converted: sql<number>`SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END)`,
        rewarded: sql<number>`SUM(CASE WHEN status = 'rewarded' THEN 1 ELSE 0 END)`,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));
    
    return stats[0] || { total: 0, pending: 0, signedUp: 0, converted: 0, rewarded: 0, totalTokensEarned: 0 };
  },

  /**
   * Get referral history for a user
   */
  async getHistory(userId: number, limit = 50) {
    const db = await getDb();
    if (!db) return [];
    
    return db
      .select({
        id: referrals.id,
        referredEmail: referrals.referredEmail,
        status: referrals.status,
        rewardType: referrals.referrerRewardType,
        rewardAmount: referrals.referrerRewardAmount,
        rewardApplied: referrals.referrerRewardApplied,
        invitedAt: referrals.invitedAt,
        signedUpAt: referrals.signedUpAt,
        convertedAt: referrals.convertedAt,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(sql`${referrals.invitedAt} DESC`)
      .limit(limit);
  },

  /**
   * Validate referral code
   */
  async validateCode(code: string): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;
    
    const result = await db
      .select({ id: referrals.id })
      .from(referrals)
      .where(eq(referrals.referrerCode, code))
      .limit(1);
    
    return result.length > 0;
  },
};
