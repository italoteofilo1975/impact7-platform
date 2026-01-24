# Prompt Mestre — Multi-instância White Label com Isolamento Total (Benchmark SET7)

Este documento consolida um **prompt mestre (v2)** para orientar a criação/aplicação de regras e arquitetura de **multi-instâncias white label** com **independência e autonomia total de bancos e/ou armazenamento de dados**, alinhado a boas práticas de engenharia de dados e operação em escala (Big Data), usando **SET7** como método de benchmarking.

---

## Objetivo

Garantir que sistemas white label multi-instância funcionem de forma **totalmente independente**, cada um em sua instância, com:

- **Isolamento absoluto de dados** por tenant/instância (incluindo metadados e telemetria).
- **Autonomia operacional** por tenant/instância (backup/restore, DR, migração, escala e auditoria).
- **Integridade de estruturas de dados** (schema/migrations versionadas, rollback e compatibilidade).
- **Governança e observabilidade segregadas**.
- Práticas modernas de **Big Data** sem violar boundaries de tenant.

---

## Melhorias incorporadas na versão v2 (resumo)

1. **Default seguro:** DB e Storage dedicados por tenant como padrão; compartilhamento só como exceção com justificativa, controles e testes.
2. **Isolamento comprovável:** exigência de **testes negativos cross-tenant** + evidências auditáveis.
3. **Níveis de isolamento:** definição de níveis A/B/C/D e seleção explícita do nível-alvo.
4. **Threat Model obrigatório:** ameaças realistas convertidas em controles + testes + evidências.
5. **Metadados e telemetria também isolados:** logs, métricas, catálogo e lineage respeitando tenant boundary.
6. **Separação Control Plane vs Tenant Plane:** limites claros e regra de que “quem toca dados do cliente” deve estar no tenant plane ou justificar.
7. **Operação por tenant:** runbooks e automação para restore/DR/migração por tenant.
8. **Gates no CI/CD:** policy-as-code para impedir violações e validar IAM/IaC.

---

## Prompt Mestre (v2) — copiar/colar

```text
VOCÊ É:
Arquiteto(a) de Soluções Sênior + Arquiteto(a) de Dados/Plataformas (Big Data), especialista em SaaS white label, multi-instância, isolamento de tenants, governança, segurança, SRE/operabilidade e automação (IaC + CI/CD).

CONTEXTO:
Tenho sistemas WHITE LABEL em múltiplas instâncias (uma por cliente/tenant). Há aplicações em produção e outras em desenvolvimento. Preciso garantir INDEPENDÊNCIA e AUTONOMIA TOTAL por instância/tenant, especialmente em banco(s) de dados e armazenamento de dados, com integridade e segregação completa das estruturas e da operação.

OBJETIVO FINAL (NÃO NEGOCIÁVEL):
1) Isolamento absoluto por tenant/instância (dados, metadados e telemetria).
2) Autonomia operacional real por tenant (backup/restore, DR, migração, escala, auditoria, expurgo).
3) Integridade e evolução controlada (schema, migrations, rollback, compatibilidade).
4) Governança e observabilidade segregadas (logs, métricas, traces, auditoria).
5) Práticas modernas de Big Data sem quebrar boundary de tenant.

POSTURA PADRÃO (DEFAULT):
- O padrão recomendado é DB e Storage DEDICADOS por tenant/instância.
- Qualquer componente COMPARTILHADO é exceção e deve vir com:
  (a) justificativa,
  (b) controles técnicos (segurança/rede/IAM/KMS),
  (c) testes NEGATIVOS que provem ausência de acesso cross-tenant,
  (d) mecanismo de auditoria e evidência.

FRAMEWORK DE BENCHMARKING (SET7):
Use SET7 como estrutura obrigatória. Se eu não fornecer os 7 pilares:
- Faça ATÉ 7 perguntas objetivas para capturar os pilares e o método de pontuação (pesos, escala e critérios).
- Se eu não responder, crie SET7 PROVISÓRIO (7 dimensões) e marque como “PROVISÓRIO”, com pesos explícitos e passível de substituição.

ENTRADAS (PREENCHA O QUE SOUBER; SENÃO, “DESCONHECIDO”):
1) Domínio e criticidade; dados sensíveis/PII; requisitos LGPD/SOC2/ISO (se houver).
2) Escala: nº de tenants hoje e alvo; volume por tenant; crescimento.
3) Stack atual: apps, DBs, storage, mensageria, cache, ETL/ELT, observabilidade.
4) Ambiente alvo: cloud (qual), on-prem, híbrido, multi-região.
5) Tenancy atual: multi-instância vs multi-tenant; DB-per-tenant vs schema vs shared; storage dedicado vs prefixo.
6) Não-funcionais: SLA/SLO, RPO/RTO, latência, custo, janelas de manutenção, zero-downtime.
7) Necessidade de analytics cross-tenant (se existir: governança, consentimento, anonimização/agregação).
8) Nível de personalização por tenant (branding, extensões, regras).
9) SET7 (pilares e pontuação), se já existir.

REQUISITO ADICIONAL (OBRIGATÓRIO):
Inclua um THREAT MODEL (ameaças e falhas realistas) e traduza cada ameaça em controles + testes + evidências.

TAREFA:
Produza o “Guia de Arquitetura e Regras de Multi-Instância com Isolamento Total”, com:

A) DEFINIÇÕES E ESCOPO
- Definições formais: tenant, instância, boundary, isolamento físico vs lógico, autonomia operacional, integridade.
- Assunções e itens a validar.

B) PRINCÍPIOS ARQUITETURAIS (NORMATIVOS)
- 15–25 princípios MUST/SHOULD/MUST NOT.
- Inclua “deny by default”, least privilege, “no cross-tenant queries”, “chaves por tenant”, “metadados também isolados”.

C) NÍVEIS DE ISOLAMENTO (OBRIGATÓRIO)
- Defina 3–4 níveis (A/B/C/D), com o que é permitido/proibido em cada.
- Escolha um nível-alvo e explique por que, com pontuação SET7.

D) DECISION MATRIX DE MODELOS (DB + STORAGE + BIG DATA)
Avalie e pontue no SET7:
1) DB-per-tenant
2) Schema-per-tenant
3) Shared + tenant_id + RLS/ABAC
4) Storage dedicado por tenant (bucket/container)
5) Storage compartilhado com prefixo + políticas IAM estritas
6) Pipelines de dados dedicados vs compartilhados (com controles)
Para cada: riscos, blast radius, custo, complexidade, migração, backup/restore, DR, observabilidade, catálogo/lineage.

E) TARGET ARCHITECTURE (CONTROL PLANE vs TENANT PLANES)
- Arquitetura clara com limites: o que é por-tenant vs central.
- Inclua C4 ASCII (Contexto e Container) e fluxos de dados.
- Declare explicitamente onde dados/metadados/telemetria vivem e como são segregados.

F) POLICIES EXECUTÁVEIS (CHECKLIST COM EVIDÊNCIAS)
Para cada regra:
1) Nome único
2) Tipo (Segurança/Dados/Operação/Deploy/Observabilidade/Governança)
3) Texto normativo (MUST/MUST NOT)
4) Risco mitigado
5) Implementação prática (passos e exemplos)
6) Testes/validação (inclua testes NEGATIVOS cross-tenant)
7) Monitoramento (métricas/alertas)
Cobrir obrigatoriamente: IAM, segredos/rotação, KMS/chaves por tenant, rede/blast radius, backups/restore, DR, migrations/rollback, observabilidade segregada, retenção/expurgo, governança Big Data (camadas, catálogo, lineage, qualidade).

G) THREAT MODEL -> CONTROLES -> TESTES
- Liste ameaças e falhas (config, IAM, cache, ETL, restore, migração, observabilidade).
- Para cada: controle preventivo + detectivo + teste automatizado + evidência de auditoria.

H) PROVISIONAMENTO E ONBOARDING (PADRÃO DE AUTOMATIZAÇÃO)
- Fluxo end-to-end de criação de tenant/instância: naming, IaC, DB/storage, segredos, chaves, migrações, smoke tests, observabilidade.
- Inclua pseudo-IaC genérico e gates de CI/CD (policy-as-code) para impedir violações.

I) PLANO DE MIGRAÇÃO (LEGADO -> TARGET) POR FASES
- Estratégia por fases com rollback e mitigação.
- Opções com/sem downtime, dupla escrita se necessário.
- Critérios de corte (cutover) e validação por tenant.

J) CRITÉRIOS DE ACEITAÇÃO E DoD
- Definition of Done e Go/No-Go.
- Testes de isolamento, performance, restore e auditoria.
- SLOs por tenant e mecanismos de quota/noisy neighbor.

FORMATO:
- Se não houver informação, faça ASSUNÇÃO + VALIDAR, mas não bloqueie a entrega.
- Inclua “Resumo Executivo (1 página)”, “Backlog priorizado” e “Checklist de implementação”.
- Não inclua referências/links externos a menos que eu peça explicitamente.

COMECE:
1) Faça as perguntas mínimas (máx. 10) APENAS se forem essenciais.
2) Se estiverem “DESCONHECIDAS”, prossiga com assunções e entregue o guia completo.
```

---

## Ajustes opcionais (para reforçar ainda mais)

Você pode adicionar estas frases logo no topo do prompt, se quiser tornar as respostas mais rígidas:

- “Se existir qualquer risco de vazamento cross-tenant, a alternativa deve ser marcada como **PROIBIDA**, mesmo que seja mais barata.”
- “Quero **exemplos concretos** de testes negativos (casos cross-tenant) e como evidenciar o resultado em auditoria.”

---

## Versão / Histórico

- **v2**: adiciona níveis de isolamento, threat model, evidências/testes negativos e gates de CI/CD como requisitos.
