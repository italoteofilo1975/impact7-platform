# MÉTODO IMPACTA SETE (IMPACT7) — DOCUMENTO CANÔNICO

**Versão:** 1.0.0 (Consolidação Inicial)
**Data:** 2026-07-16
**Classificação:** CONSTITUCIONAL — SET7.START / SET7.01 (Intenção e Propósito)
**Responsável:** Equipe IMPACT7 / Fundador
**Localização:** `S7_BUNKER/00_ESTRATEGIA/METODO_IMPACTA_SETE_CANONICO.md`

> Este é o documento canônico ("constituição" conceitual) do **Método Impacta Sete**. Ele consolida, a partir das fontes reais existentes nos dois repositórios (`impact7-platform` e `Projeto-impact7`), a definição das três camadas conceituais do método, distingue-as, integra-as e **documenta explicitamente as divergências entre fontes** que ainda precisam de decisão de canonização do fundador. Nada aqui foi inventado: toda afirmação está ancorada num arquivo-fonte citado.

---

## Fontes primárias consolidadas

**Repositório `impact7-platform` (`/home/user/impact7-platform`):**
- `shared/set7-methodology.ts` — 7 fases SET7, JARVIS_ARCHITECTURE, IMPACT7_EQUATION (`I=(E×C⁷)/R`), SROI_CALCULATOR, SET7_COMPLIANCE_CHECKLIST
- `shared/set7-constants.ts` — as 7 Capacidades (C⁷), 7 Módulos, frameworks 7R/7V/77T, ODS, níveis de maturidade
- `shared/set7-integration.ts` — contexto SET7 para LLM, validação de conformidade, templates
- `S7_BUNKER/07_GLOSSARIO/$GLOSSARY.md` — glossário unificado (55 termos, 14 categorias)

**Repositório `Projeto-impact7` (`.../scratchpad/Projeto-impact7`):**
- `client/src/pages/Matematica.tsx` — Equação do Impacto e os 7 C's (Cultural/Comunitário/…)
- `client/src/pages/FundamentacaoCientifica.tsx` — fundamentação científica
- `client/src/pages/Intro.tsx` + `verificacao_imagem.md` — os 7 pilares "I"
- `docs/METODO_SET7_REFERENCIA.md` — 7 fases SET (SET1–SET7)
- `docs/MATRIZ_ADERENCIA_SET7.md` — matriz de aderência (SET7.START–SET7.07)

---

## 1. Sumário Executivo

O **Método Impacta Sete** (comercialmente **IMPACT7**) é uma **metodologia proprietária que combina Ciência Cognitiva, Modelagem Matemática e Engenharia de Software para maximizar o retorno social sobre investimento** (definição literal do `$GLOSSARY.md`, verbete "IMPACT7 Method"). Ele existe para romper com o que a introdução do livro (`Intro.tsx`) chama de **"Síndrome do Herói"** — o modelo tradicional de impacto social baseado em sacrifício, dependência de editais e centralização no fundador — substituindo-o por **ecossistemas de inovação social robustos, capazes de crescer 7× mais rápido e alcançar 7× mais pessoas**.

No ecossistema IMTS/IMPACT7 o método opera em **três camadas conceituais complementares** que devem ser lidas em conjunto:

| Camada | Nome | Natureza | O que entrega | Fonte principal |
|---|---|---|---|---|
| **1** | Os 7 Pilares "I" | Metodologia de **inovação social** (produto/consultoria/livro) | O percurso do empreendedor social do zero à escala | `Intro.tsx`, `verificacao_imagem.md` |
| **2** | Equação do Impacto + 7 C's + S-ROI | **Modelo matemático** de mensuração | Quantificação do impacto e do retorno social | `Matematica.tsx`, `set7-methodology.ts` |
| **3** | Método SET7 | Metodologia de **engenharia de software** | Como a plataforma que suporta o método é construída e operada | `set7-methodology.ts`, `docs/METODO_SET7_REFERENCIA.md` |

Em termos simples: a **Camada 1** é *o método que se vende* (a jornada de transformação social); a **Camada 2** é *como se mede* se a transformação está funcionando; a **Camada 3** é *como se constrói e opera* a plataforma tecnológica (IMPACT7 Platform, com o assistente Jarvis) que instrumenta tudo isso. As três compartilham a assinatura numerológica do "7" e a filosofia de **transformação exponencial, contexto preservado, impacto mensurável, iteração contínua e governança transparente** (`set7-integration.ts`, `generateSET7Context()`).

> ⚠️ **Aviso de canonização:** existe atualmente uma proliferação de "sétuplas" concorrentes nas fontes (7 Pilares "I", 7 C's/Capacidades, 7 Fases SET7, 7 Módulos, 7 Camadas SET7, 7 componentes do "IMPACT7 Method", frameworks 7R/7V). Nem todas são a mesma coisa e algumas se contradizem. A Seção 7 lista todas essas divergências para decisão do fundador.

---

## 2. Camada 1 — Os 7 Pilares "I" (Inovação Social)

Esta é a metodologia voltada ao cliente/leitor: a espinha dorsal do livro "Método IMPACT7" e da consultoria. A introdução (`Intro.tsx`) afirma que o livro está **"dividido em 7 pilares fundamentais que levarão sua iniciativa do zero à escala global"**. Os sete pilares, cada um iniciando com a letra **"I"**, estão enumerados de forma canônica em `verificacao_imagem.md` (que descreve as identidades visuais de cada pilar):

| # | Pilar "I" | Descrição consolidada | Identidade visual (de `verificacao_imagem.md`) |
|---|---|---|---|
| 1 | **Imersão** | Mergulho profundo no contexto, no território e no problema real antes de agir. | Esfera luminosa com partículas douradas |
| 2 | **Ideação** | Geração de soluções e hipóteses de transformação a partir do que foi imerso. | Lâmpada com rede neural dourada |
| 3 | **Implementação** | Colocar a solução em prática, sair da ideia para a execução concreta. | Cubos dourados/bronze |
| 4 | **Iteração** | Ciclos de aprendizado e refinamento contínuo da solução com base em feedback. | Setas circulares douradas |
| 5 | **Impacto** | Geração e mensuração do resultado social transformador (elo com a Camada 2). | Hub de inovação com elementos dourados |
| 6 | **Inspiração** | Disseminação, narrativa e mobilização — inspirar outros e multiplicar o movimento. | Lâmpada com chama dourada |
| 7 | **Independência** | Sustentabilidade e autonomia — a iniciativa deixa de depender do "herói" e perdura. | Castelo/fortaleza dourada |

**Leitura narrativa:** os pilares formam um arco que vai do **entendimento** (Imersão → Ideação) à **ação** (Implementação → Iteração), passando pela **prova de valor** (Impacto), até a **escala e perenidade** (Inspiração → Independência). O pilar 7 (Independência) é o antídoto direto à "Síndrome do Herói" descrita na introdução: o objetivo final é uma iniciativa que **sobrevive ao fundador** e "não morre quando o fundador adoece".

> **Nota de fonte:** as descrições de cada pilar acima são consolidações fiéis ao espírito das fontes; os *nomes* e a *ordem* dos 7 pilares estão literalmente confirmados em `verificacao_imagem.md`. Descrições longas por pilar não existem como texto único nas fontes lidas (o conteúdo completo está atrás do paywall "LIBERAR ACESSO COMPLETO" citado em `Intro.tsx`). Ver divergência **D1** na Seção 7.

---

## 3. Camada 2 — O Modelo Matemático (Equação do Impacto + 7 C's + S-ROI)

### 3.1 A Equação do Impacto

Fórmula canônica (idêntica em todas as fontes):

```
        E × C⁷
  I  =  ────────
          R
```

Fonte: `Matematica.tsx` (renderização `I = (E × C⁷) / R`), `set7-methodology.ts` (`IMPACT7_EQUATION.formula = 'I = (E × C⁷) / R'`) e `set7-integration.ts` (`generateSET7Context()`).

A ideia central é que o impacto é **exponencial no fator de "7"** (`C⁷`): um pequeno ganho no fator elevado à sétima potência produz saltos de impacto, enquanto a resistência (`R`) atua como divisor/atrito.

**Definição das variáveis — e onde as fontes divergem:**

| Variável | `Matematica.tsx` | `set7-methodology.ts` | `set7-integration.ts` |
|---|---|---|---|
| **I** — Impacto | "Resultado mensurável" | "Resultado mensurável da transformação social" — Índice 0–1000 | "Índice de Impacto" |
| **E** | **Energia** = "Investimento total" | **Engajamento** = envolvimento/participação dos stakeholders (Score 1–10) | **Investimento (Esforço)** |
| **C⁷** | **Contexto** = "7 dimensões de alinhamento" | **Capacidades** = "as 7 capacidades multiplicadoras" | **Contexto** (0–1, preservação contextual) |
| **R** — Resistência | "Barreiras e fricções" | "Fatores que reduzem/dificultam o impacto" (Score 1–10) | "Fricção sistêmica" |

Há consenso sobre **I** (Impacto) e **R** (Resistência), mas **divergência real sobre E e sobre o que "C" significa** (ver divergências **D2** e **D3** na Seção 7).

**Implementação de referência** (`set7-methodology.ts`, `IMPACT7_EQUATION.calculateImpact`): recebe `engagement`, um array de **exatamente 7** `capabilities` e `resistance`; calcula a média das 7 capacidades, eleva à 7ª potência (`Math.pow(avgCapability, 7)`), multiplica por `engagement`, divide por `max(resistance, 0.1)` e limita o resultado a 1000 (`Math.min(round(impact), 1000)`). **Ou seja: o código trata `C` como Capacidades e `E` como Engajamento** — alinhado à coluna do meio da tabela acima.

### 3.2 Os 7 C's / As 7 Capacidades (o fator C⁷)

Aqui está a **divergência mais importante do método**. As fontes concordam que há **sete fatores começando com "C"** elevados à sétima potência, mas **discordam sobre quais são e sobre o que representam**:

**Versão A — "As 7 Capacidades" (`shared/set7-constants.ts` + `shared/set7-methodology.ts`)**
São tratadas como *capacidades multiplicadoras* do agente/organização. Trilíngues (pt/en/es), com ícone e cor cada:

| # | Capacidade (PT) | EN | Descrição (`set7-constants.ts`) | Ícone |
|---|---|---|---|---|
| 1 | **Consciência** | Awareness | Compreensão profunda do contexto, desafios e oportunidades | 🧠 |
| 2 | **Competência** | Competence | Habilidades e conhecimentos necessários para executar | 🎯 |
| 3 | **Conexão** | Connection | Redes e relacionamentos que amplificam o impacto | 🔗 |
| 4 | **Colaboração** | Collaboration | Trabalho conjunto para alcançar objetivos comuns | 🤝 |
| 5 | **Criatividade** | Creativity | Inovação e pensamento disruptivo para soluções únicas | 💡 |
| 6 | **Compromisso** | Commitment | Dedicação e responsabilidade com os resultados | 💪 |
| 7 | **Continuidade** | Continuity | Sustentabilidade e perenidade das transformações | ♾️ |

**Versão B — "As 7 Dimensões do Contexto" (`client/src/pages/Matematica.tsx`)**
São tratadas como *dimensões de alinhamento contextual* da intervenção:

| # | Dimensão | Descrição (`Matematica.tsx`) |
|---|---|---|
| 1 | **Cultural** | Alinhamento com valores e crenças locais |
| 2 | **Comunitário** | Engajamento e participação da comunidade |
| 3 | **Capacitário** | Desenvolvimento de habilidades e competências |
| 4 | **Conectivo** | Redes de relacionamento e parcerias |
| 5 | **Cognitivo** | Aprendizado e mudança de mentalidade |
| 6 | **Colaborativo** | Co-criação e trabalho em equipe |
| 7 | **Continuativo** | Sustentabilidade e perenidade |

**Mapeamento aproximado entre as duas versões** (há sobreposição conceitual clara em vários pares):

| Conceito | Versão A (Capacidades) | Versão B (Dimensões do Contexto) |
|---|---|---|
| Compreensão/mentalidade | Consciência | Cognitivo |
| Habilidade/execução | Competência | Capacitário |
| Redes | Conexão | Conectivo |
| Trabalho conjunto | Colaboração | Colaborativo |
| Perenidade | Continuidade | Continuativo |
| Valores locais | *(sem par direto)* | Cultural |
| Comunidade | *(sem par direto)* | Comunitário |
| Criatividade | Criatividade | *(sem par direto)* |
| Compromisso | Compromisso | *(sem par direto)* |

Cinco dos sete alinham-se quase 1:1; a Versão A tem **Criatividade** e **Compromisso** exclusivos, enquanto a Versão B tem **Cultural** e **Comunitário** exclusivos. Ver a **proposta de unificação** na Seção 3.4 e a divergência **D3** na Seção 7.

### 3.3 S-ROI (Social Return on Investment)

**Definição** (`$GLOSSARY.md`): métrica de impacto social que calcula o valor social gerado por cada unidade monetária investida.

**Fórmula canônica** (consenso entre `Matematica.tsx`, `$GLOSSARY.md` e `set7-methodology.ts`):

```
  S-ROI  =  Valor Social Gerado  /  Investimento Total
```

**Cálculo de referência** (`set7-methodology.ts`, `SROI_CALCULATOR.calculate`), recebe `{ investment, beneficiaries, duration (meses), impactScore, contextScore }` e retorna:
- `socialValue = (impactScore × beneficiaries × duration × contextScore) / 100`
- `sroi = socialValue / investment`
- `costPerBeneficiary = investment / beneficiaries`
- `impactPerDollar = impactScore / investment`

O "Valor Social" (`$GLOSSARY.md`) é o *benefício monetarizado* gerado, calculado multiplicando o número de **beneficiários** pelo valor-proxy de cada benefício.

**Benchmarks — divergência entre fontes:**

| Faixa | `set7-methodology.ts` (`SROI_CALCULATOR.benchmarks`) | `Matematica.tsx` (cards visuais) |
|---|---|---|
| Excelente / Topo | ≥ 5× ("Retorno excepcional") | **12×+** ("S-ROI Top 10% IMPACT7") |
| Bom / Recomendado | 3×–5× ("Acima da média do setor") | **7×** ("S-ROI Mínimo Recomendado") |
| Médio | 1×–3× ("Na média do setor") | **3–4×** ("Médio — projetos sociais") |
| Abaixo | < 1× ("Necessita otimização") | — |

Os números **não batem**: para o código, 5× já é "excelente"; para a página de marketing, 7× é apenas o *mínimo recomendado* e o topo é 12×+. Ver divergência **D4** na Seção 7.

### 3.4 Proposta de versão unificada recomendada (para decisão do fundador)

Recomenda-se **separar claramente dois conceitos hoje confundidos**, adotando uma leitura que preserva o código existente e o discurso de marketing:

1. **Consolidar o significado das variáveis** (alinhando ao código, que é a implementação executável):
   - **I** = Índice de Impacto (0–1000)
   - **E** = **Engajamento** (envolvimento dos stakeholders, 1–10) — tratar "Energia/Investimento/Esforço" como *sinônimos narrativos* do mesmo fator de mobilização, **não** como o investimento financeiro (que já é capturado no S-ROI).
   - **C⁷** = **as 7 Capacidades de Contexto** (unificar "Capacidades" e "Dimensões do Contexto" num único conjunto batizado, p.ex., **"os 7 C's do Contexto"**).
   - **R** = Resistência (fricção/barreiras, 1–10).

2. **Unificar as duas listas de 7 C's** num conjunto único de sete rótulos que sejam simultaneamente *capacidades* e *dimensões contextuais*. Proposta de conjunto unificado (mantém os 5 pares convergentes e escolhe entre os exclusivos):

   | # | C unificado (proposto) | Absorve |
   |---|---|---|
   | 1 | **Consciência** (Cognitivo/Cultural) | Consciência + Cognitivo + Cultural |
   | 2 | **Competência** (Capacitário) | Competência + Capacitário |
   | 3 | **Conexão** (Conectivo) | Conexão + Conectivo |
   | 4 | **Colaboração** (Colaborativo/Comunitário) | Colaboração + Colaborativo + Comunitário |
   | 5 | **Criatividade** | Criatividade |
   | 6 | **Compromisso** | Compromisso |
   | 7 | **Continuidade** (Continuativo) | Continuidade + Continuativo |

   Esta unificação **preserva integralmente a Versão A** (código em produção) e reancora os rótulos exclusivos da Versão B como *aspectos* dos C's convergentes (Cultural/Comunitário → Consciência/Colaboração). **Requer decisão explícita do fundador** — é uma escolha editorial, não uma dedução mecânica.

   > ✅ **CANONIZADO em 2026-07-16 pelo fundador (Italo).** Os 7 C's oficiais são: **Consciência · Competência · Conexão · Colaboração · Criatividade · Compromisso · Continuidade**. Gravado no código em `shared/set7-constants.ts` (`SEVEN_CAPABILITIES` + `SEVEN_CS_CONTEXTUAL_MAP`). Divergência **D3 resolvida**.

---

## 4. Camada 3 — O Método SET7 (Engenharia)

O **SET7** ("Sistema de Engenharia de Transformação em 7 Fases" / "Sistemas Exponenciais Transformadores") é a metodologia proprietária para **conceber, arquitetar, desenvolver e operar** a plataforma. Sua filosofia central (`docs/METODO_SET7_REFERENCIA.md`): transformar a interação humano-computador de "cliques e telas" para uma **interface de diálogo e intenção**, na qual o sistema é um **parceiro ativo ("um Jarvis corporativo")** que entende contexto, antecipa necessidades e age de forma autônoma.

### 4.1 As fases (numeração canônica de produção: SET7.START + SET7.01–SET7.07)

Esta é a numeração usada no **código em produção** (`shared/set7-methodology.ts`) e na **matriz de aderência** (`docs/MATRIZ_ADERENCIA_SET7.md`). São 8 estágios (um protocolo de entrada + 7 fases):

| Fase | Nome | Objetivo | Gate |
|---|---|---|---|
| **SET7.START** | Protocolo de Entrada | Estabelecer bases: objetivos, intenções, interesse e contexto amplo | Aprovação do Protocolo de Entrada |
| **SET7.01** | Direção Estratégica, Escopo e Matriz de Intenção | Capturar/refinar a visão — o "porquê" e o escopo | Aprovação do Escopo pelo stakeholder principal |
| **SET7.02** | Domínio, Arquitetura e Decomposição Sistêmica | Blueprint técnico: microsserviços (DDD), dados, eventos, APIs | Revisão de Arquitetura pela equipe técnica |
| **SET7.03** | Contratos, APIs e Integrações por Hash/QR Code | Formalizar contratos de API/eventos e identidade verificável | Aprovação dos Contratos de API |
| **SET7.04** | Segurança, Governança e Confiança | IAM (RBAC+ABAC+ReBAC), DevSecOps, governança de dados, auditoria | Aprovação de Segurança |
| **SET7.05** | Construção Performática (Back, Front, Experiência) | Back-end, front-end, IA conversacional, Design System, WCAG 2.2 AA | Code Review e Testes Aprovados |
| **SET7.06** | Operação, Observabilidade e Eficiência Cognitiva | Deploy resiliente, observabilidade, SLIs/SLOs, gestão de custo/tokens | Go-Live (aprovação final para produção) |
| **SET7.07** | Resiliência, Continuidade e Evolução | Melhoria contínua, retroalimentação da IA, BCP/DRP, evolução do método | Revisão de Ciclo de Produto (periódica) |

**Atividades e artefatos por fase** (resumo de `set7-methodology.ts`, `SET7_PHASES`):

- **SET7.START** → Documento de Visão Inicial, Matriz de Intenções, Análise de Contexto.
- **SET7.01** → Documento de Visão e Escopo, Mapa de Jornadas, Relatório de Benchmarking, Matriz de NFRs.
- **SET7.02** → Documento de Arquitetura de Solução (DAS), Diagramas C4, Context Map, ADRs, especificações OpenAPI.
- **SET7.03** → Especificações OpenAPI, Contratos de Eventos, Sistema de Verificação Hash/QR, Política de Versionamento.
- **SET7.04** → Modelo de Ameaças (STRIDE), Especificação do IAM, Governança de Dados, Pipeline DevSecOps, Trilhas de Auditoria.
- **SET7.05** → Código-fonte versionado, Testes automatizados, Base de Conhecimento, Design System, Auditoria de Acessibilidade.
- **SET7.06** → Sistema em produção, Dashboards, SLIs/SLOs, Playbooks de incidentes, Relatório de Resiliência.
- **SET7.07** → Relatórios de Performance/Uso, Backlog de Evolução, BCP, DRP, versões atualizadas dos modelos de IA.

### 4.2 Gates e conformidade

Cada fase termina num **Gate** — ponto de controle que deve ser aprovado antes de avançar (`$GLOSSARY.md`: "Gate SET7"). O `set7-methodology.ts` traz o `SET7_COMPLIANCE_CHECKLIST` (checklist por fase) e funções de cálculo (`calculatePhaseCompliance`, `calculateOverallCompliance`, `generateComplianceReport`); a meta de produção é **Score SET7 ≥ 85/100** (`$GLOSSARY.md`). Segundo `docs/MATRIZ_ADERENCIA_SET7.md`, o Projeto IMPACT7 evoluiu de **50% para 86%** de aderência, com todos os gates SET7.01–SET7.07 marcados como **APROVADOS** (pendências remanescentes principais: pipeline DevSecOps em SET7.04, correções de acessibilidade em SET7.05, testes de resiliência/chaos em SET7.06, tabletop do DRP em SET7.07).

> ⚠️ **Sobre a numeração alternativa (SET1–SET7) e as "14 fases estendidas":** `docs/METODO_SET7_REFERENCIA.md` descreve as fases como **SET1–SET7 com nomes diferentes** (Ideação e Descoberta; Modelagem Arquitetural; Engenharia de Segurança e Governança; Desenvolvimento Inteligente; Experiência e Acessibilidade; Resiliência e Operações; Evolução e Inteligência Contínua). Os *limites* das fases não coincidem com a numeração de produção (ex.: naquela referência, "Experiência/Acessibilidade" é uma fase própria — SET5 — enquanto no código isso está fundido em SET7.05). **Não foi encontrado nas fontes lidas nenhum documento que descreva "14 fases estendidas"** — apenas as 7 fases (mais o START). Ver divergências **D5** e **D6** na Seção 7.

---

## 5. A Arquitetura Jarvis (IA conversacional) como instrumento do método

O **Jarvis** é o assistente de IA integrado ao IMPACT7 — o instrumento que operacionaliza a filosofia SET7 de "sistema como parceiro conversacional". Segundo o `$GLOSSARY.md`, é *powered by* a Manus Forge API, com memória persistente (`jarvisMemory`), analytics de uso (`jarvisAnalytics`) e personalidade configurável via `systemPrompt`.

**Componentes da arquitetura** (`shared/set7-methodology.ts`, `JARVIS_ARCHITECTURE`, corroborado por `docs/METODO_SET7_REFERENCIA.md`):

| Componente | Propósito | Tecnologias |
|---|---|---|
| **Canal de Interação** | Porta de entrada (Web, App, WhatsApp, Voz) | Adapters por canal |
| **Motor de NLU** | Entende intenção, extrai entidades, analisa sentimento | LLMs, RAG |
| **Gerenciador de Diálogo** | Mantém contexto e decide o próximo passo | Máquina de estados, gestão de contexto |
| **Base de Conhecimento** | Armazena/recupera conhecimento estruturado e não estruturado | Graph DB (Neo4j/Neptune), Vector DB |
| **Orquestrador de Skills** | Mapeia intenção → execução de skills (APIs) | Motor de workflow, Service Mesh |
| **Motor de NLG** | Gera respostas em linguagem natural, personalizadas | LLMs, templates |
| **Módulo de Aprendizado** | Retroalimenta e melhora o sistema | Pipeline de ML, análise de logs |

**Capacidades de NLU:** Reconhecimento de Intenção, Extração de Entidades, Análise de Sentimento, Resolução de Ambiguidade.

**Skills do Jarvis** (`JARVIS_ARCHITECTURE.skills`): Calculadora de Impacto, Mentoria Personalizada, Exportação de Relatórios, Busca na Base de Conhecimento, Agendamento de Reuniões, Análise de Cases. É pelo Jarvis (skill "Calculadora de Impacto") que a **Camada 2** (Equação do Impacto e S-ROI) é entregue ao usuário, e é o Jarvis que encarna a arquitetura conversacional prevista na fase **SET7.05** da **Camada 3**. Assim, o Jarvis é o ponto onde as três camadas se encontram operacionalmente.

**Arquitetura Omnichannel** (`docs/METODO_SET7_REFERENCIA.md`): um "cérebro centralizado" (NLU/diálogo/raciocínio num serviço central) mais "adapters de canal" por interface (WhatsApp, Web, Slack, Voz), com **proatividade** (antecipação de necessidades) e **personalidade** (persona consistente).

---

## 6. Glossário mínimo (termos essenciais)

Extraído/consolidado de `S7_BUNKER/07_GLOSSARIO/$GLOSSARY.md` e das demais fontes:

1. **IMPACT7 Method** — Metodologia proprietária que combina Ciência Cognitiva, Modelagem Matemática e Engenharia de Software para maximizar o retorno social sobre investimento.
2. **SET7** — Metodologia/framework de engenharia para sistemas de alto impacto social, organizada em fases com gates (SET7.START → SET7.07).
3. **Os 7 Pilares "I"** — Imersão, Ideação, Implementação, Iteração, Impacto, Inspiração, Independência (a jornada de inovação social — Camada 1).
4. **Equação do Impacto** — `I = (E × C⁷) / R`; modelo matemático do impacto social exponencial.
5. **As 7 Capacidades / 7 C's** — os sete fatores "C" elevados à 7ª potência (fator `C⁷`) da equação (ver divergência D3).
6. **S-ROI (Social Return on Investment)** — Valor Social Gerado ÷ Investimento Total; retorno social por unidade monetária investida.
7. **Valor Social** — Benefício monetarizado gerado por uma intervenção (nº de beneficiários × valor-proxy do benefício).
8. **Beneficiários** — Número de pessoas diretamente impactadas; insumo do cálculo de S-ROI.
9. **Jarvis** — Assistente de IA conversacional do IMPACT7 (memória, analytics, skills); instrumento operacional do método.
10. **Gate SET7** — Ponto de controle que deve ser aprovado antes de avançar de fase; o sistema tem Quality Gates de qualidade/segurança.
11. **Score SET7** — Pontuação 0–100 de conformidade do sistema ao framework SET7 (meta de produção: ≥ 85).
12. **S7_BUNKER** — Repositório de governança SET7 (documentação constitucional, arquitetura, colisões, DNA, ops, glossário).
13. **$INT (Intenção)** — Documento constitucional com 7 Dimensões Soberanas (D1–D7): problema, valor, módulos, fronteiras, KPIs, dados, tokens.
14. **Colisão Coder≠Auditor** — Processo de revisão adversarial (um agente "Auditor" tenta falsificar o trabalho do "Coder"); executado mensalmente.
15. **Síndrome do Herói** — Anti-padrão que o método combate: empreendedor social que centraliza, se sacrifica e cria iniciativas que não sobrevivem a ele (`Intro.tsx`).

---

## 7. ⚠️ Divergências e Decisões Pendentes de Canonização

Esta seção consolida **todas** as inconsistências encontradas entre as fontes. Cada uma requer uma **decisão explícita do fundador** para se tornar canônica.

### D1 — Falta o corpo textual dos 7 Pilares "I"
Os nomes/ordem dos 7 pilares estão confirmados (`verificacao_imagem.md`), mas as **descrições completas** de cada pilar estão atrás do paywall do livro (`Intro.tsx`, "LIBERAR ACESSO COMPLETO") e **não existem como texto canônico** nas fontes lidas. As descrições na Seção 2 são consolidações fiéis, não citações literais.
**Decisão necessária:** validar/oficializar a definição de cada um dos 7 Pilares.

### D2 — O que significa "E" na equação?
Três leituras conflitantes: **Energia = investimento total** (`Matematica.tsx`) vs. **Engajamento dos stakeholders** (`set7-methodology.ts`, e é isso que o código calcula) vs. **Investimento/Esforço** (`set7-integration.ts`). Se "E" for investimento financeiro, ele colide conceitualmente com o denominador do S-ROI.
**Decisão necessária:** fixar E = Engajamento (recomendado, alinha ao código) ou E = Energia/Investimento.

### D3 — O que é `C⁷`: "Capacidades" ou "Dimensões do Contexto"? E quais são os 7 C's?
Divergência dupla e a **mais crítica** do método:
- **Semântica:** `C` = *Capacidades multiplicadoras* (`set7-methodology.ts`/`set7-constants.ts`, e o código) **vs.** `C` = *Contexto / dimensões de alinhamento* (`Matematica.tsx`) **vs.** `C` = *Contexto 0–1 de preservação contextual* (`set7-integration.ts`).
- **Lista de rótulos:** Consciência/Competência/Conexão/Colaboração/Criatividade/Compromisso/Continuidade **vs.** Cultural/Comunitário/Capacitário/Conectivo/Cognitivo/Colaborativo/Continuativo.
**Decisão necessária:** adotar a versão unificada proposta na Seção 3.4 (ou outra). Sem isso, marketing e produto usam listas diferentes.
**✅ RESOLVIDO (2026-07-16):** adotada a versão unificada da Seção 3.4 — 7 C's oficiais = Consciência · Competência · Conexão · Colaboração · Criatividade · Compromisso · Continuidade. `C⁷` = "as 7 Capacidades/C's do Contexto". Canonizado no código (`set7-constants.ts`).

### D4 — Benchmarks de S-ROI não coincidem
Código (`SROI_CALCULATOR.benchmarks`): excelente ≥5×, bom 3–5×, médio 1–3×, abaixo <1×. Página (`Matematica.tsx`): mínimo recomendado **7×**, médio 3–4×, top 10% **12×+**. Os patamares são incompatíveis.
**Decisão necessária:** fixar uma única tabela de benchmarks e sincronizar código e conteúdo.

### D5 — Duas numerações/nomenclaturas de fases SET7
Produção: **SET7.START + SET7.01–SET7.07** com nomes de engenharia/governança (`set7-methodology.ts`, `MATRIZ_ADERENCIA_SET7.md`). Referência do Projeto: **SET1–SET7** com nomes diferentes e **limites de fase distintos** (`docs/METODO_SET7_REFERENCIA.md`) — ex.: Experiência/Acessibilidade é fase própria (SET5) lá, mas está fundida em SET7.05 no código.
**Decisão necessária:** eleger a nomenclatura canônica (recomenda-se a de produção, SET7.START–SET7.07) e aposentar/mapear a outra.

### D6 — "14 fases estendidas" não documentadas
O briefing menciona "7 fases SET7.01 a SET7.07, ou as 14 fases estendidas", mas **nenhuma fonte lida descreve 14 fases**. Só existem 7 (+ START).
**Decisão necessária:** ou produzir a especificação das 14 fases estendidas, ou remover a referência a elas.

### D7 — "SET7" tem pelo menos três definições concorrentes do que são "as 7"
1. **7 Fases** (SET7.START–07) — `set7-methodology.ts`.
2. **7 Camadas** — "(1) Intenção, (2) Arquitetura, (3) Segurança, (4) Qualidade, (5) Observabilidade, (6) Governança, (7) Impacto" (`$GLOSSARY.md`, verbete "SET7").
3. **7 Quality Gates (G1–G7)** — "segurança, engenharia, testes, confiabilidade, observabilidade, integridade de dados e performance" (`$GLOSSARY.md`, verbete "Gate SET7").
Essas três sétuplas **não são o mesmo eixo** e não têm mapeamento 1:1 explícito.
**Decisão necessária:** definir se Fases, Camadas e Gates são três dimensões ortogonais oficiais (e documentar a relação) ou consolidar.

### D8 — Múltiplas "sétuplas" concorrentes de nível de método
Além das camadas acima, as fontes trazem ainda:
- **7 Módulos** (`set7-constants.ts`): Diagnóstico, Estratégia, Engajamento, Execução, Medição, Aprendizado, Escala — mapeados a SET7.01–07.
- **7 componentes do "IMPACT7 Method"** (`$GLOSSARY.md`): Intenção, Mapeamento, Priorização, Ação, Coleta, Transformação, Aprendizado.
- **7 Pilares "I"** (`verificacao_imagem.md`): Imersão…Independência.
- **Frameworks 7R** (Redundância, Recuperação, Resiliência, Responsividade, Rastreabilidade, Regulação, Retroalimentação) e **7V** (Velocidade, Volume, Variedade, Veracidade, Valor, Visibilidade, Viabilidade) (`set7-constants.ts`).
São **cinco listas de sete** para o "mesmo" método, sem hierarquia declarada entre elas.
**Decisão necessária:** definir qual é a sétupla *primária* voltada ao cliente (recomenda-se os 7 Pilares "I") e rebaixar as demais a frameworks de apoio internos, documentando as relações.

### D9 — Versão da metodologia inconsistente
`set7-methodology.ts` declara `@version 2.0`; `set7-integration.ts` declara `@version 1.0` no cabeçalho mas usa `version: '2.0'` no middleware; `$GLOSSARY.md` é `1.0.0`; `MATRIZ_ADERENCIA_SET7.md` é "2.0".
**Decisão necessária:** definir versionamento único do método (este documento propõe iniciar em **1.0.0** como canônico consolidador).

### D10 — Nível de acessibilidade (WCAG) divergente
`WCAG 2.2 AA` (`set7-methodology.ts`, `METODO_SET7_REFERENCIA.md`) vs. `WCAG 2.1 AA` (`set7-integration.ts`, `generateSET7Prompt`) vs. módulo "Acessibilidade WCAG AAA" (`$GLOSSARY.md`).
**Decisão necessária:** fixar o alvo oficial de conformidade WCAG.

---

*Documento canônico consolidado a partir das fontes reais dos repositórios `impact7-platform` e `Projeto-impact7`. Faz parte do S7_BUNKER — Repositório de Governança SET7. Toda divergência listada na Seção 7 permanece aberta até decisão registrada do fundador.*
