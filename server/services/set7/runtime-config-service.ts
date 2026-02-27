/**
 * SET7 Runtime Config Service
 * Configuração do runtime S7L com MODE e HOOKS
 * 
 * Conforme SET7 V3.0 - Parte 0 (SET7.START) - SET7_PLAN_RUNTIME.yaml
 */

import { getDb } from "../../db";
import { set7RuntimeConfig } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logAuditEvent } from "./tasklog-service";

// Tipos
export type RuntimeMode = "mvp" | "standard" | "enterprise" | "regulated";
export type HookFrequency = "per_task" | "per_phase" | "daily" | "weekly";
export type GtlType = "saas" | "on_premise" | "hybrid" | "api_only";

// Configurações padrão por modo
export const MODE_DEFAULTS: Record<RuntimeMode, {
  hookRoi: boolean;
  hookTokens: boolean;
  hookQuality: boolean;
  hookSecurity: boolean;
  hookGtl: boolean;
  hookFrequency: HookFrequency;
  defaultTokenBudget: number;
  humanApprovalPhases: string[];
}> = {
  mvp: {
    hookRoi: true,
    hookTokens: true,
    hookQuality: false,
    hookSecurity: false,
    hookGtl: false,
    hookFrequency: "per_phase",
    defaultTokenBudget: 50000,
    humanApprovalPhases: [],
  },
  standard: {
    hookRoi: true,
    hookTokens: true,
    hookQuality: true,
    hookSecurity: true,
    hookGtl: true,
    hookFrequency: "per_phase",
    defaultTokenBudget: 100000,
    humanApprovalPhases: ["SET7.04", "SET7.07"],
  },
  enterprise: {
    hookRoi: true,
    hookTokens: true,
    hookQuality: true,
    hookSecurity: true,
    hookGtl: true,
    hookFrequency: "per_task",
    defaultTokenBudget: 500000,
    humanApprovalPhases: ["SET7.01", "SET7.04", "SET7.06", "SET7.07"],
  },
  regulated: {
    hookRoi: true,
    hookTokens: true,
    hookQuality: true,
    hookSecurity: true,
    hookGtl: true,
    hookFrequency: "per_task",
    defaultTokenBudget: 1000000,
    humanApprovalPhases: ["SET7.01", "SET7.02", "SET7.03", "SET7.04", "SET7.05", "SET7.06", "SET7.07"],
  },
};

// Perfis de gates por modo
export const GATE_PROFILES: Record<RuntimeMode, {
  strictness: "relaxed" | "standard" | "strict" | "audit";
  requireEvidence: boolean;
  requireApproval: boolean;
  mitigationAllowed: boolean;
}> = {
  mvp: {
    strictness: "relaxed",
    requireEvidence: false,
    requireApproval: false,
    mitigationAllowed: true,
  },
  standard: {
    strictness: "standard",
    requireEvidence: true,
    requireApproval: false,
    mitigationAllowed: true,
  },
  enterprise: {
    strictness: "strict",
    requireEvidence: true,
    requireApproval: true,
    mitigationAllowed: true,
  },
  regulated: {
    strictness: "audit",
    requireEvidence: true,
    requireApproval: true,
    mitigationAllowed: false,
  },
};

// Roteamento de modelos por complexidade
export const MODEL_ROUTING: Record<string, {
  low: string;
  medium: string;
  high: string;
  critical: string;
}> = {
  default: {
    low: "gpt-4o-mini",
    medium: "gpt-4o",
    high: "gpt-4o",
    critical: "gpt-4o",
  },
  cost_optimized: {
    low: "gpt-3.5-turbo",
    medium: "gpt-4o-mini",
    high: "gpt-4o",
    critical: "gpt-4o",
  },
  quality_optimized: {
    low: "gpt-4o-mini",
    medium: "gpt-4o",
    high: "gpt-4o",
    critical: "gpt-4o",
  },
};

export interface CreateRuntimeConfigInput {
  mode: RuntimeMode;
  gtlType?: GtlType;
  gtlPlans?: Record<string, unknown>;
  customHooks?: {
    hookRoiEnabled?: boolean;
    hookTokensEnabled?: boolean;
    hookQualityEnabled?: boolean;
    hookSecurityEnabled?: boolean;
    hookGtlEnabled?: boolean;
    hookFrequency?: HookFrequency;
  };
  customTokenBudget?: number;
  modelRouting?: string;
  humanApprovalPhases?: string[];
}

export interface UpdateRuntimeConfigInput {
  mode?: RuntimeMode;
  hookRoiEnabled?: boolean;
  hookTokensEnabled?: boolean;
  hookQualityEnabled?: boolean;
  hookSecurityEnabled?: boolean;
  hookGtlEnabled?: boolean;
  hookFrequency?: HookFrequency;
  gtlType?: GtlType;
  gtlPlans?: Record<string, unknown>;
  defaultTokenBudget?: number;
  modelRouting?: string;
  humanApprovalPhases?: string[];
  isActive?: boolean;
}

/**
 * Criar configuração de runtime
 */
export async function createRuntimeConfig(input: CreateRuntimeConfigInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const configId = `config_${randomUUID().replace(/-/g, "").substring(0, 16)}`;
  const defaults = MODE_DEFAULTS[input.mode];
  const gateProfile = GATE_PROFILES[input.mode];
  
  const [config] = await db.insert(set7RuntimeConfig).values({
    configId,
    mode: input.mode,
    hooksEnabled: JSON.stringify({
      roi: input.customHooks?.hookRoiEnabled ?? defaults.hookRoi,
      tokens: input.customHooks?.hookTokensEnabled ?? defaults.hookTokens,
      quality: input.customHooks?.hookQualityEnabled ?? defaults.hookQuality,
      security: input.customHooks?.hookSecurityEnabled ?? defaults.hookSecurity,
      gtl: input.customHooks?.hookGtlEnabled ?? defaults.hookGtl,
    }),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hookRoiEnabled: (input.customHooks?.hookRoiEnabled ?? defaults.hookRoi) ? 1 : 0,
    hookTokensEnabled: (input.customHooks?.hookTokensEnabled ?? defaults.hookTokens) ? 1 : 0,
    hookQualityEnabled: (input.customHooks?.hookQualityEnabled ?? defaults.hookQuality) ? 1 : 0,
    hookSecurityEnabled: (input.customHooks?.hookSecurityEnabled ?? defaults.hookSecurity) ? 1 : 0,
    hookGtlEnabled: (input.customHooks?.hookGtlEnabled ?? defaults.hookGtl) ? 1 : 0,
    hookFrequency: input.customHooks?.hookFrequency ?? defaults.hookFrequency,
    gtlType: input.gtlType || "saas",
    gtlPlans: input.gtlPlans ? JSON.stringify(input.gtlPlans) : null,
    defaultTokenBudget: input.customTokenBudget ?? defaults.defaultTokenBudget,
    modelRouting: input.modelRouting || "default",
    gateProfile: JSON.stringify(gateProfile),
    humanApprovalPhases: JSON.stringify(input.humanApprovalPhases ?? defaults.humanApprovalPhases),
    isActive: 1 as number,
  }).$returningId();

  await logAuditEvent({
    eventType: "config_changed",
    description: `Runtime config criado: modo ${input.mode}`,
    details: { configId, mode: input.mode },
    severity: "info",
  });

  return { configId, id: config.id };
}

/**
 * Buscar configuração ativa
 */
export async function getActiveConfig() {
  const db = await getDb();
  if (!db) return null;
  
  const [config] = await db.select()
    .from(set7RuntimeConfig)
    .where(eq(set7RuntimeConfig.isActive, 1));
  
  if (config) {
    return {
      ...config,
      hooksEnabled: config.hooksEnabled ? JSON.parse(config.hooksEnabled) : {},
      gtlPlans: config.gtlPlans ? JSON.parse(config.gtlPlans) : null,
      gateProfile: config.gateProfile ? JSON.parse(config.gateProfile) : null,
      humanApprovalPhases: config.humanApprovalPhases ? JSON.parse(config.humanApprovalPhases) : [],
    };
  }
  
  return null;
}

/**
 * Buscar configuração por ID
 */
export async function getConfig(configId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [config] = await db.select()
    .from(set7RuntimeConfig)
    .where(eq(set7RuntimeConfig.configId, configId));
  
  if (config) {
    return {
      ...config,
      hooksEnabled: config.hooksEnabled ? JSON.parse(config.hooksEnabled) : {},
      gtlPlans: config.gtlPlans ? JSON.parse(config.gtlPlans) : null,
      gateProfile: config.gateProfile ? JSON.parse(config.gateProfile) : null,
      humanApprovalPhases: config.humanApprovalPhases ? JSON.parse(config.humanApprovalPhases) : [],
    };
  }
  
  return null;
}

/**
 * Atualizar configuração
 */
export async function updateConfig(configId: string, input: UpdateRuntimeConfigInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getConfig(configId);
  if (!existing) throw new Error("Config not found");
  
  // Se mudou o modo, atualizar gate profile
  let gateProfile = existing.gateProfile;
  if (input.mode && input.mode !== existing.mode) {
    gateProfile = GATE_PROFILES[input.mode];
  }
  
  await db.update(set7RuntimeConfig)
    .set({
      mode: input.mode,
      hookRoiEnabled: input.hookRoiEnabled !== undefined ? (input.hookRoiEnabled ? 1 : 0) : undefined,
      hookTokensEnabled: input.hookTokensEnabled !== undefined ? (input.hookTokensEnabled ? 1 : 0) : undefined,
      hookQualityEnabled: input.hookQualityEnabled !== undefined ? (input.hookQualityEnabled ? 1 : 0) : undefined,
      hookSecurityEnabled: input.hookSecurityEnabled !== undefined ? (input.hookSecurityEnabled ? 1 : 0) : undefined,
      hookGtlEnabled: input.hookGtlEnabled !== undefined ? (input.hookGtlEnabled ? 1 : 0) : undefined,
      hookFrequency: input.hookFrequency,
      gtlType: input.gtlType,
      gtlPlans: input.gtlPlans ? JSON.stringify(input.gtlPlans) : undefined,
      defaultTokenBudget: input.defaultTokenBudget,
      modelRouting: input.modelRouting,
      gateProfile: gateProfile ? JSON.stringify(gateProfile) : undefined,
      humanApprovalPhases: input.humanApprovalPhases ? JSON.stringify(input.humanApprovalPhases) : undefined,
      isActive: input.isActive !== undefined ? (input.isActive ? 1 : 0) : undefined,
    })
    .where(eq(set7RuntimeConfig.configId, configId));

  await logAuditEvent({
    eventType: "config_changed",
    description: `Runtime config atualizado: ${configId}`,
    details: { configId, changes: input },
    severity: "info",
  });

  return { success: true };
}

/**
 * Ativar configuração (desativa outras)
 */
export async function activateConfig(configId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Desativar todas as configs
  await db.update(set7RuntimeConfig)
    .set({ isActive: 0 });
  
  // Ativar a config especificada
  await db.update(set7RuntimeConfig)
    .set({ isActive: 1 })
    .where(eq(set7RuntimeConfig.configId, configId));

  await logAuditEvent({
    eventType: "config_changed",
    description: `Runtime config ativado: ${configId}`,
    details: { configId },
    severity: "info",
  });

  return { success: true };
}

/**
 * Verificar se hook está habilitado
 */
export async function isHookEnabled(hookType: "roi" | "tokens" | "quality" | "security" | "gtl"): Promise<boolean> {
  const config = await getActiveConfig();
  if (!config) return false;
  
  switch (hookType) {
    case "roi":
      return config.hookRoiEnabled === 1;
    case "tokens":
      return config.hookTokensEnabled === 1;
    case "quality":
      return config.hookQualityEnabled === 1;
    case "security":
      return config.hookSecurityEnabled === 1;
    case "gtl":
      return config.hookGtlEnabled === 1;
    default:
      return false;
  }
}

/**
 * Obter modelo recomendado para complexidade
 */
export async function getRecommendedModel(complexity: "low" | "medium" | "high" | "critical"): Promise<string> {
  const config = await getActiveConfig();
  const routing = config?.modelRouting || "default";
  const models = MODEL_ROUTING[routing] || MODEL_ROUTING.default;
  
  return models[complexity];
}

/**
 * Verificar se fase requer aprovação humana
 */
export async function requiresHumanApproval(phase: string): Promise<boolean> {
  const config = await getActiveConfig();
  if (!config) return false;
  
  return config.humanApprovalPhases.includes(phase);
}

/**
 * Obter perfil de gate atual
 */
export async function getGateProfile() {
  const config = await getActiveConfig();
  if (!config) return GATE_PROFILES.standard;
  
  return config.gateProfile || GATE_PROFILES[config.mode as RuntimeMode];
}

/**
 * Gerar SET7_PLAN_RUNTIME.yaml
 */
export async function generateRuntimeYaml(): Promise<string> {
  const config = await getActiveConfig();
  if (!config) {
    return `# SET7 Runtime Configuration
# Nenhuma configuração ativa encontrada
mode: standard
`;
  }
  
  const yaml = `# SET7_PLAN_RUNTIME.yaml
# Configuração do Runtime SET7 V3.0
# Gerado automaticamente em ${new Date().toISOString()}

# Modo de execução
mode: ${config.mode}

# Hooks habilitados
hooks:
  roi:
    enabled: ${config.hookRoiEnabled}
    frequency: ${config.hookFrequency}
  tokens:
    enabled: ${config.hookTokensEnabled}
    budget: ${config.defaultTokenBudget}
  quality:
    enabled: ${config.hookQualityEnabled}
  security:
    enabled: ${config.hookSecurityEnabled}
  gtl:
    enabled: ${config.hookGtlEnabled}
    type: ${config.gtlType}

# Perfil de Gates
gates:
  strictness: ${config.gateProfile?.strictness || "standard"}
  require_evidence: ${config.gateProfile?.requireEvidence || false}
  require_approval: ${config.gateProfile?.requireApproval || false}
  mitigation_allowed: ${config.gateProfile?.mitigationAllowed || true}

# Fases que requerem aprovação humana
human_approval_phases:
${config.humanApprovalPhases.map((p: string) => `  - ${p}`).join("\n")}

# Roteamento de modelos
model_routing: ${config.modelRouting}

# Configuração ID
config_id: ${config.configId}
`;

  return yaml;
}

/**
 * Inicializar configuração padrão
 */
export async function initializeDefaultConfig(mode: RuntimeMode = "standard") {
  const existing = await getActiveConfig();
  if (existing) {
    return { success: true, message: "Config already exists", configId: existing.configId };
  }
  
  const result = await createRuntimeConfig({ mode });
  return { success: true, message: "Default config created", configId: result.configId };
}
