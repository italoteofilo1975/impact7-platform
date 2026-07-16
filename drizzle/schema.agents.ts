// drizzle/schema.agents.ts
// Impact7 · Sprint 9 · uso e custo da Malha de Agentes por identidade e por dia.
// dayBucket e o dia em Unix days, para aplicar a janela diaria de uso do modo social.
import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";

export const agentUsage = mysqlTable("agentUsage", {
  id: int("id").primaryKey().autoincrement(),
  identityKey: varchar("identityKey", { length: 128 }).notNull(),
  dayBucket: int("dayBucket").notNull(),
  usedSeconds: int("usedSeconds").default(0).notNull(),
  tokensIn: int("tokensIn").default(0).notNull(),
  tokensOut: int("tokensOut").default(0).notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});
