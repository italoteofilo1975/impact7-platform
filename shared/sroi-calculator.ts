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
  // achado A.6 do BACKLOG_Plataforma_Auditoria_14_Processos.md: os livros exigem, em duas
  // passagens distintas, que a alavancagem seja "sempre reportada como faixa, nunca como
  // ponto unico". alavancagem (gatilhos/custo) e mantido intacto para compatibilidade
  // retroativa; alavancagemLow/High adicionam a faixa conservador/agressivo, variando a
  // fracao de gatilhos honestamente atribuivel a iniciativa (mesma logica de atribuicao
  // usada no S-ROI) em vez de tratar todo gatilho registrado como certamente causado por ela.
  alavancagemLow: number;
  alavancagemHigh: number;
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

  // Achado A.6: a analise de sensibilidade original variava apenas o valor da
  // transformacao em +-30%, mantendo fatorDesconto (atribuicao/deadweight/dropOff)
  // identico nos dois cenarios — o Livro da Metodologia exige recalcular ao menos as tres
  // variaveis mais incertas, incluindo atribuicao, com faixas conservador/agressivo.
  // Variamos atribuicao em +-10 pontos percentuais (clampado em [0,1]), mantendo
  // deadweight e dropOff fixos (nao sao, neste achado, as variaveis mais incertas
  // apontadas), e combinamos essa incerteza com a variacao de transformacao ja existente
  // pegando o minimo/maximo entre os quatro cenarios (atribuicao baixa/alta x
  // transformacao -30%/+30%) — a forma mais conservadora de reportar a faixa.
  const atribuicaoLow = Math.max(0, atribuicao - 0.10);
  const atribuicaoHigh = Math.min(1, atribuicao + 0.10);
  const fatorDescontoLow = atribuicaoLow * (1 - deadweight) * (1 - dropOff);
  const fatorDescontoHigh = atribuicaoHigh * (1 - deadweight) * (1 - dropOff);

  const valorSocialBrutoTransfLow = gatilhos * valorGatilho + transformacoes * valorTransformacao * 0.7;
  const valorSocialBrutoTransfHigh = gatilhos * valorGatilho + transformacoes * valorTransformacao * 1.3;

  const cenariosValorSocial = [
    valorSocialBrutoTransfLow * fatorDescontoLow,
    valorSocialBrutoTransfLow * fatorDescontoHigh,
    valorSocialBrutoTransfHigh * fatorDescontoLow,
    valorSocialBrutoTransfHigh * fatorDescontoHigh,
  ];
  const sroiLow = custo > 0 ? Math.min(...cenariosValorSocial) / custo : 0;
  const sroiHigh = custo > 0 ? Math.max(...cenariosValorSocial) / custo : 0;

  // Alavancagem como faixa: gatilhos honestamente atribuiveis (conservador/agressivo) por
  // real de custo fixo, em vez do ponto unico gatilhos/custo que ignora a incerteza de
  // atribuicao.
  const alavancagemLow = custo > 0 ? (gatilhos * atribuicaoLow) / custo : 0;
  const alavancagemHigh = custo > 0 ? (gatilhos * atribuicaoHigh) / custo : 0;

  return {
    gatilhos, transformacoes,
    valorGatilho, valorTransformacao, atribuicao, deadweight, dropOff, fatorDesconto, custo,
    valorSocialBruto, valorSocial, sroi, alavancagem, alavancagemLow, alavancagemHigh,
    sensibilidade: { sroiLow, sroiHigh },
  };
}
