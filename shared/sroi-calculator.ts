// shared/sroi-calculator.ts
// Impact7 · Sprint Groq/Aliados · a formula do S-ROI auditavel extraida como funcao pura,
// compartilhada entre o motor de mensuracao real (registry-service.ts, dado de banco, com
// tenant e trilha de auditoria) e o simulador ilustrativo dos agentes conversacionais
// (ally-chat-service.ts, dado hipotetico, sem tocar em banco nem em iniciativa real).
//
// Extraida em vez de duplicada de proposito: a mesma divergencia que ja aconteceu uma vez
// neste projeto entre codigo e livros (achado da auditoria de consistencia, R41) nao pode
// se repetir agora entre "o calculo real" e "o calculo que o agente de IA explica pro
// aliado". Uma unica formula, dois consumidores.

export type SroiInputs = {
  gatilhos: number;
  transformacoes: number;
  valorGatilhoCents: number;
  valorTransformacaoCents: number;
  atribuicaoBps: number;
  deadweightBps?: number; // default 0, achado 2.2/2.6, Opcao A
  dropOffBps?: number;    // default 0, achado 2.2/2.6, Opcao A
  custoImtsCents: number;
};

export type SroiMemoria = {
  gatilhos: number;
  transformacoes: number;
  valorGatilho: number;
  valorTransformacao: number;
  atribuicao: number;
  deadweight: number;
  dropOff: number;
  fatorDesconto: number;
  custo: number;
  valorSocialBruto: number;
  valorSocial: number;
  sroi: number;
  alavancagem: number;
  sensibilidade: { sroiLow: number; sroiHigh: number };
};

// Formula honesta do S-ROI: valor social bruto (gatilhos e transformacoes vezes os proxies
// de valor) descontado por tres fatores compostos multiplicativamente (atribuicao, deadweight
// e drop-off), dividido pelo custo fixo da IMTS. A esteira (nivel Amplificar) NUNCA entra
// aqui — e projecao, contada em separado, nunca somada ao numero auditado (achado R41).
export function calcSroi(inputs: SroiInputs): SroiMemoria {
  const {
    gatilhos, transformacoes,
    valorGatilhoCents, valorTransformacaoCents,
    atribuicaoBps, custoImtsCents,
  } = inputs;
  const deadweightBps = inputs.deadweightBps ?? 0;
  const dropOffBps = inputs.dropOffBps ?? 0;

  const atribuicao = atribuicaoBps / 10000;
  const deadweight = deadweightBps / 10000;
  const dropOff = dropOffBps / 10000;
  const fatorDesconto = atribuicao * (1 - deadweight) * (1 - dropOff);
  const valorGatilho = valorGatilhoCents / 100;
  const valorTransformacao = valorTransformacaoCents / 100;
  const custo = custoImtsCents / 100;

  const valorSocialBruto = gatilhos * valorGatilho + transformacoes * valorTransformacao;
  const valorSocial = valorSocialBruto * fatorDesconto;
  const sroi = custo > 0 ? valorSocial / custo : 0;
  const alavancagem = custo > 0 ? gatilhos / custo : 0;

  const sroiLow = custo > 0 ? ((gatilhos * valorGatilho + transformacoes * valorTransformacao * 0.7) * fatorDesconto) / custo : 0;
  const sroiHigh = custo > 0 ? ((gatilhos * valorGatilho + transformacoes * valorTransformacao * 1.3) * fatorDesconto) / custo : 0;

  return {
    gatilhos, transformacoes,
    valorGatilho, valorTransformacao, atribuicao, deadweight, dropOff, fatorDesconto, custo,
    valorSocialBruto, valorSocial, sroi, alavancagem, sensibilidade: { sroiLow, sroiHigh },
  };
}
