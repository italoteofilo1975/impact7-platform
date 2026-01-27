import { getDb } from "../../db";
import { conversionEvents } from "../../../drizzle/schema";
import { eq, and, sql, gte, lte, desc } from "drizzle-orm";

type EventType = 
  | "page_view" | "signup" | "login" | "calculator_start" | "calculator_complete"
  | "whitepaper_download" | "contact_form" | "pricing_view" | "checkout_start"
  | "checkout_complete" | "subscription_start" | "subscription_cancel"
  | "case_submit" | "case_approve" | "certificate_view" | "certificate_download";

export const conversionService = {
  /**
   * Track a conversion event
   */
  async trackEvent(data: {
    userId?: number;
    sessionId?: string;
    eventType: EventType;
    eventValue?: string;
    source?: string;
    medium?: string;
    campaign?: string;
    referrer?: string;
    metadata?: Record<string, unknown>;
  }) {
    const db = await getDb();
    if (!db) return null;
    
    const [result] = await db.insert(conversionEvents).values({
      userId: data.userId,
      sessionId: data.sessionId,
      eventType: data.eventType,
      eventValue: data.eventValue,
      source: data.source,
      medium: data.medium,
      campaign: data.campaign,
      referrer: data.referrer,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    
          createdAt: Date.now(),
        });
    
    return result.insertId;
  },

  /**
   * Get funnel metrics
   */
  async getFunnelMetrics(startDate?: Date, endDate?: Date) {
    const db = await getDb();
    if (!db) return null;
    
    const conditions = [];
    if (startDate) conditions.push(gte(conversionEvents.createdAt, startDate.getTime()));
    if (endDate) conditions.push(lte(conversionEvents.createdAt, endDate.getTime()));
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const metrics = await db
      .select({
        eventType: conversionEvents.eventType,
        count: sql<number>`COUNT(*)`,
        uniqueUsers: sql<number>`COUNT(DISTINCT user_id)`,
      })
      .from(conversionEvents)
      .where(whereClause)
      .groupBy(conversionEvents.eventType);
    
    // Build funnel stages
    const funnel = {
      pageViews: 0,
      signups: 0,
      calculatorStarts: 0,
      calculatorCompletes: 0,
      pricingViews: 0,
      checkoutStarts: 0,
      checkoutCompletes: 0,
      subscriptionStarts: 0,
    };
    
    for (const metric of metrics) {
      switch (metric.eventType) {
        case "page_view": funnel.pageViews = metric.count; break;
        case "signup": funnel.signups = metric.count; break;
        case "calculator_start": funnel.calculatorStarts = metric.count; break;
        case "calculator_complete": funnel.calculatorCompletes = metric.count; break;
        case "pricing_view": funnel.pricingViews = metric.count; break;
        case "checkout_start": funnel.checkoutStarts = metric.count; break;
        case "checkout_complete": funnel.checkoutCompletes = metric.count; break;
        case "subscription_start": funnel.subscriptionStarts = metric.count; break;
      }
    }
    
    // Calculate conversion rates
    const conversionRates = {
      visitToSignup: funnel.pageViews > 0 ? (funnel.signups / funnel.pageViews * 100).toFixed(2) : "0",
      signupToCalculator: funnel.signups > 0 ? (funnel.calculatorStarts / funnel.signups * 100).toFixed(2) : "0",
      calculatorToComplete: funnel.calculatorStarts > 0 ? (funnel.calculatorCompletes / funnel.calculatorStarts * 100).toFixed(2) : "0",
      pricingToCheckout: funnel.pricingViews > 0 ? (funnel.checkoutStarts / funnel.pricingViews * 100).toFixed(2) : "0",
      checkoutToComplete: funnel.checkoutStarts > 0 ? (funnel.checkoutCompletes / funnel.checkoutStarts * 100).toFixed(2) : "0",
      overallConversion: funnel.pageViews > 0 ? (funnel.subscriptionStarts / funnel.pageViews * 100).toFixed(2) : "0",
    };
    
    return { funnel, conversionRates };
  },

  /**
   * Get attribution metrics
   */
  async getAttributionMetrics(startDate?: Date, endDate?: Date) {
    const db = await getDb();
    if (!db) return [];
    
    const conditions = [eq(conversionEvents.eventType, "subscription_start")];
    if (startDate) conditions.push(gte(conversionEvents.createdAt, startDate.getTime()));
    if (endDate) conditions.push(lte(conversionEvents.createdAt, endDate.getTime()));
    
    return db
      .select({
        source: conversionEvents.source,
        medium: conversionEvents.medium,
        campaign: conversionEvents.campaign,
        conversions: sql<number>`COUNT(*)`,
      })
      .from(conversionEvents)
      .where(and(...conditions))
      .groupBy(conversionEvents.source, conversionEvents.medium, conversionEvents.campaign)
      .orderBy(desc(sql`COUNT(*)`));
  },

  /**
   * Get daily conversion trends
   */
  async getDailyTrends(days = 30) {
    const db = await getDb();
    if (!db) return [];
    
    const startDate = Date.now();
    startDate.setDate(startDate.getDate() - days);
    
    return db
      .select({
        date: sql<string>`DATE(created_at)`,
        signups: sql<number>`SUM(CASE WHEN event_type = 'signup' THEN 1 ELSE 0 END)`,
        subscriptions: sql<number>`SUM(CASE WHEN event_type = 'subscription_start' THEN 1 ELSE 0 END)`,
        calculatorUses: sql<number>`SUM(CASE WHEN event_type = 'calculator_complete' THEN 1 ELSE 0 END)`,
      })
      .from(conversionEvents)
      .where(gte(conversionEvents.createdAt, startDate.getTime()))
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);
  },

  /**
   * Get user journey
   */
  async getUserJourney(userId: number) {
    const db = await getDb();
    if (!db) return [];
    
    return db
      .select()
      .from(conversionEvents)
      .where(eq(conversionEvents.userId, userId))
      .orderBy(conversionEvents.createdAt);
  },
};
