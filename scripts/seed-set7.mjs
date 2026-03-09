/**
 * Seed SET7 — Popula as tabelas do Método SET7 com dados padrão
 * Alinhado ao SET7 V3: Gates, Agents, NFRs, ROI Tracking, Token Budgets
 */
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const ADMIN_USER_ID = 3; // Admin IMPACT7
const now = Date.now();

console.log('🚀 Iniciando seed SET7...\n');

// ─── GATES (Portões de Qualidade SET7) ───────────────────────────────────────
const gates = [
  {
    userId: ADMIN_USER_ID,
    gateName: 'Gate 0 — Validação de Contexto',
    gateType: 'validation',
    description: 'Verifica se o contexto do projeto está completo antes de iniciar qualquer ciclo de execução. Requer: objetivo definido, stakeholders mapeados, recursos alocados.',
    conditions: JSON.stringify({ required: ['objective', 'stakeholders', 'resources'], minScore: 80 }),
    actions: JSON.stringify({ onPass: 'advance_to_gate_1', onFail: 'request_context_completion' }),
    isActive: 1, priority: 0, triggerCount: 0,
    createdAt: now, updatedAt: now,
  },
  {
    userId: ADMIN_USER_ID,
    gateName: 'Gate 1 — Alinhamento Estratégico',
    gateType: 'alignment',
    description: 'Confirma alinhamento entre as iniciativas e os OKRs organizacionais. Valida impacto esperado vs. capacidade de execução.',
    conditions: JSON.stringify({ required: ['okr_alignment', 'impact_estimate', 'capacity_check'], minScore: 75 }),
    actions: JSON.stringify({ onPass: 'advance_to_gate_2', onFail: 'escalate_to_strategy_team' }),
    isActive: 1, priority: 1, triggerCount: 0,
    createdAt: now, updatedAt: now,
  },
  {
    userId: ADMIN_USER_ID,
    gateName: 'Gate 2 — Viabilidade Técnica',
    gateType: 'technical',
    description: 'Avalia a viabilidade técnica da solução proposta. Verifica dependências, riscos tecnológicos e capacidade da equipe.',
    conditions: JSON.stringify({ required: ['tech_stack_validated', 'risk_assessment', 'team_capacity'], minScore: 70 }),
    actions: JSON.stringify({ onPass: 'advance_to_gate_3', onFail: 'technical_review_required' }),
    isActive: 1, priority: 2, triggerCount: 0,
    createdAt: now, updatedAt: now,
  },
  {
    userId: ADMIN_USER_ID,
    gateName: 'Gate 3 — Prova de Conceito',
    gateType: 'poc',
    description: 'Valida a entrega do MVP ou PoC com métricas mínimas de aceitação. Requer evidências de funcionamento e feedback inicial.',
    conditions: JSON.stringify({ required: ['poc_delivered', 'user_feedback', 'metrics_baseline'], minScore: 65 }),
    actions: JSON.stringify({ onPass: 'advance_to_gate_4', onFail: 'iterate_poc' }),
    isActive: 1, priority: 3, triggerCount: 0,
    createdAt: now, updatedAt: now,
  },
  {
    userId: ADMIN_USER_ID,
    gateName: 'Gate 4 — Escala e Impacto',
    gateType: 'scale',
    description: 'Avalia prontidão para escala. Verifica infraestrutura, processos operacionais e potencial de impacto ampliado.',
    conditions: JSON.stringify({ required: ['scalability_test', 'operational_readiness', 'impact_projection'], minScore: 80 }),
    actions: JSON.stringify({ onPass: 'advance_to_gate_5', onFail: 'scale_preparation_required' }),
    isActive: 1, priority: 4, triggerCount: 0,
    createdAt: now, updatedAt: now,
  },
  {
    userId: ADMIN_USER_ID,
    gateName: 'Gate 5 — Sustentabilidade',
    gateType: 'sustainability',
    description: 'Confirma sustentabilidade financeira e operacional do projeto. Valida modelo de receita, custos operacionais e plano de continuidade.',
    conditions: JSON.stringify({ required: ['financial_model', 'operational_costs', 'continuity_plan'], minScore: 75 }),
    actions: JSON.stringify({ onPass: 'advance_to_gate_6', onFail: 'sustainability_review' }),
    isActive: 1, priority: 5, triggerCount: 0,
    createdAt: now, updatedAt: now,
  },
  {
    userId: ADMIN_USER_ID,
    gateName: 'Gate 6 — Certificação de Impacto',
    gateType: 'certification',
    description: 'Processo final de certificação do impacto gerado. Requer auditoria externa, relatório SROI validado e publicação dos resultados.',
    conditions: JSON.stringify({ required: ['external_audit', 'sroi_report', 'results_published'], minScore: 90 }),
    actions: JSON.stringify({ onPass: 'issue_impact_certificate', onFail: 'certification_pending' }),
    isActive: 1, priority: 6, triggerCount: 0,
    createdAt: now, updatedAt: now,
  },
];

for (const gate of gates) {
  await conn.execute(
    'INSERT INTO set7Gates (userId, gateName, gateType, description, conditions, actions, isActive, priority, triggerCount, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [gate.userId, gate.gateName, gate.gateType, gate.description, gate.conditions, gate.actions, gate.isActive, gate.priority, gate.triggerCount, gate.createdAt, gate.updatedAt]
  );
}
console.log(`✅ ${gates.length} Gates SET7 inseridos`);

// ─── AGENTS (Agentes do Sistema SET7) ────────────────────────────────────────
const agents = [
  {
    userId: ADMIN_USER_ID,
    agentName: 'Jarvis — Assistente de Impacto',
    agentType: 'assistant',
    description: 'Agente principal de interface com o usuário. Responde perguntas sobre impacto social, orienta no preenchimento de cases e sugere melhorias.',
    capabilities: JSON.stringify(['chat', 'case_guidance', 'impact_calculation', 'report_generation']),
    configuration: JSON.stringify({ model: 'gpt-4', temperature: 0.7, maxTokens: 2048, systemPrompt: 'Você é o Jarvis, assistente especializado em inovação social e impacto do IMPACT7.' }),
    status: 'active', totalTasksCompleted: 0, totalTokensUsed: 0, averageResponseTime: 1200, successRate: 98.5,
    createdAt: now, updatedAt: now,
  },
  {
    userId: ADMIN_USER_ID,
    agentName: 'Analisador de Cases',
    agentType: 'analyzer',
    description: 'Agente especializado em análise de cases de impacto. Extrai métricas, valida dados e gera insights comparativos.',
    capabilities: JSON.stringify(['case_analysis', 'metric_extraction', 'comparative_analysis', 'validation']),
    configuration: JSON.stringify({ model: 'gpt-4', temperature: 0.3, maxTokens: 4096, focus: 'impact_metrics' }),
    status: 'active', totalTasksCompleted: 0, totalTokensUsed: 0, averageResponseTime: 2500, successRate: 96.2,
    createdAt: now, updatedAt: now,
  },
  {
    userId: ADMIN_USER_ID,
    agentName: 'Calculador SROI',
    agentType: 'calculator',
    description: 'Agente de cálculo automatizado de SROI (Social Return on Investment). Utiliza metodologia SROI Network e padrões internacionais.',
    capabilities: JSON.stringify(['sroi_calculation', 'financial_modeling', 'sensitivity_analysis', 'report_generation']),
    configuration: JSON.stringify({ model: 'gpt-4', temperature: 0.1, maxTokens: 3000, methodology: 'SROI_Network_2012' }),
    status: 'active', totalTasksCompleted: 0, totalTokensUsed: 0, averageResponseTime: 3000, successRate: 99.1,
    createdAt: now, updatedAt: now,
  },
  {
    userId: ADMIN_USER_ID,
    agentName: 'Monitor de Conformidade',
    agentType: 'monitor',
    description: 'Agente de monitoramento contínuo de conformidade com o Método SET7. Verifica gates, NFRs e alertas de desvio.',
    capabilities: JSON.stringify(['compliance_check', 'gate_monitoring', 'nfr_tracking', 'alert_generation']),
    configuration: JSON.stringify({ model: 'gpt-3.5-turbo', temperature: 0.2, checkInterval: 3600, alertThreshold: 0.8 }),
    status: 'active', totalTasksCompleted: 0, totalTokensUsed: 0, averageResponseTime: 800, successRate: 99.8,
    createdAt: now, updatedAt: now,
  },
];

for (const agent of agents) {
  await conn.execute(
    'INSERT INTO set7Agents (userId, agentName, agentType, description, capabilities, configuration, status, totalTasksCompleted, totalTokensUsed, averageResponseTime, successRate, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [agent.userId, agent.agentName, agent.agentType, agent.description, agent.capabilities, agent.configuration, agent.status, agent.totalTasksCompleted, agent.totalTokensUsed, agent.averageResponseTime, agent.successRate, agent.createdAt, agent.updatedAt]
  );
}
console.log(`✅ ${agents.length} Agentes SET7 inseridos`);

// ─── NFRs (Requisitos Não-Funcionais SET7) ────────────────────────────────────
const nfrs = [
  { userId: ADMIN_USER_ID, nfrName: 'Disponibilidade da Plataforma', nfrType: 'availability', description: 'A plataforma deve estar disponível 99.9% do tempo (uptime). Máximo de 8.7 horas de downtime por ano.', targetValue: '99.9', currentValue: '99.5', unit: '%', priority: 'critical', status: 'monitoring', verificationMethod: JSON.stringify({ tool: 'uptime_monitor', frequency: '1min', alertChannel: 'email' }), createdAt: now, updatedAt: now },
  { userId: ADMIN_USER_ID, nfrName: 'Tempo de Resposta da API', nfrType: 'performance', description: 'Todas as chamadas de API devem responder em menos de 500ms para o percentil P95.', targetValue: '500', currentValue: '320', unit: 'ms', priority: 'high', status: 'passing', verificationMethod: JSON.stringify({ tool: 'apm', percentile: 'P95', frequency: 'continuous' }), createdAt: now, updatedAt: now },
  { userId: ADMIN_USER_ID, nfrName: 'Segurança de Dados (LGPD)', nfrType: 'security', description: 'Conformidade total com a LGPD. Dados pessoais criptografados em repouso e em trânsito. DPO designado.', targetValue: '100', currentValue: '85', unit: '%', priority: 'critical', status: 'in_progress', verificationMethod: JSON.stringify({ tool: 'lgpd_audit', frequency: 'quarterly', auditor: 'internal' }), createdAt: now, updatedAt: now },
  { userId: ADMIN_USER_ID, nfrName: 'Escalabilidade Horizontal', nfrType: 'scalability', description: 'O sistema deve suportar 10x o volume atual de usuários sem degradação de performance.', targetValue: '10000', currentValue: '1000', unit: 'concurrent_users', priority: 'high', status: 'planned', verificationMethod: JSON.stringify({ tool: 'load_test', tool_name: 'k6', frequency: 'monthly' }), createdAt: now, updatedAt: now },
  { userId: ADMIN_USER_ID, nfrName: 'Precisão do Cálculo SROI', nfrType: 'accuracy', description: 'Os cálculos de SROI devem ter precisão de ±2% em relação a auditorias externas independentes.', targetValue: '2', currentValue: '1.8', unit: '%_deviation', priority: 'critical', status: 'passing', verificationMethod: JSON.stringify({ tool: 'external_audit', frequency: 'annual', standard: 'SROI_Network_2012' }), createdAt: now, updatedAt: now },
  { userId: ADMIN_USER_ID, nfrName: 'Acessibilidade WCAG 2.1', nfrType: 'accessibility', description: 'Interface deve atingir nível AA do WCAG 2.1 para garantir inclusão digital.', targetValue: 'AA', currentValue: 'A', unit: 'wcag_level', priority: 'medium', status: 'in_progress', verificationMethod: JSON.stringify({ tool: 'axe_core', frequency: 'per_release' }), createdAt: now, updatedAt: now },
  { userId: ADMIN_USER_ID, nfrName: 'Taxa de Retenção de Usuários', nfrType: 'engagement', description: 'Taxa de retenção mensal de usuários ativos deve ser superior a 70%.', targetValue: '70', currentValue: '0', unit: '%', priority: 'high', status: 'pending', verificationMethod: JSON.stringify({ tool: 'analytics', metric: 'MAU_retention', frequency: 'monthly' }), createdAt: now, updatedAt: now },
];

for (const nfr of nfrs) {
  await conn.execute(
    'INSERT INTO set7Nfrs (userId, nfrName, nfrType, description, targetValue, currentValue, unit, priority, status, verificationMethod, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
    [nfr.userId, nfr.nfrName, nfr.nfrType, nfr.description, nfr.targetValue, nfr.currentValue, nfr.unit, nfr.priority, nfr.status, nfr.verificationMethod, nfr.createdAt, nfr.updatedAt]
  );
}
console.log(`✅ ${nfrs.length} NFRs SET7 inseridos`);

// ─── ROI TRACKING ─────────────────────────────────────────────────────────────
const roiProjects = [
  {
    userId: ADMIN_USER_ID,
    projectName: 'Plataforma IMPACT7 — Lançamento MVP',
    projectType: 'platform',
    initialInvestment: 150000.00,
    currentValue: 180000.00,
    roi: 20.00,
    impactScore: 78.5,
    socialReturn: 750000.00,
    environmentalImpact: JSON.stringify({ carbonOffset: 0, sdgsAligned: [4, 8, 10, 17] }),
    beneficiariesReached: 500,
    startDate: now - (90 * 24 * 60 * 60 * 1000),
    endDate: null,
    status: 'active',
    metadata: JSON.stringify({ phase: 'mvp', team: 5, methodology: 'SET7_V3' }),
    createdAt: now, updatedAt: now,
  },
  {
    userId: ADMIN_USER_ID,
    projectName: 'Programa de Capacitação em Impacto Social',
    projectType: 'education',
    initialInvestment: 50000.00,
    currentValue: 85000.00,
    roi: 70.00,
    impactScore: 92.3,
    socialReturn: 420000.00,
    environmentalImpact: JSON.stringify({ carbonOffset: 0, sdgsAligned: [4, 10] }),
    beneficiariesReached: 1200,
    startDate: now - (180 * 24 * 60 * 60 * 1000),
    endDate: null,
    status: 'active',
    metadata: JSON.stringify({ phase: 'scale', participants: 1200, certifications: 340 }),
    createdAt: now, updatedAt: now,
  },
];

for (const proj of roiProjects) {
  await conn.execute(
    'INSERT INTO set7RoiTracking (userId, projectName, projectType, initialInvestment, currentValue, roi, impactScore, socialReturn, environmentalImpact, beneficiariesReached, startDate, endDate, status, metadata, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [proj.userId, proj.projectName, proj.projectType, proj.initialInvestment, proj.currentValue, proj.roi, proj.impactScore, proj.socialReturn, proj.environmentalImpact, proj.beneficiariesReached, proj.startDate, proj.endDate, proj.status, proj.metadata, proj.createdAt, proj.updatedAt]
  );
}
console.log(`✅ ${roiProjects.length} projetos ROI Tracking inseridos`);

// ─── TOKEN BUDGETS ─────────────────────────────────────────────────────────────
const tokenBudgets = [
  {
    userId: ADMIN_USER_ID,
    budgetName: 'Budget Mensal — Jarvis Assistant',
    budgetType: 'monthly',
    totalTokens: 500000,
    usedTokens: 0,
    remainingTokens: 500000,
    resetDate: now + (30 * 24 * 60 * 60 * 1000),
    alertThreshold: 80,
    status: 'active',
    createdAt: now, updatedAt: now,
  },
  {
    userId: ADMIN_USER_ID,
    budgetName: 'Budget Mensal — Análise de Cases',
    budgetType: 'monthly',
    totalTokens: 200000,
    usedTokens: 0,
    remainingTokens: 200000,
    resetDate: now + (30 * 24 * 60 * 60 * 1000),
    alertThreshold: 75,
    status: 'active',
    createdAt: now, updatedAt: now,
  },
  {
    userId: ADMIN_USER_ID,
    budgetName: 'Budget Mensal — Cálculos SROI',
    budgetType: 'monthly',
    totalTokens: 100000,
    usedTokens: 0,
    remainingTokens: 100000,
    resetDate: now + (30 * 24 * 60 * 60 * 1000),
    alertThreshold: 90,
    status: 'active',
    createdAt: now, updatedAt: now,
  },
];

for (const budget of tokenBudgets) {
  await conn.execute(
    'INSERT INTO set7TokenBudgets (userId, budgetName, budgetType, totalTokens, usedTokens, remainingTokens, resetDate, alertThreshold, status, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [budget.userId, budget.budgetName, budget.budgetType, budget.totalTokens, budget.usedTokens, budget.remainingTokens, budget.resetDate, budget.alertThreshold, budget.status, budget.createdAt, budget.updatedAt]
  );
}
console.log(`✅ ${tokenBudgets.length} Token Budgets inseridos`);

// ─── RUNTIME CONFIG ───────────────────────────────────────────────────────────
const [runtimeCols] = await conn.execute('DESCRIBE set7RuntimeConfig');
const runtimeColNames = runtimeCols.map(c => c.Field);
console.log('set7RuntimeConfig columns:', runtimeColNames);

await conn.end();
console.log('\n✅ Seed SET7 concluído com sucesso!');
console.log('📊 Resumo: 7 Gates | 4 Agentes | 7 NFRs | 2 ROI Projects | 3 Token Budgets');
