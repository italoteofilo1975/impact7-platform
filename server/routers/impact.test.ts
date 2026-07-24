// server/routers/impact.test.ts
// Impact7 · correcao do achado A.1 do BACKLOG_Plataforma_Auditoria_14_Processos.
//
// Antes: recordEngagement/userRating/initiativeImpact eram publicProcedure com tenantId
// aceito como campo livre do input. Este arquivo trava o contrato novo: as tres procedures
// exigem sessao (protectedProcedure) e o tenantId usado pelo service e sempre o resolvido a
// partir de ctx.user via resolveTenantForUser — nunca um valor vindo do input do chamador.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "../_core/context";

const { recordEngagementMock, userRatingMock, initiativeImpactMock } = vi.hoisted(() => ({
  recordEngagementMock: vi.fn(async () => ({ level: 3, countsAsImpact: true })),
  userRatingMock: vi.fn(async () => ({ maxLevel: 3, layer: "impacto", countsAsImpact: true })),
  initiativeImpactMock: vi.fn(async () => ({
    alcanceUnico: 1,
    gatilhosUnicos: 1,
    impacto: 1,
    transformacao: 0,
    esteira: 0,
  })),
}));

vi.mock("../services/impact/engagement-service", () => ({
  recordEngagement: recordEngagementMock,
  userRating: userRatingMock,
  initiativeImpact: initiativeImpactMock,
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

beforeEach(() => {
  recordEngagementMock.mockClear();
  userRatingMock.mockClear();
  initiativeImpactMock.mockClear();
  resolveTenantForUserMock.mockReset();
});

describe("impactRouter · achado A.1, sessao obrigatoria e tenantId nunca do input", () => {
  it("recordEngagement rejeita chamador sem sessao (antes: publicProcedure)", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.impact.recordEngagement({
        identityKey: "id:a",
        initiativeId: 1,
        signal: "view",
      } as any),
    ).rejects.toThrow(TRPCError);
    expect(recordEngagementMock).not.toHaveBeenCalled();
  });

  it("userRating rejeita chamador sem sessao", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.impact.userRating({ identityKey: "id:a", initiativeId: 1 } as any),
    ).rejects.toThrow(TRPCError);
    expect(userRatingMock).not.toHaveBeenCalled();
  });

  it("initiativeImpact rejeita chamador sem sessao", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.impact.initiativeImpact({ initiativeId: 1 } as any)).rejects.toThrow(TRPCError);
    expect(initiativeImpactMock).not.toHaveBeenCalled();
  });

  it("recordEngagement usa o tenantId resolvido da sessao, ignorando qualquer tenantId injetado no input bruto", async () => {
    resolveTenantForUserMock.mockResolvedValue({ tenantId: 7, mode: "social" });
    const ctx = createUserCtx({ id: 42 });
    const caller = appRouter.createCaller(ctx);

    // Mesmo que um chamador malicioso force um tenantId extra no payload bruto (bypassando o
    // zod via `as any`), o router nunca le esse campo: quem decide o tenant e resolveTenantForUser.
    await caller.impact.recordEngagement({
      identityKey: "id:a",
      initiativeId: 1,
      signal: "view",
      tenantId: 999, // tentativa de IDOR: tenant de outra organizacao
    } as any);

    expect(resolveTenantForUserMock).toHaveBeenCalledWith(ctx.user);
    expect(recordEngagementMock).toHaveBeenCalledTimes(1);
    const call = recordEngagementMock.mock.calls[0][0];
    expect(call.tenantId).toBe(7); // veio da sessao, nao do input malicioso (999)
    expect(call.identityKey).toBe("id:a");
  });

  it("userRating usa o tenantId resolvido da sessao", async () => {
    resolveTenantForUserMock.mockResolvedValue({ tenantId: 3, mode: "comercial" });
    const caller = appRouter.createCaller(createUserCtx());
    await caller.impact.userRating({ identityKey: "id:a", initiativeId: 5 } as any);
    expect(userRatingMock).toHaveBeenCalledWith("id:a", 5, 3);
  });

  it("initiativeImpact usa o tenantId resolvido da sessao", async () => {
    resolveTenantForUserMock.mockResolvedValue({ tenantId: 9, mode: "social" });
    const caller = appRouter.createCaller(createUserCtx());
    await caller.impact.initiativeImpact({ initiativeId: 8 } as any);
    expect(initiativeImpactMock).toHaveBeenCalledWith(8, 9);
  });

  it("usuario autenticado mas sem tenant vinculado e rejeitado, nunca cai num tenant default", async () => {
    resolveTenantForUserMock.mockRejectedValue(new Error("Usuario sem tenant associado"));
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.impact.initiativeImpact({ initiativeId: 1 } as any),
    ).rejects.toThrow("Usuario sem tenant associado");
    expect(initiativeImpactMock).not.toHaveBeenCalled();
  });
});
