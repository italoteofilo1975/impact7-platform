// server/services/tenancy/tenant-context.ts
// Impact7 · Sprint 10 · resolucao e escopo de inquilino. Toda leitura e escrita de dado de
// iniciativa e de engajamento passa a ser escopada por tenantId, o que isola cada alianca.
import { getDb } from "../../db";
const db = getDb();
import { tenants } from "../../../drizzle/schema.tenants";
import { eq, and, SQL } from "drizzle-orm";

export interface TenantContext {
  tenantId: number;
  mode: "comercial" | "social";
}

// Resolve o tenant a partir de uma chave vinda do request, por exemplo subdominio, header ou token.
export async function resolveTenant(key: { tenantId?: number }): Promise<TenantContext> {
  if (!key.tenantId) throw new Error("Requisicao sem tenant");
  const [t] = await db.select().from(tenants).where(eq(tenants.id, key.tenantId));
  if (!t) throw new Error("Tenant nao encontrado");
  return { tenantId: t.id, mode: t.mode === "comercial" ? "comercial" : "social" };
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
