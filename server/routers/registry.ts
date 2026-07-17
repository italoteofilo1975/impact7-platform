// server/routers/registry.ts
// Impact7 · Sprint 8 · procedures tRPC do motor de mensuracao. Registrar no appRouter como registry.
import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../_core/trpc"; // ajuste aos helpers reais do repo
import { ecosystemPlacar, initiativeSroi } from "../services/impact/registry-service";

export const registryRouter = router({
  // O placar consolidado do ecossistema e uma visao cross-tenant por design (dedup global de
  // unicos), entao nao faz sentido escopar por tenantId. Justamente por cruzar todos os tenants,
  // exige adminProcedure (achado 1.6 da revisao ampla: antes era publico, qualquer chamador via
  // o alcance agregado de todas as parcerias, inclusive de tenants concorrentes entre si).
  ecosystemPlacar: adminProcedure.query(async () => ecosystemPlacar()),

  // O S-ROI auditavel de uma iniciativa, com memoria de calculo e faixa de sensibilidade.
  // Cada chamada grava na trilha de auditoria. tenantId obrigatorio, verificado contra o dono
  // real da iniciativa (achado 1.7/1.9), mesma barreira do impactRouter.
  initiativeSroi: publicProcedure
    .input(z.object({ initiativeId: z.number().int(), tenantId: z.number().int(), actor: z.string().default("system") }))
    .mutation(async ({ input }) => initiativeSroi(input.initiativeId, input.tenantId, input.actor, Date.now())),
});
