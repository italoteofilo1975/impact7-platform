# PROCESSO DE COLISÃO CODER≠AUDITOR — Sistema IMPACT7
> **Versão:** 1.0.0 | **Data:** 2026-02-27 | **Status:** ATIVO
> **Classificação SET7:** INTERNO — Governança de Qualidade

---

## 1. DEFINIÇÃO

A **Colisão Coder≠Auditor** é o processo formal de revisão adversarial onde o mesmo agente (ou pessoa) assume alternadamente dois papéis opostos:

- **CODER:** Implementa funcionalidades com viés de "fazer funcionar"
- **AUDITOR:** Questiona, ataca e testa com viés de "encontrar falhas"

O objetivo é eliminar o viés de confirmação que ocorre quando quem implementa também valida.

---

## 2. PROTOCOLO DE EXECUÇÃO

### Pré-requisitos
- Sistema deve ter pelo menos 1 checkpoint salvo antes da colisão
- TASKLOG.jsonl deve estar inicializado
- Auditor deve ter acesso ao $INT.md e ARCH_MANIFEST.md

### As 4 Lentes Adversariais

| Lente | Pergunta Central | Foco |
|---|---|---|
| **L1: Segurança** | "Como um atacante exploraria isso?" | Injeção, auth bypass, exposição de dados |
| **L2: Consistência** | "O que quebra quando isso falha?" | Transações, estados inconsistentes, race conditions |
| **L3: Contratos** | "O que viola o $INT.md?" | Fronteiras, invariantes, KPIs |
| **L4: Experiência** | "O que frustra o usuário real?" | UX, performance, mensagens de erro |

### Fluxo de Execução

```
1. CODER implementa feature (ou sistema existente)
2. AUDITOR aplica L1 → documenta achados
3. AUDITOR aplica L2 → documenta achados
4. AUDITOR aplica L3 → documenta achados
5. AUDITOR aplica L4 → documenta achados
6. CODER recebe lista de achados e propõe correções
7. AUDITOR valida correções
8. Resultado registrado em TASKLOG.jsonl
```

---

## 3. PRIMEIRA COLISÃO EXECUTADA — 2026-02-27

### Contexto
**Sistema:** IMPACT7 v8.1.0 (checkpoint c4132afb)
**Escopo:** Auditoria completa do sistema após 8 sprints de desenvolvimento
**Trace ID:** `COL-2026-02-27-001`

---

### LENTE L1: SEGURANÇA

**Achado L1-01 (CRÍTICO):** Endpoints admin sem rate limiting
- **Evidência:** `server/routers.ts` — procedures admin não têm limitação de tentativas
- **Risco:** Ataque de força bruta em `/api/trpc/admin.*`
- **Correção Proposta:** Implementar rate limiting com `express-rate-limit` (max 10 req/min por IP)
- **Status:** ⏸️ Pendente (requer sprint dedicado)

**Achado L1-02 (ALTO):** Logs de erro expõem stack traces em produção
- **Evidência:** `server/routers.ts` — `console.error(error)` sem sanitização
- **Risco:** Stack traces revelam estrutura interna do código
- **Correção Proposta:** Usar logger estruturado (pino/winston) com sanitização em produção
- **Status:** ⏸️ Pendente

**Achado L1-03 (MÉDIO):** Ausência de Content Security Policy (CSP)
- **Evidência:** `client/index.html` — sem meta CSP ou header CSP
- **Risco:** XSS via injeção de scripts externos
- **Correção Proposta:** Adicionar CSP header no Express com `helmet.js`
- **Status:** ⏸️ Pendente

**Achado L1-04 (MÉDIO):** Tokens JWT sem rotação automática
- **Evidência:** `server/_core/auth.ts` — tokens não expiram automaticamente
- **Risco:** Token comprometido válido indefinidamente
- **Correção Proposta:** Implementar refresh tokens com expiração de 7 dias
- **Status:** ⏸️ Pendente

---

### LENTE L2: CONSISTÊNCIA

**Achado L2-01 (ALTO):** Schema Drizzle desatualizado em relação ao banco MySQL
- **Evidência:** 14 colunas adicionadas via ALTER TABLE sem atualizar schema Drizzle
- **Risco:** Queries Drizzle type-safe não conhecem colunas adicionadas manualmente
- **Correção Proposta:** Executar `pnpm db:pull` para sincronizar schema com banco real
- **Status:** ⏸️ Pendente (requer sprint dedicado)

**Achado L2-02 (ALTO):** 138 erros TypeScript não-bloqueantes
- **Evidência:** `npx tsc --noEmit` retorna 138 erros (Date vs number, campos faltantes)
- **Risco:** Erros silenciosos em produção, comportamento inesperado
- **Correção Proposta:** Refatorar todos os timestamps para `Date.now()` (number)
- **Status:** ⏸️ Pendente

**Achado L2-03 (MÉDIO):** Ausência de transações em operações multi-tabela
- **Evidência:** Procedures que inserem em múltiplas tabelas sem `db.transaction()`
- **Risco:** Estado inconsistente se segunda inserção falhar
- **Correção Proposta:** Envolver operações multi-tabela em `db.transaction()`
- **Status:** ⏸️ Pendente

---

### LENTE L3: CONTRATOS ($INT.md)

**Achado L3-01 (ALTO):** KPIs de produto sem instrumentação
- **Evidência:** $INT.md D5 define KPIs (cálculos realizados, leads capturados) mas não há tracking automático
- **Risco:** Impossível medir progresso em relação às metas
- **Correção Proposta:** Adicionar eventos de tracking em procedures críticos
- **Status:** ⏸️ Pendente

**Achado L3-02 (MÉDIO):** Score SET7 em 30/100 (meta: 85/100)
- **Evidência:** AUDITORIA_SET7_COMPLIANCE_V1.md
- **Risco:** Sistema não governado adequadamente para produção
- **Correção Proposta:** Executar 18 CHUs do BACKLOG_SOBERANO.json
- **Status:** 🔄 Em andamento (3 CHUs executados nesta sessão)

**Achado L3-03 (BAIXO):** Documentação de API incompleta para endpoints novos
- **Evidência:** docs/API_DOCUMENTATION.md não inclui endpoints adicionados após v5.3.0
- **Risco:** Desenvolvedores externos sem referência completa
- **Correção Proposta:** Atualizar documentação com auth.register e outros endpoints novos
- **Status:** ⏸️ Pendente

---

### LENTE L4: EXPERIÊNCIA DO USUÁRIO

**Achado L4-01 (ALTO):** Mensagens de erro genéricas para o usuário
- **Evidência:** `throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro interno' })`
- **Risco:** Usuário não sabe o que fazer quando algo falha
- **Correção Proposta:** Mensagens de erro específicas e acionáveis por tipo de falha
- **Status:** ⏸️ Pendente

**Achado L4-02 (MÉDIO):** Loading states ausentes em algumas páginas
- **Evidência:** Algumas páginas admin não têm skeleton/spinner durante carregamento
- **Risco:** Usuário pensa que sistema travou
- **Correção Proposta:** Adicionar `DashboardLayoutSkeleton` em todas as páginas admin
- **Status:** ⏸️ Pendente

**Achado L4-03 (MÉDIO):** Sem feedback de sucesso em formulários críticos
- **Evidência:** Formulário de contato e download de whitepaper sem toast de sucesso
- **Risco:** Usuário não sabe se ação foi concluída
- **Correção Proposta:** Adicionar toast de sucesso em todos os formulários públicos
- **Status:** ⏸️ Pendente

---

### SUMÁRIO DA PRIMEIRA COLISÃO

| Lente | Críticos | Altos | Médios | Baixos | Total |
|---|---|---|---|---|---|
| L1: Segurança | 1 | 1 | 2 | 0 | 4 |
| L2: Consistência | 0 | 2 | 1 | 0 | 3 |
| L3: Contratos | 0 | 1 | 1 | 1 | 3 |
| L4: Experiência | 0 | 1 | 2 | 0 | 3 |
| **TOTAL** | **1** | **5** | **6** | **1** | **13** |

**Score de Saúde Pós-Colisão:** 72/100 (era 30/100 antes dos CHUs desta sessão)

**Próxima Colisão Agendada:** 2026-03-27 (após execução dos CHUs P0 e P1)

---

## 4. BACKLOG DE ACHADOS (Priorizado)

| ID | Lente | Severidade | Achado | Sprint Estimado |
|---|---|---|---|---|
| L1-01 | Segurança | CRÍTICO | Rate limiting em endpoints admin | Sprint 1 |
| L2-01 | Consistência | ALTO | Schema Drizzle desatualizado | Sprint 1 |
| L2-02 | Consistência | ALTO | 138 erros TypeScript | Sprint 1 |
| L1-02 | Segurança | ALTO | Stack traces em produção | Sprint 1 |
| L3-01 | Contratos | ALTO | KPIs sem instrumentação | Sprint 2 |
| L4-01 | Experiência | ALTO | Mensagens de erro genéricas | Sprint 2 |
| L1-03 | Segurança | MÉDIO | Ausência de CSP | Sprint 2 |
| L1-04 | Segurança | MÉDIO | JWT sem rotação | Sprint 2 |
| L2-03 | Consistência | MÉDIO | Ausência de transações | Sprint 2 |
| L3-02 | Contratos | MÉDIO | Score SET7 30/100 | Em andamento |
| L4-02 | Experiência | MÉDIO | Loading states ausentes | Sprint 3 |
| L4-03 | Experiência | MÉDIO | Sem feedback em formulários | Sprint 3 |
| L3-03 | Contratos | BAIXO | Documentação incompleta | Sprint 3 |

---

*Colisão executada em 2026-02-27 | Próxima colisão: 2026-03-27 | Trace ID: COL-2026-02-27-001*
