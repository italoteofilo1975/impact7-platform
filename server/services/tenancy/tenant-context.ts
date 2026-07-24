// server/services/tenancy/tenant-context.ts
// Impact7 · Sprint 10 · resolucao e escopo de inquilino. Toda leitura e escrita de dado de
// iniciativa e de engajamento passa a ser escopada por tenantId, o que isola cada alianca.
// Achado 1.6/1.7/1.9 da revisao ampla: este arquivo existia mas nunca era chamado em producao,
// e as tabelas nao tinham coluna tenantId. As duas coisas foram corrigidas, e as funcoes de
// resolucao/validacao abaixo agora sao usadas de fato pelos services de impact e registry.
import { getDb } from "../../db";
import { tenants } from "../../../drizzle/schema.tenants";
import { initiatives } from "../../../drizzle/schema.impact7";
import { eq, and, SQL } from "drizzle-orm";

export interface TenantContext {
  tenantId: number;
  mode: "comercial" | "social";
}

// Resolve o tenant a partir de uma chave vinda do request, por exemplo subdominio, header ou token.
export async function resolveTenant(key: { tenantId?: number }): Promise<TenantContext> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!key.tenantId) throw new Error("Requisicao sem tenant");
  const [t] = await db.select().from(tenants).where(eq(tenants.id, key.tenantId));
  if (!t) throw new Error("Tenant nao encontrado");
  return { tenantId: t.id, mode: t.mode === "comercial" ? "comercial" : "social" };
}

// Achado A.1 do BACKLOG_Plataforma_Auditoria_14_Processos: initiativeSroi/recordEngagement/
// userRating/initiativeImpact eram publicProcedure e confiavam no tenantId declarado pelo
// proprio input do chamador. assertInitiativeTenant so confere se o initiativeId pertence ao
// tenantId alegado — nunca se o chamador tem direito de alegar aquele tenantId. resolveTenant
// existia mas so era chamado em teste, nunca em producao.
//
// resolveTenantForUser fecha essa lacuna: recebe o usuario JA AUTENTICADO pelo middleware de
// sessao (ctx.user de um protectedProcedure, nunca um valor de input) e resolve o tenant a
// partir do vinculo real gravado no proprio registro do usuario (users.tenantId), delegando
// para resolveTenant a validacao de que o tenant ainda existe. Se o usuario nao tiver tenant
// vinculado, a chamada e rejeitada — nao ha fallback silencioso para um tenantId de input.
export async function resolveTenantForUser(user: { id: number; tenantId?: number | null }): Promise<TenantContext> {
  if (user.tenantId === null || user.tenantId === undefined) {
    throw new Error("Usuario sem tenant associado");
  }
  return resolveTenant({ tenantId: user.tenantId });
}

// Compoe uma condicao de escopo por tenant, para somar a qualquer where de leitura ou escrita.
// Uso: db.select().from(engagementEvents).where(scoped(engagementEvents.tenantId, ctx, extra))
export function scoped(tenantColumn: any, ctx: TenantContext, extra?: SQL): SQL | undefined {
  const base = eq(tenantColumn, ctx.tenantId);
  return extra ? and(base, extra) : base;
}

// No modo social, a operacao e bancada pelo sponsor do tenant, e a janela de uso do agente
// e a social, de duas horas por dia. No modo comercial, sem janela e cobrado do cliente.
export function windowSecondsForMode(mode: TenantContext["mode"]): number | null {
  return mode === "social" ? 2 * 60 * 60 : null; // null significa sem janela
}

// Busca o tenantId real de uma iniciativa e confere contra o tenantId declarado pelo chamador.
// E a barreira que fecha o achado 1.9, qualquer chamador podia ler ou escrever engajamento e
// S-ROI de qualquer initiativeId so adivinhando o numero, sem checar posse. Lanca erro se a
// iniciativa nao existir ou se pertencer a outro tenant que nao o declarado.
export async function assertInitiativeTenant(initiativeId: number, claimedTenantId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [ini] = await db.select({ tenantId: initiatives.tenantId }).from(initiatives).where(eq(initiatives.id, initiativeId));
  if (!ini) throw new Error("Iniciativa nao encontrada");
  if (ini.tenantId !== claimedTenantId) throw new Error("Iniciativa nao pertence a este tenant");
  return ini.tenantId;
}
