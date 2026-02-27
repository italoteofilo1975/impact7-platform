# Análise Completa dos 412 Erros TypeScript

**Data:** 25/01/2026  
**Projeto:** IMPACT7 Platform  
**Total de Erros:** 412

---

## 📊 Distribuição por Tipo de Erro

| Código | Quantidade | Descrição | Prioridade |
|--------|-----------|-----------|------------|
| **TS2769** | 160 (39%) | No overload matches this call | 🔴 ALTA |
| **TS2322** | 105 (25%) | Type X is not assignable to type Y | 🔴 ALTA |
| **TS2554** | 68 (17%) | Expected 0 arguments, but got 1+ | 🟡 MÉDIA |
| **TS2339** | 35 (8%) | Property does not exist on type | 🟡 MÉDIA |
| **TS2345** | 22 (5%) | Argument of type X is not assignable | 🟢 BAIXA |
| **Outros** | 22 (5%) | Diversos erros menores | 🟢 BAIXA |

---

## 🎯 Estratégia de Refatoração

### **Fase 1: Corrigir TS2322 (105 erros) - Date vs number**
**Problema:** Schema Drizzle define timestamps como `number`, mas código usa `Date`

**Solução:**
```typescript
// ❌ ERRADO (atual)
createdAt: new Date()
updatedAt: new Date()

// ✅ CORRETO (refatorado)
createdAt: Date.now()
updatedAt: Date.now()
```

**Arquivos afetados:**
- `server/services/webhooks/webhook-service.ts` (15+ ocorrências)
- `server/services/auth/local-auth-service.ts` (5+ ocorrências)
- `server/routers.ts` (30+ ocorrências)
- `client/src/pages/AdminReports.tsx` (10+ ocorrências)
- `client/src/pages/AdminAnalytics.tsx` (8+ ocorrências)
- E mais 40+ arquivos

**Padrões de conversão:**
```typescript
// Criar timestamp
new Date() → Date.now()

// Converter Date para number
someDate.getTime()

// Converter number para Date (para exibição)
new Date(timestamp)

// Comparações
date1 > date2 → timestamp1 > timestamp2
```

---

### **Fase 2: Corrigir TS2769 (160 erros) - Overload mismatch**
**Problema:** Funções Drizzle esperam tipos específicos mas recebem tipos incompatíveis

**Exemplo típico:**
```typescript
// ❌ ERRADO
.where(eq(table.nextRetryAt, new Date()))

// ✅ CORRETO
.where(eq(table.nextRetryAt, Date.now()))
```

**Subcategorias:**
1. **Date em comparações SQL** (80 erros)
   - `eq(column, new Date())` → `eq(column, Date.now())`
   - `gt(column, new Date())` → `gt(column, Date.now())`
   - `lt(column, new Date())` → `lt(column, Date.now())`

2. **Tipos incompatíveis em inserts/updates** (50 erros)
   - Campos esperando `number` recebendo `Date`
   - Campos esperando `string` recebendo `undefined`

3. **Overloads de funções helper** (30 erros)
   - Funções customizadas com assinaturas incorretas

---

### **Fase 3: Corrigir TS2554 (68 erros) - int() com argumentos extras**
**Problema:** `int()` do Drizzle não aceita argumentos, mas código passa argumentos

**Exemplo:**
```typescript
// ❌ ERRADO (schema atual)
id: int('id').primaryKey().autoincrement()

// ✅ CORRETO (refatorado)
id: int('id', { mode: 'number' }).primaryKey().autoincrement()
```

**Arquivos afetados:**
- `drizzle/schema.ts` (68 ocorrências)

**Script de correção automática:**
```javascript
// Remover argumentos extras de int()
content = content.replace(
  /int\('(\w+)',\s*\{[^}]*\}\)/g,
  "int('$1')"
);
```

---

### **Fase 4: Corrigir TS2339 (35 erros) - Propriedades inexistentes**
**Problema:** Código acessa propriedades que não existem no tipo

**Exemplos:**
```typescript
// ❌ ERRADO
user.openId // openId foi removido do schema

// ✅ CORRETO
user.id // usar ID numérico
```

**Causas:**
1. **Remoção de openId** (15 erros)
   - Substituir `user.openId` por `user.id`
   - Remover referências em queries

2. **Tipos incompletos** (10 erros)
   - Adicionar propriedades faltantes em interfaces
   - Atualizar tipos gerados pelo Drizzle

3. **Typos e erros de digitação** (10 erros)
   - Corrigir nomes de propriedades

---

## 🛠️ Plano de Execução

### **Rodada 1: Refatorar Schema (30 min)**
- [ ] Remover argumentos extras de `int()` em `drizzle/schema.ts`
- [ ] Validar sintaxe do schema
- [ ] Executar `pnpm db:push` para sincronizar

**Impacto esperado:** -68 erros (412 → 344)

---

### **Rodada 2: Refatorar Server (60 min)**
- [ ] Converter `new Date()` → `Date.now()` em `server/routers.ts`
- [ ] Converter `new Date()` → `Date.now()` em `server/db.ts`
- [ ] Converter `new Date()` → `Date.now()` em `server/services/**/*.ts`
- [ ] Atualizar comparações SQL (eq, gt, lt)

**Impacto esperado:** -150 erros (344 → 194)

---

### **Rodada 3: Refatorar Frontend (45 min)**
- [ ] Converter timestamps em `client/src/pages/Admin*.tsx`
- [ ] Atualizar formatação de datas (usar `new Date(timestamp)`)
- [ ] Corrigir tipos em componentes

**Impacto esperado:** -80 erros (194 → 114)

---

### **Rodada 4: Correções Finais (30 min)**
- [ ] Remover referências a `openId`
- [ ] Corrigir propriedades inexistentes
- [ ] Ajustar tipos de argumentos

**Impacto esperado:** -114 erros (114 → 0)

---

## 📝 Checklist de Validação

Após cada rodada:
- [ ] Executar `pnpm tsc --noEmit` e verificar redução de erros
- [ ] Testar homepage (deve carregar sem erros)
- [ ] Testar login/registro (deve funcionar)
- [ ] Testar calculadora de impacto (deve calcular)
- [ ] Verificar logs do servidor (sem erros críticos)

---

## 🚀 Resultado Esperado

**Antes:** 412 erros TypeScript  
**Depois:** 0 erros TypeScript  
**Tempo estimado:** 2h 45min  
**Complexidade:** Média (refatoração sistemática)

---

## 📌 Notas Importantes

1. **Não usar Date objects no código do servidor**
   - Sempre usar `Date.now()` para criar timestamps
   - Converter para `Date` apenas para exibição no frontend

2. **Schema Drizzle é a fonte da verdade**
   - Todos os timestamps são `number` (Unix timestamp em ms)
   - Não tentar mudar o schema para `Date`

3. **Testar após cada rodada**
   - Não acumular mudanças sem validação
   - Reverter se algo quebrar

4. **Manter compatibilidade com dados existentes**
   - Banco já tem timestamps como `number`
   - Não quebrar dados existentes

---

**Status:** ✅ Análise completa  
**Próximo passo:** Executar Rodada 1 (refatorar schema)
