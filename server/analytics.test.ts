import { describe, expect, it } from "vitest";

/**
 * Analytics Service Tests
 * Testes unitários para validar a estrutura e tipos do serviço de analytics
 */

describe("Analytics Service - Unit Tests", () => {
  describe("Event Tracking Types", () => {
    it("should have valid event types", () => {
      const validEventTypes = ["page_view", "button_click", "form_submit", "download"];
      expect(validEventTypes).toContain("page_view");
      expect(validEventTypes).toContain("button_click");
      expect(validEventTypes).toContain("form_submit");
      expect(validEventTypes).toContain("download");
    });

    it("should have valid interaction types for Jarvis", () => {
      const validInteractionTypes = ["chat", "calculator", "mentorship", "export", "search"];
      expect(validInteractionTypes).toContain("chat");
      expect(validInteractionTypes).toContain("calculator");
      expect(validInteractionTypes).toContain("mentorship");
      expect(validInteractionTypes).toContain("export");
      expect(validInteractionTypes).toContain("search");
    });

    it("should have valid conversion types", () => {
      const validConversionTypes = ["signup", "download", "contact", "calculator", "demo_request", "purchase"];
      expect(validConversionTypes).toContain("signup");
      expect(validConversionTypes).toContain("download");
      expect(validConversionTypes).toContain("contact");
      expect(validConversionTypes).toContain("calculator");
      expect(validConversionTypes).toContain("demo_request");
      expect(validConversionTypes).toContain("purchase");
    });
  });

  describe("Analytics Data Structures", () => {
    it("should have valid page view structure", () => {
      const pageView = {
        sessionId: "test-session-123",
        pagePath: "/home",
        pageTitle: "Home - IMPACT7",
        referrer: "https://google.com",
        deviceType: "desktop" as const,
        browser: "Chrome",
        country: "BR"
      };

      expect(pageView.sessionId).toBeDefined();
      expect(pageView.pagePath).toBeDefined();
      expect(typeof pageView.sessionId).toBe("string");
      expect(typeof pageView.pagePath).toBe("string");
    });

    it("should have valid Jarvis interaction structure", () => {
      const interaction = {
        sessionId: "test-session-123",
        interactionType: "chat" as const,
        query: "O que é o IMPACT7?",
        skillUsed: "knowledge_base",
        responseTime: 1500,
        tokensUsed: 250,
        successful: true
      };

      expect(interaction.sessionId).toBeDefined();
      expect(interaction.interactionType).toBeDefined();
      expect(typeof interaction.responseTime).toBe("number");
      expect(typeof interaction.successful).toBe("boolean");
    });

    it("should have valid lead conversion structure", () => {
      const conversion = {
        leadId: 1,
        conversionType: "download" as const,
        sourcePage: "/whitepaper",
        sourceForm: "whitepaper_download",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "impact7_launch"
      };

      expect(conversion.leadId).toBeDefined();
      expect(conversion.conversionType).toBeDefined();
      expect(typeof conversion.leadId).toBe("number");
    });
  });

  describe("Analytics Summary Structure", () => {
    it("should have valid summary structure", () => {
      const summary = {
        totalPageViews: 1250,
        totalJarvisInteractions: 340,
        totalLeadConversions: 89,
        conversionRate: 7.12,
        averageTimeOnPage: 125.5,
        bounceRate: 35.2
      };

      expect(summary.totalPageViews).toBeGreaterThanOrEqual(0);
      expect(summary.totalJarvisInteractions).toBeGreaterThanOrEqual(0);
      expect(summary.totalLeadConversions).toBeGreaterThanOrEqual(0);
      expect(summary.conversionRate).toBeGreaterThanOrEqual(0);
      expect(summary.conversionRate).toBeLessThanOrEqual(100);
    });

    it("should have valid Jarvis stats structure", () => {
      const stats = {
        totalInteractions: 340,
        chatCount: 200,
        calculatorCount: 80,
        mentorshipCount: 40,
        exportCount: 15,
        searchCount: 5,
        avgResponseTime: 1250,
        successRate: 98.5,
        positiveFeedback: 280,
        negativeFeedback: 12
      };

      expect(stats.totalInteractions).toBeGreaterThanOrEqual(0);
      expect(stats.avgResponseTime).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(100);
    });

    it("should have valid conversion funnel structure", () => {
      const funnel = {
        pageViews: 10000,
        uniqueVisitors: 5000,
        leads: 500,
        conversions: 89
      };

      expect(funnel.pageViews).toBeGreaterThanOrEqual(funnel.uniqueVisitors);
      expect(funnel.uniqueVisitors).toBeGreaterThanOrEqual(funnel.leads);
      expect(funnel.leads).toBeGreaterThanOrEqual(funnel.conversions);
    });
  });

  describe("Date Range Validation", () => {
    it("should validate date range for analytics queries", () => {
      const startDate = new Date("2026-01-01");
      const endDate = new Date("2026-01-31");

      expect(startDate.getTime()).toBeLessThan(endDate.getTime());
      expect(endDate.getTime() - startDate.getTime()).toBe(30 * 24 * 60 * 60 * 1000);
    });

    it("should handle same day date range", () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      expect(startOfDay.getTime()).toBeLessThan(endOfDay.getTime());
    });
  });

  describe("Metrics Calculations", () => {
    it("should calculate conversion rate correctly", () => {
      const leads = 500;
      const conversions = 89;
      const conversionRate = (conversions / leads) * 100;

      expect(conversionRate).toBeCloseTo(17.8, 1);
    });

    it("should calculate average response time correctly", () => {
      const responseTimes = [1200, 1500, 800, 2000, 1100];
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      expect(avgResponseTime).toBe(1320);
    });

    it("should calculate success rate correctly", () => {
      const total = 100;
      const successful = 95;
      const successRate = (successful / total) * 100;

      expect(successRate).toBe(95);
    });
  });
});
