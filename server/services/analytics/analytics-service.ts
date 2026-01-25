/**
 * Analytics Service
 * Serviço para tracking de métricas de uso do Jarvis e conversão de leads
 */

import { eq, sql, and, gte, lte, desc, count } from "drizzle-orm";
import { getDb } from "../../db";
import { 
  jarvisAnalytics, 
  leadConversions, 
  pageViews, 
  dailyMetrics,
  leads,
  calculations,
  ebookDownloads,
  whitepaperDownloads,
  InsertJarvisAnalytic,
  InsertLeadConversion,
  InsertPageView
} from "../../../drizzle/schema";

// ============================================
// JARVIS ANALYTICS
// ============================================

export async function trackJarvisInteraction(data: {
  sessionId: string;
  userId?: number;
  interactionType: "chat" | "calculator" | "mentorship" | "export" | "search";
  query?: string;
  skillUsed?: string;
  responseTime?: number;
  tokensUsed?: number;
  successful?: boolean;
  errorMessage?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(jarvisAnalytics).values({
      sessionId: data.sessionId,
      userId: data.userId,
      interactionType: data.interactionType,
      query: data.query,
      skillUsed: data.skillUsed,
      responseTime: data.responseTime,
      tokensUsed: data.tokensUsed,
      successful: data.successful ?? true,
      errorMessage: data.errorMessage,
    
          createdAt: Date.now(),
        });
  } catch (error) {
    console.error("[Analytics] Failed to track Jarvis interaction:", error);
  }
}

export async function updateJarvisFeedback(
  sessionId: string,
  feedback: "positive" | "negative" | "neutral"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(jarvisAnalytics)
      .set({ userFeedback: feedback })
      .where(eq(jarvisAnalytics.sessionId, sessionId));
  } catch (error) {
    console.error("[Analytics] Failed to update Jarvis feedback:", error);
  }
}

export async function getJarvisStats(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;

  try {
    const stats = await db.select({
      totalInteractions: count(),
      chatCount: sql<number>`SUM(CASE WHEN ${jarvisAnalytics.interactionType} = 'chat' THEN 1 ELSE 0 END)`,
      calculatorCount: sql<number>`SUM(CASE WHEN ${jarvisAnalytics.interactionType} = 'calculator' THEN 1 ELSE 0 END)`,
      mentorshipCount: sql<number>`SUM(CASE WHEN ${jarvisAnalytics.interactionType} = 'mentorship' THEN 1 ELSE 0 END)`,
      exportCount: sql<number>`SUM(CASE WHEN ${jarvisAnalytics.interactionType} = 'export' THEN 1 ELSE 0 END)`,
      searchCount: sql<number>`SUM(CASE WHEN ${jarvisAnalytics.interactionType} = 'search' THEN 1 ELSE 0 END)`,
      avgResponseTime: sql<number>`AVG(${jarvisAnalytics.responseTime})`,
      successRate: sql<number>`AVG(CASE WHEN ${jarvisAnalytics.successful} = true THEN 100 ELSE 0 END)`,
      positiveFeedback: sql<number>`SUM(CASE WHEN ${jarvisAnalytics.userFeedback} = 'positive' THEN 1 ELSE 0 END)`,
      negativeFeedback: sql<number>`SUM(CASE WHEN ${jarvisAnalytics.userFeedback} = 'negative' THEN 1 ELSE 0 END)`,
    })
    .from(jarvisAnalytics)
    .where(and(
      gte(jarvisAnalytics.createdAt, startDate),
      lte(jarvisAnalytics.createdAt, endDate)
    ));

    return stats[0];
  } catch (error) {
    console.error("[Analytics] Failed to get Jarvis stats:", error);
    return null;
  }
}

export async function getJarvisInteractionsByDay(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.select({
      date: sql<string>`DATE(${jarvisAnalytics.createdAt})`,
      count: count(),
    })
    .from(jarvisAnalytics)
    .where(and(
      gte(jarvisAnalytics.createdAt, startDate),
      lte(jarvisAnalytics.createdAt, endDate)
    ))
    .groupBy(sql`DATE(${jarvisAnalytics.createdAt})`)
    .orderBy(sql`DATE(${jarvisAnalytics.createdAt})`);

    return result;
  } catch (error) {
    console.error("[Analytics] Failed to get Jarvis interactions by day:", error);
    return [];
  }
}

export async function getTopJarvisQueries(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.select({
      query: jarvisAnalytics.query,
      count: count(),
    })
    .from(jarvisAnalytics)
    .where(sql`${jarvisAnalytics.query} IS NOT NULL`)
    .groupBy(jarvisAnalytics.query)
    .orderBy(desc(count()))
    .limit(limit);

    return result;
  } catch (error) {
    console.error("[Analytics] Failed to get top Jarvis queries:", error);
    return [];
  }
}

// ============================================
// LEAD CONVERSION TRACKING
// ============================================

export async function trackLeadConversion(data: {
  leadId: number;
  conversionType: "signup" | "download" | "contact" | "calculator" | "demo_request" | "purchase";
  sourcePage?: string;
  sourceForm?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  deviceType?: "desktop" | "mobile" | "tablet";
  browser?: string;
  country?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(leadConversions).values(data);
  } catch (error) {
    console.error("[Analytics] Failed to track lead conversion:", error);
  }
}

export async function getConversionStats(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;

  try {
    const stats = await db.select({
      totalConversions: count(),
      signupCount: sql<number>`SUM(CASE WHEN ${leadConversions.conversionType} = 'signup' THEN 1 ELSE 0 END)`,
      downloadCount: sql<number>`SUM(CASE WHEN ${leadConversions.conversionType} = 'download' THEN 1 ELSE 0 END)`,
      contactCount: sql<number>`SUM(CASE WHEN ${leadConversions.conversionType} = 'contact' THEN 1 ELSE 0 END)`,
      calculatorCount: sql<number>`SUM(CASE WHEN ${leadConversions.conversionType} = 'calculator' THEN 1 ELSE 0 END)`,
      demoRequestCount: sql<number>`SUM(CASE WHEN ${leadConversions.conversionType} = 'demo_request' THEN 1 ELSE 0 END)`,
      purchaseCount: sql<number>`SUM(CASE WHEN ${leadConversions.conversionType} = 'purchase' THEN 1 ELSE 0 END)`,
    })
    .from(leadConversions)
    .where(and(
      gte(leadConversions.convertedAt, startDate),
      lte(leadConversions.convertedAt, endDate)
    ));

    return stats[0];
  } catch (error) {
    console.error("[Analytics] Failed to get conversion stats:", error);
    return null;
  }
}

export async function getConversionsBySource(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.select({
      source: leadConversions.utmSource,
      count: count(),
    })
    .from(leadConversions)
    .where(and(
      gte(leadConversions.convertedAt, startDate),
      lte(leadConversions.convertedAt, endDate),
      sql`${leadConversions.utmSource} IS NOT NULL`
    ))
    .groupBy(leadConversions.utmSource)
    .orderBy(desc(count()));

    return result;
  } catch (error) {
    console.error("[Analytics] Failed to get conversions by source:", error);
    return [];
  }
}

export async function getConversionFunnel(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get page views
    const pageViewsCount = await db.select({ count: count() })
      .from(pageViews)
      .where(and(
        gte(pageViews.viewedAt, startDate),
        lte(pageViews.viewedAt, endDate)
      ));

    // Get unique visitors
    const uniqueVisitors = await db.select({ 
      count: sql<number>`COUNT(DISTINCT ${pageViews.sessionId})` 
    })
      .from(pageViews)
      .where(and(
        gte(pageViews.viewedAt, startDate),
        lte(pageViews.viewedAt, endDate)
      ));

    // Get leads
    const leadsCount = await db.select({ count: count() })
      .from(leads)
      .where(and(
        gte(leads.createdAt, startDate),
        lte(leads.createdAt, endDate)
      ));

    // Get conversions
    const conversionsCount = await db.select({ count: count() })
      .from(leadConversions)
      .where(and(
        gte(leadConversions.convertedAt, startDate),
        lte(leadConversions.convertedAt, endDate)
      ));

    return {
      pageViews: pageViewsCount[0]?.count || 0,
      uniqueVisitors: uniqueVisitors[0]?.count || 0,
      leads: leadsCount[0]?.count || 0,
      conversions: conversionsCount[0]?.count || 0,
    };
  } catch (error) {
    console.error("[Analytics] Failed to get conversion funnel:", error);
    return null;
  }
}

// ============================================
// PAGE VIEW TRACKING
// ============================================

export async function trackPageView(data: {
  sessionId: string;
  userId?: number;
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  deviceType?: "desktop" | "mobile" | "tablet";
  browser?: string;
  country?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(pageViews).values(data);
  } catch (error) {
    console.error("[Analytics] Failed to track page view:", error);
  }
}

export async function updatePageViewMetrics(
  sessionId: string,
  pagePath: string,
  timeOnPage: number,
  scrollDepth: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(pageViews)
      .set({ timeOnPage, scrollDepth })
      .where(and(
        eq(pageViews.sessionId, sessionId),
        eq(pageViews.pagePath, pagePath)
      ));
  } catch (error) {
    console.error("[Analytics] Failed to update page view metrics:", error);
  }
}

export async function getTopPages(startDate: Date, endDate: Date, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.select({
      pagePath: pageViews.pagePath,
      pageTitle: pageViews.pageTitle,
      views: count(),
      avgTimeOnPage: sql<number>`AVG(${pageViews.timeOnPage})`,
      avgScrollDepth: sql<number>`AVG(${pageViews.scrollDepth})`,
    })
    .from(pageViews)
    .where(and(
      gte(pageViews.viewedAt, startDate),
      lte(pageViews.viewedAt, endDate)
    ))
    .groupBy(pageViews.pagePath, pageViews.pageTitle)
    .orderBy(desc(count()))
    .limit(limit);

    return result;
  } catch (error) {
    console.error("[Analytics] Failed to get top pages:", error);
    return [];
  }
}

// ============================================
// DASHBOARD METRICS
// ============================================

export async function getDashboardMetrics(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get page views
    const pageViewsResult = await db.select({ count: count() })
      .from(pageViews)
      .where(and(
        gte(pageViews.viewedAt, startDate),
        lte(pageViews.viewedAt, endDate)
      ));

    // Get unique visitors
    const uniqueVisitorsResult = await db.select({ 
      count: sql<number>`COUNT(DISTINCT ${pageViews.sessionId})` 
    })
      .from(pageViews)
      .where(and(
        gte(pageViews.viewedAt, startDate),
        lte(pageViews.viewedAt, endDate)
      ));

    // Get leads
    const leadsResult = await db.select({ count: count() })
      .from(leads)
      .where(and(
        gte(leads.createdAt, startDate),
        lte(leads.createdAt, endDate)
      ));

    // Get Jarvis interactions
    const jarvisResult = await db.select({ count: count() })
      .from(jarvisAnalytics)
      .where(and(
        gte(jarvisAnalytics.createdAt, startDate),
        lte(jarvisAnalytics.createdAt, endDate)
      ));

    // Get calculator uses
    const calculatorResult = await db.select({ count: count() })
      .from(calculations)
      .where(and(
        gte(calculations.createdAt, startDate),
        lte(calculations.createdAt, endDate)
      ));

    // Get ebook downloads
    const ebookResult = await db.select({ count: count() })
      .from(ebookDownloads)
      .where(and(
        gte(ebookDownloads.downloadedAt, startDate),
        lte(ebookDownloads.downloadedAt, endDate)
      ));

    // Get whitepaper downloads
    const whitepaperResult = await db.select({ count: count() })
      .from(whitepaperDownloads)
      .where(and(
        gte(whitepaperDownloads.downloadedAt, startDate),
        lte(whitepaperDownloads.downloadedAt, endDate)
      ));

    return {
      pageViews: pageViewsResult[0]?.count || 0,
      uniqueVisitors: uniqueVisitorsResult[0]?.count || 0,
      totalLeads: leadsResult[0]?.count || 0,
      jarvisInteractions: jarvisResult[0]?.count || 0,
      calculatorUses: calculatorResult[0]?.count || 0,
      ebookDownloads: ebookResult[0]?.count || 0,
      whitepaperDownloads: whitepaperResult[0]?.count || 0,
    };
  } catch (error) {
    console.error("[Analytics] Failed to get dashboard metrics:", error);
    return null;
  }
}

export async function getMetricsByDay(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get page views by day
    const pageViewsByDay = await db.select({
      date: sql<string>`DATE(${pageViews.viewedAt})`,
      pageViews: count(),
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.sessionId})`,
    })
    .from(pageViews)
    .where(and(
      gte(pageViews.viewedAt, startDate),
      lte(pageViews.viewedAt, endDate)
    ))
    .groupBy(sql`DATE(${pageViews.viewedAt})`)
    .orderBy(sql`DATE(${pageViews.viewedAt})`);

    // Get leads by day
    const leadsByDay = await db.select({
      date: sql<string>`DATE(${leads.createdAt})`,
      leads: count(),
    })
    .from(leads)
    .where(and(
      gte(leads.createdAt, startDate),
      lte(leads.createdAt, endDate)
    ))
    .groupBy(sql`DATE(${leads.createdAt})`)
    .orderBy(sql`DATE(${leads.createdAt})`);

    // Get Jarvis interactions by day
    const jarvisByDay = await db.select({
      date: sql<string>`DATE(${jarvisAnalytics.createdAt})`,
      jarvisInteractions: count(),
    })
    .from(jarvisAnalytics)
    .where(and(
      gte(jarvisAnalytics.createdAt, startDate),
      lte(jarvisAnalytics.createdAt, endDate)
    ))
    .groupBy(sql`DATE(${jarvisAnalytics.createdAt})`)
    .orderBy(sql`DATE(${jarvisAnalytics.createdAt})`);

    // Merge results
    const dateMap = new Map<string, {
      date: string;
      pageViews: number;
      uniqueVisitors: number;
      leads: number;
      jarvisInteractions: number;
    }>();

    pageViewsByDay.forEach(item => {
      dateMap.set(item.date, {
        date: item.date,
        pageViews: item.pageViews,
        uniqueVisitors: item.uniqueVisitors,
        leads: 0,
        jarvisInteractions: 0,
      });
    });

    leadsByDay.forEach(item => {
      const existing = dateMap.get(item.date);
      if (existing) {
        existing.leads = item.leads;
      } else {
        dateMap.set(item.date, {
          date: item.date,
          pageViews: 0,
          uniqueVisitors: 0,
          leads: item.leads,
          jarvisInteractions: 0,
        });
      }
    });

    jarvisByDay.forEach(item => {
      const existing = dateMap.get(item.date);
      if (existing) {
        existing.jarvisInteractions = item.jarvisInteractions;
      } else {
        dateMap.set(item.date, {
          date: item.date,
          pageViews: 0,
          uniqueVisitors: 0,
          leads: 0,
          jarvisInteractions: item.jarvisInteractions,
        });
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("[Analytics] Failed to get metrics by day:", error);
    return [];
  }
}
