// drizzle/schema.impact8.ts
// Impact7 · Sprint 8 · parametros economicos e trilha de auditoria.
// Dinheiro em centavos (int) e percentual em basis points (int). Timestamps em bigint (Unix ms).
import { mysqlTable, int, bigint, varchar, text, index } from "drizzle-orm/mysql-core";

export const initiativeParams = mysqlTable("initiativeParams", {
  id: int("id").primaryKey().autoincrement(),
  initiativeId: int("initiativeId").notNull(),
  valorGatilhoCents: int("valorGatilhoCents").default(3000).notNull(),
  valorTransformacaoCents: int("valorTransformacaoCents").default(80000).notNull(),
  atribuicaoBps: int("atribuicaoBps").default(6000).notNull(),
  custoImtsCents: int("custoImtsCents").default(0).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
}, (t) => ({ byInitiative: index("ip_initiative_idx").on(t.initiativeId) }));

export const auditLog = mysqlTable("auditLog", {
  id: int("id").primaryKey().autoincrement(),
  actor: varchar("actor", { length: 128 }).notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  entity: varchar("entity", { length: 64 }).notNull(),
  entityId: int("entityId"),
  inputJson: text("inputJson"),
  resultJson: text("resultJson"),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});
