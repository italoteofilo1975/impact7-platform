-- Impact7 · isolamento multi-tenant (achado 1.6/1.7/1.9/1.17 da revisao ampla) +
-- descontos de deadweight/dropOff no S-ROI (achado 2.2/2.6 do RELATORIO_Consistencia) +
-- correcao de constraints de corrida (achado 2.19, 3.9/3.18).
--
-- Escrita a mao em vez de usar o SQL gerado pelo drizzle-kit puro: "ADD COLUMN tenantId
-- integer NOT NULL" sem default falha contra qualquer linha ja existente (Supabase producao
-- ja tem iniciativas do tenant "Instituto Expand", id 1). Aqui a coluna entra sem NOT NULL,
-- e' backfilled para o unico tenant hoje existente, e so DEPOIS ganha a restricao NOT NULL,
-- para que a migracao seja segura tanto num banco vazio (local) quanto num com dados (prod).
DROP INDEX IF EXISTS "ip_initiative_idx";--> statement-breakpoint

ALTER TABLE "engagementEvents" ADD COLUMN IF NOT EXISTS "tenantId" integer;--> statement-breakpoint
ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "tenantId" integer;--> statement-breakpoint
ALTER TABLE "initiativeParams" ADD COLUMN IF NOT EXISTS "tenantId" integer;--> statement-breakpoint
ALTER TABLE "initiativeParams" ADD COLUMN IF NOT EXISTS "deadweightBps" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "initiativeParams" ADD COLUMN IF NOT EXISTS "dropOffBps" integer DEFAULT 0 NOT NULL;--> statement-breakpoint

-- Backfill: hoje so existe um tenant no ecossistema (id 1, Instituto Expand), confirmado por
-- consulta direta em producao nesta mesma rodada. Toda linha pre-existente pertence a ele.
UPDATE "initiatives" SET "tenantId" = 1 WHERE "tenantId" IS NULL;--> statement-breakpoint
UPDATE "engagementEvents" SET "tenantId" = 1 WHERE "tenantId" IS NULL;--> statement-breakpoint
UPDATE "initiativeParams" SET "tenantId" = 1 WHERE "tenantId" IS NULL;--> statement-breakpoint

ALTER TABLE "initiatives" ALTER COLUMN "tenantId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "engagementEvents" ALTER COLUMN "tenantId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "initiativeParams" ALTER COLUMN "tenantId" SET NOT NULL;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "ee_tenant_idx" ON "engagementEvents" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "initiatives_tenant_idx" ON "initiatives" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ip_tenant_idx" ON "initiativeParams" USING btree ("tenantId");--> statement-breakpoint

-- Achado 2.19: o codigo sempre assumiu no maximo uma linha de parametros por iniciativa;
-- se producao ja tiver duplicatas essa constraint falha alto e explicito em vez de deixar
-- a inconsistencia passar batido. Nao ha indicio de duplicatas hoje (poucas iniciativas).
ALTER TABLE "initiativeParams" ADD CONSTRAINT "ip_initiative_uq" UNIQUE("initiativeId");--> statement-breakpoint

-- Achado 3.9/3.18: mesma logica, mas para o uso diario da Malha de Agentes por identidade.
ALTER TABLE "agentUsage" ADD CONSTRAINT "au_identity_day_uq" UNIQUE("identityKey","dayBucket");
