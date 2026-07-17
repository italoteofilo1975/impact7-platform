// server/services/tenancy/tenant-context.test.ts
// Impact7 · Sprint 10 · testes do modulo tenancy.
//
// Cobre a logica que este modulo possui de fato: resolveTenant, scoped, windowSecondsForMode
// e, desde a rodada de isolamento multi-tenant (achado 1.6/1.7/1.9 da revisao ampla),
// assertInitiativeTenant — a barreira que agora e chamada de verdade pelo engagement-service
// e pelo registry-service para impedir ler/escrever dado de iniciativa de outro tenant.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { eq, and } from "drizzle-orm";
import { tenants } from "../../../drizzle/schema.tenants";

// db e mockado; schema.tenants e puro (so define a tabela) e usamos o real.
const { whereMock } = vi.hoisted(() => ({ whereMock: vi.fn() }));
vi.mock("../../db", () => ({
  getDb: async () => ({
    select: () => ({
      from: () => ({ where: whereMock }),
    }),
  }),
}));

import { resolveTenant, scoped, windowSecondsForMode, assertInitiativeTenant, type TenantContext } from "./tenant-context";

beforeEach(() => {
  whereMock.mockReset();
});

describe("resolveTenant", () => {
  it("rejeita requisicao sem tenantId", async () => {
    await expect(resolveTenant({})).rejects.toThrow("Requisicao sem tenant");
    expect(whereMock).not.toHaveBeenCalled();
  });

  it("rejeita tenantId igual a zero como falsy (comportamento atual)", async () => {
    // Guard usa !key.tenantId, entao 0 e tratado como ausente. Documenta a borda.
    await expect(resolveTenant({ tenantId: 0 })).rejects.toThrow("Requisicao sem tenant");
  });

  it("rejeita quando o tenant nao existe no banco", async () => {
    whereMock.mockResolvedValue([]);
    await expect(resolveTenant({ tenantId: 42 })).rejects.toThrow("Tenant nao encontrado");
  });

  it("resolve modo comercial", async () => {
    whereMock.mockResolvedValue([
      { id: 7, name: "Franquia X", type: "franquia", mode: "comercial", brandTheme: null, sponsorId: null, createdAt: 1 },
    ]);
    const ctx = await resolveTenant({ tenantId: 7 });
    expect(ctx).toEqual<TenantContext>({ tenantId: 7, mode: "comercial" });
  });

  it("resolve modo social", async () => {
    whereMock.mockResolvedValue([
      { id: 3, name: "Instituto Y", type: "instituto", mode: "social", brandTheme: "wl-verde", sponsorId: 9, createdAt: 1 },
    ]);
    const ctx = await resolveTenant({ tenantId: 3 });
    expect(ctx).toEqual<TenantContext>({ tenantId: 3, mode: "social" });
  });

  it("colapsa qualquer modo invalido para social (fail-safe silencioso)", async () => {
    // Ex.: dado corrompido "comerical". O codigo faz t.mode === 'comercial' ? 'comercial' : 'social',
    // logo qualquer valor diferente de 'comercial' vira 'social'. Testa esse mascaramento.
    whereMock.mockResolvedValue([
      { id: 5, name: "Z", type: "alianca", mode: "comerical", brandTheme: null, sponsorId: null, createdAt: 1 },
    ]);
    const ctx = await resolveTenant({ tenantId: 5 });
    expect(ctx.mode).toBe("social");
  });
});

describe("scoped", () => {
  it("gera condicao base de escopo por tenant quando nao ha extra", () => {
    const ctx: TenantContext = { tenantId: 11, mode: "social" };
    const sql = scoped(tenants.id, ctx);
    const expected = eq(tenants.id, 11);
    expect(sql).toBeDefined();
    // Compara a estrutura serializavel do SQL builder do drizzle.
    expect(sql).toBeDefined();
    expect((sql as any).queryChunks?.length).toBe((expected as any).queryChunks?.length);
  });

  it("combina o escopo com a condicao extra via AND", () => {
    const ctx: TenantContext = { tenantId: 11, mode: "comercial" };
    const extra = eq(tenants.name, "abc");
    const sql = scoped(tenants.id, ctx, extra);
    const expected = and(eq(tenants.id, 11), extra);
    expect(sql).toBeDefined();
    expect((sql as any).queryChunks?.length).toBe((expected as any).queryChunks?.length);
  });

  it("o escopo com e sem extra produz SQL diferente", () => {
    const ctx: TenantContext = { tenantId: 1, mode: "social" };
    const base = scoped(tenants.id, ctx);
    const comExtra = scoped(tenants.id, ctx, eq(tenants.name, "abc"));
    expect((base as any).queryChunks?.length).not.toBe((comExtra as any).queryChunks?.length);
  });
});

describe("assertInitiativeTenant (achado 1.6/1.7/1.9 da revisao ampla)", () => {
  // Fecha a lacuna que a nota de escopo acima registrava: agora este arquivo existe de fato
  // sendo chamado em producao (engagement-service, registry-service), entao a barreira que
  // impede ler/escrever dado de uma iniciativa de outro tenant precisa estar coberta aqui.
  it("rejeita quando a iniciativa nao existe", async () => {
    whereMock.mockResolvedValue([]);
    await expect(assertInitiativeTenant(999, 1)).rejects.toThrow("Iniciativa nao encontrada");
  });

  it("rejeita quando a iniciativa pertence a outro tenant, mesmo com o id certo", async () => {
    whereMock.mockResolvedValue([{ tenantId: 2 }]);
    await expect(assertInitiativeTenant(1, 1)).rejects.toThrow("Iniciativa nao pertence a este tenant");
  });

  it("resolve e devolve o tenantId real quando a posse confere", async () => {
    whereMock.mockResolvedValue([{ tenantId: 5 }]);
    await expect(assertInitiativeTenant(1, 5)).resolves.toBe(5);
  });
});

describe("windowSecondsForMode (janela de uso)", () => {
  it("modo social tem janela de duas horas em segundos", () => {
    expect(windowSecondsForMode("social")).toBe(2 * 60 * 60);
    expect(windowSecondsForMode("social")).toBe(7200);
  });

  it("modo comercial nao tem janela (null)", () => {
    expect(windowSecondsForMode("comercial")).toBeNull();
  });

  it("a janela social e estritamente positiva e a comercial e ausente", () => {
    const social = windowSecondsForMode("social");
    const comercial = windowSecondsForMode("comercial");
    expect(social).not.toBeNull();
    expect(social as number).toBeGreaterThan(0);
    expect(comercial).toBeNull();
  });
});
