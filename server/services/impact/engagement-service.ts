// server/services/impact/engagement-service.ts
// Impact7 · Sprint 7 · a logica que transforma engajamento em rating de impacto,
// resolvendo tres coisas de uma vez: o limiar, a prova de uso e a deduplicacao por identidade.
import { getDb } from "../../db";
const db = getDb(); // ajuste ao caminho real do client Drizzle
import { engagementEvents } from "../../../drizzle/schema.impact7";
import { and, eq } from "drizzle-orm";
import { IMPACTA_ORDER, layerOfNum, countsAsImpactNum, signalToLevelNum } from "../../../shared/ive-mapping";

// Registra um evento. O relogio (now) e injetado, nunca Date.now() espalhado, conforme o DNA do repo.
export async function recordEngagement(params: {
  identityKey: string;
  initiativeId: number;
  signal: string;
  instrumented?: boolean;
  now: number; // Unix ms
}) {
  const level = signalToLevelNum(params.signal);
  if (level === null) throw new Error(`Sinal de engajamento desconhecido: ${params.signal}`);
  await db.insert(engagementEvents).values({
    identityKey: params.identityKey,
    initiativeId: params.initiativeId,
    signal: params.signal,
    level,
    instrumented: params.instrumented === false ? 0 : 1,
    createdAt: params.now,
  });
  return { level, countsAsImpact: countsAsImpactNum(level) };
}

// Rating de um usuario numa iniciativa: o maior nivel alcancado (metodo do maximo).
export async function userRating(identityKey: string, initiativeId: number) {
  const rows = await db.select().from(engagementEvents)
    .where(and(eq(engagementEvents.identityKey, identityKey), eq(engagementEvents.initiativeId, initiativeId)));
  const maxLevel = rows.reduce((m, r) => Math.max(m, r.level), 0);
  return {
    maxLevel,
    layer: layerOfNum(maxLevel),
    countsAsImpact: countsAsImpactNum(maxLevel),
  };
}

// Agregacao de uma iniciativa, contando pessoas UNICAS pelo maior nivel (dedup por identidade).
// Esta e a contagem honesta: cada identityKey conta uma vez, pelo seu nivel mais alto.
export async function initiativeImpact(initiativeId: number) {
  const rows = await db.select().from(engagementEvents).where(eq(engagementEvents.initiativeId, initiativeId));
  const maxByIdentity = new Map<string, number>();
  for (const r of rows) {
    maxByIdentity.set(r.identityKey, Math.max(maxByIdentity.get(r.identityKey) ?? 0, r.level));
  }
  let alcanceUnico = 0, impacto = 0, transformacao = 0, esteira = 0;
  for (const lvl of maxByIdentity.values()) {
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
