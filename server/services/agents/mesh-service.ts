// server/services/agents/mesh-service.ts
// Impact7 · Sprint 9 · a Malha de Agentes por ID. Instancia por usuario com janela de uso,
// escalonamento de modelo e medicao de custo, ligada a instrumentacao de engajamento.
// As dependencias de LLM e RAG sao injetadas, para manter a regra testavel e o custo baixo e trocavel.
import { getDb } from "../../db";
import { agentUsage } from "../../../drizzle/schema.agents";
import { and, eq } from "drizzle-orm";
import { recordEngagement } from "../impact/engagement-service";
import { ModelTier } from "../../../shared/agents-catalog";

// Janela de uso do modo social, duas horas por dia. Editavel por iniciativa.
export const JANELA_SOCIAL_SEGUNDOS_DIA = 2 * 60 * 60;

export function dayBucket(now: number): number {
  return Math.floor(now / 86400000);
}

// Verifica a janela diaria. Retorna se pode interagir e quanto resta.
export async function checkWindow(identityKey: string, now: number, capSeconds = JANELA_SOCIAL_SEGUNDOS_DIA) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const bucket = dayBucket(now);
  const [row] = await db.select().from(agentUsage)
    .where(and(eq(agentUsage.identityKey, identityKey), eq(agentUsage.dayBucket, bucket)));
  const used = row?.usedSeconds ?? 0;
  return { allowed: used < capSeconds, remainingSeconds: Math.max(0, capSeconds - used) };
}

// Escalonamento de modelo: barato por padrao, escalona so quando a tarefa e dificil.
export function selectModel(taskComplexity: number, escalateThreshold = 0.7): ModelTier {
  return taskComplexity >= escalateThreshold ? "escalonado" : "barato";
}

// Um turno do agente. Verifica a janela, recupera contexto verticalizado por RAG, chama o modelo
// no tier certo, mede o custo e registra o engajamento do turno.
export async function runAgentTurn(params: {
  identityKey: string;
  initiativeId: number;
  message: string;
  signal: string;         // sinal de engajamento deste turno, ex. lesson_started
  taskComplexity: number; // 0 a 1
  now: number;
  rag: (q: string) => Promise<string>;                                                     // com cache verticalizado
  llm: (tier: ModelTier, prompt: string) => Promise<{ text: string; tokensIn: number; tokensOut: number; seconds: number }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const win = await checkWindow(params.identityKey, params.now);
  if (!win.allowed) return { blocked: true as const, reason: "janela diaria esgotada" };

  const tier = selectModel(params.taskComplexity);
  const context = await params.rag(params.message);
  const out = await params.llm(tier, `${context}\n\n${params.message}`);

  await meterUsage(params.identityKey, params.now, out.seconds, out.tokensIn, out.tokensOut);
  await recordEngagement({
    identityKey: params.identityKey, initiativeId: params.initiativeId, signal: params.signal, now: params.now,
  });

  return { blocked: false as const, tier, text: out.text, remainingSeconds: win.remainingSeconds - out.seconds };
}

async function meterUsage(identityKey: string, now: number, seconds: number, tokensIn: number, tokensOut: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const bucket = dayBucket(now);
  const [row] = await db.select().from(agentUsage)
    .where(and(eq(agentUsage.identityKey, identityKey), eq(agentUsage.dayBucket, bucket)));
  if (row) {
    await db.update(agentUsage).set({
      usedSeconds: row.usedSeconds + Math.round(seconds),
      tokensIn: row.tokensIn + tokensIn,
      tokensOut: row.tokensOut + tokensOut,
      updatedAt: now,
    }).where(eq(agentUsage.id, row.id));
  } else {
    await db.insert(agentUsage).values({
      identityKey, dayBucket: bucket, usedSeconds: Math.round(seconds),
      tokensIn, tokensOut, updatedAt: now,
    });
  }
}
