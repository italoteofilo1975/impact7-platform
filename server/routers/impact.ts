// server/routers/impact.ts
// Impact7 · Sprint 7 · procedures tRPC da instrumentacao de engajamento.
// Registrar no appRouter principal como impact: impactRouter.
import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc"; // ajuste aos helpers reais do repo
import { recordEngagement, userRating, initiativeImpact } from "../services/impact/engagement-service";

// tenantId agora e obrigatorio em todo input (achado 1.7/1.9 da revisao ampla): cada procedure
// so le ou escreve engajamento de uma iniciativa que realmente pertence ao tenant declarado,
// verificado a fundo pelo assertInitiativeTenant dentro do service. Continuam publicProcedure
// porque o canal (WhatsApp, app, agente por ID) chama sem sessao de usuario logado, mas o
// tenantId + a checagem de posse fecham a brecha de adivinhar o initiativeId.
export const impactRouter = router({
  // Registra um evento de engajamento vindo do canal (WhatsApp, app, agente por ID).
  recordEngagement: publicProcedure
    .input(z.object({
      identityKey: z.string().min(1),
      initiativeId: z.number().int(),
      tenantId: z.number().int(),
      signal: z.string().min(1),
      instrumented: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      // O now e injetado aqui, na raiz de composicao, e nao dentro da regra de negocio.
      return recordEngagement({ ...input, now: Date.now() });
    }),

  // Rating de impacto de um usuario numa iniciativa.
  userRating: publicProcedure
    .input(z.object({ identityKey: z.string(), initiativeId: z.number().int(), tenantId: z.number().int() }))
    .query(async ({ input }) => userRating(input.identityKey, input.initiativeId, input.tenantId)),

  // Placar de impacto de uma iniciativa, ja deduplicado por identidade e separado em camadas.
  initiativeImpact: publicProcedure
    .input(z.object({ initiativeId: z.number().int(), tenantId: z.number().int() }))
    .query(async ({ input }) => initiativeImpact(input.initiativeId, input.tenantId)),
});
