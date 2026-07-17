// drizzle/schema.impact7.ts
// Impact7 · Sprint 7 · instrumentacao de engajamento e iniciativas.
// Correcao do review adversarial: timestamps guardam Unix em milissegundos (Date.now()),
// que estoura INT MySQL de 32 bits (max ~2.147e9). Aqui os campos de tempo usam bigint.
// Nota: as tabelas legadas do repo tem o mesmo problema latente com int.
import { pgTable, integer, bigint, serial, varchar, text, index } from "drizzle-orm/pg-core";

export const initiatives = pgTable("initiatives", {
  id: serial("id").primaryKey(),
  // Achado 1.7/1.17 da revisao adversarial: isolamento multi-tenant existia so no papel,
  // sem coluna para escopar. tenantId e obrigatorio a partir daqui, toda iniciativa pertence
  // a exatamente um tenant (a alianca dona dela).
  tenantId: integer("tenantId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 128 }),
  odsTags: text("odsTags"),
  stageIve: varchar("stageIve", { length: 32 }).default("origem").notNull(),
  custeioMode: varchar("custeioMode", { length: 32 }).default("comercial").notNull(),
  instrumented: integer("instrumented").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
}, (t) => ({
  byTenant: index("initiatives_tenant_idx").on(t.tenantId),
}));

export const engagementEvents = pgTable("engagementEvents", {
  id: serial("id").primaryKey(),
  // Denormalizado a partir de initiatives.tenantId no momento da escrita, para filtrar e
  // indexar por tenant sem precisar de join em toda leitura de alto volume.
  tenantId: integer("tenantId").notNull(),
  identityKey: varchar("identityKey", { length: 128 }).notNull(),
  initiativeId: integer("initiativeId").notNull(),
  signal: varchar("signal", { length: 64 }).notNull(),
  level: integer("level").notNull(),
  instrumented: integer("instrumented").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
}, (t) => ({
  byInitiative: index("ee_initiative_idx").on(t.initiativeId),
  byIdentityInitiative: index("ee_identity_initiative_idx").on(t.identityKey, t.initiativeId),
  byTenant: index("ee_tenant_idx").on(t.tenantId),
}));
