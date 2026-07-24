// server/routers/registry.test.ts
// Impact7 · correcao do achado A.1 do BACKLOG_Plataforma_Auditoria_14_Processos.
//
// Antes: initiativeSroi era publicProcedure com tenantId aceito como campo livre do input.
// Este arquivo trava o contrato novo: a procedure exige sessao (protectedProcedure) e o
// tenantId usado pelo service e sempre o resolvido a partir de ctx.user via
// resolveTenantForUser — nunca um valor vindo do input do chamador.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "../_core/context";

const { initiativeSroiMock, ecosystemPlacarMock } = vi.hoisted(() => ({
  initiativeSroiMock: vi.fn(async () => ({ sroi: 0.5, gatilhos: 1, transformacoes: 0 })),
  ecosystemPlacarMock: vi.fn(async () => ({
    alcanceUnico: 1,
    gatilhosUnicos: 1,
    impacto: 1,
    transformacao: 0,
    esteira: 0,
  })),
}));

vi.mock("../services/impact/registry-service", () => ({
  initiativeSroi: initiativeSroiMock,
  ecosystemPlacar: ecosystemPlacarMock,
}));

const { resolveTenantForUserMock } = vi.hoisted(() => ({
  resolveTenantForUserMock: vi.fn(),
}));

vi.mock("../services/tenancy/tenant-context", () => ({
  resolveTenantForUser: resolveTenantForUserMock,
}));

import { appRouter } from "../routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn(), cookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserCtx(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    name: "Operador da Alianca X",
    email: "operador@alianca-x.org",
    role: "user",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastSignedIn: Date.now(),
    ...overrides,
  } as AuthenticatedUser;
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn(), cookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  return createUserCtx({ id: 99, email: "admin@impact7.com", role: "admin" });
}

beforeEach(() => {
  initiativeSroiMock.mockClear();
  ecosystemPlacarMock.mockClear();
  resolveTenantForUserMock.mockReset();
});

describe("registryRouter · achado A.1, sessao obrigatoria e tenantId nunca do input", () => {
  it("initiativeSroi rejeita chamador sem sessao (antes: publicProcedure)", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.registry.initiativeSroi({ initiativeId: 1 } as any),
    ).rejects.toThrow(TRPCError);
    expect(initiativeSroiMock).not.toHaveBeenCalled();
  });

  it("initiativeSroi usa o tenantId resolvido da sessao, ignorando qualquer tenantId injetado no input bruto", async () => {
    resolveTenantForUserMock.mockResolvedValue({ tenantId: 11, mode: "comercial" });
    const ctx = createUserCtx({ id: 5 });
    const caller = appRouter.createCaller(ctx);

    // Tentativa de IDOR: forcar tenantId de outra organizacao no payload bruto.
    await caller.registry.initiativeSroi({
      initiativeId: 1,
      actor: "italo",
      tenantId: 4242,
    } as any);

    expect(resolveTenantForUserMock).toHaveBeenCalledWith(ctx.user);
    expect(initiativeSroiMock).toHaveBeenCalledTimes(1);
    const [initiativeId, tenantId, actor] = initiativeSroiMock.mock.calls[0];
    expect(tenantId).toBe(11); // veio da sessao, nao do input malicioso (4242)
    expect(initiativeId).toBe(1);
    expect(actor).toBe("italo");
  });

  it("usuario autenticado mas sem tenant vinculado e rejeitado, nunca cai num tenant default", async () => {
    resolveTenantForUserMock.mockRejectedValue(new Error("Usuario sem tenant associado"));
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.registry.initiativeSroi({ initiativeId: 1 } as any),
    ).rejects.toThrow("Usuario sem tenant associado");
    expect(initiativeSroiMock).not.toHaveBeenCalled();
  });

  it("ecosystemPlacar (cross-tenant por design) continua exigindo admin, nao muda com esta correcao", async () => {
    const publicCaller = appRouter.createCaller(createPublicCtx());
    await expect(publicCaller.registry.ecosystemPlacar()).rejects.toThrow(TRPCError);

    const userCaller = appRouter.createCaller(createUserCtx());
    await expect(userCaller.registry.ecosystemPlacar()).rejects.toThrow(TRPCError);

    const adminCaller = appRouter.createCaller(createAdminCtx());
    await expect(adminCaller.registry.ecosystemPlacar()).resolves.toBeDefined();
  });
});
