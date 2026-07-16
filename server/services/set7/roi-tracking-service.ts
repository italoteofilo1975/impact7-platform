/**
 * SET7 ROI Tracking Service
 * Rastreamento de ROI por fase (Baseline, Partial, Real, Final)
 * 
 * Conforme SET7 V3.0 - Parte 0 (SET7.START) e Apêndice E (Templates Operacionais)
 */

import { getDb } from "../../db";
import { set7RoiTracking } from "../../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID, createHash } from "crypto";
import { logAuditEvent } from "./tasklog-service";
import { getTasklogMetrics, getMetricsByPhase } from "./tasklog-service";

// Tipos
export type RoiType = "baseline" | "partial" | "real" | "final";

export interface CreateRoiInput {
  roiType: RoiType;
  phase?: string;
  plannedCostUsd: number;
  plannedTokens: number;
  plannedHours: number;
  plannedValueUsd: number;
  assumptions?: Record<string, unknown>;
}

export interface UpdateRoiInput {
  actualCostUsd?: number;
  actualTokens?: number;
  actualHours?: number;
  actualValueUsd?: number;
  deviations?: Record<string, unknown>;
  deviationAnalysis?: string;
}

/**
 * Calcular ROI
 */
function calculateRoi(plannedValueUsd: number, actualCostUsd: number): {
  roiPercentage: number;
  roiRatio: string;
} {
  if (actualCostUsd === 0) {
    return { roiPercentage: 0, roiRatio: "N/A" };
  }
  
  const roiPercentage = Math.round(((plannedValueUsd - actualCostUsd) / actualCostUsd) * 100);
  const ratio = plannedValueUsd / actualCostUsd;
  const roiRatio = `${ratio.toFixed(1)}:1`;
  
  return { roiPercentage, roiRatio };
}

/**
 * Gerar hash do documento ROI
 */
function generateDocumentHash(data: Record<string, unknown>): string {
  return createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

/**
 * Criar registro de ROI Baseline
 */
export async function createRoiBaseline(input: CreateRoiInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const trackingId = `roi_${randomUUID().replace(/-/g, "").substring(0, 16)}`;
  
  const documentData = {
    type: "baseline",
    phase: input.phase,
    planned: {
      costUsd: input.plannedCostUsd,
      tokens: input.plannedTokens,
      hours: input.plannedHours,
      valueUsd: input.plannedValueUsd,
    },
    assumptions: input.assumptions,
    createdAt: new Date().toISOString(),
  };
  
  const documentHash = generateDocumentHash(documentData);
  
  const [roi] = await db.insert(set7RoiTracking).values({
    trackingId,
    roiType: "baseline",
    phase: input.phase,
    plannedCostUsd: input.plannedCostUsd,
    plannedTokens: input.plannedTokens,
    plannedHours: input.plannedHours,
    plannedValueUsd: input.plannedValueUsd,
    actualCostUsd: 0,
    actualTokens: 0,
    actualHours: 0,
    actualValueUsd: 0,
    roiPercentage: 0,
    roiRatio: "N/A",
    assumptions: input.assumptions ? JSON.stringify(input.assumptions) : null,
    documentHash,
    calculatedAt: Date.now(),
    updatedAt: Date.now(),
    createdAt: Date.now(),
  }).returning({ id: set7RoiTracking.id });

  await logAuditEvent({
    eventType: "roi_calculated",
    phase: input.phase,
    description: `ROI Baseline criado${input.phase ? ` para ${input.phase}` : ""}`,
    details: { trackingId, plannedValueUsd: input.plannedValueUsd, plannedCostUsd: input.plannedCostUsd },
    severity: "info",
  });

  return { trackingId, id: roi.id, documentHash };
}

/**
 * Atualizar ROI com valores reais (Partial ou Real)
 */
export async function updateRoiWithActuals(trackingId: string, input: UpdateRoiInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [existing] = await db.select()
    .from(set7RoiTracking)
    .where(eq(set7RoiTracking.trackingId, trackingId));
  
  if (!existing) throw new Error("ROI tracking not found");
  
  const actualCostUsd = input.actualCostUsd ?? existing.actualCostUsd;
  const actualValueUsd = input.actualValueUsd ?? existing.actualValueUsd;
  
  const { roiPercentage, roiRatio } = calculateRoi(
    actualValueUsd || existing.plannedValueUsd,
    actualCostUsd
  );
  
  // Calcular desvios
  const deviations = {
    costDeviation: existing.plannedCostUsd > 0 
      ? Math.round(((actualCostUsd - existing.plannedCostUsd) / existing.plannedCostUsd) * 100)
      : 0,
    tokensDeviation: existing.plannedTokens > 0
      ? Math.round((((input.actualTokens ?? existing.actualTokens) - existing.plannedTokens) / existing.plannedTokens) * 100)
      : 0,
    hoursDeviation: existing.plannedHours > 0
      ? Math.round((((input.actualHours ?? existing.actualHours) - existing.plannedHours) / existing.plannedHours) * 100)
      : 0,
    valueDeviation: existing.plannedValueUsd > 0
      ? Math.round(((actualValueUsd - existing.plannedValueUsd) / existing.plannedValueUsd) * 100)
      : 0,
    ...input.deviations,
  };
  
  await db.update(set7RoiTracking)
    .set({
      actualCostUsd,
      actualTokens: input.actualTokens ?? existing.actualTokens,
      actualHours: input.actualHours ?? existing.actualHours,
      actualValueUsd,
      roiPercentage,
      roiRatio,
      deviations: JSON.stringify(deviations),
      deviationAnalysis: input.deviationAnalysis,
      calculatedAt: Date.now(),
    })
    .where(eq(set7RoiTracking.trackingId, trackingId));

  await logAuditEvent({
    eventType: "roi_calculated",
    phase: existing.phase || undefined,
    description: `ROI atualizado: ${roiRatio} (${roiPercentage}%)`,
    details: { trackingId, roiPercentage, roiRatio, deviations },
    severity: "info",
  });

  return { success: true, roiPercentage, roiRatio, deviations };
}

/**
 * Criar ROI Partial (durante execução)
 */
export async function createPartialRoi(baselineTrackingId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Buscar baseline
  const [baseline] = await db.select()
    .from(set7RoiTracking)
    .where(eq(set7RoiTracking.trackingId, baselineTrackingId));
  
  if (!baseline) throw new Error("Baseline ROI not found");
  
  // Obter métricas atuais do TASKLOG
  const metrics = await getTasklogMetrics({ phase: baseline.phase || undefined });
  
  const trackingId = `roi_${randomUUID().replace(/-/g, "").substring(0, 16)}`;
  
  const actualCostUsd = metrics.totalCostUsd;
  const { roiPercentage, roiRatio } = calculateRoi(baseline.plannedValueUsd, actualCostUsd);
  
  const [roi] = await db.insert(set7RoiTracking).values({
    trackingId,
    roiType: "partial",
    phase: baseline.phase,
    plannedCostUsd: baseline.plannedCostUsd,
    plannedTokens: baseline.plannedTokens,
    plannedHours: baseline.plannedHours,
    plannedValueUsd: baseline.plannedValueUsd,
    actualCostUsd,
    actualTokens: metrics.totalTokens,
    actualHours: 0, // Seria calculado de outra fonte
    actualValueUsd: 0, // Valor ainda não realizado
    roiPercentage,
    roiRatio,
    assumptions: baseline.assumptions,
    documentHash: generateDocumentHash({ type: "partial", baselineId: baselineTrackingId, metrics }),
    calculatedAt: Date.now(),
    updatedAt: Date.now(),
    createdAt: Date.now(),
  }).returning({ id: set7RoiTracking.id });

  return { trackingId, id: roi.id, roiPercentage, roiRatio, metrics };
}

/**
 * Criar ROI Final (após conclusão)
 */
export async function createFinalRoi(baselineTrackingId: string, actualValueUsd: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Buscar baseline
  const [baseline] = await db.select()
    .from(set7RoiTracking)
    .where(eq(set7RoiTracking.trackingId, baselineTrackingId));
  
  if (!baseline) throw new Error("Baseline ROI not found");
  
  // Obter métricas finais do TASKLOG
  const metrics = await getTasklogMetrics({ phase: baseline.phase || undefined });
  
  const trackingId = `roi_${randomUUID().replace(/-/g, "").substring(0, 16)}`;
  
  const actualCostUsd = metrics.totalCostUsd;
  const { roiPercentage, roiRatio } = calculateRoi(actualValueUsd, actualCostUsd);
  
  // Calcular desvios finais
  const deviations = {
    costDeviation: baseline.plannedCostUsd > 0 
      ? Math.round(((actualCostUsd - baseline.plannedCostUsd) / baseline.plannedCostUsd) * 100)
      : 0,
    tokensDeviation: baseline.plannedTokens > 0
      ? Math.round(((metrics.totalTokens - baseline.plannedTokens) / baseline.plannedTokens) * 100)
      : 0,
    valueDeviation: baseline.plannedValueUsd > 0
      ? Math.round(((actualValueUsd - baseline.plannedValueUsd) / baseline.plannedValueUsd) * 100)
      : 0,
  };
  
  const documentData = {
    type: "final",
    baselineId: baselineTrackingId,
    planned: {
      costUsd: baseline.plannedCostUsd,
      tokens: baseline.plannedTokens,
      valueUsd: baseline.plannedValueUsd,
    },
    actual: {
      costUsd: actualCostUsd,
      tokens: metrics.totalTokens,
      valueUsd: actualValueUsd,
    },
    roi: { percentage: roiPercentage, ratio: roiRatio },
    deviations,
    completedAt: new Date().toISOString(),
  };
  
  const [roi] = await db.insert(set7RoiTracking).values({
    trackingId,
    roiType: "final",
    phase: baseline.phase,
    plannedCostUsd: baseline.plannedCostUsd,
    plannedTokens: baseline.plannedTokens,
    plannedHours: baseline.plannedHours,
    plannedValueUsd: baseline.plannedValueUsd,
    actualCostUsd,
    actualTokens: metrics.totalTokens,
    actualHours: 0,
    actualValueUsd,
    roiPercentage,
    roiRatio,
    assumptions: baseline.assumptions,
    deviations: JSON.stringify(deviations),
    documentHash: generateDocumentHash(documentData),
    calculatedAt: Date.now(),
    updatedAt: Date.now(),
    createdAt: Date.now(),
  }).returning({ id: set7RoiTracking.id });

  await logAuditEvent({
    eventType: "roi_calculated",
    phase: baseline.phase || undefined,
    description: `ROI Final calculado: ${roiRatio} (${roiPercentage}%)`,
    details: { trackingId, roiPercentage, roiRatio, deviations, actualValueUsd },
    severity: "info",
  });

  return { 
    trackingId, 
    id: roi.id, 
    roiPercentage, 
    roiRatio, 
    deviations,
    summary: documentData,
  };
}

/**
 * Buscar ROI por ID
 */
export async function getRoi(trackingId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [roi] = await db.select()
    .from(set7RoiTracking)
    .where(eq(set7RoiTracking.trackingId, trackingId));
  
  if (roi) {
    return {
      ...roi,
      assumptions: roi.assumptions ? JSON.parse(roi.assumptions) : null,
      deviations: roi.deviations ? JSON.parse(roi.deviations) : null,
    };
  }
  
  return null;
}

/**
 * Listar ROIs
 */
export async function listRois(filters?: {
  roiType?: RoiType;
  phase?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const rois = await db.select()
    .from(set7RoiTracking)
    .orderBy(desc(set7RoiTracking.createdAt))
    .limit(filters?.limit || 100)
    .offset(filters?.offset || 0);

  return rois.map((roi) => ({
    ...roi,
    assumptions: roi.assumptions ? JSON.parse(roi.assumptions) : null,
    deviations: roi.deviations ? JSON.parse(roi.deviations) : null,
  }));
}

/**
 * Obter ROI consolidado por fase
 */
export async function getRoiByPhase() {
  const phaseMetrics = await getMetricsByPhase();
  
  return phaseMetrics.map(pm => ({
    phase: pm.phase,
    totalTasks: pm.totalTasks,
    completedTasks: pm.completedTasks,
    totalTokens: pm.totalTokens,
    totalCostUsd: pm.totalCostUsd,
    avgExecutionTimeMs: pm.avgExecutionTimeMs,
    // ROI seria calculado com base em valores de negócio definidos
  }));
}

/**
 * Obter estatísticas globais de ROI
 */
export async function getRoiStats() {
  const db = await getDb();
  if (!db) return {
    totalRois: 0,
    avgRoiPercentage: 0,
    totalPlannedCost: 0,
    totalActualCost: 0,
    totalPlannedValue: 0,
    totalActualValue: 0,
    costEfficiency: 0,
  };
  
  const rois = await db.select().from(set7RoiTracking);
  
  const finalRois = rois.filter(r => r.roiType === "final");
  
  const stats = {
    totalRois: rois.length,
    avgRoiPercentage: 0,
    totalPlannedCost: rois.reduce((sum, r) => sum + r.plannedCostUsd, 0),
    totalActualCost: rois.reduce((sum, r) => sum + r.actualCostUsd, 0),
    totalPlannedValue: rois.reduce((sum, r) => sum + r.plannedValueUsd, 0),
    totalActualValue: finalRois.reduce((sum, r) => sum + r.actualValueUsd, 0),
    costEfficiency: 0,
  };
  
  if (finalRois.length > 0) {
    stats.avgRoiPercentage = Math.round(
      finalRois.reduce((sum, r) => sum + r.roiPercentage, 0) / finalRois.length
    );
  }
  
  if (stats.totalPlannedCost > 0) {
    stats.costEfficiency = Math.round((stats.totalActualCost / stats.totalPlannedCost) * 100);
  }
  
  return stats;
}

/**
 * Exportar ROI para relatório
 */
export async function exportRoiReport(trackingId: string): Promise<string> {
  const roi = await getRoi(trackingId);
  if (!roi) throw new Error("ROI not found");
  
  const report = `
# Relatório de ROI SET7

## Informações Gerais
- **ID:** ${roi.trackingId}
- **Tipo:** ${roi.roiType.toUpperCase()}
- **Fase:** ${roi.phase || "Global"}
- **Data:** ${roi.calculatedAt ? new Date(roi.calculatedAt).toISOString() : new Date(roi.createdAt).toISOString()}

## Valores Planejados
| Métrica | Valor |
|---------|-------|
| Custo (USD) | $${(roi.plannedCostUsd / 100).toFixed(2)} |
| Tokens | ${roi.plannedTokens.toLocaleString()} |
| Horas | ${roi.plannedHours} |
| Valor Esperado (USD) | $${(roi.plannedValueUsd / 100).toFixed(2)} |

## Valores Realizados
| Métrica | Valor |
|---------|-------|
| Custo (USD) | $${(roi.actualCostUsd / 100).toFixed(2)} |
| Tokens | ${roi.actualTokens.toLocaleString()} |
| Horas | ${roi.actualHours} |
| Valor Realizado (USD) | $${(roi.actualValueUsd / 100).toFixed(2)} |

## ROI
- **Percentual:** ${roi.roiPercentage}%
- **Ratio:** ${roi.roiRatio}

## Desvios
${roi.deviations ? Object.entries(roi.deviations).map(([k, v]) => `- ${k}: ${v}%`).join("\n") : "Nenhum desvio registrado"}

## Hash do Documento
\`${roi.documentHash}\`

---
*Gerado automaticamente pelo SET7 ROI Tracking Service*
`;

  return report;
}
