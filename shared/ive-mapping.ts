// shared/ive-mapping.ts
// Impact7 · Sprint 7
// Modelo canonico do Funil IVE, dos niveis IMPACTA e do de-para com os pilares SET7 legados.
// Convencoes do repositorio: timestamps em number (Unix ms), booleanos em number 0/1.

export const IVE_STAGES = [
  "origem",       // D0
  "ideacao",
  "validacao",
  "prototipacao",
  "produtizacao",
  "operacao",
  "escala",
] as const;
export type IveStage = (typeof IVE_STAGES)[number];

// Niveis do Funil IMPACTA, em ordem crescente de profundidade.
export const IMPACTA_ORDER = {
  informar: 1,   // exposicao
  motivar: 2,    // exposicao
  preparar: 3,   // LIMIAR DE IMPACTO
  ativar: 4,
  conectar: 5,
  transformar: 6,
  amplificar: 7,
} as const;
export type ImpactaLevel = keyof typeof IMPACTA_ORDER;

// O limiar de impacto fica na entrada do nivel Preparar. Abaixo e exposicao.
export const IMPACT_THRESHOLD_LEVEL = IMPACTA_ORDER.preparar; // 3

// Exposicao e o alcance abaixo do limiar, nao conta como impacto.
// Acima do limiar ficam as tres camadas de impacto: impacto (gatilho),
// transformacao (subconjunto medido) e esteira (projecao exponencial).
export type ImpactLayer = "exposicao" | "impacto" | "transformacao" | "esteira";

export function layerOfNum(n: number): ImpactLayer {
  if (n < IMPACT_THRESHOLD_LEVEL) return "exposicao";
  if (n <= IMPACTA_ORDER.conectar) return "impacto";        // preparar..conectar
  if (n === IMPACTA_ORDER.transformar) return "transformacao";
  return "esteira";                                          // amplificar
}
export function countsAsImpactNum(n: number): boolean {
  return n >= IMPACT_THRESHOLD_LEVEL;
}

// De-para dos sete pilares SET7 legados para os sete passos do IVE.
// O pilar Execucao se desdobra em Prototipacao e Produtizacao; o padrao de-para e Prototipacao.
export const LEGACY_PILLAR_TO_IVE: Record<string, IveStage> = {
  diagnostico: "origem",
  estrategia: "ideacao",
  engajamento: "validacao",
  execucao: "prototipacao",
  medicao: "operacao",
  aprendizado: "operacao",
  escala: "escala",
};
export function mapLegacyPillar(pillarId: string): IveStage | null {
  return LEGACY_PILLAR_TO_IVE[pillarId] ?? null;
}

// Mapeia um sinal de engajamento cru para o nivel IMPACTA correspondente.
export const SIGNAL_TO_LEVEL: Record<string, ImpactaLevel> = {
  view: "informar",
  dwell: "motivar",
  click: "motivar",
  first_interaction: "preparar",
  lesson_started: "preparar",
  action_completed: "ativar",
  task_done: "ativar",
  peer_interaction: "conectar",
  community_join: "conectar",
  sustained_outcome: "transformar",
  referral: "amplificar",
  created_content: "amplificar",
};
export function signalToLevelNum(signal: string): number | null {
  const lvl = SIGNAL_TO_LEVEL[signal];
  return lvl ? IMPACTA_ORDER[lvl] : null;
}
