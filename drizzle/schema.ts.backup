import { integer, text, sqliteTable, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId", { length: 64 }).unique(), // Optional: only for Manus OAuth users
  name: text("name"),
  email: text("email", { length: 320 }).unique(), // Unique for local auth
  passwordHash: text("passwordHash", { length: 255 }),
  loginMethod: text("loginMethod", { length: 64 }),
  role: text("role").default("user").notNull(), // user, manager, admin
  stripeCustomerId: text("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: text("stripeSubscriptionId", { length: 255 }),
  subscriptionStatus: text("subscriptionStatus").default("none"), // active, canceled, past_due, trialing, none
  planType: text("planType").default("free"), // free, starter, professional, enterprise
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
  lastSignedIn: integer("lastSignedIn").default(sql`(unixepoch())`).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Leads table for contact form submissions and whitepaper downloads.
 */
export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }),
  email: text("email", { length: 320 }).notNull(),
  organization: text("organization", { length: 255 }),
  phone: text("phone", { length: 20 }),
  message: text("message"),
  source: text("source").default("contact_form").notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  welcomeEmailSent: integer("welcomeEmailSent").default(false).notNull(),
  nurturingStep: integer("nurturingStep").default(0).notNull(),
  lastEmailSentAt: integer("lastEmailSentAt"),
  unsubscribed: integer("unsubscribed").default(false).notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Newsletter subscriptions.
 */
export const newsletterSubscribers = sqliteTable("newsletterSubscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email", { length: 320 }).notNull().unique(),
  name: text("name", { length: 255 }),
  segment: text("segment").default("general").notNull(),
  interests: text("interests"),
  isActive: integer("isActive").default(true).notNull(),
  confirmedAt: integer("confirmedAt"),
  unsubscribedAt: integer("unsubscribedAt"),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

/**
 * User calculations history for impact calculator.
 */
export const calculations = sqliteTable("calculations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("sessionId", { length: 64 }),
  userId: integer("userId"),
  projectName: text("projectName", { length: 255 }),
  investment: integer("investment").notNull(),
  contextScore: integer("contextScore").notNull(),
  resistanceScore: integer("resistanceScore").notNull(),
  beneficiaries: integer("beneficiaries").notNull(),
  duration: integer("duration").notNull(),
  impactScore: integer("impactScore").notNull(),
  sRoi: integer("sRoi").notNull(),
  sector: text("sector", { length: 100 }),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type Calculation = typeof calculations.$inferSelect;
export type InsertCalculation = typeof calculations.$inferInsert;

/**
 * Ebook downloads tracking.
 */
export const ebookDownloads = sqliteTable("ebookDownloads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }).notNull(),
  email: text("email", { length: 320 }).notNull(),
  organization: text("organization", { length: 255 }),
  role: text("role", { length: 100 }),
  phone: text("phone", { length: 20 }),
  source: text("source", { length: 100 }).default("website"),
  downloadedAt: integer("downloadedAt").default(sql`(unixepoch())`).notNull(),
  emailSent: integer("emailSent").default(false).notNull(),
});

export type EbookDownload = typeof ebookDownloads.$inferSelect;
export type InsertEbookDownload = typeof ebookDownloads.$inferInsert;

/**
 * Whitepaper downloads tracking.
 */
export const whitepaperDownloads = sqliteTable("whitepaperDownloads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }).notNull(),
  email: text("email", { length: 320 }).notNull(),
  organization: text("organization", { length: 255 }),
  downloadedAt: integer("downloadedAt").default(sql`(unixepoch())`).notNull(),
});

export type WhitepaperDownload = typeof whitepaperDownloads.$inferSelect;
export type InsertWhitepaperDownload = typeof whitepaperDownloads.$inferInsert;

/**
 * Contact form submissions.
 */
export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }).notNull(),
  email: text("email", { length: 320 }).notNull(),
  phone: text("phone", { length: 20 }),
  subject: text("subject", { length: 255 }),
  message: text("message").notNull(),
  status: text("status").default("new").notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

/**
 * Jarvis chat sessions.
 */
export const jarvisSessions = sqliteTable("jarvisSessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("sessionId", { length: 64 }).notNull().unique(),
  userId: integer("userId"),
  context: text("context"),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type JarvisSession = typeof jarvisSessions.$inferSelect;
export type InsertJarvisSession = typeof jarvisSessions.$inferInsert;

/**
 * Jarvis chat messages.
 */
export const jarvisMessages = sqliteTable("jarvisMessages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("sessionId", { length: 64 }).notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type JarvisMessage = typeof jarvisMessages.$inferSelect;
export type InsertJarvisMessage = typeof jarvisMessages.$inferInsert;

/**
 * Knowledge base documents for RAG.
 */
export const knowledgeDocuments = sqliteTable("knowledgeDocuments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: text("category", { length: 100 }).notNull(),
  tags: text("tags"),
  embedding: text("embedding"),
  isActive: integer("isActive").default(true).notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect;
export type InsertKnowledgeDocument = typeof knowledgeDocuments.$inferInsert;

/**
 * Site analytics and metrics.
 */
export const siteMetrics = sqliteTable("siteMetrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  metricType: text("metricType", { length: 50 }).notNull(),
  metricValue: integer("metricValue").notNull(),
  metricDate: integer("metricDate").default(sql`(unixepoch())`).notNull(),
  metadata: text("metadata"),
});

export type SiteMetric = typeof siteMetrics.$inferSelect;
export type InsertSiteMetric = typeof siteMetrics.$inferInsert;


/**
 * Jarvis interaction analytics.
 */
export const jarvisAnalytics = sqliteTable("jarvisAnalytics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("sessionId", { length: 64 }).notNull(),
  userId: integer("userId"),
  interactionType: text("interactionType", ["chat", "calculator", "mentorship", "export", "search"]).notNull(),
  query: text("query"),
  skillUsed: text("skillUsed", { length: 50 }),
  responseTime: integer("responseTime"), // in milliseconds
  tokensUsed: integer("tokensUsed"),
  successful: integer("successful").default(true).notNull(),
  errorMessage: text("errorMessage"),
  userFeedback: text("userFeedback", ["positive", "negative", "neutral"]),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type JarvisAnalytic = typeof jarvisAnalytics.$inferSelect;
export type InsertJarvisAnalytic = typeof jarvisAnalytics.$inferInsert;

/**
 * Lead conversion tracking.
 */
export const leadConversions = sqliteTable("leadConversions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  leadId: integer("leadId").notNull(),
  conversionType: text("conversionType", ["signup", "download", "contact", "calculator", "demo_request", "purchase"]).notNull(),
  sourcePage: text("sourcePage", { length: 255 }),
  sourceForm: text("sourceForm", { length: 100 }),
  utmSource: text("utmSource", { length: 100 }),
  utmMedium: text("utmMedium", { length: 100 }),
  utmCampaign: text("utmCampaign", { length: 100 }),
  referrer: text("referrer", { length: 500 }),
  deviceType: text("deviceType", ["desktop", "mobile", "tablet"]),
  browser: text("browser", { length: 50 }),
  country: text("country", { length: 100 }),
  convertedAt: integer("convertedAt").default(sql`(unixepoch())`).notNull(),
});

export type LeadConversion = typeof leadConversions.$inferSelect;
export type InsertLeadConversion = typeof leadConversions.$inferInsert;

/**
 * Page view analytics.
 */
export const pageViews = sqliteTable("pageViews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("sessionId", { length: 64 }).notNull(),
  userId: integer("userId"),
  pagePath: text("pagePath", { length: 255 }).notNull(),
  pageTitle: text("pageTitle", { length: 255 }),
  referrer: text("referrer", { length: 500 }),
  utmSource: text("utmSource", { length: 100 }),
  utmMedium: text("utmMedium", { length: 100 }),
  utmCampaign: text("utmCampaign", { length: 100 }),
  deviceType: text("deviceType", ["desktop", "mobile", "tablet"]),
  browser: text("browser", { length: 50 }),
  country: text("country", { length: 100 }),
  timeOnPage: integer("timeOnPage"), // in seconds
  scrollDepth: integer("scrollDepth"), // percentage 0-100
  viewedAt: integer("viewedAt").default(sql`(unixepoch())`).notNull(),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

/**
 * Daily aggregated metrics.
 */
export const dailyMetrics = sqliteTable("dailyMetrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  metricDate: integer("metricDate").notNull(),
  totalPageViews: integer("totalPageViews").default(0).notNull(),
  uniqueVisitors: integer("uniqueVisitors").default(0).notNull(),
  totalLeads: integer("totalLeads").default(0).notNull(),
  totalConversions: integer("totalConversions").default(0).notNull(),
  jarvisInteractions: integer("jarvisInteractions").default(0).notNull(),
  calculatorUses: integer("calculatorUses").default(0).notNull(),
  ebookDownloads: integer("ebookDownloads").default(0).notNull(),
  whitepaperDownloads: integer("whitepaperDownloads").default(0).notNull(),
  avgTimeOnSite: integer("avgTimeOnSite").default(0), // in seconds
  bounceRate: integer("bounceRate").default(0), // percentage 0-100
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type DailyMetric = typeof dailyMetrics.$inferSelect;
export type InsertDailyMetric = typeof dailyMetrics.$inferInsert;


/**
 * Case favorites - users can save cases for later.
 */
export const caseFavorites = sqliteTable("caseFavorites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  caseId: integer("caseId").notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type CaseFavorite = typeof caseFavorites.$inferSelect;
export type InsertCaseFavorite = typeof caseFavorites.$inferInsert;

/**
 * Case submissions - organizations can submit their own cases.
 */
export const caseSubmissions = sqliteTable("caseSubmissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  organizationName: text("organizationName", { length: 255 }).notNull(),
  contactName: text("contactName", { length: 255 }).notNull(),
  contactEmail: text("contactEmail", { length: 320 }).notNull(),
  contactPhone: text("contactPhone", { length: 20 }),
  projectTitle: text("projectTitle", { length: 255 }).notNull(),
  sector: text("sector", { length: 100 }).notNull(),
  location: text("location", { length: 255 }).notNull(),
  investment: text("investment", { length: 100 }).notNull(),
  beneficiaries: text("beneficiaries", { length: 100 }).notNull(),
  duration: text("duration", { length: 100 }).notNull(),
  description: text("description").notNull(),
  challenge: text("challenge").notNull(),
  solution: text("solution").notNull(),
  results: text("results").notNull(),
  metrics: text("metrics"), // JSON string
  documentUrl: text("documentUrl", { length: 500 }),
  status: text("status", ["pending", "reviewing", "approved", "rejected"]).default("pending").notNull(),
  reviewNotes: text("reviewNotes"),
  reviewedAt: integer("reviewedAt"),
  reviewedBy: integer("reviewedBy"),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type CaseSubmission = typeof caseSubmissions.$inferSelect;
export type InsertCaseSubmission = typeof caseSubmissions.$inferInsert;


/**
 * Tags for cases - customizable labels for organization
 */
export const caseTags = sqliteTable("caseTags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 100 }).notNull(),
  slug: text("slug", { length: 100 }).notNull().unique(),
  color: text("color", { length: 7 }).default("#f97316").notNull(), // hex color
  description: text("description"),
  createdBy: integer("createdBy").notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type CaseTag = typeof caseTags.$inferSelect;
export type InsertCaseTag = typeof caseTags.$inferInsert;

/**
 * Junction table for case-tag relationships
 */
export const caseTagRelations = sqliteTable("caseTagRelations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  caseId: integer("caseId").notNull(),
  tagId: integer("tagId").notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type CaseTagRelation = typeof caseTagRelations.$inferSelect;
export type InsertCaseTagRelation = typeof caseTagRelations.$inferInsert;


/**
 * User points for gamification
 */
export const userPoints = sqliteTable("userPoints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  points: integer("points").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  totalInteractions: integer("totalInteractions").default(0).notNull(),
  streak: integer("streak").default(0).notNull(), // consecutive days
  lastInteractionAt: integer("lastInteractionAt"),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type UserPoints = typeof userPoints.$inferSelect;
export type InsertUserPoints = typeof userPoints.$inferInsert;

/**
 * Badge definitions
 */
export const badges = sqliteTable("badges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug", { length: 50 }).notNull().unique(),
  name: text("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: text("icon", { length: 50 }).notNull(), // emoji or icon name
  color: text("color", { length: 7 }).default("#f97316").notNull(),
  requirement: text("requirement", { length: 50 }).notNull(), // e.g., "interactions_10", "streak_7"
  requiredValue: integer("requiredValue").notNull(),
  pointsReward: integer("pointsReward").default(100).notNull(),
  rarity: text("rarity", ["common", "uncommon", "rare", "epic", "legendary"]).default("common").notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * User earned badges
 */
export const userBadges = sqliteTable("userBadges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  badgeId: integer("badgeId").notNull(),
  earnedAt: integer("earnedAt").default(sql`(unixepoch())`).notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

/**
 * Point transactions log
 */
export const pointTransactions = sqliteTable("pointTransactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  points: integer("points").notNull(), // positive or negative
  reason: text("reason", { length: 100 }).notNull(),
  metadata: text("metadata"), // JSON with extra info
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = typeof pointTransactions.$inferInsert;

/**
 * API keys for public API access
 */
export const apiKeys = sqliteTable("apiKeys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  name: text("name", { length: 100 }).notNull(),
  keyHash: text("keyHash", { length: 64 }).notNull(), // SHA-256 hash
  keyPrefix: text("keyPrefix", { length: 8 }).notNull(), // First 8 chars for identification
  permissions: text("permissions"), // JSON array of allowed endpoints
  rateLimit: integer("rateLimit").default(1000).notNull(), // requests per hour
  lastUsedAt: integer("lastUsedAt"),
  expiresAt: integer("expiresAt"),
  isActive: integer("isActive").default(true).notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;


/**
 * Webhooks for external integrations
 */
export const webhooks = sqliteTable("webhooks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  name: text("name", { length: 100 }).notNull(),
  url: text("url", { length: 500 }).notNull(),
  secret: text("secret", { length: 64 }).notNull(), // For signature verification
  events: text("events").notNull(), // JSON array of subscribed events
  isActive: integer("isActive").default(true).notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

/**
 * Webhook delivery logs
 */
export const webhookDeliveries = sqliteTable("webhookDeliveries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  webhookId: integer("webhookId").notNull(),
  event: text("event", { length: 50 }).notNull(),
  payload: text("payload").notNull(), // JSON payload sent
  responseStatus: integer("responseStatus"),
  responseBody: text("responseBody"),
  attempts: integer("attempts").default(1).notNull(),
  nextRetryAt: integer("nextRetryAt"),
  deliveredAt: integer("deliveredAt"),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type InsertWebhookDelivery = typeof webhookDeliveries.$inferInsert;

/**
 * OAuth2 clients for API authentication
 */
export const oauthClients = sqliteTable("oauthClients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(), // Owner of the OAuth app
  name: text("name", { length: 100 }).notNull(),
  description: text("description"),
  clientId: text("clientId", { length: 64 }).notNull().unique(),
  clientSecretHash: text("clientSecretHash", { length: 64 }).notNull(),
  redirectUris: text("redirectUris").notNull(), // JSON array
  scopes: text("scopes").notNull(), // JSON array of allowed scopes
  isActive: integer("isActive").default(true).notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type OAuthClient = typeof oauthClients.$inferSelect;
export type InsertOAuthClient = typeof oauthClients.$inferInsert;

/**
 * OAuth2 authorization codes
 */
export const oauthAuthCodes = sqliteTable("oauthAuthCodes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientId: text("clientId", { length: 64 }).notNull(),
  userId: integer("userId").notNull(),
  code: text("code", { length: 64 }).notNull().unique(),
  redirectUri: text("redirectUri", { length: 500 }).notNull(),
  scopes: text("scopes").notNull(), // JSON array
  codeChallenge: text("codeChallenge", { length: 128 }), // PKCE
  codeChallengeMethod: text("codeChallengeMethod", { length: 10 }), // plain or S256
  expiresAt: integer("expiresAt").notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type OAuthAuthCode = typeof oauthAuthCodes.$inferSelect;
export type InsertOAuthAuthCode = typeof oauthAuthCodes.$inferInsert;

/**
 * OAuth2 access tokens
 */
export const oauthTokens = sqliteTable("oauthTokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientId: text("clientId", { length: 64 }).notNull(),
  userId: integer("userId").notNull(),
  accessToken: text("accessToken", { length: 64 }).notNull().unique(),
  refreshToken: text("refreshToken", { length: 64 }).unique(),
  scopes: text("scopes").notNull(), // JSON array
  accessTokenExpiresAt: integer("accessTokenExpiresAt").notNull(),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt"),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type OAuthToken = typeof oauthTokens.$inferSelect;
export type InsertOAuthToken = typeof oauthTokens.$inferInsert;


/**
 * Jarvis long-term memory for persistent context per user.
 */
export const jarvisMemory = sqliteTable("jarvisMemory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  memoryType: text("memoryType", ["preference", "fact", "context", "goal", "project", "interaction"]).notNull(),
  key: text("key", { length: 255 }).notNull(),
  value: text("value").notNull(),
  importance: integer("importance").default(5).notNull(), // 1-10 scale
  lastAccessed: integer("lastAccessed").default(sql`(unixepoch())`).notNull(),
  accessCount: integer("accessCount").default(1).notNull(),
  expiresAt: integer("expiresAt"),
  isActive: integer("isActive").default(true).notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type JarvisMemory = typeof jarvisMemory.$inferSelect;
export type InsertJarvisMemory = typeof jarvisMemory.$inferInsert;

/**
 * Jarvis generated reports for users.
 */
export const jarvisReports = sqliteTable("jarvisReports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  title: text("title", { length: 255 }).notNull(),
  reportType: text("reportType", ["impact", "executive_summary", "progress", "comparison", "forecast", "custom"]).notNull(),
  content: text("content").notNull(), // JSON or Markdown content
  summary: text("summary"),
  metrics: text("metrics"), // JSON with key metrics
  pdfUrl: text("pdfUrl", { length: 500 }),
  wordUrl: text("wordUrl", { length: 500 }),
  status: text("status", ["generating", "completed", "failed"]).default("generating").notNull(),
  generatedAt: integer("generatedAt"),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type JarvisReport = typeof jarvisReports.$inferSelect;
export type InsertJarvisReport = typeof jarvisReports.$inferInsert;

/**
 * Impact certificates with blockchain-style verification.
 */
export const impactCertificates = sqliteTable("impactCertificates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  certificateId: text("certificateId", { length: 64 }).notNull().unique(), // Unique public ID
  userId: integer("userId"),
  organizationName: text("organizationName", { length: 255 }).notNull(),
  projectName: text("projectName", { length: 255 }).notNull(),
  projectDescription: text("projectDescription"),
  
  // Impact metrics
  totalInvestment: integer("totalInvestment").notNull(),
  beneficiaries: integer("beneficiaries").notNull(),
  sRoi: integer("sRoi").notNull(), // Stored as percentage * 100
  impactScore: integer("impactScore").notNull(),
  sector: text("sector", { length: 100 }).notNull(),
  sdgs: text("sdgs"), // JSON array of SDG numbers
  
  // Blockchain-style verification
  previousHash: text("previousHash", { length: 64 }), // Hash of previous certificate (chain)
  dataHash: text("dataHash", { length: 64 }).notNull(), // SHA-256 hash of certificate data
  merkleRoot: text("merkleRoot", { length: 64 }), // Merkle root for batch verification
  blockNumber: integer("blockNumber"), // Simulated block number
  
  // Verification
  verificationStatus: text("verificationStatus", ["pending", "verified", "revoked"]).default("pending").notNull(),
  verifiedBy: integer("verifiedBy"),
  verifiedAt: integer("verifiedAt"),
  
  // Metadata
  issuedAt: integer("issuedAt").default(sql`(unixepoch())`).notNull(),
  validUntil: integer("validUntil"),
  qrCodeUrl: text("qrCodeUrl", { length: 500 }),
  pdfUrl: text("pdfUrl", { length: 500 }),
  
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type ImpactCertificate = typeof impactCertificates.$inferSelect;
export type InsertImpactCertificate = typeof impactCertificates.$inferInsert;

/**
 * Social Impact Tokens (SIT) - Tokenized impact credits.
 */
export const impactTokens = sqliteTable("impactTokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tokenId: text("tokenId", { length: 64 }).notNull().unique(),
  userId: integer("userId"),
  organizationId: integer("organizationId"),
  certificateId: integer("certificateId"), // Link to certificate
  
  // Token details
  tokenType: text("tokenType", ["impact_credit", "verification_badge", "achievement", "contribution"]).notNull(),
  amount: integer("amount").default(1).notNull(),
  value: integer("value").default(0).notNull(), // Value in cents
  
  // Metadata
  name: text("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl", { length: 500 }),
  metadata: text("metadata"), // JSON with additional data
  
  // Transfer history
  previousOwner: integer("previousOwner"),
  transferCount: integer("transferCount").default(0).notNull(),
  
  // Status
  status: text("status", ["active", "transferred", "burned", "expired"]).default("active").notNull(),
  mintedAt: integer("mintedAt").default(sql`(unixepoch())`).notNull(),
  expiresAt: integer("expiresAt"),
  
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type ImpactToken = typeof impactTokens.$inferSelect;
export type InsertImpactToken = typeof impactTokens.$inferInsert;

/**
 * Token transactions for audit trail.
 */
export const tokenTransactions = sqliteTable("tokenTransactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tokenId: integer("tokenId").notNull(),
  transactionType: text("transactionType", ["mint", "transfer", "burn", "stake", "unstake"]).notNull(),
  fromUserId: integer("fromUserId"),
  toUserId: integer("toUserId"),
  amount: integer("amount").default(1).notNull(),
  transactionHash: text("transactionHash", { length: 64 }).notNull(), // SHA-256 hash
  previousTransactionHash: text("previousTransactionHash", { length: 64 }),
  metadata: text("metadata"), // JSON
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = typeof tokenTransactions.$inferInsert;

/**
 * User language preferences.
 */
export const userPreferences = sqliteTable("userPreferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull().unique(),
  language: text("language", { length: 10 }).default("pt").notNull(),
  theme: text("theme", ["light", "dark", "system"]).default("system").notNull(),
  timezone: text("timezone", { length: 50 }).default("America/Sao_Paulo").notNull(),
  emailNotifications: integer("emailNotifications").default(true).notNull(),
  pushNotifications: integer("pushNotifications").default(true).notNull(),
  weeklyDigest: integer("weeklyDigest").default(true).notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;


/**
 * User notifications table for persistent notification storage.
 */
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  type: text("type", ["info", "success", "warning", "error", "case_pending", "case_approved", "case_rejected", "certificate_issued", "token_earned", "system"]).default("info").notNull(),
  title: text("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: text("link", { length: 500 }),
  isRead: integer("isRead").default(false).notNull(),
  metadata: text("metadata").$type<Record<string, unknown>>(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  readAt: integer("readAt"),
  emailSentAt: integer("emailSentAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * User notification preferences - allows users to customize which notifications they receive
 */
export const notificationPreferences = sqliteTable("notificationPreferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  // Notification type preferences (true = enabled, false = disabled)
  infoEnabled: integer("infoEnabled").default(true).notNull(),
  successEnabled: integer("successEnabled").default(true).notNull(),
  warningEnabled: integer("warningEnabled").default(true).notNull(),
  errorEnabled: integer("errorEnabled").default(true).notNull(),
  casePendingEnabled: integer("casePendingEnabled").default(true).notNull(),
  caseApprovedEnabled: integer("caseApprovedEnabled").default(true).notNull(),
  caseRejectedEnabled: integer("caseRejectedEnabled").default(true).notNull(),
  certificateIssuedEnabled: integer("certificateIssuedEnabled").default(true).notNull(),
  tokenEarnedEnabled: integer("tokenEarnedEnabled").default(true).notNull(),
  systemEnabled: integer("systemEnabled").default(true).notNull(),
  // Email preferences
  emailEnabled: integer("emailEnabled").default(true).notNull(),
  emailDigestFrequency: text("emailDigestFrequency", ["instant", "daily", "weekly", "never"]).default("instant").notNull(),
  // Push preferences
  pushEnabled: integer("pushEnabled").default(true).notNull(),
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;


/**
 * Notification templates - customizable templates for automated notifications
 */
export const notificationTemplates = sqliteTable("notificationTemplates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Template identification
  code: text("code", { length: 100 }).notNull().unique(), // e.g., "case_approved", "certificate_issued"
  name: text("name", { length: 255 }).notNull(),
  description: text("description"),
  // Template type
  type: text("type", ["info", "success", "warning", "error", "case_pending", "case_approved", "case_rejected", "certificate_issued", "token_earned", "system"]).notNull(),
  // Template content
  titleTemplate: text("titleTemplate", { length: 255 }).notNull(), // e.g., "Seu case {{caseName}} foi aprovado!"
  messageTemplate: text("messageTemplate").notNull(), // e.g., "Parabéns! O case {{caseName}} foi aprovado em {{approvalDate}}."
  // Available variables (JSON array of variable names)
  availableVariables: text("availableVariables"), // e.g., '["caseName", "approvalDate", "reviewerName"]'
  // Status
  isActive: integer("isActive").default(true).notNull(),
  isSystem: integer("isSystem").default(false).notNull(), // System templates cannot be deleted
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
  createdBy: integer("createdBy"),
});

export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate = typeof notificationTemplates.$inferInsert;


/**
 * System settings - persistent configuration for the platform
 */
export const systemSettings = sqliteTable("systemSettings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Setting identification
  key: text("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  // Metadata
  description: text("description", { length: 255 }),
  category: text("category", ["general", "notifications", "security", "integrations"]).default("general").notNull(),
  // Type hint for parsing
  valueType: text("valueType", ["string", "number", "boolean", "json"]).default("string").notNull(),
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;


/**
 * Audit logs - track administrative actions for compliance and traceability
 */
export const auditLogs = sqliteTable("auditLogs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Who performed the action
  userId: integer("userId"),
  userName: text("userName", { length: 255 }),
  userEmail: text("userEmail", { length: 255 }),
  // What action was performed
  action: text("action", [
    "create", "update", "delete", "login", "logout",
    "approve", "reject", "export", "import", "config_change"
  ]).notNull(),
  // What resource was affected
  resourceType: text("resourceType", { length: 100 }).notNull(), // e.g., "case", "user", "setting"
  resourceId: text("resourceId", { length: 100 }), // ID of the affected resource
  resourceName: text("resourceName", { length: 255 }), // Human-readable name
  // Details of the change
  previousValue: text("previousValue"), // JSON of previous state
  newValue: text("newValue"), // JSON of new state
  metadata: text("metadata"), // Additional context as JSON
  // Request context
  ipAddress: text("ipAddress", { length: 45 }),
  userAgent: text("userAgent", { length: 500 }),
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;


/**
 * Referrals - track user referrals and rewards
 */
export const referrals = sqliteTable("referrals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Referrer (who invited)
  referrerId: integer("referrerId").notNull(),
  referrerCode: text("referrerCode", { length: 20 }).notNull(),
  // Referred (who was invited)
  referredId: integer("referredId"),
  referredEmail: text("referredEmail", { length: 320 }),
  // Status
  status: text("status", ["pending", "signed_up", "converted", "rewarded"]).default("pending").notNull(),
  // Rewards
  referrerRewardType: text("referrerRewardType", ["tokens", "discount", "credit", "none"]).default("none"),
  referrerRewardAmount: integer("referrerRewardAmount").default(0),
  referrerRewardApplied: integer("referrerRewardApplied").default(false),
  referredRewardType: text("referredRewardType", ["tokens", "discount", "credit", "none"]).default("none"),
  referredRewardAmount: integer("referredRewardAmount").default(0),
  referredRewardApplied: integer("referredRewardApplied").default(false),
  // Timestamps
  invitedAt: integer("invitedAt").default(sql`(unixepoch())`).notNull(),
  signedUpAt: integer("signedUpAt"),
  convertedAt: integer("convertedAt"),
  rewardedAt: integer("rewardedAt"),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Support tickets - customer support system
 */
export const supportTickets = sqliteTable("supportTickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Ticket identification
  ticketNumber: text("ticketNumber", { length: 20 }).notNull().unique(),
  // User info
  userId: integer("userId"),
  userName: text("userName", { length: 255 }),
  userEmail: text("userEmail", { length: 320 }).notNull(),
  // Ticket details
  subject: text("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: text("category", [
    "billing", "technical", "account", "feature_request", "bug_report", "general"
  ]).default("general").notNull(),
  priority: text("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: text("status", ["open", "in_progress", "waiting_customer", "resolved", "closed"]).default("open").notNull(),
  // Assignment
  assignedToId: integer("assignedToId"),
  assignedToName: text("assignedToName", { length: 255 }),
  // Resolution
  resolution: text("resolution"),
  resolvedAt: integer("resolvedAt"),
  // Metadata
  attachments: text("attachments"), // JSON array of file URLs
  tags: text("tags"), // JSON array of tags
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
  firstResponseAt: integer("firstResponseAt"),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Support ticket messages - conversation thread
 */
export const ticketMessages = sqliteTable("ticketMessages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticketId: integer("ticketId").notNull(),
  // Sender info
  senderId: integer("senderId"),
  senderName: text("senderName", { length: 255 }).notNull(),
  senderEmail: text("senderEmail", { length: 320 }),
  isStaff: integer("isStaff").default(false).notNull(),
  // Message content
  message: text("message").notNull(),
  attachments: text("attachments"), // JSON array of file URLs
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = typeof ticketMessages.$inferInsert;

/**
 * Feature flags - A/B testing and feature rollout
 */
export const featureFlags = sqliteTable("featureFlags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Flag identification
  key: text("key", { length: 100 }).notNull().unique(),
  name: text("name", { length: 255 }).notNull(),
  description: text("description"),
  // Flag configuration
  isEnabled: integer("isEnabled").default(false).notNull(),
  rolloutPercentage: integer("rolloutPercentage").default(0), // 0-100
  // Targeting
  targetUserIds: text("targetUserIds"), // JSON array of user IDs
  targetRoles: text("targetRoles"), // JSON array of roles
  targetPlans: text("targetPlans"), // JSON array of plan types
  // A/B testing
  isExperiment: integer("isExperiment").default(false).notNull(),
  variants: text("variants"), // JSON array of variant configs
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
  expiresAt: integer("expiresAt"),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;

/**
 * Conversion events - track user actions for analytics
 */
export const conversionEvents = sqliteTable("conversionEvents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // User info
  userId: integer("userId"),
  sessionId: text("sessionId", { length: 100 }),
  // Event details
  eventType: text("eventType", [
    "page_view", "signup", "login", "calculator_start", "calculator_complete",
    "whitepaper_download", "contact_form", "pricing_view", "checkout_start",
    "checkout_complete", "subscription_start", "subscription_cancel",
    "case_submit", "case_approve", "certificate_view", "certificate_download"
  ]).notNull(),
  eventValue: text("eventValue", { length: 255 }), // e.g., page path, plan name
  // Attribution
  source: text("source", { length: 100 }), // utm_source
  medium: text("medium", { length: 100 }), // utm_medium
  campaign: text("campaign", { length: 100 }), // utm_campaign
  referrer: text("referrer", { length: 500 }),
  // Metadata
  metadata: text("metadata"), // JSON additional data
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type ConversionEvent = typeof conversionEvents.$inferSelect;
export type InsertConversionEvent = typeof conversionEvents.$inferInsert;

/**
 * Email campaigns - marketing automation
 */
export const emailCampaigns = sqliteTable("emailCampaigns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Campaign identification
  name: text("name", { length: 255 }).notNull(),
  description: text("description"),
  // Campaign type
  type: text("type", [
    "welcome", "onboarding", "trial_ending", "reengagement",
    "newsletter", "product_update", "promotional"
  ]).notNull(),
  // Email content
  subject: text("subject", { length: 255 }).notNull(),
  preheader: text("preheader", { length: 255 }),
  htmlContent: text("htmlContent").notNull(),
  textContent: text("textContent"),
  // Targeting
  targetSegment: text("targetSegment", [
    "all", "free_users", "paid_users", "trial_users", "inactive_users", "leads"
  ]).default("all").notNull(),
  // Schedule
  status: text("status", ["draft", "scheduled", "sending", "sent", "paused"]).default("draft").notNull(),
  scheduledAt: integer("scheduledAt"),
  sentAt: integer("sentAt"),
  // Stats
  totalRecipients: integer("totalRecipients").default(0),
  totalSent: integer("totalSent").default(0),
  totalOpened: integer("totalOpened").default(0),
  totalClicked: integer("totalClicked").default(0),
  totalUnsubscribed: integer("totalUnsubscribed").default(0),
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;


/**
 * Two-Factor Authentication (2FA) configuration per user.
 */
export const twoFactorAuth = sqliteTable("twoFactorAuth", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull().unique(),
  // TOTP secret (encrypted)
  secret: text("secret", { length: 255 }).notNull(),
  // Status
  isEnabled: integer("isEnabled").default(false).notNull(),
  isVerified: integer("isVerified").default(false).notNull(),
  // Backup codes (JSON array of hashed codes)
  backupCodes: text("backupCodes"),
  backupCodesUsed: integer("backupCodesUsed").default(0).notNull(),
  // Recovery
  recoveryEmail: text("recoveryEmail", { length: 320 }),
  recoveryPhone: text("recoveryPhone", { length: 20 }),
  // Audit
  lastUsedAt: integer("lastUsedAt"),
  failedAttempts: integer("failedAttempts").default(0).notNull(),
  lockedUntil: integer("lockedUntil"),
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type TwoFactorAuth = typeof twoFactorAuth.$inferSelect;
export type InsertTwoFactorAuth = typeof twoFactorAuth.$inferInsert;

/**
 * 2FA verification sessions - temporary tokens for login flow.
 */
export const twoFactorSessions = sqliteTable("twoFactorSessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  sessionToken: text("sessionToken", { length: 64 }).notNull().unique(),
  // Status
  isVerified: integer("isVerified").default(false).notNull(),
  verifiedAt: integer("verifiedAt"),
  // Expiration
  expiresAt: integer("expiresAt").notNull(),
  // Audit
  ipAddress: text("ipAddress", { length: 45 }),
  userAgent: text("userAgent", { length: 500 }),
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type TwoFactorSession = typeof twoFactorSessions.$inferSelect;
export type InsertTwoFactorSession = typeof twoFactorSessions.$inferInsert;

/**
 * User access tokens - API tokens for programmatic access.
 */
export const userAccessTokens = sqliteTable("userAccessTokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  // Token identification
  name: text("name", { length: 100 }).notNull(),
  description: text("description"),
  // Token value (hashed)
  tokenHash: text("tokenHash", { length: 64 }).notNull(),
  tokenPrefix: text("tokenPrefix", { length: 12 }).notNull(), // First 12 chars for identification
  // Permissions
  scopes: text("scopes"), // JSON array of allowed scopes
  // Rate limiting
  rateLimit: integer("rateLimit").default(1000).notNull(), // requests per hour
  rateLimitRemaining: integer("rateLimitRemaining").default(1000).notNull(),
  rateLimitResetAt: integer("rateLimitResetAt"),
  // Usage tracking
  lastUsedAt: integer("lastUsedAt"),
  usageCount: integer("usageCount").default(0).notNull(),
  // Status
  isActive: integer("isActive").default(true).notNull(),
  expiresAt: integer("expiresAt"),
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type UserAccessToken = typeof userAccessTokens.$inferSelect;
export type InsertUserAccessToken = typeof userAccessTokens.$inferInsert;

/**
 * Token usage logs - audit trail for API token usage.
 */
export const tokenUsageLogs = sqliteTable("tokenUsageLogs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tokenId: integer("tokenId").notNull(),
  userId: integer("userId").notNull(),
  // Request details
  endpoint: text("endpoint", { length: 255 }).notNull(),
  method: text("method", { length: 10 }).notNull(),
  statusCode: integer("statusCode"),
  responseTime: integer("responseTime"), // in milliseconds
  // Request context
  ipAddress: text("ipAddress", { length: 45 }),
  userAgent: text("userAgent", { length: 500 }),
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type TokenUsageLog = typeof tokenUsageLogs.$inferSelect;
export type InsertTokenUsageLog = typeof tokenUsageLogs.$inferInsert;


/**
 * Testimonials/Depoimentos - Depoimentos de clientes e parceiros
 */
export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }).notNull(),
  role: text("role", { length: 255 }).notNull(),
  company: text("company", { length: 255 }).notNull(),
  sector: text("sector", { length: 100 }).notNull(),
  content: text("content").notNull(),
  rating: integer("rating").default(5).notNull(),
  imageUrl: text("imageUrl", { length: 500 }),
  videoUrl: text("videoUrl", { length: 500 }),
  metrics: text("metrics"), // JSON array of {label, value}
  isActive: integer("isActive").default(true).notNull(),
  isFeatured: integer("isFeatured").default(false).notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  language: text("language", { length: 5 }).default("pt").notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

/**
 * Partners - Parceiros e organizações associadas
 */
export const partners = sqliteTable("partners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }).notNull(),
  description: text("description"),
  logoUrl: text("logoUrl", { length: 500 }),
  websiteUrl: text("websiteUrl", { length: 500 }),
  sector: text("sector", { length: 100 }),
  partnerType: text("partnerType", ["strategic", "technology", "implementation", "academic", "government", "ngo"]).default("strategic").notNull(),
  tier: text("tier", ["platinum", "gold", "silver", "bronze"]).default("silver").notNull(),
  isActive: integer("isActive").default(true).notNull(),
  isFeatured: integer("isFeatured").default(false).notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  contactName: text("contactName", { length: 255 }),
  contactEmail: text("contactEmail", { length: 320 }),
  partnerSince: integer("partnerSince"),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Social Proof Metrics - Métricas de prova social para landing page
 */
export const socialProofMetrics = sqliteTable("socialProofMetrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key", { length: 50 }).notNull().unique(), // e.g., "organizations", "beneficiaries", "sroi_avg"
  value: text("value", { length: 50 }).notNull(), // e.g., "500+", "2M+", "12x"
  label: text("label", { length: 255 }).notNull(),
  labelEn: text("labelEn", { length: 255 }),
  labelEs: text("labelEs", { length: 255 }),
  icon: text("icon", { length: 50 }), // Icon name from lucide-react
  displayOrder: integer("displayOrder").default(0).notNull(),
  isActive: integer("isActive").default(true).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type SocialProofMetric = typeof socialProofMetrics.$inferSelect;
export type InsertSocialProofMetric = typeof socialProofMetrics.$inferInsert;

/**
 * Platform Stats - Estatísticas reais da plataforma
 */
export const platformStats = sqliteTable("platformStats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: integer("date").notNull(),
  totalUsers: integer("totalUsers").default(0).notNull(),
  activeUsers: integer("activeUsers").default(0).notNull(),
  totalCalculations: integer("totalCalculations").default(0).notNull(),
  totalCases: integer("totalCases").default(0).notNull(),
  totalCertificates: integer("totalCertificates").default(0).notNull(),
  totalTokensIssued: integer("totalTokensIssued").default(0).notNull(),
  avgSroi: integer("avgSroi").default(0), // Stored as integer (e.g., 450 = 4.5x)
  totalImpactValue: integer("totalImpactValue").default(0), // In cents (use int for simplicity)
  totalBeneficiaries: integer("totalBeneficiaries").default(0),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type PlatformStat = typeof platformStats.$inferSelect;
export type InsertPlatformStat = typeof platformStats.$inferInsert;


// ============================================================================
// SET7 V3.0 COMPLIANCE TABLES
// ============================================================================

/**
 * SET7 TASKLOG - Ledger de microatividades auditável
 * Registra cada task, agente, tokens consumidos e tempo para ROI auditável
 */
export const set7Tasklog = sqliteTable("set7Tasklog", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: text("taskId", { length: 64 }).notNull().unique(), // UUID único da task
  
  // Identificação da task
  phase: text("phase", { length: 20 }).notNull(), // SET7.01, SET7.02, etc.
  taskType: text("taskType", ["planning", "execution", "validation", "documentation", "review"]).notNull(),
  taskName: text("taskName", { length: 255 }).notNull(),
  description: text("description"),
  
  // Agente responsável
  agentId: text("agentId", { length: 64 }).notNull(),
  agentType: text("agentType", ["vertical", "horizontal", "orchestrator", "human"]).notNull(),
  agentName: text("agentName", { length: 100 }).notNull(),
  
  // Taxonomia SET7
  taxonomyBase: text("taxonomyBase", { length: 10 }), // STR, PRD, ARC, etc.
  taxonomySubbase: text("taxonomySubbase", { length: 20 }),
  taxonomyTags: text("taxonomyTags"), // JSON array de tags
  
  // Métricas de execução
  tokensInput: integer("tokensInput").default(0).notNull(),
  tokensOutput: integer("tokensOutput").default(0).notNull(),
  tokensTotal: integer("tokensTotal").default(0).notNull(),
  modelUsed: text("modelUsed", { length: 50 }),
  executionTimeMs: integer("executionTimeMs").default(0).notNull(),
  
  // Custo
  costUsd: integer("costUsd").default(0).notNull(), // Em centavos de dólar
  
  // Status e resultado
  status: text("status", ["pending", "running", "completed", "failed", "cancelled"]).default("pending").notNull(),
  result: text("result"), // JSON com resultado
  errorMessage: text("errorMessage"),
  
  // Artefatos gerados
  outputArtifacts: text("outputArtifacts"), // JSON array de paths/URLs
  
  // Gate associado
  gateId: text("gateId", { length: 64 }),
  gateStatus: text("gateStatus", ["pending", "pass", "fail", "mitigation"]),
  
  // Timestamps
  startedAt: integer("startedAt"),
  completedAt: integer("completedAt"),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type Set7Tasklog = typeof set7Tasklog.$inferSelect;
export type InsertSet7Tasklog = typeof set7Tasklog.$inferInsert;

/**
 * SET7 Agentes - Registro de agentes do sistema
 */
export const set7Agents = sqliteTable("set7Agents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: text("agentId", { length: 64 }).notNull().unique(),
  
  // Identificação
  name: text("name", { length: 100 }).notNull(),
  description: text("description"),
  agentType: text("agentType", ["vertical", "horizontal", "orchestrator"]).notNull(),
  
  // Configuração
  phase: text("phase", { length: 20 }), // Para agentes verticais
  hookType: text("hookType", ["roi", "tokens", "quality", "security", "gtl"]), // Para agentes horizontais
  
  // Modelo e capabilities
  defaultModel: text("defaultModel", { length: 50 }).default("gpt-4o").notNull(),
  allowedModels: text("allowedModels"), // JSON array
  maxTokensPerRequest: integer("maxTokensPerRequest").default(4000).notNull(),
  maxTokensPerDay: integer("maxTokensPerDay").default(100000).notNull(),
  
  // Permissões
  permissions: text("permissions"), // JSON array de permissões
  canReadFiles: integer("canReadFiles").default(0).notNull(),
  canWriteFiles: integer("canWriteFiles").default(0).notNull(),
  canExecuteCode: integer("canExecuteCode").default(0).notNull(),
  canAccessNetwork: integer("canAccessNetwork").default(0).notNull(),
  canAccessDatabase: integer("canAccessDatabase").default(0).notNull(),
  
  // Status
  status: text("status", ["active", "paused", "disabled", "killed"]).default("active").notNull(),
  killSwitchTriggered: integer("killSwitchTriggered").default(0).notNull(),
  killSwitchReason: text("killSwitchReason"),
  killSwitchAt: integer("killSwitchAt"),
  
  // Métricas
  totalTasksExecuted: integer("totalTasksExecuted").default(0).notNull(),
  totalTokensUsed: integer("totalTokensUsed").default(0).notNull(),
  totalCostUsd: integer("totalCostUsd").default(0).notNull(),
  avgExecutionTimeMs: integer("avgExecutionTimeMs").default(0).notNull(),
  successRate: integer("successRate").default(100).notNull(), // Percentual
  
  // Timestamps
  lastActiveAt: integer("lastActiveAt"),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type Set7Agent = typeof set7Agents.$inferSelect;
export type InsertSet7Agent = typeof set7Agents.$inferInsert;

/**
 * SET7 Integration Identity - Hash/QR Code para integrações verificáveis
 */
export const set7Integrations = sqliteTable("set7Integrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  integrationId: text("integrationId", { length: 64 }).notNull().unique(),
  
  // Identificação
  name: text("name", { length: 255 }).notNull(),
  description: text("description"),
  integrationType: text("integrationType", ["api", "webhook", "database", "file", "service", "external"]).notNull(),
  
  // Contrato
  contractVersion: text("contractVersion", { length: 20 }).notNull(),
  contractSchema: text("contractSchema"), // JSON Schema
  endpointUrl: text("endpointUrl", { length: 500 }),
  httpMethod: text("httpMethod", { length: 10 }),
  
  // Identity (Hash SHA-256)
  identityHash: text("identityHash", { length: 64 }).notNull(), // SHA-256 do contrato + config
  previousHash: text("previousHash", { length: 64 }), // Para chain de versões
  
  // QR Code
  qrCodeData: text("qrCodeData"), // Base64 do QR Code
  qrCodeUrl: text("qrCodeUrl", { length: 500 }),
  
  // Verificação
  verificationStatus: text("verificationStatus", ["pending", "verified", "failed", "revoked"]).default("pending").notNull(),
  lastVerifiedAt: integer("lastVerifiedAt"),
  verificationCount: integer("verificationCount").default(0).notNull(),
  
  // Configuração
  config: text("config"), // JSON com configurações
  headers: text("headers"), // JSON com headers
  authentication: text("authentication"), // JSON com auth config
  
  // Status
  status: text("status", ["active", "deprecated", "disabled"]).default("active").notNull(),
  
  // Métricas
  totalCalls: integer("totalCalls").default(0).notNull(),
  successfulCalls: integer("successfulCalls").default(0).notNull(),
  failedCalls: integer("failedCalls").default(0).notNull(),
  avgResponseTimeMs: integer("avgResponseTimeMs").default(0).notNull(),
  
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type Set7Integration = typeof set7Integrations.$inferSelect;
export type InsertSet7Integration = typeof set7Integrations.$inferInsert;

/**
 * SET7 Token Budgets - Orçamento de tokens por fase/projeto/fluxo
 */
export const set7TokenBudgets = sqliteTable("set7TokenBudgets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  budgetId: text("budgetId", { length: 64 }).notNull().unique(),
  
  // Escopo do budget
  scope: text("scope", ["project", "phase", "flow", "agent", "user"]).notNull(),
  scopeId: text("scopeId", { length: 64 }).notNull(), // ID do projeto/fase/fluxo/agente/usuário
  scopeName: text("scopeName", { length: 255 }).notNull(),
  
  // Limites
  budgetTokens: integer("budgetTokens").notNull(), // Limite de tokens
  budgetUsd: integer("budgetUsd").notNull(), // Limite em centavos de dólar
  warningThreshold: integer("warningThreshold").default(80).notNull(), // Percentual para alerta
  criticalThreshold: integer("criticalThreshold").default(95).notNull(), // Percentual para bloqueio
  
  // Consumo atual
  usedTokens: integer("usedTokens").default(0).notNull(),
  usedUsd: integer("usedUsd").default(0).notNull(),
  
  // Período
  periodType: text("periodType", ["daily", "weekly", "monthly", "project", "unlimited"]).default("monthly").notNull(),
  periodStart: integer("periodStart"),
  periodEnd: integer("periodEnd"),
  
  // Status
  status: text("status", ["active", "warning", "critical", "exceeded", "paused"]).default("active").notNull(),
  
  // Circuit breaker
  circuitBreakerTriggered: integer("circuitBreakerTriggered").default(false).notNull(),
  circuitBreakerAt: integer("circuitBreakerAt"),
  circuitBreakerReason: text("circuitBreakerReason"),
  
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type Set7TokenBudget = typeof set7TokenBudgets.$inferSelect;
export type InsertSet7TokenBudget = typeof set7TokenBudgets.$inferInsert;

/**
 * SET7 Gates - Condições de avanço entre fases
 */
export const set7Gates = sqliteTable("set7Gates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gateId: text("gateId", { length: 64 }).notNull().unique(),
  
  // Identificação
  phase: text("phase", { length: 20 }).notNull(), // SET7.01, SET7.02, etc.
  gateName: text("gateName", { length: 255 }).notNull(),
  description: text("description"),
  
  // Modo de execução
  mode: text("mode", ["mvp", "standard", "enterprise", "regulated"]).default("standard").notNull(),
  
  // Checklist
  checklistItems: text("checklistItems"), // JSON array de itens
  requiredItems: text("requiredItems"), // JSON array de IDs obrigatórios
  
  // Status
  status: text("status", ["pending", "in_progress", "pass", "fail", "mitigation"]).default("pending").notNull(),
  
  // Evidências
  evidences: text("evidences"), // JSON array de URLs/paths
  
  // Mitigação (se status = mitigation)
  mitigationPlan: text("mitigationPlan"),
  mitigationDeadline: integer("mitigationDeadline"),
  mitigationApprovedBy: integer("mitigationApprovedBy"),
  
  // Aprovação
  approvedBy: integer("approvedBy"),
  approvedAt: integer("approvedAt"),
  humanApprovalRequired: integer("humanApprovalRequired").default(false).notNull(),
  
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type Set7Gate = typeof set7Gates.$inferSelect;
export type InsertSet7Gate = typeof set7Gates.$inferInsert;

/**
 * SET7 ROI Tracking - Rastreamento de ROI por fase
 */
export const set7RoiTracking = sqliteTable("set7RoiTracking", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  trackingId: text("trackingId", { length: 64 }).notNull().unique(),
  
  // Tipo de ROI
  roiType: text("roiType", ["baseline", "partial", "real", "final"]).notNull(),
  phase: text("phase", { length: 20 }), // Fase associada (para partial)
  
  // Métricas de custo
  plannedCostUsd: integer("plannedCostUsd").default(0).notNull(),
  actualCostUsd: integer("actualCostUsd").default(0).notNull(),
  plannedTokens: integer("plannedTokens").default(0).notNull(),
  actualTokens: integer("actualTokens").default(0).notNull(),
  plannedHours: integer("plannedHours").default(0).notNull(),
  actualHours: integer("actualHours").default(0).notNull(),
  
  // Métricas de valor
  plannedValueUsd: integer("plannedValueUsd").default(0).notNull(),
  actualValueUsd: integer("actualValueUsd").default(0).notNull(),
  
  // ROI calculado
  roiPercentage: integer("roiPercentage").default(0).notNull(), // Percentual * 100
  roiRatio: text("roiRatio", { length: 20 }), // e.g., "3.5:1"
  
  // Premissas
  assumptions: text("assumptions"), // JSON array de premissas
  
  // Desvios
  deviations: text("deviations"), // JSON array de desvios
  deviationAnalysis: text("deviationAnalysis"),
  
  // Documento
  documentUrl: text("documentUrl", { length: 500 }),
  documentHash: text("documentHash", { length: 64 }), // SHA-256 do documento
  
  // Timestamps
  calculatedAt: integer("calculatedAt").default(sql`(unixepoch())`).notNull(),
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type Set7RoiTracking = typeof set7RoiTracking.$inferSelect;
export type InsertSet7RoiTracking = typeof set7RoiTracking.$inferInsert;

/**
 * SET7 Runtime Config - Configuração do runtime S7L
 */
export const set7RuntimeConfig = sqliteTable("set7RuntimeConfig", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  configId: text("configId", { length: 64 }).notNull().unique(),
  
  // Modo de execução
  mode: text("mode", ["mvp", "standard", "enterprise", "regulated"]).default("standard").notNull(),
  
  // Hooks ativos
  hooksEnabled: text("hooksEnabled"), // JSON array de hooks ativos
  hookRoiEnabled: integer("hookRoiEnabled").default(true).notNull(),
  hookTokensEnabled: integer("hookTokensEnabled").default(true).notNull(),
  hookQualityEnabled: integer("hookQualityEnabled").default(true).notNull(),
  hookSecurityEnabled: integer("hookSecurityEnabled").default(true).notNull(),
  hookGtlEnabled: integer("hookGtlEnabled").default(true).notNull(),
  
  // Frequência dos hooks
  hookFrequency: text("hookFrequency", ["per_task", "per_phase", "daily", "weekly"]).default("per_phase").notNull(),
  
  // GTL (Go-to-Live)
  gtlType: text("gtlType", ["saas", "on_premise", "hybrid", "api_only"]).default("saas").notNull(),
  gtlPlans: text("gtlPlans"), // JSON com planos disponíveis
  
  // Configurações de tokens
  defaultTokenBudget: integer("defaultTokenBudget").default(100000).notNull(),
  modelRouting: text("modelRouting"), // JSON com regras de roteamento
  
  // Configurações de gates
  gateProfile: text("gateProfile"), // JSON com perfil de gates por modo
  humanApprovalPhases: text("humanApprovalPhases"), // JSON array de fases que requerem aprovação humana
  
  // Status
  isActive: integer("isActive").default(true).notNull(),
  
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type Set7RuntimeConfig = typeof set7RuntimeConfig.$inferSelect;
export type InsertSet7RuntimeConfig = typeof set7RuntimeConfig.$inferInsert;

/**
 * SET7 Audit Log - Log de auditoria para compliance
 */
export const set7AuditLog = sqliteTable("set7AuditLog", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  auditId: text("auditId", { length: 64 }).notNull().unique(),
  
  // Tipo de evento
  eventType: text("eventType", [
    "task_created", "task_completed", "task_failed",
    "gate_passed", "gate_failed", "gate_mitigated",
    "agent_started", "agent_stopped", "agent_killed",
    "budget_warning", "budget_exceeded", "circuit_breaker",
    "integration_verified", "integration_failed",
    "roi_calculated", "config_changed"
  ]).notNull(),
  
  // Contexto
  phase: text("phase", { length: 20 }),
  agentId: text("agentId", { length: 64 }),
  taskId: text("taskId", { length: 64 }),
  gateId: text("gateId", { length: 64 }),
  integrationId: text("integrationId", { length: 64 }),
  
  // Detalhes
  description: text("description").notNull(),
  details: text("details"), // JSON com detalhes adicionais
  
  // Usuário (se ação humana)
  userId: integer("userId"),
  userName: text("userName", { length: 255 }),
  
  // Severidade
  severity: text("severity", ["info", "warning", "error", "critical"]).default("info").notNull(),
  
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
});

export type Set7AuditLog = typeof set7AuditLog.$inferSelect;
export type InsertSet7AuditLog = typeof set7AuditLog.$inferInsert;

/**
 * SET7 NFRs - Matriz de Qualidades (Non-Functional Requirements)
 * 15 dimensões de qualidade conforme SET7.01
 */
export const set7Nfrs = sqliteTable("set7Nfrs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nfrId: text("nfrId", { length: 64 }).notNull().unique(),
  
  // Identificação
  projectId: text("projectId", { length: 64 }),
  phase: text("phase", { length: 20 }), // Fase associada
  
  // Dimensão NFR (15 dimensões SET7)
  dimension: text("dimension", [
    "architecture",      // Arquitetura e modularidade
    "microservices",     // Microsserviços e responsabilidade
    "whitelabel",        // White label e multi-instâncias
    "ux_usability",      // UX/Usabilidade
    "accessibility",     // Acessibilidade (WCAG 2.2 AA)
    "voice",             // Voz / navegação por voz
    "avatars",           // Avatares / multimodalidade
    "gamification",      // Gamificação
    "security",          // Segurança (Zero Trust)
    "governance",        // Governança e auditoria
    "performance",       // Performance e escalabilidade
    "observability",     // Observabilidade
    "availability",      // Disponibilidade e resiliência
    "sovereignty",       // Soberania (dados/modelos)
    "cognitive_efficiency" // Eficiência cognitiva (tokens)
  ]).notNull(),
  
  // Detalhes
  title: text("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Priorização
  priority: text("priority", ["P0", "P1", "P2"]).default("P1").notNull(),
  
  // Critérios de medição
  measurementCriteria: text("measurementCriteria"), // JSON com critérios
  targetValue: text("targetValue", { length: 100 }), // Valor alvo
  currentValue: text("currentValue", { length: 100 }), // Valor atual
  
  // Status
  status: text("status", ["not_started", "in_progress", "met", "not_met", "na"]).default("not_started").notNull(),
  
  // Evidências
  evidences: text("evidences"), // JSON array de evidências
  
  // Responsável
  ownerId: integer("ownerId"),
  ownerName: text("ownerName", { length: 255 }),
  
  // Timestamps
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type Set7Nfr = typeof set7Nfrs.$inferSelect;
export type InsertSet7Nfr = typeof set7Nfrs.$inferInsert;

export type InsertSet7Nfr = typeof set7Nfrs.$inferInsert;

/**
 * White Label Configuration table for multi-tenant branding.
 */
export const whiteLabelConfig = sqliteTable("white_label_config", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  organizationId: text("organizationId", { length: 255 }).notNull().unique(),
  
  // Branding
  platformName: text("platformName", { length: 255 }).default("IMPACT7").notNull(),
  logoUrl: text("logoUrl", { length: 500 }),
  faviconUrl: text("faviconUrl", { length: 500 }),
  
  // Colors
  primaryColor: text("primaryColor", { length: 7 }).default("#ff6b35"),
  secondaryColor: text("secondaryColor", { length: 7 }).default("#004e89"),
  accentColor: text("accentColor", { length: 7 }).default("#f7931e"),
  
  // Typography
  fontFamily: text("fontFamily", { length: 100 }).default("Inter"),
  
  // Domain
  customDomain: text("customDomain", { length: 255 }),
  
  // Contact
  supportEmail: text("supportEmail", { length: 320 }),
  supportPhone: text("supportPhone", { length: 20 }),
  
  // Social
  websiteUrl: text("websiteUrl", { length: 500 }),
  linkedinUrl: text("linkedinUrl", { length: 500 }),
  twitterUrl: text("twitterUrl", { length: 500 }),
  
  // Metadata
  createdAt: integer("createdAt").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(unixepoch())`).notNull(),
});

export type WhiteLabelConfig = typeof whiteLabelConfig.$inferSelect;
export type InsertWhiteLabelConfig = typeof whiteLabelConfig.$inferInsert;
