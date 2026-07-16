# MATRIZ DE MIGRAÇÃO DE FEATURES — IMPACT7 / Método "Impacta Sete"

> Comparação factual entre a **linha-mestra** `impact7-platform`
> (`/home/user/impact7-platform`) e o **doador** `Projeto-impact7`
> (`/tmp/claude-0/-home-user-impact7-platform/2c2eb5a6-dea3-5718-bce1-c4bf6ab65587/scratchpad/Projeto-impact7`).
>
> Objetivo: identificar o que existe no `Projeto-impact7` e **falta** no `impact7-platform`
> para planejar a migração. Data: 2026-07-16.

## Resumo de contagens

| Métrica | impact7-platform (mestra) | Projeto-impact7 (doador) |
|---|---|---|
| Routers tRPC (chaves no appRouter) | ~54 chaves em um único `server/routers.ts` (153 KB) | ~30 chaves inline + 13 `*-router.ts` dedicados |
| Arquivos de serviço (`server/services/`) | 39 entradas (~25 arquivos `.ts` no topo + subpastas) | 91 arquivos `.ts` no topo + subpastas `jarvis/`, `integrations/` |
| Páginas frontend (`client/src/pages/`) | 100 | 159 |
| Páginas `Admin*.tsx` | 23 | 69 |
| Tabelas Drizzle (`drizzle/schema.ts`) | 81 tabelas | 74 tabelas |
| Migrations (`drizzle/*.sql`) | 8 (0000–0007) | 16 (0000–0015) |
| Infra/deploy (railway, nixpacks, Procfile, k8s, load-tests) | Nenhum | Todos presentes |

> Observação importante: apesar de o `impact7-platform` ter **mais tabelas no total** (81 vs 74),
> os dois schemas têm ~57 tabelas divergentes entre si. A mestra é mais forte em **SET7/CMS/blog/forum/courses/RBAC/OAuth**;
> o doador é mais forte em **WhatsApp, afiliados, parceiros, ebook, IAM, integrações externas, observabilidade e resiliência**.

---

## 1. ROUTERS / BACKEND

Na mestra, os routers estão quase todos inline em `server/routers.ts` (mais os `server/routers/*.ts`).
No doador, há **13 routers dedicados** em `server/*-router.ts` além das chaves inline em `server/routers.ts`.

| Domínio | impact7-platform | Projeto-impact7 | Observação |
|---|:--:|:--:|---|
| auth | Sim | Sim | Ambos |
| leads | Sim | Sim | Ambos |
| newsletter | Sim | Sim | Ambos |
| calculator / calculations | Sim | Sim | Ambos |
| jarvis | Sim | Sim | Doador tem sub-serviços NLU/dialog (ver §2) |
| gamification | Sim | Sim | Ambos |
| notifications | Sim | Sim | Ambos |
| webhooks | Sim | Sim | Ambos |
| tickets | Sim | Sim | Ambos (mestra já tem) |
| featureFlags | Sim | Sim | Ambos (mestra já tem) |
| blog | Sim | Sim | Doador tem `blog-router.ts` dedicado |
| courses | Sim | Sim | Doador tem `courses-router.ts` dedicado |
| **whatsapp** | **Não** | Sim | `server/whatsapp-router.ts` |
| **whatsappBusiness** | **Não** | Sim | `server/whatsapp-business-router.ts` |
| **pdf** | Não (só service) | Sim | `server/pdf-router.ts` |
| **backup** | Não (só service) | Sim | `server/backup-router.ts` |
| **seo** | **Não** | Sim | `server/seo-router.ts` |
| **knowledgeBase** | Não (docs genéricos) | Sim | `server/knowledge-base-router.ts` |
| **health** | Não (só service) | Sim | `server/health-router.ts` |
| **config** | Não | Sim | `server/config-router.ts` |
| **admin** (router dedicado) | Não (rotas espalhadas) | Sim | `server/admin-router.ts` (16 KB) |
| **email** (router) | Não (só digest) | Sim | `server/email-router.ts` |
| **affiliates** | **Não** | Sim | Chave inline em `routers.ts` |
| **partners** | Parcial (só página) | Sim | Router `partners` + `partnerDocs` |
| **ebook** | **Não** | Sim | Chave `ebook` |
| **iam*** (avançado) | Não (tem `rbac`) | Sim | `iamRoles`, `iamPolicies`, `iamAccessRequests`, `iamUsers` |
| **integrations** | Não (só página) | Sim | Chave `integrations` |
| **storage / S3** | Parcial (`storage.ts`) | Sim | Router `storage` dedicado |
| accessibility | Não | Sim | Chave `accessibility` |
| chat | Não (jarvis) | Sim | Chave `chat` + `realtime-chat-service` |
| emailMarketing | Não | Sim | Chave `emailMarketing` |
| projects | Não | Sim | Chave `projects` |
| favorites | Não (caseFavorites) | Sim | Chave `favorites` genérica |
| faq / glossary / resources | Parcial | Sim | Routers dedicados |

**Só existem no doador (backend):** `whatsapp`, `whatsappBusiness`, `seo`, `admin` (router dedicado),
`config`, `email` (router), `affiliates`, `ebook`, `iam*` avançado, `integrations`, `storage`,
`accessibility`, `chat`, `emailMarketing`, `projects`, além de versões dedicadas de `pdf`, `backup`,
`health`, `knowledgeBase`, `partners/partnerDocs`.

---

## 2. SERVIÇOS (`server/services/`)

Mestra: 39 entradas. Doador: 91 arquivos no topo + subpastas `jarvis/` e `integrations/`.
Categorias inteiras que **só existem no doador**:

### Resiliência
| Serviço | Caminho (doador) |
|---|---|
| circuit-breaker | `server/services/circuit-breaker-service.ts` |
| retry | `server/services/retry-service.ts` |
| saga | `server/services/saga-service.ts` |
| event-sourcing | `server/services/event-sourcing-service.ts` |
| graceful-shutdown | `server/services/graceful-shutdown.ts` |
| queue / background-jobs | `queue-service.ts`, `background-jobs-service.ts` |

> Nota: a mestra tem `server/services/resilience/` (pasta), mas o doador tem serviços de resiliência
> mais completos e nomeados individualmente.

### Observabilidade
| Serviço | Caminho (doador) |
|---|---|
| prometheus | `prometheus-metrics-service.ts` |
| tracing | `tracing-service.ts` |
| slo | `slo-service.ts` |
| rum | `rum-service.ts` |
| observability | `observability-service.ts` |
| log-aggregation | `log-aggregation-service.ts` |
| production-health / system-status | `production-health-service.ts`, `system-status-service.ts` |

### Segurança
| Serviço | Caminho (doador) |
|---|---|
| waf | `waf-service.ts` |
| ddos-protection | `ddos-protection-service.ts` |
| encryption | `encryption-service.ts` |
| secrets-manager | `secrets-manager-service.ts` |
| vulnerability-scanner | `vulnerability-scanner-service.ts` |
| mfa | `mfa-service.ts` |
| device-fingerprint | `device-fingerprint-service.ts` |
| security-headers | `security-headers-service.ts` |
| session-management | `session-management-service.ts` |
| policy-engine / iam-advanced | `policy-engine-service.ts`, `iam-advanced-service.ts` |
| compliance / lgpd | `compliance-service.ts`, `lgpd-service.ts` |

### API Management
| Serviço | Caminho (doador) |
|---|---|
| api-gateway | `api-gateway-service.ts` |
| api-registry | `api-registry-service.ts` |
| api-versioning | `api-versioning-service.ts` |
| api-throttling / rate-limiter | `api-throttling-service.ts`, `rate-limiter-service.ts` |
| api-analytics / api-cache | `api-analytics-service.ts`, `api-cache-service.ts` |
| api-marketplace | `api-marketplace-service.ts` |
| swagger | `swagger-service.ts` |
| load-balancer / request-router | `load-balancer-service.ts`, `request-router-service.ts` |
| canary-deploy | `canary-deploy-service.ts` |
| cdn | `cdn-service.ts` |
| distributed-cache / db-pool | `distributed-cache-service.ts`, `db-pool-service.ts` |

### Jarvis (IA) — `server/services/jarvis/`
| Serviço | Caminho (doador) |
|---|---|
| nlu-engine | `server/services/jarvis/nlu-engine.ts` |
| dialog-manager | `server/services/jarvis/dialog-manager.ts` |
| skill-orchestrator | `server/services/jarvis/skill-orchestrator.ts` |
| knowledge-base-service | `server/services/jarvis/knowledge-base-service.ts` |
| jarvis-core / advanced-skills | `jarvis-core.ts`, `advanced-skills.ts` |

### Integrações externas — `server/services/integrations/`
| Serviço | Caminho (doador) |
|---|---|
| GA4 | `integrations/ga4-service.ts` |
| HubSpot | `integrations/hubspot-service.ts` |
| LinkedIn | `integrations/linkedin-service.ts` |
| Meta Pixel | `integrations/meta-pixel-service.ts` |
| RD Station | `integrations/rdstation-service.ts` |
| Webhook (bidirecional/dispatcher) | `webhook-bidirectional-service.ts`, `webhook-dispatcher-service.ts` |

### Comunicação / Marketing (doador-only)
whatsapp, whatsapp-business, sms, push/web-push, sendgrid, smtp-email, email-marketing,
email-template, lead-scoring, crm-integration, evolution, workflow-automation, ab-testing,
auto-optimization, code-review, export, migration, weekly/business-metrics report.

---

## 3. PÁGINAS FRONTEND (`client/src/pages/`)

Mestra: 100 páginas (23 `Admin*.tsx`). Doador: 159 páginas (69 `Admin*.tsx`, +6 no subdir `admin/`).

### Grandes categorias que só existem no doador
| Categoria | Página(s) no doador | Existe na mestra? |
|---|---|:--:|
| Ebook | `Ebook.tsx`, `AdminEbook.tsx` | Não |
| Fundamentação Científica | `FundamentacaoCientifica.tsx`, `AdminFundamentacao.tsx` | Não (mestra tem `Ciencia.tsx`) |
| WhiteLabel (página) | `WhiteLabel.tsx` | Não (só backend) |
| MultiOrg | `MultiOrg.tsx` | Não |
| Marketplace | `Marketplace.tsx` | Não |
| Videoconferência | `Videoconferencia.tsx` | Não |
| Assinatura Digital | `AssinaturaDigital.tsx` | Não |
| Kanban | `Kanban.tsx` | Não |
| OKRs | `OKRs.tsx` | Não |
| Portfolio | `Portfolio.tsx` | Não |
| Comunidade / Feed | `Feed.tsx`, `Wiki.tsx`, `Mensagens.tsx` | Parcial (mestra tem `Comunidade.tsx`) |
| Workspace / Dashboard BI | `Workspace.tsx`, `DashboardBI.tsx`, `Dashboard.tsx` | Não |
| Gamificação avançada | `Leaderboard.tsx`, `Missoes.tsx`, `Conquistas.tsx`, `Fidelidade.tsx` | Não |
| Mentoria / Especialista | `Mentores.tsx`, `AgendarMentoria.tsx`, `FaleEspecialista.tsx` | Não |
| Automações | `Automacoes.tsx`, `AdminAutomacoesDashboard.tsx` | Não |
| Exportação | `ExportarDados.tsx`, `ExportarRelatorios.tsx`, `ExportarConfiguracoes.tsx` | Não |
| ~69 `Admin*.tsx` | (46 a mais que a mestra) | Parcial |

**Admin*.tsx só no doador (destaques):** `AdminABTesting`, `AdminObservabilidade`, `AdminSSO`,
`AdminVersionamento`, `AdminROIMarketing`, `AdminReceita`, `AdminCohorts`, `AdminFunil`,
`AdminRedesSociais`, `AdminIntegracaoZapier`, `AdminTracking`, `AdminTendencias`, `AdminMetas`,
`AdminEbook`, `AdminFundamentacao`, `AdminChatHistory`, `AdminDocumentos`, `AdminComentarios`,
`AdminEngajamento`, `AdminDashboardUnificado`, entre outros.

---

## 4. BANCO DE DADOS (Drizzle)

Mestra: 81 tabelas em `/home/user/impact7-platform/drizzle/schema.ts`, 8 migrations.
Doador: 74 tabelas em `drizzle/schema.ts`, **16 migrations** (0000–0015).

### Tabelas que só existem no doador (52 tabelas)
Agrupadas por domínio:

| Domínio | Tabelas |
|---|---|
| Afiliados / Parceiros | `affiliates`, `partnerRequests`, `partnerDocuments`, `loyaltyTransactions` |
| Ebook / Conteúdo | `ebookVersions`, `blogArticles`, `blogComments`, `contentAnalytics`, `contentTags`, `contentVersions`, `scheduledPublications` |
| Cursos / Módulos | `courseModules`, `impact7Modules` |
| Fundamentação científica | `scientificFoundations` |
| Jarvis avançado (RAG) | `jarvisConversations`, `jarvisDocuments`, `jarvisDocumentChunks`, `jarvisFeedback`, `jarvisSkills`, `jarvisSkillLogs`, `knowledgeBase`, `chatHistory`, `chatFeedback`, `frequentQuestions` |
| IAM avançado | `accessRequests`, `policies`, `activityLogs` |
| Integrações | `integrationConfigs`, `socialIntegrations`, `socialPosts` |
| Webhooks (observ.) | `webhookEndpoints`, `webhookLogs`, `webhookDeliveryLogs` |
| Observabilidade / Métricas | `systemMetrics`, `systemAlerts`, `systemConfigs`, `publicMetrics`, `alertRules`, `alertPreferences` |
| Notificações / Push | `pushSubscriptions` |
| Email | `emailTemplates`, `emailLogs` |
| Relatórios / Roadmap / Metas | `scheduledReports`, `roadmapItems`, `adminGoals`, `projects` |
| Conteúdo genérico | `faqs`, `glossaryTerms`, `resources`, `tags`, `favorites`, `seoSettings` |

> A mestra tem, em contrapartida, tabelas exclusivas de SET7 (`set7*`), CMS (`cmsPages`),
> OAuth (`oauthClients/AuthCodes/Tokens`), 2FA, tokens de impacto e RBAC granular
> — que **não** devem ser perdidas na migração.

---

## 5. INFRA / DEPLOY

| Artefato | impact7-platform | Projeto-impact7 | Caminho no doador |
|---|:--:|:--:|---|
| railway.json | **Não** | Sim | `railway.json` |
| nixpacks.toml | **Não** | Sim | `nixpacks.toml` |
| Procfile | **Não** | Sim | `Procfile` (`web: pnpm start`) |
| k8s/deployment.yaml | **Não** | Sim | `k8s/deployment.yaml` |
| load-tests (k6) | **Não** | Sim | `load-tests/k6-config.js` |
| .env.example | **Não** | Sim | `.env.example` |
| Dockerfile | Não | Não | Ausente em ambos |

**Falta migrar (infra):** todos os 6 artefatos acima. O `railway.json` do doador usa healthcheck
em `/api/health` (que depende do `health-router.ts`, também ausente na mestra).

---

## PLANO DE MIGRAÇÃO PRIORIZADO

Prioridade: **P0** (bloqueia produção/deploy) · **P1** (alto valor de negócio) ·
**P2** (valor médio) · **P3** (nice-to-have). Esforço: baixo / médio / alto.

### Onda 1 — Fundação de deploy e produção
| Item | Camada | Prio | Esforço |
|---|---|:--:|:--:|
| Infra deploy (railway.json, nixpacks.toml, Procfile, .env.example) | Infra | P0 | Baixo |
| `health-router.ts` + health-service (healthcheck do Railway) | Backend | P0 | Baixo |
| k8s/deployment.yaml + load-tests/k6 | Infra | P1 | Baixo |
| Serviços de resiliência (circuit-breaker, retry, saga, graceful-shutdown) | Serviços | P1 | Médio |
| Observabilidade (prometheus, tracing, slo, rum, log-aggregation) | Serviços | P1 | Médio |

### Onda 2 — Segurança, API management e comunicação
| Item | Camada | Prio | Esforço |
|---|---|:--:|:--:|
| Segurança (waf, ddos, encryption, secrets-manager, vuln-scanner, mfa) | Serviços | P1 | Alto |
| IAM avançado (`iam*` routers + `policies`/`accessRequests`/`activityLogs`) | Backend + DB | P1 | Alto |
| API management (gateway, registry, versioning, throttling, swagger) | Serviços | P2 | Alto |
| WhatsApp + WhatsApp Business (routers + services) | Backend | P1 | Médio |
| Integrações externas (GA4, HubSpot, LinkedIn, Meta Pixel, RD Station) | Serviços + DB | P1 | Médio |
| SEO (`seo-router.ts` + `seoSettings`) | Backend + DB | P2 | Baixo |
| Storage/S3 router | Backend | P2 | Baixo |

### Onda 3 — Produto, conteúdo e telas
| Item | Camada | Prio | Esforço |
|---|---|:--:|:--:|
| Jarvis avançado (nlu-engine, dialog-manager, skill-orchestrator, RAG tables) | Serviços + DB | P1 | Alto |
| Afiliados + Parceiros + Fidelidade (routers + 4 tabelas) | Full-stack | P2 | Médio |
| Ebook (router + página + `ebookVersions`) | Full-stack | P2 | Médio |
| Fundamentação Científica (página + `scientificFoundations`) | Full-stack | P2 | Baixo |
| Novas telas de produto (Kanban, OKRs, Portfolio, Marketplace, MultiOrg, Videoconferência, Assinatura Digital) | Frontend | P3 | Alto |
| ~46 páginas `Admin*.tsx` adicionais + `admin/` subdir | Frontend | P2 | Alto |
| Comunidade/Feed/Wiki/Mensagens | Frontend | P3 | Médio |
| Email marketing (templates, logs, campanhas) | Full-stack | P2 | Médio |
| Conteúdo genérico (faqs, glossaryTerms, resources, tags, favorites) | Full-stack | P3 | Baixo |

### Regras de convivência (guardas)
- **Não sobrescrever** o que é exclusivo da mestra: `set7*`, `cmsPages`, OAuth, 2FA,
  `impactTokens/impactCertificates`, RBAC granular, `blog/forum/events/courses/careers` já dedicados.
- Doador e mestra usam nomes de tabela divergentes para o mesmo domínio (ex.: `blogPosts` vs
  `blogArticles`, `caseFavorites` vs `favorites`, `knowledgeDocuments` vs `knowledgeBase`).
  Cada migração de tabela exige **reconciliação de schema**, não cópia direta.
- Migrar migrations do doador (0008–0015) exige rebase sobre as 8 migrations existentes da mestra.
