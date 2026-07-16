// drizzle/schema.impact8.ts
// Impact7 · Sprint 8 · parametros economicos por iniciativa e trilha de auditoria.
// Dinheiro guardado em centavos (int) e percentuais em basis points (int), para nao usar float no banco.
import { mysqlTable, int, varchar, text } from "drizzle-orm/mysql-core";

// Parametros economicos de uma iniciativa, usados no S-ROI auditavel.
export const initiativeParams = mysqlTable("initiativeParams", {
  id: int("id").primaryKey().autoincrement(),
  initiativeId: int("initiativeId").notNull(),
  valorGatilhoCents: int("valorGatilhoCents").default(3000).notNull(),          // R$ 30,00, proxy modesto
  valorTransformacaoCents: int("valorTransformacaoCents").default(80000).notNull(), // R$ 800,00, proxy a calibrar
  atribuicaoBps: int("atribuicaoBps").default(6000).notNull(),                  // 60%, credito dividido com parceiro
  custoImtsCents: int("custoImtsCents").default(0).notNull(),                   // custo fixo da IMTS na iniciativa
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

// Trilha de auditoria, quem calculou ou registrou o que, e com qual resultado.
export const auditLog = mysqlTable("auditLog", {
  id: int("id").primaryKey().autoincrement(),
  actor: varchar("actor", { length: 128 }).notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  entity: varchar("entity", { length: 64 }).notNull(),
  entityId: int("entityId"),
  inputJson: text("inputJson"),
  resultJson: text("resultJson"),
  createdAt: int("createdAt").$type<number>().notNull(),
});
