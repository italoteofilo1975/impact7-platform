-- Impact7 · correcao da segunda instancia da formula ficticia "I = (E x C^7) / R"
-- (achado de seguimento da mesma auditoria que ja corrigiu shared/sroi-calculator.ts e
-- jarvisSkills.calculator). A tabela "calculations" guardava as colunas dessa equacao
-- inventada (contextScore, resistanceScore, impactScore); agora guarda as variaveis da
-- formula honesta de shared/sroi-calculator.ts (gatilhos, transformacoes, valores em
-- centavos, descontos em basis points), no mesmo padrao ja usado por "initiativeParams".
--
-- Escrita a mao, como a migracao 0001: colunas novas entram com DEFAULT 0 NOT NULL, o que
-- e seguro tanto num banco vazio (local) quanto num com linhas de simulacoes publicas ja
-- gravadas em producao -- essas linhas antigas ficam com os novos campos zerados em vez de
-- travar a migracao, e continuam sendo apenas simulacoes ilustrativas, nunca S-ROI auditado.
ALTER TABLE "calculations" ADD COLUMN IF NOT EXISTS "gatilhos" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "calculations" ADD COLUMN IF NOT EXISTS "transformacoes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "calculations" ADD COLUMN IF NOT EXISTS "valorGatilhoCents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "calculations" ADD COLUMN IF NOT EXISTS "valorTransformacaoCents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "calculations" ADD COLUMN IF NOT EXISTS "atribuicaoBps" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "calculations" ADD COLUMN IF NOT EXISTS "deadweightBps" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "calculations" ADD COLUMN IF NOT EXISTS "dropOffBps" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "calculations" ADD COLUMN IF NOT EXISTS "custoImtsCents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "calculations" ADD COLUMN IF NOT EXISTS "valorSocialBrutoCents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "calculations" ADD COLUMN IF NOT EXISTS "valorSocialCents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint

-- sRoi ja existia (guardava sroi ficticio * 100); mantem o nome e a escala (sroi honesto *
-- 100), so muda de onde o numero vem. Reafirma o default/NOT NULL para as linhas novas.
ALTER TABLE "calculations" ALTER COLUMN "sRoi" SET DEFAULT 0;--> statement-breakpoint

-- Colunas da equacao ficticia "I = (E x C^7) / R", nunca derivada de nada real: removidas.
ALTER TABLE "calculations" DROP COLUMN IF EXISTS "investment";--> statement-breakpoint
ALTER TABLE "calculations" DROP COLUMN IF EXISTS "contextScore";--> statement-breakpoint
ALTER TABLE "calculations" DROP COLUMN IF EXISTS "resistanceScore";--> statement-breakpoint
ALTER TABLE "calculations" DROP COLUMN IF EXISTS "beneficiaries";--> statement-breakpoint
ALTER TABLE "calculations" DROP COLUMN IF EXISTS "duration";--> statement-breakpoint
ALTER TABLE "calculations" DROP COLUMN IF EXISTS "impactScore";
