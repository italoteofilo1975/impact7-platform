import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: ["./drizzle/schema.ts", "./drizzle/schema.impact7.ts", "./drizzle/schema.impact8.ts", "./drizzle/schema.agents.ts", "./drizzle/schema.tenants.ts"],
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
