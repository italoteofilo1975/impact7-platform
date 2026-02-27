import { getDb } from "../../db";
import { featureFlags, users } from "../../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

export const featureFlagService = {
  /**
   * Check if a feature is enabled for a user
   */
  async isEnabled(flagKey: string, userId?: number, userRole?: string, userPlan?: string): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;
    
    const flags = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.key, flagKey))
      .limit(1);
    
    if (flags.length === 0) return false;
    
    const flag = flags[0];
    
    // Check if globally disabled
    if (!flag.isEnabled) return false;
    
    // Check expiration
    if (flag.expiresAt && new Date(flag.expiresAt) < new Date()) return false;
    
    // Check target users
    if (flag.targetUserIds && userId) {
      const targetUsers = JSON.parse(flag.targetUserIds) as number[];
      if (targetUsers.includes(userId)) return true;
    }
    
    // Check target roles
    if (flag.targetRoles && userRole) {
      const targetRoles = JSON.parse(flag.targetRoles) as string[];
      if (targetRoles.includes(userRole)) return true;
    }
    
    // Check target plans
    if (flag.targetPlans && userPlan) {
      const targetPlans = JSON.parse(flag.targetPlans) as string[];
      if (targetPlans.includes(userPlan)) return true;
    }
    
    // Check rollout percentage
    if (flag.rolloutPercentage !== null && flag.rolloutPercentage > 0) {
      if (userId) {
        // Deterministic rollout based on user ID
        const hash = userId % 100;
        return hash < flag.rolloutPercentage;
      }
      // Random rollout for anonymous users
      return Math.random() * 100 < flag.rolloutPercentage;
    }
    
    // If no specific targeting, check if globally enabled
    return !!flag.isEnabled && !flag.targetUserIds && !flag.targetRoles && !flag.targetPlans;
  },

  /**
   * Get variant for A/B test
   */
  async getVariant(flagKey: string, userId?: number): Promise<string | null> {
    const db = await getDb();
    if (!db) return null;
    
    const flags = await db
      .select()
      .from(featureFlags)
      .where(and(eq(featureFlags.key, flagKey), eq(featureFlags.isExperiment, 1)))
      .limit(1);
    
    if (flags.length === 0 || !flags[0].variants) return null;
    
    const flag = flags[0];
    if (!flag.isEnabled) return null;
    
    const variants = JSON.parse(flag.variants || '[]') as { name: string; weight: number }[];
    
    // Deterministic variant assignment based on user ID
    if (userId) {
      const hash = userId % 100;
      let cumulative = 0;
      for (const variant of variants) {
        cumulative += variant.weight;
        if (hash < cumulative) return variant.name;
      }
    }
    
    // Random assignment for anonymous users
    const random = Math.random() * 100;
    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.weight;
      if (random < cumulative) return variant.name;
    }
    
    return variants[0]?.name || null;
  },

  /**
   * Create or update a feature flag
   */
  async upsertFlag(data: {
    key: string;
    name: string;
    description?: string;
    isEnabled?: boolean;
    rolloutPercentage?: number;
    targetUserIds?: number[];
    targetRoles?: string[];
    targetPlans?: string[];
    isExperiment?: boolean;
    variants?: { name: string; weight: number }[];
    expiresAt?: Date;
  }) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const existing = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.key, data.key))
      .limit(1);
    
    const values = {
      key: data.key,
      name: data.name,
      description: data.description,
      isEnabled: data.isEnabled ? 1 : 0,
      rolloutPercentage: data.rolloutPercentage ?? 0,
      targetUserIds: data.targetUserIds ? JSON.stringify(data.targetUserIds) : null,
      targetRoles: data.targetRoles ? JSON.stringify(data.targetRoles) : null,
      targetPlans: data.targetPlans ? JSON.stringify(data.targetPlans) : null,
      isExperiment: data.isExperiment ? 1 : 0,
      variants: data.variants ? JSON.stringify(data.variants) : null,
      expiresAt: data.expiresAt ? (data.expiresAt instanceof Date ? data.expiresAt.getTime() : data.expiresAt) : null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    if (existing.length > 0) {
      await db
        .update(featureFlags)
        .set(values)
        .where(eq(featureFlags.key, data.key));
      return existing[0].id;
    } else {
      const result = await db.insert(featureFlags).values(values);
      const rawResult = result as unknown as { insertId?: number | bigint }[];
      return typeof rawResult[0]?.insertId === 'bigint' ? Number(rawResult[0].insertId) : (rawResult[0]?.insertId ?? 0);
    }
  },

  /**
   * Delete a feature flag
   */
  async deleteFlag(key: string): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;
    
    await db.delete(featureFlags).where(eq(featureFlags.key, key));
    return true;
  },

  /**
   * Get all feature flags
   */
  async getAllFlags() {
    const db = await getDb();
    if (!db) return [];
    
    return db.select().from(featureFlags).orderBy(featureFlags.name);
  },

  /**
   * Get flag by key
   */
  async getFlag(key: string) {
    const db = await getDb();
    if (!db) return null;
    
    const flags = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.key, key))
      .limit(1);
    
    return flags.length > 0 ? flags[0] : null;
  },
};
