// server/routers/registry.ts
// Impact7 · Sprint 8 · procedures tRPC do motor de mensuracao. Registrar no appRouter como registry.
import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc"; // ajuste aos helpers reais do repo
import { ecosystemPlacar, initiativeSroi } from "../services/impact/registry-service";

export const registryRouter = router({
  // O placar consolidado do ecossistema, ja deduplicado entre iniciativas e separado em camadas.
  ecosystemPlacar: publicProcedure.query(async () => ecosystemPlacar()),

  // O S-ROI auditavel de uma iniciativa, com memoria de calculo e faixa de sensibilidade.
  // Cada chamada grava na trilha de auditoria.
  initiativeSroi: publicProcedure
    .input(z.object({ initiativeId: z.number().int(), actor: z.string().default("system") }))
    .query(async ({ input }) => initiativeSroi(input.initiativeId, input.actor, Date.now())),
});
