// server/routers/impact.ts
// Impact7 · Sprint 7 · procedures tRPC da instrumentacao de engajamento.
// Registrar no appRouter principal como impact: impactRouter.
import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc"; // ajuste aos helpers reais do repo
import { recordEngagement, userRating, initiativeImpact } from "../services/impact/engagement-service";

export const impactRouter = router({
  // Registra um evento de engajamento vindo do canal (WhatsApp, app, agente por ID).
  recordEngagement: publicProcedure
    .input(z.object({
      identityKey: z.string().min(1),
      initiativeId: z.number().int(),
      signal: z.string().min(1),
      instrumented: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      // O now e injetado aqui, na raiz de composicao, e nao dentro da regra de negocio.
      return recordEngagement({ ...input, now: Date.now() });
    }),

  // Rating de impacto de um usuario numa iniciativa.
  userRating: publicProcedure
    .input(z.object({ identityKey: z.string(), initiativeId: z.number().int() }))
    .query(async ({ input }) => userRating(input.identityKey, input.initiativeId)),

  // Placar de impacto de uma iniciativa, ja deduplicado por identidade e separado em camadas.
  initiativeImpact: publicProcedure
    .input(z.object({ initiativeId: z.number().int() }))
    .query(async ({ input }) => initiativeImpact(input.initiativeId)),
});
