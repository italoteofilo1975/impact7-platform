# Tarefas que Requerem Ação Externa

Este documento lista todas as tarefas identificadas durante a auditoria de integridade que **não podem ser executadas automaticamente** pois dependem de ação externa, acesso a ferramentas/plataformas externas, ou intervenção humana.

---

## 1. H.1: Validação em Ambiente de Produção (P0 - Crítica)

**Descrição:** Validar sistema completo em ambiente de produção real antes do lançamento público.

**Requisitos:**
- Acesso a ambiente de produção (URL de produção)
- Credenciais de admin em produção
- Lista de fluxos críticos para testar

**Tarefas:**
1. Publicar sistema no Manus (botão "Publish" no UI)
2. Testar fluxos críticos em produção:
   - Login/logout
   - Calculadora IMPACT7
   - Jarvis (chat IA)
   - Submissão de cases
   - Download de whitepapers
   - Inscrição em newsletter
3. Validar performance (tempo de resposta < 1s)
4. Validar SSL/HTTPS
5. Validar domínio customizado (se configurado)

**Estimativa:** 2-3 horas  
**Prioridade:** P0 (Crítica)

---

## 2. H.3: Testes de Carga e Performance (P1 - Alta)

**Descrição:** Executar testes de carga para identificar limites de capacidade e gargalos de performance.

**Requisitos:**
- Ferramenta k6 instalada
- Ambiente de staging/produção
- Scripts de teste de carga

**Tarefas:**
1. Instalar k6: `brew install k6` (Mac) ou `sudo apt install k6` (Linux)
2. Criar scripts de teste para endpoints críticos:
   - `/api/trpc/calculator.calculate` (100 req/s)
   - `/api/trpc/jarvis.chat` (50 req/s)
   - `/api/trpc/auth.loginLocal` (20 req/s)
3. Executar testes de carga:
   ```bash
   k6 run --vus 100 --duration 30s load-test.js
   ```
4. Analisar resultados:
   - Tempo de resposta p95 < 500ms
   - Taxa de erro < 1%
   - Throughput > 1000 req/s
5. Identificar gargalos (banco de dados, CPU, memória)

**Estimativa:** 4-6 horas  
**Prioridade:** P1 (Alta)

---

## 3. H.4: Observabilidade em Produção (P1 - Alta)

**Descrição:** Configurar monitoramento e observabilidade para produção usando Datadog ou New Relic.

**Requisitos:**
- Conta Datadog ou New Relic
- API key da plataforma
- Acesso ao ambiente de produção

**Tarefas:**
1. Criar conta em Datadog (https://www.datadoghq.com/) ou New Relic (https://newrelic.com/)
2. Obter API key
3. Instalar agente no servidor:
   ```bash
   npm install dd-trace --save  # Datadog
   # ou
   npm install newrelic --save  # New Relic
   ```
4. Configurar variáveis de ambiente:
   ```
   DD_API_KEY=<sua_api_key>
   DD_SERVICE=impact7-platform
   DD_ENV=production
   ```
5. Adicionar instrumentação no código:
   ```typescript
   import tracer from 'dd-trace';
   tracer.init();
   ```
6. Configurar dashboards:
   - Tempo de resposta por endpoint
   - Taxa de erro
   - Uso de CPU/memória
   - Queries de banco mais lentas
7. Configurar alertas:
   - Erro rate > 1%
   - Tempo de resposta p95 > 1s
   - CPU > 80%

**Estimativa:** 3-4 horas  
**Prioridade:** P1 (Alta)

---

## 4. H.7: Auditoria de Segurança (P1 - Alta)

**Descrição:** Executar auditoria de segurança completa usando ferramentas automatizadas.

**Requisitos:**
- OWASP ZAP instalado
- Snyk CLI instalado
- Acesso ao ambiente de staging/produção

**Tarefas:**
1. Instalar ferramentas:
   ```bash
   # OWASP ZAP
   brew install --cask owasp-zap  # Mac
   
   # Snyk
   npm install -g snyk
   snyk auth
   ```

2. Executar scan de vulnerabilidades de dependências:
   ```bash
   cd /home/ubuntu/impact7-platform-permanent
   snyk test
   ```

3. Executar scan de segurança web com OWASP ZAP:
   - Abrir OWASP ZAP
   - Configurar URL alvo (produção ou staging)
   - Executar "Automated Scan"
   - Analisar relatório de vulnerabilidades

4. Verificar checklist de segurança:
   - [ ] HTTPS habilitado
   - [ ] Headers de segurança configurados (CSP, HSTS, X-Frame-Options)
   - [ ] Rate limiting em endpoints públicos
   - [ ] Validação de input em todos os endpoints
   - [ ] Sanitização de SQL (usando Drizzle ORM)
   - [ ] Proteção contra CSRF
   - [ ] Proteção contra XSS
   - [ ] Senhas hasheadas com bcrypt
   - [ ] JWT com expiração configurada
   - [ ] 2FA disponível

5. Corrigir vulnerabilidades identificadas

**Estimativa:** 4-6 horas  
**Prioridade:** P1 (Alta)

---

## 5. H.10: Otimização de Performance (P2 - Média)

**Descrição:** Otimizar performance baseado em resultados de testes de carga.

**Requisitos:**
- Testes de carga executados (H.3)
- Observabilidade configurada (H.4)
- Acesso ao código e banco de dados

**Tarefas:**
1. Analisar queries lentas identificadas em H.4:
   ```sql
   -- Exemplo: adicionar índices
   CREATE INDEX idx_leads_created ON leads(createdAt);
   CREATE INDEX idx_calculations_user ON calculations(userId);
   ```

2. Implementar caching para queries frequentes:
   ```typescript
   import { cache } from './services/cache/cache-service';
   
   // Cache por 5 minutos
   const cachedData = await cache.get('key', async () => {
     return await db.select().from(table);
   }, 300);
   ```

3. Otimizar bundle size do frontend:
   ```bash
   # Analisar bundle
   pnpm build
   pnpm analyze
   
   # Implementar code splitting
   const Component = lazy(() => import('./Component'));
   ```

4. Implementar CDN para assets estáticos

5. Configurar compressão gzip/brotli

6. Re-executar testes de carga para validar melhorias

**Estimativa:** 6-8 horas  
**Prioridade:** P2 (Média)

---

## 6. Resolver 136 Erros TypeScript (P2 - Média)

**Descrição:** Resolver erros TypeScript não-bloqueantes (Date vs number).

**Requisitos:**
- Acesso ao código
- Conhecimento de TypeScript

**Tarefas:**
1. Criar helper para conversão Date→number:
   ```typescript
   // server/utils/date-helpers.ts
   export const toUnixTimestamp = (date: Date | number): number => {
     return date instanceof Date ? date.getTime() : date;
   };
   ```

2. Aplicar correções em batch usando regex:
   ```bash
   # Substituir Date.now() por Date.now() (já retorna number)
   # Substituir new Date() por Date.now() em inserts/updates
   ```

3. Validar com tsc:
   ```bash
   npx tsc --noEmit
   ```

**Estimativa:** 2-3 horas  
**Prioridade:** P2 (Média)

---

## Resumo de Estimativas

| Tarefa | Prioridade | Estimativa | Requer Acesso Externo |
|--------|-----------|------------|----------------------|
| H.1: Validação em produção | P0 | 2-3h | ✅ Sim (ambiente produção) |
| H.3: Testes de carga | P1 | 4-6h | ✅ Sim (k6 + staging) |
| H.4: Observabilidade | P1 | 3-4h | ✅ Sim (Datadog/New Relic) |
| H.7: Auditoria de segurança | P1 | 4-6h | ✅ Sim (OWASP ZAP, Snyk) |
| H.10: Otimização de performance | P2 | 6-8h | ⚠️ Depende de H.3 e H.4 |
| Erros TypeScript | P2 | 2-3h | ❌ Não (pode ser feito agora) |

**Total Estimado:** 21-30 horas (3-4 dias de trabalho)

---

## Próximos Passos Recomendados

1. **Imediato (P0):** Publicar sistema e executar validação em produção (H.1)
2. **Semana 1 (P1):** Configurar observabilidade (H.4) e executar testes de carga (H.3)
3. **Semana 2 (P1):** Executar auditoria de segurança (H.7) e corrigir vulnerabilidades
4. **Semana 3 (P2):** Otimizar performance baseado em dados reais (H.10)
5. **Semana 4 (P2):** Resolver erros TypeScript para atingir 100% de type safety

---

**Última Atualização:** 31 de Janeiro de 2026  
**Versão:** v7.0.0
