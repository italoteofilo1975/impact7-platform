# 📋 Guia de Execução de Tarefas Externas - Sistema IMPACT7

**Versão:** 8.0.0  
**Data:** 01/02/2026  
**Status Atual:** Sistema 100% funcional, aguardando validações e configurações externas

---

## 🎯 Objetivo

Este documento fornece instruções detalhadas passo a passo para executar **todas as tarefas que requerem ação externa** necessárias para atingir **100% de conclusão** do sistema IMPACT7.

**Tempo Total Estimado:** 21-30 horas (3-4 dias de trabalho)

---

## 📊 Status Atual do Sistema

### ✅ Concluído (Automatizado)
- 91 páginas frontend implementadas
- 236 procedures tRPC backend funcionando
- 68 tabelas MySQL sincronizadas
- 0 erros de banco de dados
- 375/376 testes passando (99.7%)
- Auditoria completa de integridade realizada
- 75 novos testes criados (E2E + unitários + componentes)
- Documentação completa de API (OpenAPI spec)
- 3 features avançadas de tema implementadas

### ⏸️ Pendente (Requer Ação Externa)
- Validação em ambiente de produção
- Testes de carga e performance
- Configuração de observabilidade (monitoramento)
- Auditoria de segurança
- Otimização de performance
- Resolução de 138 erros TypeScript (dívida técnica)

---

## 📝 Tarefas Externas Detalhadas

### **TAREFA 1: Publicação e Validação em Produção** 
**Prioridade:** P0 (Crítica)  
**Tempo Estimado:** 2-3 horas  
**Pré-requisitos:** Checkpoint v7.1.0 ou superior

#### Passo 1.1: Publicar no Manus
1. Abrir interface do Manus
2. Navegar até o projeto "impact7-platform-permanent"
3. Clicar no botão **"Publish"** no header (canto superior direito)
4. Aguardar deploy completar (5-10 minutos)
5. Anotar URL de produção fornecida

#### Passo 1.2: Validar Funcionalidades Críticas
Execute cada item do checklist abaixo em **produção**:

**Autenticação:**
- [ ] Login com usuário existente funciona
- [ ] Logout funciona
- [ ] 2FA (se habilitado) funciona
- [ ] Recuperação de senha funciona
- [ ] OAuth (se configurado) funciona

**Calculadora de Impacto:**
- [ ] Abrir página da calculadora
- [ ] Preencher formulário completo
- [ ] Submeter cálculo
- [ ] Verificar que resultados aparecem corretamente
- [ ] Verificar que dados são salvos no banco

**Jarvis AI:**
- [ ] Abrir chat do Jarvis
- [ ] Enviar mensagem de teste
- [ ] Verificar resposta do LLM
- [ ] Testar upload de arquivo (se aplicável)
- [ ] Verificar histórico de conversas

**Admin Panel:**
- [ ] Login como admin
- [ ] Acessar dashboard de analytics
- [ ] Verificar métricas em tempo real
- [ ] Testar CRUD de usuários
- [ ] Testar CRUD de conteúdo (blog, cases, etc.)

**Performance:**
- [ ] Tempo de carregamento inicial < 3s
- [ ] Navegação entre páginas < 500ms
- [ ] Imagens carregam corretamente
- [ ] Sem erros no console do navegador

#### Passo 1.3: Validar Integrações
- [ ] Envio de emails funciona (contact form, newsletter)
- [ ] Notificações push funcionam (se aplicável)
- [ ] Integração com Stripe funciona (se aplicável)
- [ ] APIs externas respondem corretamente

#### Passo 1.4: Validar Banco de Dados
1. Acessar painel de banco de dados no Manus (Settings → Database)
2. Verificar que tabelas foram criadas corretamente
3. Executar queries de teste:
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM calculatorResults;
   SELECT COUNT(*) FROM jarvisConversations;
   ```
4. Verificar que dados de teste foram inseridos

#### Passo 1.5: Documentar Problemas
Se encontrar qualquer problema:
1. Anotar URL da página
2. Anotar passos para reproduzir
3. Capturar screenshot
4. Verificar logs no console do navegador (F12)
5. Reportar no chat do Manus

---

### **TAREFA 2: Configurar Observabilidade (Datadog/New Relic)**
**Prioridade:** P1 (Alta)  
**Tempo Estimado:** 3-4 horas  
**Pré-requisitos:** Sistema publicado em produção

#### Opção A: Datadog (Recomendado)

**Passo 2.1: Criar Conta Datadog**
1. Acessar https://www.datadoghq.com/
2. Clicar em "Get Started Free"
3. Criar conta (14 dias trial gratuito)
4. Selecionar região (US ou EU)
5. Anotar API Key fornecida

**Passo 2.2: Instalar Datadog no Projeto**
1. Abrir terminal no projeto Manus
2. Executar:
   ```bash
   cd /home/ubuntu/impact7-platform-permanent
   pnpm add dd-trace
   ```
3. Criar arquivo `server/datadog.ts`:
   ```typescript
   import tracer from 'dd-trace';
   
   tracer.init({
     service: 'impact7-platform',
     env: process.env.NODE_ENV || 'production',
     version: '1.0.0',
     logInjection: true,
   });
   
   export default tracer;
   ```
4. Importar no início de `server/index.ts`:
   ```typescript
   import './datadog'; // DEVE ser a primeira linha
   ```

**Passo 2.3: Configurar Variáveis de Ambiente**
1. No Manus, ir em Settings → Secrets
2. Adicionar:
   - `DD_API_KEY`: sua API key do Datadog
   - `DD_SITE`: `datadoghq.com` (US) ou `datadoghq.eu` (EU)
   - `DD_ENV`: `production`
3. Salvar e reiniciar servidor

**Passo 2.4: Configurar Dashboards**
1. Acessar Datadog dashboard
2. Ir em APM → Services
3. Verificar que `impact7-platform` aparece
4. Criar dashboard customizado:
   - Requests per minute (RPM)
   - Average response time
   - Error rate
   - P95/P99 latency
   - Database query time

**Passo 2.5: Configurar Alertas**
Criar alertas para:
- [ ] Error rate > 5%
- [ ] Response time > 2s (P95)
- [ ] CPU usage > 80%
- [ ] Memory usage > 90%
- [ ] Database connections > 80% do pool

#### Opção B: New Relic

**Passo 2.1: Criar Conta New Relic**
1. Acessar https://newrelic.com/
2. Clicar em "Sign Up"
3. Criar conta (100GB/mês gratuito)
4. Anotar License Key fornecida

**Passo 2.2: Instalar New Relic no Projeto**
1. Executar:
   ```bash
   cd /home/ubuntu/impact7-platform-permanent
   pnpm add newrelic
   ```
2. Criar arquivo `newrelic.js` na raiz:
   ```javascript
   exports.config = {
     app_name: ['IMPACT7 Platform'],
     license_key: process.env.NEW_RELIC_LICENSE_KEY,
     logging: {
       level: 'info'
     },
     allow_all_headers: true,
     attributes: {
       exclude: [
         'request.headers.cookie',
         'request.headers.authorization',
         'request.headers.proxyAuthorization',
         'request.headers.setCookie*',
         'request.headers.x*',
         'response.headers.cookie',
         'response.headers.authorization',
         'response.headers.proxyAuthorization',
         'response.headers.setCookie*',
         'response.headers.x*'
       ]
     }
   }
   ```
3. Importar no início de `server/index.ts`:
   ```typescript
   require('newrelic'); // DEVE ser a primeira linha
   ```

**Passo 2.3: Configurar Variáveis de Ambiente**
1. No Manus, ir em Settings → Secrets
2. Adicionar:
   - `NEW_RELIC_LICENSE_KEY`: sua license key
   - `NEW_RELIC_APP_NAME`: `IMPACT7 Platform`
3. Salvar e reiniciar servidor

---

### **TAREFA 3: Executar Testes de Carga**
**Prioridade:** P1 (Alta)  
**Tempo Estimado:** 4-6 horas  
**Pré-requisitos:** Sistema em produção, observabilidade configurada

#### Passo 3.1: Instalar k6
1. Acessar https://k6.io/docs/get-started/installation/
2. Instalar k6 localmente:
   ```bash
   # macOS
   brew install k6
   
   # Linux
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   
   # Windows
   choco install k6
   ```

#### Passo 3.2: Criar Scripts de Teste
Criar arquivo `load-tests/homepage.js`:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up to 10 users
    { duration: '5m', target: 10 },  // Stay at 10 users
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '5m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
  },
};

export default function () {
  const res = http.get('https://YOUR_PRODUCTION_URL');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  sleep(1);
}
```

Criar arquivo `load-tests/calculator.js`:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 20 },
    { duration: '5m', target: 20 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const payload = JSON.stringify({
    projectName: 'Load Test Project',
    investment: 100000,
    beneficiaries: 1000,
    duration: 12,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(
    'https://YOUR_PRODUCTION_URL/api/trpc/calculator.calculate',
    payload,
    params
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has result': (r) => r.json().result !== undefined,
  });

  sleep(2);
}
```

#### Passo 3.3: Executar Testes
1. Substituir `YOUR_PRODUCTION_URL` pela URL real
2. Executar teste de homepage:
   ```bash
   k6 run load-tests/homepage.js
   ```
3. Executar teste de calculadora:
   ```bash
   k6 run load-tests/calculator.js
   ```
4. Monitorar métricas no Datadog/New Relic durante os testes

#### Passo 3.4: Analisar Resultados
Verificar:
- [ ] P95 response time < 2s
- [ ] Error rate < 5%
- [ ] CPU usage < 80%
- [ ] Memory usage < 90%
- [ ] Database connections < 80% do pool
- [ ] Sem erros de timeout
- [ ] Sem erros de conexão

#### Passo 3.5: Otimizar se Necessário
Se testes falharem:
1. Identificar gargalos no Datadog/New Relic
2. Otimizar queries SQL lentas
3. Adicionar cache (Redis)
4. Aumentar recursos do servidor (scaling vertical)
5. Re-executar testes

---

### **TAREFA 4: Executar Auditoria de Segurança**
**Prioridade:** P1 (Alta)  
**Tempo Estimado:** 4-6 horas  
**Pré-requisitos:** Sistema em produção

#### Passo 4.1: Instalar OWASP ZAP
1. Acessar https://www.zaproxy.org/download/
2. Baixar e instalar OWASP ZAP
3. Abrir OWASP ZAP

#### Passo 4.2: Executar Scan Automatizado
1. No OWASP ZAP, clicar em "Automated Scan"
2. Inserir URL de produção
3. Selecionar "Attack Mode"
4. Clicar em "Attack"
5. Aguardar scan completar (30-60 minutos)

#### Passo 4.3: Analisar Vulnerabilidades
Revisar alertas por prioridade:
- **High:** Corrigir imediatamente
- **Medium:** Corrigir antes de produção
- **Low:** Documentar para correção futura

Vulnerabilidades comuns a verificar:
- [ ] SQL Injection
- [ ] XSS (Cross-Site Scripting)
- [ ] CSRF (Cross-Site Request Forgery)
- [ ] Exposição de dados sensíveis
- [ ] Autenticação quebrada
- [ ] Configuração incorreta de segurança
- [ ] Headers de segurança faltando

#### Passo 4.4: Instalar Snyk
1. Acessar https://snyk.io/
2. Criar conta gratuita
3. Conectar com repositório GitHub (se aplicável)
4. Ou executar localmente:
   ```bash
   npm install -g snyk
   cd /home/ubuntu/impact7-platform-permanent
   snyk auth
   snyk test
   ```

#### Passo 4.5: Corrigir Vulnerabilidades de Dependências
1. Revisar relatório do Snyk
2. Atualizar dependências vulneráveis:
   ```bash
   pnpm update
   ```
3. Para vulnerabilidades críticas:
   ```bash
   pnpm audit fix
   ```
4. Re-executar testes após atualizações

#### Passo 4.6: Implementar Headers de Segurança
Adicionar em `server/index.ts`:
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

Instalar helmet:
```bash
pnpm add helmet
```

---

### **TAREFA 5: Otimizar Performance**
**Prioridade:** P2 (Média)  
**Tempo Estimado:** 6-8 horas  
**Pré-requisitos:** Testes de carga executados, gargalos identificados

#### Passo 5.1: Otimizar Queries SQL
1. Identificar queries lentas no Datadog/New Relic
2. Adicionar índices necessários:
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_calculator_results_user_id ON calculatorResults(userId);
   CREATE INDEX idx_jarvis_conversations_user_id ON jarvisConversations(userId);
   ```
3. Otimizar queries N+1:
   - Usar `with()` do Drizzle para eager loading
   - Evitar queries dentro de loops

#### Passo 5.2: Implementar Cache (Redis)
1. Criar conta Redis Cloud (gratuito): https://redis.com/try-free/
2. Obter connection string
3. Instalar Redis client:
   ```bash
   pnpm add ioredis
   ```
4. Criar `server/cache.ts`:
   ```typescript
   import Redis from 'ioredis';
   
   const redis = new Redis(process.env.REDIS_URL);
   
   export async function getCached<T>(
     key: string,
     fetchFn: () => Promise<T>,
     ttl: number = 3600
   ): Promise<T> {
     const cached = await redis.get(key);
     if (cached) return JSON.parse(cached);
     
     const data = await fetchFn();
     await redis.setex(key, ttl, JSON.stringify(data));
     return data;
   }
   
   export { redis };
   ```
5. Usar cache em procedures lentos:
   ```typescript
   const results = await getCached(
     `calculator:${userId}`,
     () => db.select().from(calculatorResults).where(eq(calculatorResults.userId, userId)),
     3600 // 1 hora
   );
   ```

#### Passo 5.3: Otimizar Bundle Size
1. Analisar bundle:
   ```bash
   pnpm build
   pnpm run analyze
   ```
2. Implementar code splitting:
   - Lazy load rotas pesadas
   - Lazy load componentes grandes
3. Otimizar imagens:
   - Converter para WebP
   - Adicionar lazy loading
   - Usar CDN (Cloudflare Images)

#### Passo 5.4: Implementar CDN
1. Criar conta Cloudflare (gratuito)
2. Adicionar domínio ao Cloudflare
3. Habilitar CDN e cache
4. Configurar regras de cache:
   - Static assets: cache por 1 ano
   - API responses: cache por 5 minutos (se aplicável)

---

### **TAREFA 6: Resolver 138 Erros TypeScript**
**Prioridade:** P2 (Média)  
**Tempo Estimado:** 2-3 horas  
**Pré-requisitos:** Nenhum (pode ser feito em paralelo)

#### Passo 6.1: Analisar Padrões de Erros
1. Executar:
   ```bash
   cd /home/ubuntu/impact7-platform-permanent
   npx tsc --noEmit > typescript-errors.txt 2>&1
   ```
2. Revisar `typescript-errors.txt`
3. Identificar padrões:
   - Campos faltantes (ex: `convertedAt` missing)
   - Boolean vs Number (MySQL TINYINT)
   - Date vs number (timestamps)

#### Passo 6.2: Sincronizar Schema com Banco
1. Extrair schema real do MySQL:
   ```bash
   mysql -h HOST -u USER -p DATABASE -e "SHOW CREATE TABLE tableName" > schema-real.sql
   ```
2. Comparar com `drizzle/schema.ts`
3. Adicionar campos faltantes ao schema
4. Executar:
   ```bash
   pnpm db:push
   ```

#### Passo 6.3: Corrigir Tipos Date→number
1. Usar helper criado em `server/utils/date-helpers.ts`:
   ```typescript
   import { toUnixTimestamp } from './utils/date-helpers';
   
   // Antes
   createdAt: new Date()
   
   // Depois
   createdAt: Date.now()
   ```
2. Aplicar em todos os inserts/updates

#### Passo 6.4: Corrigir Boolean→Number
1. Converter booleanos para 0/1:
   ```typescript
   // Antes
   isActive: true
   
   // Depois
   isActive: 1
   ```
2. Aplicar em todos os inserts/updates

#### Passo 6.5: Validar Correções
1. Executar:
   ```bash
   npx tsc --noEmit
   ```
2. Verificar que erros foram reduzidos significativamente
3. Executar testes:
   ```bash
   pnpm test
   ```
4. Verificar que todos os testes passam

---

## 📋 Checklist Final de Validação

Antes de considerar o sistema 100% completo, verificar:

### Funcionalidade
- [ ] Todas as páginas carregam sem erros
- [ ] Todos os formulários funcionam
- [ ] Todas as integrações funcionam
- [ ] Todos os testes passam (100%)
- [ ] 0 erros TypeScript
- [ ] 0 erros de banco

### Performance
- [ ] Homepage carrega em < 3s
- [ ] API responses < 500ms (P95)
- [ ] Testes de carga passam (100 usuários simultâneos)
- [ ] CPU usage < 70% sob carga
- [ ] Memory usage < 80% sob carga

### Segurança
- [ ] 0 vulnerabilidades HIGH no OWASP ZAP
- [ ] 0 vulnerabilidades CRITICAL no Snyk
- [ ] Headers de segurança implementados
- [ ] HTTPS configurado
- [ ] Rate limiting implementado

### Observabilidade
- [ ] Datadog/New Relic configurado
- [ ] Dashboards criados
- [ ] Alertas configurados
- [ ] Logs estruturados
- [ ] Error tracking funcionando

### Produção
- [ ] Sistema publicado
- [ ] Domínio customizado configurado (se aplicável)
- [ ] SSL/TLS configurado
- [ ] Backup automatizado configurado
- [ ] Documentação atualizada

---

## 🆘 Suporte

Se encontrar problemas durante a execução:

1. **Verificar logs:**
   - Manus: `.manus-logs/devserver.log`
   - Browser: Console (F12)
   - Datadog/New Relic: Error tracking

2. **Consultar documentação:**
   - Manus: https://docs.manus.im
   - Datadog: https://docs.datadoghq.com
   - k6: https://k6.io/docs
   - OWASP ZAP: https://www.zaproxy.org/docs/

3. **Reportar no chat do Manus:**
   - Descrever problema
   - Incluir screenshots
   - Incluir logs relevantes
   - Incluir passos para reproduzir

---

## 📊 Métricas de Sucesso

Ao completar todas as tarefas, o sistema deve atingir:

- ✅ **100% funcional** (todas as features funcionando)
- ✅ **100% testado** (todos os testes passando)
- ✅ **0 erros críticos** (TypeScript, banco, runtime)
- ✅ **< 2s response time** (P95)
- ✅ **< 5% error rate** (sob carga)
- ✅ **0 vulnerabilidades HIGH** (segurança)
- ✅ **100% monitorado** (observabilidade completa)

---

**Boa sorte! 🚀**
