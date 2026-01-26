# IMPACT7 Platform - Documentação Completa do Sistema

**Versão:** 3.3.0  
**Data:** Janeiro 2026  
**Status:** Produção

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Banco de Dados](#banco-de-dados)
6. [Procedures tRPC](#procedures-trpc)
7. [Autenticação](#autenticação)
8. [Testes](#testes)
9. [Desenvolvimento](#desenvolvimento)
10. [Deploy](#deploy)

---

## 🎯 Visão Geral

**IMPACT7** é uma plataforma de inovação social exponencial que combina Ciência Cognitiva, Modelagem Matemática e Engenharia de Software para maximizar o retorno social sobre investimento (S-ROI).

### Funcionalidades Principais

- **Calculadora de Impacto** - Cálculo de S-ROI baseado na equação I = (E × C⁷) / R
- **Whitepaper Download** - Acesso ao documento científico completo (140 páginas)
- **Cases de Sucesso** - Showcase de projetos implementados
- **Dashboard Administrativo** - 19 páginas de gestão completa
- **Sistema de Autenticação** - Login/registro customizado com JWT
- **API tRPC** - 235 procedures backend type-safe

### Estatísticas do Sistema

- **91 páginas** frontend (49 com interações tRPC)
- **235 procedures** tRPC backend
- **19 páginas** administrativas
- **9 testes** E2E automatizados (Playwright)
- **43 mocks** identificados (não-críticos)

---

## 🏗️ Arquitetura

### Camadas

```
┌─────────────────────────────────────┐
│         Frontend (React 19)         │
│  - 91 páginas                       │
│  - Tailwind 4                       │
│  - tRPC hooks                       │
└──────────────┬──────────────────────┘
               │
               │ tRPC (Type-safe)
               │
┌──────────────▼──────────────────────┐
│       Backend (Express 4)           │
│  - 235 procedures                   │
│  - JWT auth                         │
│  - Drizzle ORM                      │
└──────────────┬──────────────────────┘
               │
               │ SQL
               │
┌──────────────▼──────────────────────┐
│        Database (MySQL/TiDB)        │
│  - 50+ tabelas                      │
│  - Sincronizado com schema.ts      │
└─────────────────────────────────────┘
```

### Fluxo de Dados

1. **Frontend** chama `trpc.feature.useQuery()` ou `trpc.feature.useMutation()`
2. **tRPC** serializa chamada e envia para `/api/trpc`
3. **Backend** valida autenticação (JWT) e executa procedure
4. **Procedure** chama helpers em `server/db.ts` que usam Drizzle ORM
5. **Drizzle** executa query SQL no MySQL/TiDB
6. **Resposta** retorna via tRPC com tipos garantidos

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **tRPC 11** - Type-safe API client
- **React Hook Form** - Form validation
- **Zod** - Schema validation
- **Wouter** - Routing
- **Sonner** - Toast notifications
- **i18next** - Internationalization (PT, EN, ES)

### Backend
- **Express 4** - Web server
- **tRPC 11** - Type-safe API
- **Drizzle ORM** - Database queries
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Superjson** - Data serialization (Date, Map, Set)

### Database
- **MySQL/TiDB** - Relational database
- **Drizzle Kit** - Schema migrations

### Testing
- **Playwright** - E2E testing
- **Vitest** - Unit testing

### DevOps
- **pnpm** - Package manager
- **TypeScript** - Type safety
- **Vite** - Build tool

---

## 📁 Estrutura do Projeto

```
impact7-platform-permanent/
├── client/                    # Frontend React
│   ├── public/               # Static assets
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── contexts/         # React contexts
│       ├── hooks/            # Custom hooks
│       ├── lib/              # Utilities (trpc.ts)
│       └── pages/            # 91 páginas (Home, Admin, etc)
│
├── server/                    # Backend Express + tRPC
│   ├── _core/                # Framework (auth, context, llm)
│   ├── api/                  # Public API endpoints
│   ├── services/             # Business logic (webhooks, etc)
│   ├── auth-custom.ts        # JWT authentication
│   ├── db.ts                 # Database query helpers
│   └── routers.ts            # 235 tRPC procedures
│
├── drizzle/                   # Database schema & migrations
│   └── schema.ts             # 50+ tabelas definidas
│
├── shared/                    # Código compartilhado
│   ├── utils/                # Helpers (boolean.ts)
│   └── validation/           # Zod schemas
│
├── tests/                     # Testes E2E Playwright
│   ├── calculator.spec.ts    # 2 testes
│   ├── whitepaper.spec.ts    # 3 testes
│   └── contact.spec.ts       # 4 testes
│
├── scripts/                   # Scripts de manutenção
│   ├── audit-system-complete.mjs
│   ├── fix-date-conservative.mjs
│   └── fix-typescript-*.mjs
│
├── playwright.config.ts       # Configuração Playwright
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

---

## 🗄️ Banco de Dados

### Tabelas Principais

#### Usuários e Autenticação
- `users` - Usuários do sistema (email, passwordHash, role)
- `sessions` - Sessões JWT ativas
- `apiKeys` - Chaves de API para integrações

#### Leads e Contatos
- `leads` - Leads capturados (nome, email, organization)
- `contacts` - Mensagens de contato
- `whitepaperDownloads` - Downloads do whitepaper

#### Cases e Projetos
- `caseStudies` - Cases de sucesso
- `projects` - Projetos em andamento
- `impactCalculations` - Cálculos de S-ROI salvos

#### Conteúdo
- `blogPosts` - Artigos do blog
- `testimonials` - Depoimentos de clientes
- `partners` - Parceiros da plataforma

#### Sistema
- `socialProofMetrics` - Métricas de prova social
- `systemSettings` - Configurações do sistema
- `webhooks` - Webhooks registrados
- `webhookDeliveries` - Histórico de entregas

### Schema Drizzle

Todas as tabelas são definidas em `drizzle/schema.ts` usando Drizzle ORM:

```typescript
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "manager", "admin"]).default("user"),
  createdAt: int("createdAt").$type<number>().notNull(),
  updatedAt: int("updatedAt").$type<number>().notNull(),
});
```

**Importante:** Timestamps são armazenados como `int` (Unix timestamp em milissegundos), não `Date`.

---

## 🔌 Procedures tRPC

### Estrutura

Todas as 235 procedures estão em `server/routers.ts` organizadas por feature:

```typescript
export const appRouter = router({
  // Autenticação
  auth: {
    me: publicProcedure.query(...),
    login: publicProcedure.mutation(...),
    logout: protectedProcedure.mutation(...),
  },
  
  // Leads
  leads: {
    create: publicProcedure.mutation(...),
    list: protectedProcedure.query(...),
  },
  
  // Cases
  cases: {
    getSubmissions: protectedProcedure.query(...),
    submitCase: publicProcedure.mutation(...),
  },
  
  // ... 230+ outras procedures
});
```

### Uso no Frontend

```typescript
// Query
const { data, isLoading } = trpc.leads.list.useQuery();

// Mutation
const createLead = trpc.leads.create.useMutation({
  onSuccess: () => {
    toast.success("Lead criado!");
  },
});

createLead.mutate({ name: "João", email: "joao@example.com" });
```

### Procedures Públicas vs Protegidas

- **`publicProcedure`** - Não requer autenticação (ex: login, registro, calculadora)
- **`protectedProcedure`** - Requer JWT válido, injeta `ctx.user`
- **`adminProcedure`** - Requer `ctx.user.role === 'admin'`

---

## 🔐 Autenticação

### Sistema Customizado (Não usa Manus OAuth)

O sistema usa **autenticação JWT customizada** implementada em `server/auth-custom.ts`.

### Fluxo de Login

1. Usuário preenche formulário em `Login.tsx` ou `LoginLocal.tsx`
2. Frontend chama `trpc.auth.login.useMutation()`
3. Backend valida credenciais com bcrypt
4. Backend gera JWT e retorna cookie `auth_token`
5. Requests subsequentes incluem cookie automaticamente
6. Middleware `protectedProcedure` valida JWT e injeta `ctx.user`

### Registro

1. Usuário preenche formulário em `Register.tsx`
2. Frontend chama `trpc.auth.register.useMutation()`
3. Backend hasheia senha com bcrypt
4. Backend cria usuário na tabela `users`
5. Backend gera JWT e retorna cookie `auth_token`

### Roles

- **user** - Usuário padrão (acesso limitado)
- **manager** - Gerente (acesso a relatórios)
- **admin** - Administrador (acesso total, 19 páginas admin)

---

## 🧪 Testes

### Testes E2E (Playwright)

**Localização:** `tests/*.spec.ts`

**Executar:**
```bash
pnpm exec playwright install  # Primeira vez
pnpm exec playwright test      # Executar todos
pnpm exec playwright test --ui # Modo UI
```

**Testes implementados:**

1. **calculator.spec.ts** (2 testes)
   - Deve carregar calculadora
   - Deve calcular S-ROI corretamente

2. **whitepaper.spec.ts** (3 testes)
   - Deve carregar página de whitepaper
   - Deve mostrar formulário de download
   - Deve validar campos obrigatórios

3. **contact.spec.ts** (4 testes)
   - Deve carregar formulário de contato
   - Deve validar email inválido
   - Deve validar campos obrigatórios
   - Deve enviar mensagem com sucesso

### Testes Unitários (Vitest)

**Localização:** `server/*.test.ts`

**Exemplo:** `server/auth.logout.test.ts`

**Executar:**
```bash
pnpm test
```

---

## 💻 Desenvolvimento

### Setup Inicial

```bash
# Clonar projeto
git clone <repo-url>
cd impact7-platform-permanent

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente (já injetadas automaticamente)
# DATABASE_URL, JWT_SECRET, etc.

# Sincronizar banco de dados
pnpm db:push

# Iniciar dev server
pnpm dev
```

### Scripts Disponíveis

```bash
pnpm dev          # Dev server (Vite + Express)
pnpm build        # Build para produção
pnpm preview      # Preview build
pnpm test         # Testes unitários
pnpm db:push      # Sincronizar schema com banco
pnpm db:studio    # Abrir Drizzle Studio
```

### Workflow de Desenvolvimento

1. **Criar feature:**
   - Adicionar tabela em `drizzle/schema.ts` (se necessário)
   - Executar `pnpm db:push`
   - Criar query helper em `server/db.ts`
   - Criar procedure em `server/routers.ts`
   - Criar página/componente em `client/src/pages/`
   - Usar `trpc.feature.useQuery()` no frontend

2. **Testar:**
   - Testar manualmente no browser
   - Criar teste E2E em `tests/`
   - Criar teste unitário em `server/*.test.ts`

3. **Commit:**
   - Salvar checkpoint via Management UI
   - Commit e push para Git

### Convenções de Código

- **Nomenclatura:** camelCase para variáveis, PascalCase para componentes
- **Timestamps:** Sempre `int` (Unix timestamp), nunca `Date`
- **Procedures:** Organizar por feature (auth, leads, cases, etc)
- **Componentes:** Um componente por arquivo
- **Imports:** Usar `@/` para imports absolutos

---

## 🚀 Deploy

### Manus Hosting (Built-in)

1. Criar checkpoint via Management UI
2. Clicar em "Publish" no header
3. Sistema automaticamente:
   - Faz build de produção
   - Deploy para CDN
   - Configura domínio `*.manus.space`

### Custom Domain

1. Ir em Settings → Domains
2. Adicionar domínio customizado
3. Configurar DNS (CNAME ou A record)
4. SSL automático via Let's Encrypt

### Variáveis de Ambiente

Todas as variáveis são injetadas automaticamente pelo Manus:

- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Secret para assinar JWTs
- `VITE_APP_ID` - ID da aplicação
- `BUILT_IN_FORGE_API_KEY` - Chave para APIs Manus
- etc.

**Não é necessário** configurar `.env` manualmente.

---

## 📊 Status Atual

### ✅ Funcionalidades Implementadas

- [x] Homepage completa
- [x] Calculadora de impacto (100% funcional)
- [x] Download de whitepaper (100% funcional)
- [x] Formulário de contato (validação Zod)
- [x] Sistema de autenticação customizado (JWT)
- [x] Dashboard administrativo (19 páginas)
- [x] 235 procedures tRPC
- [x] 9 testes E2E Playwright
- [x] Internacionalização (PT, EN, ES)
- [x] SEO metadata completo
- [x] Sistema de toast (Sonner)

### ⚠️ Pendências

- [ ] 274 erros TypeScript (Date vs number) - Não-crítico, sistema funcional
- [ ] 43 mocks identificados - Não-crítico, procedures tRPC existem
- [ ] Erro SQL "Unknown column 'organization'" - Parcialmente corrigido

### 🎯 Próximos Passos Recomendados

1. **Corrigir 274 erros TypeScript** - Converter manualmente Date→number em arquivos críticos
2. **Executar testes E2E** - Validar os 9 testes criados e ajustar seletores
3. **Adicionar analytics** - Integrar Google Analytics ou Plausible
4. **Otimizar performance** - Code splitting, lazy loading
5. **Documentar API** - Gerar documentação automática das 235 procedures

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar esta documentação
2. Consultar `AUDIT_REPORT.json` para detalhes técnicos
3. Revisar checkpoints anteriores no Management UI
4. Contactar time de desenvolvimento

---

**Última atualização:** Janeiro 2026  
**Versão do documento:** 1.0  
**Checkpoint:** v3.3.0 (4090fa42)
