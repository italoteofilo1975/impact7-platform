// drizzle/schema.agents.ts
// Impact7 · Sprint 9 · uso e custo da Malha de Agentes por identidade e por dia.
// dayBucket e o dia em Unix days (int). updatedAt em bigint (Unix ms).
import { mysqlTable, int, bigint, varchar, index } from "drizzle-orm/mysql-core";

export const agentUsage = mysqlTable("agentUsage", {
  id: int("id").primaryKey().autoincrement(),
  identityKey: varchar("identityKey", { length: 128 }).notNull(),
  dayBucket: int("dayBucket").notNull(),
  usedSeconds: int("usedSeconds").default(0).notNull(),
  tokensIn: int("tokensIn").default(0).notNull(),
  tokensOut: int("tokensOut").default(0).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
}, (t) => ({ byIdentityDay: index("au_identity_day_idx").on(t.identityKey, t.dayBucket) }));
