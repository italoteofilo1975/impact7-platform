import { pgTable, integer, bigint, serial, varchar, text, numeric, jsonb, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(), // Unique for local auth
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role").default("user").notNull(), // user, manager, admin
  // Achado A.1 do BACKLOG_Plataforma_Auditoria_14_Processos: tenantId nulavel, a organizacao
  // (alianca) a que esta conta pertence. Usuarios de plataforma sem vinculo (admin global,
  // visitante que so se cadastrou no site) legitimamente nao tem tenant; operadores de uma
  // iniciativa tem. E a partir daqui, e so daqui, que o tenantId de uma sessao autenticada e
  // resolvido — nunca mais aceito como valor livre vindo do input do chamador
  // (ver server/services/tenancy/tenant-context.ts, resolveTenantForUser).
  tenantId: integer("tenantId"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  subscriptionStatus: text("subscriptionStatus").default("none"), // active, canceled, past_due, trialing, none
  planType: text("planType").default("free"), // free, starter, professional, enterprise
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  lastSignedIn: bigint("lastSignedIn", { mode: "number" }).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Leads table for contact form submissions and whitepaper downloads.
 */
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull(),
  organization: varchar("organization", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  message: text("message"),
  source: text("source").default("contact_form").notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  welcomeEmailSent: integer("welcomeEmailSent").default(0).notNull(),
  nurturingStep: integer("nurturingStep").default(0).notNull(),
  lastEmailSentAt: bigint("lastEmailSentAt", { mode: "number" }),
  unsubscribed: integer("unsubscribed").default(0).notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Newsletter subscriptions.
 */
export const newsletterSubscribers = pgTable("newsletterSubscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  segment: text("segment").default("general").notNull(),
  interests: text("interests"),
  isActive: integer("isActive").default(1).notNull(),
  confirmedAt: bigint("confirmedAt", { mode: "number" }),
  unsubscribedAt: bigint("unsubscribedAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

/**
 * User calculations history for the public S-ROI simulator (calculator.calculate).
 *
 * Redesenhada para guardar as variaveis reais da formula honesta de shared/sroi-calculator.ts
 * (gatilhos, transformacoes, valores em centavos, descontos em basis points) em vez das
 * colunas da equacao ficticia anterior (contextScore/resistanceScore/impactScore, "I = (E x
 * C^7) / R", nunca derivada de nada real). Estas linhas continuam sendo SIMULACOES publicas
 * com numeros digitados por visitantes anonimos -- nunca S-ROI auditado de iniciativa real
 * (esse fica em initiativeParams/registry-service.ts, com tenant e trilha de auditoria).
 */
export const calculations = pgTable("calculations", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }),
  userId: integer("userId"),
  projectName: varchar("projectName", { length: 255 }),
  sector: varchar("sector", { length: 100 }),
  gatilhos: integer("gatilhos").default(0).notNull(),
  transformacoes: integer("transformacoes").default(0).notNull(),
  valorGatilhoCents: integer("valorGatilhoCents").default(0).notNull(),
  valorTransformacaoCents: integer("valorTransformacaoCents").default(0).notNull(),
  atribuicaoBps: integer("atribuicaoBps").default(0).notNull(),
  deadweightBps: integer("deadweightBps").default(0).notNull(),
  dropOffBps: integer("dropOffBps").default(0).notNull(),
  custoImtsCents: integer("custoImtsCents").default(0).notNull(),
  // Resultados derivados, guardados so para exibir o historico sem recalcular.
  valorSocialBrutoCents: integer("valorSocialBrutoCents").default(0).notNull(),
  valorSocialCents: integer("valorSocialCents").default(0).notNull(),
  sRoi: integer("sRoi").default(0).notNull(), // sroi * 100 (2 casas decimais)
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type Calculation = typeof calculations.$inferSelect;
export type InsertCalculation = typeof calculations.$inferInsert;

/**
 * Ebook downloads tracking.
 */
export const ebookDownloads = pgTable("ebookDownloads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  organization: varchar("organization", { length: 255 }),
  role: varchar("role", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  source: varchar("source", { length: 100 }).default("website"),
  downloadedAt: bigint("downloadedAt", { mode: "number" }).notNull(),
  emailSent: integer("emailSent").default(0).notNull(),
});

export type EbookDownload = typeof ebookDownloads.$inferSelect;
export type InsertEbookDownload = typeof ebookDownloads.$inferInsert;

/**
 * Whitepaper downloads tracking.
 */
export const whitepaperDownloads = pgTable("whitepaperDownloads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  organization: varchar("organization", { length: 255 }),
  downloadedAt: bigint("downloadedAt", { mode: "number" }).notNull(),
});

export type WhitepaperDownload = typeof whitepaperDownloads.$inferSelect;
export type InsertWhitepaperDownload = typeof whitepaperDownloads.$inferInsert;

/**
 * Contact form submissions.
 */
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  status: text("status").default("new").notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

/**
 * Jarvis chat sessions.
 */
export const jarvisSessions = pgTable("jarvisSessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  userId: integer("userId"),
  context: text("context"),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type JarvisSession = typeof jarvisSessions.$inferSelect;
export type InsertJarvisSession = typeof jarvisSessions.$inferInsert;

/**
 * Jarvis chat messages.
 */
export const jarvisMessages = pgTable("jarvisMessages", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type JarvisMessage = typeof jarvisMessages.$inferSelect;
export type InsertJarvisMessage = typeof jarvisMessages.$inferInsert;

/**
 * Knowledge base documents for RAG.
 */
export const knowledgeDocuments = pgTable("knowledgeDocuments", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  tags: text("tags"),
  embedding: text("embedding"),
  isActive: integer("isActive").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect;
export type InsertKnowledgeDocument = typeof knowledgeDocuments.$inferInsert;

/**
 * Site analytics and metrics.
 */
export const siteMetrics = pgTable("siteMetrics", {
  id: serial("id").primaryKey(),
  metricType: varchar("metricType", { length: 50 }).notNull(),
  metricValue: integer("metricValue").notNull(),
  metricDate: integer("metricDate").notNull(),
  metadata: text("metadata"),
});

export type SiteMetric = typeof siteMetrics.$inferSelect;
export type InsertSiteMetric = typeof siteMetrics.$inferInsert;


/**
 * Jarvis interaction analytics.
 */
export const jarvisAnalytics = pgTable("jarvisAnalytics", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  userId: integer("userId"),
  interactionType: text("interactionType").notNull(),
  query: text("query"),
  skillUsed: varchar("skillUsed", { length: 50 }),
  responseTime: integer("responseTime"), // in milliseconds
  tokensUsed: integer("tokensUsed"),
  successful: integer("successful").default(1).notNull(),
  errorMessage: text("errorMessage"),
  userFeedback: text("userFeedback"),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type JarvisAnalytic = typeof jarvisAnalytics.$inferSelect;
export type InsertJarvisAnalytic = typeof jarvisAnalytics.$inferInsert;

/**
 * Lead conversion tracking.
 */
export const leadConversions = pgTable("leadConversions", {
  id: serial("id").primaryKey(),
  leadId: integer("leadId").notNull(),
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
  convertedAt: bigint("convertedAt", { mode: "number" }).notNull(),
});

export type LeadConversion = typeof leadConversions.$inferSelect;
export type InsertLeadConversion = typeof leadConversions.$inferInsert;

/**
 * Page view analytics.
 */
export const pageViews = pgTable("pageViews", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  userId: integer("userId"),
  pagePath: varchar("pagePath", { length: 255 }).notNull(),
  pageTitle: varchar("pageTitle", { length: 255 }),
  referrer: varchar("referrer", { length: 500 }),
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  deviceType: text("deviceType"),
  browser: varchar("browser", { length: 50 }),
  country: varchar("country", { length: 100 }),
  timeOnPage: integer("timeOnPage"), // in seconds
  scrollDepth: integer("scrollDepth"), // percentage 0-100
  viewedAt: bigint("viewedAt", { mode: "number" }).notNull(),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

/**
 * Daily aggregated metrics.
 */
export const dailyMetrics = pgTable("dailyMetrics", {
  id: serial("id").primaryKey(),
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
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type DailyMetric = typeof dailyMetrics.$inferSelect;
export type InsertDailyMetric = typeof dailyMetrics.$inferInsert;


/**
 * Case favorites - users can save cases for later.
 */
export const caseFavorites = pgTable("caseFavorites", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  caseId: integer("caseId").notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type CaseFavorite = typeof caseFavorites.$inferSelect;
export type InsertCaseFavorite = typeof caseFavorites.$inferInsert;

/**
 * Case submissions - organizations can submit their own cases.
 */
export const caseSubmissions = pgTable("caseSubmissions", {
  id: serial("id").primaryKey(),
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
  reviewedAt: bigint("reviewedAt", { mode: "number" }),
  reviewedBy: integer("reviewedBy"),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type CaseSubmission = typeof caseSubmissions.$inferSelect;
export type InsertCaseSubmission = typeof caseSubmissions.$inferInsert;


/**
 * Tags for cases - customizable labels for organization
 */
export const caseTags = pgTable("caseTags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 7 }).default("#f97316").notNull(), // hex color
  description: text("description"),
  createdBy: integer("createdBy").notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type CaseTag = typeof caseTags.$inferSelect;
export type InsertCaseTag = typeof caseTags.$inferInsert;

/**
 * Junction table for case-tag relationships
 */
export const caseTagRelations = pgTable("caseTagRelations", {
  id: serial("id").primaryKey(),
  caseId: integer("caseId").notNull(),
  tagId: integer("tagId").notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type CaseTagRelation = typeof caseTagRelations.$inferSelect;
export type InsertCaseTagRelation = typeof caseTagRelations.$inferInsert;


/**
 * User points for gamification
 */
export const userPoints = pgTable("userPoints", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  points: integer("points").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  totalInteractions: integer("totalInteractions").default(0).notNull(),
  streak: integer("streak").default(0).notNull(), // consecutive days
  lastInteractionAt: bigint("lastInteractionAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type UserPoints = typeof userPoints.$inferSelect;
export type InsertUserPoints = typeof userPoints.$inferInsert;

/**
 * Badge definitions
 */
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).notNull(), // emoji or icon name
  color: varchar("color", { length: 7 }).default("#f97316").notNull(),
  requirement: varchar("requirement", { length: 50 }).notNull(), // e.g., "interactions_10", "streak_7"
  requiredValue: integer("requiredValue").notNull(),
  pointsReward: integer("pointsReward").default(100).notNull(),
  rarity: text("rarity").default("common").notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * User earned badges
 */
export const userBadges = pgTable("userBadges", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  badgeId: integer("badgeId").notNull(),
  earnedAt: bigint("earnedAt", { mode: "number" }).notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

/**
 * Point transactions log
 */
export const pointTransactions = pgTable("pointTransactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  points: integer("points").notNull(), // positive or negative
  reason: varchar("reason", { length: 100 }).notNull(),
  metadata: text("metadata"), // JSON with extra info
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = typeof pointTransactions.$inferInsert;

/**
 * API keys for public API access
 */
export const apiKeys = pgTable("apiKeys", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  keyHash: varchar("keyHash", { length: 64 }).notNull(), // SHA-256 hash
  keyPrefix: varchar("keyPrefix", { length: 8 }).notNull(), // First 8 chars for identification
  permissions: text("permissions"), // JSON array of allowed endpoints
  rateLimit: integer("rateLimit").default(1000).notNull(), // requests per hour
  lastUsedAt: bigint("lastUsedAt", { mode: "number" }),
  expiresAt: bigint("expiresAt", { mode: "number" }),
  isActive: integer("isActive").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;


/**
 * Webhooks for external integrations
 */
export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  secret: varchar("secret", { length: 64 }).notNull(), // For signature verification
  events: text("events").notNull(), // JSON array of subscribed events
  isActive: integer("isActive").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

/**
 * Webhook delivery logs
 */
export const webhookDeliveries = pgTable("webhookDeliveries", {
  id: serial("id").primaryKey(),
  webhookId: integer("webhookId").notNull(),
  event: varchar("event", { length: 50 }).notNull(),
  payload: text("payload").notNull(), // JSON payload sent
  responseStatus: integer("responseStatus"),
  responseBody: text("responseBody"),
  attempts: integer("attempts").default(1).notNull(),
  nextRetryAt: bigint("nextRetryAt", { mode: "number" }),
  deliveredAt: bigint("deliveredAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type InsertWebhookDelivery = typeof webhookDeliveries.$inferInsert;

/**
 * OAuth2 clients for API authentication
 */
export const oauthClients = pgTable("oauthClients", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // Owner of the OAuth app
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  clientId: varchar("clientId", { length: 64 }).notNull().unique(),
  clientSecretHash: varchar("clientSecretHash", { length: 64 }).notNull(),
  redirectUris: text("redirectUris").notNull(), // JSON array
  scopes: text("scopes").notNull(), // JSON array of allowed scopes
  isActive: integer("isActive").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type OAuthClient = typeof oauthClients.$inferSelect;
export type InsertOAuthClient = typeof oauthClients.$inferInsert;

/**
 * OAuth2 authorization codes
 */
export const oauthAuthCodes = pgTable("oauthAuthCodes", {
  id: serial("id").primaryKey(),
  clientId: varchar("clientId", { length: 64 }).notNull(),
  userId: integer("userId").notNull(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  redirectUri: varchar("redirectUri", { length: 500 }).notNull(),
  scopes: text("scopes").notNull(), // JSON array
  codeChallenge: varchar("codeChallenge", { length: 128 }), // PKCE
  codeChallengeMethod: varchar("codeChallengeMethod", { length: 10 }), // plain or S256
  expiresAt: bigint("expiresAt", { mode: "number" }).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type OAuthAuthCode = typeof oauthAuthCodes.$inferSelect;
export type InsertOAuthAuthCode = typeof oauthAuthCodes.$inferInsert;

/**
 * OAuth2 access tokens
 */
export const oauthTokens = pgTable("oauthTokens", {
  id: serial("id").primaryKey(),
  clientId: varchar("clientId", { length: 64 }).notNull(),
  userId: integer("userId").notNull(),
  accessToken: varchar("accessToken", { length: 64 }).notNull().unique(),
  refreshToken: varchar("refreshToken", { length: 64 }).unique(),
  scopes: text("scopes").notNull(), // JSON array
  accessTokenExpiresAt: bigint("accessTokenExpiresAt", { mode: "number" }).notNull(),
  refreshTokenExpiresAt: bigint("refreshTokenExpiresAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type OAuthToken = typeof oauthTokens.$inferSelect;
export type InsertOAuthToken = typeof oauthTokens.$inferInsert;


/**
 * Jarvis long-term memory for persistent context per user.
 */
export const jarvisMemory = pgTable("jarvisMemory", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  memoryType: text("memoryType").notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(),
  importance: integer("importance").default(5).notNull(), // 1-10 scale
  lastAccessed: integer("lastAccessed").notNull(),
  accessCount: integer("accessCount").default(1).notNull(),
  expiresAt: bigint("expiresAt", { mode: "number" }),
  isActive: integer("isActive").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type JarvisMemory = typeof jarvisMemory.$inferSelect;
export type InsertJarvisMemory = typeof jarvisMemory.$inferInsert;

/**
 * Jarvis generated reports for users.
 */
export const jarvisReports = pgTable("jarvisReports", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  reportType: text("reportType").notNull(),
  content: text("content").notNull(), // JSON or Markdown content
  summary: text("summary"),
  metrics: text("metrics"), // JSON with key metrics
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  wordUrl: varchar("wordUrl", { length: 500 }),
  status: text("status").default("generating").notNull(),
  generatedAt: bigint("generatedAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type JarvisReport = typeof jarvisReports.$inferSelect;
export type InsertJarvisReport = typeof jarvisReports.$inferInsert;

/**
 * Impact certificates with blockchain-style verification.
 */
export const impactCertificates = pgTable("impactCertificates", {
  id: serial("id").primaryKey(),
  certificateId: varchar("certificateId", { length: 64 }).notNull().unique(), // Unique public ID
  userId: integer("userId"),
  organizationName: varchar("organizationName", { length: 255 }).notNull(),
  projectName: varchar("projectName", { length: 255 }).notNull(),
  projectDescription: text("projectDescription"),
  
  // Impact metrics
  totalInvestment: integer("totalInvestment").notNull(),
  beneficiaries: integer("beneficiaries").notNull(),
  sRoi: integer("sRoi").notNull(), // Stored as percentage * 100
  impactScore: integer("impactScore").notNull(),
  sector: varchar("sector", { length: 100 }).notNull(),
  sdgs: text("sdgs"), // JSON array of SDG numbers
  
  // Blockchain-style verification
  previousHash: varchar("previousHash", { length: 64 }), // Hash of previous certificate (chain)
  dataHash: varchar("dataHash", { length: 64 }).notNull(), // SHA-256 hash of certificate data
  merkleRoot: varchar("merkleRoot", { length: 64 }), // Merkle root for batch verification
  blockNumber: integer("blockNumber"), // Simulated block number
  
  // Verification
  verificationStatus: text("verificationStatus").default("pending").notNull(),
  verifiedBy: integer("verifiedBy"),
  verifiedAt: bigint("verifiedAt", { mode: "number" }),
  
  // Metadata
  issuedAt: bigint("issuedAt", { mode: "number" }).notNull(),
  validUntil: bigint("validUntil", { mode: "number" }),
  qrCodeUrl: varchar("qrCodeUrl", { length: 500 }),
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type ImpactCertificate = typeof impactCertificates.$inferSelect;
export type InsertImpactCertificate = typeof impactCertificates.$inferInsert;

/**
 * Social Impact Tokens (SIT) - Tokenized impact credits.
 */
export const impactTokens = pgTable("impactTokens", {
  id: serial("id").primaryKey(),
  tokenId: varchar("tokenId", { length: 64 }).notNull().unique(),
  userId: integer("userId"),
  organizationId: integer("organizationId"),
  certificateId: integer("certificateId"), // Link to certificate
  
  // Token details
  tokenType: text("tokenType").notNull(),
  amount: integer("amount").default(1).notNull(),
  value: integer("value").default(0).notNull(), // Value in cents
  
  // Metadata
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  metadata: text("metadata"), // JSON with additional data
  
  // Transfer history
  previousOwner: integer("previousOwner"),
  transferCount: integer("transferCount").default(0).notNull(),
  
  // Status
  status: text("status").default("active").notNull(),
  mintedAt: bigint("mintedAt", { mode: "number" }).notNull(),
  expiresAt: bigint("expiresAt", { mode: "number" }),
  
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type ImpactToken = typeof impactTokens.$inferSelect;
export type InsertImpactToken = typeof impactTokens.$inferInsert;

/**
 * Token transactions for audit trail.
 */
export const tokenTransactions = pgTable("tokenTransactions", {
  id: serial("id").primaryKey(),
  tokenId: integer("tokenId").notNull(),
  transactionType: text("transactionType").notNull(),
  fromUserId: integer("fromUserId"),
  toUserId: integer("toUserId"),
  amount: integer("amount").default(1).notNull(),
  transactionHash: varchar("transactionHash", { length: 64 }).notNull(), // SHA-256 hash
  previousTransactionHash: varchar("previousTransactionHash", { length: 64 }),
  metadata: text("metadata"), // JSON
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = typeof tokenTransactions.$inferInsert;

/**
 * User language preferences.
 */
export const userPreferences = pgTable("userPreferences", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  language: varchar("language", { length: 10 }).default("pt").notNull(),
  theme: text("theme").default("system").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("America/Sao_Paulo").notNull(),
  emailNotifications: integer("emailNotifications").default(1).notNull(),
  pushNotifications: integer("pushNotifications").default(1).notNull(),
  weeklyDigest: integer("weeklyDigest").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;


/**
 * User notifications table for persistent notification storage.
 */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: text("type").default("info").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  isRead: integer("isRead").default(0).notNull(),
  metadata: text("metadata").$type<Record<string, unknown>>(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  readAt: bigint("readAt", { mode: "number" }),
  emailSentAt: bigint("emailSentAt", { mode: "number" }),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * User notification preferences - allows users to customize which notifications they receive
 */
export const notificationPreferences = pgTable("notificationPreferences", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  // Notification type preferences (true = enabled, false = disabled)
  infoEnabled: integer("infoEnabled").default(1).notNull(),
  successEnabled: integer("successEnabled").default(1).notNull(),
  warningEnabled: integer("warningEnabled").default(1).notNull(),
  errorEnabled: integer("errorEnabled").default(1).notNull(),
  casePendingEnabled: integer("casePendingEnabled").default(1).notNull(),
  caseApprovedEnabled: integer("caseApprovedEnabled").default(1).notNull(),
  caseRejectedEnabled: integer("caseRejectedEnabled").default(1).notNull(),
  certificateIssuedEnabled: integer("certificateIssuedEnabled").default(1).notNull(),
  tokenEarnedEnabled: integer("tokenEarnedEnabled").default(1).notNull(),
  systemEnabled: integer("systemEnabled").default(1).notNull(),
  // Email preferences
  emailEnabled: integer("emailEnabled").default(1).notNull(),
  emailDigestFrequency: text("emailDigestFrequency").default("instant").notNull(),
  // Push preferences
  pushEnabled: integer("pushEnabled").default(1).notNull(),
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;


/**
 * Notification templates - customizable templates for automated notifications
 */
export const notificationTemplates = pgTable("notificationTemplates", {
  id: serial("id").primaryKey(),
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
  isActive: integer("isActive").default(1).notNull(),
  isSystem: integer("isSystem").default(0).notNull(), // System templates cannot be deleted
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  createdBy: integer("createdBy"),
});

export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate = typeof notificationTemplates.$inferInsert;


/**
 * System settings - persistent configuration for the platform
 */
export const systemSettings = pgTable("systemSettings", {
  id: serial("id").primaryKey(),
  // Setting identification
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  // Metadata
  description: varchar("description", { length: 255 }),
  category: text("category").default("general").notNull(),
  // Type hint for parsing
  valueType: text("valueType").default("string").notNull(),
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;


/**
 * Audit logs - track administrative actions for compliance and traceability
 */
export const auditLogs = pgTable("auditLogs", {
  id: serial("id").primaryKey(),
  // Who performed the action
  userId: integer("userId"),
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
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;


/**
 * Referrals - track user referrals and rewards
 */
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  // Referrer (who invited)
  referrerId: integer("referrerId").notNull(),
  referrerCode: varchar("referrerCode", { length: 20 }).notNull(),
  // Referred (who was invited)
  referredId: integer("referredId"),
  referredEmail: varchar("referredEmail", { length: 320 }),
  // Status
  status: text("status").default("pending").notNull(),
  // Rewards
  referrerRewardType: text("referrerRewardType").default("none"),
  referrerRewardAmount: integer("referrerRewardAmount").default(0),
  referrerRewardApplied: integer("referrerRewardApplied").default(0),
  referredRewardType: text("referredRewardType").default("none"),
  referredRewardAmount: integer("referredRewardAmount").default(0),
  referredRewardApplied: integer("referredRewardApplied").default(0),
  // Timestamps
  invitedAt: bigint("invitedAt", { mode: "number" }).notNull(),
  signedUpAt: bigint("signedUpAt", { mode: "number" }),
  convertedAt: bigint("convertedAt", { mode: "number" }),
  rewardedAt: bigint("rewardedAt", { mode: "number" }),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Support tickets - customer support system
 */
export const supportTickets = pgTable("supportTickets", {
  id: serial("id").primaryKey(),
  // Ticket identification
  ticketNumber: varchar("ticketNumber", { length: 20 }).notNull().unique(),
  // User info
  userId: integer("userId"),
  userName: varchar("userName", { length: 255 }),
  userEmail: varchar("userEmail", { length: 320 }).notNull(),
  // Ticket details
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: text("category").default("general").notNull(),
  priority: text("priority").default("medium").notNull(),
  status: text("status").default("open").notNull(),
  // Assignment
  assignedToId: integer("assignedToId"),
  assignedToName: varchar("assignedToName", { length: 255 }),
  // Resolution
  resolution: text("resolution"),
  resolvedAt: bigint("resolvedAt", { mode: "number" }),
  // Metadata
  attachments: text("attachments"), // JSON array of file URLs
  tags: text("tags"), // JSON array of tags
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  firstResponseAt: bigint("firstResponseAt", { mode: "number" }),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Support ticket messages - conversation thread
 */
export const ticketMessages = pgTable("ticketMessages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticketId").notNull(),
  // Sender info
  senderId: integer("senderId"),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  senderEmail: varchar("senderEmail", { length: 320 }),
  isStaff: integer("isStaff").default(0).notNull(),
  // Message content
  message: text("message").notNull(),
  attachments: text("attachments"), // JSON array of file URLs
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = typeof ticketMessages.$inferInsert;

/**
 * Feature flags - A/B testing and feature rollout
 */
export const featureFlags = pgTable("featureFlags", {
  id: serial("id").primaryKey(),
  // Flag identification
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // Flag configuration
  isEnabled: integer("isEnabled").default(0).notNull(),
  rolloutPercentage: integer("rolloutPercentage").default(0), // 0-100
  // Targeting
  targetUserIds: text("targetUserIds"), // JSON array of user IDs
  targetRoles: text("targetRoles"), // JSON array of roles
  targetPlans: text("targetPlans"), // JSON array of plan types
  // A/B testing
  isExperiment: integer("isExperiment").default(0).notNull(),
  variants: text("variants"), // JSON array of variant configs
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  expiresAt: bigint("expiresAt", { mode: "number" }),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;

/**
 * Conversion events - track user actions for analytics
 */
export const conversionEvents = pgTable("conversionEvents", {
  id: serial("id").primaryKey(),
  // User info
  userId: integer("userId"),
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
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type ConversionEvent = typeof conversionEvents.$inferSelect;
export type InsertConversionEvent = typeof conversionEvents.$inferInsert;

/**
 * Email campaigns - marketing automation
 */
export const emailCampaigns = pgTable("emailCampaigns", {
  id: serial("id").primaryKey(),
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
  scheduledAt: bigint("scheduledAt", { mode: "number" }),
  sentAt: bigint("sentAt", { mode: "number" }),
  // Stats
  totalRecipients: integer("totalRecipients").default(0),
  totalSent: integer("totalSent").default(0),
  totalOpened: integer("totalOpened").default(0),
  totalClicked: integer("totalClicked").default(0),
  totalUnsubscribed: integer("totalUnsubscribed").default(0),
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;


/**
 * Two-Factor Authentication (2FA) configuration per user.
 */
export const twoFactorAuth = pgTable("twoFactorAuth", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  // TOTP secret (encrypted)
  secret: varchar("secret", { length: 255 }).notNull(),
  // Status
  isEnabled: integer("isEnabled").default(0).notNull(),
  isVerified: integer("isVerified").default(0).notNull(),
  // Backup codes (JSON array of hashed codes)
  backupCodes: text("backupCodes"),
  backupCodesUsed: integer("backupCodesUsed").default(0).notNull(),
  // Recovery
  recoveryEmail: varchar("recoveryEmail", { length: 320 }),
  recoveryPhone: varchar("recoveryPhone", { length: 20 }),
  // Audit
  lastUsedAt: bigint("lastUsedAt", { mode: "number" }),
  failedAttempts: integer("failedAttempts").default(0).notNull(),
  lockedUntil: integer("lockedUntil"),
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type TwoFactorAuth = typeof twoFactorAuth.$inferSelect;
export type InsertTwoFactorAuth = typeof twoFactorAuth.$inferInsert;

/**
 * 2FA verification sessions - temporary tokens for login flow.
 */
export const twoFactorSessions = pgTable("twoFactorSessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  sessionToken: varchar("sessionToken", { length: 64 }).notNull().unique(),
  // Status
  isVerified: integer("isVerified").default(0).notNull(),
  verifiedAt: bigint("verifiedAt", { mode: "number" }),
  // Expiration
  expiresAt: bigint("expiresAt", { mode: "number" }).notNull(),
  // Audit
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type TwoFactorSession = typeof twoFactorSessions.$inferSelect;
export type InsertTwoFactorSession = typeof twoFactorSessions.$inferInsert;

/**
 * User access tokens - API tokens for programmatic access.
 */
export const userAccessTokens = pgTable("userAccessTokens", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  // Token identification
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  // Token value (hashed)
  tokenHash: varchar("tokenHash", { length: 64 }).notNull(),
  tokenPrefix: varchar("tokenPrefix", { length: 12 }).notNull(), // First 12 chars for identification
  // Permissions
  scopes: text("scopes"), // JSON array of allowed scopes
  // Rate limiting
  rateLimit: integer("rateLimit").default(1000).notNull(), // requests per hour
  rateLimitRemaining: integer("rateLimitRemaining").default(1000).notNull(),
  rateLimitResetAt: bigint("rateLimitResetAt", { mode: "number" }),
  // Usage tracking
  lastUsedAt: bigint("lastUsedAt", { mode: "number" }),
  usageCount: integer("usageCount").default(0).notNull(),
  // Status
  isActive: integer("isActive").default(1).notNull(),
  expiresAt: bigint("expiresAt", { mode: "number" }),
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type UserAccessToken = typeof userAccessTokens.$inferSelect;
export type InsertUserAccessToken = typeof userAccessTokens.$inferInsert;

/**
 * Token usage logs - audit trail for API token usage.
 */
export const tokenUsageLogs = pgTable("tokenUsageLogs", {
  id: serial("id").primaryKey(),
  tokenId: integer("tokenId").notNull(),
  userId: integer("userId").notNull(),
  // Request details
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  statusCode: integer("statusCode"),
  responseTime: integer("responseTime"), // in milliseconds
  // Request context
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type TokenUsageLog = typeof tokenUsageLogs.$inferSelect;
export type InsertTokenUsageLog = typeof tokenUsageLogs.$inferInsert;


/**
 * Testimonials/Depoimentos - Depoimentos de clientes e parceiros
 */
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 100 }).notNull(),
  content: text("content").notNull(),
  rating: integer("rating").default(5).notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  videoUrl: varchar("videoUrl", { length: 500 }),
  metrics: text("metrics"), // JSON array of {label, value}
  isActive: integer("isActive").default(1).notNull(),
  isFeatured: integer("isFeatured").default(0).notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  language: varchar("language", { length: 5 }).default("pt").notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

/**
 * Partners - Parceiros e organizações associadas
 */
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }),
  description: text("description"),
  logo: varchar("logo", { length: 1000 }),
  website: varchar("website", { length: 1000 }),
  partnerType: varchar("partnerType", { length: 100 }),
  status: varchar("status", { length: 50 }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  isActive: integer("isActive").default(1).notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Social Proof Metrics - Métricas de prova social para landing page
 */
export const socialProofMetrics = pgTable("socialProofMetrics", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).notNull().unique(), // e.g., "organizations", "beneficiaries", "sroi_avg"
  value: varchar("value", { length: 50 }).notNull(), // e.g., "500+", "2M+", "12x"
  label: varchar("label", { length: 255 }).notNull(),
  labelEn: varchar("labelEn", { length: 255 }),
  labelEs: varchar("labelEs", { length: 255 }),
  icon: varchar("icon", { length: 50 }), // Icon name from lucide-react
  displayOrder: integer("displayOrder").default(0).notNull(),
  isActive: integer("isActive").default(1).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type SocialProofMetric = typeof socialProofMetrics.$inferSelect;
export type InsertSocialProofMetric = typeof socialProofMetrics.$inferInsert;

/**
 * Platform Stats - Estatísticas reais da plataforma
 */
export const platformStats = pgTable("platformStats", {
  id: serial("id").primaryKey(),
  date: bigint("date", { mode: "number" }).notNull(),
  totalUsers: integer("totalUsers").default(0).notNull(),
  activeUsers: integer("activeUsers").default(0).notNull(),
  totalCalculations: integer("totalCalculations").default(0).notNull(),
  totalCases: integer("totalCases").default(0).notNull(),
  totalCertificates: integer("totalCertificates").default(0).notNull(),
  totalTokensIssued: integer("totalTokensIssued").default(0).notNull(),
  avgSroi: integer("avgSroi").default(0), // Stored as integer (e.g., 450 = 4.5x)
  totalImpactValue: integer("totalImpactValue").default(0), // In cents (use int for simplicity)
  totalBeneficiaries: integer("totalBeneficiaries").default(0),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
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
export const set7Tasklog = pgTable("set7Tasklog", {
  id: serial("id").primaryKey(),
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
  tokensInput: integer("tokensInput").default(0).notNull(),
  tokensOutput: integer("tokensOutput").default(0).notNull(),
  tokensTotal: integer("tokensTotal").default(0).notNull(),
  modelUsed: varchar("modelUsed", { length: 50 }),
  executionTimeMs: integer("executionTimeMs").default(0).notNull(),
  
  // Custo
  costUsd: integer("costUsd").default(0).notNull(), // Em centavos de dólar
  
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
  startedAt: bigint("startedAt", { mode: "number" }),
  completedAt: bigint("completedAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type Set7Tasklog = typeof set7Tasklog.$inferSelect;
export type InsertSet7Tasklog = typeof set7Tasklog.$inferInsert;

/**
 * SET7 Agentes - Registro de agentes do sistema
 */
export const set7Agents = pgTable("set7Agents", {
  id: serial("id").primaryKey(),
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
  status: text("status").default("active").notNull(),
  killSwitchTriggered: integer("killSwitchTriggered").default(0).notNull(),
  killSwitchReason: text("killSwitchReason"),
  killSwitchAt: bigint("killSwitchAt", { mode: "number" }),
  
  // Métricas
  totalTasksExecuted: integer("totalTasksExecuted").default(0).notNull(),
  totalTokensUsed: integer("totalTokensUsed").default(0).notNull(),
  totalCostUsd: integer("totalCostUsd").default(0).notNull(),
  avgExecutionTimeMs: integer("avgExecutionTimeMs").default(0).notNull(),
  successRate: integer("successRate").default(100).notNull(), // Percentual
  
  // Timestamps
  lastActiveAt: bigint("lastActiveAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type Set7Agent = typeof set7Agents.$inferSelect;
export type InsertSet7Agent = typeof set7Agents.$inferInsert;

/**
 * SET7 Integration Identity - Hash/QR Code para integrações verificáveis
 */
export const set7Integrations = pgTable("set7Integrations", {
  id: serial("id").primaryKey(),
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
  lastVerifiedAt: bigint("lastVerifiedAt", { mode: "number" }),
  verificationCount: integer("verificationCount").default(0).notNull(),
  
  // Configuração
  config: text("config"), // JSON com configurações
  headers: text("headers"), // JSON com headers
  authentication: text("authentication"), // JSON com auth config
  
  // Status
  status: text("status").default("active").notNull(),
  
  // Métricas
  totalCalls: integer("totalCalls").default(0).notNull(),
  successfulCalls: integer("successfulCalls").default(0).notNull(),
  failedCalls: integer("failedCalls").default(0).notNull(),
  avgResponseTimeMs: integer("avgResponseTimeMs").default(0).notNull(),
  
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type Set7Integration = typeof set7Integrations.$inferSelect;
export type InsertSet7Integration = typeof set7Integrations.$inferInsert;

/**
 * SET7 Token Budgets - Orçamento de tokens por fase/projeto/fluxo
 */
export const set7TokenBudgets = pgTable("set7TokenBudgets", {
  id: serial("id").primaryKey(),
  budgetId: varchar("budgetId", { length: 64 }).notNull().unique(),
  
  // Escopo do budget
  scope: text("scope").notNull(),
  scopeId: varchar("scopeId", { length: 64 }).notNull(), // ID do projeto/fase/fluxo/agente/usuário
  scopeName: varchar("scopeName", { length: 255 }).notNull(),
  
  // Limites
  budgetTokens: integer("budgetTokens").notNull(), // Limite de tokens
  budgetUsd: integer("budgetUsd").notNull(), // Limite em centavos de dólar
  warningThreshold: integer("warningThreshold").default(80).notNull(), // Percentual para alerta
  criticalThreshold: integer("criticalThreshold").default(95).notNull(), // Percentual para bloqueio
  
  // Consumo atual
  usedTokens: integer("usedTokens").default(0).notNull(),
  usedUsd: integer("usedUsd").default(0).notNull(),
  
  // Período
  periodType: text("periodType").default("monthly").notNull(),
  periodStart: integer("periodStart"),
  periodEnd: integer("periodEnd"),
  
  // Status
  status: text("status").default("active").notNull(),
  
  // Circuit breaker
  circuitBreakerTriggered: integer("circuitBreakerTriggered").default(0).notNull(),
  circuitBreakerAt: bigint("circuitBreakerAt", { mode: "number" }),
  circuitBreakerReason: text("circuitBreakerReason"),
  
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type Set7TokenBudget = typeof set7TokenBudgets.$inferSelect;
export type InsertSet7TokenBudget = typeof set7TokenBudgets.$inferInsert;

/**
 * SET7 Gates - Condições de avanço entre fases
 */
export const set7Gates = pgTable("set7Gates", {
  id: serial("id").primaryKey(),
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
  mitigationDeadline: integer("mitigationDeadline"),
  mitigationApprovedBy: integer("mitigationApprovedBy"),
  
  // Aprovação
  approvedBy: integer("approvedBy"),
  approvedAt: bigint("approvedAt", { mode: "number" }),
  humanApprovalRequired: integer("humanApprovalRequired").default(0).notNull(),
  
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type Set7Gate = typeof set7Gates.$inferSelect;
export type InsertSet7Gate = typeof set7Gates.$inferInsert;

/**
 * SET7 ROI Tracking - Rastreamento de ROI por fase
 */
export const set7RoiTracking = pgTable("set7RoiTracking", {
  id: serial("id").primaryKey(),
  trackingId: varchar("trackingId", { length: 64 }).notNull().unique(),
  
  // Tipo de ROI
  roiType: text("roiType").notNull(),
  phase: varchar("phase", { length: 20 }), // Fase associada (para partial)
  
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
  calculatedAt: bigint("calculatedAt", { mode: "number" }).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type Set7RoiTracking = typeof set7RoiTracking.$inferSelect;
export type InsertSet7RoiTracking = typeof set7RoiTracking.$inferInsert;

/**
 * SET7 Runtime Config - Configuração do runtime S7L
 */
export const set7RuntimeConfig = pgTable("set7RuntimeConfig", {
  id: serial("id").primaryKey(),
  configId: varchar("configId", { length: 64 }).notNull().unique(),
  
  // Modo de execução
  mode: text("mode").default("standard").notNull(),
  
  // Hooks ativos
  hooksEnabled: text("hooksEnabled"), // JSON array de hooks ativos
  hookRoiEnabled: integer("hookRoiEnabled").default(1).notNull(),
  hookTokensEnabled: integer("hookTokensEnabled").default(1).notNull(),
  hookQualityEnabled: integer("hookQualityEnabled").default(1).notNull(),
  hookSecurityEnabled: integer("hookSecurityEnabled").default(1).notNull(),
  hookGtlEnabled: integer("hookGtlEnabled").default(1).notNull(),
  
  // Frequência dos hooks
  hookFrequency: text("hookFrequency").default("per_phase").notNull(),
  
  // GTL (Go-to-Live)
  gtlType: text("gtlType").default("saas").notNull(),
  gtlPlans: text("gtlPlans"), // JSON com planos disponíveis
  
  // Configurações de tokens
  defaultTokenBudget: integer("defaultTokenBudget").default(100000).notNull(),
  modelRouting: text("modelRouting"), // JSON com regras de roteamento
  
  // Configurações de gates
  gateProfile: text("gateProfile"), // JSON com perfil de gates por modo
  humanApprovalPhases: text("humanApprovalPhases"), // JSON array de fases que requerem aprovação humana
  
  // Status
  isActive: integer("isActive").default(1).notNull(),
  
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type Set7RuntimeConfig = typeof set7RuntimeConfig.$inferSelect;
export type InsertSet7RuntimeConfig = typeof set7RuntimeConfig.$inferInsert;

/**
 * SET7 Audit Log - Log de auditoria para compliance
 */
export const set7AuditLog = pgTable("set7AuditLog", {
  id: serial("id").primaryKey(),
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
  userId: integer("userId"),
  userName: varchar("userName", { length: 255 }),
  
  // Severidade
  severity: text("severity").default("info").notNull(),
  
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type Set7AuditLog = typeof set7AuditLog.$inferSelect;
export type InsertSet7AuditLog = typeof set7AuditLog.$inferInsert;

/**
 * SET7 NFRs - Matriz de Qualidades (Non-Functional Requirements)
 * 15 dimensões de qualidade conforme SET7.01
 */
export const set7Nfrs = pgTable("set7Nfrs", {
  id: serial("id").primaryKey(),
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
  ownerId: integer("ownerId"),
  ownerName: varchar("ownerName", { length: 255 }),
  
  // Timestamps
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type Set7Nfr = typeof set7Nfrs.$inferSelect;
export type InsertSet7Nfr = typeof set7Nfrs.$inferInsert;


/**
 * White Label Configuration table for multi-tenant branding.
 */
export const whiteLabelConfig = pgTable("white_label_config", {
  id: serial("id").primaryKey(),
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
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type WhiteLabelConfig = typeof whiteLabelConfig.$inferSelect;
export type InsertWhiteLabelConfig = typeof whiteLabelConfig.$inferInsert;

/**
 * RBAC (Role-Based Access Control) Tables
 */

// Roles table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  level: integer("level").notNull().default(0),
  isActive: integer("isActive").notNull().default(1),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

// Permissions table
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  isActive: integer("isActive").notNull().default(1),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

// RolePermissions junction table
export const rolePermissions = pgTable("rolePermissions", {
  id: serial("id").primaryKey(),
  roleId: integer("roleId").notNull(),
  permissionId: integer("permissionId").notNull(),
  assignedAt: bigint("assignedAt", { mode: "number" }).notNull(),
}, (t) => ({
  rolePermUq: unique("rolePermissions_role_perm_uq").on(t.roleId, t.permissionId),
}));

// Tokens de reset de senha, usados pelo fluxo local em server/_core/local-auth.ts.
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: bigint("expiresAt", { mode: "number" }).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  usedAt: bigint("usedAt", { mode: "number" }),
});

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;

// UserRoles junction table
export const userRoles = pgTable("userRoles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  roleId: integer("roleId").notNull(),
  assignedAt: bigint("assignedAt", { mode: "number" }).notNull(),
}, (t) => ({
  userRoleUq: unique("userRoles_user_role_uq").on(t.userId, t.roleId),
}));

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;


// Case Studies table
export const caseStudies = pgTable("caseStudies", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  organization: varchar("organization", { length: 255 }),
  sector: varchar("sector", { length: 100 }),
  region: varchar("region", { length: 100 }),
  location: varchar("location", { length: 255 }),
  investment: integer("investment"),
  beneficiaries: integer("beneficiaries"),
  duration: integer("duration"),
  sroi: numeric("sroi", { precision: 10, scale: 2 }),
  year: integer("year"),
  description: text("description"),
  challenge: text("challenge"),
  solution: text("solution"),
  results: text("results"),
  testimonialQuote: text("testimonialQuote"),
  testimonialAuthor: varchar("testimonialAuthor", { length: 255 }),
  testimonialRole: varchar("testimonialRole", { length: 255 }),
  sdgs: text("sdgs"),
  metrics: text("metrics"),
  isFeatured: integer("isFeatured").notNull().default(0),
  isActive: integer("isActive").notNull().default(1),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  projectTitle: varchar("projectTitle", { length: 255 }),
  organizationName: varchar("organizationName", { length: 255 }),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  reviewNotes: text("reviewNotes"),
  reviewedBy: integer("reviewedBy"),
  reviewedAt: bigint("reviewedAt", { mode: "number" }),
});

export type CaseStudy = typeof caseStudies.$inferSelect;
export type InsertCaseStudy = typeof caseStudies.$inferInsert;



// Blog Posts table
export const blogPosts = pgTable("blogPosts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: varchar("featuredImage", { length: 1000 }),
  author: varchar("author", { length: 255 }),
  category: varchar("category", { length: 255 }),
  tags: text("tags"),
  status: varchar("status", { length: 50 }).default("draft"),
  viewCount: integer("viewCount").default(0),
  publishedAt: bigint("publishedAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// ============================================================
// EVENTS & WEBINARS
// ============================================================
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull(),
  description: text("description"),
  eventType: varchar("eventType", { length: 100 }),
  location: varchar("location", { length: 500 }),
  virtualLink: varchar("virtualLink", { length: 1000 }),
  startsAt: bigint("startsAt", { mode: "number" }).notNull(),
  endsAt: bigint("endsAt", { mode: "number" }).notNull(),
  maxAttendees: integer("maxAttendees"),
  registrationDeadline: integer("registrationDeadline"),
  featuredImage: varchar("featuredImage", { length: 1000 }),
  status: varchar("status", { length: 50 }).default("draft"),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export const eventRegistrations = pgTable("eventRegistrations", {
  id: serial("id").primaryKey(),
  eventId: integer("eventId").notNull(),
  userId: integer("userId"),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  company: varchar("company", { length: 255 }),
  status: varchar("status", { length: 50 }).default("confirmed"),
  registeredAt: bigint("registeredAt", { mode: "number" }).notNull(),
});
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrations.$inferInsert;

// ============================================================
// FORUM
// ============================================================
export const forumCategories = pgTable("forumCategories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  displayOrder: integer("displayOrder").default(0),
  isActive: integer("isActive").default(1),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});
export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = typeof forumCategories.$inferInsert;

export const forumTopics = pgTable("forumTopics", {
  id: serial("id").primaryKey(),
  categoryId: integer("categoryId").notNull(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull(),
  content: text("content").notNull(),
  isPinned: integer("isPinned").default(0),
  isLocked: integer("isLocked").default(0),
  viewCount: integer("viewCount").default(0),
  replyCount: integer("replyCount").default(0),
  lastActivityAt: bigint("lastActivityAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});
export type ForumTopic = typeof forumTopics.$inferSelect;
export type InsertForumTopic = typeof forumTopics.$inferInsert;

export const forumReplies = pgTable("forumReplies", {
  id: serial("id").primaryKey(),
  topicId: integer("topicId").notNull(),
  userId: integer("userId").notNull(),
  content: text("content").notNull(),
  isAccepted: integer("isAccepted").default(0),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = typeof forumReplies.$inferInsert;

// ============================================================
// COURSES & LEARNING
// ============================================================
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull(),
  description: text("description"),
  instructor: varchar("instructor", { length: 255 }),
  duration: integer("duration"),
  level: varchar("level", { length: 50 }),
  price: numeric("price", { precision: 10, scale: 2 }),
  featuredImage: varchar("featuredImage", { length: 1000 }),
  status: varchar("status", { length: 50 }).default("draft"),
  publishedAt: bigint("publishedAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});
export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

export const courseLessons = pgTable("courseLessons", {
  id: serial("id").primaryKey(),
  courseId: integer("courseId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  videoUrl: varchar("videoUrl", { length: 1000 }),
  duration: integer("duration"),
  orderIndex: integer("orderIndex").default(0),
  isFree: integer("isFree").default(0),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});
export type CourseLesson = typeof courseLessons.$inferSelect;
export type InsertCourseLesson = typeof courseLessons.$inferInsert;

export const courseEnrollments = pgTable("courseEnrollments", {
  id: serial("id").primaryKey(),
  courseId: integer("courseId").notNull(),
  userId: integer("userId").notNull(),
  progress: integer("progress").default(0),
  completedAt: bigint("completedAt", { mode: "number" }),
  enrolledAt: bigint("enrolledAt", { mode: "number" }).notNull(),
  completedLessons: text("completedLessons").default('[]'),
});
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertCourseEnrollment = typeof courseEnrollments.$inferInsert;

// ============================================================
// CAREERS / JOB OPENINGS
// ============================================================
export const jobOpenings = pgTable("jobOpenings", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  department: varchar("department", { length: 255 }),
  location: varchar("location", { length: 255 }),
  type: varchar("type", { length: 100 }),
  salaryRange: varchar("salaryRange", { length: 255 }),
  description: text("description"),
  requirements: jsonb("requirements").$type<string[]>(),
  benefits: jsonb("benefits").$type<string[]>(),
  isActive: integer("isActive").default(1),
  isNew: integer("isNew").default(0),
  applyUrl: varchar("applyUrl", { length: 1000 }),
  closingDate: bigint("closingDate", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});
export type JobOpening = typeof jobOpenings.$inferSelect;
export type InsertJobOpening = typeof jobOpenings.$inferInsert;

// ============================================================
// CMS PAGES (Páginas Institucionais)
// ============================================================
export const cmsPages = pgTable("cmsPages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  metaDescription: varchar("metaDescription", { length: 500 }),
  isPublished: integer("isPublished").default(1),
  updatedBy: integer("updatedBy"),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});
export type CmsPage = typeof cmsPages.$inferSelect;
export type InsertCmsPage = typeof cmsPages.$inferInsert;

// ============================================================
// ERROR LOGS (Structured Error Logging)
// ============================================================
export const errorLogs = pgTable("errorLogs", {
  id: serial("id").primaryKey(),
  level: varchar("level", { length: 20 }).notNull().default('error'), // error, warn, info
  message: text("message").notNull(),
  stack: text("stack"),
  context: jsonb("context").$type<Record<string, unknown>>(),
  userId: integer("userId"),
  userEmail: varchar("userEmail", { length: 255 }),
  path: varchar("path", { length: 500 }),
  method: varchar("method", { length: 10 }),
  statusCode: integer("statusCode"),
  resolved: integer("resolved").default(0),
  resolvedAt: bigint("resolvedAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});
export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = typeof errorLogs.$inferInsert;
