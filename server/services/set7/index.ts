/**
 * SET7 Services Index
 * Exporta todos os serviços SET7 V3.0
 */

// TASKLOG - Ledger de microatividades
export {
  createTask,
  startTask,
  completeTask,
  failTask,
  cancelTask,
  getTask,
  listTasks,
  getTasklogMetrics,
  getMetricsByPhase,
  getMetricsByAgent,
  exportTasklogToCsv,
  logAuditEvent,
  listAuditEvents,
  type TaskType,
  type AgentType as TasklogAgentType,
  type TaskStatus,
  type GateStatus as TasklogGateStatus,
  type TaxonomyBase,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "./tasklog-service";

// Integration Identity - Hash/QR Code
export {
  createIntegration,
  verifyIntegration,
  getIntegration,
  listIntegrations,
  updateIntegration,
  recordIntegrationCall,
  revokeIntegration,
  getIntegrationStats,
  type IntegrationType,
  type VerificationStatus,
  type IntegrationStatus,
  type CreateIntegrationInput,
  type UpdateIntegrationInput,
} from "./integration-identity-service";

// TokensOps - Disciplina de tokens
export {
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
  type BudgetScope,
  type PeriodType,
  type BudgetStatus,
  type CreateBudgetInput,
  type TokenUsageInput,
} from "./tokens-ops-service";

// Agents - Arquitetura de agentes
export {
  createAgent,
  getAgent,
  listAgents,
  updateAgent,
  triggerKillSwitch,
  resetKillSwitch,
  pauseAgent,
  resumeAgent,
  recordAgentExecution,
  checkAgentPermission,
  getAgentsStats,
  initializeDefaultAgents,
  VERTICAL_AGENTS,
  HORIZONTAL_AGENTS,
  type AgentType,
  type HookType,
  type AgentStatus,
  type CreateAgentInput,
  type UpdateAgentInput,
} from "./agents-service";

// Gates - Condições de avanço
export {
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
  type GateMode,
  type GateStatus,
  type CreateGateInput,
  type UpdateGateInput,
} from "./gates-service";

// ROI Tracking - Rastreamento de ROI
export {
  createRoiBaseline,
  updateRoiWithActuals,
  createPartialRoi,
  createFinalRoi,
  getRoi,
  listRois,
  getRoiByPhase,
  getRoiStats,
  exportRoiReport,
  type RoiType,
  type CreateRoiInput,
  type UpdateRoiInput,
} from "./roi-tracking-service";

// Runtime Config - Configuração S7L
export {
  createRuntimeConfig,
  getActiveConfig,
  getConfig,
  updateConfig,
  activateConfig,
  isHookEnabled,
  getRecommendedModel,
  requiresHumanApproval,
  getGateProfile,
  generateRuntimeYaml,
  initializeDefaultConfig,
  MODE_DEFAULTS,
  GATE_PROFILES,
  MODEL_ROUTING,
  type RuntimeMode,
  type HookFrequency,
  type GtlType,
  type CreateRuntimeConfigInput,
  type UpdateRuntimeConfigInput,
} from "./runtime-config-service";
