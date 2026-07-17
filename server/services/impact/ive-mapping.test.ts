// shared/ive-mapping.test.ts
// Impact7 · Sprint 7 — testes Vitest do modelo canonico do Funil IVE/IMPACTA.
//
// NOTA DE ESCOPO: o modulo shared__ive-mapping.ts NAO exporta logica de
// "contagem de unicos por metodo do maximo", "S-ROI", "analise de sensibilidade"
// nem "janela de uso". Essas responsabilidades solicitadas na tarefa nao existem
// neste arquivo (ver revisao adversarial). Para nao ficar sem cobertura e para
// documentar o comportamento esperado, elas sao reimplementadas aqui como helpers
// de referencia e testadas contra as constantes reais do modulo (IMPACTA_ORDER,
// IMPACT_THRESHOLD_LEVEL). Quando a implementacao real for adicionada ao modulo,
// basta trocar os helpers locais pelos imports correspondentes.

import { describe, it, expect } from "vitest";
import {
  IVE_STAGES,
  IMPACTA_ORDER,
  IMPACT_THRESHOLD_LEVEL,
  layerOfNum,
  countsAsImpactNum,
  mapLegacyPillar,
  LEGACY_PILLAR_TO_IVE,
  SIGNAL_TO_LEVEL,
  signalToLevelNum,
  type ImpactLayer,
  type ImpactaLevel,
} from "../../../shared/ive-mapping";

// ---------------------------------------------------------------------------
// Helpers de referencia (logica candidata a viver no modulo).
// ---------------------------------------------------------------------------

// Convencoes do repo: timestamps int Unix ms; booleanos int 0/1;
// dinheiro em centavos; percentual em basis points (1% = 100 bps).

type EngagementEvent = {
  userId: string;
  signal: string;
  ts: number; // Unix ms
};

// "Contagem de unicos por metodo do maximo": cada usuario conta uma unica vez,
// pelo nivel IMPACTA MAXIMO que atingiu na janela. Retorna o numero de usuarios
// unicos cujo nivel maximo alcanca (>=) um dado nivel.
function uniquesByMax(events: EngagementEvent[]): Map<number, number> {
  const maxByUser = new Map<string, number>();
  for (const e of events) {
    const lvl = signalToLevelNum(e.signal);
    if (lvl == null) continue;
    const prev = maxByUser.get(e.userId);
    if (prev == null || lvl > prev) maxByUser.set(e.userId, lvl);
  }
  // Histograma cumulativo: quantos usuarios unicos com max >= n.
  const cumulative = new Map<number, number>();
  for (let n = 1; n <= 7; n++) {
    let c = 0;
    for (const v of maxByUser.values()) if (v >= n) c++;
    cumulative.set(n, c);
  }
  return cumulative;
}

// "Janela de uso": mantem apenas eventos com fromTs <= ts <= toTs (inclusivo),
// ambos em Unix ms.
function withinWindow(
  events: EngagementEvent[],
  fromTs: number,
  toTs: number
): EngagementEvent[] {
  return events.filter((e) => e.ts >= fromTs && e.ts <= toTs);
}

// S-ROI: retorno social sobre investimento, em basis points.
// benefitCents e costCents em centavos; resultado = benefit/cost em bps.
function sroiBps(benefitCents: number, costCents: number): number | null {
  if (costCents <= 0) return null;
  return Math.round((benefitCents / costCents) * 10000);
}

// Sensibilidade: variacao relativa (em bps) do S-ROI quando o beneficio
// e multiplicado por (1 + deltaBps/10000).
function sroiSensitivityBps(
  benefitCents: number,
  costCents: number,
  deltaBps: number
): number | null {
  const base = sroiBps(benefitCents, costCents);
  const bumped = sroiBps(
    Math.round(benefitCents * (1 + deltaBps / 10000)),
    costCents
  );
  if (base == null || bumped == null || base === 0) return null;
  return Math.round(((bumped - base) / base) * 10000);
}

// ---------------------------------------------------------------------------
// Constantes e ordem
// ---------------------------------------------------------------------------

describe("IMPACTA_ORDER e limiar", () => {
  it("mantem os sete niveis em ordem estritamente crescente", () => {
    const vals = Object.values(IMPACTA_ORDER);
    expect(vals).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i]).toBeGreaterThan(vals[i - 1]);
    }
  });

  it("posiciona o limiar de impacto na entrada de Preparar (3)", () => {
    expect(IMPACT_THRESHOLD_LEVEL).toBe(3);
    expect(IMPACT_THRESHOLD_LEVEL).toBe(IMPACTA_ORDER.preparar);
  });

  it("declara os sete passos do funil IVE de origem a escala", () => {
    expect(IVE_STAGES).toHaveLength(7);
    expect(IVE_STAGES[0]).toBe("origem");
    expect(IVE_STAGES[IVE_STAGES.length - 1]).toBe("escala");
  });
});

// ---------------------------------------------------------------------------
// Limiar de impacto
// ---------------------------------------------------------------------------

describe("countsAsImpactNum (limiar em Preparar)", () => {
  it("nao conta como impacto abaixo de Preparar", () => {
    expect(countsAsImpactNum(IMPACTA_ORDER.informar)).toBe(false);
    expect(countsAsImpactNum(IMPACTA_ORDER.motivar)).toBe(false);
  });

  it("conta como impacto a partir de Preparar, inclusive", () => {
    expect(countsAsImpactNum(IMPACTA_ORDER.preparar)).toBe(true);
    expect(countsAsImpactNum(IMPACTA_ORDER.ativar)).toBe(true);
    expect(countsAsImpactNum(IMPACTA_ORDER.amplificar)).toBe(true);
  });

  it("trata a fronteira exatamente em n = 3", () => {
    expect(countsAsImpactNum(2)).toBe(false);
    expect(countsAsImpactNum(3)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Camadas
// ---------------------------------------------------------------------------

describe("layerOfNum (camadas)", () => {
  it("classifica exposicao abaixo do limiar", () => {
    expect(layerOfNum(IMPACTA_ORDER.informar)).toBe<ImpactLayer>("exposicao");
    expect(layerOfNum(IMPACTA_ORDER.motivar)).toBe<ImpactLayer>("exposicao");
  });

  it("classifica impacto de Preparar ate Conectar", () => {
    expect(layerOfNum(IMPACTA_ORDER.preparar)).toBe<ImpactLayer>("impacto");
    expect(layerOfNum(IMPACTA_ORDER.ativar)).toBe<ImpactLayer>("impacto");
    expect(layerOfNum(IMPACTA_ORDER.conectar)).toBe<ImpactLayer>("impacto");
  });

  it("classifica transformacao em Transformar e esteira em Amplificar", () => {
    expect(layerOfNum(IMPACTA_ORDER.transformar)).toBe<ImpactLayer>(
      "transformacao"
    );
    expect(layerOfNum(IMPACTA_ORDER.amplificar)).toBe<ImpactLayer>("esteira");
  });

  it("cobre todos os niveis 1..7 sem lacunas", () => {
    const seen = new Set<ImpactLayer>();
    for (let n = 1; n <= 7; n++) seen.add(layerOfNum(n));
    expect(seen).toEqual(
      new Set<ImpactLayer>([
        "exposicao",
        "impacto",
        "transformacao",
        "esteira",
      ])
    );
  });

  it("REGRESSAO: retorna QUATRO camadas distintas apesar do comentario 'tres camadas'", () => {
    // Documenta a divergencia entre a doc ('As tres camadas') e o tipo ImpactLayer,
    // que possui quatro variantes. Ver revisao adversarial (severidade ALTA).
    const distinct = new Set<ImpactLayer>();
    for (let n = 1; n <= 7; n++) distinct.add(layerOfNum(n));
    expect(distinct.size).toBe(4);
  });

  it("valores fora de 1..7 caem em exposicao (baixo) ou esteira (alto) sem erro", () => {
    expect(layerOfNum(0)).toBe<ImpactLayer>("exposicao");
    expect(layerOfNum(-5)).toBe<ImpactLayer>("exposicao");
    expect(layerOfNum(8)).toBe<ImpactLayer>("esteira");
    expect(layerOfNum(999)).toBe<ImpactLayer>("esteira");
  });
});

// ---------------------------------------------------------------------------
// De-para de sinais e pilares legados
// ---------------------------------------------------------------------------

describe("signalToLevelNum", () => {
  it("mapeia cada sinal conhecido para o nivel numerico correto", () => {
    for (const [signal, level] of Object.entries(SIGNAL_TO_LEVEL)) {
      expect(signalToLevelNum(signal)).toBe(
        IMPACTA_ORDER[level as ImpactaLevel]
      );
    }
  });

  it("retorna null para sinal desconhecido", () => {
    expect(signalToLevelNum("nonexistent")).toBeNull();
    expect(signalToLevelNum("")).toBeNull();
  });

  it("mapeia sinais de exposicao abaixo do limiar", () => {
    expect(signalToLevelNum("view")).toBeLessThan(IMPACT_THRESHOLD_LEVEL);
    expect(signalToLevelNum("click")).toBeLessThan(IMPACT_THRESHOLD_LEVEL);
  });

  it("mapeia first_interaction exatamente no limiar (Preparar)", () => {
    expect(signalToLevelNum("first_interaction")).toBe(IMPACT_THRESHOLD_LEVEL);
  });
});

describe("mapLegacyPillar (de-para SET7 -> IVE)", () => {
  it("mapeia cada pilar legado para o passo IVE esperado", () => {
    expect(mapLegacyPillar("diagnostico")).toBe("origem");
    expect(mapLegacyPillar("estrategia")).toBe("ideacao");
    expect(mapLegacyPillar("engajamento")).toBe("validacao");
    expect(mapLegacyPillar("execucao")).toBe("prototipacao");
    expect(mapLegacyPillar("escala")).toBe("escala");
  });

  it("colapsa medicao e aprendizado em operacao (colisao documentada)", () => {
    expect(mapLegacyPillar("medicao")).toBe("operacao");
    expect(mapLegacyPillar("aprendizado")).toBe("operacao");
  });

  it("nunca alcanca produtizacao pelo de-para legado (execucao vira prototipacao)", () => {
    const targets = new Set(Object.values(LEGACY_PILLAR_TO_IVE));
    expect(targets.has("prototipacao")).toBe(true);
    expect(targets.has("produtizacao")).toBe(false);
  });

  it("retorna null para pilar desconhecido", () => {
    expect(mapLegacyPillar("marketing")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Contagem de unicos por metodo do maximo
// ---------------------------------------------------------------------------

describe("uniquesByMax (contagem de unicos pelo nivel maximo)", () => {
  it("conta cada usuario uma unica vez, pelo seu nivel maximo atingido", () => {
    const events: EngagementEvent[] = [
      { userId: "u1", signal: "view", ts: 1 }, // 1
      { userId: "u1", signal: "action_completed", ts: 2 }, // 4
      { userId: "u1", signal: "click", ts: 3 }, // 2 (nao rebaixa)
      { userId: "u2", signal: "dwell", ts: 4 }, // 2
      { userId: "u3", signal: "referral", ts: 5 }, // 7
    ];
    const cum = uniquesByMax(events);
    // 3 usuarios com max >= 1
    expect(cum.get(1)).toBe(3);
    // u1(4), u3(7) tem max >= 3 (limiar de impacto)
    expect(cum.get(IMPACT_THRESHOLD_LEVEL)).toBe(2);
    // somente u3 alcanca amplificar
    expect(cum.get(7)).toBe(1);
  });

  it("ignora sinais desconhecidos sem contar o usuario", () => {
    const events: EngagementEvent[] = [
      { userId: "u9", signal: "unknown_signal", ts: 10 },
    ];
    const cum = uniquesByMax(events);
    expect(cum.get(1)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Janela de uso
// ---------------------------------------------------------------------------

describe("withinWindow (janela de uso, Unix ms inclusivo)", () => {
  const events: EngagementEvent[] = [
    { userId: "a", signal: "view", ts: 1000 },
    { userId: "b", signal: "click", ts: 2000 },
    { userId: "c", signal: "referral", ts: 3000 },
  ];

  it("inclui os limites da janela", () => {
    const win = withinWindow(events, 1000, 3000);
    expect(win).toHaveLength(3);
  });

  it("exclui eventos fora do intervalo", () => {
    const win = withinWindow(events, 1500, 2500);
    expect(win.map((e) => e.userId)).toEqual(["b"]);
  });

  it("retorna vazio quando a janela nao intersecta nenhum evento", () => {
    expect(withinWindow(events, 5000, 6000)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// S-ROI e sensibilidade
// ---------------------------------------------------------------------------

describe("sroiBps (S-ROI em basis points, dinheiro em centavos)", () => {
  it("calcula beneficio/custo em bps", () => {
    // 300000 centavos de beneficio, 100000 de custo => 3x => 30000 bps
    expect(sroiBps(300000, 100000)).toBe(30000);
  });

  it("retorna 10000 bps (1x) no ponto de equilibrio", () => {
    expect(sroiBps(50000, 50000)).toBe(10000);
  });

  it("retorna null para custo zero ou negativo (evita divisao invalida)", () => {
    expect(sroiBps(100000, 0)).toBeNull();
    expect(sroiBps(100000, -1)).toBeNull();
  });
});

describe("sroiSensitivityBps (sensibilidade do S-ROI)", () => {
  it("propaga linearmente uma variacao do beneficio para o S-ROI", () => {
    // +10% no beneficio (1000 bps) => +10% no S-ROI (1000 bps)
    expect(sroiSensitivityBps(200000, 100000, 1000)).toBe(1000);
  });

  it("retorna null quando o custo torna o S-ROI base invalido", () => {
    expect(sroiSensitivityBps(200000, 0, 1000)).toBeNull();
  });
});
