// drizzle/schema.tenants.ts
// Impact7 · Sprint 10 · multi-inquilino. Um tenant e uma alianca que recebe uma instancia,
// comercial ou doada no modo social, sobre a base do White Label.
import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";

export const tenants = mysqlTable("tenants", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 64 }).default("alianca").notNull(),   // secretaria | rede_escolas | franquia | instituto | patrocinador
  mode: varchar("mode", { length: 32 }).default("social").notNull(),    // comercial | social
  brandTheme: varchar("brandTheme", { length: 64 }),                    // tema White Label da alianca
  sponsorId: int("sponsorId"),                                          // quem banca a operacao no modo social
  createdAt: int("createdAt").$type<number>().notNull(),
});

// Nota de migracao. As tabelas initiatives e engagementEvents ganham uma coluna tenantId,
// adicionada com escrita dupla e retrofill, na mesma disciplina do Sprint 6, para que o
// isolamento por inquilino nao quebre o historico existente. Todas as leituras passam a
// escopar por tenantId atraves do helper do arquivo tenant-context.ts.
