# Guia de Lançamento — IMPACT7 (linha-mestra `impact7-platform`)

> Onda 4 do roadmap. Passos para levar a plataforma a produção.
> Adaptado ao estado REAL deste repositório (0 erros TS · 444 testes · build OK).

---

## 0. O que já está pronto neste repo ✅

- Build de produção funcional (`pnpm build` → `dist/index.js` + `dist/public`).
- Endpoint de saúde `GET /api/health` (para health checks do provedor).
- Config de deploy: `railway.json`, `nixpacks.toml`, `Procfile`.
- Auth JWT própria, RBAC, headers de segurança, rate limiting, audit trail.
- Páginas legais: Política de Privacidade e Termos de Uso (LGPD).
- SEO: `robots.txt`, `sitemap.xml`, componente `SEO.tsx`.
- Jarvis com RAG persistido + base de conhecimento com seed canônico.
- Banner de consentimento de cookies (LGPD) — componente `CookieConsent`.

---

## 1. Segredos/contas que SÓ O FUNDADOR pode prover 🔴

Configure como variáveis de ambiente no provedor (ver `.env.example`):

| Secret | Para quê | Como obter |
|---|---|---|
| `DATABASE_URL` | Banco MySQL 8+ | Provedor de DB (PlanetScale, Railway MySQL, RDS…) |
| `JWT_SECRET` | Sessões | `openssl rand -base64 32` |
| `BUILT_IN_FORGE_API_KEY` (+URL) | Jarvis (LLM) | Manus Forge |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `VITE_STRIPE_PUBLISHABLE_KEY` | Assinaturas | Stripe Dashboard (ativar modo produção) |
| `SENDGRID_API_KEY` / `SENDGRID_FROM_EMAIL` | Emails reais | SendGrid (verificar domínio remetente) |
| `SENTRY_DSN` | Error tracking | Sentry.io (gratuito) |
| Domínio + DNS | URL pública | Registrador + DNS do provedor |

---

## 2. Deploy no Railway (recomendado)

1. Criar projeto no Railway e conectar este repositório.
2. O `railway.json`/`nixpacks.toml` já definem build (`pnpm install && pnpm build`) e start (`pnpm start`); healthcheck em `/api/health`.
3. Configurar todas as variáveis da seção 1 em **Variables**.
4. Provisionar o banco e rodar as migrations: `pnpm db:push`.
5. Deploy. Validar `GET /api/health` → `{"status":"ok","db":"up"}`.

> Alternativas: qualquer host Node 22 que respeite `Procfile`/`pnpm start`.

---

## 3. Checklist final de produção

**Configuração**
- [ ] Todos os secrets da seção 1 configurados
- [ ] `pnpm db:push` executado (schema sincronizado)
- [ ] `/api/health` retornando `db: "up"`
- [ ] Domínio + SSL + redirecionamento www→apex

**Stripe**
- [ ] Chaves de produção configuradas
- [ ] Webhook de produção apontando para a URL pública
- [ ] Fluxo de assinatura testado ponta a ponta

**Email (SendGrid)**
- [ ] Domínio remetente verificado (SPF/DKIM/DMARC)
- [ ] Email transacional de teste enviado

**LGPD/Legal**
- [ ] Banner de cookies ativo
- [ ] Política de Privacidade e Termos revisados por jurídico
- [ ] Canal para solicitação de dados (DSAR) definido

**Conteúdo**
- [ ] Depoimentos/cases reais com autorização
- [ ] Base de conhecimento do Jarvis populada (botão "Popular conteúdo canônico" em /admin/base-conhecimento) + documentos próprios

**Qualidade/Segurança**
- [ ] `pnpm check` (0 erros) e `pnpm test` (verde) no CI
- [ ] SAST (Snyk) sem vulnerabilidades CRITICAL
- [ ] Sentry recebendo eventos

---

## 4. CI/CD

Um pipeline pronto está em `S7_BUNKER/06_OPS/ci.yml.template` (lint→tsc→testes→
build). Para ativá-lo, mova-o para `.github/workflows/ci.yml`.

> Nota: pushes via GitHub App podem exigir a permissão `workflows`. Se o push
> do arquivo de workflow for rejeitado, adicione-o manualmente pela UI do
> GitHub ou conceda a permissão ao App.

---

## 5. Pós-lançamento
- Monitorar Sentry e `/api/health`.
- Coletar feedback dos primeiros usuários.
- Seguir o `BACKLOG_SOBERANO.json` para as próximas ondas (SECURITY_MATRIX,
  cobertura E2E, RAG com provider de embeddings real).
