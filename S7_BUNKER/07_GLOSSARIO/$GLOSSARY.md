# $GLOSSARY — Glossário Unificado IMPACT7
**Versão:** 1.0.0  
**Data:** 2026-02-27  
**Classificação:** REFERÊNCIA — SET7.01 Intenção e Propósito  
**Responsável:** Equipe IMPACT7

> Este glossário define os termos técnicos, metodológicos e de domínio utilizados no ecossistema IMPACT7. Seu objetivo é eliminar ambiguidade entre agentes, desenvolvedores, documentação e stakeholders. Termos marcados com `[SET7]` são específicos da metodologia SET7.

---

## Índice por Categoria

- [A — Arquitetura e Agentes](#a--arquitetura-e-agentes)
- [B — Blockchain e Certificação](#b--blockchain-e-certificação)
- [C — Casos e Impacto](#c--casos-e-impacto)
- [D — Dados e Analytics](#d--dados-e-analytics)
- [G — Governança SET7](#g--governança-set7)
- [I — Identidade e Autenticação](#i--identidade-e-autenticação)
- [J — Jarvis AI](#j--jarvis-ai)
- [M — Métricas e Medição](#m--métricas-e-medição)
- [O — Operações](#o--operações)
- [P — Plataforma e Produto](#p--plataforma-e-produto)
- [R — ROI e Retorno](#r--roi-e-retorno)
- [S — SET7 Metodologia](#s--set7-metodologia)
- [T — Tokens e Economia](#t--tokens-e-economia)
- [U — Usuários e Perfis](#u--usuários-e-perfis)

---

## A — Arquitetura e Agentes

**ADR (Architecture Decision Record)**  
Registro formal de uma decisão arquitetural significativa, incluindo contexto, opções consideradas, decisão tomada e consequências. Armazenado em `S7_BUNKER/03_ARCH/ARCH_MANIFEST.md`. `[SET7]`

**Agente SET7**  
Componente autônomo especializado que executa uma função específica dentro do ecossistema IMPACT7. Os agentes são definidos na tabela `set7Agents` e possuem capacidades declaradas (leitura, escrita, execução de código, acesso à internet). Cada agente tem um `agentId` único, `systemPrompt` e `tokenBudget`. `[SET7]`

**Bounded Context**  
Fronteira lógica dentro da qual um modelo de domínio específico é válido e consistente. O IMPACT7 possui 6 Bounded Contexts: Core Platform, Impact Measurement, Jarvis AI, SET7 Governance, Social Proof e Admin & Operations. `[SET7]`

**ITU (Integration Test Unit)**  
Unidade mínima de teste de integração que valida um fluxo completo de ponta a ponta, incluindo banco de dados, API e UI. O IMPACT7 possui 16 ITUs definidas no `ARCH_MANIFEST.md`. `[SET7]`

---

## B — Blockchain e Certificação

**Certificado de Impacto**  
Documento digital imutável emitido pelo IMPACT7 que atesta o impacto social verificado de uma organização. Armazenado na tabela `impactCertificates` com hash de verificação e URL de certificado. Pode ser verificado publicamente via `tokenId`.

**Hash de Verificação**  
String criptográfica única que garante a integridade de um Certificado de Impacto. Gerado a partir dos dados do certificado usando SHA-256. Armazenado no campo `verificationHash`.

**Token de Impacto**  
Unidade digital representando impacto social verificado. Armazenado na tabela `impactTokens`. Diferente de Token de LLM (ver seção T). Pode ser mintado, transferido e queimado.

---

## C — Casos e Impacto

**Case Study (Caso de Impacto)**  
Documentação estruturada de uma intervenção social com evidências mensuráveis de impacto. Armazenado na tabela `caseStudies`. Passa por processo de revisão admin antes de ser publicado.

**Colisão Coder≠Auditor**  
Processo de revisão adversarial onde um agente "Auditor" tenta falsificar, quebrar ou encontrar falhas no trabalho do agente "Coder". Documentado em `S7_BUNKER/04_COLISAO/PROCESSO_COLISAO.md`. Executado mensalmente. `[SET7]`

**Conversão**  
Evento que representa uma ação de valor do usuário: download de whitepaper, submissão de lead, submissão de case, ou contratação de serviço. Rastreado na tabela `conversionEvents` e `leadConversions`.

---

## D — Dados e Analytics

**CHU (Compliance Hardening Unit)**  
Unidade de trabalho atômica focada em conformidade, segurança ou governança. Cada CHU tem um código único (ex: `CONF-001`), descrição, critério de aceitação e evidência de conclusão. Registrado no `TASKLOG.jsonl`. `[SET7]`

**DNA Negativo ($DNA_NEG)**  
Documento que lista os anti-padrões, comportamentos proibidos e armadilhas que o sistema IMPACT7 deve NUNCA fazer. Complemento ao `$DNA_POS.md`. `[SET7]`

**DNA Positivo ($DNA_POS)**  
Documento que lista os 15 padrões de excelência que o sistema IMPACT7 deve SEMPRE seguir. Armazenado em `S7_BUNKER/05_DNA/POS/$DNA_POS.md`. `[SET7]`

---

## G — Governança SET7

**Gate SET7**  
Ponto de controle no ciclo de desenvolvimento que deve ser aprovado antes de avançar para a próxima fase. O IMPACT7 possui 7 Quality Gates (G1–G7) cobrindo segurança, engenharia, testes, confiabilidade, observabilidade, integridade de dados e performance. `[SET7]`

**$GLOSSARY**  
Este documento. Glossário unificado de termos do domínio IMPACT7. Armazenado em `S7_BUNKER/07_GLOSSARIO/$GLOSSARY.md`. `[SET7]`

**$INT (Intenção)**  
Documento constitucional do sistema IMPACT7 com 7 Dimensões Soberanas (D1–D7). Define o problema, proposta de valor, módulos, fronteiras permanentes, KPIs, modelo de dados e orçamento de tokens. Armazenado em `S7_BUNKER/02_INT/$INT.md`. `[SET7]`

---

## I — Identidade e Autenticação

**2FA (Two-Factor Authentication)**  
Autenticação de dois fatores via TOTP (Time-based One-Time Password). Implementado com `otplib`. Armazenado na tabela `twoFactorAuth`. Inclui backup codes para recuperação.

**JWT (JSON Web Token)**  
Token de autenticação assinado com `JWT_SECRET`. Armazenado em cookie HttpOnly. Contém `userId`, `email`, `name`, `role` e `openId`. Expira em 7 dias.

**OAuth Manus**  
Protocolo de autenticação federada via Manus Platform. Fluxo: redirect → `/api/oauth/callback` → cookie de sessão. Alternativa ao login local com email/senha.

**RBAC (Role-Based Access Control)**  
Controle de acesso baseado em papéis. O IMPACT7 possui dois papéis principais: `user` (acesso público autenticado) e `admin` (acesso total ao painel administrativo). Implementado em `server/rbac.ts`.

**Sessão**  
Registro de autenticação ativa de um usuário. Armazenado na tabela `sessions` com `userId`, `token` e `expiresAt`. Invalidada no logout.

---

## J — Jarvis AI

**Jarvis**  
Assistente de IA integrado ao IMPACT7, acessível via chat na interface. Powered by Manus Forge API (LLM). Possui memória persistente (`jarvisMemory`), analytics de uso (`jarvisAnalytics`) e personalidade configurável via `systemPrompt`.

**Memória Jarvis**  
Sistema de memória persistente do Jarvis que armazena contexto de conversas anteriores. Armazenado na tabela `jarvisMemory` com `userId`, `content`, `memoryType` e `importance`. Permite personalização da experiência ao longo do tempo.

**Skill Jarvis**  
Capacidade especializada do Jarvis para executar tarefas específicas (ex: calcular SROI, analisar cases, gerar relatórios). Definida no `systemPrompt` do agente.

---

## M — Métricas e Medição

**Beneficiários**  
Número de pessoas diretamente impactadas por uma intervenção social. Campo `beneficiaries` na tabela `caseStudies`. Usado no cálculo do SROI.

**Core Web Vitals**  
Métricas de performance web definidas pelo Google: LCP (Largest Contentful Paint), FID (First Input Delay) e CLS (Cumulative Layout Shift). Monitoradas como parte do Quality Gate G7.

**KPI (Key Performance Indicator)**  
Indicador-chave de performance. Os KPIs primários do IMPACT7 são: taxa de conversão de leads, número de cases publicados, SROI médio dos cases, e engajamento com o Jarvis.

---

## O — Operações

**Checkpoint**  
Snapshot do estado completo do projeto (código + dependências + metadata) salvo via `webdev_save_checkpoint`. Identificado por `version_id` (hash de 8 caracteres). Permite rollback a qualquer ponto anterior.

**Rate Limiting**  
Mecanismo de proteção que limita o número de requisições por IP em um intervalo de tempo. Configurações: admin (10/min), auth (10/15min), jarvis (10/min), forms (5/hora), geral (100/min). Implementado em `server/middleware/rate-limiter.ts`.

**RUNBOOK**  
Documento operacional com procedimentos para deploy, rollback, incident response e manutenção. Armazenado em `S7_BUNKER/06_OPS/RUNBOOK.md`. `[SET7]`

**S7_BUNKER**  
Repositório de governança SET7 do IMPACT7. Contém documentação constitucional, arquitetura, colisões, DNA, operações e glossário. Localizado em `/S7_BUNKER/` na raiz do projeto. `[SET7]`

---

## P — Plataforma e Produto

**IMPACT7 Method**  
Metodologia proprietária que combina Ciência Cognitiva, Modelagem Matemática e Engenharia de Software para maximizar o retorno social sobre investimento. Os 7 componentes são: Intenção, Mapeamento, Priorização, Ação, Coleta, Transformação e Aprendizado.

**Módulo**  
Funcionalidade autônoma do IMPACT7 com interface própria, backend dedicado e testes independentes. Os módulos principais são: Jarvis AI, Acessibilidade WCAG AAA, Multi-idiomas, Theme Switcher, White Label, Calculadora de Impacto e Blockchain.

**Tenant**  
Instância isolada do IMPACT7 para uma organização específica em arquitetura multi-tenant. Cada tenant possui seus próprios dados, configurações de white label e usuários.

**White Label**  
Configuração que permite personalizar a identidade visual do IMPACT7 para diferentes organizações: logo, cores, nome, domínio e configurações específicas. Armazenado na tabela `whiteLabelConfig`.

---

## R — ROI e Retorno

**SROI (Social Return on Investment)**  
Métrica de impacto social que calcula o valor social gerado por cada unidade monetária investida. Fórmula: `SROI = Valor Social Total / Investimento Total`. Calculado pela Calculadora de Impacto do IMPACT7.

**ROI Tracking**  
Sistema de rastreamento do retorno sobre investimento de intervenções sociais ao longo do tempo. Implementado em `server/services/set7/roi-tracking-service.ts` com tabela `set7RoiTracking`.

**Valor Social**  
Benefício monetarizado gerado por uma intervenção social, calculado multiplicando o número de beneficiários pelo valor proxy de cada benefício. Componente central do cálculo SROI.

---

## S — SET7 Metodologia

**SET7**  
Framework de desenvolvimento de software para sistemas de alto impacto social. Composto por 7 camadas: (1) Intenção, (2) Arquitetura, (3) Segurança, (4) Qualidade, (5) Observabilidade, (6) Governança e (7) Impacto. `[SET7]`

**Score SET7**  
Pontuação de 0 a 100 que mede a conformidade do sistema com o framework SET7. Calculado com base nos CHUs concluídos, gates aprovados e documentação presente. Meta: 85/100 para produção. `[SET7]`

**TASKLOG**  
Registro imutável de todas as tarefas executadas no sistema, em formato JSONL (uma entrada por linha). Armazenado em `S7_BUNKER/02_INT/TASKLOG.jsonl`. Cada entrada contém `trace_id`, `timestamp`, `type`, `description` e `evidence`. `[SET7]`

---

## T — Tokens e Economia

**Budget de Tokens**  
Limite de tokens LLM alocado para um agente ou operação específica. Definido em `tokenBudget` na tabela `set7Agents`. Monitorado pelo `tokens-ops-service`. `[SET7]`

**Circuit Breaker**  
Padrão de resiliência que interrompe automaticamente chamadas a um serviço externo quando a taxa de falhas excede um threshold. Implementado em `server/services/resilience/circuit-breaker-service.ts`. Previne cascata de falhas.

**Token de LLM**  
Unidade de processamento de linguagem natural. Aproximadamente 4 caracteres em inglês ou 3 em português. Usado para medir e cobrar o uso da API de LLM (Manus Forge). Diferente de Token de Impacto (ver seção B).

**Token Budget Tracker**  
Sistema que monitora o consumo de tokens LLM por agente, operação e período. Armazenado na tabela `set7TokenBudgets`. Emite alertas quando o consumo atinge 80% do budget. `[SET7]`

---

## U — Usuários e Perfis

**Admin**  
Papel de usuário com acesso total ao painel administrativo do IMPACT7. Pode gerenciar leads, downloads, cases, templates, configurações e métricas. Definido pelo campo `role = 'admin'` na tabela `users`.

**Lead**  
Contato capturado via formulário do site (download de whitepaper, calculadora de impacto, contato direto). Armazenado na tabela `leads` com `name`, `email`, `organization` e `source`.

**Perfil de Usuário**  
Conjunto de informações de um usuário autenticado: nome, email, avatar, organização, cargo, bio e configurações de notificação. Armazenado na tabela `users` com extensões em `userProfiles`.

**User**  
Papel padrão de usuário autenticado com acesso às funcionalidades públicas do IMPACT7: calculadora, Jarvis, cases, perfil e notificações. Definido pelo campo `role = 'user'` na tabela `users`.

---

## Convenções de Nomenclatura

| Padrão | Uso | Exemplo |
|---|---|---|
| `camelCase` | Campos de banco de dados, variáveis JS/TS | `createdAt`, `userId` |
| `PascalCase` | Componentes React, classes, tipos | `JarvisChat`, `UserProfile` |
| `UPPER_SNAKE_CASE` | Constantes, variáveis de ambiente | `JWT_SECRET`, `DATABASE_URL` |
| `kebab-case` | Nomes de arquivos, rotas URL | `two-factor-auth.ts`, `/api/trpc` |
| `$PREFIX` | Documentos constitucionais SET7 | `$INT.md`, `$GLOSSARY.md` |
| `CONF-XXX` | Códigos de CHU de conformidade | `CONF-001`, `CONF-007` |
| `v{major}.{minor}.{patch}` | Versões semânticas | `v8.4.0` |

---

## Histórico de Revisões

| Versão | Data | Autor | Mudanças |
|---|---|---|---|
| 1.0.0 | 2026-02-27 | Manus AI | Criação inicial com 55 termos em 14 categorias |

---

*Este documento faz parte do S7_BUNKER — Repositório de Governança SET7 do IMPACT7 Platform.*  
*Próxima revisão programada: 2026-03-27*
