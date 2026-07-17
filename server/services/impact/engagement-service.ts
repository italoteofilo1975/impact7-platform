// server/services/impact/engagement-service.ts
// Impact7 · Sprint 7 · a logica que transforma engajamento em rating de impacto,
// resolvendo tres coisas de uma vez: o limiar, a prova de uso e a deduplicacao por identidade.
import { getDb } from "../../db";
import { engagementEvents } from "../../../drizzle/schema.impact7";
import { and, eq } from "drizzle-orm";
import { IMPACTA_ORDER, layerOfNum, countsAsImpactNum, signalToLevelNum } from "../../../shared/ive-mapping";
import { assertInitiativeTenant } from "../tenancy/tenant-context";

// Registra um evento. O relogio (now) e injetado, nunca Date.now() espalhado, conforme o DNA do repo.
// tenantId e obrigatorio e verificado contra o dono real da iniciativa (achado 1.7/1.9 da revisao
// ampla), impedindo gravar engajamento numa iniciativa de outro tenant so adivinhando o ID.
export async function recordEngagement(params: {
  identityKey: string;
  initiativeId: number;
  tenantId: number;
  signal: string;
  instrumented?: boolean;
  now: number; // Unix ms
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const level = signalToLevelNum(params.signal);
  if (level === null) throw new Error(`Sinal de engajamento desconhecido: ${params.signal}`);
  const tenantId = await assertInitiativeTenant(params.initiativeId, params.tenantId);
  await db.insert(engagementEvents).values({
    identityKey: params.identityKey,
    initiativeId: params.initiativeId,
    tenantId,
    signal: params.signal,
    level,
    instrumented: params.instrumented === false ? 0 : 1,
    createdAt: params.now,
  });
  return { level, countsAsImpact: countsAsImpactNum(level) };
}

// Rating de um usuario numa iniciativa: o maior nivel alcancado (metodo do maximo).
export async function userRating(identityKey: string, initiativeId: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertInitiativeTenant(initiativeId, tenantId);
  const rows = await db.select().from(engagementEvents)
    .where(and(eq(engagementEvents.identityKey, identityKey), eq(engagementEvents.initiativeId, initiativeId)));
  const maxLevel = rows.reduce((m: number, r: { level: number }) => Math.max(m, r.level), 0);
  return {
    maxLevel,
    layer: layerOfNum(maxLevel),
    countsAsImpact: countsAsImpactNum(maxLevel),
  };
}

// Agregacao de uma iniciativa, contando pessoas UNICAS pelo maior nivel (dedup por identidade).
// Esta e a contagem honesta: cada identityKey conta uma vez, pelo seu nivel mais alto.
export async function initiativeImpact(initiativeId: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertInitiativeTenant(initiativeId, tenantId);
  const rows = await db.select().from(engagementEvents).where(eq(engagementEvents.initiativeId, initiativeId));
  const maxByIdentity = new Map<string, number>();
  for (const r of rows) {
    maxByIdentity.set(r.identityKey, Math.max(maxByIdentity.get(r.identityKey) ?? 0, r.level));
  }
  let alcanceUnico = 0, impacto = 0, transformacao = 0, esteira = 0;
  for (const lvl of Array.from(maxByIdentity.values())) {
    alcanceUnico++;
    const layer = layerOfNum(lvl);
    if (layer === "impacto") impacto++;
    else if (layer === "transformacao") transformacao++;
    else if (layer === "esteira") esteira++;
  }
  // Gatilhos unicos = quem cruzou o limiar (impacto + transformacao + esteira).
  const gatilhosUnicos = impacto + transformacao + esteira;
  return { alcanceUnico, gatilhosUnicos, impacto, transformacao, esteira };
}
