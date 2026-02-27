# $DNA_NEG — Patrimônio de Erros IMPACT7
## Sistema: IMPACT7 | Versão: 1.0 | Data: 2026-02-27
## Regra Mestra: Erros são ativos. Cada falha gera uma regra NUNCA/SEMPRE permanente.

> ⚠️ **Este arquivo é IMUTÁVEL após consagração.** Apenas adicionar novas entradas. Nunca remover.

---

## Tabela de Erros → Regras Permanentes

| ID | Descrição do Erro | Impacto | Regra Permanente | Verificável em 10s | Aplicável a |
|----|-------------------|---------|------------------|-------------------|-------------|
| DNE-001 | Coluna `organization` adicionada ao schema Drizzle mas não existia no banco MySQL | Erro runtime "Unknown column 'organization'" em produção quebrando formulários de leads | **NUNCA:** Adicionar coluna ao schema sem executar `pnpm db:push` e verificar no banco. **SEMPRE:** Após editar schema.ts, rodar `webdev_execute_sql "SHOW COLUMNS FROM tabela"` para confirmar | `SHOW COLUMNS FROM leads` | drizzle/schema.ts, server/routers.ts |
| DNE-002 | Coluna `sector` faltando nas tabelas `caseStudies` e `testimonials` | Erro runtime "Unknown column 'sector'" quebrando página de cases e depoimentos | **NUNCA:** Criar tabela no banco sem definir TODAS as colunas no schema Drizzle. **SEMPRE:** Usar `webdev_execute_sql "SHOW COLUMNS FROM tabela"` antes de escrever queries | `SHOW COLUMNS FROM caseStudies` | drizzle/schema.ts |
| DNE-003 | Tabela `caseStudies` não estava no schema Drizzle mas existia no banco | TypeScript sem tipos para a tabela, queries SQL raw sem type safety, erros em runtime | **NUNCA:** Criar tabela diretamente no banco sem adicionar ao schema Drizzle. **SEMPRE:** Schema Drizzle é a fonte da verdade | `grep "caseStudies" drizzle/schema.ts` | drizzle/schema.ts |
| DNE-004 | Definição duplicada de tabela `testimonials` adicionada ao schema | Erro de compilação esbuild "Identifier 'testimonials' has already been declared", servidor não inicia | **NUNCA:** Adicionar tabela ao schema sem verificar se já existe. **SEMPRE:** `grep -n "mysqlTable" drizzle/schema.ts \| grep "testimonials"` antes de adicionar | `grep -c "testimonials" drizzle/schema.ts` | drizzle/schema.ts |
| DNE-005 | 138 erros TypeScript de incompatibilidade Date vs number em timestamps | Avisos de compilação mascarando erros reais. Risco de bugs em produção com datas incorretas | **NUNCA:** Usar `new Date()` em campos de timestamp do Drizzle (MySQL usa Unix epoch int). **SEMPRE:** Usar `Date.now()` para timestamps atuais, `Math.floor(date.getTime())` para conversão | `npx tsc --noEmit 2>&1 \| grep "Date" \| wc -l` | server/routers.ts, server/db.ts |
| DNE-006 | Arquivo `extended-e2e-flows.test.ts` criado com 23 endpoints que não existem | 23 testes falhando, confundindo métricas de qualidade (94% → 99.7% após remoção) | **NUNCA:** Criar testes para endpoints que ainda não existem sem marcar como `test.skip` ou `test.todo`. **SEMPRE:** Verificar se endpoint existe antes de testar | `grep -r "test.skip\|test.todo" server/` | server/integration/ |
| DNE-007 | `pnpm db:push` trava aguardando confirmação interativa em ambiente automatizado | Processo bloqueado indefinidamente, requerendo kill manual, perdendo tempo | **NUNCA:** Executar `pnpm db:push` em scripts automatizados sem flag `--force`. **SEMPRE:** Usar `webdev_execute_sql` para alterações pontuais de schema | `echo "y" \| pnpm db:push` ou `pnpm db:push --force` | scripts/, CI/CD |
| DNE-008 | Coluna `logoUrl` no schema Drizzle mas banco MySQL armazena como `logo` | Erro runtime "Unknown column 'logourl'" na tabela partners quebrando página de parceiros | **NUNCA:** Assumir que MySQL preserva camelCase. **SEMPRE:** Verificar nome real da coluna no banco antes de queries SQL raw | `SHOW COLUMNS FROM partners` | drizzle/schema.ts, server/routers.ts |
| DNE-009 | Query SQL raw usando `metricKey` e `labelKey` que não existem na tabela `socialProofMetrics` | Erro runtime "Unknown column 'labelKey'" quebrando página de métricas sociais | **NUNCA:** Escrever queries SQL raw sem verificar estrutura real da tabela. **SEMPRE:** Usar Drizzle ORM para queries type-safe | `SHOW COLUMNS FROM socialProofMetrics` | server/routers.ts |
| DNE-010 | 19 arquivos .md de relatório acumulados na raiz do projeto sem taxonomia | Entropia máxima. Impossível encontrar artefatos relevantes. Confusão sobre qual é o relatório atual | **NUNCA:** Criar arquivo de relatório/documentação na raiz sem classificar no S7_BUNKER. **SEMPRE:** Usar estrutura 01_REF → 06_GOL | `ls *.md \| wc -l` (deve ser ≤2: README.md e todo.md) | raiz do projeto |
| DNE-011 | Coluna `sroi` faltando na tabela `caseStudies` após adicionar `organization` e `sector` | Erro runtime "Unknown column 'sroi'" quebrando queries de cases | **NUNCA:** Adicionar colunas ao banco uma por uma de forma reativa. **SEMPRE:** Verificar TODAS as colunas da query antes de executar | `SHOW COLUMNS FROM caseStudies` | drizzle/schema.ts |
| DNE-012 | Coluna `beneficiaries` faltando na tabela `caseStudies` | Erro runtime "Unknown column 'beneficiaries'" quebrando queries de cases | **NUNCA:** Assumir que tabela criada manualmente no banco tem todas as colunas do schema. **SEMPRE:** Comparar schema Drizzle com `SHOW COLUMNS` antes de qualquer query | `SHOW COLUMNS FROM caseStudies` | drizzle/schema.ts |
| DNE-013 | Coluna `description` faltando na tabela `caseStudies` | Erro runtime "Unknown column 'description'" quebrando queries de cases | **NUNCA:** Criar tabela no banco sem adicionar ao schema Drizzle com TODAS as colunas. **SEMPRE:** Schema Drizzle → banco, nunca banco → schema | `SHOW COLUMNS FROM caseStudies` | drizzle/schema.ts |
| DNE-014 | Sem CI/CD pipeline (.github/ ausente) | Deploy manual propenso a erros. Sem gate de qualidade automático. Regressões não detectadas | **NUNCA:** Fazer deploy sem passar em todos os testes automatizados. **SEMPRE:** Criar .github/workflows/ci.yml antes do primeiro deploy em produção | `ls .github/workflows/` | raiz do projeto |
| DNE-015 | Sem git tags assinadas no repositório | Sem ancoragem criptográfica de versões. Impossível verificar integridade de releases | **NUNCA:** Fazer release de produção sem git tag assinada com GPG. **SEMPRE:** `git tag -s v1.0.0 -m "Release v1.0.0"` antes de deploy | `git tag -l` | git |

---

## Padrões de Anti-Fragilidade Derivados

### Padrão 1: Schema-First (derivado de DNE-001 a DNE-013)
```
1. Editar drizzle/schema.ts
2. Executar `pnpm db:push` (ou ALTER TABLE via webdev_execute_sql)
3. Verificar com `SHOW COLUMNS FROM tabela`
4. Escrever query/procedure
5. Testar com `pnpm test`
```

### Padrão 2: Verificação Proativa de Colunas (derivado de DNE-008, DNE-009)
```bash
# Antes de qualquer query SQL raw, executar:
SHOW COLUMNS FROM nome_da_tabela;
# E comparar com as colunas usadas na query
```

### Padrão 3: Taxonomia de Artefatos (derivado de DNE-010)
```
Relatório de progresso → S7_BUNKER/04_OUT/
Guia operacional → S7_BUNKER/02_INT/
Documentação de referência → S7_BUNKER/01_REF/
Análise de erros → S7_BUNKER/05_DNA/NEG/
Versão consagrada → S7_BUNKER/06_GOL/
```

---

*Última atualização: 2026-02-27 | Próxima revisão: Após cada sprint*
