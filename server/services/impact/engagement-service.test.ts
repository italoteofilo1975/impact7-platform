// server/services/impact/engagement-service.test.ts
// Impact7 · Sprint 7 · testes da instrumentacao de engajamento.
// Co-locado ao lado de engagement-service.ts para que os specifiers relativos do
// servico (../../db, ../../../drizzle/schema.impact7, ../../../shared/ive-mapping)
// resolvam de forma identica sob o mesmo vi.mock.
import { describe, it, expect, beforeEach, vi } from "vitest";

// Store em memoria compartilhado com as factories hoisted do vi.mock.
const { store } = vi.hoisted(() => ({ store: [] as any[] }));

// db falso: insert().values() empurra na store; select().from().where(pred) filtra.
vi.mock("../../db", () => ({
  getDb: async () => ({
    insert: () => ({
      values: async (v: any) => {
        store.push({ id: store.length + 1, ...v });
        return undefined;
      },
    }),
    select: () => ({
      from: (_t: any) => ({
        where: async (pred: any) => store.filter((row) => (pred ? pred(row) : true)),
      }),
    }),
  }),
}));

// Colunas do schema viram os proprios nomes, para o eq/and montarem predicados.
vi.mock("../../../drizzle/schema.impact7", () => ({
  engagementEvents: {
    id: "id",
    identityKey: "identityKey",
    initiativeId: "initiativeId",
    signal: "signal",
    level: "level",
    instrumented: "instrumented",
    createdAt: "createdAt",
  },
  initiatives: {},
}));

// eq/and reduzidos a funcoes de predicado sobre a linha crua.
vi.mock("drizzle-orm", () => ({
  eq: (col: string, val: any) => (row: any) => row[col] === val,
  and: (...preds: any[]) => (row: any) => preds.every((p) => p(row)),
}));

// A checagem real de posse tenant<->iniciativa e testada a fundo em tenant-context.test.ts.
// Aqui o foco e a logica de engajamento em si, entao o guard de tenant e um passthrough
// que apenas devolve o tenantId reclamado (default 1), sem tocar em nenhuma tabela.
vi.mock("../tenancy/tenant-context", () => ({
  assertInitiativeTenant: async (_initiativeId: number, claimedTenantId?: number) => claimedTenantId ?? 1,
}));

// O ive-mapping real e usado de proposito: e a fonte da verdade do limiar e das camadas.
import {
  layerOfNum,
  countsAsImpactNum,
  signalToLevelNum,
  IMPACTA_ORDER,
  IMPACT_THRESHOLD_LEVEL,
} from "../../../shared/ive-mapping";
import { recordEngagement, userRating, initiativeImpact } from "./engagement-service";

const NOW = 1_700_000_000_000; // Unix ms

beforeEach(() => {
  store.length = 0;
});

describe("ive-mapping · limiar de impacto no nivel Preparar", () => {
  it("coloca o limiar exatamente na entrada de Preparar (nivel 3)", () => {
    expect(IMPACT_THRESHOLD_LEVEL).toBe(3);
    expect(IMPACTA_ORDER.preparar).toBe(3);
  });

  it("informar e motivar ficam abaixo do limiar (exposicao, nao contam)", () => {
    expect(countsAsImpactNum(IMPACTA_ORDER.informar)).toBe(false);
    expect(countsAsImpactNum(IMPACTA_ORDER.motivar)).toBe(false);
    expect(layerOfNum(1)).toBe("exposicao");
    expect(layerOfNum(2)).toBe("exposicao");
  });

  it("preparar e o primeiro nivel que cruza o limiar", () => {
    expect(countsAsImpactNum(IMPACTA_ORDER.preparar)).toBe(true);
    expect(countsAsImpactNum(IMPACT_THRESHOLD_LEVEL - 1)).toBe(false);
    expect(countsAsImpactNum(IMPACT_THRESHOLD_LEVEL)).toBe(true);
  });
});

describe("ive-mapping · as (tres) camadas de layerOfNum", () => {
  it("preparar..conectar caem na camada impacto", () => {
    expect(layerOfNum(3)).toBe("impacto"); // preparar
    expect(layerOfNum(4)).toBe("impacto"); // ativar
    expect(layerOfNum(5)).toBe("impacto"); // conectar
  });

  it("transformar e a camada transformacao e amplificar e esteira", () => {
    expect(layerOfNum(6)).toBe("transformacao"); // transformar
    expect(layerOfNum(7)).toBe("esteira"); // amplificar
  });
});

describe("ive-mapping · signalToLevelNum", () => {
  it("mapeia sinais conhecidos para o nivel IMPACTA", () => {
    expect(signalToLevelNum("view")).toBe(1);
    expect(signalToLevelNum("first_interaction")).toBe(3);
    expect(signalToLevelNum("sustained_outcome")).toBe(6);
    expect(signalToLevelNum("referral")).toBe(7);
  });

  it("retorna null para sinal desconhecido", () => {
    expect(signalToLevelNum("nao_existe")).toBeNull();
  });
});

describe("recordEngagement", () => {
  it("persiste o nivel derivado do sinal e devolve countsAsImpact", async () => {
    const res = await recordEngagement({
      identityKey: "id:a",
      initiativeId: 1,
      signal: "first_interaction",
      now: NOW,
    });
    expect(res).toEqual({ level: 3, countsAsImpact: true });
    expect(store).toHaveLength(1);
    expect(store[0]).toMatchObject({
      identityKey: "id:a",
      initiativeId: 1,
      signal: "first_interaction",
      level: 3,
      instrumented: 1, // default: medido
      createdAt: NOW,
    });
  });

  it("instrumented=false grava 0 (estimado); undefined e true gravam 1", async () => {
    await recordEngagement({ identityKey: "id:a", initiativeId: 1, signal: "view", instrumented: false, now: NOW });
    await recordEngagement({ identityKey: "id:b", initiativeId: 1, signal: "view", instrumented: true, now: NOW });
    await recordEngagement({ identityKey: "id:c", initiativeId: 1, signal: "view", now: NOW });
    expect(store.map((r) => r.instrumented)).toEqual([0, 1, 1]);
  });

  it("lanca em sinal desconhecido e nao insere nada", async () => {
    await expect(
      recordEngagement({ identityKey: "id:a", initiativeId: 1, signal: "xpto", now: NOW }),
    ).rejects.toThrow(/desconhecido/i);
    expect(store).toHaveLength(0);
  });
});

describe("userRating · metodo do maximo", () => {
  it("devolve o maior nivel alcancado pelo usuario na iniciativa", async () => {
    await recordEngagement({ identityKey: "id:a", initiativeId: 1, signal: "view", now: NOW });
    await recordEngagement({ identityKey: "id:a", initiativeId: 1, signal: "action_completed", now: NOW }); // 4
    await recordEngagement({ identityKey: "id:a", initiativeId: 1, signal: "dwell", now: NOW }); // 2
    const r = await userRating("id:a", 1, 1);
    expect(r.maxLevel).toBe(4);
    expect(r.layer).toBe("impacto");
    expect(r.countsAsImpact).toBe(true);
  });

  it("nao mistura eventos de outra iniciativa", async () => {
    await recordEngagement({ identityKey: "id:a", initiativeId: 1, signal: "view", now: NOW });
    await recordEngagement({ identityKey: "id:a", initiativeId: 2, signal: "referral", now: NOW }); // 7 noutra
    const r = await userRating("id:a", 1, 1);
    expect(r.maxLevel).toBe(1);
    expect(r.layer).toBe("exposicao");
  });

  it("sem eventos: maxLevel 0, exposicao, nao conta", async () => {
    const r = await userRating("id:vazio", 99, 1);
    expect(r).toEqual({ maxLevel: 0, layer: "exposicao", countsAsImpact: false });
  });
});

describe("initiativeImpact · contagem de unicos por metodo do maximo", () => {
  it("cada identityKey conta uma vez, pelo seu nivel mais alto (dedup)", async () => {
    // A: view(1) + action_completed(4) -> impacto
    await recordEngagement({ identityKey: "A", initiativeId: 1, signal: "view", now: NOW });
    await recordEngagement({ identityKey: "A", initiativeId: 1, signal: "action_completed", now: NOW });
    // B: so view(1) -> exposicao, entra no alcance mas nao no gatilho
    await recordEngagement({ identityKey: "B", initiativeId: 1, signal: "view", now: NOW });
    // C: sustained_outcome(6) -> transformacao
    await recordEngagement({ identityKey: "C", initiativeId: 1, signal: "sustained_outcome", now: NOW });
    // D: referral(7) -> esteira, com um segundo evento menor que nao muda o maximo
    await recordEngagement({ identityKey: "D", initiativeId: 1, signal: "referral", now: NOW });
    await recordEngagement({ identityKey: "D", initiativeId: 1, signal: "click", now: NOW });

    const r = await initiativeImpact(1, 1);
    expect(r.alcanceUnico).toBe(4); // A, B, C, D
    expect(r.impacto).toBe(1); // A
    expect(r.transformacao).toBe(1); // C
    expect(r.esteira).toBe(1); // D
    expect(r.gatilhosUnicos).toBe(3); // A + C + D, B fica de fora
  });

  it("iniciativa sem eventos zera tudo", async () => {
    const r = await initiativeImpact(42, 1);
    expect(r).toEqual({
      alcanceUnico: 0,
      gatilhosUnicos: 0,
      impacto: 0,
      transformacao: 0,
      esteira: 0,
    });
  });

  // Janela de uso: o servico NAO filtra por idade do evento. Este teste documenta o
  // comportamento atual (evento antigo continua contando) e trava a ausencia de janela,
  // que a revisao adversarial aponta como lacuna.
  it("janela de uso: eventos antigos ainda sao contados (sem filtro temporal hoje)", async () => {
    const umAnoAtras = NOW - 365 * 24 * 60 * 60 * 1000;
    await recordEngagement({ identityKey: "velho", initiativeId: 7, signal: "action_completed", now: umAnoAtras });
    await recordEngagement({ identityKey: "novo", initiativeId: 7, signal: "action_completed", now: NOW });
    const r = await initiativeImpact(7, 1);
    expect(r.alcanceUnico).toBe(2);
    expect(r.gatilhosUnicos).toBe(2);
  });
});
