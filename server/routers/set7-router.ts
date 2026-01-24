/**
 * SET7 Router
 * Endpoints para funcionalidades SET7 V3.0
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Importar serviços SET7
import {
  // TASKLOG
  createTask,
  startTask,
  completeTask,
  failTask,
  getTask,
  listTasks,
  getTasklogMetrics,
  getMetricsByPhase,
  exportTasklogToCsv,
  logAuditEvent,
  listAuditEvents,
  // Integration Identity
  createIntegration,
  verifyIntegration,
  getIntegration,
  listIntegrations,
  recordIntegrationCall,
  revokeIntegration,
  getIntegrationStats,
  // TokensOps
  createBudget,
  recordTokenUsage,
  canConsumeTokens,
  getBudget,
  listBudgets,
  resetCircuitBreaker,
  pauseBudget,
  resumeBudget,
  increaseBudget,
  getTokensStats,
  recommendModel,
  calculateCost,
  MODEL_COSTS,
  // Agents
  createAgent,
  getAgent,
  listAgents,
  updateAgent,
  triggerKillSwitch,
  resetKillSwitch,
  pauseAgent,
  resumeAgent,
  getAgentsStats,
  initializeDefaultAgents,
  VERTICAL_AGENTS,
  HORIZONTAL_AGENTS,
  // Gates
  createGate,
  getGate,
  listGates,
  submitEvidence,
  evaluateGate,
  canAdvancePhase,
  getGateProgress,
  initializeProjectGates,
  getGatesStats,
  GATE_CHECKLISTS,
  // ROI
  createRoiBaseline,
  updateRoiWithActuals,
  createPartialRoi,
  createFinalRoi,
  getRoi,
  listRois,
  getRoiByPhase,
  getRoiStats,
  exportRoiReport,
  // Runtime Config
  createRuntimeConfig,
  getActiveConfig,
  getConfig,
  updateConfig,
  activateConfig,
  isHookEnabled,
  getRecommendedModel,
  requiresHumanApproval,
  generateRuntimeYaml,
  initializeDefaultConfig,
  MODE_DEFAULTS,
  GATE_PROFILES,
} from "../services/set7";

// Admin procedure (apenas admins)
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// Event types for audit log
const eventTypes = z.enum([
  "task_created", "task_completed", "task_failed",
  "gate_passed", "gate_failed", "gate_mitigated",
  "agent_started", "agent_stopped", "agent_killed",
  "budget_warning", "budget_exceeded", "circuit_breaker_triggered",
  "integration_created", "integration_verified", "integration_failed",
  "roi_calculated", "config_changed"
]);

export const set7Router = router({
  // ==================== TASKLOG ====================
  tasklog: router({
    create: adminProcedure
      .input(z.object({
        taskType: z.enum(["planning", "execution", "validation", "documentation", "review"]),
        phase: z.string(),
        taskName: z.string(),
        description: z.string().optional(),
        agentId: z.string(),
        agentType: z.enum(["vertical", "horizontal", "orchestrator", "human"]),
        agentName: z.string(),
        taxonomyBase: z.enum(["STR", "PRD", "EXP", "ARC", "DAT", "INT", "SEC", "GOV", "OPS", "RES", "ECO", "AIO", "EXE", "COM"]).optional(),
        taxonomySubbase: z.string().optional(),
        taxonomyTags: z.array(z.string()).optional(),
        gateId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createTask(input);
      }),

    start: adminProcedure
      .input(z.object({ taskId: z.string() }))
      .mutation(async ({ input }) => {
        return startTask(input.taskId);
      }),

    complete: adminProcedure
      .input(z.object({
        taskId: z.string(),
        tokensInput: z.number().optional(),
        tokensOutput: z.number().optional(),
        modelUsed: z.string().optional(),
        executionTimeMs: z.number().optional(),
        costUsd: z.number().optional(),
        result: z.record(z.string(), z.unknown()).optional(),
        outputArtifacts: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { taskId, ...updateData } = input;
        return completeTask(taskId, updateData as any);
      }),

    fail: adminProcedure
      .input(z.object({
        taskId: z.string(),
        errorMessage: z.string(),
      }))
      .mutation(async ({ input }) => {
        return failTask(input.taskId, input.errorMessage);
      }),

    get: adminProcedure
      .input(z.object({ taskId: z.string() }))
      .query(async ({ input }) => {
        return getTask(input.taskId);
      }),

    list: adminProcedure
      .input(z.object({
        phase: z.string().optional(),
        agentId: z.string().optional(),
        status: z.enum(["pending", "running", "completed", "failed", "cancelled"]).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return listTasks(input as any);
      }),

    metrics: adminProcedure
      .input(z.object({
        phase: z.string().optional(),
        agentId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getTasklogMetrics(input);
      }),

    metricsByPhase: adminProcedure.query(async () => {
      return getMetricsByPhase();
    }),

    exportCsv: adminProcedure
      .input(z.object({
        phase: z.string().optional(),
        agentId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        return exportTasklogToCsv(input);
      }),
  }),

  // ==================== AUDIT LOG ====================
  audit: router({
    log: adminProcedure
      .input(z.object({
        eventType: eventTypes,
        description: z.string(),
        phase: z.string().optional(),
        agentId: z.string().optional(),
        taskId: z.string().optional(),
        gateId: z.string().optional(),
        integrationId: z.string().optional(),
        details: z.record(z.string(), z.unknown()).optional(),
        severity: z.enum(["info", "warning", "error", "critical"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return logAuditEvent({
          ...input,
          userId: ctx.user?.id,
          userName: ctx.user?.name || undefined,
        } as any);
      }),

    list: adminProcedure
      .input(z.object({
        eventType: z.string().optional(),
        phase: z.string().optional(),
        severity: z.enum(["info", "warning", "error", "critical"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return listAuditEvents(input as any);
      }),
  }),

  // ==================== INTEGRATION IDENTITY ====================
  integrations: router({
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        integrationType: z.enum(["api", "webhook", "database", "file", "service", "external"]),
        contractVersion: z.string(),
        contractSchema: z.record(z.string(), z.unknown()).optional(),
        endpointUrl: z.string().optional(),
        httpMethod: z.string().optional(),
        config: z.record(z.string(), z.unknown()).optional(),
        headers: z.record(z.string(), z.string()).optional(),
        authentication: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input }) => {
        return createIntegration(input as any);
      }),

    verify: publicProcedure
      .input(z.object({ integrationId: z.string() }))
      .query(async ({ input }) => {
        return verifyIntegration(input.integrationId);
      }),

    get: adminProcedure
      .input(z.object({ integrationId: z.string() }))
      .query(async ({ input }) => {
        return getIntegration(input.integrationId);
      }),

    list: adminProcedure
      .input(z.object({
        integrationType: z.enum(["api", "webhook", "database", "file", "service", "external"]).optional(),
        status: z.enum(["active", "deprecated", "disabled"]).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return listIntegrations(input as any);
      }),

    recordCall: adminProcedure
      .input(z.object({
        integrationId: z.string(),
        success: z.boolean(),
        responseTimeMs: z.number(),
      }))
      .mutation(async ({ input }) => {
        await recordIntegrationCall(input.integrationId, input.success, input.responseTimeMs);
        return { success: true };
      }),

    revoke: adminProcedure
      .input(z.object({
        integrationId: z.string(),
        reason: z.string(),
      }))
      .mutation(async ({ input }) => {
        return revokeIntegration(input.integrationId, input.reason);
      }),

    stats: adminProcedure.query(async () => {
      return getIntegrationStats();
    }),
  }),

  // ==================== TOKENS OPS ====================
  tokens: router({
    createBudget: adminProcedure
      .input(z.object({
        scope: z.enum(["project", "phase", "flow", "agent", "user"]),
        scopeId: z.string(),
        scopeName: z.string(),
        budgetTokens: z.number(),
        budgetUsd: z.number(),
        warningThreshold: z.number().optional(),
        criticalThreshold: z.number().optional(),
        periodType: z.enum(["daily", "weekly", "monthly", "project", "unlimited"]),
        periodStart: z.date().optional(),
        periodEnd: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        return createBudget(input);
      }),

    recordUsage: adminProcedure
      .input(z.object({
        budgetId: z.string(),
        tokensInput: z.number(),
        tokensOutput: z.number(),
        modelUsed: z.string(),
      }))
      .mutation(async ({ input }) => {
        return recordTokenUsage(input);
      }),

    canConsume: adminProcedure
      .input(z.object({
        budgetId: z.string(),
        estimatedTokens: z.number(),
      }))
      .query(async ({ input }) => {
        return canConsumeTokens(input.budgetId, input.estimatedTokens);
      }),

    getBudget: adminProcedure
      .input(z.object({ budgetId: z.string() }))
      .query(async ({ input }) => {
        return getBudget(input.budgetId);
      }),

    listBudgets: adminProcedure
      .input(z.object({
        scope: z.enum(["project", "phase", "flow", "agent", "user"]).optional(),
        status: z.enum(["active", "warning", "critical", "exceeded", "paused"]).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return listBudgets(input as any);
      }),

    resetCircuitBreaker: adminProcedure
      .input(z.object({ budgetId: z.string(), reason: z.string() }))
      .mutation(async ({ input }) => {
        return resetCircuitBreaker(input.budgetId, input.reason);
      }),

    pause: adminProcedure
      .input(z.object({ budgetId: z.string() }))
      .mutation(async ({ input }) => {
        return pauseBudget(input.budgetId);
      }),

    resume: adminProcedure
      .input(z.object({ budgetId: z.string() }))
      .mutation(async ({ input }) => {
        return resumeBudget(input.budgetId);
      }),

    increase: adminProcedure
      .input(z.object({
        budgetId: z.string(),
        additionalTokens: z.number(),
        additionalUsd: z.number(),
      }))
      .mutation(async ({ input }) => {
        return increaseBudget(input.budgetId, input.additionalTokens, input.additionalUsd);
      }),

    stats: adminProcedure.query(async () => {
      return getTokensStats();
    }),

    list: adminProcedure
      .input(z.object({
        scope: z.enum(["project", "phase", "flow", "agent", "user"]).optional(),
        status: z.enum(["active", "warning", "critical", "exceeded", "paused"]).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return listBudgets(input as any);
      }),

    recommendModel: adminProcedure
      .input(z.object({
        budgetId: z.string(),
        estimatedTokens: z.number(),
        taskComplexity: z.enum(["low", "medium", "high"]),
      }))
      .query(async ({ input }) => {
        return recommendModel(input.budgetId, input.estimatedTokens, input.taskComplexity);
      }),

    calculateCost: adminProcedure
      .input(z.object({
        tokensInput: z.number(),
        tokensOutput: z.number(),
        modelUsed: z.string(),
      }))
      .query(async ({ input }) => {
        return calculateCost(input.tokensInput, input.tokensOutput, input.modelUsed);
      }),

    modelCosts: publicProcedure.query(() => MODEL_COSTS),
  }),

  // ==================== AGENTS ====================
  agents: router({
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        agentType: z.enum(["vertical", "horizontal", "orchestrator"]),
        phase: z.string().optional(),
        hookType: z.enum(["roi", "tokens", "quality", "security", "gtl"]).optional(),
        defaultModel: z.string().optional(),
        allowedModels: z.array(z.string()).optional(),
        maxTokensPerRequest: z.number().optional(),
        maxTokensPerDay: z.number().optional(),
        permissions: z.array(z.string()).optional(),
        canReadFiles: z.boolean().optional(),
        canWriteFiles: z.boolean().optional(),
        canExecuteCode: z.boolean().optional(),
        canAccessNetwork: z.boolean().optional(),
        canAccessDatabase: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return createAgent(input);
      }),

    get: adminProcedure
      .input(z.object({ agentId: z.string() }))
      .query(async ({ input }) => {
        return getAgent(input.agentId);
      }),

    list: adminProcedure
      .input(z.object({
        agentType: z.enum(["vertical", "horizontal", "orchestrator"]).optional(),
        status: z.enum(["active", "paused", "disabled", "killed"]).optional(),
        phase: z.string().optional(),
        hookType: z.enum(["roi", "tokens", "quality", "security", "gtl"]).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return listAgents(input as any);
      }),

    update: adminProcedure
      .input(z.object({
        agentId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        defaultModel: z.string().optional(),
        allowedModels: z.array(z.string()).optional(),
        maxTokensPerRequest: z.number().optional(),
        maxTokensPerDay: z.number().optional(),
        permissions: z.array(z.string()).optional(),
        canReadFiles: z.boolean().optional(),
        canWriteFiles: z.boolean().optional(),
        canExecuteCode: z.boolean().optional(),
        canAccessNetwork: z.boolean().optional(),
        canAccessDatabase: z.boolean().optional(),
        status: z.enum(["active", "paused", "disabled", "killed"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { agentId, ...updateData } = input;
        return updateAgent(agentId, updateData);
      }),

    killSwitch: adminProcedure
      .input(z.object({
        agentId: z.string(),
        reason: z.string(),
      }))
      .mutation(async ({ input }) => {
        return triggerKillSwitch(input.agentId, input.reason);
      }),

    resetKillSwitch: adminProcedure
      .input(z.object({
        agentId: z.string(),
        approvedBy: z.string(),
      }))
      .mutation(async ({ input }) => {
        return resetKillSwitch(input.agentId, input.approvedBy);
      }),

    pause: adminProcedure
      .input(z.object({ agentId: z.string() }))
      .mutation(async ({ input }) => {
        return pauseAgent(input.agentId);
      }),

    resume: adminProcedure
      .input(z.object({ agentId: z.string() }))
      .mutation(async ({ input }) => {
        return resumeAgent(input.agentId);
      }),

    stats: adminProcedure.query(async () => {
      return getAgentsStats();
    }),

    initializeDefaults: adminProcedure.mutation(async () => {
      return initializeDefaultAgents();
    }),

    verticalAgents: publicProcedure.query(() => VERTICAL_AGENTS),
    horizontalAgents: publicProcedure.query(() => HORIZONTAL_AGENTS),
  }),

  // ==================== GATES ====================
  gates: router({
    create: adminProcedure
      .input(z.object({
        phase: z.string(),
        gateName: z.string(),
        description: z.string().optional(),
        mode: z.enum(["mvp", "standard", "enterprise", "regulated"]),
        humanApprovalRequired: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return createGate(input);
      }),

    get: adminProcedure
      .input(z.object({ gateId: z.string() }))
      .query(async ({ input }) => {
        return getGate(input.gateId);
      }),

    list: adminProcedure
      .input(z.object({
        phase: z.string().optional(),
        mode: z.enum(["mvp", "standard", "enterprise", "regulated"]).optional(),
        status: z.enum(["pending", "in_progress", "pass", "fail", "mitigation"]).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return listGates(input as any);
      }),

    submitEvidence: adminProcedure
      .input(z.object({
        gateId: z.string(),
        item: z.string(),
        description: z.string(),
        artifacts: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return submitEvidence(input.gateId, input.item, {
          description: input.description,
          artifacts: input.artifacts,
          submittedBy: ctx.user?.name || "Unknown",
        });
      }),

    evaluate: adminProcedure
      .input(z.object({
        gateId: z.string(),
        passed: z.boolean(),
        comments: z.string().optional(),
        mitigationPlan: z.string().optional(),
        mitigationDeadline: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return evaluateGate(input.gateId, {
          passed: input.passed,
          evaluatedBy: ctx.user?.id || 0,
          evaluatorName: ctx.user?.name || "Unknown",
          comments: input.comments,
          mitigationPlan: input.mitigationPlan,
          mitigationDeadline: input.mitigationDeadline,
        });
      }),

    canAdvance: adminProcedure
      .input(z.object({ phase: z.string() }))
      .query(async ({ input }) => {
        return canAdvancePhase(input.phase);
      }),

    progress: adminProcedure
      .input(z.object({ gateId: z.string() }))
      .query(async ({ input }) => {
        return getGateProgress(input.gateId);
      }),

    initializeProject: adminProcedure
      .input(z.object({
        mode: z.enum(["mvp", "standard", "enterprise", "regulated"]),
      }))
      .mutation(async ({ input }) => {
        return initializeProjectGates(input.mode);
      }),

    stats: adminProcedure.query(async () => {
      return getGatesStats();
    }),

    checklists: publicProcedure.query(() => GATE_CHECKLISTS),
  }),

  // ==================== ROI ====================
  roi: router({
    createBaseline: adminProcedure
      .input(z.object({
        roiType: z.enum(["baseline", "partial", "real", "final"]).default("baseline"),
        phase: z.string().optional(),
        plannedCostUsd: z.number(),
        plannedTokens: z.number(),
        plannedHours: z.number(),
        plannedValueUsd: z.number(),
        assumptions: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input }) => {
        return createRoiBaseline(input as any);
      }),

    updateActuals: adminProcedure
      .input(z.object({
        trackingId: z.string(),
        actualCostUsd: z.number().optional(),
        actualTokens: z.number().optional(),
        actualHours: z.number().optional(),
        actualValueUsd: z.number().optional(),
        deviations: z.record(z.string(), z.unknown()).optional(),
        deviationAnalysis: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { trackingId, ...updateData } = input;
        return updateRoiWithActuals(trackingId, updateData);
      }),

    createPartial: adminProcedure
      .input(z.object({ baselineTrackingId: z.string() }))
      .mutation(async ({ input }) => {
        return createPartialRoi(input.baselineTrackingId);
      }),

    createFinal: adminProcedure
      .input(z.object({
        baselineTrackingId: z.string(),
        actualValueUsd: z.number(),
      }))
      .mutation(async ({ input }) => {
        return createFinalRoi(input.baselineTrackingId, input.actualValueUsd);
      }),

    get: adminProcedure
      .input(z.object({ trackingId: z.string() }))
      .query(async ({ input }) => {
        return getRoi(input.trackingId);
      }),

    list: adminProcedure
      .input(z.object({
        roiType: z.enum(["baseline", "partial", "real", "final"]).optional(),
        phase: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return listRois(input as any);
      }),

    byPhase: adminProcedure.query(async () => {
      return getRoiByPhase();
    }),

    stats: adminProcedure.query(async () => {
      return getRoiStats();
    }),

    summary: adminProcedure.query(async () => {
      const stats = await getRoiStats();
      const rois = await listRois({ limit: 100 });
      const totalPlannedValue = rois.reduce((sum: number, r: any) => sum + (r.plannedValueUsd || 0), 0);
      const totalActualCost = rois.reduce((sum: number, r: any) => sum + (r.actualCostUsd || 0), 0);
      return {
        ...stats,
        totalPlannedValue,
        totalActualCost,
        totalRecords: rois.length,
      };
    }),

    exportReport: adminProcedure
      .input(z.object({ trackingId: z.string() }))
      .query(async ({ input }) => {
        return exportRoiReport(input.trackingId);
      }),
  }),

  // ==================== RUNTIME CONFIG ====================
  config: router({
    create: adminProcedure
      .input(z.object({
        mode: z.enum(["mvp", "standard", "enterprise", "regulated"]),
        gtlType: z.enum(["saas", "on_premise", "hybrid", "api_only"]).optional(),
        gtlPlans: z.record(z.string(), z.unknown()).optional(),
        customHooks: z.object({
          hookRoiEnabled: z.boolean().optional(),
          hookTokensEnabled: z.boolean().optional(),
          hookQualityEnabled: z.boolean().optional(),
          hookSecurityEnabled: z.boolean().optional(),
          hookGtlEnabled: z.boolean().optional(),
          hookFrequency: z.enum(["per_task", "per_phase", "daily", "weekly"]).optional(),
        }).optional(),
        customTokenBudget: z.number().optional(),
        modelRouting: z.string().optional(),
        humanApprovalPhases: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        return createRuntimeConfig(input as any);
      }),

    getActive: adminProcedure.query(async () => {
      return getActiveConfig();
    }),

    get: adminProcedure
      .input(z.object({ configId: z.string() }))
      .query(async ({ input }) => {
        return getConfig(input.configId);
      }),

    update: adminProcedure
      .input(z.object({
        configId: z.string(),
        mode: z.enum(["mvp", "standard", "enterprise", "regulated"]).optional(),
        hookRoiEnabled: z.boolean().optional(),
        hookTokensEnabled: z.boolean().optional(),
        hookQualityEnabled: z.boolean().optional(),
        hookSecurityEnabled: z.boolean().optional(),
        hookGtlEnabled: z.boolean().optional(),
        hookFrequency: z.enum(["per_task", "per_phase", "daily", "weekly"]).optional(),
        gtlType: z.enum(["saas", "on_premise", "hybrid", "api_only"]).optional(),
        gtlPlans: z.record(z.string(), z.unknown()).optional(),
        defaultTokenBudget: z.number().optional(),
        modelRouting: z.string().optional(),
        humanApprovalPhases: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { configId, ...updateData } = input;
        return updateConfig(configId, updateData as any);
      }),

    activate: adminProcedure
      .input(z.object({ configId: z.string() }))
      .mutation(async ({ input }) => {
        return activateConfig(input.configId);
      }),

    isHookEnabled: adminProcedure
      .input(z.object({
        hookType: z.enum(["roi", "tokens", "quality", "security", "gtl"]),
      }))
      .query(async ({ input }) => {
        return isHookEnabled(input.hookType);
      }),

    recommendedModel: adminProcedure
      .input(z.object({
        complexity: z.enum(["low", "medium", "high", "critical"]),
      }))
      .query(async ({ input }) => {
        return getRecommendedModel(input.complexity);
      }),

    requiresApproval: adminProcedure
      .input(z.object({ phase: z.string() }))
      .query(async ({ input }) => {
        return requiresHumanApproval(input.phase);
      }),

    generateYaml: adminProcedure.query(async () => {
      return generateRuntimeYaml();
    }),

    initializeDefault: adminProcedure
      .input(z.object({
        mode: z.enum(["mvp", "standard", "enterprise", "regulated"]).optional(),
      }).optional())
      .mutation(async ({ input }) => {
        return initializeDefaultConfig(input?.mode || "standard");
      }),

    modeDefaults: publicProcedure.query(() => MODE_DEFAULTS),
    gateProfiles: publicProcedure.query(() => GATE_PROFILES),
  }),

  // ==================== DASHBOARD ====================
  dashboard: router({
    overview: adminProcedure.query(async () => {
      const [tasklogMetrics, tokensStats, agentsStats, gatesStats, roiStats] = await Promise.all([
        getTasklogMetrics(),
        getTokensStats(),
        getAgentsStats(),
        getGatesStats(),
        getRoiStats(),
      ]);

      return {
        tasklog: tasklogMetrics,
        tokens: tokensStats,
        agents: agentsStats,
        gates: gatesStats,
        roi: roiStats,
      };
    }),

    initialize: adminProcedure
      .input(z.object({
        mode: z.enum(["mvp", "standard", "enterprise", "regulated"]),
      }))
      .mutation(async ({ input }) => {
        // Inicializar configuração
        const configResult = await initializeDefaultConfig(input.mode);
        
        // Inicializar agentes
        const agentsResult = await initializeDefaultAgents();
        
        // Inicializar gates
        const gatesResult = await initializeProjectGates(input.mode);
        
        return {
          config: configResult,
          agents: agentsResult,
          gates: gatesResult,
        };
      }),
  }),
});

export type Set7Router = typeof set7Router;
