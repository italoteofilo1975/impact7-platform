import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { whiteLabelConfig } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const whiteLabelRouter = router({
  // Get white label config by organization ID
  getConfig: publicProcedure
    .input(z.object({
      organizationId: z.string().optional().default("default"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const config = await db
        .select()
        .from(whiteLabelConfig)
        .where(eq(whiteLabelConfig.organizationId, input.organizationId))
        .limit(1);

      if (config.length === 0) {
        // Return default config
        return {
          platformName: "IMPACT7",
          primaryColor: "#ff6b35",
          secondaryColor: "#004e89",
          accentColor: "#f7931e",
          fontFamily: "Inter",
        };
      }

      return config[0];
    }),

  // Update or create white label config
  updateConfig: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      platformName: z.string().optional(),
      logoUrl: z.string().optional(),
      faviconUrl: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      fontFamily: z.string().optional(),
      customDomain: z.string().optional(),
      supportEmail: z.string().optional(),
      supportPhone: z.string().optional(),
      websiteUrl: z.string().optional(),
      linkedinUrl: z.string().optional(),
      twitterUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const { organizationId, ...data } = input;

      // Check if config exists
      const existing = await db
        .select()
        .from(whiteLabelConfig)
        .where(eq(whiteLabelConfig.organizationId, organizationId))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(whiteLabelConfig)
          .set({
            ...data,
            updatedAt: Date.now(),
          })
          .where(eq(whiteLabelConfig.organizationId, organizationId));
      } else {
        // Insert new
        await db.insert(whiteLabelConfig).values({
          organizationId,
          ...data,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      return { success: true };
    }),

  // List all white label configs (admin only)
  listConfigs: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const configs = await db
        .select()
        .from(whiteLabelConfig)
        .orderBy(whiteLabelConfig.createdAt);

      return configs;
    }),
});
