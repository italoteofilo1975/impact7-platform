# Inventário Inicial do Sistema IMPACT7 (v0.1)

**Data:** 2026-01-24  
**Sistema:** IMPACT7 Platform  
**URL:** https://3000-i5angn12h41ykgeegpwch-56e44013.us2.manus.computer  
**Total de Telas:** 88 páginas React

---

## 1. MÓDULOS DO SISTEMA

### MOD-01: Homepage e Institucional (Público)
**Descrição:** Páginas públicas de apresentação do método IMPACT7, conteúdo institucional e marketing.

**Telas:**
- `TEL-HOME-01` — Home (/)
- `TEL-INST-01` — Sobre (/sobre)
- `TEL-INST-02` — Ciência (/ciencia)
- `TEL-INST-03` — Matemática (/matematica)
- `TEL-INST-04` — Tecnologia (/tecnologia)
- `TEL-INST-05` — Metodologia (/metodologia)
- `TEL-INST-06` — Parceiros (/parceiros)
- `TEL-INST-07` — Carreiras (/carreiras)
- `TEL-INST-08` — Contato (/contato)
- `TEL-INST-09` — Blog (/blog)
- `TEL-INST-10` — FAQ (/faq)
- `TEL-INST-11` — FAQ Interativo (/faq-interativo)
- `TEL-INST-12` — Glossário (/glossario)
- `TEL-INST-13` — Recursos (/recursos)
- `TEL-INST-14` — Segurança (/seguranca)
- `TEL-INST-15` — Política de Privacidade (/politica-privacidade)
- `TEL-INST-16` — Termos de Uso (/termos-de-uso)
- `TEL-INST-17` — Certificações (/certificacoes)
- `TEL-INST-18` — Conformidade SET7 (/conformidade-set7)

**Perfis de Acesso:** Público (sem autenticação)

**Dependências:**
- APIs: `whiteLabel.getConfig`, `systemSettings.getAll`
- Entidades: `whiteLabelConfig`, `systemSettings`

---

### MOD-02: Whitepaper e Downloads (Público/Lead)
**Descrição:** Páginas de download de materiais (whitepaper, e-book) com captura de leads.

**Telas:**
- `TEL-DOWN-01` — Whitepaper (/whitepaper)
- `TEL-DOWN-02` — Newsletter (/newsletter)

**Perfis de Acesso:** Público (captura de leads)

**Dependências:**
- APIs: `leads.create`, `whitepaperDownloads.create`, `ebookDownloads.create`, `newsletterSubscribers.create`
- Entidades: `leads`, `whitepaperDownloads`, `ebookDownloads`, `newsletterSubscribers`

---

### MOD-03: Calculadora de Impacto (Público/Usuário)
**Descrição:** Calculadora interativa da equação I = (E × C⁷) / R com geração de relatórios PDF.

**Telas:**
- `TEL-CALC-01` — Calculadora (/calculadora)
- `TEL-CALC-02` — Impact Dashboard (/impact-dashboard)

**Perfis de Acesso:** Público (anônimo) / Usuário autenticado (histórico)

**Dependências:**
- APIs: `calculations.create`, `calculations.list`, `calculations.getById`, PDF generation
- Entidades: `calculations`
- Integrações: jsPDF (geração de PDF)

---

### MOD-04: Cases de Sucesso (Público/Usuário)
**Descrição:** Biblioteca de cases de sucesso, submissão de cases, favoritos e comparação.

**Telas:**
- `TEL-CASE-01` — Cases (/cases)
- `TEL-CASE-02` — Casos de Sucesso (/casos-sucesso)
- `TEL-CASE-03` — Case Submit (/case-submit)
- `TEL-CASE-04` — Case Compare (/case-compare)
- `TEL-CASE-05` — Favorites (/favorites)

**Perfis de Acesso:** Público (leitura) / Usuário autenticado (submissão, favoritos)

**Dependências:**
- APIs: `caseSubmissions.list`, `caseSubmissions.create`, `caseFavorites.toggle`, `caseTags.list`
- Entidades: `caseSubmissions`, `caseFavorites`, `caseTags`, `caseTagRelations`
- Integrações: PDF generation (cases)

---

### MOD-05: Jarvis AI Chat (Usuário)
**Descrição:** Assistente de IA Jarvis com base de conhecimento SET7, memória e relatórios.

**Telas:**
- `TEL-JARV-01` — Jarvis Memory (/jarvis-memory)
- `TEL-JARV-02` — Jarvis Reports (/jarvis-reports)

**Perfis de Acesso:** Usuário autenticado

**Dependências:**
- APIs: `jarvis.chat`, `jarvis.skills`, `jarvis.memory`, `jarvis.reports`, `jarvisAnalytics.*`
- Entidades: `jarvisConversations`, `jarvisMessages`, `jarvisMemory`, `jarvisAnalytics`
- Integrações: LLM (invokeLLM), Knowledge Base

---

### MOD-06: Autenticação e Perfil (Usuário)
**Descrição:** Sistema de login, autenticação, 2FA, perfil e onboarding.

**Telas:**
- `TEL-AUTH-01` — Login (/login)
- `TEL-AUTH-02` — Login Local (/login-local)
- `TEL-AUTH-03` — Quick Login (/quick-login)
- `TEL-AUTH-04` — Verify 2FA (/verify-2fa)
- `TEL-AUTH-05` — Profile (/profile)
- `TEL-AUTH-06` — Onboarding (/onboarding)

**Perfis de Acesso:** Público (login) / Usuário autenticado (perfil)

**Dependências:**
- APIs: `auth.login`, `auth.logout`, `auth.me`, `twoFactorAuth.*`
- Entidades: `users`, `twoFactorAuth`
- Integrações: JWT, HttpOnly cookies

---

### MOD-07: Notificações e Preferências (Usuário)
**Descrição:** Sistema de notificações push, preferências e histórico.

**Telas:**
- `TEL-NOTIF-01` — Notificações (/notificacoes)
- `TEL-NOTIF-02` — Notification Preferences (/notification-preferences)
- `TEL-NOTIF-03` — Notification Settings (/notification-settings)

**Perfis de Acesso:** Usuário autenticado

**Dependências:**
- APIs: `notifications.*`, `notificationPreferences.*`
- Entidades: `notifications`, `notificationPreferences`

---

### MOD-08: Gamificação e Tokens (Usuário)
**Descrição:** Sistema de pontos, badges, leaderboard e tokens de impacto.

**Telas:**
- `TEL-GAMIF-01` — Impact Tokens (/impact-tokens)
- `TEL-GAMIF-02` — Meus Certificados (/meus-certificados)
- `TEL-GAMIF-03` — Certificate Verify (/certificate-verify)

**Perfis de Acesso:** Usuário autenticado

**Dependências:**
- APIs: `gamification.*`, `certificates.*`, `impactTokens.*`
- Entidades: `userPoints`, `badges`, `userBadges`, `certificates`, `impactTokens`
- Integrações: QR Code (qrcode), Blockchain (opcional)

---

### MOD-09: Pagamentos e Planos (Usuário)
**Descrição:** Sistema de assinaturas, checkout Stripe e gerenciamento de planos.

**Telas:**
- `TEL-PAY-01` — Preços (/precos)
- `TEL-PAY-02` — Comparação (/comparacao)
- `TEL-PAY-03` — Payments (/payments)
- `TEL-PAY-04` — Checkout Success (/checkout-success)

**Perfis de Acesso:** Público (preços) / Usuário autenticado (checkout)

**Dependências:**
- APIs: `stripe.createCheckoutSession`, `stripe.createPortalSession`
- Entidades: `subscriptions`, `payments`
- Integrações: Stripe

---

### MOD-10: API Pública e Webhooks (Usuário/Developer)
**Descrição:** API Keys, OAuth, Webhooks, documentação e playground.

**Telas:**
- `TEL-API-01` — API Docs (/api-docs)
- `TEL-API-02` — API Keys (/api-keys)
- `TEL-API-03` — API Playground (/api-playground)
- `TEL-API-04` — API Status (/api-status)
- `TEL-API-05` — API Changelog (/api-changelog)
- `TEL-API-06` — OAuth Clients (/oauth-clients)
- `TEL-API-07` — OAuth Authorize (/oauth-authorize)
- `TEL-API-08` — Webhooks (/webhooks)

**Perfis de Acesso:** Usuário autenticado (developer)

**Dependências:**
- APIs: `apiKeys.*`, `oauthClients.*`, `webhooks.*`
- Entidades: `apiKeys`, `oauthClients`, `webhooks`, `webhookDeliveries`

---

### MOD-11: Comunidade e Engajamento (Usuário)
**Descrição:** Programa de referrals, early adopters, webinars, comunidade.

**Telas:**
- `TEL-COMM-01` — Comunidade (/comunidade)
- `TEL-COMM-02` — Referrals (/referrals)
- `TEL-COMM-03` — Early Adopters (/early-adopters)
- `TEL-COMM-04` — Webinars (/webinars)
- `TEL-COMM-05` — Depoimentos (/depoimentos)

**Perfis de Acesso:** Público / Usuário autenticado

**Dependências:**
- APIs: `referrals.*`, `earlyAdopters.*`, `webinars.*`
- Entidades: `referrals`, `earlyAdopters`, `webinars`, `testimonials`

---

### MOD-12: Recursos e Integrações (Público/Usuário)
**Descrição:** Integrações, roadmap, status, demo, guia de início.

**Telas:**
- `TEL-REC-01` — Integrações (/integracoes)
- `TEL-REC-02` — Roadmap (/roadmap)
- `TEL-REC-03` — Status (/status)
- `TEL-REC-04` — Demo (/demo)
- `TEL-REC-05` — Guia de Início (/guia-inicio)
- `TEL-REC-06` — Suporte (/suporte)
- `TEL-REC-07` — Security (/security)

**Perfis de Acesso:** Público / Usuário autenticado

**Dependências:**
- APIs: `integrations.*`, `roadmap.*`, `status.*`
- Entidades: `integrations`, `roadmap`, `statusIncidents`

---

### MOD-13: Dashboard Admin (Admin)
**Descrição:** Painel administrativo com 18 módulos de gestão.

**Telas:**
- `TEL-ADM-01` — Admin Dashboard (/admin)
- `TEL-ADM-02` — Admin Leads (/admin/leads)
- `TEL-ADM-03` — Admin Contacts (/admin/contacts)
- `TEL-ADM-04` — Admin Downloads (/admin/downloads)
- `TEL-ADM-05` — Admin Analytics (/admin/analytics)
- `TEL-ADM-06` — Admin Monitoring (/admin/monitoring)
- `TEL-ADM-07` — Admin Case Review (/admin/case-review)
- `TEL-ADM-08` — Admin Tags (/admin/tags)
- `TEL-ADM-09` — Admin Tokens Dashboard (/admin/tokens-dashboard)
- `TEL-ADM-10` — Admin Templates (/admin/templates)
- `TEL-ADM-11` — Admin System Metrics (/admin/system-metrics)
- `TEL-ADM-12` — Admin Alerts (/admin/alerts)
- `TEL-ADM-13` — Admin Audit (/admin/audit)
- `TEL-ADM-14` — Admin Reports (/admin/reports)
- `TEL-ADM-15` — Admin Business Metrics (/admin/business-metrics)
- `TEL-ADM-16` — Admin Advanced (/admin/advanced)
- `TEL-ADM-17` — Admin Settings (/admin/settings)
- `TEL-ADM-18` — Admin API Metrics (/admin/api-metrics)
- `TEL-ADM-19` — SET7 Dashboard (/admin/set7-dashboard)

**Perfis de Acesso:** Admin (role: admin)

**Dependências:**
- APIs: Todos os routers administrativos (leads, contacts, analytics, monitoring, etc)
- Entidades: Todas as tabelas do sistema
- Integrações: Todas as integrações (LLM, PDF, QR Code, Email, etc)

---

### MOD-14: Componentes e Utilitários (Interno)
**Descrição:** Páginas de showcase e utilitários internos.

**Telas:**
- `TEL-UTIL-01` — Component Showcase (/component-showcase)
- `TEL-UTIL-02` — Not Found (/404)

**Perfis de Acesso:** Público / Desenvolvedor

**Dependências:** Nenhuma

---

## 2. PERFIS DE USUÁRIO

### PERFIL-01: Visitante Público
**Permissões:**
- Acessar homepage e páginas institucionais
- Baixar whitepaper (com captura de lead)
- Usar calculadora de impacto (sem histórico)
- Visualizar cases de sucesso
- Visualizar preços e planos

**Restrições:**
- Não pode submeter cases
- Não pode usar Jarvis AI
- Não pode acessar dashboard admin

---

### PERFIL-02: Usuário Autenticado
**Permissões:**
- Todas as permissões do Visitante Público
- Usar Jarvis AI com histórico e memória
- Submeter cases de sucesso
- Favoritar cases
- Salvar histórico de cálculos
- Gerenciar perfil e notificações
- Acessar gamificação (pontos, badges, tokens)
- Criar API Keys e OAuth Clients
- Configurar Webhooks
- Participar de programa de referrals

**Restrições:**
- Não pode acessar dashboard admin

---

### PERFIL-03: Admin (Super Admin)
**Permissões:**
- Todas as permissões do Usuário Autenticado
- Acessar dashboard admin completo (18 módulos)
- Gerenciar leads, contatos, downloads
- Revisar e aprovar cases submetidos
- Visualizar analytics e métricas de negócio
- Configurar sistema (settings, templates, tags)
- Gerenciar alertas e auditoria
- Visualizar logs e métricas de API
- Configurar notificações automáticas

**Restrições:** Nenhuma

---

## 3. INTEGRAÇÕES EXTERNAS

### INT-01: LLM (Jarvis AI)
**Serviço:** Manus Built-in LLM API  
**Uso:** Chat com Jarvis, geração de conteúdo, análise de dados  
**Endpoints:** `invokeLLM()`  
**Autenticação:** BUILT_IN_FORGE_API_KEY

---

### INT-02: Storage S3
**Serviço:** Manus Built-in S3  
**Uso:** Upload de arquivos, imagens, PDFs  
**Endpoints:** `storagePut()`, `storageGet()`  
**Autenticação:** Automática

---

### INT-03: Notification Service
**Serviço:** Manus Built-in Notification API  
**Uso:** Notificações push para o owner  
**Endpoints:** `notifyOwner()`  
**Autenticação:** BUILT_IN_FORGE_API_KEY

---

### INT-04: Stripe
**Serviço:** Stripe Payment Gateway  
**Uso:** Checkout, assinaturas, pagamentos  
**Endpoints:** `createCheckoutSession()`, `createPortalSession()`  
**Autenticação:** STRIPE_SECRET_KEY (não configurado)

---

### INT-05: Email Service
**Serviço:** SMTP (não configurado)  
**Uso:** Emails transacionais, notificações  
**Endpoints:** `sendEmail()`  
**Autenticação:** SMTP credentials (pendente)

---

## 4. BANCO DE DADOS (48 TABELAS)

### Principais Entidades:
- **users** — Usuários do sistema
- **leads** — Leads capturados
- **contacts** — Mensagens de contato
- **whitepaperDownloads** — Downloads de whitepaper
- **ebookDownloads** — Downloads de e-book
- **newsletterSubscribers** — Inscritos na newsletter
- **calculations** — Cálculos da calculadora
- **caseSubmissions** — Cases submetidos
- **caseFavorites** — Cases favoritados
- **caseTags** — Tags de cases
- **jarvisConversations** — Conversas com Jarvis
- **jarvisMessages** — Mensagens do Jarvis
- **jarvisMemory** — Memória do Jarvis
- **jarvisAnalytics** — Analytics do Jarvis
- **notifications** — Notificações
- **notificationPreferences** — Preferências de notificações
- **userPoints** — Pontos de gamificação
- **badges** — Badges disponíveis
- **userBadges** — Badges conquistados
- **certificates** — Certificados emitidos
- **impactTokens** — Tokens de impacto
- **apiKeys** — API Keys
- **oauthClients** — OAuth Clients
- **webhooks** — Webhooks configurados
- **webhookDeliveries** — Entregas de webhooks
- **referrals** — Programa de referrals
- **subscriptions** — Assinaturas
- **payments** — Pagamentos
- **systemSettings** — Configurações do sistema
- **whiteLabelConfig** — Configuração white label
- **auditLogs** — Logs de auditoria
- **alerts** — Alertas do sistema
- **errorLogs** — Logs de erros

---

## 5. DEPENDÊNCIAS FALTANTES (BLOQUEIOS)

### BLOQ-01: jsPDF
**Status:** ❌ Não instalado  
**Impacto:** Geração de PDFs (calculadora, cases) não funciona  
**Ação:** `pnpm add jspdf`

---

### BLOQ-02: qrcode
**Status:** ❌ Não instalado  
**Impacto:** Geração de QR Codes (certificados) não funciona  
**Ação:** `pnpm add qrcode`

---

### BLOQ-03: TypeScript Errors (334 erros)
**Status:** ⚠️ Warnings (não bloqueiam execução)  
**Impacto:** Qualidade de código, manutenibilidade  
**Ação:** Corrigir tipos implícitos (any) em websocket-service.ts e outros arquivos

---

## 6. PRÓXIMOS PASSOS

1. **Instalar dependências faltantes** (jsPDF, qrcode)
2. **Criar Mapa de Erros e Inconsistências** (FASE 0 - Artefato D)
3. **Criar Plano de Dados de Teste** (FASE 0 - Artefato C)
4. **Criar Backlog de Microtarefas** (FASE 0 - Artefato E)
5. **Iniciar FASE 1** (Testes E2E tela a tela)

---

**Inventário criado por:** Agente Lead QA (SET7)  
**Versão:** 0.1  
**Status:** ✅ Completo
