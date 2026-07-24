// server/routers/impact.ts
// Impact7 · Sprint 7 · procedures tRPC da instrumentacao de engajamento.
// Registrar no appRouter principal como impact: impactRouter.
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc"; // ajuste aos helpers reais do repo
import { recordEngagement, userRating, initiativeImpact } from "../services/impact/engagement-service";
import { resolveTenantForUser } from "../services/tenancy/tenant-context";

// Achado A.1 do BACKLOG_Plataforma_Auditoria_14_Processos: as tres procedures abaixo eram
// publicProcedure com tenantId aceito como campo livre do input. assertInitiativeTenant (dentro
// do service) so confere se o initiativeId pertence ao tenantId alegado — nunca se o chamador
// tinha o direito de alegar aquele tenantId. Como tenantId/initiativeId sao inteiros sequenciais
// sem segredo, qualquer chamador externo que adivinhasse um par correto lia/escrevia engajamento
// de qualquer outra organizacao. O comentario anterior justificava publicProcedure dizendo que
// "o canal (WhatsApp, app, agente por ID) chama sem sessao de usuario logado" — mas nenhum canal
// desses existe hoje neste repo com autenticacao propria (chave de servico, assinatura de
// webhook, etc.) validando de qual tenant a mensagem realmente veio; era so uma alegacao no
// input, sem lastro nenhum. Corrigido: protectedProcedure exige sessao, e o tenantId passa a vir
// exclusivamente de resolveTenantForUser(ctx.user) — nunca mais do input do chamador.
// assertInitiativeTenant continua rodando dentro do service como segunda barreira (defesa em
// profundidade), agora sobre um tenantId que ja veio confiavel da sessao.
//
// Se um canal service-to-service de verdade (bot de WhatsApp, agente por ID) precisar operar em
// nome de varios tenants com uma unica conta de servico, o caminho correto NAO e reabrir
// publicProcedure com tenantId livre de novo: e criar uma procedure separada, autenticada por
// chave de servico propria (nao por sessao de usuario), que resolve o tenant permitido a partir
// dessa chave (ex.: tabela service_credentials -> tenantId), nunca a partir de um campo que o
// proprio chamador preenche. Nao existe hoje nenhum caso assim implementado neste repo.
export const impactRouter = router({
  // Registra um evento de engajamento vindo de dentro da plataforma (operador autenticado,
  // ou Malha de Agentes chamando em nome do usuario logado).
  recordEngagement: protectedProcedure
    .input(z.object({
      identityKey: z.string().min(1),
      initiativeId: z.number().int(),
      signal: z.string().min(1),
      instrumented: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { tenantId } = await resolveTenantForUser(ctx.user);
      // O now e injetado aqui, na raiz de composicao, e nao dentro da regra de negocio.
      return recordEngagement({ ...input, tenantId, now: Date.now() });
    }),

  // Rating de impacto de um usuario numa iniciativa.
  userRating: protectedProcedure
    .input(z.object({ identityKey: z.string(), initiativeId: z.number().int() }))
    .query(async ({ input, ctx }) => {
      const { tenantId } = await resolveTenantForUser(ctx.user);
      return userRating(input.identityKey, input.initiativeId, tenantId);
    }),

  // Placar de impacto de uma iniciativa, ja deduplicado por identidade e separado em camadas.
  initiativeImpact: protectedProcedure
    .input(z.object({ initiativeId: z.number().int() }))
    .query(async ({ input, ctx }) => {
      const { tenantId } = await resolveTenantForUser(ctx.user);
      return initiativeImpact(input.initiativeId, tenantId);
    }),
});
