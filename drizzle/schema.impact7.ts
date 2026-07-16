// drizzle/schema.impact7.ts
// Impact7 · Sprint 7 · instrumentacao de engajamento e iniciativas.
// Correcao do review adversarial: timestamps guardam Unix em milissegundos (Date.now()),
// que estoura INT MySQL de 32 bits (max ~2.147e9). Aqui os campos de tempo usam bigint.
// Nota: as tabelas legadas do repo tem o mesmo problema latente com int.
import { mysqlTable, int, bigint, varchar, text, index } from "drizzle-orm/mysql-core";

export const initiatives = mysqlTable("initiatives", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 128 }),
  odsTags: text("odsTags"),
  stageIve: varchar("stageIve", { length: 32 }).default("origem").notNull(),
  custeioMode: varchar("custeioMode", { length: 32 }).default("comercial").notNull(),
  instrumented: int("instrumented").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export const engagementEvents = mysqlTable("engagementEvents", {
  id: int("id").primaryKey().autoincrement(),
  identityKey: varchar("identityKey", { length: 128 }).notNull(),
  initiativeId: int("initiativeId").notNull(),
  signal: varchar("signal", { length: 64 }).notNull(),
  level: int("level").notNull(),
  instrumented: int("instrumented").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
}, (t) => ({
  byInitiative: index("ee_initiative_idx").on(t.initiativeId),
  byIdentityInitiative: index("ee_identity_initiative_idx").on(t.identityKey, t.initiativeId),
}));
