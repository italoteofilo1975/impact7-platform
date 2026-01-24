# Mapa de Erros e Inconsistências — Sistema IMPACT7 (v0.1)

**Data:** 2026-01-24  
**Sistema:** IMPACT7 Platform  
**Objetivo:** Antecipar e mapear pontos frágeis por tela, API, dados e workflow

---

## 1. INCONSISTÊNCIAS POR MÓDULO

### MOD-01: Homepage e Institucional

#### TEL-HOME-01 — Homepage (/)
**Inconsistências Esperadas:**
- ❌ **UI/UX:** Botões "Calculate Impact" e "Download Whitepaper" podem não ter feedback visual claro ao clicar
- ⚠️ **Validação:** Formulário de captura de lead (se houver) pode não validar email
- ⚠️ **Performance:** Imagens grandes (og-image.png 5.7MB) podem causar lentidão no carregamento
- ⚠️ **Acessibilidade:** Widget de acessibilidade pode não estar visível em todas as resoluções
- ⚠️ **i18n:** Seletor de idiomas pode não persistir a escolha do usuário

**APIs Envolvidas:**
- `whiteLabel.getConfig` — Pode falhar se organizationId não existir (retorna default)
- `systemSettings.getAll` — Pode retornar array vazio se não houver settings

**Riscos de Dados:**
- Nenhum (página de leitura)

**Plano de Microtarefas:**
- MT-HOME-01: Testar carregamento da homepage em diferentes resoluções
- MT-HOME-02: Testar botões de CTA (Calculate Impact, Download Whitepaper)
- MT-HOME-03: Testar widget de acessibilidade (4 modos: contraste, fonte, cursor, leitura)
- MT-HOME-04: Testar seletor de idiomas (PT/EN/ES)
- MT-HOME-05: Testar theme switcher (dark/light)
- MT-HOME-06: Testar Jarvis chat (botão verde flutuante)

---

#### TEL-INST-01 a TEL-INST-18 — Páginas Institucionais
**Inconsistências Esperadas:**
- ⚠️ **Navegação:** Breadcrumbs podem não estar presentes em todas as páginas
- ⚠️ **Conteúdo:** Textos podem estar hardcoded (não vêm do CMS)
- ⚠️ **SEO:** Meta tags (title, description, og:image) podem estar faltando
- ⚠️ **Responsividade:** Layout pode quebrar em mobile

**APIs Envolvidas:**
- Nenhuma (conteúdo estático)

**Riscos de Dados:**
- Nenhum

**Plano de Microtarefas:**
- MT-INST-01: Testar navegação entre páginas institucionais
- MT-INST-02: Verificar presença de botões "Voltar" e "Home"
- MT-INST-03: Testar responsividade em mobile/tablet/desktop

---

### MOD-02: Whitepaper e Downloads

#### TEL-DOWN-01 — Whitepaper (/whitepaper)
**Inconsistências Esperadas:**
- ❌ **Validação:** Formulário de download pode não validar campos obrigatórios (nome, email, empresa)
- ❌ **API:** `leads.create` pode falhar se email já existir (duplicidade)
- ❌ **API:** `whitepaperDownloads.create` pode não registrar o download corretamente
- ⚠️ **UX:** Após submissão, usuário pode não receber feedback claro (modal, toast, redirect)
- ⚠️ **Download:** Link de download do PDF pode não funcionar (404)
- ⚠️ **Email:** Email de confirmação pode não ser enviado (SMTP não configurado)

**APIs Envolvidas:**
- `leads.create` — Pode retornar erro se email duplicado
- `whitepaperDownloads.create` — Pode falhar se leadId inválido
- `notifyOwner` — Pode falhar se serviço indisponível

**Riscos de Dados:**
- **Duplicidade:** Mesmo email pode gerar múltiplos leads
- **Integridade:** whitepaperDownloads pode ficar órfão se lead não for criado

**Plano de Microtarefas:**
- MT-DOWN-01: Testar formulário vazio (validação de campos obrigatórios)
- MT-DOWN-02: Testar formulário com email inválido
- MT-DOWN-03: Testar formulário com email duplicado
- MT-DOWN-04: Testar formulário válido (caminho feliz)
- MT-DOWN-05: Verificar se lead foi criado no banco (query)
- MT-DOWN-06: Verificar se download foi registrado no banco (query)
- MT-DOWN-07: Verificar se notificação foi enviada ao owner
- MT-DOWN-08: Testar download do PDF (link funcional)

---

#### TEL-DOWN-02 — Newsletter (/newsletter)
**Inconsistências Esperadas:**
- ❌ **Validação:** Formulário pode não validar email
- ❌ **API:** `newsletterSubscribers.create` pode falhar se email duplicado
- ⚠️ **UX:** Feedback após submissão pode ser confuso

**APIs Envolvidas:**
- `newsletterSubscribers.create`

**Riscos de Dados:**
- **Duplicidade:** Mesmo email pode ser inscrito múltiplas vezes

**Plano de Microtarefas:**
- MT-NEWS-01: Testar formulário vazio
- MT-NEWS-02: Testar formulário com email inválido
- MT-NEWS-03: Testar formulário com email duplicado
- MT-NEWS-04: Testar formulário válido
- MT-NEWS-05: Verificar registro no banco

---

### MOD-03: Calculadora de Impacto

#### TEL-CALC-01 — Calculadora (/calculadora)
**Inconsistências Esperadas:**
- ❌ **Validação:** Campos numéricos podem aceitar valores negativos ou zero
- ❌ **Cálculo:** Equação I = (E × C⁷) / R pode retornar Infinity se R = 0
- ❌ **Cálculo:** Resultado pode ser NaN se campos vazios
- ❌ **PDF:** Geração de PDF pode falhar (jsPDF não estava instalado)
- ⚠️ **UX:** Botão "Calcular" pode não ter loading state
- ⚠️ **Dados:** Cálculo pode não ser salvo se usuário não autenticado
- ⚠️ **Dados:** Histórico de cálculos pode não aparecer para usuário autenticado

**APIs Envolvidas:**
- `calculations.create` — Pode falhar se usuário não autenticado (anônimo)
- `calculations.list` — Pode retornar vazio se usuário não tiver cálculos
- PDF generation — Pode falhar se jsPDF não instalado

**Riscos de Dados:**
- **Validação:** R = 0 causa divisão por zero
- **Persistência:** Cálculos anônimos não são salvos

**Plano de Microtarefas:**
- MT-CALC-01: Testar formulário vazio (validação)
- MT-CALC-02: Testar valores negativos
- MT-CALC-03: Testar R = 0 (divisão por zero)
- MT-CALC-04: Testar cálculo válido (caminho feliz)
- MT-CALC-05: Verificar resultado exibido na UI
- MT-CALC-06: Testar geração de PDF
- MT-CALC-07: Testar salvamento no banco (usuário autenticado)
- MT-CALC-08: Testar histórico de cálculos (usuário autenticado)
- MT-CALC-09: Testar cálculo anônimo (não salva no banco)

---

#### TEL-CALC-02 — Impact Dashboard (/impact-dashboard)
**Inconsistências Esperadas:**
- ⚠️ **Autenticação:** Página pode ser acessível sem login
- ⚠️ **Dados:** Dashboard pode estar vazio se usuário não tiver cálculos
- ⚠️ **Gráficos:** Gráficos podem não renderizar se dados inválidos

**APIs Envolvidas:**
- `calculations.list`
- `calculations.getById`

**Riscos de Dados:**
- Nenhum (página de leitura)

**Plano de Microtarefas:**
- MT-DASH-01: Testar acesso sem autenticação (deve redirecionar para login)
- MT-DASH-02: Testar dashboard vazio (sem cálculos)
- MT-DASH-03: Testar dashboard com cálculos (gráficos renderizados)

---

### MOD-04: Cases de Sucesso

#### TEL-CASE-03 — Case Submit (/case-submit)
**Inconsistências Esperadas:**
- ❌ **Autenticação:** Página pode ser acessível sem login
- ❌ **Validação:** Formulário pode não validar campos obrigatórios
- ❌ **Upload:** Upload de imagens pode falhar (S3)
- ❌ **API:** `caseSubmissions.create` pode falhar se dados inválidos
- ⚠️ **UX:** Feedback após submissão pode ser confuso
- ⚠️ **Email:** Notificação ao admin pode não ser enviada

**APIs Envolvidas:**
- `caseSubmissions.create`
- `storagePut` (upload de imagens)
- `notifyOwner`

**Riscos de Dados:**
- **Integridade:** Case pode ser criado sem imagem (se upload falhar)
- **Auditoria:** Não há registro de quem submeteu o case

**Plano de Microtarefas:**
- MT-CASE-01: Testar acesso sem autenticação
- MT-CASE-02: Testar formulário vazio
- MT-CASE-03: Testar upload de imagem (sucesso)
- MT-CASE-04: Testar upload de imagem (falha)
- MT-CASE-05: Testar submissão válida (caminho feliz)
- MT-CASE-06: Verificar registro no banco
- MT-CASE-07: Verificar notificação ao admin

---

### MOD-05: Jarvis AI Chat

#### TEL-JARV-01 — Jarvis Memory (/jarvis-memory)
**Inconsistências Esperadas:**
- ❌ **Autenticação:** Página pode ser acessível sem login
- ⚠️ **Dados:** Memória pode estar vazia se usuário não usou Jarvis
- ⚠️ **UX:** Listagem pode não ter paginação (performance)

**APIs Envolvidas:**
- `jarvis.memory.list`

**Riscos de Dados:**
- **Performance:** Query pode ser lenta se muitos registros

**Plano de Microtarefas:**
- MT-JARV-MEM-01: Testar acesso sem autenticação
- MT-JARV-MEM-02: Testar memória vazia
- MT-JARV-MEM-03: Testar memória com registros

---

#### Jarvis Chat (Componente Flutuante)
**Inconsistências Esperadas:**
- ❌ **LLM:** API pode falhar (timeout, rate limit)
- ❌ **Streaming:** Mensagens podem não aparecer em tempo real
- ❌ **Contexto:** Conversas anteriores podem não ser carregadas
- ⚠️ **UX:** Loading state pode não ser claro
- ⚠️ **Dados:** Mensagens podem não ser salvas no banco

**APIs Envolvidas:**
- `jarvis.chat` (invokeLLM)
- `jarvis.skills`
- `jarvisConversations.create`
- `jarvisMessages.create`

**Riscos de Dados:**
- **Persistência:** Mensagens podem não ser salvas se erro no LLM
- **Integridade:** Conversação pode ficar órfã se usuário não autenticado

**Plano de Microtarefas:**
- MT-JARV-CHAT-01: Testar abertura do chat
- MT-JARV-CHAT-02: Testar envio de mensagem (caminho feliz)
- MT-JARV-CHAT-03: Testar resposta do Jarvis (streaming)
- MT-JARV-CHAT-04: Testar erro de LLM (timeout)
- MT-JARV-CHAT-05: Verificar salvamento de mensagens no banco
- MT-JARV-CHAT-06: Testar histórico de conversas

---

### MOD-06: Autenticação e Perfil

#### TEL-AUTH-01 — Login (/login)
**Inconsistências Esperadas:**
- ❌ **Validação:** Formulário pode não validar email/senha
- ❌ **API:** Login pode falhar se credenciais inválidas
- ❌ **Segurança:** Senha pode estar visível (não mascarada)
- ⚠️ **UX:** Mensagem de erro pode não ser clara
- ⚠️ **Redirect:** Após login, usuário pode não ser redirecionado corretamente

**APIs Envolvidas:**
- `auth.login` (POST /api/login)

**Riscos de Dados:**
- **Segurança:** Senha pode estar exposta em logs

**Plano de Microtarefas:**
- MT-AUTH-01: Testar formulário vazio
- MT-AUTH-02: Testar email inválido
- MT-AUTH-03: Testar senha incorreta
- MT-AUTH-04: Testar login válido (caminho feliz)
- MT-AUTH-05: Verificar cookie JWT criado
- MT-AUTH-06: Verificar redirect após login
- MT-AUTH-07: Testar logout

---

#### TEL-AUTH-05 — Profile (/profile)
**Inconsistências Esperadas:**
- ❌ **Autenticação:** Página pode ser acessível sem login
- ⚠️ **Validação:** Formulário de edição pode não validar campos
- ⚠️ **Upload:** Upload de avatar pode falhar (S3)

**APIs Envolvidas:**
- `auth.me`
- `users.update`
- `storagePut` (avatar)

**Riscos de Dados:**
- **Integridade:** Avatar pode não ser atualizado se upload falhar

**Plano de Microtarefas:**
- MT-PROF-01: Testar acesso sem autenticação
- MT-PROF-02: Testar carregamento de dados do perfil
- MT-PROF-03: Testar edição de nome
- MT-PROF-04: Testar upload de avatar
- MT-PROF-05: Verificar atualização no banco

---

### MOD-07: Notificações

#### TEL-NOTIF-01 — Notificações (/notificacoes)
**Inconsistências Esperadas:**
- ❌ **Autenticação:** Página pode ser acessível sem login
- ⚠️ **Dados:** Listagem pode estar vazia
- ⚠️ **Performance:** Query pode ser lenta se muitas notificações

**APIs Envolvidas:**
- `notifications.list`
- `notifications.markAsRead`

**Riscos de Dados:**
- **Performance:** Query pode retornar milhares de registros

**Plano de Microtarefas:**
- MT-NOTIF-01: Testar acesso sem autenticação
- MT-NOTIF-02: Testar listagem vazia
- MT-NOTIF-03: Testar listagem com notificações
- MT-NOTIF-04: Testar marcar como lida

---

### MOD-08: Gamificação e Tokens

#### TEL-GAMIF-01 — Impact Tokens (/impact-tokens)
**Inconsistências Esperadas:**
- ❌ **Autenticação:** Página pode ser acessível sem login
- ⚠️ **Dados:** Usuário pode não ter tokens
- ⚠️ **Blockchain:** Integração blockchain pode não estar ativa

**APIs Envolvidas:**
- `impactTokens.list`
- `certificates.list`

**Riscos de Dados:**
- Nenhum (página de leitura)

**Plano de Microtarefas:**
- MT-TOKEN-01: Testar acesso sem autenticação
- MT-TOKEN-02: Testar listagem vazia
- MT-TOKEN-03: Testar listagem com tokens

---

#### TEL-GAMIF-03 — Certificate Verify (/certificate-verify)
**Inconsistências Esperadas:**
- ⚠️ **Validação:** Formulário pode não validar código do certificado
- ⚠️ **QR Code:** QR Code pode não ser gerado (qrcode não estava instalado)
- ⚠️ **API:** Verificação pode falhar se certificado não existir

**APIs Envolvidas:**
- `certificates.verify`
- QR Code generation

**Riscos de Dados:**
- Nenhum

**Plano de Microtarefas:**
- MT-CERT-01: Testar formulário vazio
- MT-CERT-02: Testar código inválido
- MT-CERT-03: Testar código válido (caminho feliz)
- MT-CERT-04: Verificar geração de QR Code

---

### MOD-09: Pagamentos e Planos

#### TEL-PAY-03 — Payments (/payments)
**Inconsistências Esperadas:**
- ❌ **Autenticação:** Página pode ser acessível sem login
- ❌ **Stripe:** Integração Stripe pode não estar configurada (STRIPE_SECRET_KEY)
- ❌ **API:** `stripe.createCheckoutSession` pode falhar se Stripe não configurado
- ⚠️ **UX:** Botão de checkout pode não ter loading state

**APIs Envolvidas:**
- `stripe.createCheckoutSession`
- `stripe.createPortalSession`

**Riscos de Dados:**
- **Bloqueio:** Stripe não configurado (BLOQ-04)

**Plano de Microtarefas:**
- MT-PAY-01: Testar acesso sem autenticação
- MT-PAY-02: Testar listagem de planos
- MT-PAY-03: Testar botão de checkout (Stripe não configurado)
- MT-PAY-04: Verificar mensagem de erro clara

---

### MOD-10: API Pública e Webhooks

#### TEL-API-02 — API Keys (/api-keys)
**Inconsistências Esperadas:**
- ❌ **Autenticação:** Página pode ser acessível sem login
- ⚠️ **Segurança:** API Key pode ser exibida em plain text (sem mascaramento)
- ⚠️ **Validação:** Formulário de criação pode não validar nome

**APIs Envolvidas:**
- `apiKeys.create`
- `apiKeys.list`
- `apiKeys.revoke`

**Riscos de Dados:**
- **Segurança:** API Keys podem ser expostas

**Plano de Microtarefas:**
- MT-API-01: Testar acesso sem autenticação
- MT-API-02: Testar criação de API Key
- MT-API-03: Verificar mascaramento da key
- MT-API-04: Testar revogação de API Key

---

#### TEL-API-08 — Webhooks (/webhooks)
**Inconsistências Esperadas:**
- ❌ **Autenticação:** Página pode ser acessível sem login
- ⚠️ **Validação:** URL do webhook pode não ser validada (formato)
- ⚠️ **Teste:** Botão "Test Webhook" pode falhar se URL inválida

**APIs Envolvidas:**
- `webhooks.create`
- `webhooks.list`
- `webhooks.test`

**Riscos de Dados:**
- **Integridade:** Webhook pode ser criado com URL inválida

**Plano de Microtarefas:**
- MT-WEBHOOK-01: Testar acesso sem autenticação
- MT-WEBHOOK-02: Testar criação de webhook (URL inválida)
- MT-WEBHOOK-03: Testar criação de webhook (URL válida)
- MT-WEBHOOK-04: Testar botão "Test Webhook"
- MT-WEBHOOK-05: Verificar registro de delivery no banco

---

### MOD-11: Comunidade e Engajamento

#### TEL-COMM-02 — Referrals (/referrals)
**Inconsistências Esperadas:**
- ❌ **Autenticação:** Página pode ser acessível sem login
- ⚠️ **Dados:** Usuário pode não ter referrals
- ⚠️ **UX:** Link de referral pode não ser copiável facilmente

**APIs Envolvidas:**
- `referrals.list`
- `referrals.create`

**Riscos de Dados:**
- Nenhum

**Plano de Microtarefas:**
- MT-REF-01: Testar acesso sem autenticação
- MT-REF-02: Testar listagem vazia
- MT-REF-03: Testar criação de referral
- MT-REF-04: Testar cópia de link

---

### MOD-12: Recursos e Integrações

#### TEL-REC-03 — Status (/status)
**Inconsistências Esperadas:**
- ⚠️ **Dados:** Status pode estar desatualizado
- ⚠️ **Performance:** Query pode ser lenta se muitos incidentes

**APIs Envolvidas:**
- `status.list`

**Riscos de Dados:**
- Nenhum

**Plano de Microtarefas:**
- MT-STATUS-01: Testar carregamento da página
- MT-STATUS-02: Verificar se status está atualizado

---

### MOD-13: Dashboard Admin

#### TEL-ADM-01 — Admin Dashboard (/admin)
**Inconsistências Esperadas:**
- ❌ **Autenticação:** Página pode ser acessível sem login
- ❌ **Autorização:** Página pode ser acessível por usuário não-admin
- ⚠️ **Dados:** Métricas podem estar vazias
- ⚠️ **Performance:** Queries podem ser lentas (muitos dados)

**APIs Envolvidas:**
- Múltiplas APIs (leads, contacts, analytics, etc)

**Riscos de Dados:**
- **Performance:** Dashboard pode travar se muitos dados

**Plano de Microtarefas:**
- MT-ADM-01: Testar acesso sem autenticação
- MT-ADM-02: Testar acesso com usuário não-admin (deve retornar 403)
- MT-ADM-03: Testar acesso com admin (caminho feliz)
- MT-ADM-04: Verificar carregamento de métricas
- MT-ADM-05: Testar navegação entre módulos admin

---

#### TEL-ADM-02 — Admin Leads (/admin/leads)
**Inconsistências Esperadas:**
- ❌ **Autorização:** Página pode ser acessível por usuário não-admin
- ⚠️ **Dados:** Listagem pode estar vazia
- ⚠️ **Performance:** Query pode ser lenta se muitos leads
- ⚠️ **Paginação:** Pode não haver paginação (performance)
- ⚠️ **Filtros:** Filtros podem não funcionar corretamente

**APIs Envolvidas:**
- `leads.list`
- `leads.getById`
- `leads.update`
- `leads.delete`

**Riscos de Dados:**
- **Performance:** Query sem paginação pode retornar milhares de registros

**Plano de Microtarefas:**
- MT-ADM-LEADS-01: Testar acesso com usuário não-admin
- MT-ADM-LEADS-02: Testar listagem vazia
- MT-ADM-LEADS-03: Testar listagem com leads
- MT-ADM-LEADS-04: Testar paginação (se houver)
- MT-ADM-LEADS-05: Testar filtros (se houver)
- MT-ADM-LEADS-06: Testar edição de lead
- MT-ADM-LEADS-07: Testar exclusão de lead

---

#### TEL-ADM-05 — Admin Analytics (/admin/analytics)
**Inconsistências Esperadas:**
- ⚠️ **Dados:** Gráficos podem não renderizar se dados inválidos
- ⚠️ **Performance:** Queries de analytics podem ser lentas

**APIs Envolvidas:**
- `analytics.*`

**Riscos de Dados:**
- **Performance:** Queries de agregação podem ser lentas

**Plano de Microtarefas:**
- MT-ADM-ANALYTICS-01: Testar carregamento de gráficos
- MT-ADM-ANALYTICS-02: Verificar dados dos gráficos
- MT-ADM-ANALYTICS-03: Testar filtros de período

---

## 2. INCONSISTÊNCIAS POR API

### API-01: leads.create
**Inconsistências Esperadas:**
- ❌ **Duplicidade:** Mesmo email pode criar múltiplos leads
- ⚠️ **Validação:** Email pode não ser validado (formato)
- ⚠️ **Notificação:** `notifyOwner` pode falhar silenciosamente

**Plano de Testes:**
- Testar criação com email duplicado
- Testar criação com email inválido
- Testar criação válida
- Verificar notificação enviada

---

### API-02: calculations.create
**Inconsistências Esperadas:**
- ❌ **Validação:** R = 0 não é validado (causa Infinity)
- ⚠️ **Autenticação:** Pode aceitar cálculos anônimos (não salva)

**Plano de Testes:**
- Testar R = 0
- Testar valores negativos
- Testar cálculo válido
- Verificar salvamento no banco

---

### API-03: jarvis.chat
**Inconsistências Esperadas:**
- ❌ **Timeout:** LLM pode demorar muito (>30s)
- ❌ **Rate Limit:** Pode atingir limite de requisições
- ⚠️ **Contexto:** Conversas anteriores podem não ser carregadas

**Plano de Testes:**
- Testar timeout (mensagem longa)
- Testar rate limit (múltiplas mensagens rápidas)
- Testar contexto (histórico de conversas)

---

### API-04: caseSubmissions.create
**Inconsistências Esperadas:**
- ⚠️ **Upload:** Imagem pode não ser salva (S3)
- ⚠️ **Integridade:** Case pode ser criado sem imagem

**Plano de Testes:**
- Testar upload de imagem (sucesso)
- Testar upload de imagem (falha)
- Verificar integridade dos dados

---

### API-05: stripe.createCheckoutSession
**Inconsistências Esperadas:**
- ❌ **Bloqueio:** Stripe não configurado (STRIPE_SECRET_KEY)
- ❌ **Erro:** Pode retornar 500 se Stripe não configurado

**Plano de Testes:**
- Testar com Stripe não configurado
- Verificar mensagem de erro clara

---

## 3. INCONSISTÊNCIAS POR DADOS

### DADOS-01: Duplicidade de Leads
**Problema:** Mesmo email pode criar múltiplos leads  
**Impacto:** Dados duplicados, métricas incorretas  
**Solução:** Adicionar constraint UNIQUE no campo email

---

### DADOS-02: Divisão por Zero (Calculadora)
**Problema:** R = 0 causa Infinity  
**Impacto:** Resultado inválido, experiência ruim  
**Solução:** Validar R > 0 no frontend e backend

---

### DADOS-03: Cases Órfãos
**Problema:** Case pode ser criado sem imagem (se upload falhar)  
**Impacto:** Dados inconsistentes  
**Solução:** Transação atômica (upload + create)

---

### DADOS-04: Conversas Órfãs (Jarvis)
**Problema:** Conversação pode ficar sem mensagens (se LLM falhar)  
**Impacto:** Dados inconsistentes  
**Solução:** Rollback se LLM falhar

---

## 4. INCONSISTÊNCIAS POR WORKFLOW

### WORKFLOW-01: Fluxo de Download de Whitepaper
**Passos:**
1. Usuário acessa /whitepaper
2. Preenche formulário (nome, email, empresa)
3. Clica em "Download"
4. Lead é criado
5. Download é registrado
6. Notificação é enviada ao admin
7. PDF é baixado

**Pontos de Quebra:**
- ❌ **Passo 4:** Lead pode não ser criado se email duplicado
- ❌ **Passo 5:** Download pode não ser registrado se leadId inválido
- ⚠️ **Passo 6:** Notificação pode falhar silenciosamente
- ⚠️ **Passo 7:** PDF pode não existir (404)

---

### WORKFLOW-02: Fluxo de Cálculo de Impacto
**Passos:**
1. Usuário acessa /calculadora
2. Preenche campos (E, C1-C7, R)
3. Clica em "Calcular"
4. Resultado é exibido
5. Usuário clica em "Gerar PDF"
6. PDF é gerado
7. Cálculo é salvo no banco (se autenticado)

**Pontos de Quebra:**
- ❌ **Passo 2:** R = 0 não é validado
- ❌ **Passo 4:** Resultado pode ser Infinity ou NaN
- ❌ **Passo 6:** PDF pode não ser gerado (jsPDF não instalado)
- ⚠️ **Passo 7:** Cálculo pode não ser salvo se usuário anônimo

---

### WORKFLOW-03: Fluxo de Login -> Admin Dashboard
**Passos:**
1. Usuário acessa /login
2. Preenche email e senha
3. Clica em "Entrar"
4. JWT é criado
5. Usuário é redirecionado para /admin
6. Dashboard carrega métricas

**Pontos de Quebra:**
- ❌ **Passo 3:** Login pode falhar se credenciais inválidas
- ⚠️ **Passo 4:** JWT pode não ser criado
- ⚠️ **Passo 5:** Redirect pode não funcionar
- ⚠️ **Passo 6:** Métricas podem não carregar (performance)

---

### WORKFLOW-04: Fluxo de Chat com Jarvis
**Passos:**
1. Usuário clica no botão verde flutuante
2. Chat abre
3. Usuário digita mensagem
4. Mensagem é enviada
5. LLM processa
6. Resposta é exibida (streaming)
7. Mensagens são salvas no banco

**Pontos de Quebra:**
- ❌ **Passo 5:** LLM pode falhar (timeout, rate limit)
- ⚠️ **Passo 6:** Streaming pode não funcionar
- ⚠️ **Passo 7:** Mensagens podem não ser salvas

---

## 5. BLOQUEIOS IDENTIFICADOS

### BLOQ-01: jsPDF ✅ RESOLVIDO
**Status:** Instalado (v4.0.0)  
**Impacto:** Geração de PDFs agora funciona

---

### BLOQ-02: qrcode ✅ RESOLVIDO
**Status:** Instalado (v1.5.4)  
**Impacto:** Geração de QR Codes agora funciona

---

### BLOQ-03: TypeScript Errors (334 erros)
**Status:** ⚠️ Warnings (não bloqueiam execução)  
**Impacto:** Qualidade de código, manutenibilidade  
**Ação:** Corrigir tipos implícitos (any)

---

### BLOQ-04: Stripe não configurado
**Status:** ❌ Não configurado  
**Impacto:** Pagamentos não funcionam  
**Ação:** Configurar STRIPE_SECRET_KEY

---

### BLOQ-05: SMTP não configurado
**Status:** ❌ Não configurado  
**Impacto:** Emails transacionais não funcionam  
**Ação:** Configurar SMTP credentials

---

## 6. PRIORIZAÇÃO DE TESTES (SEVERIDADE)

### S0 — Bloqueadores (Impedem fluxo crítico)
- ❌ Login não funciona
- ❌ Calculadora retorna Infinity (R = 0)
- ❌ Jarvis não responde (LLM falha)

### S1 — Críticos (Quebra função central)
- ❌ Leads duplicados
- ❌ PDF não é gerado
- ❌ Cases não são salvos

### S2 — Alto (Função importante falha)
- ⚠️ Notificações não são enviadas
- ⚠️ Histórico de cálculos não aparece
- ⚠️ Upload de imagens falha

### S3 — Médio (Comportamento incorreto)
- ⚠️ Validação de email não funciona
- ⚠️ Feedback após submissão confuso
- ⚠️ Paginação ausente

### S4 — Baixo (UI/UX)
- ⚠️ Loading states ausentes
- ⚠️ Textos hardcoded
- ⚠️ Responsividade

---

## 7. PRÓXIMOS PASSOS

1. **Criar Plano de Dados de Teste** (FASE 0 - Artefato C)
2. **Criar Backlog de Microtarefas** (FASE 0 - Artefato E)
3. **Iniciar FASE 1** (Testes E2E tela a tela)
4. **Priorizar correções S0/S1**

---

**Mapa criado por:** Agente Lead QA (SET7)  
**Versão:** 0.1  
**Status:** ✅ Completo
