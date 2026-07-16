// drizzle/schema.tenants.ts
// Impact7 · Sprint 10 · multi-inquilino. createdAt em bigint (Unix ms).
import { mysqlTable, int, bigint, varchar } from "drizzle-orm/mysql-core";

export const tenants = mysqlTable("tenants", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 64 }).default("alianca").notNull(),
  mode: varchar("mode", { length: 32 }).default("social").notNull(),
  brandTheme: varchar("brandTheme", { length: 64 }),
  sponsorId: int("sponsorId"),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});
