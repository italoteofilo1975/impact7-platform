// drizzle/schema.impact8.ts
// Impact7 · Sprint 8 · parametros economicos e trilha de auditoria.
// Dinheiro em centavos (int) e percentual em basis points (int). Timestamps em bigint (Unix ms).
import { pgTable, integer, bigint, serial, varchar, text, index } from "drizzle-orm/pg-core";

export const initiativeParams = pgTable("initiativeParams", {
  id: serial("id").primaryKey(),
  initiativeId: integer("initiativeId").notNull(),
  valorGatilhoCents: integer("valorGatilhoCents").default(3000).notNull(),
  valorTransformacaoCents: integer("valorTransformacaoCents").default(80000).notNull(),
  atribuicaoBps: integer("atribuicaoBps").default(6000).notNull(),
  custoImtsCents: integer("custoImtsCents").default(0).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
}, (t) => ({ byInitiative: index("ip_initiative_idx").on(t.initiativeId) }));

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
