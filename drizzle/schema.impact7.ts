// drizzle/schema.impact7.ts
// Impact7 · Sprint 7 · instrumentacao de engajamento e iniciativas.
// Segue as convencoes do repositorio: timestamps em int (Unix ms), booleanos em int 0/1.
import { mysqlTable, int, varchar, text } from "drizzle-orm/mysql-core";

// A Iniciativa e a unidade que metrifica qualquer frente (a Ficha, no banco).
export const initiatives = mysqlTable("initiatives", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 128 }),
  odsTags: text("odsTags"),                                              // csv dos ODS enderecados
  stageIve: varchar("stageIve", { length: 32 }).default("origem").notNull(),        // IveStage
  custeioMode: varchar("custeioMode", { length: 32 }).default("comercial").notNull(), // comercial | doacao | patrocinio
  instrumented: int("instrumented").default(1).notNull(),               // 1 medido, 0 estimado
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});

// Cada evento de engajamento de uma pessoa, atrelado a sua identidade.
// identityKey e o hash estavel do telefone ou do id do usuario, base para contagem de unicos e deduplicacao.
export const engagementEvents = mysqlTable("engagementEvents", {
  id: int("id").primaryKey().autoincrement(),
  identityKey: varchar("identityKey", { length: 128 }).notNull(),
  initiativeId: int("initiativeId").notNull(),
  signal: varchar("signal", { length: 64 }).notNull(),
  level: int("level").notNull(),                                        // 1..7, ordem IMPACTA
  instrumented: int("instrumented").default(1).notNull(),
  createdAt: int("createdAt").$type<number>().notNull(),
});
