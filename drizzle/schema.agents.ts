// drizzle/schema.agents.ts
// Impact7 · Sprint 9 · uso e custo da Malha de Agentes por identidade e por dia.
// dayBucket e o dia em Unix days (int). updatedAt em bigint (Unix ms).
import { pgTable, integer, bigint, serial, varchar, index, unique } from "drizzle-orm/pg-core";

export const agentUsage = pgTable("agentUsage", {
  id: serial("id").primaryKey(),
  identityKey: varchar("identityKey", { length: 128 }).notNull(),
  dayBucket: integer("dayBucket").notNull(),
  usedSeconds: integer("usedSeconds").default(0).notNull(),
  tokensIn: integer("tokensIn").default(0).notNull(),
  tokensOut: integer("tokensOut").default(0).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
}, (t) => ({
  byIdentityDay: index("au_identity_day_idx").on(t.identityKey, t.dayBucket),
  // Achado 3.18/3.9 da revisao ampla: sem UNIQUE, duas chamadas concorrentes podiam inserir
  // duas linhas para a mesma identidade e dia, fragmentando a contagem e furando o cap diario.
  uniqueIdentityDay: unique("au_identity_day_uq").on(t.identityKey, t.dayBucket),
}));
