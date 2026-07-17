// server/services/impact/registry-service.test.ts
// Impact7 · Sprint 8 · testes do motor de mensuracao.
// Cobre: contagem de unicos pelo metodo do maximo, limiar de impacto no nivel Preparar (3),
// as tres camadas (impacto/transformacao/esteira), S-ROI auditavel + sensibilidade,
// e a janela de uso (comportamento atual: nenhuma janela e aplicada).
import { describe, it, expect, beforeEach, vi } from "vitest";

// --- Mock do db e do eq, hoisteds antes dos imports do modulo sob teste. ---
const { store, auditInserts, dbMock } = vi.hoisted(() => {
  const store = new Map<unknown, any[]>();
  const auditInserts: Array<{ table: unknown; v: any }> = [];

  const makeQuery = (rows: any[]) => {
    const p = Promise.resolve(rows);
    return {
      // Todas as clausulas where do servico filtram por initiativeId.
      where(val: number) {
        return Promise.resolve(rows.filter((r) => r.initiativeId === val));
      },
      then: p.then.bind(p),
      catch: p.catch.bind(p),
      finally: p.finally.bind(p),
    };
  };

  const dbMock = {
    select() {
      return {
        from(table: unknown) {
          return makeQuery(store.get(table) ?? []);
        },
      };
    },
    insert(table: unknown) {
      return {
        values(v: any) {
          auditInserts.push({ table, v });
          return Promise.resolve();
        },
      };
    },
  };

  return { store, auditInserts, dbMock };
});

vi.mock("../../db", () => ({ getDb: async () => dbMock }));
vi.mock("drizzle-orm", async (orig) => ({
  ...(await orig<typeof import("drizzle-orm")>()),
  // eq(coluna, valor) reduzido ao valor; o fake where filtra por initiativeId.
  eq: (_col: unknown, val: unknown) => val,
}));

import { ecosystemPlacar, initiativeSroi } from "./registry-service";
import { engagementEvents } from "../../../drizzle/schema.impact7";
import { initiativeParams, auditLog } from "../../../drizzle/schema.impact8";

// Niveis IMPACTA: 1 informar, 2 motivar (exposicao) | 3 preparar LIMIAR, 4 ativar, 5 conectar (impacto)
// | 6 transformar (transformacao) | 7 amplificar (esteira).
const ev = (
  identityKey: string,
  initiativeId: number,
  level: number,
  createdAt = 1_700_000_000_000,
) => ({ id: 0, identityKey, initiativeId, signal: "x", level, instrumented: 1, createdAt });

beforeEach(() => {
  store.clear();
  auditInserts.length = 0;
});

describe("ecosystemPlacar", () => {
  it("conta unicos pelo maximo global e separa nas tres camadas com limiar em Preparar", async () => {
    store.set(engagementEvents, [
      // A: aparece duas vezes, vence o maior nivel (4, impacto) -> deduplicacao pelo maximo.
      ev("A", 1, 2),
      ev("A", 2, 4),
      ev("B", 1, 6), // transformacao
      ev("C", 1, 7), // esteira
      ev("D", 1, 1), // exposicao (abaixo do limiar), conta no alcance mas nao como gatilho
      ev("E", 1, 3), // exatamente o limiar Preparar -> impacto
      ev("F", 1, 2), // motivar, abaixo do limiar -> exposicao
    ]);

    const r = await ecosystemPlacar();

    expect(r.alcanceUnico).toBe(6); // A,B,C,D,E,F
    expect(r.impacto).toBe(2); // A(4), E(3)
    expect(r.transformacao).toBe(1); // B
    expect(r.esteira).toBe(1); // C
    expect(r.gatilhosUnicos).toBe(4); // impacto + transformacao + esteira, D e F fora
  });

  it("limiar: nivel 2 nao gera gatilho, nivel 3 gera (fronteira exposicao/impacto)", async () => {
    store.set(engagementEvents, [ev("P2", 1, 2), ev("P3", 1, 3)]);
    const r = await ecosystemPlacar();
    expect(r.alcanceUnico).toBe(2);
    expect(r.impacto).toBe(1);
    expect(r.gatilhosUnicos).toBe(1);
  });

  it("janela de uso: eventos antigos e futuros contam igual, nenhuma janela e aplicada", async () => {
    store.set(engagementEvents, [
      ev("G", 1, 4, 0), // epoch 0
      ev("H", 1, 4, 4_102_444_800_000), // ano 2100
    ]);
    const r = await ecosystemPlacar();
    expect(r.alcanceUnico).toBe(2);
    expect(r.impacto).toBe(2);
  });
});

describe("initiativeSroi", () => {
  const params = {
    id: 1,
    initiativeId: 1,
    valorGatilhoCents: 3000, // R$ 30,00
    valorTransformacaoCents: 80000, // R$ 800,00
    atribuicaoBps: 6000, // 60%
    custoImtsCents: 100000, // R$ 1.000,00
    updatedAt: 1_700_000_000_000,
  };

  it("calcula S-ROI, memoria de calculo e sensibilidade, escopo por iniciativa e dedup pelo maximo", async () => {
    store.set(initiativeParams, [params]);
    store.set(engagementEvents, [
      ev("P1", 1, 4), // impacto -> gatilho
      ev("P1", 1, 3), // mesmo P1, maximo permanece 4
      ev("P1", 2, 7), // outra iniciativa, deve ser excluida pelo where (nao vira esteira)
      ev("P2", 1, 6), // transformacao -> gatilho + transformacao
      ev("P3", 1, 7), // esteira (amplificar) -> gatilho, mas NAO transformacao
      ev("P4", 1, 3), // impacto -> gatilho
      ev("P5", 1, 1), // exposicao -> nao conta
    ]);

    const now = 1_752_000_000_000;
    const m = await initiativeSroi(1, "italo", now);

    expect(m.gatilhos).toBe(4); // P1,P2,P3,P4
    expect(m.transformacoes).toBe(1); // apenas P2
    expect(m.valorSocialBruto).toBeCloseTo(920, 6); // 4*30 + 1*800
    expect(m.valorSocial).toBeCloseTo(552, 6); // 920 * 0.6
    expect(m.sroi).toBeCloseTo(0.552, 6);
    expect(m.sensibilidade.sroiLow).toBeCloseTo(0.408, 6); // transformacao *0.7
    expect(m.sensibilidade.sroiHigh).toBeCloseTo(0.696, 6); // transformacao *1.3

    // Trilha de auditoria gravada com o now injetado, nunca Date.now interno.
    expect(auditInserts).toHaveLength(1);
    expect(auditInserts[0].table).toBe(auditLog);
    expect(auditInserts[0].v.actor).toBe("italo");
    expect(auditInserts[0].v.action).toBe("compute_sroi");
    expect(auditInserts[0].v.entityId).toBe(1);
    expect(auditInserts[0].v.createdAt).toBe(now);
    expect(JSON.parse(auditInserts[0].v.resultJson).sroi).toBeCloseTo(0.552, 6);
  });

  it("custo zero zera S-ROI e a faixa de sensibilidade em vez de dividir por zero", async () => {
    store.set(initiativeParams, [{ ...params, custoImtsCents: 0 }]);
    store.set(engagementEvents, [ev("P1", 1, 6)]);
    const m = await initiativeSroi(1, "system", 1);
    expect(m.sroi).toBe(0);
    expect(m.sensibilidade.sroiLow).toBe(0);
    expect(m.sensibilidade.sroiHigh).toBe(0);
  });

  it("sem transformacoes, a faixa de sensibilidade colapsa no ponto central", async () => {
    store.set(initiativeParams, [params]);
    store.set(engagementEvents, [ev("P1", 1, 4), ev("P4", 1, 5)]); // dois gatilhos impacto, zero transformacao
    const m = await initiativeSroi(1, "system", 1);
    expect(m.transformacoes).toBe(0);
    expect(m.sensibilidade.sroiLow).toBeCloseTo(m.sroi, 6);
    expect(m.sensibilidade.sroiHigh).toBeCloseTo(m.sroi, 6);
  });

  it("lanca erro quando a iniciativa nao tem parametros economicos", async () => {
    store.set(initiativeParams, []);
    store.set(engagementEvents, [ev("P1", 1, 4)]);
    await expect(initiativeSroi(999, "system", 1)).rejects.toThrow(
      "Iniciativa sem parametros economicos",
    );
    expect(auditInserts).toHaveLength(0);
  });
});
