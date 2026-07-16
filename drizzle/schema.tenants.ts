// drizzle/schema.tenants.ts
// Impact7 · Sprint 10 · multi-inquilino. createdAt em bigint (Unix ms).
import { pgTable, integer, bigint, serial, varchar } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 64 }).default("alianca").notNull(),
  mode: varchar("mode", { length: 32 }).default("social").notNull(),
  brandTheme: varchar("brandTheme", { length: 64 }),
  sponsorId: integer("sponsorId"),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});
