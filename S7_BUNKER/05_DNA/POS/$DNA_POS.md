# $DNA_POS — Padrões de Excelência Permanentes do Sistema IMPACT7
> **Versão:** 1.0.0 | **Data:** 2026-02-27 | **Status:** ATIVO | **Custódio:** Italo Teofilo
> **Classificação SET7:** CONFIDENCIAL — Documento Constitucional do Sistema
> **Complementa:** `S7_BUNKER/05_DNA/NEG/$DNA_NEG.md` (15 regras do que NUNCA fazer)

---

## PREÂMBULO

Este documento é o **espelho positivo do $DNA_NEG**. Enquanto o $DNA_NEG define o que o sistema NUNCA deve fazer, o $DNA_POS define o que o sistema SEMPRE deve fazer — os 15 padrões de excelência que distinguem o IMPACT7 de sistemas mediocres. Cada padrão foi derivado de decisões que funcionaram bem e de princípios que queremos perpetuar em toda evolução futura.

---

## P01 — TYPE SAFETY END-TO-END

**Padrão:** Todo contrato entre frontend e backend DEVE ser definido via tRPC com validação Zod, garantindo que erros de tipo sejam detectados em tempo de compilação, não em produção.

**Evidência de Excelência:** 236 procedures tRPC com tipos inferidos automaticamente, eliminando a necessidade de arquivos de contrato manuais e reduzindo bugs de integração a zero.

**Implementação:**
```typescript
// ✅ SEMPRE: Schema Zod no input, tipo inferido no output
const procedure = publicProcedure
  .input(z.object({ email: z.string().email(), name: z.string().min(2) }))
  .mutation(async ({ input }) => {
    // input.email e input.name são type-safe aqui
  });
```

---

## P02 — TIMESTAMPS COMO UNIX MILLISECONDS

**Padrão:** Todos os timestamps DEVEM ser armazenados e transmitidos como `number` (Unix milliseconds), nunca como `Date` objects ou strings ISO.

**Justificativa:** MySQL armazena como `bigint(20)`, Drizzle mapeia como `number`, e o frontend converte para exibição com `new Date(ts).toLocaleString()`. Esta consistência elimina bugs de fuso horário e serialização.

**Implementação:**
```typescript
// ✅ SEMPRE: Date.now() para timestamps
const now = Date.now(); // number, não new Date()
await db.insert(table).values({ createdAt: now, updatedAt: now });
```

---

## P03 — TRATAMENTO DE ERROS COM CONTEXTO

**Padrão:** Todo bloco `catch` DEVE logar o contexto completo (procedure, input sanitizado, erro) e retornar uma `TRPCError` com código apropriado — nunca silenciar erros ou retornar `null` sem log.

**Implementação:**
```typescript
// ✅ SEMPRE: Log com contexto + TRPCError tipado
try {
  return await db.query(...);
} catch (error) {
  console.error('[BC-02][calculator.calculate] Error:', {
    input: { effort: input.effort }, // nunca logar dados sensíveis
    error: error instanceof Error ? error.message : String(error)
  });
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao calcular impacto' });
}
```

---

## P04 — AUTENTICAÇÃO VERIFICADA NO SERVIDOR

**Padrão:** Toda operação que modifica dados ou acessa dados privados DEVE usar `protectedProcedure`. Verificações de autorização (role, ownership) DEVEM ocorrer no servidor, nunca apenas no frontend.

**Implementação:**
```typescript
// ✅ SEMPRE: Verificação de role no servidor
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a administradores' });
  }
  return next({ ctx });
});
```

---

## P05 — INPUTS SANITIZADOS COM ZOD

**Padrão:** Todo input de usuário DEVE ser validado com Zod antes de qualquer operação de banco de dados. Queries SQL raw DEVEM usar parâmetros preparados, nunca interpolação de strings.

**Implementação:**
```typescript
// ✅ SEMPRE: Parâmetros preparados em queries raw
const result = await executeRawQuery(
  'SELECT * FROM leads WHERE email = ? AND isActive = 1',
  [input.email] // nunca: `WHERE email = '${input.email}'`
);
```

---

## P06 — FEEDBACK IMEDIATO AO USUÁRIO

**Padrão:** Toda operação assíncrona DEVE ter estado de loading visível. Toda operação concluída DEVE ter feedback de sucesso ou erro. Formulários DEVEM ser desabilitados durante submissão para evitar duplo envio.

**Implementação:**
```typescript
// ✅ SEMPRE: Loading state + toast de feedback
const mutation = trpc.leads.create.useMutation({
  onSuccess: () => toast.success('Lead cadastrado com sucesso!'),
  onError: (err) => toast.error(`Erro: ${err.message}`),
});
<Button disabled={mutation.isPending}>
  {mutation.isPending ? <Spinner /> : 'Enviar'}
</Button>
```

---

## P07 — TESTES ANTES DE QUALQUER DEPLOY

**Padrão:** Nenhum código DEVE ser deployado sem pelo menos 1 teste unitário cobrindo o caminho feliz e 1 cobrindo o caminho de erro. A suite de testes DEVE passar a ≥99% antes de qualquer checkpoint de produção.

**Meta Atual:** 375/376 testes passando (99.7%) — mantida em todos os checkpoints.

---

## P08 — ARQUIVOS BINÁRIOS NO S3, NUNCA NO BANCO

**Padrão:** Arquivos com >10KB DEVEM ser armazenados no S3 via `storagePut()`. O banco de dados armazena apenas metadados (URL, key, mime type, tamanho). Esta regra se aplica a imagens, PDFs, vídeos e qualquer outro binário.

**Implementação:**
```typescript
// ✅ SEMPRE: S3 para binários, DB para metadados
const { url, key } = await storagePut(`uploads/${userId}/${filename}`, buffer, mimeType);
await db.insert(files).values({ userId, url, fileKey: key, mimeType, size });
```

---

## P09 — ACESSIBILIDADE WCAG AAA EM COMPONENTES CRÍTICOS

**Padrão:** Todos os componentes de interação crítica (formulários, botões de CTA, navegação principal) DEVEM ter: `aria-label` descritivo, foco visível com `ring`, contraste mínimo 7:1 (WCAG AAA), e operabilidade por teclado.

**Componentes Críticos:** Calculadora S-ROI, formulário de lead, botão de download, navegação principal, Jarvis chat.

---

## P10 — MULTI-IDIOMA DESDE O INÍCIO

**Padrão:** Todo texto visível ao usuário DEVE usar `t('chave')` do i18next, nunca strings hardcoded em PT/EN/ES. Novas features DEVEM incluir traduções nos 3 idiomas antes de serem consideradas completas.

**Implementação:**
```typescript
// ✅ SEMPRE: i18n para textos visíveis
const { t } = useTranslation();
return <h1>{t('hero.title')}</h1>; // nunca: <h1>Transforme seu Impacto Social</h1>
```

---

## P11 — SCHEMA DRIZZLE COMO FONTE DE VERDADE

**Padrão:** O schema em `drizzle/schema.ts` DEVE ser a fonte de verdade para a estrutura do banco. Toda alteração de schema DEVE passar por `pnpm db:push` e ser documentada. Nunca executar `ALTER TABLE` manual sem atualizar o schema Drizzle.

**Processo:**
1. Editar `drizzle/schema.ts`
2. Executar `pnpm db:push`
3. Verificar com `DESCRIBE tabela` no banco
4. Registrar no TASKLOG.jsonl

---

## P12 — CHAMADAS LLM APENAS NO SERVIDOR

**Padrão:** Toda chamada ao `invokeLLM()` DEVE ocorrer em procedures tRPC no servidor. O frontend NUNCA deve ter acesso direto à API LLM. Toda chamada LLM DEVE ter timeout de 30s e fallback gracioso.

**Implementação:**
```typescript
// ✅ SEMPRE: LLM no servidor com timeout e fallback
const response = await Promise.race([
  invokeLLM({ messages }),
  new Promise((_, reject) => setTimeout(() => reject(new Error('LLM timeout')), 30000))
]).catch(() => ({ choices: [{ message: { content: 'Serviço temporariamente indisponível.' } }] }));
```

---

## P13 — PAGINAÇÃO EM TODAS AS LISTAS

**Padrão:** Toda query que retorna múltiplos registros DEVE ter paginação com `limit` e `offset` (ou cursor). O limite padrão DEVE ser ≤50 registros. Queries sem paginação são proibidas em tabelas com >100 registros esperados.

**Implementação:**
```typescript
// ✅ SEMPRE: Paginação explícita
.input(z.object({ page: z.number().default(1), limit: z.number().max(50).default(20) }))
.query(async ({ input }) => {
  const offset = (input.page - 1) * input.limit;
  return db.select().from(table).limit(input.limit).offset(offset);
});
```

---

## P14 — NOTIFICAÇÕES PARA O OWNER EM EVENTOS CRÍTICOS

**Padrão:** Eventos de negócio críticos (novo lead, novo download, novo case submetido, erro crítico em produção) DEVEM disparar `notifyOwner()` para manter o owner informado em tempo real sem precisar verificar o dashboard.

**Eventos Obrigatórios:** `leads.create`, `whitepaper.download`, `cases.submit`, erros com código `INTERNAL_SERVER_ERROR` em produção.

---

## P15 — DOCUMENTAÇÃO VIVA NO S7_BUNKER

**Padrão:** Toda decisão arquitetural significativa DEVE ser registrada no TASKLOG.jsonl com `trace_id` único. Toda feature nova DEVE ter seu Bounded Context e ITUs documentados no ARCH_MANIFEST.md. O S7_BUNKER é a memória institucional do sistema e DEVE ser mantido atualizado.

**Frequência:** A cada sprint (2 semanas) ou a cada 3 CHUs executados, o TASKLOG.jsonl DEVE ter pelo menos 1 entrada de `SESSION_SUMMARY`.

---

## SUMÁRIO DOS 15 PADRÕES

| # | Padrão | Categoria | Prioridade |
|---|---|---|---|
| P01 | Type Safety End-to-End (tRPC + Zod) | Qualidade | P0 |
| P02 | Timestamps como Unix Milliseconds | Dados | P0 |
| P03 | Tratamento de Erros com Contexto | Qualidade | P0 |
| P04 | Autenticação Verificada no Servidor | Segurança | P0 |
| P05 | Inputs Sanitizados com Zod | Segurança | P0 |
| P06 | Feedback Imediato ao Usuário | UX | P1 |
| P07 | Testes Antes de Qualquer Deploy | Qualidade | P0 |
| P08 | Arquivos Binários no S3 | Performance | P1 |
| P09 | Acessibilidade WCAG AAA | Inclusão | P1 |
| P10 | Multi-idioma Desde o Início | Produto | P1 |
| P11 | Schema Drizzle como Fonte de Verdade | Dados | P0 |
| P12 | Chamadas LLM Apenas no Servidor | Segurança | P0 |
| P13 | Paginação em Todas as Listas | Performance | P1 |
| P14 | Notificações para o Owner | Operações | P2 |
| P15 | Documentação Viva no S7_BUNKER | Governança | P1 |

---

*Documento criado em 2026-02-27 | Próxima revisão: 2026-05-27 | Custódio: Italo Teofilo*
