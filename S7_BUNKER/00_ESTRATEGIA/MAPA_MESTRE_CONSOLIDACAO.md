# Mapa-Mestre de Consolidação — Método Impacta Sete / Ecossistema IMTS

> Documento de decisão estratégica. Base para retomada e continuidade do projeto.
> **Data:** 2026-07-16 · **Autor da consolidação:** sessão de análise IMTS · **Status:** DRAFT para validação do fundador (Italo)

---

## 0. Objetivo Original (âncora)

> *"Analisar integralmente os dois projetos para retomar e consolidar a construção do **Método Impacta Sete** (SET7) e sua plataforma, entendendo onde parei — tanto no método quanto na plataforma — e continuar a evolução, pois isso é vital a partir de agora para o ecossistema IMTS."*

Este documento existe para transformar a análise em **decisão + rota de execução**.

---

## 1. O achado central: existem DUAS gerações do mesmo produto

| Dimensão | `impact7-platform` (esta base) | `Projeto-impact7` (o outro repo) |
|---|---|---|
| **Papel** | Linha de **governança + método formalizado** | Linha de **features + produto amplo** |
| **Maturidade de método** | Alta — SET7 **codificado em TS** (`shared/set7-methodology.ts`) + governança `S7_BUNKER` | Média — método em **docs** (`docs/METODO_SET7_REFERENCIA.md`), não codificado |
| **Maturidade de features** | Média — ~91–100 páginas, ~15 routers | **Alta** — ~159 páginas, ~30 domínios de router, ~90 serviços |
| **Autenticação** | JWT próprio (bcrypt + cookie httpOnly) | OAuth Manus + JWT |
| **Banco** | MySQL, ~64 tabelas | MySQL, ~75 tabelas, 16 migrations |
| **Infra de deploy** | Não há (dependia do hosting Manus) | **Pronta**: Railway + Nixpacks + Procfile + K8s (3 réplicas, Prometheus) + k6 load-tests |
| **IA (Jarvis)** | Router `jarvis` + testes | Serviços `jarvis/` (NLU, dialog, skills) — mas **RAG/embeddings ❌ pendente** |
| **Qualidade declarada** | **420/420 testes, 0 erros TS** (commits recentes) | v28, 639+ features, 64 testes |
| **Estado git** | Ativo, multi-commit, branch de trabalho | Snapshot de 1 commit (export) |
| **Pagamentos** | — | Stripe (sandbox, quase pronto p/ produção) |
| **Governança** | `S7_BUNKER` (REF, INT, ARCH, DNA, GLOSSÁRIO, backlog soberano, colisão Coder≠Auditor) | Ausente |

**Leitura estratégica:** não são dois produtos concorrentes — são **duas metades complementares**. Uma tem a *alma* (método + governança), a outra tem o *corpo* (features + infra). A consolidação é reunir as duas.

---

## 2. Decisão adotada (sujeita a veto do fundador)

- **Linha-mestra = `impact7-platform`.**
  Racional: é a base onde o método já é *código* e onde existe governança (S7_BUNKER, DNA, backlog soberano, processo de colisão). Reconstruir governança sobre a outra base custaria mais do que portar features para cá.
- **`Projeto-impact7` = repositório doador.** Migramos dele, em ondas, as features e a infra que faltam.
- **Trilha de método:** unificar as três camadas conceituais (ver §4) num documento canônico único — hoje elas estão **espalhadas e com divergências** (ex.: os nomes dos "7 C's" divergem entre `set7-methodology.ts` e `Matematica.tsx`).

> ⚠️ Se você preferir **fusão formal** (nova base limpa) ou eleger `Projeto-impact7` como núcleo, este é o ponto de vetar. A rota abaixo assume `impact7-platform` como mestra.

---

## 3. Onde você parou — PLATAFORMA

**Já consolidado nesta base (`impact7-platform`):**
- Metodologia SET7 embutida em código; calculadora S-ROI e Equação de Impacto; 420/420 testes; 0 erros TS (a validar nesta sessão).
- Sprint "Zero Mock" concluída (dados reais, sem hardcode): blog, eventos, fórum, cursos com aulas, carreiras, busca global, gamificação (badges/pontos), CMS institucional, audit trail + RBAC, error logging estruturado.
- Correções recentes: cookie-parser (auth.me), redirecionamento pós-login, schema de badges/userPoints, 404 em PT, navbar completa.

**O que o `BACKLOG_SOBERANO.json` ainda lista como pendente (governança SET7, meta 85/100):**
- `CONF-001` **$INT.md** (constituição das 7 dimensões) — CRÍTICO
- `CONF-003` ARCH_MANIFEST com Bounded Contexts, `CONF-005` TASKLOG com hash, `CONF-007` processo de Colisão executado
- `CONF-008` cobertura E2E ≥50%, `CONF-010` SECURITY_MATRIX (classificação C1-C5), `CONF-012` ROI Biológico
- `CONF-011/015/016` **SAST (Snyk), CI/CD, Sentry** — requerem contas externas

**Pendências externas (de `TAREFAS_EXTERNAS.md` + `CHECKLIST_LANCAMENTO`):** publicar em produção, testes de carga (k6), observabilidade (Datadog/Sentry), auditoria de segurança (OWASP ZAP/Snyk), **Stripe produção**, **SendGrid**, **domínio próprio**, **compliance LGPD** (cookies, política, DSAR).

---

## 4. Onde você parou — MÉTODO (as três camadas)

O "Método Impacta Sete" hoje é, na verdade, **três frameworks** que precisam ser reconciliados num só cânone:

1. **Os 7 Pilares "I"** (inovação social / produto): Imersão · Ideação · Implementação · Iteração · Impacto · Inspiração · Independência.
2. **A Equação do Impacto** (modelo matemático): **I = (E × C⁷) / R** — Impacto = (Energia/Engajamento × Contexto⁷) / Resistência, com os **7 C's** + o **S-ROI**.
3. **O Método SET7** (engenharia de sistemas): 7 fases (SET7.01→07, estendidas a 14) com gates e artefatos por fase; aderência medida em ~86% no `Projeto-impact7`.

> ⚠️ **Divergência crítica já detectada** — os "7 C's" têm **dois conjuntos de nomes diferentes** entre as fontes:
> - `shared/set7-methodology.ts`: Consciência, Competência, Conexão, Colaboração, Criatividade, Compromisso, Continuidade.
> - `Projeto-impact7/.../Matematica.tsx`: Cultural, Comunitário, Capacitário, Conectivo, Cognitivo, Colaborativo, Continuativo.
>
> Isto precisa de **decisão do fundador** para canonizar. (O documento `METODO_IMPACTA_SETE_CANONICO.md`, sendo gerado nesta sessão, consolida todas as divergências.)

---

## 5. Rota de execução consolidada (por ondas)

### Onda 0 — Fundação e Decisão *(este ciclo, automatizável agora)*
- [x] Análise integral dos dois repos
- [~] Documento-mestre de consolidação (este arquivo)
- [~] `METODO_IMPACTA_SETE_CANONICO.md` (cânone das 3 camadas + divergências) — *agente em execução*
- [~] `MATRIZ_MIGRACAO_FEATURES.md` (o que portar do doador) — *agente em execução*
- [x] Validação técnica de terreno — **confirmado nesta sessão: `tsc --noEmit` = 0 erros; `vitest` = 420/420 testes (29 arquivos)**
- [ ] **Decisão do fundador** sobre linha-mestra e nomes dos 7 C's

### Onda 1 — Núcleo de método + governança (interno, sem dependência externa)
- `$INT.md` (CONF-001), ARCH_MANIFEST (CONF-003), SECURITY_MATRIX (CONF-010), ROI Biológico (CONF-012)
- Reconciliar os 7 C's no código (`set7-methodology.ts`) conforme decisão

### Onda 2 — Migração de features do doador (portes de alto valor)
- Migrar routers/serviços ausentes: PDF, SEO/sitemap, backup, health, WhatsApp, IAM avançado, tickets, affiliates/partners
- Portar páginas de método faltantes (Matematica, FundamentacaoCientifica, Ebook) e enterprise (WhiteLabel, MultiOrg)

### Onda 3 — Núcleo de IA (Jarvis + RAG)
- Tabela `knowledge_base`, pipeline de chunking/embeddings, busca vetorial, Skills 17–24

### Onda 4 — Lançamento (requer ação externa do fundador)
- Infra de deploy (portar Railway/K8s), CI/CD (CONF-015), Sentry (CONF-016), SAST (CONF-011)
- Stripe produção, SendGrid, domínio, LGPD → executar `CHECKLIST_LANCAMENTO`

---

## 6. Dependências externas que só VOCÊ pode destravar

Estas travam a Onda 4 e parte da 3. Recomendo já ir provisionando:
- **Contas/*secrets*:** Stripe (produção), SendGrid (+domínio verificado), OpenAI (ou provedor LLM p/ Jarvis/RAG), Snyk, Sentry, provedor de deploy (Railway/Vercel/K8s).
- **Domínio** (ex.: `metodoimpact7.com` / `impact7.com.br`) + DNS + SSL.
- **Decisões de método:** nomes canônicos dos 7 C's; escopo do lançamento (o que entra no v1 comercial).
- **Conteúdo real:** depoimentos/cases com autorização, textos legais (Termos, Privacidade), dados da empresa (CNPJ).

---

*Fim do Mapa-Mestre. Os documentos-irmãos (`METODO_IMPACTA_SETE_CANONICO.md` e `MATRIZ_MIGRACAO_FEATURES.md`) detalham as camadas 4 e 5.*
