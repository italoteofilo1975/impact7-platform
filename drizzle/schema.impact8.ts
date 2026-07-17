// drizzle/schema.impact8.ts
// Impact7 · Sprint 8 · parametros economicos e trilha de auditoria.
// Dinheiro em centavos (int) e percentual em basis points (int). Timestamps em bigint (Unix ms).
import { pgTable, integer, bigint, serial, varchar, text, index, unique } from "drizzle-orm/pg-core";

export const initiativeParams = pgTable("initiativeParams", {
  id: serial("id").primaryKey(),
  // Achado 1.7/1.17: tenantId para isolamento. Achado 2.19: UNIQUE(initiativeId), o codigo
  // sempre assumiu no maximo uma linha de parametros por iniciativa, agora o schema garante.
  tenantId: integer("tenantId").notNull(),
  initiativeId: integer("initiativeId").notNull(),
  valorGatilhoCents: integer("valorGatilhoCents").default(3000).notNull(),
  valorTransformacaoCents: integer("valorTransformacaoCents").default(80000).notNull(),
  atribuicaoBps: integer("atribuicaoBps").default(6000).notNull(),
  // Achado 2.2/2.6 do RELATORIO_Consistencia: os tres descontos do S-ROI honesto, deadweight
  // e drop-off, alem da atribuicao ja existente. Default zero, nao muda nenhum numero ja
  // calculado ate alguem preencher com dado real (Opcao A do DECISOES_Pendentes item 1).
  deadweightBps: integer("deadweightBps").default(0).notNull(),
  dropOffBps: integer("dropOffBps").default(0).notNull(),
  custoImtsCents: integer("custoImtsCents").default(0).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
}, (t) => ({
  byTenant: index("ip_tenant_idx").on(t.tenantId),
  uniqueInitiative: unique("ip_initiative_uq").on(t.initiativeId),
}));

export const auditLog = pgTable("auditLog", {
  id: serial("id").primaryKey(),
  actor: varchar("actor", { length: 128 }).notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  entity: varchar("entity", { length: 64 }).notNull(),
  entityId: integer("entityId"),
  inputJson: text("inputJson"),
  resultJson: text("resultJson"),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});
