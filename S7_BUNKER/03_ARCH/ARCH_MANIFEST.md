# ARCH_MANIFEST — Manifesto de Arquitetura do Sistema IMPACT7
> **Versão:** 1.0.0 | **Data:** 2026-02-27 | **Status:** ATIVO | **Custódio:** Italo Teofilo
> **Classificação SET7:** INTERNO — Documento de Arquitetura

---

## 1. VISÃO GERAL DA ARQUITETURA

O sistema IMPACT7 é uma **plataforma web full-stack** construída sobre o stack React 19 + Express 4 + tRPC 11 + MySQL (TiDB), com autenticação JWT customizada, integração com LLM (Manus Forge), armazenamento S3, e sistema de gamificação. A arquitetura segue o padrão **Monólito Modular** com separação clara entre 6 Bounded Contexts.

### Stack Tecnológico

| Camada | Tecnologia | Versão | Responsabilidade |
|---|---|---|---|
| **Frontend** | React + Vite | 19 / 6 | UI, routing, estado local |
| **Estilo** | Tailwind CSS 4 | 4.x | Design system, temas |
| **Componentes** | shadcn/ui | latest | Biblioteca de UI |
| **API Client** | tRPC | 11 | Contrato type-safe frontend↔backend |
| **Backend** | Express | 4 | HTTP server, middleware |
| **ORM** | Drizzle | latest | Schema, queries type-safe |
| **Banco** | MySQL (TiDB) | 8.x | Persistência principal |
| **Auth** | JWT + bcrypt | — | Sessões, hashing de senhas |
| **LLM** | Manus Forge | — | Jarvis AI, análises |
| **Storage** | S3 (Manus) | — | Arquivos, imagens |
| **i18n** | i18next | — | PT/EN/ES |

---

## 2. BOUNDED CONTEXTS (6 Contextos)

### BC-01: Autenticação e Identidade
**Responsabilidade:** Gerenciar ciclo de vida de usuários, sessões, permissões e 2FA.

**Entidades:** `users`, `sessions`, `twoFactorAuth`, `passwordResets`

**ITUs (Interfaces de Troca de Unidade):**
- `ITU-AUTH-IN-01`: `POST /api/trpc/auth.login` → `{ email, password }` → `{ user, token }`
- `ITU-AUTH-IN-02`: `POST /api/trpc/auth.register` → `{ email, password, name }` → `{ user }`
- `ITU-AUTH-IN-03`: `POST /api/trpc/auth.logout` → `{}` → `{ success }`
- `ITU-AUTH-OUT-01`: `ctx.user` injetado em todos os `protectedProcedure`

**Fronteiras:**
- Não conhece lógica de negócio (cálculos, cases, etc.)
- Não acessa tabelas de outros contextos diretamente
- Emite eventos de login/logout para o BC-06 (Observabilidade)

**Arquivos:**
```
server/_core/context.ts      ← Injeta ctx.user
server/_core/auth.ts         ← JWT helpers
server/routers.ts (auth.*)   ← Procedures de auth
drizzle/schema.ts (users, sessions, twoFactorAuth)
```

---

### BC-02: Calculadora de Impacto (S-ROI)
**Responsabilidade:** Implementar e executar a equação I=(E×C⁷)/R com visualização e histórico.

**Entidades:** `calculations`, `calculationResults`, `impactMetrics`

**ITUs:**
- `ITU-CALC-IN-01`: `trpc.calculator.calculate` → `{ effort, catalysts[7], resistance }` → `{ impact, score, recommendations }`
- `ITU-CALC-IN-02`: `trpc.calculator.getHistory` → `{ userId }` → `Calculation[]`
- `ITU-CALC-IN-03`: `trpc.calculator.saveResult` → `{ calculationId, notes }` → `{ saved }`

**Fronteiras:**
- Depende de BC-01 (autenticação) para salvar histórico
- Pode chamar BC-03 (Jarvis) para análise aprofundada
- Não acessa dados de outros usuários

**Arquivos:**
```
client/src/pages/Calculator.tsx
client/src/pages/ImpactDashboard.tsx
server/routers.ts (calculator.*)
drizzle/schema.ts (calculations, calculationResults)
```

---

### BC-03: Jarvis AI (Assistente Cognitivo)
**Responsabilidade:** Prover interface conversacional com LLM para análise de impacto, sugestões e insights.

**Entidades:** `jarvisConversations`, `jarvisMessages`

**ITUs:**
- `ITU-JARV-IN-01`: `trpc.jarvis.sendMessage` → `{ message, conversationId? }` → `{ response, conversationId }`
- `ITU-JARV-IN-02`: `trpc.jarvis.getHistory` → `{ conversationId }` → `Message[]`
- `ITU-JARV-OUT-01`: `invokeLLM({ messages, tools? })` → LLM response

**Fronteiras:**
- Depende de BC-01 (autenticação)
- Consome `BUILT_IN_FORGE_API_KEY` (variável de ambiente)
- Não persiste dados sensíveis do usuário no histórico LLM
- Budget máximo: 8.000 tokens por mensagem (ver D7 em $INT.md)

**Arquivos:**
```
client/src/components/AIChatBox.tsx
server/_core/llm.ts          ← Helper invokeLLM
server/routers.ts (jarvis.*)
drizzle/schema.ts (jarvisConversations, jarvisMessages)
```

---

### BC-04: Conteúdo e Leads
**Responsabilidade:** Gerenciar cases de impacto, depoimentos, whitepapers, ebooks e captura de leads.

**Entidades:** `caseStudies`, `testimonials`, `leads`, `whitepaperDownloads`, `newsletterSubscribers`, `contacts`

**ITUs:**
- `ITU-CONT-IN-01`: `trpc.cases.list` → `{ filters? }` → `CaseStudy[]`
- `ITU-CONT-IN-02`: `trpc.leads.create` → `{ email, name, organization?, source }` → `{ lead }`
- `ITU-CONT-IN-03`: `trpc.whitepaper.download` → `{ email, name, organization? }` → `{ downloadUrl }`
- `ITU-CONT-IN-04`: `trpc.contact.submit` → `{ email, name, message }` → `{ success }`
- `ITU-CONT-OUT-01`: Notificação para admin via `notifyOwner()` em cada novo lead

**Fronteiras:**
- Não requer autenticação para captura de leads (público)
- Requer autenticação admin para gestão (criar, editar, deletar)
- Emite notificações para BC-05 (Admin) em novos leads

**Arquivos:**
```
client/src/pages/Cases.tsx
client/src/pages/Whitepaper.tsx
server/routers.ts (cases.*, leads.*, whitepaper.*, contact.*)
drizzle/schema.ts (caseStudies, testimonials, leads, ...)
```

---

### BC-05: Administração e Operações
**Responsabilidade:** Dashboard administrativo completo com 18 módulos de gestão operacional.

**Entidades:** Acessa todas as entidades de todos os contextos (somente leitura + moderação)

**ITUs:**
- `ITU-ADM-IN-01`: `trpc.admin.*` → Requer `ctx.user.role === 'admin'`
- `ITU-ADM-IN-02`: `trpc.leads.list` → `{ page, filters }` → `Lead[]` (paginado)
- `ITU-ADM-IN-03`: `trpc.cases.updateStatus` → `{ caseId, status }` → `{ updated }`
- `ITU-ADM-OUT-01`: Logs de auditoria em todas as ações admin

**Fronteiras:**
- **EXCLUSIVO** para usuários com `role === 'admin'`
- Não executa operações destrutivas sem confirmação (soft delete preferido)
- Todas as ações são logadas com `userId`, `action`, `timestamp`, `ip`

**Arquivos:**
```
client/src/pages/Admin*.tsx (18 páginas)
client/src/components/AdminRoute.tsx
server/routers.ts (admin.*)
```

---

### BC-06: Gamificação e Engajamento
**Responsabilidade:** Sistema de pontos, badges, leaderboard e notificações para engajamento de usuários.

**Entidades:** `gamificationPoints`, `badges`, `userBadges`, `notifications`, `notificationPreferences`

**ITUs:**
- `ITU-GAM-IN-01`: `trpc.gamification.recordInteraction` → `{ userId, action, points }` → `{ totalPoints }`
- `ITU-GAM-IN-02`: `trpc.gamification.getLeaderboard` → `{}` → `LeaderboardEntry[]`
- `ITU-GAM-IN-03`: `trpc.notifications.list` → `{ userId }` → `Notification[]`
- `ITU-GAM-OUT-01`: Badge automático ao atingir marcos (1º cálculo, 10 cálculos, etc.)

**Fronteiras:**
- Depende de BC-01 (autenticação)
- Recebe eventos de BC-02 (cálculos) e BC-04 (downloads)
- Não bloqueia fluxos principais (falha silenciosa se gamificação falhar)

**Arquivos:**
```
client/src/pages/Gamification.tsx
server/routers.ts (gamification.*, notifications.*)
drizzle/schema.ts (gamificationPoints, badges, userBadges, notifications)
```

---

## 3. MAPA DE DEPENDÊNCIAS ENTRE CONTEXTOS

```
BC-01 (Auth)
    ↑ depende de
BC-02 (Calculadora) ──→ BC-03 (Jarvis) [opcional]
BC-04 (Conteúdo)    ──→ BC-05 (Admin)  [notifica]
BC-06 (Gamificação) ←── BC-02, BC-04   [recebe eventos]
```

**Regra de Ouro:** Dependências só fluem de cima para baixo. BC-01 não conhece BC-02, BC-03, etc. BC-02 conhece BC-01 (para auth) mas não BC-04, BC-05, BC-06.

---

## 4. PADRÕES DE CÓDIGO OBRIGATÓRIOS

### Nomenclatura
- **Tabelas MySQL:** camelCase (ex: `caseStudies`, `whitepaperDownloads`)
- **Colunas MySQL:** camelCase (ex: `createdAt`, `userId`, `isActive`)
- **Timestamps:** sempre Unix milliseconds (`number`), nunca `Date` no banco
- **Boolean:** sempre `TINYINT(1)` no MySQL, mapeado como `number` no Drizzle
- **Procedures tRPC:** `camelCase` (ex: `auth.login`, `calculator.calculate`)

### Segurança
- Todo endpoint que modifica dados deve ser `protectedProcedure`
- Todo endpoint admin deve verificar `ctx.user.role === 'admin'` no servidor
- Inputs devem ser validados com Zod antes de qualquer operação de banco
- Queries SQL raw devem usar parâmetros preparados (nunca interpolação direta)

### Tratamento de Erros
```typescript
// Padrão obrigatório para procedures tRPC
try {
  const result = await db.query(...);
  return result;
} catch (error) {
  console.error('[BC-XX] Error in procedure.name:', error);
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro interno' });
}
```

---

## 5. REGISTRO DE DECISÕES ARQUITETURAIS (ADRs)

| ADR | Data | Decisão | Justificativa |
|---|---|---|---|
| ADR-001 | 2026-01 | tRPC ao invés de REST | Type safety end-to-end, sem código de contrato manual |
| ADR-002 | 2026-01 | MySQL (TiDB) ao invés de SQLite | Escalabilidade horizontal, suporte a produção |
| ADR-003 | 2026-01 | JWT + cookies HttpOnly ao invés de OAuth | Controle total, sem dependência de terceiros para auth |
| ADR-004 | 2026-01 | Monólito modular ao invés de microserviços | Simplicidade operacional para time pequeno |
| ADR-005 | 2026-02 | S3 para arquivos ao invés de DB | Performance, custo, escalabilidade |
| ADR-006 | 2026-02 | Drizzle ORM ao invés de Prisma | Melhor suporte MySQL, queries mais próximas do SQL |

---

## 6. CHECKLIST DE CONFORMIDADE ARQUITETURAL

Antes de cada deploy, verificar:

- [ ] Nenhum novo endpoint admin sem verificação de role no servidor
- [ ] Nenhuma nova query SQL raw sem sanitização
- [ ] Nenhum novo campo de timestamp usando `Date` (deve ser `number`)
- [ ] Nenhum novo arquivo binário >100KB no banco (usar S3)
- [ ] Nenhuma nova chamada LLM no frontend
- [ ] Todos os novos endpoints têm testes unitários
- [ ] Schema Drizzle sincronizado com banco MySQL

---

*Documento criado em 2026-02-27 | Próxima revisão: 2026-05-27 | Custódio: Italo Teofilo*
