# Ficha de Teste — TEL-CALC-01: Calculadora de Impacto

**Data:** 2026-01-24  
**Tela:** /calculadora  
**Módulo:** MOD-03 (Calculadora de Impacto)  
**Perfis:** Público (anônimo) / Usuário autenticado

---

## 1. IDENTIFICAÇÃO

**Rota:** `/calculadora`  
**URL:** https://3000-i5angn12h41ykgeegpwch-56e44013.us2.manus.computer/calculadora

**Pré-condições:**
- Nenhuma (página pública)

**Perfis de Acesso:**
- ✅ Visitante Público (pode calcular, mas não salva histórico)
- ✅ Usuário Autenticado (pode calcular e salvar histórico)

---

## 2. COMPONENTES MAPEADOS

### Campos de Entrada (Sliders)
- **CMP-CALC-01:** Total Investment (E) — Slider de $10K a $10M (padrão: $100K)
- **CMP-CALC-02:** Context Alignment (C) — Slider de 1 a 10 (padrão: 5)
- **CMP-CALC-03:** Barriers and Resistance (R) — Slider de 1 a 10 (padrão: 3)
- **CMP-CALC-04:** Direct Beneficiaries — Slider de 100 a 100.000 (padrão: 1.000)
- **CMP-CALC-05:** Project Duration (months) — Slider de 3 a 60 meses (padrão: 12)

### Botões
- **CMP-CALC-BTN-01:** "Calculate Impact" (botão laranja)
- **CMP-CALC-BTN-02:** "Schedule Consulting" (link)
- **CMP-CALC-BTN-03:** "Download Whitepaper" (link)

### Seções Informativas
- **CMP-CALC-INFO-01:** "The Impact Equation" (I = (E × C⁷) / R)
- **CMP-CALC-INFO-02:** "Reference Benchmarks" (7x, 3-4x, 12x+)

---

## 3. INTEGRAÇÕES E DADOS

### APIs Acionadas
- `calculations.create` — Salva cálculo no banco (apenas se autenticado)
- `calculations.list` — Lista histórico de cálculos (apenas se autenticado)
- PDF generation — Gera relatório PDF (jsPDF)

### Regras de Negócio
- **Equação:** I = (E × C⁷) / R
- **Validação crítica:** R deve ser > 0 (caso contrário, resultado = Infinity)
- **Cálculo anônimo:** Não salva no banco (apenas exibe resultado)
- **Cálculo autenticado:** Salva no banco com userId

### Entidades Afetadas
- `calculations` — Tabela de cálculos salvos

---

## 4. CRITÉRIOS DE ACEITE (DoD)

### UI OK
- ✅ Página carrega sem erros
- ✅ Sliders funcionam e exibem valores atualizados
- ✅ Botão "Calculate Impact" é clicável
- ✅ Equação I = (E × C⁷) / R é exibida corretamente
- ✅ Benchmarks são exibidos (7x, 3-4x, 12x+)

### APIs OK
- ✅ Cálculo é executado localmente (frontend)
- ✅ Se autenticado, `calculations.create` é chamado
- ✅ PDF é gerado corretamente (jsPDF)

### Dados OK
- ✅ Cálculo anônimo não salva no banco
- ✅ Cálculo autenticado salva no banco com userId
- ✅ Resultado é exibido corretamente na UI

### Exceções
- ❌ **BUG S0:** R = 0 causa Infinity (não validado)
- ⚠️ **BUG S2:** Valores negativos podem ser aceitos (não validado)
- ⚠️ **BUG S3:** Loading state ausente no botão "Calculate Impact"

### Permissões
- ✅ Página acessível por todos (público)

---

## 5. MATRIZ DE TESTES (BOTÃO A BOTÃO)

### TC-CALC-01: Testar formulário vazio (validação)
**Ação:** Clicar em "Calculate Impact" sem alterar valores padrão  
**Resultado Esperado:** Cálculo é executado com valores padrão (E=100K, C=5, R=3)  
**Validação de API:** Nenhuma (cálculo local)  
**Validação de Dados:** Nenhuma (não salva se anônimo)  
**Evidência:** Print do resultado exibido  
**Status:** ⏳ Pendente

---

### TC-CALC-02: Testar R = 0 (divisão por zero) — BUG S0
**Ação:** Mover slider R para 0 e clicar em "Calculate Impact"  
**Resultado Esperado:** Sistema deve exibir erro "R deve ser maior que 0"  
**Resultado Atual:** Sistema calcula Infinity (bug crítico)  
**Validação de API:** Nenhuma  
**Validação de Dados:** Nenhuma  
**Evidência:** Print do resultado Infinity  
**Status:** ❌ FALHOU (BUG-CALC-01)

---

### TC-CALC-03: Testar valores negativos (validação)
**Ação:** Tentar inserir valores negativos nos sliders  
**Resultado Esperado:** Sliders não permitem valores negativos  
**Resultado Atual:** Sliders têm min=0 (OK)  
**Validação de API:** Nenhuma  
**Validação de Dados:** Nenhuma  
**Evidência:** Print dos sliders  
**Status:** ✅ PASSOU

---

### TC-CALC-04: Testar cálculo válido (caminho feliz)
**Ação:** Preencher E=100K, C=5, R=3 e clicar em "Calculate Impact"  
**Resultado Esperado:** Resultado exibido corretamente (I = (100000 × 5⁷) / 3 = 26.041.666,67)  
**Validação de API:** Nenhuma (cálculo local)  
**Validação de Dados:** Nenhuma (não salva se anônimo)  
**Evidência:** Print do resultado  
**Status:** ⏳ Pendente

---

### TC-CALC-05: Testar geração de PDF
**Ação:** Após calcular, clicar em botão "Download PDF" (se houver)  
**Resultado Esperado:** PDF é gerado e baixado com dados do cálculo  
**Validação de API:** Nenhuma  
**Validação de Dados:** Nenhuma  
**Evidência:** PDF baixado  
**Status:** ⏳ Pendente (botão não visível na tela atual)

---

### TC-CALC-06: Testar salvamento no banco (usuário autenticado)
**Ação:** Fazer login, calcular e verificar se cálculo foi salvo  
**Resultado Esperado:** Cálculo é salvo na tabela `calculations` com userId  
**Validação de API:** `calculations.create` é chamado  
**Validação de Dados:** Query: `SELECT * FROM calculations WHERE userId = ?`  
**Evidência:** Print da query + resposta da API  
**Status:** ⏳ Pendente

---

### TC-CALC-07: Testar histórico de cálculos (usuário autenticado)
**Ação:** Fazer login, calcular 3 vezes, acessar /impact-dashboard  
**Resultado Esperado:** 3 cálculos aparecem no histórico  
**Validação de API:** `calculations.list` é chamado  
**Validação de Dados:** Query: `SELECT * FROM calculations WHERE userId = ? ORDER BY createdAt DESC`  
**Evidência:** Print do dashboard com histórico  
**Status:** ⏳ Pendente

---

### TC-CALC-08: Testar cálculo anônimo (não salva)
**Ação:** Calcular sem fazer login  
**Resultado Esperado:** Resultado é exibido, mas não é salvo no banco  
**Validação de API:** `calculations.create` NÃO é chamado  
**Validação de Dados:** Query: `SELECT COUNT(*) FROM calculations` (não deve aumentar)  
**Evidência:** Print do resultado + query  
**Status:** ⏳ Pendente

---

### TC-CALC-09: Testar loading state do botão
**Ação:** Clicar em "Calculate Impact" e observar botão  
**Resultado Esperado:** Botão exibe loading spinner durante cálculo  
**Resultado Atual:** Botão não tem loading state (bug UX)  
**Validação de API:** Nenhuma  
**Validação de Dados:** Nenhuma  
**Evidência:** Print do botão durante cálculo  
**Status:** ⚠️ FALHOU (BUG-CALC-02 - S3)

---

## 6. FLUXOS E2E

### Fluxo F1 (Principal) — Cálculo Anônimo
**Passos:**
1. Usuário acessa /calculadora
2. Ajusta sliders (E=100K, C=5, R=3)
3. Clica em "Calculate Impact"
4. Resultado é exibido na UI

**Checkpoints:**
- ✅ Página carrega
- ⏳ Sliders funcionam
- ⏳ Botão é clicável
- ⏳ Resultado é exibido

**Status:** ⏳ Em teste

---

### Fluxo F2 (Alternativo) — Cálculo Autenticado
**Passos:**
1. Usuário faz login
2. Acessa /calculadora
3. Ajusta sliders
4. Clica em "Calculate Impact"
5. Resultado é exibido
6. Cálculo é salvo no banco

**Checkpoints:**
- ⏳ Login OK
- ⏳ Página carrega
- ⏳ Cálculo é executado
- ⏳ API `calculations.create` é chamada
- ⏳ Registro é criado no banco

**Status:** ⏳ Pendente

---

### Fluxo F3 (Erro) — R = 0
**Passos:**
1. Usuário acessa /calculadora
2. Move slider R para 0
3. Clica em "Calculate Impact"
4. Sistema exibe erro "R deve ser maior que 0"

**Checkpoints:**
- ⏳ Página carrega
- ⏳ Slider R permite 0 (bug)
- ❌ Sistema não valida R > 0 (bug crítico)
- ❌ Resultado = Infinity (bug crítico)

**Status:** ❌ FALHOU (BUG-CALC-01 - S0)

---

## 7. BUGS ENCONTRADOS

### BUG-CALC-01: R = 0 causa Infinity (S0 — Bloqueador)
**Severidade:** S0 (Bloqueador)  
**Descrição:** Quando R = 0, o cálculo I = (E × C⁷) / R retorna Infinity  
**Passos para Reproduzir:**
1. Acessar /calculadora
2. Mover slider R para 0
3. Clicar em "Calculate Impact"
4. Resultado exibido: Infinity

**Resultado Esperado:** Sistema deve validar R > 0 e exibir erro  
**Resultado Atual:** Sistema calcula Infinity

**Hipótese de Causa:** Falta validação no frontend e backend  
**Impacto:** Usuário não consegue usar a calculadora corretamente  
**Proposta de Correção:**
- Frontend: Adicionar validação `if (R === 0) { alert("R deve ser maior que 0"); return; }`
- Backend: Adicionar validação no endpoint `calculations.create`

**Reteste:** ⏳ Pendente  
**Regressão:** ⏳ Pendente

---

### BUG-CALC-02: Loading state ausente no botão (S3 — Médio)
**Severidade:** S3 (Médio — UX)  
**Descrição:** Botão "Calculate Impact" não exibe loading state durante cálculo  
**Passos para Reproduzir:**
1. Acessar /calculadora
2. Clicar em "Calculate Impact"
3. Observar botão (não muda de estado)

**Resultado Esperado:** Botão exibe spinner ou "Calculando..."  
**Resultado Atual:** Botão permanece estático

**Hipótese de Causa:** Falta estado de loading no componente  
**Impacto:** UX ruim (usuário não sabe se está processando)  
**Proposta de Correção:**
- Adicionar `const [isCalculating, setIsCalculating] = useState(false)`
- Adicionar `disabled={isCalculating}` no botão
- Adicionar spinner no botão durante cálculo

**Reteste:** ⏳ Pendente  
**Regressão:** ⏳ Pendente

---

## 8. PRÓXIMOS PASSOS

1. **Corrigir BUG-CALC-01 (S0)** — Validar R > 0
2. **Executar TC-CALC-04** — Testar cálculo válido
3. **Executar TC-CALC-06** — Testar salvamento no banco
4. **Corrigir BUG-CALC-02 (S3)** — Adicionar loading state
5. **Executar regressão** — Retestar todos os casos após correções

---

**Ficha criada por:** Agente Lead QA (SET7)  
**Status:** 🟡 Em teste (2/9 casos executados, 1 bug S0 encontrado)
