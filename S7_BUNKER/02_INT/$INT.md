# $INT — Intenção Soberana do Sistema IMPACT7
> **Versão:** 1.0.0 | **Data:** 2026-02-27 | **Status:** ATIVO | **Custódio:** Italo Teofilo
> **Classificação SET7:** CONFIDENCIAL — Documento Constitucional do Sistema

---

## PREÂMBULO

Este documento é a **Constituição do Sistema IMPACT7**. Ele define o propósito, fronteiras, contratos e princípios que governam toda decisão de desenvolvimento, arquitetura e operação. Nenhuma feature, endpoint, componente ou decisão técnica pode contradizer o que está aqui escrito sem aprovação formal do Custódio.

---

## D1 — PROBLEMA + PÚBLICO-ALVO

### Problema Central
O ecossistema de inovação social brasileiro carece de **instrumentos científicos, matemáticos e tecnológicos** para medir, comunicar e maximizar o retorno social sobre investimento (S-ROI). Organizações do terceiro setor, fundações corporativas, gestores de impacto e investidores sociais tomam decisões baseadas em narrativas qualitativas sem evidências quantificáveis, resultando em:

- Alocação ineficiente de capital social (estimativa: R$ 18 bilhões/ano desperdiçados)
- Impossibilidade de comparar projetos de impacto entre si
- Dificuldade de captação junto a investidores que exigem métricas
- Perda de aprendizado sistêmico entre organizações

### Público-Alvo Principal (P1)
**Gestores de Impacto Social** em organizações com orçamento anual > R$ 500k que precisam prestar contas a doadores, investidores ou conselhos. Perfil: 35-55 anos, formação em ciências sociais ou administração, familiarizados com Excel mas não com programação.

### Público-Alvo Secundário (P2)
**Consultores e Pesquisadores** de impacto social que assessoram múltiplas organizações e precisam de ferramentas padronizadas para comparação e benchmarking.

### Público-Alvo Terciário (P3)
**Investidores Sociais** (fundações, empresas com ESG, family offices) que precisam avaliar e selecionar projetos para financiamento baseados em evidências.

---

## D2 — PROPOSTA DE VALOR ÚNICA

### Equação Central
```
I = (E × C⁷) / R
```
Onde:
- **I** = Impacto Social Exponencial
- **E** = Esforço (investimento em R$, horas, recursos)
- **C⁷** = Sete Catalisadores Cognitivos (Clareza, Coerência, Comprometimento, Colaboração, Criatividade, Comunicação, Continuidade)
- **R** = Resistência (barreiras sistêmicas, culturais, econômicas)

### Diferenciação Competitiva
| Dimensão | IMPACT7 | Concorrentes |
|---|---|---|
| Metodologia | Científica (cognitiva + matemática) | Qualitativa/narrativa |
| Cálculo | Equação I=(E×C⁷)/R proprietária | Frameworks genéricos (SROI, IRIS+) |
| Tecnologia | Plataforma integrada com IA (Jarvis) | Planilhas e relatórios PDF |
| Idiomas | PT/EN/ES | Geralmente apenas EN |
| Acessibilidade | WCAG AAA | Raramente considerada |

---

## D3 — ARQUITETURA DE VALOR (MÓDULOS)

O sistema é composto por **7 módulos interdependentes**:

| Módulo | Função | Status |
|---|---|---|
| **M1: Calculadora S-ROI** | Calcular I=(E×C⁷)/R com visualização | ✅ Produção |
| **M2: Jarvis AI** | Assistente cognitivo para análise de impacto | ✅ Produção |
| **M3: Cases de Impacto** | Biblioteca de casos reais com métricas | ✅ Produção |
| **M4: Whitepaper/Ebook** | Captura de leads com conteúdo educacional | ✅ Produção |
| **M5: Gamificação** | Engajamento e reconhecimento de usuários | ✅ Produção |
| **M6: Admin Dashboard** | Gestão operacional completa (18 módulos) | ✅ Produção |
| **M7: White Label** | Customização para parceiros institucionais | ✅ Produção |

---

## D4 — FRONTEIRAS DO SISTEMA (O QUE NUNCA FAREMOS)

> **ATENÇÃO:** Estas fronteiras são permanentes e não negociáveis sem revisão formal da D1.

### Fronteiras Técnicas
- **NUNCA** armazenar senhas em texto plano (sempre bcrypt, custo ≥ 12)
- **NUNCA** expor endpoints admin sem verificação de role `admin` no servidor
- **NUNCA** usar `eval()` ou execução dinâmica de código não-sanitizado
- **NUNCA** logar dados pessoais (CPF, email, senha) em logs de produção
- **NUNCA** fazer queries SQL raw sem sanitização de inputs
- **NUNCA** armazenar arquivos binários (>100KB) no banco de dados (usar S3)
- **NUNCA** fazer chamadas LLM no frontend (expõe API key)

### Fronteiras de Produto
- **NUNCA** prometer precisão científica absoluta no cálculo de S-ROI (é uma aproximação)
- **NUNCA** vender dados de usuários ou organizações para terceiros
- **NUNCA** implementar dark patterns de UX (urgência falsa, opt-out difícil)
- **NUNCA** remover acessibilidade WCAG AAA de componentes críticos

### Fronteiras de Governança
- **NUNCA** fazer deploy em produção sem checklist pré-produção completo
- **NUNCA** alterar schema do banco sem migration documentada
- **NUNCA** remover testes existentes (apenas adicionar)
- **NUNCA** aprovar PR com 0 testes para código novo

---

## D5 — KPIs E MÉTRICAS DE SUCESSO

### KPIs de Produto (Mensuráveis)
| KPI | Meta Ano 1 | Meta Ano 2 | Medição |
|---|---|---|---|
| Usuários registrados | 500 | 2.000 | DB: users.count |
| Cálculos S-ROI realizados | 1.000 | 5.000 | DB: calculations.count |
| Leads capturados | 200 | 800 | DB: leads.count |
| Downloads de whitepaper | 300 | 1.200 | DB: whitepaperDownloads.count |
| NPS | ≥ 50 | ≥ 70 | Survey trimestral |
| Uptime | ≥ 99.5% | ≥ 99.9% | Monitoramento |

### KPIs de Qualidade (Técnicos)
| KPI | Meta Atual | Status |
|---|---|---|
| Testes passando | ≥ 99% | ✅ 99.7% |
| Erros TypeScript | 0 | ⚠️ 138 (dívida técnica) |
| Erros de banco em runtime | 0 | ✅ 0 |
| Score SET7 | ≥ 85/100 | ⚠️ 30/100 |
| Cobertura de testes | ≥ 80% | ⚠️ ~45% |

---

## D6 — MODELO DE DADOS SOBERANO

### Entidades Principais (Hierarquia)
```
Organization (tenant)
  └── User (membro da organização)
       └── Calculation (cálculo S-ROI)
            └── CalculationResult (resultado com métricas)
  └── Lead (contato capturado)
  └── CaseStudy (caso de impacto)
  └── WhitepaperDownload (download rastreado)
  └── Testimonial (depoimento)
  └── GamificationPoints (pontos do usuário)
  └── Badge (conquista)
  └── Notification (notificação)
```

### Invariantes de Dados (Regras Permanentes)
1. Todo `User` deve ter `role` ∈ {`admin`, `user`}
2. Todo `Calculation` deve ter `userId` não-nulo (cálculos anônimos são proibidos)
3. Todo `Lead` deve ter `email` válido (regex RFC 5322)
4. Timestamps são sempre **Unix milliseconds** (number), nunca Date objects no banco
5. Senhas são sempre hash bcrypt com custo ≥ 12
6. `isActive` e `isVisible` são sempre TINYINT(1) no MySQL (0 ou 1)

---

## D7 — GESTÃO DE TOKENS E CONTEXTO

### Orçamento de Tokens por Operação
| Operação | Budget Máximo | Modelo Recomendado |
|---|---|---|
| Jarvis chat simples | 2.000 tokens | GPT-4o-mini |
| Jarvis análise de impacto | 8.000 tokens | GPT-4o |
| Geração de relatório | 16.000 tokens | GPT-4o |
| Análise de case study | 4.000 tokens | GPT-4o-mini |
| Sugestão de melhoria | 2.000 tokens | GPT-4o-mini |

### Regras de Contexto
- **SEMPRE** incluir `tenant_id` e `user_id` no contexto de chamadas LLM
- **SEMPRE** limitar histórico de conversa a últimas 10 mensagens (controle de custo)
- **NUNCA** incluir dados sensíveis (senhas, tokens, PII) no prompt LLM
- **SEMPRE** usar `response_format: json_schema` para respostas estruturadas
- **SEMPRE** implementar timeout de 30s em chamadas LLM com fallback gracioso

### Estratégia de Cache
- Respostas de análise de cases: cache 24h (dados raramente mudam)
- Respostas de cálculo S-ROI: sem cache (dados dinâmicos)
- Sugestões de melhoria: cache 1h por usuário

---

## GATE DE APROVAÇÃO

Para alterar qualquer seção deste documento, é necessário:
1. Proposta formal documentada em `S7_BUNKER/02_INT/PROPOSTA_REVISAO_$INT_vX.md`
2. Aprovação do Custódio (Italo Teofilo)
3. Registro no `TASKLOG.jsonl` com trace_id único
4. Atualização do número de versão deste documento

---

*Documento criado em 2026-02-27 | Próxima revisão: 2026-05-27 | Custódio: Italo Teofilo*
