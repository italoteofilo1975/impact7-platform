// server/services/impact/registry-service.ts
// Impact7 · Sprint 8 · o motor de mensuracao. Consolida o placar do ecossistema com deduplicacao
// global, calcula o S-ROI auditavel com memoria de calculo, e grava a trilha de auditoria.
import { getDb } from "../../db";
import { engagementEvents } from "../../../drizzle/schema.impact7";
import { initiativeParams, auditLog } from "../../../drizzle/schema.impact8";
import { eq } from "drizzle-orm";
import { layerOfNum } from "../../../shared/ive-mapping";
import { calcSroi } from "../../../shared/sroi-calculator";
import { assertInitiativeTenant } from "../tenancy/tenant-context";

// Placar do ecossistema. Contagem de UNICOS entre TODAS as iniciativas, metodo do maximo global:
// cada identidade conta uma unica vez, pelo seu maior nivel em qualquer iniciativa. Isso e a defesa
// contra dupla contagem que sustenta o alvo dos 14 milhoes.
export async function ecosystemPlacar() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(engagementEvents);
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
  return { alcanceUnico, gatilhosUnicos: impacto + transformacao + esteira, impacto, transformacao, esteira };
}

// S-ROI auditavel de uma iniciativa, com memoria de calculo transparente e faixa de sensibilidade,
// e registro na trilha de auditoria. O now e injetado, nunca Date.now() dentro da regra.
// tenantId e obrigatorio e verificado contra o dono real da iniciativa (achado 1.7/1.9), fechando
// a mesma brecha ja fechada no engagement-service: sem isso qualquer chamador lia o S-ROI de
// qualquer iniciativa so adivinhando o initiativeId.
export async function initiativeSroi(initiativeId: number, tenantId: number, actor: string, now: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertInitiativeTenant(initiativeId, tenantId);
  const [p] = await db.select().from(initiativeParams).where(eq(initiativeParams.initiativeId, initiativeId));
  if (!p) throw new Error("Iniciativa sem parametros economicos");

  const evs = await db.select().from(engagementEvents).where(eq(engagementEvents.initiativeId, initiativeId));
  const maxByIdentity = new Map<string, number>();
  for (const r of evs) maxByIdentity.set(r.identityKey, Math.max(maxByIdentity.get(r.identityKey) ?? 0, r.level));

  // A camada esteira (nivel Amplificar) e projecao do movimento de segunda ordem, e NUNCA entra
  // no numero auditado de gatilhos nem no valor monetario do S-ROI oficial, conforme os dois livros
  // (Metodo cap07, Metodologia cap13) e a memoria viva. E contada e reportada em separado.
  let gatilhos = 0, transformacoes = 0, esteira = 0;
  for (const lvl of Array.from(maxByIdentity.values())) {
    const layer = layerOfNum(lvl);
    if (layer === "impacto") gatilhos++;
    else if (layer === "transformacao") { gatilhos++; transformacoes++; }
    else if (layer === "esteira") esteira++;
  }

  // A formula em si vive em shared/sroi-calculator.ts, compartilhada com o simulador
  // ilustrativo dos agentes conversacionais (ally-chat-service.ts), para que o numero real
  // e o numero que o agente de IA explica pro aliado nunca possam divergir por duplicacao.
  const calculo = calcSroi({
    gatilhos, transformacoes,
    valorGatilhoCents: p.valorGatilhoCents,
    valorTransformacaoCents: p.valorTransformacaoCents,
    atribuicaoBps: p.atribuicaoBps,
    deadweightBps: p.deadweightBps ?? 0,
    dropOffBps: p.dropOffBps ?? 0,
    custoImtsCents: p.custoImtsCents,
  });

  const memoria = { ...calculo, esteiraProjecao: esteira };

  await db.insert(auditLog).values({
    actor, action: "compute_sroi", entity: "initiative", entityId: initiativeId,
    inputJson: JSON.stringify({ initiativeId }), resultJson: JSON.stringify(memoria), createdAt: now,
  });

  return memoria;
}
