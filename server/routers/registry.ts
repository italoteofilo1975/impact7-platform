// server/routers/registry.ts
// Impact7 · Sprint 8 · procedures tRPC do motor de mensuracao. Registrar no appRouter como registry.
import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc"; // ajuste aos helpers reais do repo
import { ecosystemPlacar, initiativeSroi } from "../services/impact/registry-service";
import { resolveTenantForUser } from "../services/tenancy/tenant-context";

export const registryRouter = router({
  // O placar consolidado do ecossistema e uma visao cross-tenant por design (dedup global de
  // unicos), entao nao faz sentido escopar por tenantId. Justamente por cruzar todos os tenants,
  // exige adminProcedure (achado 1.6 da revisao ampla: antes era publico, qualquer chamador via
  // o alcance agregado de todas as parcerias, inclusive de tenants concorrentes entre si).
  ecosystemPlacar: adminProcedure.query(async () => ecosystemPlacar()),

  // O S-ROI auditavel de uma iniciativa, com memoria de calculo e faixa de sensibilidade.
  // Cada chamada grava na trilha de auditoria.
  //
  // Achado A.1 do BACKLOG_Plataforma_Auditoria_14_Processos: isto era publicProcedure com
  // tenantId aceito como campo livre do input, checado so contra o dono do initiativeId
  // (assertInitiativeTenant) — mas nunca contra quem tinha o direito de alegar aquele tenantId.
  // Bastava adivinhar um par (initiativeId, tenantId), ambos inteiros sequenciais sem segredo,
  // para ler o S-ROI auditado de qualquer organizacao. Corrigido: protectedProcedure exige
  // sessao, e o tenantId passa a vir exclusivamente de resolveTenantForUser(ctx.user) — nunca
  // mais do input do chamador. assertInitiativeTenant continua rodando dentro do service como
  // segunda barreira (defesa em profundidade), mas agora sobre um tenantId que ja veio confiavel.
  initiativeSroi: protectedProcedure
    .input(z.object({ initiativeId: z.number().int(), actor: z.string().default("system") }))
    .mutation(async ({ input, ctx }) => {
      const { tenantId } = await resolveTenantForUser(ctx.user);
      return initiativeSroi(input.initiativeId, tenantId, input.actor, Date.now());
    }),
});
