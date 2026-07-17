// server/services/impact/registry-service.ts
// Impact7 · Sprint 8 · o motor de mensuracao. Consolida o placar do ecossistema com deduplicacao
// global, calcula o S-ROI auditavel com memoria de calculo, e grava a trilha de auditoria.
import { getDb } from "../../db";
import { engagementEvents } from "../../../drizzle/schema.impact7";
import { initiativeParams, auditLog } from "../../../drizzle/schema.impact8";
import { eq } from "drizzle-orm";
import { layerOfNum } from "../../../shared/ive-mapping";
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

  const atribuicao = p.atribuicaoBps / 10000;
  // Achado 2.2/2.6 do RELATORIO_Consistencia (Opcao A do DECISOES_Pendentes item 1): o S-ROI
  // honesto tem tres descontos, nao um so. Deadweight (o que teria acontecido de qualquer jeito,
  // sem a iniciativa) e drop-off (perda de efeito ao longo do tempo) somam-se a atribuicao ja
  // existente. Default zero em ambos preserva todo numero ja calculado ate alguem preencher dado
  // real, exatamente como documentado no schema.
  const deadweight = (p.deadweightBps ?? 0) / 10000;
  const dropOff = (p.dropOffBps ?? 0) / 10000;
  const fatorDesconto = atribuicao * (1 - deadweight) * (1 - dropOff);
  const valorGatilho = p.valorGatilhoCents / 100;
  const valorTransformacao = p.valorTransformacaoCents / 100;
  const custo = p.custoImtsCents / 100;

  const valorSocialBruto = gatilhos * valorGatilho + transformacoes * valorTransformacao;
  const valorSocial = valorSocialBruto * fatorDesconto;
  const sroi = custo > 0 ? valorSocial / custo : 0;

  // Alavancagem, gatilhos por real de custo fixo investido pela IMTS. Metrica canonica citada no
  // glossario da memoria viva e no Livro da Metodologia, cap11, que ainda nao existia no codigo.
  const alavancagem = custo > 0 ? gatilhos / custo : 0;

  // Sensibilidade sobre a premissa mais fragil, o valor por transformacao, em mais ou menos 30%.
  const sroiLow = custo > 0 ? ((gatilhos * valorGatilho + transformacoes * valorTransformacao * 0.7) * fatorDesconto) / custo : 0;
  const sroiHigh = custo > 0 ? ((gatilhos * valorGatilho + transformacoes * valorTransformacao * 1.3) * fatorDesconto) / custo : 0;

  const memoria = {
    gatilhos, transformacoes, esteiraProjecao: esteira,
    valorGatilho, valorTransformacao, atribuicao, deadweight, dropOff, fatorDesconto, custo,
    valorSocialBruto, valorSocial, sroi, alavancagem, sensibilidade: { sroiLow, sroiHigh },
  };

  await db.insert(auditLog).values({
    actor, action: "compute_sroi", entity: "initiative", entityId: initiativeId,
    inputJson: JSON.stringify({ initiativeId }), resultJson: JSON.stringify(memoria), createdAt: now,
  });

  return memoria;
}
