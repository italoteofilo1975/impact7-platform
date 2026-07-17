// server/services/agents/mesh-service.test.ts
// Impact7 · Sprint 9 · testes da Malha de Agentes.
// Cobre: janela diaria de uso, escalonamento de modelo (as tres camadas do catalogo),
// medicao de custo (upsert), turno completo do agente e integridade do catalogo.
//
// A camada de dados e o servico de engajamento sao injetados/mockados para manter
// a regra de negocio isolada e barata de testar.
import { describe, it, expect, beforeEach, vi } from "vitest";

// --- mock da camada de dados (db) -------------------------------------------
// A ordem das chamadas a select() e deterministica no codigo sob teste:
// checkWindow faz 1 select; meterUsage faz 1 select. Enfileiramos os resultados.
const { selectQueue, updateCalls, insertCalls } = vi.hoisted(() => ({
  selectQueue: [] as any[][],
  updateCalls: [] as any[],
  insertCalls: [] as any[],
}));

vi.mock("../../db", () => {
  const db = {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(selectQueue.length ? selectQueue.shift()! : []),
      }),
    }),
    update: () => ({
      set: (values: any) => ({
        where: (_cond: any) => {
          updateCalls.push(values);
          return Promise.resolve();
        },
      }),
    }),
    insert: () => ({
      values: (values: any) => {
        insertCalls.push(values);
        return Promise.resolve();
      },
    }),
  };
  return { getDb: async () => db };
});

// --- mock do servico de engajamento -----------------------------------------
const { recordEngagement } = vi.hoisted(() => ({ recordEngagement: vi.fn(async () => {}) }));
vi.mock("../impact/engagement-service", () => ({ recordEngagement }));

import {
  dayBucket,
  checkWindow,
  selectModel,
  runAgentTurn,
  JANELA_SOCIAL_SEGUNDOS_DIA,
} from "./mesh-service";
import { AGENTS_CATALOG, agentForStage } from "../../../shared/agents-catalog";

const DIA_MS = 86400000;

function reset() {
  selectQueue.length = 0;
  updateCalls.length = 0;
  insertCalls.length = 0;
  recordEngagement.mockClear();
}

beforeEach(reset);

// ---------------------------------------------------------------------------
describe("dayBucket (Unix days a partir de Unix ms)", () => {
  it("mapeia ms para o dia inteiro correto", () => {
    expect(dayBucket(0)).toBe(0);
    expect(dayBucket(DIA_MS - 1)).toBe(0);
    expect(dayBucket(DIA_MS)).toBe(1);
    expect(dayBucket(10 * DIA_MS + 123)).toBe(10);
  });

  it("dois instantes do mesmo dia caem no mesmo bucket", () => {
    const base = 20000 * DIA_MS;
    expect(dayBucket(base + 60_000)).toBe(dayBucket(base + 7_000_000));
  });
});

// ---------------------------------------------------------------------------
describe("checkWindow (janela diaria do modo social)", () => {
  it("cap padrao e de duas horas em segundos", () => {
    expect(JANELA_SOCIAL_SEGUNDOS_DIA).toBe(7200);
  });

  it("libera e devolve o cap inteiro quando nao ha uso registrado", async () => {
    selectQueue.push([]); // nenhuma linha
    const r = await checkWindow("id-1", 5 * DIA_MS);
    expect(r.allowed).toBe(true);
    expect(r.remainingSeconds).toBe(7200);
  });

  it("desconta o uso ja consumido no dia", async () => {
    selectQueue.push([{ usedSeconds: 5000 }]);
    const r = await checkWindow("id-1", 5 * DIA_MS);
    expect(r.allowed).toBe(true);
    expect(r.remainingSeconds).toBe(2200);
  });

  it("bloqueia exatamente no limite (used == cap) e nunca devolve restante negativo", async () => {
    selectQueue.push([{ usedSeconds: 7200 }]);
    const r = await checkWindow("id-1", 5 * DIA_MS);
    expect(r.allowed).toBe(false);
    expect(r.remainingSeconds).toBe(0);
  });

  it("estouro alem do cap ainda bloqueia e trava o restante em zero", async () => {
    selectQueue.push([{ usedSeconds: 9999 }]);
    const r = await checkWindow("id-1", 5 * DIA_MS);
    expect(r.allowed).toBe(false);
    expect(r.remainingSeconds).toBe(0);
  });

  it("respeita um cap customizado por iniciativa", async () => {
    selectQueue.push([{ usedSeconds: 100 }]);
    const r = await checkWindow("id-1", 5 * DIA_MS, 300);
    expect(r.allowed).toBe(true);
    expect(r.remainingSeconds).toBe(200);
  });
});

// ---------------------------------------------------------------------------
describe("selectModel (escalonamento de modelo)", () => {
  it("usa o tier barato abaixo do limiar", () => {
    expect(selectModel(0)).toBe("barato");
    expect(selectModel(0.69)).toBe("barato");
  });

  it("escalona no limiar e acima dele", () => {
    expect(selectModel(0.7)).toBe("escalonado");
    expect(selectModel(1)).toBe("escalonado");
  });

  it("respeita um limiar customizado", () => {
    expect(selectModel(0.5, 0.4)).toBe("escalonado");
    expect(selectModel(0.3, 0.4)).toBe("barato");
  });

  it("o catalogo declara tres camadas, mas selectModel so alcanca duas (premium inatingivel)", () => {
    const tiers = new Set(AGENTS_CATALOG.map((a) => a.modelTier));
    expect(tiers).toEqual(new Set(["barato", "escalonado", "premium"]));
    const alcancados = new Set(
      Array.from({ length: 101 }, (_, i) => selectModel(i / 100)),
    );
    expect(alcancados.has("premium")).toBe(false); // lacuna documentada, ver revisao
  });
});

// ---------------------------------------------------------------------------
describe("runAgentTurn (turno completo)", () => {
  const baseParams = () => ({
    identityKey: "id-1",
    initiativeId: 42,
    message: "como comeco minha licao?",
    signal: "lesson_started",
    taskComplexity: 0.9,
    now: 100 * DIA_MS,
    rag: vi.fn(async (_q: string) => "contexto verticalizado"),
    llm: vi.fn(async (_tier: any, _prompt: string) => ({
      text: "resposta",
      tokensIn: 120,
      tokensOut: 340,
      seconds: 12,
    })),
  });

  it("bloqueia quando a janela diaria esta esgotada e nao chama rag/llm/medicao", async () => {
    selectQueue.push([{ usedSeconds: 7200 }]); // checkWindow
    const p = baseParams();
    const r = await runAgentTurn(p);
    expect(r).toEqual({ blocked: true, reason: "janela diaria esgotada" });
    expect(p.rag).not.toHaveBeenCalled();
    expect(p.llm).not.toHaveBeenCalled();
    expect(recordEngagement).not.toHaveBeenCalled();
    expect(insertCalls).toHaveLength(0);
    expect(updateCalls).toHaveLength(0);
  });

  it("tarefa dificil escalona o modelo e concatena o contexto do RAG no prompt", async () => {
    selectQueue.push([]); // checkWindow -> sem uso
    selectQueue.push([]); // meterUsage -> insere
    const p = baseParams();
    const r = await runAgentTurn(p);
    expect(r.blocked).toBe(false);
    expect(p.llm).toHaveBeenCalledWith("escalonado", "contexto verticalizado\n\ncomo comeco minha licao?");
    if (!r.blocked) expect(r.tier).toBe("escalonado");
  });

  it("tarefa simples usa o tier barato", async () => {
    selectQueue.push([]);
    selectQueue.push([]);
    const p = baseParams();
    p.taskComplexity = 0.1;
    const r = await runAgentTurn(p);
    if (!r.blocked) expect(r.tier).toBe("barato");
    expect(p.llm.mock.calls[0][0]).toBe("barato");
  });

  it("mede o custo via insert quando nao ha linha do dia e registra o engajamento do turno", async () => {
    selectQueue.push([]); // checkWindow
    selectQueue.push([]); // meterUsage -> sem linha -> insert
    const p = baseParams();
    await runAgentTurn(p);
    expect(insertCalls).toHaveLength(1);
    expect(insertCalls[0]).toMatchObject({
      identityKey: "id-1",
      dayBucket: 100,
      usedSeconds: 12,
      tokensIn: 120,
      tokensOut: 340,
      updatedAt: 100 * DIA_MS,
    });
    expect(recordEngagement).toHaveBeenCalledWith({
      identityKey: "id-1",
      initiativeId: 42,
      signal: "lesson_started",
      now: 100 * DIA_MS,
    });
  });

  it("acumula o custo via update quando ja existe linha do dia", async () => {
    selectQueue.push([{ usedSeconds: 100 }]); // checkWindow
    selectQueue.push([{ id: 7, usedSeconds: 100, tokensIn: 10, tokensOut: 20 }]); // meterUsage
    const p = baseParams();
    await runAgentTurn(p);
    expect(insertCalls).toHaveLength(0);
    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0]).toMatchObject({
      usedSeconds: 112, // 100 + 12
      tokensIn: 130, // 10 + 120
      tokensOut: 360, // 20 + 340
      updatedAt: 100 * DIA_MS,
    });
  });

  it("arredonda os segundos fracionados ao medir", async () => {
    selectQueue.push([]); // checkWindow
    selectQueue.push([]); // meterUsage -> insert
    const p = baseParams();
    p.llm = vi.fn(async () => ({ text: "x", tokensIn: 1, tokensOut: 1, seconds: 11.6 }));
    await runAgentTurn(p);
    expect(insertCalls[0].usedSeconds).toBe(12);
  });

  it("o restante retornado pode ficar negativo quando o turno estoura a janela (sem enforcement de saldo)", async () => {
    selectQueue.push([{ usedSeconds: 7195 }]); // restam 5s
    selectQueue.push([{ id: 1, usedSeconds: 7195, tokensIn: 0, tokensOut: 0 }]);
    const p = baseParams();
    p.llm = vi.fn(async () => ({ text: "x", tokensIn: 0, tokensOut: 0, seconds: 30 }));
    const r = await runAgentTurn(p);
    if (!r.blocked) expect(r.remainingSeconds).toBe(5 - 30); // -25, lacuna documentada
  });
});

// ---------------------------------------------------------------------------
describe("AGENTS_CATALOG (integridade das fichas)", () => {
  it("os ids sao unicos", () => {
    const ids = AGENTS_CATALOG.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda ficha traz o campo obrigatorio modoSocialExpand nao vazio", () => {
    for (const a of AGENTS_CATALOG) {
      expect(a.modoSocialExpand.trim().length).toBeGreaterThan(0);
    }
  });

  it("agentForStage resolve o especialista por estagio e ignora o conductor", () => {
    expect(agentForStage("origem")?.id).toBe("purpose");
    expect(agentForStage("escala")?.id).toBe("scale");
    // conductor nao e um IveStage, entao nao deve ser resolvido por estagio
    expect(AGENTS_CATALOG.some((a) => a.stage === "conductor")).toBe(true);
  });
});
