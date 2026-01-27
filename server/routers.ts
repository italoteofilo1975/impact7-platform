import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { executeRawQuery } from "./db-raw";
import { leads, contacts, whitepaperDownloads, ebookDownloads, newsletterSubscribers, calculations, caseFavorites, caseSubmissions, caseTags, caseTagRelations, notificationPreferences, systemSettings, impactTokens } from "../drizzle/schema";
import { roles, permissions } from "../drizzle/schema";
import { chatWithJarvis, jarvisSkills, getSuggestedQuestions, JarvisMessage } from "./services/jarvis/jarvis-service";
import { searchKnowledge, listCategories, getDocumentsByCategory } from "./services/jarvis/knowledge-base";
import { getAlertSummary, getActiveAlerts, getAlertHistory, acknowledgeAlert, resolveAlert, startAlertMonitoring } from "./services/alerts/alert-service";
import { getAllCircuitBreakerStatus } from "./middleware/circuit-breaker";
import { getAllCacheStats } from "./services/cache/cache-service";
import { errorTracker, handleFrontendError } from "./services/error-tracking/error-service";
import {
  getUserPreferences,
  updateUserPreferences,
  getUserNotifications,
  markNotificationAsRead,
  getUnreadCount,
  sendTestNotification,
  getNotificationStats,
} from "./services/notifications/push-notification-service";
import { eq, desc, and } from "drizzle-orm";
import { generateCasePDFContent, CaseStudy } from "./services/pdf/case-pdf-service";
import { generateCalculatorPDF, generateCalculatorPDFBuffer, CalculatorResult } from "./services/pdf/calculator-pdf-service";
import { generateCertificateQRCode } from "./services/qrcode/qrcode-service";
import { generateReportHTML, generateCertificateHTML } from "./services/pdf/jarvis-pdf-service";
import { generateConsolidatedReportHTML, prepareConsolidatedReport, CaseForReport, ReportFilters } from "./services/pdf/consolidated-report-service";
import { notifyNewCaseSubmission, notifyCaseStatusChange } from "./services/email/case-email-service";
import { notificationPersistenceService, type NotificationType } from "./services/notifications/notification-persistence-service";
import {
  createApiKey,
  listUserApiKeys,
  revokeApiKey,
  API_PERMISSIONS,
} from "./services/api/public-api-service";
import { apiKeys, userAccessTokens, tokenUsageLogs } from "../drizzle/schema";
import { twoFactorAuthService } from "./services/two-factor-auth-service";
import { createCheckoutSession, createPortalSession } from "./stripe/stripe-service";
import { PLANS, getAllPlans } from "./stripe/products";
import {
  createWebhook,
  listUserWebhooks,
  updateWebhook,
  deleteWebhook,
  regenerateWebhookSecret,
  getWebhookDeliveries,
  testWebhook,
  WEBHOOK_EVENTS,
  WebhookEvent,
} from "./services/webhooks/webhook-service";
import {
  getEndpointStats,
  getClientStats,
  getTimeSeries,
  getMetricsSummary,
  getErrorMetrics,
  TIME_RANGES,
} from "./services/api/api-metrics-service";
import {
  createOAuthClient,
  listUserOAuthClients,
  validateOAuthClient,
  generateAuthCode,
  exchangeCodeForTokens,
  refreshAccessToken,
  deleteOAuthClient,
  regenerateClientSecret,
  OAUTH_SCOPES,
  OAuthScope,
} from "./services/oauth/oauth-service";
import {
  getUserPoints,
  addPoints,
  updateStreak,
  getUserBadges,
  getAllBadges,
  getLeaderboard,
  getUserStats,
  initializeDefaultBadges,
  POINTS_CONFIG,
} from "./services/gamification/gamification-service";
import {
  issueCertificate,
  verifyCertificate,
  approveCertificate,
  revokeCertificate,
  getUserCertificates,
  getPublicCertificates,
  mintToken,
  getUserTokens,
  getOrganizationTokenStats,
} from "./services/blockchain-certificate-service";
import {
  saveMemory,
  getMemoriesByType,
  getMemoryByKey,
  searchMemories,
  getAllUserMemories,
  buildMemoryContext,
  deleteMemory,
  clearAllMemories,
  type MemoryType,
} from "./services/jarvis-memory-service";
import {
  generateReport,
  getUserReports,
  getReport,
  deleteReport,
  type ReportType,
} from "./services/jarvis-report-service";
import {
  trackJarvisInteraction,
  updateJarvisFeedback,
  getJarvisStats,
  getJarvisInteractionsByDay,
  getTopJarvisQueries,
  trackLeadConversion,
  getConversionStats,
  getConversionsBySource,
  getConversionFunnel,
  trackPageView,
  updatePageViewMetrics,
  getTopPages,
  getDashboardMetrics,
  getMetricsByDay,
} from "./services/analytics/analytics-service";
import { systemMetricsRouter } from "./routers/system-metrics";
import { set7Router } from "./routers/set7-router";
import { whiteLabelRouter } from "./routers/white-label-router";
import { autoNotificationService } from "./services/notifications/auto-notification-service";

export const appRouter = router({
  system: systemRouter,
  systemMetrics: systemMetricsRouter,
  set7: set7Router,
  whiteLabel: whiteLabelRouter,
  
  // Auto Notifications Router (Admin only)
  autoNotifications: router({
    getConfig: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Acesso restrito a administradores');
      }
      return autoNotificationService.getConfig();
    }),
    
    setConfig: protectedProcedure
      .input(z.object({
        enabled: z.boolean().optional(),
        notifyOnNewLead: z.boolean().optional(),
        notifyOnNewDownload: z.boolean().optional(),
        notifyOnCaseSubmission: z.boolean().optional(),
        notifyOnContactMessage: z.boolean().optional(),
      }))
      .mutation(({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        autoNotificationService.setConfig(input);
        return { success: true, config: autoNotificationService.getConfig() };
      }),
    
    sendTest: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Acesso restrito a administradores');
      }
      const success = await autoNotificationService.sendTestNotification();
      return { success };
    }),
  }),
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    
    // Login local com email/senha
    loginLocal: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const { localAuthService } = await import('./services/auth/local-auth-service');
        const { sdk } = await import('./_core/sdk');
        
        const user = await localAuthService.login(input.email, input.password);
        
        // Gerar JWT e setar cookie usando o SDK existente
        const token = await sdk.signSession({
          openId: user.openId,
          appId: 'impact7-local',
          name: user.name || 'Admin',
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
        
        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      }),
    
    // Criar usuario admin (apenas para admins existentes ou primeiro usuario)
    createAdmin: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
        masterKey: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { localAuthService } = await import('./services/auth/local-auth-service');
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        // Verificar se ja existe algum admin
        const { users } = await import('../drizzle/schema');
        const existingAdmins = await db
          .select()
          .from(users)
          .where(eq(users.role, 'admin'))
          .limit(1);
        
        // Se ja existe admin, verificar se usuario atual e admin ou tem masterKey
        if (existingAdmins.length > 0) {
          const isCurrentUserAdmin = ctx.user?.role === 'admin';
          const hasValidMasterKey = input.masterKey === 'IMPACT7_MASTER_2026';
          
          if (!isCurrentUserAdmin && !hasValidMasterKey) {
            throw new Error('Apenas administradores podem criar novos admins');
          }
        }
        
        // Criar usuario admin
        const newAdmin = await localAuthService.createLocalUser({
          email: input.email,
          password: input.password,
          name: input.name,
          role: 'admin',
        });
        
        return {
          success: true,
          user: newAdmin,
        };
      }),
    
    // Alterar senha
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const { localAuthService } = await import('./services/auth/local-auth-service');
        return localAuthService.changePassword(
          ctx.user.id,
          input.currentPassword,
          input.newPassword
        );
      }),
  }),

  // Leads Router
  leads: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
        organization: z.string().optional(),
        source: z.enum(["contact_form", "whitepaper_download", "ebook", "scheduling", "calculator"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(leads).values({
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          organization: input.organization || null,
          source: input.source || "contact_form",
        
          createdAt: Date.now(),
        });
        
        return { success: true };
      }),
    
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(100);
    }),
    
    // Métricas de atividade dos últimos 7 dias
    activityMetrics: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { days: [], leads: [], downloads: [] };
      
      const now = new Date();
      const days: string[] = [];
      const leadsPerDay: number[] = [];
      const downloadsPerDay: number[] = [];
      
      // Buscar todos os leads e downloads
      const allLeads = await db.select().from(leads);
      const allWhitepaper = await db.select().from(whitepaperDownloads);
      const allEbook = await db.select().from(ebookDownloads);
      
      for (let i = 6; i >= 0; i--) {
        const date = now;
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dayLabel = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
        days.push(dayLabel);
        
        // Contar leads do dia
        const dayLeads = allLeads.filter(l => {
          const created = new Date(l.createdAt);
          return created >= date && created < nextDate;
        }).length;
        leadsPerDay.push(dayLeads);
        
        // Contar downloads do dia
        const dayWp = allWhitepaper.filter(d => {
          const created = new Date(d.downloadedAt);
          return created >= date && created < nextDate;
        }).length;
        const dayEb = allEbook.filter(d => {
          const created = new Date(d.downloadedAt);
          return created >= date && created < nextDate;
        }).length;
        downloadsPerDay.push(dayWp + dayEb);
      }
      
      return { days, leads: leadsPerDay, downloads: downloadsPerDay };
    }),
    
    exportCsv: protectedProcedure
      .input(z.object({
        source: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { csv: '', count: 0 };
        
        let query = db.select().from(leads).orderBy(desc(leads.createdAt));
        const allLeads = await query;
        
        // Filter by source if provided
        const filteredLeads = input?.source && input.source !== 'all'
          ? allLeads.filter(l => l.source === input.source)
          : allLeads;
        
        // Generate CSV
        const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Organização', 'Fonte', 'Data de Criação'];
        const rows = filteredLeads.map(lead => [
          lead.id,
          `"${(lead.name || '').replace(/"/g, '""')}"`,
          lead.email || '',
          lead.phone || '',
          `"${(lead.organization || '').replace(/"/g, '""')}"`,
          lead.source || '',
          lead.createdAt ? new Date(lead.createdAt).toISOString() : '',
        ]);
        
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        
        // Log de auditoria
        const { auditService } = await import('./services/audit/audit-service');
        await auditService.log({
          userId: ctx.user.id,
          userName: ctx.user.name || undefined,
          userEmail: ctx.user.email || undefined,
          action: 'export',
          resourceType: 'leads',
          metadata: { count: filteredLeads.length, source: input?.source },
        });
        
        return { csv, count: filteredLeads.length };
      }),
  }),

  // Contacts Router
  contacts: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
        subject: z.string().optional(),
        message: z.string().min(10),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(contacts).values({
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          subject: input.subject || null,
          message: input.message,
        
          createdAt: Date.now(),
        });
        
        return { success: true };
      }),
    
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      return db.select().from(contacts).orderBy(desc(contacts.createdAt)).limit(100);
    }),
    
    exportCsv: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { csv: '', count: 0 };
      
      const allContacts = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
      
      const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Assunto', 'Mensagem', 'Data de Criação'];
      const rows = allContacts.map(c => [
        c.id,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        c.email || '',
        c.phone || '',
        `"${(c.subject || '').replace(/"/g, '""')}"`,
        `"${(c.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        c.createdAt ? new Date(c.createdAt).toISOString() : '',
      ]);
      
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      // Log de auditoria
      const { auditService } = await import('./services/audit/audit-service');
      await auditService.log({
        userId: ctx.user.id,
        userName: ctx.user.name || undefined,
        userEmail: ctx.user.email || undefined,
        action: 'export',
        resourceType: 'contacts',
        metadata: { count: allContacts.length },
      });
      
      return { csv, count: allContacts.length };
    }),
  }),

  // Downloads Router
  downloads: router({
    whitepaper: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        organization: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(whitepaperDownloads).values({
          name: input.name,
          email: input.email,
          organization: input.organization || null,
          downloadedAt: Date.now(),
        });
        
        // Also create a lead
        await db.insert(leads).values({
          name: input.name,
          email: input.email,
          organization: input.organization || null,
          source: "whitepaper_download",
        
          createdAt: Date.now(),
        });
        
        return { success: true, downloadUrl: "/downloads/whitepaper-impact7.pdf" };
      }),
    
    ebook: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        organization: z.string().optional(),
        role: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(ebookDownloads).values({
          name: input.name,
          email: input.email,
          organization: input.organization || null,
          role: input.role || null,
          phone: input.phone || null,
          downloadedAt: Date.now(),
          emailSent: 0,
        });
        
        // Also create a lead
        await db.insert(leads).values({
          name: input.name,
          email: input.email,
          organization: input.organization || null,
          phone: input.phone || null,
          source: "ebook",
        
          createdAt: Date.now(),
        });
        
        return { success: true, downloadUrl: "/downloads/ebook-impact7.pdf" };
      }),
    
    listWhitepaper: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      return db.select().from(whitepaperDownloads).orderBy(desc(whitepaperDownloads.downloadedAt)).limit(100);
    }),
    
    listEbook: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      return db.select().from(ebookDownloads).orderBy(desc(ebookDownloads.downloadedAt)).limit(100);
    }),
    
    exportCsv: protectedProcedure
      .input(z.object({ type: z.enum(['whitepaper', 'ebook', 'all']).optional() }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { csv: '', count: 0 };
        
        const type = input?.type || 'all';
        let allDownloads: Array<{ id: number; name: string | null; email: string; organization: string | null; downloadedAt: number | null; type: string }> = [];
        
        if (type === 'all' || type === 'whitepaper') {
          const wpDownloads = await db.select().from(whitepaperDownloads).orderBy(desc(whitepaperDownloads.downloadedAt));
          allDownloads = allDownloads.concat(wpDownloads.map(d => ({ ...d, type: 'whitepaper' })));
        }
        
        if (type === 'all' || type === 'ebook') {
          const ebDownloads = await db.select().from(ebookDownloads).orderBy(desc(ebookDownloads.downloadedAt));
          allDownloads = allDownloads.concat(ebDownloads.map(d => ({ ...d, type: 'ebook' })));
        }
        
        const headers = ['ID', 'Nome', 'Email', 'Organização', 'Tipo', 'Data de Download'];
        const rows = allDownloads.map(d => [
          d.id,
          `"${(d.name || '').replace(/"/g, '""')}"`,
          d.email || '',
          `"${(d.organization || '').replace(/"/g, '""')}"`,
          d.type,
          d.downloadedAt ? new Date(d.downloadedAt).toISOString() : '',
        ]);
        
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        return { csv, count: allDownloads.length };
      }),
  }),

  // Newsletter Router
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        segment: z.enum(["general", "ambassador", "investor", "organization", "researcher"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(newsletterSubscribers).values({
          email: input.email,
          name: input.name || null,
          segment: input.segment || "general",
        
          createdAt: Date.now(),
        }).onDuplicateKeyUpdate({
          set: { name: input.name || null },
        });
        
        return { success: true };
      }),
  }),

  // Impact Calculator Router
  calculator: router({
    calculate: publicProcedure
      .input(z.object({
        investment: z.number().positive(),
        contextScore: z.number().min(1).max(10),
        resistanceScore: z.number().min(1).max(10),
        beneficiaries: z.number().positive(),
        duration: z.number().positive(),
        projectName: z.string().optional(),
        sector: z.string().optional(),
        sessionId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Calculate impact using the IMPACT7 equation: I = (E × C^7) / R
        const E = input.investment;
        const C = input.contextScore / 10;
        const R = Math.max(input.resistanceScore / 10, 0.1);
        
        const contextPower = Math.pow(C, 7);
        const impactScore = (E * contextPower) / R;
        
        // Calculate S-ROI
        const socialValue = impactScore * input.beneficiaries * (input.duration / 12);
        const sRoi = socialValue / input.investment;
        
        // Determine rating
        let rating = "Baixo";
        if (sRoi >= 12) rating = "Excelente";
        else if (sRoi >= 7) rating = "Muito Bom";
        else if (sRoi >= 4) rating = "Bom";
        else if (sRoi >= 2) rating = "Moderado";
        
        // Save calculation to database
        const db = await getDb();
        if (db) {
          await db.insert(calculations).values({
            investment: Math.round(input.investment),
            contextScore: input.contextScore,
            resistanceScore: input.resistanceScore,
            beneficiaries: input.beneficiaries,
            duration: input.duration,
            impactScore: Math.round(impactScore),
            sRoi: Math.round(sRoi * 100), // Store as integer (multiply by 100)
            projectName: input.projectName || null,
            sector: input.sector || null,
            sessionId: input.sessionId || null,
            createdAt: Date.now(),
          });
        }
        
        return {
          impactScore: Math.round(impactScore),
          sRoi: parseFloat(sRoi.toFixed(2)),
          socialValue: Math.round(socialValue),
          rating,
        };
      }),
    
    history: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      
      return db.select()
        .from(calculations)
        .where(eq(calculations.userId, ctx.user.id))
        .orderBy(desc(calculations.createdAt))
        .limit(20);
    }),
    
    exportPdf: publicProcedure
      .input(z.object({
        investment: z.number().positive(),
        contextScore: z.number().min(1).max(10),
        resistanceScore: z.number().min(1).max(10),
        beneficiaries: z.number().positive(),
        duration: z.number().positive(),
        sRoi: z.string(),
        socialValue: z.number(),
        impactScore: z.number(),
        rating: z.string(),
        language: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const pdfDataUri = generateCalculatorPDF(input as CalculatorResult);
        return { pdfDataUri };
      }),
  }),

  // Analytics Router
  analytics: router({
    // Track page view
    trackPageView: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        pagePath: z.string(),
        pageTitle: z.string().optional(),
        referrer: z.string().optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        deviceType: z.enum(["desktop", "mobile", "tablet"]).optional(),
        browser: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await trackPageView({
          ...input,
          userId: ctx.user?.id,
        });
        return { success: true };
      }),
    
    // Update page metrics (time on page, scroll depth)
    updatePageMetrics: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        pagePath: z.string(),
        timeOnPage: z.number(),
        scrollDepth: z.number().min(0).max(100),
      }))
      .mutation(async ({ input }) => {
        await updatePageViewMetrics(
          input.sessionId,
          input.pagePath,
          input.timeOnPage,
          input.scrollDepth
        );
        return { success: true };
      }),
    
    // Track Jarvis interaction
    trackJarvis: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        interactionType: z.enum(["chat", "calculator", "mentorship", "export", "search"]),
        query: z.string().optional(),
        skillUsed: z.string().optional(),
        responseTime: z.number().optional(),
        successful: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await trackJarvisInteraction({
          ...input,
          userId: ctx.user?.id,
        });
        return { success: true };
      }),
    
    // Submit Jarvis feedback
    jarvisFeedback: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        feedback: z.enum(["positive", "negative", "neutral"]),
      }))
      .mutation(async ({ input }) => {
        await updateJarvisFeedback(input.sessionId, input.feedback);
        return { success: true };
      }),
    
    // Track lead conversion
    trackConversion: publicProcedure
      .input(z.object({
        leadId: z.number(),
        conversionType: z.enum(["signup", "download", "contact", "calculator", "demo_request", "purchase"]),
        sourcePage: z.string().optional(),
        sourceForm: z.string().optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        referrer: z.string().optional(),
        deviceType: z.enum(["desktop", "mobile", "tablet"]).optional(),
      }))
      .mutation(async ({ input }) => {
        await trackLeadConversion(input);
        return { success: true };
      }),
    
    // Get dashboard metrics (admin only)
    dashboard: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        return getDashboardMetrics(startDate, endDate);
      }),
    
    // Get metrics by day (admin only)
    metricsByDay: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        return getMetricsByDay(startDate, endDate);
      }),
    
    // Get Jarvis stats (admin only)
    jarvisStats: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        return getJarvisStats(startDate, endDate);
      }),
    
    // Get Jarvis interactions by day (admin only)
    jarvisByDay: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        return getJarvisInteractionsByDay(startDate, endDate);
      }),
    
    // Get top Jarvis queries (admin only)
    topQueries: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).optional(),
      }))
      .query(async ({ input }) => {
        return getTopJarvisQueries(input.limit || 10);
      }),
    
    // Get conversion stats (admin only)
    conversionStats: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        return getConversionStats(startDate, endDate);
      }),
    
    // Get conversions by source (admin only)
    conversionsBySource: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        return getConversionsBySource(startDate, endDate);
      }),
    
    // Get conversion funnel (admin only)
    conversionFunnel: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        return getConversionFunnel(startDate, endDate);
      }),
    
    // Get top pages (admin only)
    topPages: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
        limit: z.number().min(1).max(50).optional(),
      }))
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        return getTopPages(startDate, endDate, input.limit || 10);
      }),
  }),

  // Jarvis AI Router
  jarvis: router({
    chat: publicProcedure
      .input(z.object({
        message: z.string().min(1),
        history: z.array(z.object({
          role: z.enum(["user", "assistant", "system"]),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const history = (input.history || []) as JarvisMessage[];
        return chatWithJarvis(input.message, history);
      }),
    
    calculate: publicProcedure
      .input(z.object({
        investment: z.number().positive(),
        contextScore: z.number().min(1).max(10),
        resistanceScore: z.number().min(1).max(10),
        beneficiaries: z.number().positive(),
        duration: z.number().positive(),
      }))
      .mutation(async ({ input }) => {
        return jarvisSkills.calculator(input);
      }),
    
    mentorship: publicProcedure
      .input(z.object({
        topic: z.string().min(3),
        context: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return jarvisSkills.mentorship(input.topic, input.context || "");
      }),
    
    suggestions: publicProcedure.query(() => {
      return getSuggestedQuestions();
    }),
    
    search: publicProcedure
      .input(z.object({
        query: z.string().min(2),
        limit: z.number().min(1).max(10).optional(),
      }))
      .query(({ input }) => {
        return searchKnowledge(input.query, input.limit || 3);
      }),
    
    categories: publicProcedure.query(() => {
      return listCategories();
    }),
    
    documentsByCategory: publicProcedure
      .input(z.object({
        category: z.string(),
      }))
      .query(({ input }) => {
        return getDocumentsByCategory(input.category);
      }),
  }),

  // Alerts Router (Admin only)
  alerts: router({
    summary: protectedProcedure.query(() => {
      return getAlertSummary();
    }),
    
    active: protectedProcedure.query(() => {
      return getActiveAlerts();
    }),
    
    history: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(500).optional().default(100),
      }))
      .query(({ input }) => {
        return getAlertHistory(input.limit);
      }),
    
    acknowledge: protectedProcedure
      .input(z.object({
        alertId: z.string(),
      }))
      .mutation(({ input }) => {
        return { success: acknowledgeAlert(input.alertId) };
      }),
    
    resolve: protectedProcedure
      .input(z.object({
        alertId: z.string(),
      }))
      .mutation(({ input }) => {
        return { success: resolveAlert(input.alertId) };
      }),
    
    circuitBreakers: protectedProcedure.query(() => {
      return getAllCircuitBreakerStatus();
    }),
    
    cacheStats: protectedProcedure.query(() => {
      return getAllCacheStats();
    }),
    
    systemHealth: protectedProcedure.query(() => {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      return {
        status: 'healthy',
        uptime: Math.floor(uptime),
        uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
        },
        timestamp: Date.now(),
      };
    }),
    
    errorStats: protectedProcedure.query(() => {
      const stats = errorTracker.getStats();
      return {
        total: stats.total,
        byLevel: stats.byLevel,
        uniqueErrors: stats.byFingerprint.size,
        recentErrors: stats.recentErrors.map(e => ({
          id: e.id,
          level: e.level,
          message: e.message,
          timestamp: e.timestamp,
          count: e.count,
        })),
      };
    }),
    
    recentErrors: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).optional().default(50) }))
      .query(({ input }) => {
        return errorTracker.getRecentErrors(input.limit).map(e => ({
          id: e.id,
          level: e.level,
          message: e.message,
          stack: e.stack,
          timestamp: e.timestamp,
          context: e.context,
          count: e.count,
          tags: e.tags,
        }));
      }),
  }),
  
  // Frontend error reporting
  errors: router({
    report: publicProcedure
      .input(z.object({
        message: z.string(),
        stack: z.string().optional(),
        context: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(({ input }) => {
        const errorId = handleFrontendError(input.message, input.stack, input.context);
        return { errorId, success: true };
      }),
  }),
  
  // Push Notifications
  notifications: router({
    getPreferences: protectedProcedure.query(({ ctx }) => {
      return getUserPreferences(String(ctx.user.id));
    }),
    
    updatePreferences: protectedProcedure
      .input(z.object({
        enabledSeverities: z.array(z.enum(['P1', 'P2', 'P3', 'P4'])).optional(),
        enableEmail: z.boolean().optional(),
        enablePush: z.boolean().optional(),
        quietHoursStart: z.number().min(0).max(23).optional(),
        quietHoursEnd: z.number().min(0).max(23).optional(),
        timezone: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => {
        return updateUserPreferences(String(ctx.user.id), input);
      }),
    
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).optional().default(50) }))
      .query(({ ctx, input }) => {
        return getUserNotifications(String(ctx.user.id), input.limit);
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.string() }))
      .mutation(({ input }) => {
        const success = markNotificationAsRead(input.notificationId);
        return { success };
      }),
    
    unreadCount: protectedProcedure.query(({ ctx }) => {
      return { count: getUnreadCount(String(ctx.user.id)) };
    }),
    
    sendTest: protectedProcedure.mutation(async ({ ctx }) => {
      const success = await sendTestNotification(String(ctx.user.id));
      return { success };
    }),
    
    stats: protectedProcedure.query(() => {
      return getNotificationStats();
    }),
  }),
  
  // Cases Router
  cases: router({
    // Listar cases do banco de dados
    list: publicProcedure
      .input(z.object({
        sector: z.string().optional(),
        region: z.string().optional(),
        featured: z.boolean().optional(),
        limit: z.number().default(20),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        let query = `
          SELECT id, title, organization, sector, region, location, investment, beneficiaries,
                 duration, sroi, year, description, challenge, solution, results,
                 testimonialQuote, testimonialAuthor, testimonialRole, sdgs, metrics,
                 isFeatured, isActive
          FROM caseStudies 
          WHERE isActive = TRUE
        `;
        if (input?.sector) {
          query += ` AND sector = '${input.sector}'`;
        }
        if (input?.region) {
          query += ` AND region = '${input.region}'`;
        }
        if (input?.featured) {
          query += ` AND isFeatured = TRUE`;
        }
        query += ` ORDER BY isFeatured DESC, year DESC LIMIT ${input?.limit || 20}`;
        const result = await executeRawQuery(query);
        return (result as any)[0] || [];
      }),

    // Obter um case específico
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await executeRawQuery(`
          SELECT * FROM caseStudies WHERE id = ${input.id} AND isActive = TRUE
        `);
        const rows = (result as any)[0];
        return rows?.[0] || null;
      }),

    // Obter setores disponíveis
    getSectors: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const result = await executeRawQuery(`
        SELECT DISTINCT sector FROM caseStudies WHERE isActive = TRUE ORDER BY sector
      `);
      return ((result as any)[0] || []).map((r: any) => r.sector);
    }),

    // Obter regiões disponíveis
    getRegions: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const result = await executeRawQuery(`
        SELECT DISTINCT region FROM caseStudies WHERE isActive = TRUE ORDER BY region
      `);
      return ((result as any)[0] || []).map((r: any) => r.region);
    }),

    generatePDF: publicProcedure
      .input(z.object({
        caseData: z.object({
          id: z.number(),
          title: z.string(),
          organization: z.string(),
          location: z.string(),
          region: z.string(),
          sector: z.string(),
          investment: z.string(),
          beneficiaries: z.string(),
          duration: z.string(),
          sRoi: z.string(),
          year: z.number(),
          metrics: z.array(z.object({
            label: z.string(),
            value: z.string(),
            change: z.enum(['up', 'down']),
          })),
          description: z.string(),
          challenge: z.string(),
          solution: z.string(),
          results: z.string(),
          testimonial: z.object({
            quote: z.string(),
            author: z.string(),
            role: z.string(),
          }),
          sdgs: z.array(z.string()),
        }),
      }))
      .mutation(({ input }) => {
        const html = generateCasePDFContent(input.caseData as CaseStudy);
        return { html, success: true };
      }),
    
    // Relatório Consolidado
    generateConsolidatedReport: publicProcedure
      .input(z.object({
        cases: z.array(z.object({
          id: z.number(),
          title: z.string(),
          organization: z.string(),
          location: z.string(),
          region: z.string(),
          sector: z.string(),
          investment: z.string(),
          investmentValue: z.number(),
          beneficiaries: z.string(),
          beneficiariesValue: z.number(),
          duration: z.string(),
          sRoi: z.string(),
          sRoiValue: z.number(),
          year: z.number(),
          metrics: z.array(z.object({
            label: z.string(),
            value: z.string(),
          })),
          sdgs: z.array(z.string()),
        })),
        filters: z.object({
          sectors: z.array(z.string()).optional(),
          regions: z.array(z.string()).optional(),
          years: z.array(z.number()).optional(),
          minSRoi: z.number().optional(),
        }).optional(),
        customTitle: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const reportData = prepareConsolidatedReport(
          input.cases as CaseForReport[],
          input.filters as ReportFilters,
          input.customTitle
        );
        const html = generateConsolidatedReportHTML(reportData);
        return { html, summary: reportData.summary, success: true };
      }),
    
    // Favoritos
    getFavorites: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const favorites = await db
        .select()
        .from(caseFavorites)
        .where(eq(caseFavorites.userId, ctx.user.id))
        .orderBy(desc(caseFavorites.createdAt));
      return favorites;
    }),
    
    addFavorite: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        await db.insert(caseFavorites).values({
          userId: ctx.user.id,
          caseId: input.caseId,
        
          createdAt: Date.now(),
        });
        return { success: true };
      }),
    
    removeFavorite: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        await db.delete(caseFavorites).where(
          and(
            eq(caseFavorites.userId, ctx.user.id),
            eq(caseFavorites.caseId, input.caseId)
          )
        );
        return { success: true };
      }),
    
    // Submissões de Cases
    submitCase: publicProcedure
      .input(z.object({
        organizationName: z.string().min(2),
        contactName: z.string().min(2),
        contactEmail: z.string().email(),
        contactPhone: z.string().optional(),
        projectTitle: z.string().min(5),
        sector: z.string(),
        location: z.string(),
        investment: z.string(),
        beneficiaries: z.string(),
        duration: z.string(),
        description: z.string().min(50),
        challenge: z.string().min(30),
        solution: z.string().min(30),
        results: z.string().min(30),
        metrics: z.array(z.object({
          label: z.string(),
          value: z.string(),
        })),
        documentUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const result = await db.insert(caseSubmissions).values({
          ...input,
          metrics: JSON.stringify(input.metrics),
          status: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }).$returningId();
        
        // Enviar notificação ao owner sobre nova submissão
        await notifyNewCaseSubmission({
          projectTitle: input.projectTitle,
          organizationName: input.organizationName,
          contactName: input.contactName,
          contactEmail: input.contactEmail,
          sector: input.sector,
          location: input.location,
          investment: input.investment,
          beneficiaries: input.beneficiaries,
        });
        
        return { success: true, submissionId: result[0]?.id || 0 };
      }),
    
    getSubmissions: protectedProcedure.query(async ({ ctx }) => {
      // Apenas admin pode ver submissões
      if (ctx.user.role !== 'admin') {
        return [];
      }
      const db = await getDb();
      if (!db) return [];
      const submissions = await db
        .select()
        .from(caseSubmissions)
        .orderBy(desc(caseSubmissions.createdAt));
      return submissions;
    }),
    
    updateSubmissionStatus: protectedProcedure
      .input(z.object({
        submissionId: z.number(),
        status: z.enum(['pending', 'reviewing', 'approved', 'rejected']),
        reviewNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem atualizar status');
        }
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        // Buscar dados da submissão para notificação
        const [submission] = await db
          .select()
          .from(caseSubmissions)
          .where(eq(caseSubmissions.id, input.submissionId));
        
        await db.update(caseSubmissions)
          .set({
            status: input.status,
            reviewNotes: input.reviewNotes,
            reviewedAt: Date.now(),
            reviewedBy: ctx.user.id,
          })
          .where(eq(caseSubmissions.id, input.submissionId));
        
        // Enviar notificação sobre mudança de status
        if (submission && input.status !== 'pending') {
          await notifyCaseStatusChange({
            projectTitle: submission.projectTitle,
            organizationName: submission.organizationName,
            contactName: submission.contactName,
            contactEmail: submission.contactEmail,
            newStatus: input.status as 'reviewing' | 'approved' | 'rejected',
            reviewNotes: input.reviewNotes,
          });
        }
        
        // Log de auditoria
        const { auditService } = await import('./services/audit/audit-service');
        await auditService.log({
          userId: ctx.user.id,
          userName: ctx.user.name || undefined,
          userEmail: ctx.user.email || undefined,
          action: input.status === 'approved' ? 'approve' : input.status === 'rejected' ? 'reject' : 'update',
          resourceType: 'case_submission',
          resourceId: String(input.submissionId),
          resourceName: submission?.projectTitle,
          previousValue: { status: submission?.status },
          newValue: { status: input.status, reviewNotes: input.reviewNotes },
        });
        
        return { success: true };
      }),
  }),
  
  // Tags Router
  tags: router({
    // Listar todas as tags
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(caseTags).orderBy(caseTags.name);
    }),
    
    // Criar nova tag (admin only)
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem criar tags');
        }
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const slug = input.name.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        
        const result = await db.insert(caseTags).values({
          name: input.name,
          slug,
          color: input.color || '#f97316',
          description: input.description,
          createdBy: ctx.user.id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }).$returningId();
        
        return { success: true, id: result[0].id };
      }),
    
    // Atualizar tag (admin only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem editar tags');
        }
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const updates: Record<string, unknown> = {};
        if (input.name) {
          updates.name = input.name;
          updates.slug = input.name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }
        if (input.color) updates.color = input.color;
        if (input.description !== undefined) updates.description = input.description;
        
        await db.update(caseTags).set(updates).where(eq(caseTags.id, input.id));
        return { success: true };
      }),
    
    // Deletar tag (admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem deletar tags');
        }
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        // Remover relações primeiro
        await db.delete(caseTagRelations).where(eq(caseTagRelations.tagId, input.id));
        await db.delete(caseTags).where(eq(caseTags.id, input.id));
        return { success: true };
      }),
    
    // Associar tag a um case
    addToCase: protectedProcedure
      .input(z.object({
        caseId: z.number(),
        tagId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem associar tags');
        }
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.insert(caseTagRelations).values({
          caseId: input.caseId,
          tagId: input.tagId,
        
          createdAt: Date.now(),
        });
        return { success: true };
      }),
    
    // Remover tag de um case
    removeFromCase: protectedProcedure
      .input(z.object({
        caseId: z.number(),
        tagId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem remover tags');
        }
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.delete(caseTagRelations)
          .where(and(
            eq(caseTagRelations.caseId, input.caseId),
            eq(caseTagRelations.tagId, input.tagId)
          ));
        return { success: true };
      }),
    
    // Obter tags de um case
    getForCase: publicProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        
        const relations = await db.select()
          .from(caseTagRelations)
          .where(eq(caseTagRelations.caseId, input.caseId));
        
        if (relations.length === 0) return [];
        
        const tagIds = relations.map(r => r.tagId);
        const tags = await db.select().from(caseTags);
        return tags.filter(t => tagIds.includes(t.id));
      }),
  }),

  // Gamification router
  gamification: router({
    // Obter estatísticas do usuário
    getStats: protectedProcedure.query(async ({ ctx }) => {
      return await getUserStats(ctx.user.id);
    }),

    // Obter todos os badges disponíveis
    getAllBadges: publicProcedure.query(async () => {
      return await getAllBadges();
    }),

    // Obter badges do usuário
    getUserBadges: protectedProcedure.query(async ({ ctx }) => {
      return await getUserBadges(ctx.user.id);
    }),

    // Obter leaderboard
    getLeaderboard: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(10) }).optional())
      .query(async ({ input }) => {
        return await getLeaderboard(input?.limit || 10);
      }),

    // Registrar interação (chamado internamente)
    recordInteraction: protectedProcedure
      .input(z.object({
        action: z.enum(['jarvis_question', 'jarvis_feedback_positive', 'jarvis_feedback_negative', 'calculator_use', 'case_favorite', 'case_download', 'daily_login']),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const points = POINTS_CONFIG[input.action] || 0;
        const result = await addPoints(ctx.user.id, points, input.action, input.metadata);
        await updateStreak(ctx.user.id);
        return result;
      }),

    // Inicializar badges padrão (admin only)
    initBadges: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Apenas administradores podem inicializar badges');
      }
      await initializeDefaultBadges();
      return { success: true };
    }),
  }),

  // Public API router
  publicApi: router({
    // Listar permissões disponíveis
    getPermissions: publicProcedure.query(() => {
      return API_PERMISSIONS;
    }),

    // Listar API keys do usuário
    listKeys: protectedProcedure.query(async ({ ctx }) => {
      return await listUserApiKeys(ctx.user.id);
    }),

    // Criar nova API key
    createKey: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        permissions: z.array(z.string()).default(["cases:read"]),
        rateLimit: z.number().min(100).max(10000).default(1000),
        expiresInDays: z.number().min(1).max(365).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createApiKey(
          ctx.user.id,
          input.name,
          input.permissions,
          input.rateLimit,
          input.expiresInDays
        );
        if (!result) throw new Error("Falha ao criar API key");
        return result;
      }),

    // Revogar API key
    revokeKey: protectedProcedure
      .input(z.object({ keyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await revokeApiKey(ctx.user.id, input.keyId);
        return { success: true };
      }),

    // Obter documentação da API
    getDocumentation: publicProcedure.query(() => {
      return {
        title: "IMPACT7 Public API",
        version: "1.0.0",
        baseUrl: "/api/v1",
        authentication: {
          type: "API Key",
          header: "X-API-Key",
          description: "Inclua sua API key no header X-API-Key de todas as requisições",
        },
        endpoints: [
          {
            method: "GET",
            path: "/cases",
            description: "Listar cases de impacto social",
            permission: "cases:list",
            parameters: [
              { name: "sector", type: "string", description: "Filtrar por setor" },
              { name: "region", type: "string", description: "Filtrar por região" },
              { name: "year", type: "number", description: "Filtrar por ano" },
              { name: "limit", type: "number", description: "Limite de resultados (max 100)" },
              { name: "offset", type: "number", description: "Offset para paginação" },
            ],
          },
          {
            method: "GET",
            path: "/cases/:id",
            description: "Obter detalhes de um case",
            permission: "cases:read",
          },
          {
            method: "GET",
            path: "/stats",
            description: "Obter estatísticas agregadas",
            permission: "cases:stats",
          },
          {
            method: "POST",
            path: "/calculator",
            description: "Calcular S-ROI usando a equação IMPACT7",
            permission: "calculator:use",
            body: {
              investment: "number (R$)",
              beneficiaries: "number",
              duration: "number (meses)",
              socialValue: "number (opcional)",
            },
          },
          {
            method: "GET",
            path: "/sdgs",
            description: "Listar ODS (Objetivos de Desenvolvimento Sustentável)",
            permission: "sdgs:read",
          },
        ],
        rateLimits: {
          default: "1000 requisições/hora",
          custom: "Configure ao criar sua API key",
        },
        errors: [
          { code: 401, message: "API key inválida ou ausente" },
          { code: 403, message: "Permissão negada para este endpoint" },
          { code: 429, message: "Rate limit excedido" },
          { code: 404, message: "Recurso não encontrado" },
        ],
      };
    }),
  }),

  // Webhooks router
  webhooks: router({
    // Listar eventos disponíveis
    getEvents: publicProcedure.query(() => {
      return WEBHOOK_EVENTS;
    }),

    // Listar webhooks do usuário
    list: protectedProcedure.query(async ({ ctx }) => {
      return await listUserWebhooks(ctx.user.id);
    }),

    // Criar webhook
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        url: z.string().url(),
        events: z.array(z.string()).min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createWebhook(
          ctx.user.id,
          input.name,
          input.url,
          input.events as WebhookEvent[]
        );
        if (!result) throw new Error("Falha ao criar webhook");
        return result;
      }),

    // Atualizar webhook
    update: protectedProcedure
      .input(z.object({
        webhookId: z.number(),
        name: z.string().min(1).max(100).optional(),
        url: z.string().url().optional(),
        events: z.array(z.string()).min(1).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { webhookId, ...updates } = input;
        await updateWebhook(ctx.user.id, webhookId, {
          ...updates,
          events: updates.events as WebhookEvent[] | undefined,
        });
        return { success: true };
      }),

    // Deletar webhook
    delete: protectedProcedure
      .input(z.object({ webhookId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteWebhook(ctx.user.id, input.webhookId);
        return { success: true };
      }),

    // Regenerar secret
    regenerateSecret: protectedProcedure
      .input(z.object({ webhookId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const newSecret = await regenerateWebhookSecret(ctx.user.id, input.webhookId);
        if (!newSecret) throw new Error("Falha ao regenerar secret");
        return { secret: newSecret };
      }),

    // Obter histórico de entregas
    getDeliveries: protectedProcedure
      .input(z.object({
        webhookId: z.number(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        return await getWebhookDeliveries(ctx.user.id, input.webhookId, input.limit);
      }),

    // Testar webhook
    test: protectedProcedure
      .input(z.object({ webhookId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await testWebhook(ctx.user.id, input.webhookId);
      }),
  }),

  // OAuth2 router
  oauth: router({
    // Listar escopos disponíveis
    getScopes: publicProcedure.query(() => {
      return OAUTH_SCOPES;
    }),

    // Listar OAuth clients do usuário
    listClients: protectedProcedure.query(async ({ ctx }) => {
      return await listUserOAuthClients(ctx.user.id);
    }),

    // Criar OAuth client
    createClient: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        redirectUris: z.array(z.string().url()).min(1),
        scopes: z.array(z.string()).min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createOAuthClient(
          ctx.user.id,
          input.name,
          input.description || "",
          input.redirectUris,
          input.scopes as OAuthScope[]
        );
        if (!result) throw new Error("Falha ao criar OAuth client");
        return result;
      }),

    // Deletar OAuth client
    deleteClient: protectedProcedure
      .input(z.object({ clientId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const success = await deleteOAuthClient(ctx.user.id, input.clientId);
        if (!success) throw new Error("Client não encontrado");
        return { success: true };
      }),

    // Regenerar client secret
    regenerateSecret: protectedProcedure
      .input(z.object({ clientId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const newSecret = await regenerateClientSecret(ctx.user.id, input.clientId);
        if (!newSecret) throw new Error("Client não encontrado");
        return { clientSecret: newSecret };
      }),

    // Validar autorização (usado na página de consent)
    validateAuthorization: protectedProcedure
      .input(z.object({
        clientId: z.string(),
        redirectUri: z.string(),
        scopes: z.array(z.string()),
        state: z.string().optional(),
        codeChallenge: z.string().optional(),
        codeChallengeMethod: z.enum(["plain", "S256"]).optional(),
      }))
      .query(async ({ input }) => {
        const validation = await validateOAuthClient(
          input.clientId,
          input.redirectUri,
          input.scopes as OAuthScope[]
        );
        return validation;
      }),

    // Autorizar (gerar authorization code)
    authorize: protectedProcedure
      .input(z.object({
        clientId: z.string(),
        redirectUri: z.string(),
        scopes: z.array(z.string()),
        state: z.string().optional(),
        codeChallenge: z.string().optional(),
        codeChallengeMethod: z.enum(["plain", "S256"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Validar primeiro
        const validation = await validateOAuthClient(
          input.clientId,
          input.redirectUri,
          input.scopes as OAuthScope[]
        );
        
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        
        // Gerar authorization code
        const code = await generateAuthCode(
          input.clientId,
          ctx.user.id,
          input.redirectUri,
          input.scopes as OAuthScope[],
          input.codeChallenge,
          input.codeChallengeMethod
        );
        
        if (!code) throw new Error("Falha ao gerar authorization code");
        
        return { code, state: input.state };
      }),

    // Trocar code por tokens (público)
    token: publicProcedure
      .input(z.object({
        grantType: z.enum(["authorization_code", "refresh_token"]),
        clientId: z.string(),
        clientSecret: z.string(),
        code: z.string().optional(),
        redirectUri: z.string().optional(),
        codeVerifier: z.string().optional(),
        refreshToken: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        if (input.grantType === "authorization_code") {
          if (!input.code || !input.redirectUri) {
            throw new Error("code e redirect_uri são obrigatórios");
          }
          
          const result = await exchangeCodeForTokens(
            input.clientId,
            input.clientSecret,
            input.code,
            input.redirectUri,
            input.codeVerifier
          );
          
          if ("error" in result) {
            throw new Error(result.error);
          }
          
          return {
            access_token: result.accessToken,
            refresh_token: result.refreshToken,
            token_type: "Bearer",
            expires_in: result.expiresIn,
            scope: result.scopes.join(" "),
          };
        } else {
          if (!input.refreshToken) {
            throw new Error("refresh_token é obrigatório");
          }
          
          const result = await refreshAccessToken(
            input.clientId,
            input.clientSecret,
            input.refreshToken
          );
          
          if ("error" in result) {
            throw new Error(result.error);
          }
          
          return {
            access_token: result.accessToken,
            refresh_token: result.refreshToken,
            token_type: "Bearer",
            expires_in: result.expiresIn,
            scope: result.scopes.join(" "),
          };
        }
      }),
  }),
  
  // Certificates Router
  certificates: router({
    // Issue a new certificate
    issue: protectedProcedure
      .input(z.object({
        organizationName: z.string().min(1),
        projectName: z.string().min(1),
        projectDescription: z.string().optional(),
        totalInvestment: z.number().positive(),
        beneficiaries: z.number().positive(),
        sRoi: z.number(),
        impactScore: z.number(),
        sector: z.string(),
        sdgs: z.array(z.number()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return issueCertificate(ctx.user.id, input);
      }),

    // Verify a certificate (public)
    verify: publicProcedure
      .input(z.object({
        certificateId: z.string(),
      }))
      .mutation(async ({ input }) => {
        return verifyCertificate(input.certificateId);
      }),

    // Approve certificate (admin)
    approve: protectedProcedure
      .input(z.object({
        certificateId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Acesso negado");
        return approveCertificate(input.certificateId, ctx.user.id);
      }),

    // Revoke certificate (admin)
    revoke: protectedProcedure
      .input(z.object({
        certificateId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Acesso negado");
        return revokeCertificate(input.certificateId, ctx.user.id);
      }),

    // Get user certificates
    getUserCertificates: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getUserCertificates(ctx.user.id, input?.limit);
      }),

    // Get public certificates
    getPublic: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getPublicCertificates(input?.limit);
      }),

    // Generate QR Code for certificate verification
    generateQRCode: publicProcedure
      .input(z.object({
        certificateId: z.string(),
      }))
      .query(async ({ input }) => {
        return generateCertificateQRCode(input.certificateId);
      }),

    // Generate certificate HTML for PDF export
    generateHTML: protectedProcedure
      .input(z.object({
        certificateId: z.string(),
      }))
      .query(async ({ input }) => {
        const result = await verifyCertificate(input.certificateId);
        if (!result.valid || !result.certificate) {
          throw new Error('Certificado não encontrado');
        }
        const cert = result.certificate;
        const html = await generateCertificateHTML({
          certificateId: cert.certificateId,
          projectName: cert.projectName,
          organizationName: cert.organizationName,
          sRoi: cert.sRoi,
          beneficiaries: cert.beneficiaries,
          impactScore: cert.impactScore,
          sector: cert.sector,
          sdgs: cert.sdgs ? JSON.parse(cert.sdgs) : [],
          issuedAt: new Date(cert.issuedAt),
          dataHash: cert.dataHash,
        });
        return { html };
      }),
  }),

  // Impact Tokens Router
  tokens: router({
    // Mint a new token
    mint: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        tokenType: z.enum(["impact_credit", "verification_badge", "achievement", "contribution"]),
        amount: z.number().optional(),
        value: z.number().optional(),
        certificateId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return mintToken(ctx.user.id, null, input.certificateId || null, input);
      }),

    // Get user tokens
    getUserTokens: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getUserTokens(ctx.user.id, input?.limit);
      }),

    // Get organization stats
    getOrgStats: protectedProcedure
      .input(z.object({ organizationId: z.number() }))
      .query(async ({ input }) => {
        return getOrganizationTokenStats(input.organizationId);
      }),

    // Get global token stats (admin only)
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const db = await getDb();
        if (!db) {
          return { totalTokens: 0, totalHolders: 0, totalTransactions: 0, byType: {} };
        }
        
        // Total de tokens
        const allTokens = await db.select().from(impactTokens);
        const totalTokens = allTokens.reduce((sum, t) => sum + (t.amount || 1), 0);
        
        // Holders únicos
        const holdersSet = new Set(allTokens.map(t => t.userId));
        const totalHolders = holdersSet.size;
        
        // Transações (tokens emitidos)
        const totalTransactions = allTokens.length;
        
        // Por tipo
        const byType = allTokens.reduce((acc, t) => {
          const type = t.tokenType || 'unknown';
          acc[type] = (acc[type] || 0) + (t.amount || 1);
          return acc;
        }, {} as Record<string, number>);
        
        return { totalTokens, totalHolders, totalTransactions, byType };
      }),
  }),

  // Jarvis Memory Router
  jarvisMemory: router({
    // Save a memory
    save: protectedProcedure
      .input(z.object({
        key: z.string().min(1),
        value: z.string().min(1),
        type: z.enum(["preference", "fact", "context", "goal", "project", "interaction"]),
        importance: z.number().min(1).max(10).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return saveMemory(ctx.user.id, {
          key: input.key,
          value: input.value,
          type: input.type as MemoryType,
          importance: input.importance,
        });
      }),

    // Get memories by type
    getByType: protectedProcedure
      .input(z.object({
        type: z.enum(["preference", "fact", "context", "goal", "project", "interaction"]),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return getMemoriesByType(ctx.user.id, input.type as MemoryType, input.limit);
      }),

    // Get memory by key
    getByKey: protectedProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ ctx, input }) => {
        return getMemoryByKey(ctx.user.id, input.key);
      }),

    // Search memories
    search: protectedProcedure
      .input(z.object({
        query: z.string().min(1),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return searchMemories(ctx.user.id, input.query, input.limit);
      }),

    // Get all memories
    getAll: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getAllUserMemories(ctx.user.id, input?.limit);
      }),

    // Build context for LLM
    buildContext: protectedProcedure
      .query(async ({ ctx }) => {
        return buildMemoryContext(ctx.user.id);
      }),

    // Delete a memory
    delete: protectedProcedure
      .input(z.object({ memoryId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return deleteMemory(ctx.user.id, input.memoryId);
      }),

    // Clear all memories
    clearAll: protectedProcedure
      .mutation(async ({ ctx }) => {
        return clearAllMemories(ctx.user.id);
      }),
  }),

  // Jarvis Reports Router
  jarvisReports: router({
    // Generate a new report
    generate: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        reportType: z.enum(["impact", "executive_summary", "progress", "comparison", "forecast", "custom"]),
        metrics: z.object({
          totalInvestment: z.number(),
          totalBeneficiaries: z.number(),
          averageSroi: z.number(),
          projectCount: z.number(),
          impactScore: z.number(),
          sectors: z.array(z.string()),
          sdgs: z.array(z.number()),
        }).optional(),
        customPrompt: z.string().optional(),
        includeRecommendations: z.boolean().optional(),
        language: z.enum(["pt", "en", "es"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return generateReport({
          userId: ctx.user.id,
          title: input.title,
          reportType: input.reportType as ReportType,
          metrics: input.metrics,
          customPrompt: input.customPrompt,
          includeRecommendations: input.includeRecommendations,
          language: input.language,
        });
      }),

    // Get user reports
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getUserReports(ctx.user.id, input?.limit);
      }),

    // Get a specific report
    get: protectedProcedure
      .input(z.object({ reportId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getReport(ctx.user.id, input.reportId);
      }),

    // Delete a report
    delete: protectedProcedure
      .input(z.object({ reportId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return deleteReport(ctx.user.id, input.reportId);
      }),

    // Generate HTML for PDF export
    generateHTML: protectedProcedure
      .input(z.object({ reportId: z.number() }))
      .query(async ({ ctx, input }) => {
        const report = await getReport(ctx.user.id, input.reportId);
        if (!report) {
          throw new Error('Relatório não encontrado');
        }
        const html = generateReportHTML({
          title: report.title,
          reportType: report.reportType,
          content: report.content,
          executiveSummary: report.summary || undefined,
          generatedAt: new Date(report.createdAt),
          userId: report.userId,
        });
        return { html };
      }),
  }),

  // API Metrics Router (admin only)
  apiMetrics: router({
    getSummary: protectedProcedure
      .input(z.object({
        timeRange: z.enum(["hour", "day", "week"]).default("hour"),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado");
        }
        
        const ranges: Record<string, number> = {
          hour: TIME_RANGES.HOUR,
          day: TIME_RANGES.DAY,
          week: TIME_RANGES.WEEK,
        };
        
        const timeRange = ranges[input?.timeRange || "hour"];
        return getMetricsSummary(timeRange);
      }),
    
    getEndpoints: protectedProcedure
      .input(z.object({
        timeRange: z.enum(["hour", "day", "week"]).default("hour"),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado");
        }
        
        const ranges: Record<string, number> = {
          hour: TIME_RANGES.HOUR,
          day: TIME_RANGES.DAY,
          week: TIME_RANGES.WEEK,
        };
        
        const timeRange = ranges[input?.timeRange || "hour"];
        return getEndpointStats(timeRange);
      }),
    
    getClients: protectedProcedure
      .input(z.object({
        timeRange: z.enum(["hour", "day", "week"]).default("hour"),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado");
        }
        
        const ranges: Record<string, number> = {
          hour: TIME_RANGES.HOUR,
          day: TIME_RANGES.DAY,
          week: TIME_RANGES.WEEK,
        };
        
        const timeRange = ranges[input?.timeRange || "hour"];
        return getClientStats(timeRange);
      }),
    
    getTimeSeries: protectedProcedure
      .input(z.object({
        timeRange: z.enum(["hour", "day", "week"]).default("hour"),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado");
        }
        
        const ranges: Record<string, number> = {
          hour: TIME_RANGES.HOUR,
          day: TIME_RANGES.DAY,
          week: TIME_RANGES.WEEK,
        };
        
        const buckets: Record<string, number> = {
          hour: TIME_RANGES.MINUTE,
          day: TIME_RANGES.HOUR,
          week: TIME_RANGES.DAY,
        };
        
        const timeRange = ranges[input?.timeRange || "hour"];
        const bucketSize = buckets[input?.timeRange || "hour"];
        
        return getTimeSeries(timeRange, bucketSize);
      }),
    
    getErrors: protectedProcedure
      .input(z.object({
        timeRange: z.enum(["hour", "day", "week"]).default("hour"),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado");
        }
        
        const ranges: Record<string, number> = {
          hour: TIME_RANGES.HOUR,
          day: TIME_RANGES.DAY,
          week: TIME_RANGES.WEEK,
        };
        
        const timeRange = ranges[input?.timeRange || "hour"];
        return getErrorMetrics(timeRange);
      }),
   }),

  // Notifications Persistence Router
  userNotifications: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        type: z.enum(["info", "success", "warning", "error", "case_pending", "case_approved", "case_rejected", "certificate_issued", "token_earned", "system"]).optional(),
        unreadOnly: z.boolean().optional(),
        startDate: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return notificationPersistenceService.getByUserId(ctx.user.id, input || {});
      }),

    getUnreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        return notificationPersistenceService.getUnreadCount(ctx.user.id);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return notificationPersistenceService.markAsRead(input.notificationId, ctx.user.id);
      }),

    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        return notificationPersistenceService.markAllAsRead(ctx.user.id);
      }),

    sendTestNotification: protectedProcedure
      .input(z.object({
        type: z.enum(["info", "success", "warning", "error", "case_pending", "case_approved", "case_rejected", "certificate_issued", "token_earned", "system"]).default("info"),
        title: z.string().optional(),
        message: z.string().optional(),
      }).optional())
      .mutation(async ({ ctx, input }) => {
        const type = input?.type || "info";
        const title = input?.title || "Notificação de Teste";
        const message = input?.message || `Esta é uma notificação de teste do tipo ${type}. Enviada em ${new Date().toLocaleString('pt-BR')}.`;
        
        const notification = await notificationPersistenceService.create({
          userId: ctx.user.id,
          type,
          title,
          message,
        });
        
        // Broadcast via SSE
        const { sseNotificationService } = await import('./services/sse/sse-notification-service');
        sseNotificationService.broadcastToUser(ctx.user.id.toString(), {
          type,
          title,
          message,
        });
        
        return { success: true, notification };
      }),

    delete: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return notificationPersistenceService.delete(input.notificationId, ctx.user.id);
      }),

    cleanup: protectedProcedure
      .input(z.object({ daysOld: z.number().min(1).max(365).default(30) }).optional())
      .mutation(async ({ ctx, input }) => {
        return notificationPersistenceService.cleanupOldNotifications(ctx.user.id, input?.daysOld || 30);
      }),

    getPreferences: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return null;
        const [prefs] = await db
          .select()
          .from(notificationPreferences)
          .where(eq(notificationPreferences.userId, ctx.user.id))
          .limit(1);
        return prefs || null;
      }),

    updatePreferences: protectedProcedure
      .input(z.object({
        infoEnabled: z.boolean().optional(),
        successEnabled: z.boolean().optional(),
        warningEnabled: z.boolean().optional(),
        errorEnabled: z.boolean().optional(),
        casePendingEnabled: z.boolean().optional(),
        caseApprovedEnabled: z.boolean().optional(),
        caseRejectedEnabled: z.boolean().optional(),
        certificateIssuedEnabled: z.boolean().optional(),
        tokenEarnedEnabled: z.boolean().optional(),
        systemEnabled: z.boolean().optional(),
        emailEnabled: z.boolean().optional(),
        emailDigestFrequency: z.enum(["instant", "daily", "weekly", "never"]).optional(),
        pushEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        const [existing] = await db
          .select()
          .from(notificationPreferences)
          .where(eq(notificationPreferences.userId, ctx.user.id))
          .limit(1);
        // Converter boolean para number
        const convertedInput: any = {};
        for (const [key, value] of Object.entries(input)) {
          if (typeof value === 'boolean') {
            convertedInput[key] = value ? 1 : 0;
          } else {
            convertedInput[key] = value;
          }
        }
        
        if (existing) {
          return db
            .update(notificationPreferences)
            .set({ ...convertedInput, updatedAt: Date.now() })
            .where(eq(notificationPreferences.userId, ctx.user.id));
        } else {
          return db.insert(notificationPreferences).values({
            userId: ctx.user.id,
            ...convertedInput,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }),
  }),

  // SSE Metrics Router (Admin only)
  sseMetrics: router({
    getMetrics: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { sseNotificationService } = await import('./services/sse/sse-notification-service');
        return sseNotificationService.getMetrics();
      }),

    getClients: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { sseNotificationService } = await import('./services/sse/sse-notification-service');
        return {
          clients: sseNotificationService.getClientsInfo(),
          byRole: sseNotificationService.getClientsByRole(),
        };
      }),

    getHistory: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { sseNotificationService } = await import('./services/sse/sse-notification-service');
        return sseNotificationService.getNotificationHistory();
      }),
  }),

  // Task Scheduler Router (Admin only)
  scheduler: router({
    getStatus: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { taskSchedulerService } = await import('./services/scheduler/task-scheduler-service');
        return taskSchedulerService.getStatus();
      }),

    getTasks: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { taskSchedulerService } = await import('./services/scheduler/task-scheduler-service');
        return taskSchedulerService.getTasks();
      }),

    getLogs: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { taskSchedulerService } = await import('./services/scheduler/task-scheduler-service');
        return taskSchedulerService.getExecutionLogs(input?.limit || 50);
      }),

    triggerTask: protectedProcedure
      .input(z.object({ taskId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { taskSchedulerService } = await import('./services/scheduler/task-scheduler-service');
        return taskSchedulerService.triggerTask(input.taskId);
      }),

    setTaskEnabled: protectedProcedure
      .input(z.object({ taskId: z.string(), enabled: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { taskSchedulerService } = await import('./services/scheduler/task-scheduler-service');
        return taskSchedulerService.setTaskEnabled(input.taskId, input.enabled);
      }),

    start: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { taskSchedulerService } = await import('./services/scheduler/task-scheduler-service');
        taskSchedulerService.start();
        return { success: true };
      }),

    stop: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { taskSchedulerService } = await import('./services/scheduler/task-scheduler-service');
        taskSchedulerService.stop();
        return { success: true };
      }),
  }),

  // Notification Templates Router (Admin only)
  notificationTemplates: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { notificationTemplateService } = await import('./services/notifications/notification-template-service');
        return notificationTemplateService.getAll();
      }),

    getByCode: protectedProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ ctx, input }) => {
        const { notificationTemplateService } = await import('./services/notifications/notification-template-service');
        return notificationTemplateService.getByCode(input.code);
      }),

    create: protectedProcedure
      .input(z.object({
        code: z.string().min(3).max(100),
        name: z.string().min(3).max(255),
        description: z.string().optional(),
        type: z.enum(['info', 'success', 'warning', 'error', 'case_pending', 'case_approved', 'case_rejected', 'certificate_issued', 'token_earned', 'system']),
        titleTemplate: z.string().min(1).max(255),
        messageTemplate: z.string().min(1),
        availableVariables: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { notificationTemplateService } = await import('./services/notifications/notification-template-service');
        const result = await notificationTemplateService.create(input, ctx.user.id);
        
        // Log de auditoria
        const { auditService } = await import('./services/audit/audit-service');
        await auditService.log({
          userId: ctx.user.id,
          userName: ctx.user.name || undefined,
          userEmail: ctx.user.email || undefined,
          action: 'create',
          resourceType: 'notification_template',
          resourceId: String(result.id),
          resourceName: input.name,
          newValue: { code: input.code, type: input.type },
        });
        
        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(3).max(255).optional(),
        description: z.string().optional(),
        type: z.enum(['info', 'success', 'warning', 'error', 'case_pending', 'case_approved', 'case_rejected', 'certificate_issued', 'token_earned', 'system']).optional(),
        titleTemplate: z.string().min(1).max(255).optional(),
        messageTemplate: z.string().min(1).optional(),
        availableVariables: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { notificationTemplateService } = await import('./services/notifications/notification-template-service');
        const { id, ...updateData } = input;
        const result = await notificationTemplateService.update(id, updateData);
        
        // Log de auditoria
        const { auditService } = await import('./services/audit/audit-service');
        await auditService.log({
          userId: ctx.user.id,
          userName: ctx.user.name || undefined,
          userEmail: ctx.user.email || undefined,
          action: 'update',
          resourceType: 'notification_template',
          resourceId: String(id),
          newValue: updateData,
        });
        
        return result;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { notificationTemplateService } = await import('./services/notifications/notification-template-service');
        return notificationTemplateService.delete(input.id);
      }),

    preview: protectedProcedure
      .input(z.object({
        code: z.string(),
        variables: z.record(z.string(), z.string()),
      }))
      .query(async ({ input }) => {
        const { notificationTemplateService } = await import('./services/notifications/notification-template-service');
        return notificationTemplateService.renderNotification(input.code, input.variables);
      }),

    getVariables: protectedProcedure
      .input(z.object({ type: z.string() }))
      .query(async ({ ctx, input }) => {
        const { notificationTemplateService } = await import('./services/notifications/notification-template-service');
        return notificationTemplateService.getVariablesForType(input.type);
      }),

    seedDefaults: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { notificationTemplateService } = await import('./services/notifications/notification-template-service');
        await notificationTemplateService.seedDefaultTemplates();
        return { success: true };
      }),
  }),

  // System Settings Router (Admin only)
  systemSettings: router({
    list: protectedProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const db = await getDb();
        if (!db) return [];
        
        const settings = await db.select().from(systemSettings);
        if (input?.category) {
          return settings.filter(s => s.category === input.category);
        }
        return settings;
      }),

    get: protectedProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const db = await getDb();
        if (!db) return null;
        
        const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, input.key));
        return setting || null;
      }),

    set: protectedProcedure
      .input(z.object({
        key: z.string(),
        value: z.string().nullable(),
        description: z.string().optional(),
        category: z.enum(['general', 'notifications', 'security', 'integrations']).optional(),
        valueType: z.enum(['string', 'number', 'boolean', 'json']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        // Upsert: update if exists, insert if not
        const [existing] = await db.select().from(systemSettings).where(eq(systemSettings.key, input.key));
        
        if (existing) {
          await db.update(systemSettings)
            .set({
              value: input.value,
              description: input.description,
              category: input.category,
              valueType: input.valueType,
            })
            .where(eq(systemSettings.key, input.key));
        } else {
          await db.insert(systemSettings).values({
            key: input.key,
            value: input.value,
            description: input.description,
            category: input.category || 'general',
            valueType: input.valueType || 'string',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
        
        // Log de auditoria
        const { auditService } = await import('./services/audit/audit-service');
        await auditService.log({
          userId: ctx.user.id,
          userName: ctx.user.name || undefined,
          userEmail: ctx.user.email || undefined,
          action: 'config_change',
          resourceType: 'system_setting',
          resourceId: input.key,
          resourceName: input.key,
          previousValue: existing ? { value: existing.value } : undefined,
          newValue: { value: input.value },
        });
        
        return { success: true };
      }),

    setBulk: protectedProcedure
      .input(z.object({
        settings: z.array(z.object({
          key: z.string(),
          value: z.string().nullable(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        for (const setting of input.settings) {
          const [existing] = await db.select().from(systemSettings).where(eq(systemSettings.key, setting.key));
          
          if (existing) {
            await db.update(systemSettings)
              .set({ value: setting.value })
              .where(eq(systemSettings.key, setting.key));
          } else {
            await db.insert(systemSettings).values({
              key: setting.key,
              value: setting.value,
              createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          }
        }
        
        return { success: true, count: input.settings.length };
      }),

    delete: protectedProcedure
      .input(z.object({ key: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.delete(systemSettings).where(eq(systemSettings.key, input.key));
        return { success: true };
      }),
  }),

  // Audit Router (Admin only)
  audit: router({
    getLogs: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
        action: z.string().optional(),
        resourceType: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { auditService } = await import('./services/audit/audit-service');
        return auditService.getLogs({
          ...input,
          action: input?.action as any,
          startDate: input?.startDate ? new Date(input.startDate) : undefined,
          endDate: input?.endDate ? new Date(input.endDate) : undefined,
        });
      }),

    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { auditService } = await import('./services/audit/audit-service');
        return auditService.getStats();
      }),

    getResourceTypes: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { auditService } = await import('./services/audit/audit-service');
        return auditService.getResourceTypes();
      }),

    exportCsv: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        action: z.string().optional(),
        resourceType: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { auditService } = await import('./services/audit/audit-service');
        return auditService.exportCsv({
          ...input,
          action: input?.action as any,
          startDate: input?.startDate ? new Date(input.startDate) : undefined,
          endDate: input?.endDate ? new Date(input.endDate) : undefined,
        });
      }),
  }),

  // Email Digest Router (Admin only)
  emailDigest: router({
    getStatus: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { emailDigestService } = await import('./services/notifications/email-digest-service');
        return emailDigestService.getStatus();
      }),

    preview: protectedProcedure
      .input(z.object({ frequency: z.enum(['daily', 'weekly']) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { emailDigestService } = await import('./services/notifications/email-digest-service');
        const digests = await emailDigestService.generateDigests(input.frequency);
        return {
          count: digests.length,
          digests: digests.map(d => ({
            userId: d.userId,
            userEmail: d.userEmail,
            userName: d.userName,
            notificationCount: d.notifications.length,
          })),
        };
      }),

    sendNow: protectedProcedure
      .input(z.object({ frequency: z.enum(['daily', 'weekly']) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { emailDigestService } = await import('./services/notifications/email-digest-service');
        return emailDigestService.sendDigestEmails(input.frequency);
      }),
  }),

  // Reports Router (PDF generation)
  reports: router({
    generatePDF: protectedProcedure
      .input(z.object({
        period: z.string(),
        metrics: z.object({
          totalLeads: z.number(),
          totalDownloads: z.number(),
          totalCases: z.number(),
          approvedCases: z.number(),
          pendingCases: z.number(),
          totalCertificates: z.number(),
          conversionRate: z.number(),
          caseApprovalRate: z.number(),
        }),
        leadSources: z.record(z.string(), z.number()),
        caseSectors: z.record(z.string(), z.number()),
        activityData: z.object({
          days: z.array(z.string()),
          leads: z.array(z.number()),
          downloads: z.array(z.number()),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { pdfReportService } = await import('./services/reports/pdf-report-service');
        const pdfBuffer = pdfReportService.generateConsolidatedReport({
          ...input,
          generatedAt: new Date(),
        });
        
        // Log de auditoria
        const { auditService } = await import('./services/audit/audit-service');
        await auditService.log({
          userId: ctx.user.id,
          userName: ctx.user.name || undefined,
          userEmail: ctx.user.email || undefined,
          action: 'export',
          resourceType: 'report_pdf',
          metadata: { period: input.period },
        });
        
        return { 
          pdf: pdfBuffer.toString('base64'),
          filename: `relatorio-impact7-${input.period}-${new Date().toISOString().split('T')[0]}.pdf`,
        };
      }),
  }),

  // Auto Alerts Router (Admin only)
  autoAlerts: router({
    // Get current alert status
    getStatus: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { autoAlertService } = await import('./services/alerts/auto-alert-service');
        const pendingCases = await autoAlertService.checkPendingCases();
        const criticalMetrics = await autoAlertService.checkCriticalMetrics();
        return {
          pendingCases,
          criticalMetrics,
          config: autoAlertService.config,
        };
      }),

    // Run all checks manually
    runChecks: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { autoAlertService } = await import('./services/alerts/auto-alert-service');
        return autoAlertService.runAllChecks();
      }),

    // Update config
    updateConfig: protectedProcedure
      .input(z.object({
        pendingCasesThresholdHours: z.number().optional(),
        leadsWithoutFollowupDays: z.number().optional(),
        maxPendingCases: z.number().optional(),
        minDailyLeads: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { autoAlertService } = await import('./services/alerts/auto-alert-service');
        autoAlertService.setConfig({
          pendingCasesThresholdHours: input.pendingCasesThresholdHours,
          leadsWithoutFollowupDays: input.leadsWithoutFollowupDays,
          criticalMetricsThresholds: {
            maxPendingCases: input.maxPendingCases ?? autoAlertService.config.criticalMetricsThresholds.maxPendingCases,
            minDailyLeads: input.minDailyLeads ?? autoAlertService.config.criticalMetricsThresholds.minDailyLeads,
          },
        });
        return { success: true, config: autoAlertService.config };
      }),
  }),

  // Billing Router (Stripe integration)
  billing: router({
    // Get available plans
    getPlans: publicProcedure
      .query(() => {
        return getAllPlans();
      }),

    // Get user's current subscription
    getSubscription: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return null;
        
        const { users } = await import('../drizzle/schema');
        const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id));
        
        if (!user) return null;
        
        return {
          planType: user.planType,
          subscriptionStatus: user.subscriptionStatus,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
        };
      }),

    // Create checkout session
    createCheckout: protectedProcedure
      .input(z.object({
        planId: z.enum(['pro', 'enterprise']),
        billingPeriod: z.enum(['monthly', 'yearly']),
      }))
      .mutation(async ({ ctx, input }) => {
        const origin = ctx.req.headers.origin || 'http://localhost:3000';
        
        const checkoutUrl = await createCheckoutSession({
          userId: ctx.user.id,
          userEmail: ctx.user.email || '',
          userName: ctx.user.name || '',
          planId: input.planId,
          billingPeriod: input.billingPeriod,
          origin,
        });
        
        return { checkoutUrl };
      }),

    // Create customer portal session
    createPortal: protectedProcedure
      .mutation(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const { users } = await import('../drizzle/schema');
        const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id));
        
        if (!user?.stripeCustomerId) {
          throw new Error('No Stripe customer found');
        }
        
        const origin = ctx.req.headers.origin || 'http://localhost:3000';
        const portalUrl = await createPortalSession(user.stripeCustomerId, `${origin}/dashboard`);
        
        return { portalUrl };
      }),
  }),

  // Referrals Router
  referrals: router({
    // Get user's referral code
    getCode: protectedProcedure
      .query(async ({ ctx }) => {
        const { referralService } = await import('./services/referrals/referral-service');
        let code = await referralService.getReferralCode(ctx.user.id);
        if (!code) {
          code = await referralService.generateReferralCode(ctx.user.id);
        }
        return { code };
      }),

    // Get referral stats
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        const { referralService } = await import('./services/referrals/referral-service');
        return referralService.getStats(ctx.user.id);
      }),

    // Get referral history
    getHistory: protectedProcedure
      .query(async ({ ctx }) => {
        const { referralService } = await import('./services/referrals/referral-service');
        return referralService.getHistory(ctx.user.id);
      }),

    // Invite someone
    invite: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        const { referralService } = await import('./services/referrals/referral-service');
        let code = await referralService.getReferralCode(ctx.user.id);
        if (!code) {
          code = await referralService.generateReferralCode(ctx.user.id);
        }
        const success = await referralService.trackInvitation(code, input.email);
        return { success };
      }),

    // Validate referral code
    validateCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const { referralService } = await import('./services/referrals/referral-service');
        const valid = await referralService.validateCode(input.code);
        return { valid };
      }),
  }),

  // Support Tickets Router
  tickets: router({
    // Create ticket
    create: publicProcedure
      .input(z.object({
        userEmail: z.string().email(),
        userName: z.string().optional(),
        subject: z.string().min(5),
        description: z.string().min(20),
        category: z.enum(['billing', 'technical', 'account', 'feature_request', 'bug_report', 'general']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { ticketService } = await import('./services/support/ticket-service');
        return ticketService.createTicket({
          ...input,
          userId: ctx.user?.id,
          userName: input.userName || ctx.user?.name || undefined,
        });
      }),

    // Get user's tickets
    myTickets: protectedProcedure
      .query(async ({ ctx }) => {
        const { ticketService } = await import('./services/support/ticket-service');
        return ticketService.getUserTickets(ctx.user.id);
      }),

    // Get ticket details
    getTicket: protectedProcedure
      .input(z.object({ ticketNumber: z.string() }))
      .query(async ({ ctx, input }) => {
        const { ticketService } = await import('./services/support/ticket-service');
        const ticket = await ticketService.getTicketByNumber(input.ticketNumber);
        if (!ticket) return null;
        // Check access
        if (ticket.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          return null;
        }
        const messages = await ticketService.getMessages(ticket.id);
        return { ticket, messages };
      }),

    // Add message to ticket
    addMessage: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        message: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { ticketService } = await import('./services/support/ticket-service');
        return ticketService.addMessage({
          ticketId: input.ticketId,
          senderId: ctx.user.id,
          senderName: ctx.user.name || 'Usuário',
          senderEmail: ctx.user.email || undefined,
          message: input.message,
          isStaff: ctx.user.role === 'admin',
        });
      }),

    // Admin: Get all tickets
    getAll: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        category: z.string().optional(),
        priority: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { ticketService } = await import('./services/support/ticket-service');
        return ticketService.getAllTickets(input);
      }),

    // Admin: Update ticket status
    updateStatus: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        status: z.enum(['open', 'in_progress', 'waiting_customer', 'resolved', 'closed']),
        resolution: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { ticketService } = await import('./services/support/ticket-service');
        return ticketService.updateStatus(input.ticketId, input.status, input.resolution);
      }),

    // Admin: Assign ticket
    assign: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        assignedToId: z.number(),
        assignedToName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { ticketService } = await import('./services/support/ticket-service');
        return ticketService.assignTicket(input.ticketId, input.assignedToId, input.assignedToName);
      }),

    // Admin: Get stats
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { ticketService } = await import('./services/support/ticket-service');
        return ticketService.getStats();
      }),
  }),

  // Feature Flags Router
  featureFlags: router({
    // Check if feature is enabled
    isEnabled: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ ctx, input }) => {
        const { featureFlagService } = await import('./services/experiments/feature-flag-service');
        const enabled = await featureFlagService.isEnabled(
          input.key,
          ctx.user?.id,
          ctx.user?.role,
          ctx.user?.planType ?? undefined
        );
        return { enabled };
      }),

    // Get A/B test variant
    getVariant: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ ctx, input }) => {
        const { featureFlagService } = await import('./services/experiments/feature-flag-service');
        const variant = await featureFlagService.getVariant(input.key, ctx.user?.id);
        return { variant };
      }),

    // Admin: Get all flags
    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { featureFlagService } = await import('./services/experiments/feature-flag-service');
        return featureFlagService.getAllFlags();
      }),

    // Admin: Create/update flag
    upsert: protectedProcedure
      .input(z.object({
        key: z.string(),
        name: z.string(),
        description: z.string().optional(),
        isEnabled: z.boolean().optional(),
        rolloutPercentage: z.number().min(0).max(100).optional(),
        targetUserIds: z.array(z.number()).optional(),
        targetRoles: z.array(z.string()).optional(),
        targetPlans: z.array(z.string()).optional(),
        isExperiment: z.boolean().optional(),
        variants: z.array(z.object({ name: z.string(), weight: z.number() })).optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { featureFlagService } = await import('./services/experiments/feature-flag-service');
        return featureFlagService.upsertFlag(input);
      }),

    // Admin: Delete flag
    delete: protectedProcedure
      .input(z.object({ key: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { featureFlagService } = await import('./services/experiments/feature-flag-service');
        return featureFlagService.deleteFlag(input.key);
      }),
  }),

  // Two-Factor Authentication Router
  twoFactor: router({
    // Get 2FA status
    getStatus: protectedProcedure
      .query(async ({ ctx }) => {
        return twoFactorAuthService.getStatus(ctx.user.id);
      }),

    // Setup 2FA (generate secret and QR code)
    setup: protectedProcedure
      .mutation(async ({ ctx }) => {
        return twoFactorAuthService.generateSecret(ctx.user.id);
      }),

    // Verify and enable 2FA
    enable: protectedProcedure
      .input(z.object({ code: z.string().length(6) }))
      .mutation(async ({ ctx, input }) => {
        return twoFactorAuthService.verifyAndEnable(ctx.user.id, input.code);
      }),

    // Verify 2FA code (for login)
    verify: protectedProcedure
      .input(z.object({ code: z.string().min(6).max(8) }))
      .mutation(async ({ ctx, input }) => {
        return twoFactorAuthService.verifyCode(ctx.user.id, input.code);
      }),

    // Disable 2FA
    disable: protectedProcedure
      .input(z.object({ code: z.string().min(6).max(8) }))
      .mutation(async ({ ctx, input }) => {
        return twoFactorAuthService.disable2FA(ctx.user.id, input.code);
      }),

    // Regenerate backup codes
    regenerateBackupCodes: protectedProcedure
      .input(z.object({ code: z.string().min(6).max(8) }))
      .mutation(async ({ ctx, input }) => {
        return twoFactorAuthService.regenerateBackupCodes(ctx.user.id, input.code);
      }),
  }),

  // User Access Tokens Router
  accessTokens: router({
    // List user's access tokens
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select({
          id: userAccessTokens.id,
          name: userAccessTokens.name,
          tokenPrefix: userAccessTokens.tokenPrefix,
          scopes: userAccessTokens.scopes,
          expiresAt: userAccessTokens.expiresAt,
          lastUsedAt: userAccessTokens.lastUsedAt,
          usageCount: userAccessTokens.usageCount,
          isActive: userAccessTokens.isActive,
          createdAt: userAccessTokens.createdAt,
        })
        .from(userAccessTokens)
        .where(eq(userAccessTokens.userId, ctx.user.id))
        .orderBy(desc(userAccessTokens.createdAt));
      }),

    // Create new access token
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        permissions: z.array(z.string()).optional(),
        expiresInDays: z.number().min(1).max(365).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const { randomBytes, createHash } = await import('crypto');
        const tokenValue = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(tokenValue).digest('hex');
        const tokenPrefix = tokenValue.substring(0, 8);
        
        const expiresAt = input.expiresInDays 
          ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
          : null;
        
        await db.insert(userAccessTokens).values({
          userId: ctx.user.id,
          name: input.name,
          tokenHash,
          tokenPrefix,
          scopes: JSON.stringify(input.permissions || ['read']),
          expiresAt,
        
          createdAt: Date.now(),
        });
        
        // Return the full token only once
        return {
          token: `imp7_${tokenValue}`,
          prefix: tokenPrefix,
          expiresAt,
        };
      }),

    // Revoke access token
    revoke: protectedProcedure
      .input(z.object({ tokenId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.update(userAccessTokens)
          .set({ isActive: 0 })
          .where(and(
            eq(userAccessTokens.id, input.tokenId),
            eq(userAccessTokens.userId, ctx.user.id)
          ));
        
        return { success: true };
      }),

    // Get token usage logs
    getUsageLogs: protectedProcedure
      .input(z.object({ 
        tokenId: z.number(),
        limit: z.number().min(1).max(100).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        
        // Verify token belongs to user
        const [token] = await db.select()
          .from(userAccessTokens)
          .where(and(
            eq(userAccessTokens.id, input.tokenId),
            eq(userAccessTokens.userId, ctx.user.id)
          ))
          .limit(1);
        
        if (!token) return [];
        
        return db.select()
          .from(tokenUsageLogs)
          .where(eq(tokenUsageLogs.tokenId, input.tokenId))
          .orderBy(desc(tokenUsageLogs.createdAt))
          .limit(input.limit || 50);
      }),
  }),

  // Conversion Tracking Router
  conversions: router({
    // Track event
    track: publicProcedure
      .input(z.object({
        eventType: z.string(),
        eventValue: z.string().optional(),
        source: z.string().optional(),
        medium: z.string().optional(),
        campaign: z.string().optional(),
        referrer: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { conversionService } = await import('./services/analytics/conversion-service');
        return conversionService.trackEvent({
          ...input,
          eventType: input.eventType as any,
          userId: ctx.user?.id,
        });
      }),

    // Admin: Get funnel metrics
    getFunnel: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { conversionService } = await import('./services/analytics/conversion-service');
        return conversionService.getFunnelMetrics(input?.startDate, input?.endDate);
      }),

    // Admin: Get attribution
    getAttribution: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { conversionService } = await import('./services/analytics/conversion-service');
        return conversionService.getAttributionMetrics(input?.startDate, input?.endDate);
      }),

    // Admin: Get daily trends
    getTrends: protectedProcedure
      .input(z.object({ days: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { conversionService } = await import('./services/analytics/conversion-service');
        return conversionService.getDailyTrends(input?.days);
      }),

    // Admin: Get user journey
    getUserJourney: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const { conversionService } = await import('./services/analytics/conversion-service');
        return conversionService.getUserJourney(input.userId);
      }),
  }),

  // Social Proof Router - Métricas e certificações dinâmicas
  socialProof: router({
    // Get impact metrics
    getMetrics: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        const result = await executeRawQuery(`
          SELECT metricKey, value, labelKey, descriptionKey, displayOrder 
          FROM socialProofMetrics 
          WHERE isActive = TRUE 
          ORDER BY displayOrder ASC
        `);
        return (result as any)[0] || [];
      }),

    // Get certifications
    getCertifications: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        const result = await executeRawQuery(`
          SELECT id, name, descriptionKey, displayOrder 
          FROM socialProofCertifications 
          WHERE isActive = TRUE 
          ORDER BY displayOrder ASC
        `);
        return (result as any)[0] || [];
      }),

    // Get partners from existing partners table
    getPartners: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        const result = await executeRawQuery(`
          SELECT id, name, logoUrl, website, displayOrder 
          FROM partners 
          WHERE isActive = TRUE 
          ORDER BY displayOrder ASC
          LIMIT 12
        `);
        return (result as any)[0] || [];
      }),

    // Get featured cases from caseStudies table
    getFeaturedCases: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        const result = await executeRawQuery(`
          SELECT id, title, organization, sector, sroi, beneficiaries, description, isFeatured 
          FROM caseStudies 
          WHERE isFeatured = TRUE AND isActive = TRUE 
          ORDER BY sroi DESC
          LIMIT 3
        `);
        return (result as any)[0] || [];
      }),

    // Get testimonials
    getTestimonials: publicProcedure
      .input(z.object({
        sector: z.string().optional(),
        limit: z.number().default(10),
        featured: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        let query = `
          SELECT id, name, role, company, sector, content, rating, imageUrl, videoUrl, metrics, isFeatured
          FROM testimonials 
          WHERE isActive = TRUE
        `;
        if (input?.sector) {
          query += ` AND sector = '${input.sector}'`;
        }
        if (input?.featured) {
          query += ` AND isFeatured = TRUE`;
        }
        query += ` ORDER BY displayOrder ASC, createdAt DESC LIMIT ${input?.limit || 10}`;
        const result = await executeRawQuery(query);
        return (result as any)[0] || [];
      }),

    // Get testimonial sectors
    getTestimonialSectors: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        const result = await executeRawQuery(`
          SELECT DISTINCT sector FROM testimonials WHERE isActive = TRUE ORDER BY sector
        `);
        return ((result as any)[0] || []).map((r: any) => r.sector);
      }),

    // Admin: Update metric
    updateMetric: protectedProcedure
      .input(z.object({
        metricKey: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        await executeRawQuery(`
          UPDATE socialProofMetrics 
          SET value = '${input.value}', updatedAt = NOW() 
          WHERE metricKey = '${input.metricKey}'
        `);
        return { success: true };
      }),
  }),

  // GDPR Compliance
  gdpr: router({
    exportData: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { exportUserData } = await import('./security/audit/compliance');
        const data = await exportUserData(String(ctx.user.id), {});
        
        // Log de auditoria
        const { auditService } = await import('./services/audit/audit-service');
        await auditService.log({
          userId: ctx.user.id,
          userName: ctx.user.name || undefined,
          userEmail: ctx.user.email || undefined,
          action: 'export',
          resourceType: 'user_data',
          resourceId: String(ctx.user.id),
        });
        
        return { data, exportedAt: new Date().toISOString() };
      }),

    requestDeletion: protectedProcedure
      .input(z.object({ confirmation: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (input.confirmation !== 'DELETE') {
          throw new Error('Confirmação inválida');
        }
        
        const { anonymizeUserData } = await import('./security/audit/compliance');
        await anonymizeUserData(String(ctx.user.id));
        
        // Log de auditoria
        const { auditService } = await import('./services/audit/audit-service');
        await auditService.log({
          userId: ctx.user.id,
          userName: ctx.user.name || undefined,
          userEmail: ctx.user.email || undefined,
          action: 'delete',
          resourceType: 'user_account',
          resourceId: String(ctx.user.id),
        });
        
        return { success: true, message: 'Conta excluída com sucesso' };
      }),
  }),

  // RBAC (Role-Based Access Control)
  rbac: router({
    // Seed inicial de roles e permissions
    seedRBAC: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acesso restrito a administradores');
        }
        
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const { roles, permissions, rolePermissions } = await import('../drizzle/schema');
        const now = Date.now();
        
        // 1. Criar roles
        const rolesData = [
          { code: 'admin', name: 'Administrator', description: 'Full system access', level: 100, isActive: 1, createdAt: now, updatedAt: now },
          { code: 'manager', name: 'Manager', description: 'Manage content and users', level: 50, isActive: 1, createdAt: now, updatedAt: now },
          { code: 'user', name: 'User', description: 'Standard user access', level: 10, isActive: 1, createdAt: now, updatedAt: now },
          { code: 'guest', name: 'Guest', description: 'Limited read-only access', level: 1, isActive: 1, createdAt: now, updatedAt: now },
        ];
        
        for (const roleData of rolesData) {
          await db.insert(roles).values(roleData).onDuplicateKeyUpdate({ set: { updatedAt: now } });
        }
        
        // 2. Criar permissions
        const permsData = [
          { code: 'content.read', name: 'Read Content', description: 'View content', category: 'content', isActive: 1, createdAt: now, updatedAt: now },
          { code: 'content.create', name: 'Create Content', description: 'Create new content', category: 'content', isActive: 1, createdAt: now, updatedAt: now },
          { code: 'content.update', name: 'Update Content', description: 'Edit existing content', category: 'content', isActive: 1, createdAt: now, updatedAt: now },
          { code: 'content.delete', name: 'Delete Content', description: 'Delete content', category: 'content', isActive: 1, createdAt: now, updatedAt: now },
          { code: 'users.read', name: 'Read Users', description: 'View user list', category: 'users', isActive: 1, createdAt: now, updatedAt: now },
          { code: 'users.create', name: 'Create Users', description: 'Create new users', category: 'users', isActive: 1, createdAt: now, updatedAt: now },
          { code: 'users.update', name: 'Update Users', description: 'Edit user details', category: 'users', isActive: 1, createdAt: now, updatedAt: now },
          { code: 'users.delete', name: 'Delete Users', description: 'Delete users', category: 'users', isActive: 1, createdAt: now, updatedAt: now },
          { code: 'system.settings', name: 'System Settings', description: 'Manage system settings', category: 'system', isActive: 1, createdAt: now, updatedAt: now },
          { code: 'system.backup', name: 'System Backup', description: 'Create backups', category: 'system', isActive: 1, createdAt: now, updatedAt: now },
          { code: 'system.logs', name: 'System Logs', description: 'View system logs', category: 'system', isActive: 1, createdAt: now, updatedAt: now },
          { code: 'analytics.view', name: 'View Analytics', description: 'View analytics dashboard', category: 'analytics', isActive: 1, createdAt: now, updatedAt: now },
          { code: 'analytics.export', name: 'Export Analytics', description: 'Export analytics data', category: 'analytics', isActive: 1, createdAt: now, updatedAt: now },
        ];
        
        for (const permData of permsData) {
          await db.insert(permissions).values(permData).onDuplicateKeyUpdate({ set: { updatedAt: now } });
        }
        
        // 3. Buscar IDs criados
        const allRoles = await db.select().from(roles);
        const allPerms = await db.select().from(permissions);
        
        // 4. Associar permissions aos roles
        const adminRole = allRoles.find(r => r.code === 'admin');
        const managerRole = allRoles.find(r => r.code === 'manager');
        const userRole = allRoles.find(r => r.code === 'user');
        const guestRole = allRoles.find(r => r.code === 'guest');
        
        // Admin: todas as permissões
        if (adminRole) {
          for (const perm of allPerms) {
            await db.insert(rolePermissions).values({
              roleId: adminRole.id,
              permissionId: perm.id,
              assignedAt: now,
            
          createdAt: Date.now(),
        }).onDuplicateKeyUpdate({ set: { assignedAt: now } });
          }
        }
        
        // Manager: content + analytics
        if (managerRole) {
          const managerPerms = allPerms.filter(p => p.category === 'content' || p.category === 'analytics');
          for (const perm of managerPerms) {
            await db.insert(rolePermissions).values({
              roleId: managerRole.id,
              permissionId: perm.id,
              assignedAt: now,
            
          createdAt: Date.now(),
        }).onDuplicateKeyUpdate({ set: { assignedAt: now } });
          }
        }
        
        // User: read content + view analytics
        if (userRole) {
          const userPerms = allPerms.filter(p => p.code === 'content.read' || p.code === 'analytics.view');
          for (const perm of userPerms) {
            await db.insert(rolePermissions).values({
              roleId: userRole.id,
              permissionId: perm.id,
              assignedAt: now,
            
          createdAt: Date.now(),
        }).onDuplicateKeyUpdate({ set: { assignedAt: now } });
          }
        }
        
        // Guest: apenas read content
        if (guestRole) {
          const guestPerms = allPerms.filter(p => p.code === 'content.read');
          for (const perm of guestPerms) {
            await db.insert(rolePermissions).values({
              roleId: guestRole.id,
              permissionId: perm.id,
              assignedAt: now,
            
          createdAt: Date.now(),
        }).onDuplicateKeyUpdate({ set: { assignedAt: now } });
          }
        }
        
        return {
          success: true,
          rolesCreated: allRoles.length,
          permissionsCreated: allPerms.length,
        };
      }),

    // Listar todos os usuários (admin only)
    listUsers: protectedProcedure
      .use(async ({ ctx, next }) => {
        const { requirePermission } = await import('./rbac');
        return requirePermission('users.read')({ ctx, next });
      })
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        
        const { users } = await import('../drizzle/schema');
        const allUsers = await db.select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
        }).from(users);
        
        return allUsers;
      }),

    // Obter permissões e roles de um usuário
    getUserRBAC: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const { getUserPermissions, getUserRoles } = await import('./rbac');
        const [permissions, roles] = await Promise.all([
          getUserPermissions(input.userId),
          getUserRoles(input.userId),
        ]);
        return { permissions, roles };
      }),

    // Atribuir role a um usuário
    assignRole: protectedProcedure
      .use(async ({ ctx, next }) => {
        const { requirePermission } = await import('./rbac');
        return requirePermission('users.update')({ ctx, next });
      })
      .input(z.object({
        userId: z.number(),
        roleCode: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { assignRole } = await import('./rbac');
        const success = await assignRole(input.userId, input.roleCode);
        if (!success) {
          throw new Error('Falha ao atribuir role');
        }
        return { success: true };
      }),

    // Remover role de um usuário
    removeRole: protectedProcedure
      .use(async ({ ctx, next }) => {
        const { requirePermission } = await import('./rbac');
        return requirePermission('users.update')({ ctx, next });
      })
      .input(z.object({
        userId: z.number(),
        roleCode: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { removeRole } = await import('./rbac');
        const success = await removeRole(input.userId, input.roleCode);
        if (!success) {
          throw new Error('Falha ao remover role');
        }
        return { success: true };
      }),

    // Listar todos os roles disponíveis
    listRoles: protectedProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        
        const allRoles = await db.select().from(roles);
        return allRoles;
      }),

    // Listar todas as permissions disponíveis
    listPermissions: protectedProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        
        const allPerms = await db.select().from(permissions);
        return allPerms;
      }),
  }),
});
export type AppRouter = typeof appRouter;
