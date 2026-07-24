import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { calcSroi } from "../shared/sroi-calculator";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Caso de referencia, calculado a mao com a mesma formula honesta de
// shared/sroi-calculator.ts (calcSroi), no estilo dos testes de
// server/services/impact/registry-service.test.ts.
//
// gatilhos=200, transformacoes=40, valorGatilho=R$150, valorTransformacao=R$1.200,
// atribuicao=60%, deadweight=10%, dropOff=5%, custoIMTS=R$20.000
//
// valorSocialBruto = 200*150 + 40*1200 = 30.000 + 48.000 = 78.000
// fatorDesconto = 0.60 * (1-0.10) * (1-0.05) = 0.513
// valorSocial = 78.000 * 0.513 = 40.014
// sroi = 40.014 / 20.000 = 2.0007 -> 2.00x
// alavancagem = 200 / 20.000 = 0.01
describe("calculator.calculate", () => {
  it("calcula o S-ROI honesto usando calcSroi (shared/sroi-calculator.ts)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.calculator.calculate({
      gatilhos: 200,
      transformacoes: 40,
      valorGatilhoReais: 150,
      valorTransformacaoReais: 1200,
      atribuicaoPercent: 60,
      deadweightPercent: 10,
      dropOffPercent: 5,
      custoImtsReais: 20000,
    });

    expect(result.gatilhos).toBe(200);
    expect(result.transformacoes).toBe(40);
    expect(result.valorSocialBruto).toBeCloseTo(78000, 2);
    expect(result.fatorDesconto).toBeCloseTo(0.513, 4);
    expect(result.valorSocial).toBeCloseTo(40014, 2);
    expect(result.sroi).toBeCloseTo(2.0, 2);
    expect(result.alavancagem).toBeCloseTo(0.01, 4);
    // achado A.6: alavancagem sempre como faixa (atribuicao 60% +-10pp -> 50%/70%)
    expect(result.alavancagemLow).toBeCloseTo(0.005, 4);
    expect(result.alavancagemHigh).toBeCloseTo(0.007, 4);
    // achado A.6: sensibilidade combina variacao de atribuicao (50%/70%) e de transformacao
    // (*0.7/*1.3), pegando o minimo/maximo entre os quatro cenarios
    expect(result.sensibilidade.sroiLow).toBeCloseTo(1.36, 2);
    expect(result.sensibilidade.sroiHigh).toBeCloseTo(2.77, 2);
    expect(result.illustrative).toBe(true);
  });

  it("matches the pure calcSroi function directly (same shared formula as jarvisSkills.calculator)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      gatilhos: 50,
      transformacoes: 10,
      valorGatilhoReais: 80,
      valorTransformacaoReais: 900,
      atribuicaoPercent: 70,
      custoImtsReais: 5000,
    };

    const result = await caller.calculator.calculate(input);

    const expected = calcSroi({
      gatilhos: input.gatilhos,
      transformacoes: input.transformacoes,
      valorGatilhoCents: Math.round(input.valorGatilhoReais * 100),
      valorTransformacaoCents: Math.round(input.valorTransformacaoReais * 100),
      atribuicaoBps: Math.round(input.atribuicaoPercent * 100),
      custoImtsCents: Math.round(input.custoImtsReais * 100),
    });

    expect(result.sroi).toBeCloseTo(expected.sroi, 2);
    expect(result.valorSocial).toBeCloseTo(expected.valorSocial, 2);
    expect(result.alavancagem).toBeCloseTo(expected.alavancagem, 4);
    expect(result.alavancagemLow).toBeCloseTo(expected.alavancagemLow, 4);
    expect(result.alavancagemHigh).toBeCloseTo(expected.alavancagemHigh, 4);
  });

  it("defaults deadweight and drop-off to zero when omitted", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.calculator.calculate({
      gatilhos: 100,
      transformacoes: 0,
      valorGatilhoReais: 100,
      valorTransformacaoReais: 0,
      atribuicaoPercent: 100,
      custoImtsReais: 10000,
    });

    // valorSocialBruto = 100*100 = 10.000; fatorDesconto = 1 * 1 * 1 = 1
    // valorSocial = 10.000; sroi = 10.000 / 10.000 = 1.00x
    expect(result.fatorDesconto).toBeCloseTo(1, 4);
    expect(result.valorSocialBruto).toBeCloseTo(10000, 2);
    expect(result.sroi).toBeCloseTo(1.0, 2);
  });

  it("rejects negative gatilhos/transformacoes and non-positive custoImtsReais", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.calculator.calculate({
        gatilhos: -1,
        transformacoes: 0,
        valorGatilhoReais: 10,
        valorTransformacaoReais: 10,
        atribuicaoPercent: 50,
        custoImtsReais: 1000,
      })
    ).rejects.toThrow();

    await expect(
      caller.calculator.calculate({
        gatilhos: 10,
        transformacoes: 0,
        valorGatilhoReais: 10,
        valorTransformacaoReais: 10,
        atribuicaoPercent: 50,
        custoImtsReais: 0,
      })
    ).rejects.toThrow();
  });

  it("never claims to be an audited result (illustrative flag is always true)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.calculator.calculate({
      gatilhos: 10,
      transformacoes: 2,
      valorGatilhoReais: 50,
      valorTransformacaoReais: 500,
      atribuicaoPercent: 80,
      custoImtsReais: 1000,
    });

    expect(result.illustrative).toBe(true);
  });

  it("exportPdf accepts the calculate result shape and returns a PDF data URI", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const calc = await caller.calculator.calculate({
      gatilhos: 20,
      transformacoes: 5,
      valorGatilhoReais: 100,
      valorTransformacaoReais: 1000,
      atribuicaoPercent: 50,
      custoImtsReais: 2000,
    });

    const { pdfDataUri } = await caller.calculator.exportPdf({
      gatilhos: calc.gatilhos,
      transformacoes: calc.transformacoes,
      valorSocialBruto: calc.valorSocialBruto,
      fatorDesconto: calc.fatorDesconto,
      valorSocial: calc.valorSocial,
      custo: calc.custo,
      sroi: calc.sroi,
      alavancagem: calc.alavancagem,
      alavancagemLow: calc.alavancagemLow,
      alavancagemHigh: calc.alavancagemHigh,
      sensibilidade: calc.sensibilidade,
      language: "pt",
    });

    expect(pdfDataUri).toMatch(/^data:application\/pdf/);
  });
});

describe("leads.create", () => {
  it("validates required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should throw for invalid email
    await expect(
      caller.leads.create({
        name: "Test User",
        email: "invalid-email",
      })
    ).rejects.toThrow();

    // Should throw for short name
    await expect(
      caller.leads.create({
        name: "A",
        email: "test@example.com",
      })
    ).rejects.toThrow();
  });
});

describe("contacts.create", () => {
  it("validates message length", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should throw for short message
    await expect(
      caller.contacts.create({
        name: "Test User",
        email: "test@example.com",
        message: "Hi",
      })
    ).rejects.toThrow();
  });
});

describe("newsletter.subscribe", () => {
  it("validates email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.newsletter.subscribe({
        email: "not-an-email",
      })
    ).rejects.toThrow();
  });
});
