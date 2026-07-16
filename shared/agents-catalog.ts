// shared/agents-catalog.ts
// Impact7 · Sprint 9 · as fichas dos agentes especialistas por fase, no padrao do Catalogo,
// com o campo obrigatorio modoSocialExpand, como cada capacidade opera quando e doada, nao vendida.
import { IveStage } from "./ive-mapping";

export type AgentMode = "autopilot" | "copilot";
export type ModelTier = "barato" | "escalonado" | "premium";

export interface AgentFicha {
  id: string;
  name: string;
  stage: IveStage | "conductor";
  mission: string;
  mode: AgentMode;
  modelTier: ModelTier;
  modoSocialExpand: string;
}

export const AGENTS_CATALOG: AgentFicha[] = [
  { id: "conductor", name: "Impact7 Conductor AI", stage: "conductor",
    mission: "Recebe a iniciativa, sabe em que estagio ela esta e aciona o especialista certo.",
    mode: "copilot", modelTier: "escalonado",
    modoSocialExpand: "Conduz o beneficiario doado pela jornada, sem custo comercial." },
  { id: "purpose", name: "Purpose Diagnosis AI", stage: "origem",
    mission: "Roda o Raio-X de Impacto e a linha de base de S-ROI, e decide rota comercial ou social.",
    mode: "autopilot", modelTier: "barato",
    modoSocialExpand: "Diagnostica de graca o pequeno empreendedor no ambiente doado." },
  { id: "ideation", name: "Ideation Architect AI", stage: "ideacao",
    mission: "Transforma a lacuna em tese de impacto com canvas de restricoes.",
    mode: "copilot", modelTier: "escalonado",
    modoSocialExpand: "Ideacao guiada e gratuita no ambiente doado." },
  { id: "validation", name: "Validation Evidence AI", stage: "validacao",
    mission: "Testa a tese contra mercado, dados e beneficiarios, e define os marcos.",
    mode: "copilot", modelTier: "barato",
    modoSocialExpand: "Valida a ideia do empreendedor social com dados publicos." },
  { id: "prototype", name: "Prototype Builder AI", stage: "prototipacao",
    mission: "Monta o MVP funcional do ativo.",
    mode: "autopilot", modelTier: "barato",
    modoSocialExpand: "Entrega a versao white label doada, ja instrumentada para medir engajamento." },
  { id: "productize", name: "Productization AI", stage: "produtizacao",
    mission: "Braco vivo da Fabrica de Metodo, empacota, precifica e padroniza para reproduzir.",
    mode: "copilot", modelTier: "escalonado",
    modoSocialExpand: "Padroniza o ativo doado para replicacao pelas aliancas." },
  { id: "operations", name: "Operations Excellence AI", stage: "operacao",
    mission: "Governa o painel S-ROI, o sucesso do cliente e o eixo do 10x.",
    mode: "autopilot", modelTier: "barato",
    modoSocialExpand: "Acompanha o engajamento do beneficiario e o rating de impacto." },
  { id: "scale", name: "Scale & Capital AI", stage: "escala",
    mission: "Conecta na Bifurcacao de Capital e conduz investimento, M&A, white label e expansao.",
    mode: "copilot", modelTier: "premium",
    modoSocialExpand: "Roteia o ativo para novas aliancas de doacao e mede o alcance ampliado." },
];

export function agentForStage(stage: IveStage): AgentFicha | undefined {
  return AGENTS_CATALOG.find((a) => a.stage === stage);
}
