-- Impact7 · correcao do achado A.1 do BACKLOG_Plataforma_Auditoria_14_Processos: isolamento
-- multi-tenant era apenas nominal. initiativeSroi/recordEngagement/userRating/initiativeImpact
-- eram publicProcedure e confiavam no tenantId declarado pelo proprio chamador no input.
--
-- Falta uma coluna que amarre uma sessao autenticada (ctx.user) a um tenant real, para que o
-- tenantId de uma chamada protegida deixe de ser um valor livre e passe a ser resolvido a
-- partir de quem a pessoa realmente e. Nulavel: contas de plataforma sem vinculo de tenant
-- (admin global, visitante que so se cadastrou no site) continuam validas com tenantId NULL.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tenantId" integer;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_tenant_idx" ON "users" USING btree ("tenantId");
