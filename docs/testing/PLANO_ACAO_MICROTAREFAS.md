# Plano de Ação — Microtarefas Sequenciais (SET7)

**Data:** 2026-01-24  
**Sistema:** IMPACT7 Platform  
**Objetivo:** Levar o sistema a 100% funcional e 100% aderente ao método SET7  
**Abordagem:** Opção B (Pragmática) — 10 telas críticas + DevSecOps em 8-12h

---

## LEGENDA

- **ID:** Identificador único da microtarefa
- **Predecessora:** Tarefa que deve ser concluída antes (dependência)
- **Duração:** Tempo estimado em minutos
- **Prioridade:** P0 (Bloqueador) / P1 (Crítico) / P2 (Alto) / P3 (Médio) / P4 (Baixo)
- **Status:** ⏳ Pendente / 🔄 Em Progresso / ✅ Concluído / ❌ Bloqueado

---

## FASE 1: CORREÇÕES CRÍTICAS (2h)

### MT-001: Corrigir erro LLM API key não configurada
**Predecessora:** Nenhuma  
**Duração:** 30 min  
**Prioridade:** P0 (Bloqueador)  
**Status:** ⏳ Pendente

**Descrição:**  
Servidor está falhando com erro "Neither apiKey nor config.authenticator provided" ao tentar usar LLM (Jarvis).

**Ação:**
1. Verificar se `BUILT_IN_FORGE_API_KEY` está configurado
2. Verificar se `invokeLLM` está usando a chave correta
3. Testar Jarvis após correção

**Critério de Aceite:**
- ✅ Servidor inicia sem erros
- ✅ Jarvis responde a mensagens

---

### MT-002: Adicionar loading state no botão "Calculate Impact"
**Predecessora:** Nenhuma  
**Duração:** 20 min  
**Prioridade:** P3 (Médio)  
**Status:** ⏳ Pendente

**Descrição:**  
Botão "Calculate Impact" não exibe loading state durante cálculo (BUG-CALC-02).

**Ação:**
1. Adicionar `const [isCalculating, setIsCalculating] = useState(false)`
2. Adicionar `setIsCalculating(true)` no início de `handleCalculate`
3. Adicionar `setIsCalculating(false)` no `finally` de `handleCalculate`
4. Adicionar `disabled={isCalculating}` no botão
5. Adicionar spinner ou texto "Calculando..." no botão

**Critério de Aceite:**
- ✅ Botão exibe loading durante cálculo
- ✅ Botão fica desabilitado durante cálculo

**Arquivo:** `client/src/pages/Calculadora.tsx`

---

### MT-003: Corrigir erros TypeScript no websocket-service
**Predecessora:** Nenhuma  
**Duração:** 15 min  
**Prioridade:** P4 (Baixo)  
**Status:** ⏳ Pendente

**Descrição:**  
4 erros TypeScript no arquivo `server/services/websocket/websocket-service.ts` (parâmetros com tipo `any` implícito).

**Ação:**
1. Adicionar tipos explícitos aos parâmetros `ws`, `req`, `data`, `error`
2. Importar tipos do pacote `ws`

**Critério de Aceite:**
- ✅ Erros TypeScript resolvidos (327 → 323)

**Arquivo:** `server/services/websocket/websocket-service.ts`

---

## FASE 2: TESTES E2E - TELAS CRÍTICAS (4h)

### MT-004: Testar TEL-AUTH-01 (Login)
**Predecessora:** MT-001 (LLM corrigido)  
**Duração:** 30 min  
**Prioridade:** P1 (Crítico)  
**Status:** ⏳ Pendente

**Descrição:**  
Testar fluxo completo de login (email/senha, OAuth, redirect).

**Casos de Teste:**
- TC-AUTH-01: Login com credenciais válidas
- TC-AUTH-02: Login com credenciais inválidas
- TC-AUTH-03: Login com OAuth (Manus)
- TC-AUTH-04: Redirect após login
- TC-AUTH-05: Logout

**Critério de Aceite:**
- ✅ Ficha de teste criada
- ✅ 5 casos executados
- ✅ Evidências coletadas (prints, logs)
- ✅ Bugs registrados (se houver)

**Artefatos:**
- `docs/testing/fase1/TEL-AUTH-01_FICHA_TESTE.md`

---

### MT-005: Testar TEL-JARV-CHAT (Jarvis AI)
**Predecessora:** MT-001 (LLM corrigido), MT-004 (Login testado)  
**Duração:** 40 min  
**Prioridade:** P1 (Crítico)  
**Status:** ⏳ Pendente

**Descrição:**  
Testar chat com Jarvis (envio de mensagem, resposta, streaming, histórico).

**Casos de Teste:**
- TC-JARV-01: Abrir chat
- TC-JARV-02: Enviar mensagem
- TC-JARV-03: Receber resposta (streaming)
- TC-JARV-04: Testar timeout (mensagem longa)
- TC-JARV-05: Testar histórico de conversas
- TC-JARV-06: Testar salvamento no banco

**Critério de Aceite:**
- ✅ Ficha de teste criada
- ✅ 6 casos executados
- ✅ Evidências coletadas
- ✅ Bugs registrados (se houver)

**Artefatos:**
- `docs/testing/fase1/TEL-JARV-CHAT_FICHA_TESTE.md`

---

### MT-006: Testar TEL-ADM-01 (Admin Dashboard)
**Predecessora:** MT-004 (Login testado)  
**Duração:** 30 min  
**Prioridade:** P1 (Crítico — Segurança)  
**Status:** ⏳ Pendente

**Descrição:**  
Testar acesso ao admin dashboard (autorização, métricas, navegação).

**Casos de Teste:**
- TC-ADM-01: Acesso sem autenticação (deve redirecionar)
- TC-ADM-02: Acesso com usuário não-admin (deve retornar 403)
- TC-ADM-03: Acesso com admin (caminho feliz)
- TC-ADM-04: Carregar métricas
- TC-ADM-05: Navegar entre módulos admin

**Critério de Aceite:**
- ✅ Ficha de teste criada
- ✅ 5 casos executados
- ✅ Evidências coletadas
- ✅ Bugs registrados (se houver)

**Artefatos:**
- `docs/testing/fase1/TEL-ADM-01_FICHA_TESTE.md`

---

### MT-007: Testar TEL-DOWN-01 (Whitepaper)
**Predecessora:** Nenhuma  
**Duração:** 30 min  
**Prioridade:** P2 (Alto)  
**Status:** ⏳ Pendente

**Descrição:**  
Testar formulário de download de whitepaper (validação, criação de lead, download).

**Casos de Teste:**
- TC-DOWN-01: Formulário vazio (validação)
- TC-DOWN-02: Email inválido
- TC-DOWN-03: Email duplicado
- TC-DOWN-04: Submissão válida (caminho feliz)
- TC-DOWN-05: Verificar lead criado no banco
- TC-DOWN-06: Verificar download registrado
- TC-DOWN-07: Verificar notificação ao owner
- TC-DOWN-08: Testar download do PDF

**Critério de Aceite:**
- ✅ Ficha de teste criada
- ✅ 8 casos executados
- ✅ Evidências coletadas
- ✅ Bugs registrados (se houver)

**Artefatos:**
- `docs/testing/fase1/TEL-DOWN-01_FICHA_TESTE.md`

---

### MT-008: Testar TEL-CASE-03 (Case Submit)
**Predecessora:** MT-004 (Login testado)  
**Duração:** 30 min  
**Prioridade:** P2 (Alto)  
**Status:** ⏳ Pendente

**Descrição:**  
Testar submissão de case (formulário, upload de imagem S3, salvamento).

**Casos de Teste:**
- TC-CASE-01: Acesso sem autenticação
- TC-CASE-02: Formulário vazio (validação)
- TC-CASE-03: Upload de imagem (sucesso)
- TC-CASE-04: Upload de imagem (falha)
- TC-CASE-05: Submissão válida (caminho feliz)
- TC-CASE-06: Verificar registro no banco
- TC-CASE-07: Verificar notificação ao admin

**Critério de Aceite:**
- ✅ Ficha de teste criada
- ✅ 7 casos executados
- ✅ Evidências coletadas
- ✅ Bugs registrados (se houver)

**Artefatos:**
- `docs/testing/fase1/TEL-CASE-03_FICHA_TESTE.md`

---

### MT-009: Testar TEL-HOME-01 (Homepage)
**Predecessora:** Nenhuma  
**Duração:** 30 min  
**Prioridade:** P2 (Alto)  
**Status:** ⏳ Pendente

**Descrição:**  
Testar homepage (carregamento, CTAs, widget de acessibilidade, seletor de idiomas, theme switcher, Jarvis).

**Casos de Teste:**
- TC-HOME-01: Carregamento em diferentes resoluções
- TC-HOME-02: Testar botões de CTA
- TC-HOME-03: Testar widget de acessibilidade (4 modos)
- TC-HOME-04: Testar seletor de idiomas (PT/EN/ES)
- TC-HOME-05: Testar theme switcher (dark/light)
- TC-HOME-06: Testar Jarvis chat (botão verde flutuante)

**Critério de Aceite:**
- ✅ Ficha de teste criada
- ✅ 6 casos executados
- ✅ Evidências coletadas
- ✅ Bugs registrados (se houver)

**Artefatos:**
- `docs/testing/fase1/TEL-HOME-01_FICHA_TESTE.md`

---

### MT-010: Testar TEL-AUTH-05 (Profile)
**Predecessora:** MT-004 (Login testado)  
**Duração:** 20 min  
**Prioridade:** P2 (Alto)  
**Status:** ⏳ Pendente

**Descrição:**  
Testar página de perfil (carregamento, edição, upload de avatar).

**Casos de Teste:**
- TC-PROF-01: Acesso sem autenticação
- TC-PROF-02: Carregamento de dados do perfil
- TC-PROF-03: Edição de nome
- TC-PROF-04: Upload de avatar
- TC-PROF-05: Verificar atualização no banco

**Critério de Aceite:**
- ✅ Ficha de teste criada
- ✅ 5 casos executados
- ✅ Evidências coletadas
- ✅ Bugs registrados (se houver)

**Artefatos:**
- `docs/testing/fase1/TEL-AUTH-05_FICHA_TESTE.md`

---

### MT-011: Testar TEL-NOTIF-01 (Notificações)
**Predecessora:** MT-004 (Login testado)  
**Duração:** 20 min  
**Prioridade:** P3 (Médio)  
**Status:** ⏳ Pendente

**Descrição:**  
Testar página de notificações (listagem, marcar como lida).

**Casos de Teste:**
- TC-NOTIF-01: Acesso sem autenticação
- TC-NOTIF-02: Listagem vazia
- TC-NOTIF-03: Listagem com notificações
- TC-NOTIF-04: Marcar como lida

**Critério de Aceite:**
- ✅ Ficha de teste criada
- ✅ 4 casos executados
- ✅ Evidências coletadas
- ✅ Bugs registrados (se houver)

**Artefatos:**
- `docs/testing/fase1/TEL-NOTIF-01_FICHA_TESTE.md`

---

### MT-012: Testar TEL-PAY-03 (Payments)
**Predecessora:** MT-004 (Login testado)  
**Duração:** 20 min  
**Prioridade:** P3 (Médio)  
**Status:** ⏳ Pendente

**Descrição:**  
Testar página de pagamentos (listagem de planos, checkout Stripe).

**Casos de Teste:**
- TC-PAY-01: Acesso sem autenticação
- TC-PAY-02: Listagem de planos
- TC-PAY-03: Botão de checkout (Stripe não configurado)
- TC-PAY-04: Verificar mensagem de erro clara

**Critério de Aceite:**
- ✅ Ficha de teste criada
- ✅ 4 casos executados
- ✅ Evidências coletadas
- ✅ Bugs registrados (se houver)

**Artefatos:**
- `docs/testing/fase1/TEL-PAY-03_FICHA_TESTE.md`

---

## FASE 3: AUDITORIA DEVSECOPS (2h)

### MT-013: G1 — Segurança & Compliance
**Predecessora:** MT-012 (Testes E2E concluídos)  
**Duração:** 20 min  
**Prioridade:** P1 (Crítico)  
**Status:** ⏳ Pendente

**Descrição:**  
Auditar segurança (OWASP Top 10, IAM, secrets, supply chain, privacidade).

**Checklist:**
- [ ] SAST scan executado (sem vulnerabilidades críticas)
- [ ] SCA scan executado (dependências atualizadas)
- [ ] Secrets scan executado (sem secrets hardcoded)
- [ ] IAM configurado (roles, permissões)
- [ ] HTTPS habilitado
- [ ] CORS configurado corretamente
- [ ] Rate limiting implementado
- [ ] LGPD/GDPR compliance (se aplicável)

**Critério de Aceite:**
- ✅ Relatório de auditoria criado
- ✅ Vulnerabilidades S0/S1 corrigidas

**Artefatos:**
- `docs/testing/auditoria/G1_SEGURANCA_COMPLIANCE.md`

---

### MT-014: G2 — Engenharia & Qualidade
**Predecessora:** MT-013  
**Duração:** 15 min  
**Prioridade:** P2 (Alto)  
**Status:** ⏳ Pendente

**Descrição:**  
Auditar manutenibilidade, padrões, arquitetura, dívida técnica.

**Checklist:**
- [ ] Código segue padrões (ESLint, Prettier)
- [ ] Arquitetura documentada
- [ ] Dívida técnica mapeada
- [ ] Code review realizado
- [ ] Testes unitários (cobertura > 70%)

**Critério de Aceite:**
- ✅ Relatório de auditoria criado
- ✅ Dívida técnica priorizada

**Artefatos:**
- `docs/testing/auditoria/G2_ENGENHARIA_QUALIDADE.md`

---

### MT-015: G3 — Testes & Correção Funcional
**Predecessora:** MT-014  
**Duração:** 15 min  
**Prioridade:** P1 (Crítico)  
**Status:** ⏳ Pendente

**Descrição:**  
Auditar estratégia de testes, regressão, contrato, UAT.

**Checklist:**
- [ ] Testes E2E executados (10 telas críticas)
- [ ] Testes de regressão executados
- [ ] Testes de contrato (APIs)
- [ ] UAT realizado (se aplicável)

**Critério de Aceite:**
- ✅ Relatório de auditoria criado
- ✅ Cobertura de testes documentada

**Artefatos:**
- `docs/testing/auditoria/G3_TESTES_CORRECAO_FUNCIONAL.md`

---

### MT-016: G4 — Confiabilidade & Resiliência
**Predecessora:** MT-015  
**Duração:** 15 min  
**Prioridade:** P2 (Alto)  
**Status:** ⏳ Pendente

**Descrição:**  
Auditar rollback, HA, DR, tolerância a falhas.

**Checklist:**
- [ ] Estratégia de rollback testada
- [ ] HA configurado (se aplicável)
- [ ] DR configurado (backup/restore)
- [ ] Circuit breakers implementados
- [ ] Retry logic implementado

**Critério de Aceite:**
- ✅ Relatório de auditoria criado
- ✅ Estratégia de rollback documentada

**Artefatos:**
- `docs/testing/auditoria/G4_CONFIABILIDADE_RESILIENCIA.md`

---

### MT-017: G5 — Observabilidade & Operação
**Predecessora:** MT-016  
**Duração:** 15 min  
**Prioridade:** P2 (Alto)  
**Status:** ⏳ Pendente

**Descrição:**  
Auditar logs, métricas, traces, alertas, SLO, runbooks, on-call.

**Checklist:**
- [ ] Logs estruturados implementados
- [ ] Métricas coletadas (latência, erro, saturação)
- [ ] Traces implementados (se aplicável)
- [ ] Alertas configurados
- [ ] SLO definido
- [ ] Runbooks criados

**Critério de Aceite:**
- ✅ Relatório de auditoria criado
- ✅ Observabilidade mínima garantida

**Artefatos:**
- `docs/testing/auditoria/G5_OBSERVABILIDADE_OPERACAO.md`

---

### MT-018: G6 — Integridade & Governança de Dados
**Predecessora:** MT-017  
**Duração:** 15 min  
**Prioridade:** P1 (Crítico)  
**Status:** ⏳ Pendente

**Descrição:**  
Auditar migrations, constraints, backup/restore, reconciliação.

**Checklist:**
- [ ] Migrations testadas
- [ ] Constraints implementados (FK, UNIQUE, NOT NULL)
- [ ] Backup/restore testado
- [ ] Reconciliação implementada (integrações)
- [ ] Idempotência garantida

**Critério de Aceite:**
- ✅ Relatório de auditoria criado
- ✅ Integridade de dados garantida

**Artefatos:**
- `docs/testing/auditoria/G6_INTEGRIDADE_GOVERNANCA_DADOS.md`

---

### MT-019: G7 — Performance & Escalabilidade
**Predecessora:** MT-018  
**Duração:** 15 min  
**Prioridade:** P2 (Alto)  
**Status:** ⏳ Pendente

**Descrição:**  
Auditar carga, stress, soak, capacidade, tuning, custo/perf.

**Checklist:**
- [ ] Teste de carga executado (baseline)
- [ ] Teste de stress executado (pico)
- [ ] Teste de soak executado (sustentabilidade)
- [ ] Capacidade documentada
- [ ] Tuning realizado (queries, cache)
- [ ] Custo/perf analisado

**Critério de Aceite:**
- ✅ Relatório de auditoria criado
- ✅ Performance aceitável (p95 < 500ms)

**Artefatos:**
- `docs/testing/auditoria/G7_PERFORMANCE_ESCALABILIDADE.md`

---

## FASE 4: CORREÇÃO DE BUGS (2h)

### MT-020: Corrigir bugs S0 (Bloqueadores)
**Predecessora:** MT-019 (Auditoria concluída)  
**Duração:** 60 min  
**Prioridade:** P0 (Bloqueador)  
**Status:** ⏳ Pendente

**Descrição:**  
Corrigir todos os bugs S0 encontrados nos testes E2E e auditoria.

**Ação:**
1. Listar todos os bugs S0
2. Priorizar por impacto
3. Corrigir um a um
4. Testar correção (retest)

**Critério de Aceite:**
- ✅ Todos os bugs S0 corrigidos
- ✅ Reteste executado (PASSOU)

---

### MT-021: Corrigir bugs S1 (Críticos)
**Predecessora:** MT-020  
**Duração:** 60 min  
**Prioridade:** P1 (Crítico)  
**Status:** ⏳ Pendente

**Descrição:**  
Corrigir todos os bugs S1 encontrados nos testes E2E e auditoria.

**Ação:**
1. Listar todos os bugs S1
2. Priorizar por impacto
3. Corrigir um a um
4. Testar correção (retest)

**Critério de Aceite:**
- ✅ Todos os bugs S1 corrigidos
- ✅ Reteste executado (PASSOU)

---

## FASE 5: RETEST E REGRESSÃO (2h)

### MT-022: Executar retest de bugs corrigidos
**Predecessora:** MT-021 (Bugs S0/S1 corrigidos)  
**Duração:** 60 min  
**Prioridade:** P1 (Crítico)  
**Status:** ⏳ Pendente

**Descrição:**  
Retestar todos os bugs corrigidos para garantir que foram resolvidos.

**Ação:**
1. Listar todos os bugs corrigidos
2. Executar casos de teste originais
3. Verificar se bug foi resolvido
4. Atualizar status do bug (RESOLVIDO ou REABERTO)

**Critério de Aceite:**
- ✅ Todos os bugs retestados
- ✅ Taxa de sucesso > 95%

---

### MT-023: Executar regressão nos fluxos críticos
**Predecessora:** MT-022  
**Duração:** 60 min  
**Prioridade:** P1 (Crítico)  
**Status:** ⏳ Pendente

**Descrição:**  
Executar regressão nos fluxos críticos para garantir que correções não quebraram outras funcionalidades.

**Fluxos Críticos:**
1. Login → Admin Dashboard
2. Login → Calculadora → Salvar cálculo
3. Homepage → Whitepaper → Download
4. Login → Jarvis → Enviar mensagem
5. Login → Case Submit → Upload imagem

**Critério de Aceite:**
- ✅ 5 fluxos executados
- ✅ Todos os fluxos PASSARAM

---

## FASE 6: RELATÓRIO FINAL (1h)

### MT-024: Consolidar relatório final
**Predecessora:** MT-023 (Regressão concluída)  
**Duração:** 60 min  
**Prioridade:** P1 (Crítico)  
**Status:** ⏳ Pendente

**Descrição:**  
Consolidar todos os artefatos em um relatório final com decisão Go/No-Go.

**Conteúdo:**
1. Resumo executivo
2. Cobertura de testes (10/88 telas)
3. Bugs encontrados e corrigidos
4. Auditoria DevSecOps (7 gates)
5. Decisão Go/No-Go
6. Recomendações

**Critério de Aceite:**
- ✅ Relatório criado
- ✅ Decisão Go/No-Go documentada
- ✅ Recomendações priorizadas

**Artefatos:**
- `docs/testing/RELATORIO_FINAL_v1.0.md`

---

### MT-025: Salvar checkpoint final v2.0.0
**Predecessora:** MT-024  
**Duração:** 5 min  
**Prioridade:** P1 (Crítico)  
**Status:** ⏳ Pendente

**Descrição:**  
Salvar checkpoint final com todas as correções e melhorias.

**Ação:**
1. Verificar que todo o código está commitado
2. Executar `webdev_save_checkpoint`
3. Gerar URL do checkpoint

**Critério de Aceite:**
- ✅ Checkpoint salvo
- ✅ URL gerada

---

## RESUMO

**Total de Microtarefas:** 25  
**Duração Total Estimada:** 8-12 horas  
**Prioridade P0 (Bloqueadores):** 2 tarefas  
**Prioridade P1 (Críticos):** 11 tarefas  
**Prioridade P2 (Alto):** 8 tarefas  
**Prioridade P3 (Médio):** 3 tarefas  
**Prioridade P4 (Baixo):** 1 tarefa

---

## DEPENDÊNCIAS (GRAFO)

```
MT-001 (LLM fix) ──┬──> MT-004 (Login) ──┬──> MT-005 (Jarvis)
                   │                      ├──> MT-006 (Admin)
                   │                      ├──> MT-008 (Cases)
                   │                      ├──> MT-010 (Profile)
                   │                      ├──> MT-011 (Notif)
                   │                      └──> MT-012 (Payments)
                   │
                   └──> MT-007 (Whitepaper)
                   └──> MT-009 (Homepage)

MT-002 (Loading) ──> (Independente)
MT-003 (TS errors) ──> (Independente)

MT-012 ──> MT-013 (G1) ──> MT-014 (G2) ──> MT-015 (G3) ──> MT-016 (G4) ──> MT-017 (G5) ──> MT-018 (G6) ──> MT-019 (G7)

MT-019 ──> MT-020 (Bugs S0) ──> MT-021 (Bugs S1) ──> MT-022 (Retest) ──> MT-023 (Regressão) ──> MT-024 (Relatório) ──> MT-025 (Checkpoint)
```

---

**Plano criado por:** Agente Lead QA (SET7)  
**Data:** 2026-01-24  
**Status:** ✅ Pronto para execução
