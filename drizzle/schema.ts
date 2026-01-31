import { mysqlTable, int, varchar, text, decimal, timestamp } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(), // Unique for local auth
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role").default("user").notNull(), // user, manager, admin
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  subscriptionStatus: text("subscriptionStatus").default("none"), // active, canceled, past_due, trialing, none
  planType: text("planType").default("free"), // free, starter, professional, enterprise
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
  lastSignedIn: int("lastSignedIn").notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Leads table for contact form submissions and whitepaper downloads.
 */
export const leads = mysqlTable("leads", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull(),
  organization: varchar("organization", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  message: text("message"),
  source: text("source").default("contact_form").notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
  welcomeEmailSent: int("welcomeEmailSent").default(0).notNull(),
  nurturingStep: int("nurturingStep").default(0).notNull(),
  lastEmailSentAt: int("lastEmailSentAt"),
  unsubscribed: int("unsubscribed").default(0).notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Newsletter subscriptions.
 */
export const newsletterSubscribers = mysqlTable("newsletterSubscribers", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  segment: text("segment").default("general").notNull(),
  interests: text("interests"),
  isActive: int("isActive").default(1).notNull(),
  confirmedAt: int("confirmedAt"),
  unsubscribedAt: int("unsubscribedAt"),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

/**
 * User calculations history for impact calculator.
 */
export const calculations = mysqlTable("calculations", {
  id: int("id").primaryKey().autoincrement(),
  sessionId: varchar("sessionId", { length: 64 }),
  userId: int("userId"),
  projectName: varchar("projectName", { length: 255 }),
  investment: int("investment").notNull(),
  contextScore: int("contextScore").notNull(),
  resistanceScore: int("resistanceScore").notNull(),
  beneficiaries: int("beneficiaries").notNull(),
  duration: int("duration").notNull(),
  impactScore: int("impactScore").notNull(),
  sRoi: int("sRoi").notNull(),
  sector: varchar("sector", { length: 100 }),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type Calculation = typeof calculations.$inferSelect;
export type InsertCalculation = typeof calculations.$inferInsert;

/**
 * Ebook downloads tracking.
 */
export const ebookDownloads = mysqlTable("ebookDownloads", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  organization: varchar("organization", { length: 255 }),
  role: varchar("role", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  source: varchar("source", { length: 100 }).default("website"),
  downloadedAt: int("downloadedAt").notNull(),
  emailSent: int("emailSent").default(0).notNull(),
});

export type EbookDownload = typeof ebookDownloads.$inferSelect;
export type InsertEbookDownload = typeof ebookDownloads.$inferInsert;

/**
 * Whitepaper downloads tracking.
 */
export const whitepaperDownloads = mysqlTable("whitepaperDownloads", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  organization: varchar("organization", { length: 255 }),
  downloadedAt: int("downloadedAt").notNull(),
});

export type WhitepaperDownload = typeof whitepaperDownloads.$inferSelect;
export type InsertWhitepaperDownload = typeof whitepaperDownloads.$inferInsert;

/**
 * Contact form submissions.
 */
export const contacts = mysqlTable("contacts", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  status: text("status").default("new").notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

/**
 * Jarvis chat sessions.
 */
export const jarvisSessions = mysqlTable("jarvisSessions", {
  id: int("id").primaryKey().autoincrement(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  userId: int("userId"),
  context: text("context"),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type JarvisSession = typeof jarvisSessions.$inferSelect;
export type InsertJarvisSession = typeof jarvisSessions.$inferInsert;

/**
 * Jarvis chat messages.
 */
export const jarvisMessages = mysqlTable("jarvisMessages", {
  id: int("id").primaryKey().autoincrement(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type JarvisMessage = typeof jarvisMessages.$inferSelect;
export type InsertJarvisMessage = typeof jarvisMessages.$inferInsert;

/**
 * Knowledge base documents for RAG.
 */
export const knowledgeDocuments = mysqlTable("knowledgeDocuments", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  tags: text("tags"),
  embedding: text("embedding"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect;
export type InsertKnowledgeDocument = typeof knowledgeDocuments.$inferInsert;

/**
 * Site analytics and metrics.
 */
export const siteMetrics = mysqlTable("siteMetrics", {
  id: int("id").primaryKey().autoincrement(),
  metricType: varchar("metricType", { length: 50 }).notNull(),
  metricValue: int("metricValue").notNull(),
  metricDate: int("metricDate").notNull(),
  metadata: text("metadata"),
});

export type SiteMetric = typeof siteMetrics.$inferSelect;
export type InsertSiteMetric = typeof siteMetrics.$inferInsert;


/**
 * Jarvis interaction analytics.
 */
export const jarvisAnalytics = mysqlTable("jarvisAnalytics", {
  id: int("id").primaryKey().autoincrement(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  userId: int("userId"),
  interactionType: text("interactionType").notNull(),
  query: text("query"),
  skillUsed: varchar("skillUsed", { length: 50 }),
  responseTime: int("responseTime"), // in milliseconds
  tokensUsed: int("tokensUsed"),
  successful: int("successful").default(1).notNull(),
  errorMessage: text("errorMessage"),
  userFeedback: text("userFeedback"),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type JarvisAnalytic = typeof jarvisAnalytics.$inferSelect;
export type InsertJarvisAnalytic = typeof jarvisAnalytics.$inferInsert;

/**
 * Lead conversion tracking.
 */
export const leadConversions = mysqlTable("leadConversions", {
  id: int("id").primaryKey().autoincrement(),
  leadId: int("leadId").notNull(),
  conversionType: text("conversionType").notNull(),
  sourcePage: varchar("sourcePage", { length: 255 }),
  sourceForm: varchar("sourceForm", { length: 100 }),
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  referrer: varchar("referrer", { length: 500 }),
  deviceType: text("deviceType"),
  browser: varchar("browser", { length: 50 }),
  country: varchar("country", { length: 100 }),
  convertedAt: int("convertedAt").notNull(),
});

export type LeadConversion = typeof leadConversions.$inferSelect;
export type InsertLeadConversion = typeof leadConversions.$inferInsert;

/**
 * Page view analytics.
 */
export const pageViews = mysqlTable("pageViews", {
  id: int("id").primaryKey().autoincrement(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  userId: int("userId"),
  pagePath: varchar("pagePath", { length: 255 }).notNull(),
  pageTitle: varchar("pageTitle", { length: 255 }),
  referrer: varchar("referrer", { length: 500 }),
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  deviceType: text("deviceType"),
  browser: varchar("browser", { length: 50 }),
  country: varchar("country", { length: 100 }),
  timeOnPage: int("timeOnPage"), // in seconds
  scrollDepth: int("scrollDepth"), // percentage 0-100
  viewedAt: int("viewedAt").notNull(),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

/**
 * Daily aggregated metrics.
 */
export const dailyMetrics = mysqlTable("dailyMetrics", {
  id: int("id").primaryKey().autoincrement(),
  metricDate: int("metricDate").notNull(),
  totalPageViews: int("totalPageViews").default(0).notNull(),
  uniqueVisitors: int("uniqueVisitors").default(0).notNull(),
  totalLeads: int("totalLeads").default(0).notNull(),
  totalConversions: int("totalConversions").default(0).notNull(),
  jarvisInteractions: int("jarvisInteractions").default(0).notNull(),
  calculatorUses: int("calculatorUses").default(0).notNull(),
  ebookDownloads: int("ebookDownloads").default(0).notNull(),
  whitepaperDownloads: int("whitepaperDownloads").default(0).notNull(),
  avgTimeOnSite: int("avgTimeOnSite").default(0), // in seconds
  bounceRate: int("bounceRate").default(0), // percentage 0-100
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type DailyMetric = typeof dailyMetrics.$inferSelect;
export type InsertDailyMetric = typeof dailyMetrics.$inferInsert;


/**
 * Case favorites - users can save cases for later.
 */
export const caseFavorites = mysqlTable("caseFavorites", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  caseId: int("caseId").notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type CaseFavorite = typeof caseFavorites.$inferSelect;
export type InsertCaseFavorite = typeof caseFavorites.$inferInsert;

/**
 * Case submissions - organizations can submit their own cases.
 */
export const caseSubmissions = mysqlTable("caseSubmissions", {
  id: int("id").primaryKey().autoincrement(),
  organizationName: varchar("organizationName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 20 }),
  projectTitle: varchar("projectTitle", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 100 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  investment: varchar("investment", { length: 100 }).notNull(),
  beneficiaries: varchar("beneficiaries", { length: 100 }).notNull(),
  duration: varchar("duration", { length: 100 }).notNull(),
  description: text("description").notNull(),
  challenge: text("challenge").notNull(),
  solution: text("solution").notNull(),
  results: text("results").notNull(),
  metrics: text("metrics"), // JSON string
  documentUrl: varchar("documentUrl", { length: 500 }),
  status: text("status").default("pending").notNull(),
  reviewNotes: text("reviewNotes"),
  reviewedAt: int("reviewedAt"),
  reviewedBy: int("reviewedBy"),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type CaseSubmission = typeof caseSubmissions.$inferSelect;
export type InsertCaseSubmission = typeof caseSubmissions.$inferInsert;


/**
 * Tags for cases - customizable labels for organization
 */
export const caseTags = mysqlTable("caseTags", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 7 }).default("#f97316").notNull(), // hex color
  description: text("description"),
  createdBy: int("createdBy").notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type CaseTag = typeof caseTags.$inferSelect;
export type InsertCaseTag = typeof caseTags.$inferInsert;

/**
 * Junction table for case-tag relationships
 */
export const caseTagRelations = mysqlTable("caseTagRelations", {
  id: int("id").primaryKey().autoincrement(),
  caseId: int("caseId").notNull(),
  tagId: int("tagId").notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type CaseTagRelation = typeof caseTagRelations.$inferSelect;
export type InsertCaseTagRelation = typeof caseTagRelations.$inferInsert;


/**
 * User points for gamification
 */
export const userPoints = mysqlTable("userPoints", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  points: int("points").default(0).notNull(),
  level: int("level").default(1).notNull(),
  totalInteractions: int("totalInteractions").default(0).notNull(),
  streak: int("streak").default(0).notNull(), // consecutive days
  lastInteractionAt: int("lastInteractionAt"),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type UserPoints = typeof userPoints.$inferSelect;
export type InsertUserPoints = typeof userPoints.$inferInsert;

/**
 * Badge definitions
 */
export const badges = mysqlTable("badges", {
  id: int("id").primaryKey().autoincrement(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).notNull(), // emoji or icon name
  color: varchar("color", { length: 7 }).default("#f97316").notNull(),
  requirement: varchar("requirement", { length: 50 }).notNull(), // e.g., "interactions_10", "streak_7"
  requiredValue: int("requiredValue").notNull(),
  pointsReward: int("pointsReward").default(100).notNull(),
  rarity: text("rarity").default("common").notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * User earned badges
 */
export const userBadges = mysqlTable("userBadges", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  earnedAt: int("earnedAt").notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

/**
 * Point transactions log
 */
export const pointTransactions = mysqlTable("pointTransactions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  points: int("points").notNull(), // positive or negative
  reason: varchar("reason", { length: 100 }).notNull(),
  metadata: text("metadata"), // JSON with extra info
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = typeof pointTransactions.$inferInsert;

/**
 * API keys for public API access
 */
export const apiKeys = mysqlTable("apiKeys", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  keyHash: varchar("keyHash", { length: 64 }).notNull(), // SHA-256 hash
  keyPrefix: varchar("keyPrefix", { length: 8 }).notNull(), // First 8 chars for identification
  permissions: text("permissions"), // JSON array of allowed endpoints
  rateLimit: int("rateLimit").default(1000).notNull(), // requests per hour
  lastUsedAt: int("lastUsedAt"),
  expiresAt: int("expiresAt").$type<number>(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;


/**
 * Webhooks for external integrations
 */
export const webhooks = mysqlTable("webhooks", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  secret: varchar("secret", { length: 64 }).notNull(), // For signature verification
  events: text("events").notNull(), // JSON array of subscribed events
  isActive: int("isActive").default(1).notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

/**
 * Webhook delivery logs
 */
export const webhookDeliveries = mysqlTable("webhookDeliveries", {
  id: int("id").primaryKey().autoincrement(),
  webhookId: int("webhookId").notNull(),
  event: varchar("event", { length: 50 }).notNull(),
  payload: text("payload").notNull(), // JSON payload sent
  responseStatus: int("responseStatus"),
  responseBody: text("responseBody"),
  attempts: int("attempts").default(1).notNull(),
  nextRetryAt: int("nextRetryAt"),
  deliveredAt: int("deliveredAt").$type<number>(),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type InsertWebhookDelivery = typeof webhookDeliveries.$inferInsert;

/**
 * OAuth2 clients for API authentication
 */
export const oauthClients = mysqlTable("oauthClients", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(), // Owner of the OAuth app
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  clientId: varchar("clientId", { length: 64 }).notNull().unique(),
  clientSecretHash: varchar("clientSecretHash", { length: 64 }).notNull(),
  redirectUris: text("redirectUris").notNull(), // JSON array
  scopes: text("scopes").notNull(), // JSON array of allowed scopes
  isActive: int("isActive").default(1).notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type OAuthClient = typeof oauthClients.$inferSelect;
export type InsertOAuthClient = typeof oauthClients.$inferInsert;

/**
 * OAuth2 authorization codes
 */
export const oauthAuthCodes = mysqlTable("oauthAuthCodes", {
  id: int("id").primaryKey().autoincrement(),
  clientId: varchar("clientId", { length: 64 }).notNull(),
  userId: int("userId").notNull(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  redirectUri: varchar("redirectUri", { length: 500 }).notNull(),
  scopes: text("scopes").notNull(), // JSON array
  codeChallenge: varchar("codeChallenge", { length: 128 }), // PKCE
  codeChallengeMethod: varchar("codeChallengeMethod", { length: 10 }), // plain or S256
  expiresAt: int("expiresAt").$type<number>().notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type OAuthAuthCode = typeof oauthAuthCodes.$inferSelect;
export type InsertOAuthAuthCode = typeof oauthAuthCodes.$inferInsert;

/**
 * OAuth2 access tokens
 */
export const oauthTokens = mysqlTable("oauthTokens", {
  id: int("id").primaryKey().autoincrement(),
  clientId: varchar("clientId", { length: 64 }).notNull(),
  userId: int("userId").notNull(),
  accessToken: varchar("accessToken", { length: 64 }).notNull().unique(),
  refreshToken: varchar("refreshToken", { length: 64 }).unique(),
  scopes: text("scopes").notNull(), // JSON array
  accessTokenExpiresAt: int("accessTokenExpiresAt").notNull(),
  refreshTokenExpiresAt: int("refreshTokenExpiresAt"),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type OAuthToken = typeof oauthTokens.$inferSelect;
export type InsertOAuthToken = typeof oauthTokens.$inferInsert;


/**
 * Jarvis long-term memory for persistent context per user.
 */
export const jarvisMemory = mysqlTable("jarvisMemory", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  memoryType: text("memoryType").notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(),
  importance: int("importance").default(5).notNull(), // 1-10 scale
  lastAccessed: int("lastAccessed").notNull(),
  accessCount: int("accessCount").default(1).notNull(),
  expiresAt: int("expiresAt").$type<number>(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type JarvisMemory = typeof jarvisMemory.$inferSelect;
export type InsertJarvisMemory = typeof jarvisMemory.$inferInsert;

/**
 * Jarvis generated reports for users.
 */
export const jarvisReports = mysqlTable("jarvisReports", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  reportType: text("reportType").notNull(),
  content: text("content").notNull(), // JSON or Markdown content
  summary: text("summary"),
  metrics: text("metrics"), // JSON with key metrics
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  wordUrl: varchar("wordUrl", { length: 500 }),
  status: text("status").default("generating").notNull(),
  generatedAt: int("generatedAt"),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type JarvisReport = typeof jarvisReports.$inferSelect;
export type InsertJarvisReport = typeof jarvisReports.$inferInsert;

/**
 * Impact certificates with blockchain-style verification.
 */
export const impactCertificates = mysqlTable("impactCertificates", {
  id: int("id").primaryKey().autoincrement(),
  certificateId: varchar("certificateId", { length: 64 }).notNull().unique(), // Unique public ID
  userId: int("userId"),
  organizationName: varchar("organizationName", { length: 255 }).notNull(),
  projectName: varchar("projectName", { length: 255 }).notNull(),
  projectDescription: text("projectDescription"),
  
  // Impact metrics
  totalInvestment: int("totalInvestment").notNull(),
  beneficiaries: int("beneficiaries").notNull(),
  sRoi: int("sRoi").notNull(), // Stored as percentage * 100
  impactScore: int("impactScore").notNull(),
  sector: varchar("sector", { length: 100 }).notNull(),
  sdgs: text("sdgs"), // JSON array of SDG numbers
  
  // Blockchain-style verification
  previousHash: varchar("previousHash", { length: 64 }), // Hash of previous certificate (chain)
  dataHash: varchar("dataHash", { length: 64 }).notNull(), // SHA-256 hash of certificate data
  merkleRoot: varchar("merkleRoot", { length: 64 }), // Merkle root for batch verification
  blockNumber: int("blockNumber"), // Simulated block number
  
  // Verification
  verificationStatus: text("verificationStatus").default("pending").notNull(),
  verifiedBy: int("verifiedBy"),
  verifiedAt: int("verifiedAt"),
  
  // Metadata
  issuedAt: int("issuedAt").notNull(),
  validUntil: int("validUntil").$type<number>(),
  qrCodeUrl: varchar("qrCodeUrl", { length: 500 }),
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type ImpactCertificate = typeof impactCertificates.$inferSelect;
export type InsertImpactCertificate = typeof impactCertificates.$inferInsert;

/**
 * Social Impact Tokens (SIT) - Tokenized impact credits.
 */
export const impactTokens = mysqlTable("impactTokens", {
  id: int("id").primaryKey().autoincrement(),
  tokenId: varchar("tokenId", { length: 64 }).notNull().unique(),
  userId: int("userId"),
  organizationId: int("organizationId"),
  certificateId: int("certificateId"), // Link to certificate
  
  // Token details
  tokenType: text("tokenType").notNull(),
  amount: int("amount").default(1).notNull(),
  value: int("value").default(0).notNull(), // Value in cents
  
  // Metadata
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  metadata: text("metadata"), // JSON with additional data
  
  // Transfer history
  previousOwner: int("previousOwner"),
  transferCount: int("transferCount").default(0).notNull(),
  
  // Status
  status: text("status").default("active").notNull(),
  mintedAt: int("mintedAt").notNull(),
  expiresAt: int("expiresAt").$type<number>(),
  
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type ImpactToken = typeof impactTokens.$inferSelect;
export type InsertImpactToken = typeof impactTokens.$inferInsert;

/**
 * Token transactions for audit trail.
 */
export const tokenTransactions = mysqlTable("tokenTransactions", {
  id: int("id").primaryKey().autoincrement(),
  tokenId: int("tokenId").notNull(),
  transactionType: text("transactionType").notNull(),
  fromUserId: int("fromUserId"),
  toUserId: int("toUserId"),
  amount: int("amount").default(1).notNull(),
  transactionHash: varchar("transactionHash", { length: 64 }).notNull(), // SHA-256 hash
  previousTransactionHash: varchar("previousTransactionHash", { length: 64 }),
  metadata: text("metadata"), // JSON
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = typeof tokenTransactions.$inferInsert;

/**
 * User language preferences.
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull().unique(),
  language: varchar("language", { length: 10 }).default("pt").notNull(),
  theme: text("theme").default("system").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("America/Sao_Paulo").notNull(),
  emailNotifications: int("emailNotifications").default(1).notNull(),
  pushNotifications: int("pushNotifications").default(1).notNull(),
  weeklyDigest: int("weeklyDigest").default(1).notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;


/**
 * User notifications table for persistent notification storage.
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  type: text("type").default("info").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  isRead: int("isRead").default(0).notNull(),
  metadata: text("metadata").$type<Record<string, unknown>>(),
  createdAt: int("createdAt").$type<number>().notNull(),
  readAt: int("readAt"),
  emailSentAt: int("emailSentAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * User notification preferences - allows users to customize which notifications they receive
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  // Notification type preferences (true = enabled, false = disabled)
  infoEnabled: int("infoEnabled").default(1).notNull(),
  successEnabled: int("successEnabled").default(1).notNull(),
  warningEnabled: int("warningEnabled").default(1).notNull(),
  errorEnabled: int("errorEnabled").default(1).notNull(),
  casePendingEnabled: int("casePendingEnabled").default(1).notNull(),
  caseApprovedEnabled: int("caseApprovedEnabled").default(1).notNull(),
  caseRejectedEnabled: int("caseRejectedEnabled").default(1).notNull(),
  certificateIssuedEnabled: int("certificateIssuedEnabled").default(1).notNull(),
  tokenEarnedEnabled: int("tokenEarnedEnabled").default(1).notNull(),
  systemEnabled: int("systemEnabled").default(1).notNull(),
  // Email preferences
  emailEnabled: int("emailEnabled").default(1).notNull(),
  emailDigestFrequency: text("emailDigestFrequency").default("instant").notNull(),
  // Push preferences
  pushEnabled: int("pushEnabled").default(1).notNull(),
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;


/**
 * Notification templates - customizable templates for automated notifications
 */
export const notificationTemplates = mysqlTable("notificationTemplates", {
  id: int("id").primaryKey().autoincrement(),
  // Template identification
  code: varchar("code", { length: 100 }).notNull().unique(), // e.g., "case_approved", "certificate_issued"
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // Template type
  type: text("type").notNull(),
  // Template content
  titleTemplate: varchar("titleTemplate", { length: 255 }).notNull(), // e.g., "Seu case {{caseName}} foi aprovado!"
  messageTemplate: text("messageTemplate").notNull(), // e.g., "Parabéns! O case {{caseName}} foi aprovado em {{approvalDate}}."
  // Available variables (JSON array of variable names)
  availableVariables: text("availableVariables"), // e.g., '["caseName", "approvalDate", "reviewerName"]'
  // Status
  isActive: int("isActive").default(1).notNull(),
  isSystem: int("isSystem").default(0).notNull(), // System templates cannot be deleted
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
  createdBy: int("createdBy"),
});

export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate = typeof notificationTemplates.$inferInsert;


/**
 * System settings - persistent configuration for the platform
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").primaryKey().autoincrement(),
  // Setting identification
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  // Metadata
  description: varchar("description", { length: 255 }),
  category: text("category").default("general").notNull(),
  // Type hint for parsing
  valueType: text("valueType").default("string").notNull(),
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;


/**
 * Audit logs - track administrative actions for compliance and traceability
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").primaryKey().autoincrement(),
  // Who performed the action
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  userEmail: varchar("userEmail", { length: 255 }),
  // What action was performed
  action: text("action").notNull(),
  // What resource was affected
  resourceType: varchar("resourceType", { length: 100 }).notNull(), // e.g., "case", "user", "setting"
  resourceId: varchar("resourceId", { length: 100 }), // ID of the affected resource
  resourceName: varchar("resourceName", { length: 255 }), // Human-readable name
  // Details of the change
  previousValue: text("previousValue"), // JSON of previous state
  newValue: text("newValue"), // JSON of new state
  metadata: text("metadata"), // Additional context as JSON
  // Request context
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;


/**
 * Referrals - track user referrals and rewards
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").primaryKey().autoincrement(),
  // Referrer (who invited)
  referrerId: int("referrerId").notNull(),
  referrerCode: varchar("referrerCode", { length: 20 }).notNull(),
  // Referred (who was invited)
  referredId: int("referredId"),
  referredEmail: varchar("referredEmail", { length: 320 }),
  // Status
  status: text("status").default("pending").notNull(),
  // Rewards
  referrerRewardType: text("referrerRewardType").default("none"),
  referrerRewardAmount: int("referrerRewardAmount").default(0),
  referrerRewardApplied: int("referrerRewardApplied").default(0),
  referredRewardType: text("referredRewardType").default("none"),
  referredRewardAmount: int("referredRewardAmount").default(0),
  referredRewardApplied: int("referredRewardApplied").default(0),
  // Timestamps
  invitedAt: int("invitedAt").notNull(),
  signedUpAt: int("signedUpAt"),
  convertedAt: int("convertedAt"),
  rewardedAt: int("rewardedAt"),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Support tickets - customer support system
 */
export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").primaryKey().autoincrement(),
  // Ticket identification
  ticketNumber: varchar("ticketNumber", { length: 20 }).notNull().unique(),
  // User info
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  userEmail: varchar("userEmail", { length: 320 }).notNull(),
  // Ticket details
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: text("category").default("general").notNull(),
  priority: text("priority").default("medium").notNull(),
  status: text("status").default("open").notNull(),
  // Assignment
  assignedToId: int("assignedToId"),
  assignedToName: varchar("assignedToName", { length: 255 }),
  // Resolution
  resolution: text("resolution"),
  resolvedAt: int("resolvedAt"),
  // Metadata
  attachments: text("attachments"), // JSON array of file URLs
  tags: text("tags"), // JSON array of tags
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
  firstResponseAt: int("firstResponseAt"),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Support ticket messages - conversation thread
 */
export const ticketMessages = mysqlTable("ticketMessages", {
  id: int("id").primaryKey().autoincrement(),
  ticketId: int("ticketId").notNull(),
  // Sender info
  senderId: int("senderId"),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  senderEmail: varchar("senderEmail", { length: 320 }),
  isStaff: int("isStaff").default(0).notNull(),
  // Message content
  message: text("message").notNull(),
  attachments: text("attachments"), // JSON array of file URLs
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = typeof ticketMessages.$inferInsert;

/**
 * Feature flags - A/B testing and feature rollout
 */
export const featureFlags = mysqlTable("featureFlags", {
  id: int("id").primaryKey().autoincrement(),
  // Flag identification
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // Flag configuration
  isEnabled: int("isEnabled").default(0).notNull(),
  rolloutPercentage: int("rolloutPercentage").default(0), // 0-100
  // Targeting
  targetUserIds: text("targetUserIds"), // JSON array of user IDs
  targetRoles: text("targetRoles"), // JSON array of roles
  targetPlans: text("targetPlans"), // JSON array of plan types
  // A/B testing
  isExperiment: int("isExperiment").default(0).notNull(),
  variants: text("variants"), // JSON array of variant configs
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
  expiresAt: int("expiresAt").$type<number>(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;

/**
 * Conversion events - track user actions for analytics
 */
export const conversionEvents = mysqlTable("conversionEvents", {
  id: int("id").primaryKey().autoincrement(),
  // User info
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 100 }),
  // Event details
  eventType: text("eventType").notNull(),
  eventValue: varchar("eventValue", { length: 255 }), // e.g., page path, plan name
  // Attribution
  source: varchar("source", { length: 100 }), // utm_source
  medium: varchar("medium", { length: 100 }), // utm_medium
  campaign: varchar("campaign", { length: 100 }), // utm_campaign
  referrer: varchar("referrer", { length: 500 }),
  // Metadata
  metadata: text("metadata"), // JSON additional data
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type ConversionEvent = typeof conversionEvents.$inferSelect;
export type InsertConversionEvent = typeof conversionEvents.$inferInsert;

/**
 * Email campaigns - marketing automation
 */
export const emailCampaigns = mysqlTable("emailCampaigns", {
  id: int("id").primaryKey().autoincrement(),
  // Campaign identification
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // Campaign type
  type: text("type").notNull(),
  // Email content
  subject: varchar("subject", { length: 255 }).notNull(),
  preheader: varchar("preheader", { length: 255 }),
  htmlContent: text("htmlContent").notNull(),
  textContent: text("textContent"),
  // Targeting
  targetSegment: text("targetSegment").default("all").notNull(),
  // Schedule
  status: text("status").default("draft").notNull(),
  scheduledAt: int("scheduledAt"),
  sentAt: int("sentAt").$type<number>(),
  // Stats
  totalRecipients: int("totalRecipients").default(0),
  totalSent: int("totalSent").default(0),
  totalOpened: int("totalOpened").default(0),
  totalClicked: int("totalClicked").default(0),
  totalUnsubscribed: int("totalUnsubscribed").default(0),
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;


/**
 * Two-Factor Authentication (2FA) configuration per user.
 */
export const twoFactorAuth = mysqlTable("twoFactorAuth", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull().unique(),
  // TOTP secret (encrypted)
  secret: varchar("secret", { length: 255 }).notNull(),
  // Status
  isEnabled: int("isEnabled").default(0).notNull(),
  isVerified: int("isVerified").default(0).notNull(),
  // Backup codes (JSON array of hashed codes)
  backupCodes: text("backupCodes"),
  backupCodesUsed: int("backupCodesUsed").default(0).notNull(),
  // Recovery
  recoveryEmail: varchar("recoveryEmail", { length: 320 }),
  recoveryPhone: varchar("recoveryPhone", { length: 20 }),
  // Audit
  lastUsedAt: int("lastUsedAt"),
  failedAttempts: int("failedAttempts").default(0).notNull(),
  lockedUntil: int("lockedUntil"),
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type TwoFactorAuth = typeof twoFactorAuth.$inferSelect;
export type InsertTwoFactorAuth = typeof twoFactorAuth.$inferInsert;

/**
 * 2FA verification sessions - temporary tokens for login flow.
 */
export const twoFactorSessions = mysqlTable("twoFactorSessions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  sessionToken: varchar("sessionToken", { length: 64 }).notNull().unique(),
  // Status
  isVerified: int("isVerified").default(0).notNull(),
  verifiedAt: int("verifiedAt"),
  // Expiration
  expiresAt: int("expiresAt").$type<number>().notNull(),
  // Audit
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type TwoFactorSession = typeof twoFactorSessions.$inferSelect;
export type InsertTwoFactorSession = typeof twoFactorSessions.$inferInsert;

/**
 * User access tokens - API tokens for programmatic access.
 */
export const userAccessTokens = mysqlTable("userAccessTokens", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  // Token identification
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  // Token value (hashed)
  tokenHash: varchar("tokenHash", { length: 64 }).notNull(),
  tokenPrefix: varchar("tokenPrefix", { length: 12 }).notNull(), // First 12 chars for identification
  // Permissions
  scopes: text("scopes"), // JSON array of allowed scopes
  // Rate limiting
  rateLimit: int("rateLimit").default(1000).notNull(), // requests per hour
  rateLimitRemaining: int("rateLimitRemaining").default(1000).notNull(),
  rateLimitResetAt: int("rateLimitResetAt"),
  // Usage tracking
  lastUsedAt: int("lastUsedAt"),
  usageCount: int("usageCount").default(0).notNull(),
  // Status
  isActive: int("isActive").default(1).notNull(),
  expiresAt: int("expiresAt").$type<number>(),
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type UserAccessToken = typeof userAccessTokens.$inferSelect;
export type InsertUserAccessToken = typeof userAccessTokens.$inferInsert;

/**
 * Token usage logs - audit trail for API token usage.
 */
export const tokenUsageLogs = mysqlTable("tokenUsageLogs", {
  id: int("id").primaryKey().autoincrement(),
  tokenId: int("tokenId").notNull(),
  userId: int("userId").notNull(),
  // Request details
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  statusCode: int("statusCode"),
  responseTime: int("responseTime"), // in milliseconds
  // Request context
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type TokenUsageLog = typeof tokenUsageLogs.$inferSelect;
export type InsertTokenUsageLog = typeof tokenUsageLogs.$inferInsert;


/**
 * Testimonials/Depoimentos - Depoimentos de clientes e parceiros
 */
export const testimonials = mysqlTable("testimonials", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 100 }).notNull(),
  content: text("content").notNull(),
  rating: int("rating").default(5).notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  videoUrl: varchar("videoUrl", { length: 500 }),
  metrics: text("metrics"), // JSON array of {label, value}
  isActive: int("isActive").default(1).notNull(),
  isFeatured: int("isFeatured").default(0).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  language: varchar("language", { length: 5 }).default("pt").notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

/**
 * Partners - Parceiros e organizações associadas
 */
export const partners = mysqlTable("partners", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }),
  description: text("description"),
  logo: varchar("logo", { length: 1000 }),
  website: varchar("website", { length: 1000 }),
  partnerType: varchar("partnerType", { length: 100 }),
  status: varchar("status", { length: 50 }),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
  isActive: int("isActive").default(1).notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Social Proof Metrics - Métricas de prova social para landing page
 */
export const socialProofMetrics = mysqlTable("socialProofMetrics", {
  id: int("id").primaryKey().autoincrement(),
  key: varchar("key", { length: 50 }).notNull().unique(), // e.g., "organizations", "beneficiaries", "sroi_avg"
  value: varchar("value", { length: 50 }).notNull(), // e.g., "500+", "2M+", "12x"
  label: varchar("label", { length: 255 }).notNull(),
  labelEn: varchar("labelEn", { length: 255 }),
  labelEs: varchar("labelEs", { length: 255 }),
  icon: varchar("icon", { length: 50 }), // Icon name from lucide-react
  displayOrder: int("displayOrder").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type SocialProofMetric = typeof socialProofMetrics.$inferSelect;
export type InsertSocialProofMetric = typeof socialProofMetrics.$inferInsert;

/**
 * Platform Stats - Estatísticas reais da plataforma
 */
export const platformStats = mysqlTable("platformStats", {
  id: int("id").primaryKey().autoincrement(),
  date: int("date").$type<number>().notNull(),
  totalUsers: int("totalUsers").default(0).notNull(),
  activeUsers: int("activeUsers").default(0).notNull(),
  totalCalculations: int("totalCalculations").default(0).notNull(),
  totalCases: int("totalCases").default(0).notNull(),
  totalCertificates: int("totalCertificates").default(0).notNull(),
  totalTokensIssued: int("totalTokensIssued").default(0).notNull(),
  avgSroi: int("avgSroi").default(0), // Stored as integer (e.g., 450 = 4.5x)
  totalImpactValue: int("totalImpactValue").default(0), // In cents (use int for simplicity)
  totalBeneficiaries: int("totalBeneficiaries").default(0),
  createdAt: int("createdAt").$type<number>().notNull(),
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
export const set7Tasklog = mysqlTable("set7Tasklog", {
  id: int("id").primaryKey().autoincrement(),
  taskId: varchar("taskId", { length: 64 }).notNull().unique(), // UUID único da task
  
  // Identificação da task
  phase: varchar("phase", { length: 20 }).notNull(), // SET7.01, SET7.02, etc.
  taskType: text("taskType").notNull(),
  taskName: varchar("taskName", { length: 255 }).notNull(),
  description: text("description"),
  
  // Agente responsável
  agentId: varchar("agentId", { length: 64 }).notNull(),
  agentType: text("agentType").notNull(),
  agentName: varchar("agentName", { length: 100 }).notNull(),
  
  // Taxonomia SET7
  taxonomyBase: varchar("taxonomyBase", { length: 10 }), // STR, PRD, ARC, etc.
  taxonomySubbase: varchar("taxonomySubbase", { length: 20 }),
  taxonomyTags: text("taxonomyTags"), // JSON array de tags
  
  // Métricas de execução
  tokensInput: int("tokensInput").default(0).notNull(),
  tokensOutput: int("tokensOutput").default(0).notNull(),
  tokensTotal: int("tokensTotal").default(0).notNull(),
  modelUsed: varchar("modelUsed", { length: 50 }),
  executionTimeMs: int("executionTimeMs").default(0).notNull(),
  
  // Custo
  costUsd: int("costUsd").default(0).notNull(), // Em centavos de dólar
  
  // Status e resultado
  status: text("status").default("pending").notNull(),
  result: text("result"), // JSON com resultado
  errorMessage: text("errorMessage"),
  
  // Artefatos gerados
  outputArtifacts: text("outputArtifacts"), // JSON array de paths/URLs
  
  // Gate associado
  gateId: varchar("gateId", { length: 64 }),
  gateStatus: text("gateStatus"),
  
  // Timestamps
  startedAt: int("startedAt"),
  completedAt: int("completedAt").$type<number>(),
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type Set7Tasklog = typeof set7Tasklog.$inferSelect;
export type InsertSet7Tasklog = typeof set7Tasklog.$inferInsert;

/**
 * SET7 Agentes - Registro de agentes do sistema
 */
export const set7Agents = mysqlTable("set7Agents", {
  id: int("id").primaryKey().autoincrement(),
  agentId: varchar("agentId", { length: 64 }).notNull().unique(),
  
  // Identificação
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  agentType: text("agentType").notNull(),
  
  // Configuração
  phase: varchar("phase", { length: 20 }), // Para agentes verticais
  hookType: text("hookType"), // Para agentes horizontais
  
  // Modelo e capabilities
  defaultModel: varchar("defaultModel", { length: 50 }).default("gpt-4o").notNull(),
  allowedModels: text("allowedModels"), // JSON array
  maxTokensPerRequest: int("maxTokensPerRequest").default(4000).notNull(),
  maxTokensPerDay: int("maxTokensPerDay").default(100000).notNull(),
  
  // Permissões
  permissions: text("permissions"), // JSON array de permissões
  canReadFiles: int("canReadFiles").default(0).notNull(),
  canWriteFiles: int("canWriteFiles").default(0).notNull(),
  canExecuteCode: int("canExecuteCode").default(0).notNull(),
  canAccessNetwork: int("canAccessNetwork").default(0).notNull(),
  canAccessDatabase: int("canAccessDatabase").default(0).notNull(),
  
  // Status
  status: text("status").default("active").notNull(),
  killSwitchTriggered: int("killSwitchTriggered").default(0).notNull(),
  killSwitchReason: text("killSwitchReason"),
  killSwitchAt: int("killSwitchAt"),
  
  // Métricas
  totalTasksExecuted: int("totalTasksExecuted").default(0).notNull(),
  totalTokensUsed: int("totalTokensUsed").default(0).notNull(),
  totalCostUsd: int("totalCostUsd").default(0).notNull(),
  avgExecutionTimeMs: int("avgExecutionTimeMs").default(0).notNull(),
  successRate: int("successRate").default(100).notNull(), // Percentual
  
  // Timestamps
  lastActiveAt: int("lastActiveAt"),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type Set7Agent = typeof set7Agents.$inferSelect;
export type InsertSet7Agent = typeof set7Agents.$inferInsert;

/**
 * SET7 Integration Identity - Hash/QR Code para integrações verificáveis
 */
export const set7Integrations = mysqlTable("set7Integrations", {
  id: int("id").primaryKey().autoincrement(),
  integrationId: varchar("integrationId", { length: 64 }).notNull().unique(),
  
  // Identificação
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  integrationType: text("integrationType").notNull(),
  
  // Contrato
  contractVersion: varchar("contractVersion", { length: 20 }).notNull(),
  contractSchema: text("contractSchema"), // JSON Schema
  endpointUrl: varchar("endpointUrl", { length: 500 }),
  httpMethod: varchar("httpMethod", { length: 10 }),
  
  // Identity (Hash SHA-256)
  identityHash: varchar("identityHash", { length: 64 }).notNull(), // SHA-256 do contrato + config
  previousHash: varchar("previousHash", { length: 64 }), // Para chain de versões
  
  // QR Code
  qrCodeData: text("qrCodeData"), // Base64 do QR Code
  qrCodeUrl: varchar("qrCodeUrl", { length: 500 }),
  
  // Verificação
  verificationStatus: text("verificationStatus").default("pending").notNull(),
  lastVerifiedAt: int("lastVerifiedAt"),
  verificationCount: int("verificationCount").default(0).notNull(),
  
  // Configuração
  config: text("config"), // JSON com configurações
  headers: text("headers"), // JSON com headers
  authentication: text("authentication"), // JSON com auth config
  
  // Status
  status: text("status").default("active").notNull(),
  
  // Métricas
  totalCalls: int("totalCalls").default(0).notNull(),
  successfulCalls: int("successfulCalls").default(0).notNull(),
  failedCalls: int("failedCalls").default(0).notNull(),
  avgResponseTimeMs: int("avgResponseTimeMs").default(0).notNull(),
  
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type Set7Integration = typeof set7Integrations.$inferSelect;
export type InsertSet7Integration = typeof set7Integrations.$inferInsert;

/**
 * SET7 Token Budgets - Orçamento de tokens por fase/projeto/fluxo
 */
export const set7TokenBudgets = mysqlTable("set7TokenBudgets", {
  id: int("id").primaryKey().autoincrement(),
  budgetId: varchar("budgetId", { length: 64 }).notNull().unique(),
  
  // Escopo do budget
  scope: text("scope").notNull(),
  scopeId: varchar("scopeId", { length: 64 }).notNull(), // ID do projeto/fase/fluxo/agente/usuário
  scopeName: varchar("scopeName", { length: 255 }).notNull(),
  
  // Limites
  budgetTokens: int("budgetTokens").notNull(), // Limite de tokens
  budgetUsd: int("budgetUsd").notNull(), // Limite em centavos de dólar
  warningThreshold: int("warningThreshold").default(80).notNull(), // Percentual para alerta
  criticalThreshold: int("criticalThreshold").default(95).notNull(), // Percentual para bloqueio
  
  // Consumo atual
  usedTokens: int("usedTokens").default(0).notNull(),
  usedUsd: int("usedUsd").default(0).notNull(),
  
  // Período
  periodType: text("periodType").default("monthly").notNull(),
  periodStart: int("periodStart"),
  periodEnd: int("periodEnd"),
  
  // Status
  status: text("status").default("active").notNull(),
  
  // Circuit breaker
  circuitBreakerTriggered: int("circuitBreakerTriggered").default(0).notNull(),
  circuitBreakerAt: int("circuitBreakerAt"),
  circuitBreakerReason: text("circuitBreakerReason"),
  
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type Set7TokenBudget = typeof set7TokenBudgets.$inferSelect;
export type InsertSet7TokenBudget = typeof set7TokenBudgets.$inferInsert;

/**
 * SET7 Gates - Condições de avanço entre fases
 */
export const set7Gates = mysqlTable("set7Gates", {
  id: int("id").primaryKey().autoincrement(),
  gateId: varchar("gateId", { length: 64 }).notNull().unique(),
  
  // Identificação
  phase: varchar("phase", { length: 20 }).notNull(), // SET7.01, SET7.02, etc.
  gateName: varchar("gateName", { length: 255 }).notNull(),
  description: text("description"),
  
  // Modo de execução
  mode: text("mode").default("standard").notNull(),
  
  // Checklist
  checklistItems: text("checklistItems"), // JSON array de itens
  requiredItems: text("requiredItems"), // JSON array de IDs obrigatórios
  
  // Status
  status: text("status").default("pending").notNull(),
  
  // Evidências
  evidences: text("evidences"), // JSON array de URLs/paths
  
  // Mitigação (se status = mitigation)
  mitigationPlan: text("mitigationPlan"),
  mitigationDeadline: int("mitigationDeadline"),
  mitigationApprovedBy: int("mitigationApprovedBy"),
  
  // Aprovação
  approvedBy: int("approvedBy"),
  approvedAt: int("approvedAt").$type<number>(),
  humanApprovalRequired: int("humanApprovalRequired").default(0).notNull(),
  
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type Set7Gate = typeof set7Gates.$inferSelect;
export type InsertSet7Gate = typeof set7Gates.$inferInsert;

/**
 * SET7 ROI Tracking - Rastreamento de ROI por fase
 */
export const set7RoiTracking = mysqlTable("set7RoiTracking", {
  id: int("id").primaryKey().autoincrement(),
  trackingId: varchar("trackingId", { length: 64 }).notNull().unique(),
  
  // Tipo de ROI
  roiType: text("roiType").notNull(),
  phase: varchar("phase", { length: 20 }), // Fase associada (para partial)
  
  // Métricas de custo
  plannedCostUsd: int("plannedCostUsd").default(0).notNull(),
  actualCostUsd: int("actualCostUsd").default(0).notNull(),
  plannedTokens: int("plannedTokens").default(0).notNull(),
  actualTokens: int("actualTokens").default(0).notNull(),
  plannedHours: int("plannedHours").default(0).notNull(),
  actualHours: int("actualHours").default(0).notNull(),
  
  // Métricas de valor
  plannedValueUsd: int("plannedValueUsd").default(0).notNull(),
  actualValueUsd: int("actualValueUsd").default(0).notNull(),
  
  // ROI calculado
  roiPercentage: int("roiPercentage").default(0).notNull(), // Percentual * 100
  roiRatio: varchar("roiRatio", { length: 20 }), // e.g., "3.5:1"
  
  // Premissas
  assumptions: text("assumptions"), // JSON array de premissas
  
  // Desvios
  deviations: text("deviations"), // JSON array de desvios
  deviationAnalysis: text("deviationAnalysis"),
  
  // Documento
  documentUrl: varchar("documentUrl", { length: 500 }),
  documentHash: varchar("documentHash", { length: 64 }), // SHA-256 do documento
  
  // Timestamps
  calculatedAt: int("calculatedAt").notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type Set7RoiTracking = typeof set7RoiTracking.$inferSelect;
export type InsertSet7RoiTracking = typeof set7RoiTracking.$inferInsert;

/**
 * SET7 Runtime Config - Configuração do runtime S7L
 */
export const set7RuntimeConfig = mysqlTable("set7RuntimeConfig", {
  id: int("id").primaryKey().autoincrement(),
  configId: varchar("configId", { length: 64 }).notNull().unique(),
  
  // Modo de execução
  mode: text("mode").default("standard").notNull(),
  
  // Hooks ativos
  hooksEnabled: text("hooksEnabled"), // JSON array de hooks ativos
  hookRoiEnabled: int("hookRoiEnabled").default(1).notNull(),
  hookTokensEnabled: int("hookTokensEnabled").default(1).notNull(),
  hookQualityEnabled: int("hookQualityEnabled").default(1).notNull(),
  hookSecurityEnabled: int("hookSecurityEnabled").default(1).notNull(),
  hookGtlEnabled: int("hookGtlEnabled").default(1).notNull(),
  
  // Frequência dos hooks
  hookFrequency: text("hookFrequency").default("per_phase").notNull(),
  
  // GTL (Go-to-Live)
  gtlType: text("gtlType").default("saas").notNull(),
  gtlPlans: text("gtlPlans"), // JSON com planos disponíveis
  
  // Configurações de tokens
  defaultTokenBudget: int("defaultTokenBudget").default(100000).notNull(),
  modelRouting: text("modelRouting"), // JSON com regras de roteamento
  
  // Configurações de gates
  gateProfile: text("gateProfile"), // JSON com perfil de gates por modo
  humanApprovalPhases: text("humanApprovalPhases"), // JSON array de fases que requerem aprovação humana
  
  // Status
  isActive: int("isActive").default(1).notNull(),
  
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type Set7RuntimeConfig = typeof set7RuntimeConfig.$inferSelect;
export type InsertSet7RuntimeConfig = typeof set7RuntimeConfig.$inferInsert;

/**
 * SET7 Audit Log - Log de auditoria para compliance
 */
export const set7AuditLog = mysqlTable("set7AuditLog", {
  id: int("id").primaryKey().autoincrement(),
  auditId: varchar("auditId", { length: 64 }).notNull().unique(),
  
  // Tipo de evento
  eventType: text("eventType").notNull(),
  
  // Contexto
  phase: varchar("phase", { length: 20 }),
  agentId: varchar("agentId", { length: 64 }),
  taskId: varchar("taskId", { length: 64 }),
  gateId: varchar("gateId", { length: 64 }),
  integrationId: varchar("integrationId", { length: 64 }),
  
  // Detalhes
  description: text("description").notNull(),
  details: text("details"), // JSON com detalhes adicionais
  
  // Usuário (se ação humana)
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  
  // Severidade
  severity: text("severity").default("info").notNull(),
  
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
});

export type Set7AuditLog = typeof set7AuditLog.$inferSelect;
export type InsertSet7AuditLog = typeof set7AuditLog.$inferInsert;

/**
 * SET7 NFRs - Matriz de Qualidades (Non-Functional Requirements)
 * 15 dimensões de qualidade conforme SET7.01
 */
export const set7Nfrs = mysqlTable("set7Nfrs", {
  id: int("id").primaryKey().autoincrement(),
  nfrId: varchar("nfrId", { length: 64 }).notNull().unique(),
  
  // Identificação
  projectId: varchar("projectId", { length: 64 }),
  phase: varchar("phase", { length: 20 }), // Fase associada
  
  // Dimensão NFR (15 dimensões SET7)
  dimension: text("dimension").notNull(),
  
  // Detalhes
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Priorização
  priority: text("priority").default("P1").notNull(),
  
  // Critérios de medição
  measurementCriteria: text("measurementCriteria"), // JSON com critérios
  targetValue: varchar("targetValue", { length: 100 }), // Valor alvo
  currentValue: varchar("currentValue", { length: 100 }), // Valor atual
  
  // Status
  status: text("status").default("not_started").notNull(),
  
  // Evidências
  evidences: text("evidences"), // JSON array de evidências
  
  // Responsável
  ownerId: int("ownerId"),
  ownerName: varchar("ownerName", { length: 255 }),
  
  // Timestamps
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type Set7Nfr = typeof set7Nfrs.$inferSelect;
export type InsertSet7Nfr = typeof set7Nfrs.$inferInsert;

export type InsertSet7Nfr = typeof set7Nfrs.$inferInsert;

/**
 * White Label Configuration table for multi-tenant branding.
 */
export const whiteLabelConfig = mysqlTable("white_label_config", {
  id: int("id").primaryKey().autoincrement(),
  organizationId: varchar("organizationId", { length: 255 }).notNull().unique(),
  
  // Branding
  platformName: varchar("platformName", { length: 255 }).default("IMPACT7").notNull(),
  logoUrl: varchar("logoUrl", { length: 500 }),
  faviconUrl: varchar("faviconUrl", { length: 500 }),
  
  // Colors
  primaryColor: varchar("primaryColor", { length: 7 }).default("#ff6b35"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#004e89"),
  accentColor: varchar("accentColor", { length: 7 }).default("#f7931e"),
  
  // Typography
  fontFamily: varchar("fontFamily", { length: 100 }).default("Inter"),
  
  // Domain
  customDomain: varchar("customDomain", { length: 255 }),
  
  // Contact
  supportEmail: varchar("supportEmail", { length: 320 }),
  supportPhone: varchar("supportPhone", { length: 20 }),
  
  // Social
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  twitterUrl: varchar("twitterUrl", { length: 500 }),
  
  // Metadata
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type WhiteLabelConfig = typeof whiteLabelConfig.$inferSelect;
export type InsertWhiteLabelConfig = typeof whiteLabelConfig.$inferInsert;

/**
 * RBAC (Role-Based Access Control) Tables
 */

// Roles table
export const roles = mysqlTable("roles", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  level: int("level").notNull().default(0),
  isActive: int("isActive").notNull().default(1),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

// Permissions table
export const permissions = mysqlTable("permissions", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  isActive: int("isActive").notNull().default(1),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

// RolePermissions junction table
export const rolePermissions = mysqlTable("rolePermissions", {
  id: int("id").primaryKey().autoincrement(),
  roleId: int("roleId").notNull(),
  permissionId: int("permissionId").notNull(),
  assignedAt: int("assignedAt").notNull(),
});

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;

// UserRoles junction table
export const userRoles = mysqlTable("userRoles", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  roleId: int("roleId").notNull(),
  assignedAt: int("assignedAt").notNull(),
});

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;
