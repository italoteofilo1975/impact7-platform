/**
 * ============================================================================
 * SET7 INTEGRATION MODULE
 * ============================================================================
 * 
 * Este módulo integra a metodologia SET7 em todas as operações da plataforma,
 * garantindo que gerações de conteúdo, melhorias e evoluções tecnológicas
 * sigam automaticamente os princípios SET7.
 * 
 * USO AUTOMÁTICO:
 * - Importar este módulo em qualquer serviço que gere conteúdo
 * - Usar validateSET7Compliance() antes de deploy
 * - Usar generateSET7Context() para LLM prompts
 * 
 * @version 1.0
 * @author IMPACT7 Team
 */

import { SET7_PHASES, SET7Phase, SET7Compliance } from './set7-methodology';
import SET7Constants, { SEVEN_CAPABILITIES, SEVEN_MODULES, TECH_FRAMEWORKS } from './set7-constants';

// ============================================================================
// CONTEXTO SET7 PARA GERAÇÃO DE CONTEÚDO
// ============================================================================

/**
 * Gera contexto SET7 para uso em prompts de LLM
 * Deve ser incluído em todas as gerações de conteúdo da plataforma
 */
export function generateSET7Context(): string {
  return `
## CONTEXTO METODOLÓGICO SET7

Você está operando dentro da plataforma IMPACT7, que segue rigorosamente a metodologia SET7 
(Sistema de Engenharia de Transformação em 7 Fases).

### PRINCÍPIOS FUNDAMENTAIS:
1. **Transformação Exponencial**: Todo conteúdo deve visar transformação positiva e escalável
2. **Contexto Preservado**: Respeitar o contexto cultural, social e organizacional
3. **Impacto Mensurável**: Resultados devem ser quantificáveis via S-ROI
4. **Iteração Contínua**: Melhorias incrementais baseadas em feedback
5. **Governança Transparente**: Decisões documentadas e rastreáveis

### FASES SET7:
- SET7.START: Protocolo de Entrada (Objetivos, Intenção, Contexto)
- SET7.01: Direção Estratégica e Escopo
- SET7.02: Domínio e Arquitetura
- SET7.03: Contratos e Integrações
- SET7.04: Segurança e Governança
- SET7.05: Construção Performática
- SET7.06: Operação e Observabilidade
- SET7.07: Resiliência e Evolução

### EQUAÇÃO FUNDAMENTAL:
I = (E × C⁷) / R
- I: Índice de Impacto
- E: Investimento (Esforço)
- C: Contexto (0-1, preservação contextual)
- R: Resistência (fricção sistêmica)

### DIRETRIZES PARA GERAÇÃO:
1. Sempre alinhar conteúdo aos 7 pilares do IMPACT7
2. Priorizar clareza e acessibilidade
3. Incluir métricas quando relevante
4. Manter tom profissional mas empático
5. Referenciar metodologia quando apropriado
`;
}

// ============================================================================
// VALIDAÇÃO DE CONFORMIDADE SET7
// ============================================================================

/**
 * Valida conformidade de um artefato com a metodologia SET7
 */
export function validateSET7Compliance(
  artifact: {
    type: 'code' | 'content' | 'design' | 'process';
    phase?: SET7Phase;
    content: string;
  }
): SET7Compliance {
  const checks = {
    hasDocumentation: /\/\*\*|@description|README/i.test(artifact.content),
    hasErrorHandling: /try|catch|throw|error/i.test(artifact.content),
    hasLogging: /console\.|logger\.|log\(/i.test(artifact.content),
    hasValidation: /validate|schema|zod|yup/i.test(artifact.content),
    hasTests: /test\(|describe\(|it\(|expect\(/i.test(artifact.content),
    hasAccessibility: /aria-|role=|alt=|tabindex/i.test(artifact.content),
    hasI18n: /t\(|useTranslation|i18n/i.test(artifact.content),
    hasSecurityHeaders: /helmet|csp|cors|xss/i.test(artifact.content),
  };

  const items: SET7Compliance['items'] = [
    { name: 'Documentação', status: checks.hasDocumentation ? 'complete' : 'pending' },
    { name: 'Tratamento de Erros', status: checks.hasErrorHandling ? 'complete' : 'pending' },
    { name: 'Logging/Observabilidade', status: checks.hasLogging ? 'complete' : 'pending' },
    { name: 'Validação de Entrada', status: checks.hasValidation ? 'complete' : 'pending' },
    { name: 'Testes Automatizados', status: checks.hasTests ? 'complete' : 'partial' },
    { name: 'Acessibilidade', status: checks.hasAccessibility ? 'complete' : 'pending' },
    { name: 'Internacionalização', status: checks.hasI18n ? 'complete' : 'partial' },
    { name: 'Segurança', status: checks.hasSecurityHeaders ? 'complete' : 'pending' },
  ];

  const completed = items.filter(i => i.status === 'complete').length;
  const percentage = Math.round((completed / items.length) * 100);

  return {
    phase: artifact.phase || 'SET7.05',
    percentage,
    items,
  };
}

// ============================================================================
// GERADOR DE PROMPTS SET7
// ============================================================================

/**
 * Gera prompt base para qualquer geração de conteúdo seguindo SET7
 */
export function generateSET7Prompt(task: {
  type: 'feature' | 'bugfix' | 'content' | 'documentation' | 'test';
  description: string;
  context?: string;
}): string {
  const baseContext = generateSET7Context();
  
  const taskInstructions = {
    feature: `
### TAREFA: Implementação de Feature
Ao implementar esta feature, garanta:
- Código limpo e bem documentado
- Testes unitários e de integração
- Tratamento de erros robusto
- Acessibilidade (WCAG 2.1 AA)
- Internacionalização (PT-BR, EN, ES)
- Logging para observabilidade
`,
    bugfix: `
### TAREFA: Correção de Bug
Ao corrigir este bug, garanta:
- Identificação da causa raiz
- Teste que reproduz o bug
- Correção mínima e focada
- Teste que valida a correção
- Documentação da solução
`,
    content: `
### TAREFA: Geração de Conteúdo
Ao gerar este conteúdo, garanta:
- Alinhamento com metodologia IMPACT7
- Tom profissional e empático
- Clareza e acessibilidade
- Métricas quando relevante
- Referências à metodologia
`,
    documentation: `
### TAREFA: Documentação
Ao criar esta documentação, garanta:
- Estrutura clara e navegável
- Exemplos práticos
- Referências cruzadas
- Versionamento
- Acessibilidade
`,
    test: `
### TAREFA: Criação de Testes
Ao criar estes testes, garanta:
- Cobertura de casos de sucesso
- Cobertura de casos de erro
- Testes de borda
- Mocks apropriados
- Assertions claras
`,
  };

  return `${baseContext}

${taskInstructions[task.type]}

### DESCRIÇÃO DA TAREFA:
${task.description}

${task.context ? `### CONTEXTO ADICIONAL:\n${task.context}` : ''}

### CHECKLIST DE QUALIDADE SET7:
- [ ] Código/conteúdo segue padrões SET7
- [ ] Documentação adequada
- [ ] Testes quando aplicável
- [ ] Acessibilidade verificada
- [ ] Segurança considerada
- [ ] Performance otimizada
`;
}

// ============================================================================
// TEMPLATES DE ARTEFATOS SET7
// ============================================================================

export const SET7_TEMPLATES = {
  /**
   * Template para ADR (Architecture Decision Record)
   */
  adr: (params: { title: string; context: string; decision: string; consequences: string }) => `
# ADR: ${params.title}

## Status
Proposto

## Contexto
${params.context}

## Decisão
${params.decision}

## Consequências

### Positivas
${params.consequences}

### Negativas
- A ser avaliado

## Conformidade SET7
- Fase: SET7.02 (Arquitetura)
- Gate: Revisão de Arquitetura
- Artefato: ADR

## Referências
- Metodologia SET7
- Padrões de Arquitetura IMPACT7
`,

  /**
   * Template para Checklist de Gate
   */
  gateChecklist: (phase: SET7Phase) => {
    const phaseInfo = SET7_PHASES[phase];
    return `
# Checklist de Gate: ${phaseInfo.name}

## Objetivo
${phaseInfo.objective}

## Atividades Requeridas
${phaseInfo.activities.map(a => `- [ ] ${a}`).join('\n')}

## Artefatos Esperados
${phaseInfo.artifacts.map(a => `- [ ] ${a}`).join('\n')}

## Critérios de Aprovação
- [ ] Todas as atividades concluídas
- [ ] Todos os artefatos produzidos
- [ ] Revisão por pares realizada
- [ ] Stakeholders aprovaram

## Assinaturas
- Responsável: _______________
- Revisor: _______________
- Data: _______________
`;
  },

  /**
   * Template para Relatório de Conformidade
   */
  complianceReport: (compliance: SET7Compliance) => `
# Relatório de Conformidade SET7

## Fase: ${compliance.phase}
## Conformidade: ${compliance.percentage}%

## Itens Avaliados

| Item | Status | Evidência |
|------|--------|-----------|
${compliance.items.map(i => `| ${i.name} | ${i.status} | ${i.evidence || '-'} |`).join('\n')}

## Recomendações
${compliance.items
  .filter(i => i.status !== 'complete')
  .map(i => `- Completar: ${i.name}`)
  .join('\n') || '- Nenhuma pendência'}

## Próximos Passos
1. Resolver itens pendentes
2. Atualizar evidências
3. Solicitar nova avaliação
`,
};

// ============================================================================
// HOOKS PARA INTEGRAÇÃO AUTOMÁTICA
// ============================================================================

/**
 * Hook para validar código antes de commit
 * Usar em pre-commit hooks
 */
export function preCommitValidation(files: string[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const file of files) {
    // Verificar se arquivos críticos têm documentação
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      warnings.push(`Verificar documentação em: ${file}`);
    }

    // Verificar se testes existem para novos arquivos
    if (file.includes('/services/') && !file.includes('.test.')) {
      const testFile = file.replace('.ts', '.test.ts');
      warnings.push(`Considerar criar teste: ${testFile}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Middleware para adicionar contexto SET7 em requisições
 */
export function set7Middleware() {
  return (req: any, res: any, next: any) => {
    req.set7Context = {
      methodology: 'SET7',
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
    next();
  };
}

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export {
  SET7_PHASES,
  SEVEN_CAPABILITIES,
  SEVEN_MODULES,
  TECH_FRAMEWORKS,
  SET7Constants,
};

export default {
  generateSET7Context,
  validateSET7Compliance,
  generateSET7Prompt,
  SET7_TEMPLATES,
  preCommitValidation,
  set7Middleware,
};
