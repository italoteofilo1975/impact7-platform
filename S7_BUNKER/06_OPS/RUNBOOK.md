# RUNBOOK — IMPACT7 Platform
**Versão:** 1.0.0  
**Data:** 2026-02-27  
**Classificação:** OPERACIONAL — SET7.04 Segurança, Governança e Confiança  
**Responsável:** Equipe de Operações IMPACT7

---

## Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Deploy e Publicação](#2-deploy-e-publicação)
3. [Rollback de Versão](#3-rollback-de-versão)
4. [Incident Response](#4-incident-response)
5. [Backup e Restauração](#5-backup-e-restauração)
6. [Monitoramento e Alertas](#6-monitoramento-e-alertas)
7. [Gestão de Usuários e Acessos](#7-gestão-de-usuários-e-acessos)
8. [Manutenção Programada](#8-manutenção-programada)
9. [Escalada e Contatos](#9-escalada-e-contatos)

---

## 1. Visão Geral do Sistema

O IMPACT7 Platform é uma aplicação web full-stack composta por:

| Camada | Tecnologia | Descrição |
|---|---|---|
| Frontend | React 19 + Vite 7 + Tailwind 4 | SPA com 91 páginas e 236 procedures tRPC |
| Backend | Express 4 + tRPC 11 | API REST + RPC com autenticação JWT |
| Banco de Dados | MySQL/TiDB (Drizzle ORM) | 48 tabelas, schema versionado |
| Autenticação | Manus OAuth + JWT customizado | Cookies HttpOnly, sessões seguras |
| Storage | S3 (Manus Built-in) | Arquivos, uploads, assets |
| LLM | Manus Forge API | Jarvis AI Chat, análises |

**URLs de Produção:**

- Site público: `https://impact7plat-5ljsracn.manus.space`
- Dev server: `http://localhost:3000`
- API base: `/api/trpc`

---

## 2. Deploy e Publicação

### 2.1 Pré-requisitos de Deploy

Antes de publicar qualquer versão, verificar:

```bash
# 1. Verificar erros TypeScript (deve ser 0)
cd /home/ubuntu/impact7-platform-permanent
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l

# 2. Executar suite de testes (deve ser >= 375/376)
pnpm test --run 2>&1 | tail -10

# 3. Verificar build sem erros
pnpm build 2>&1 | tail -20
```

### 2.2 Fluxo de Deploy via Manus UI

O deploy é realizado exclusivamente via interface Manus (não há CLI de deploy):

1. Acessar o painel do projeto em `https://manus.im`
2. Verificar que existe um **checkpoint salvo** (obrigatório para publicar)
3. Clicar no botão **"Publish"** no cabeçalho do Management UI
4. Aguardar propagação (tipicamente 2–5 minutos)
5. Verificar a URL de produção após deploy

### 2.3 Criar Checkpoint Antes do Deploy

```bash
# Salvar checkpoint via ferramenta webdev_save_checkpoint
# Descrição deve incluir: versão semântica + resumo das mudanças
# Exemplo: "v8.4.0 — RUNBOOK + glossário + 376/376 testes"
```

### 2.4 Verificação Pós-Deploy

Após publicar, executar checklist:

| Verificação | Comando/URL | Resultado Esperado |
|---|---|---|
| Homepage carrega | `GET /` | HTTP 200, título "IMPACT7" |
| API health | `GET /api/trpc/system.health` | `{"status":"ok"}` |
| Login funciona | `POST /api/login` | Cookie de sessão definido |
| Admin acessível | `GET /admin` | Redireciona para login se não autenticado |
| Rate limiting ativo | 11 req/min para `/api/trpc/admin.*` | HTTP 429 na 11ª requisição |

---

## 3. Rollback de Versão

### 3.1 Rollback Imediato (< 5 minutos)

Em caso de incidente crítico em produção, o rollback é realizado via Manus UI:

1. Acessar o painel do projeto
2. Navegar até **Management UI → Checkpoints**
3. Identificar o último checkpoint estável (antes do incidente)
4. Clicar em **"Rollback"** no checkpoint desejado
5. Confirmar a operação
6. Verificar que a versão anterior está ativa

### 3.2 Identificar Versão Estável

Os checkpoints são identificados por `version_id` (hash de 8 caracteres). Versões estáveis conhecidas:

| Version ID | Descrição | Data |
|---|---|---|
| `384af522` | v8.3.0 — 0 erros TS, rate limiting admin | 2026-02-27 |
| `034959cd` | v8.2.0 — 3 CHUs SET7 (INT, ARCH, COLISAO) | 2026-01-24 |
| `02123c0e` | v1.0.0 — Scaffold inicial | 2026-01-24 |

### 3.3 Rollback de Schema de Banco

Se o rollback envolver mudanças de schema:

```bash
# ATENÇÃO: Drizzle não suporta rollback automático de migrations
# Procedimento manual:
cd /home/ubuntu/impact7-platform-permanent

# 1. Verificar migrations aplicadas
ls drizzle/migrations/

# 2. Para reverter uma migration, editar drizzle/schema.ts
#    e executar db:push (apenas em dev/staging, NUNCA em produção diretamente)
pnpm db:push

# 3. Em produção, usar backup do banco (ver seção 5)
```

---

## 4. Incident Response

### 4.1 Classificação de Severidade

| Nível | Descrição | Tempo de Resposta | Exemplo |
|---|---|---|---|
| **P0 — Crítico** | Sistema completamente indisponível | < 15 min | Servidor down, banco inacessível |
| **P1 — Alto** | Funcionalidade core degradada | < 1h | Login falha, Jarvis AI offline |
| **P2 — Médio** | Funcionalidade secundária afetada | < 4h | Admin dashboard com erro |
| **P3 — Baixo** | Problema cosmético ou de UX | < 24h | Texto incorreto, layout quebrado |

### 4.2 Procedimento de Incident Response

**Passo 1 — Detecção e Triagem**

```bash
# Verificar logs do servidor
tail -100 /home/ubuntu/impact7-platform-permanent/.manus-logs/devserver.log

# Verificar erros do browser
tail -50 /home/ubuntu/impact7-platform-permanent/.manus-logs/browserConsole.log

# Verificar requisições de rede
tail -50 /home/ubuntu/impact7-platform-permanent/.manus-logs/networkRequests.log
```

**Passo 2 — Diagnóstico**

```bash
# Verificar se o servidor está rodando
ss -tlnp | grep node

# Verificar conexão com banco
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection(process.env.DATABASE_URL).then(c => {
  c.query('SELECT 1').then(() => { console.log('DB OK'); c.end(); });
}).catch(e => console.error('DB FAIL:', e.message));
"

# Verificar uso de memória/CPU
ps aux | grep node | head -5
```

**Passo 3 — Mitigação**

Para P0/P1, executar rollback imediato (seção 3.1) enquanto o problema é investigado.

**Passo 4 — Resolução e Post-mortem**

Após resolver o incidente:

1. Documentar o incidente no `S7_BUNKER/04_COLISAO/PROCESSO_COLISAO.md`
2. Adicionar entrada no `S7_BUNKER/02_INT/TASKLOG.jsonl`
3. Criar CHU de correção se necessário

### 4.3 Runbook de Erros Comuns

| Erro | Causa Provável | Solução |
|---|---|---|
| `db.execute is not a function` | Cache de build desatualizado | `pnpm build --force` + restart |
| `Unknown column 'X'` | Migration não aplicada | `pnpm db:push` |
| `JWT malformed` | Cookie corrompido | Limpar cookies do browser |
| `Rate limit exceeded` | Muitas requisições | Aguardar 1 minuto (admin) ou 15 min (auth) |
| `LLM timeout` | Forge API sobrecarregada | Retry com backoff exponencial |
| `WebSocket connection failed` | Servidor reiniciado | Recarregar página |

---

## 5. Backup e Restauração

### 5.1 Estratégia de Backup

O IMPACT7 utiliza backup em múltiplas camadas:

| Camada | Frequência | Retenção | Responsável |
|---|---|---|---|
| Checkpoints Manus | A cada feature/fix | Indefinida | Equipe Dev |
| Backup de Banco (automático) | Diário | 7 dias | Manus Platform |
| Backup de Banco (manual) | Antes de migrations | Manual | DBA/Dev |
| Assets S3 | Contínuo (replicação) | Indefinida | Manus Platform |

### 5.2 Backup Manual do Banco

```bash
# Exportar schema atual
cd /home/ubuntu/impact7-platform-permanent
node -e "
const { execSync } = require('child_process');
const date = new Date().toISOString().split('T')[0];
// Usar mysqldump via DATABASE_URL
console.log('Backup iniciado:', date);
"

# Alternativa: usar o BackupService integrado ao sistema
# Endpoint: POST /api/trpc/admin.triggerBackup
# Requer: autenticação admin
```

### 5.3 Restauração de Banco

Em caso de necessidade de restauração:

1. Acessar o painel do banco via **Management UI → Database**
2. Verificar o backup mais recente disponível
3. Executar restauração via interface (não há CLI disponível)
4. Após restauração, verificar integridade: `pnpm db:push` (sem mudanças de schema)

---

## 6. Monitoramento e Alertas

### 6.1 Métricas Críticas

| Métrica | Threshold Alerta | Threshold Crítico |
|---|---|---|
| Tempo de resposta API | > 2s | > 5s |
| Taxa de erros HTTP 5xx | > 1% | > 5% |
| Uso de memória Node.js | > 512MB | > 1GB |
| Conexões de banco ativas | > 80% do pool | > 95% |
| Rate limit hits (admin) | > 50/min | > 200/min |
| Tokens LLM consumidos | > 80% do budget | > 95% |

### 6.2 Verificação de Saúde

```bash
# Health check completo
curl -s http://localhost:3000/api/trpc/system.health | jq .

# Verificar métricas do sistema
curl -s http://localhost:3000/api/trpc/admin.getSystemMetrics \
  -H "Cookie: session=<token>" | jq .

# Verificar status do rate limiting
curl -I http://localhost:3000/api/trpc/admin.listUsers \
  -H "Cookie: session=<token>"
# Observar headers: RateLimit-Remaining, RateLimit-Reset
```

### 6.3 Alertas Configurados

O sistema possui alertas automáticos via `notifyOwner()` para:

- Novo lead cadastrado
- Novo download de whitepaper
- Nova submissão de case
- Nova mensagem de contato
- Erro crítico de sistema (P0/P1)
- Limite de tokens LLM atingido (80%)

---

## 7. Gestão de Usuários e Acessos

### 7.1 Criar Usuário Admin

```sql
-- Via Management UI → Database → SQL Editor
-- Ou via webdev_execute_sql

-- 1. Criar usuário (se não existir)
INSERT INTO users (name, email, role, createdAt, updatedAt)
VALUES ('Nome Admin', 'email@dominio.com', 'admin', UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000);

-- 2. Definir senha (hash bcrypt)
-- A senha deve ser gerada via bcrypt com salt rounds = 10
-- Usar o endpoint POST /api/login para testar após criação
```

### 7.2 Promover Usuário para Admin

```sql
-- Promover usuário existente
UPDATE users SET role = 'admin', updatedAt = UNIX_TIMESTAMP()*1000
WHERE email = 'usuario@dominio.com';
```

### 7.3 Revogar Acesso

```sql
-- Revogar acesso admin
UPDATE users SET role = 'user', updatedAt = UNIX_TIMESTAMP()*1000
WHERE email = 'usuario@dominio.com';

-- Desativar conta (não há campo isActive em users, usar role 'banned' se necessário)
-- Alternativa: deletar sessões ativas
DELETE FROM sessions WHERE userId = (SELECT id FROM users WHERE email = 'usuario@dominio.com');
```

---

## 8. Manutenção Programada

### 8.1 Checklist Semanal

- [ ] Verificar logs de erro dos últimos 7 dias
- [ ] Verificar consumo de tokens LLM vs budget
- [ ] Verificar taxa de conversão de leads
- [ ] Verificar backup do banco (último 24h)
- [ ] Executar suite de testes: `pnpm test --run`
- [ ] Verificar se há dependências com vulnerabilidades: `pnpm audit`

### 8.2 Checklist Mensal

- [ ] Revisar e rodar a Colisão Coder≠Auditor (ver `S7_BUNKER/04_COLISAO/PROCESSO_COLISAO.md`)
- [ ] Atualizar dependências: `pnpm update --interactive`
- [ ] Revisar rate limit hits e ajustar thresholds se necessário
- [ ] Revisar métricas de performance (Core Web Vitals)
- [ ] Atualizar `TASKLOG.jsonl` com resumo do mês

### 8.3 Atualização de Dependências

```bash
cd /home/ubuntu/impact7-platform-permanent

# Verificar dependências desatualizadas
pnpm outdated

# Atualizar com interação (recomendado)
pnpm update --interactive --latest

# Após atualização, sempre verificar:
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l  # deve ser 0
pnpm test --run 2>&1 | tail -5                     # deve ser >= 375/376
pnpm build 2>&1 | tail -5                          # deve ser sem erros
```

---

## 9. Escalada e Contatos

### 9.1 Matriz de Escalada

| Situação | Primeiro Contato | Escalada |
|---|---|---|
| Incidente P0 | Equipe Dev (imediato) | Manus Support |
| Incidente P1 | Equipe Dev (< 1h) | Tech Lead |
| Problema de banco | DBA/Dev | Manus Support |
| Problema de billing/créditos | — | https://help.manus.im |
| Bug de plataforma Manus | — | https://help.manus.im |

### 9.2 Links Úteis

| Recurso | URL |
|---|---|
| Manus Platform | https://manus.im |
| Suporte Manus | https://help.manus.im |
| Documentação tRPC | https://trpc.io/docs |
| Documentação Drizzle | https://orm.drizzle.team/docs |
| IMPACT7 Site | https://impact7plat-5ljsracn.manus.space |

---

## Histórico de Revisões

| Versão | Data | Autor | Mudanças |
|---|---|---|---|
| 1.0.0 | 2026-02-27 | Manus AI | Criação inicial do RUNBOOK |

---

*Este documento faz parte do S7_BUNKER — Repositório de Governança SET7 do IMPACT7 Platform.*  
*Próxima revisão programada: 2026-03-27*
