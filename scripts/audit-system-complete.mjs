#!/usr/bin/env node
/**
 * Script de Auditoria Completa: Frontend ↔ Backend ↔ Banco
 * 
 * Objetivo: Garantir 100% de aderência entre camadas
 * - Mapear todas as interações do frontend (botões, formulários)
 * - Verificar procedures tRPC correspondentes
 * - Validar queries e tabelas no banco
 * - Identificar código mockado
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔍 AUDITORIA COMPLETA DO SISTEMA IMPACT7\n');

// ========== FASE 1: Mapear Páginas e Interações ==========
console.log('📄 FASE 1: Mapeando páginas do frontend...\n');

const pages = execSync('find client/src/pages -name "*.tsx" -type f | sort', { encoding: 'utf-8' })
  .trim()
  .split('\n');

console.log(`Total de páginas: ${pages.length}\n`);

// Analisar cada página para encontrar:
// - trpc.*.useMutation()
// - trpc.*.useQuery()
// - onClick handlers
// - onSubmit handlers

const frontendInteractions = [];

for (const pagePath of pages) {
  try {
    const content = readFileSync(pagePath, 'utf-8');
    const pageName = pagePath.split('/').pop().replace('.tsx', '');
    
    // Buscar chamadas tRPC
    const mutations = [...content.matchAll(/trpc\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\.useMutation/g)];
    const queries = [...content.matchAll(/trpc\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\.useQuery/g)];
    
    if (mutations.length > 0 || queries.length > 0) {
      frontendInteractions.push({
        page: pageName,
        path: pagePath,
        mutations: mutations.map(m => `${m[1]}.${m[2]}`),
        queries: queries.map(q => `${q[1]}.${q[2]}`),
      });
    }
  } catch (error) {
    console.log(`⚠️  Erro ao ler ${pagePath}`);
  }
}

console.log(`📊 Páginas com interações tRPC: ${frontendInteractions.length}\n`);

// ========== FASE 2: Auditar Procedures tRPC ==========
console.log('🔧 FASE 2: Auditando procedures tRPC...\n');

const routersContent = readFileSync('server/routers.ts', 'utf-8');

// Extrair todas as procedures definidas
const procedureMatches = [...routersContent.matchAll(/([a-zA-Z0-9_]+):\s*(publicProcedure|protectedProcedure)/g)];
const procedures = procedureMatches.map(m => m[1]);

console.log(`Total de procedures: ${procedures.length}\n`);

// ========== FASE 3: Identificar Código Mockado ==========
console.log('🎭 FASE 3: Identificando código mockado...\n');

const mockPatterns = [
  { pattern: /TODO/g, name: 'TODO' },
  { pattern: /FIXME/g, name: 'FIXME' },
  { pattern: /MOCK/g, name: 'MOCK' },
  { pattern: /return \[\]/g, name: 'return []' },
  { pattern: /const\s+\w+\s*=\s*\[[\s\S]{100,500}\]/g, name: 'hardcoded arrays' },
];

let totalMocks = 0;
const mockFiles = [];

for (const pagePath of pages) {
  try {
    const content = readFileSync(pagePath, 'utf-8');
    let fileMocks = 0;
    
    for (const { pattern, name } of mockPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        fileMocks += matches.length;
      }
    }
    
    if (fileMocks > 0) {
      mockFiles.push({ file: pagePath, mocks: fileMocks });
      totalMocks += fileMocks;
    }
  } catch (error) {
    // Ignorar erros
  }
}

console.log(`Total de padrões mockados encontrados: ${totalMocks}\n`);

// ========== FASE 4: Verificar Erros de Runtime ==========
console.log('⚠️  FASE 4: Verificando erros de runtime...\n');

try {
  const logs = readFileSync('.manus-logs/devserver.log', 'utf-8');
  const unknownColumnErrors = [...logs.matchAll(/Unknown column '([^']+)'/g)];
  const uniqueErrors = [...new Set(unknownColumnErrors.map(m => m[1]))];
  
  console.log(`Erros "Unknown column" encontrados: ${uniqueErrors.length}`);
  if (uniqueErrors.length > 0) {
    console.log(`Colunas faltantes: ${uniqueErrors.join(', ')}\n`);
  }
} catch (error) {
  console.log('Não foi possível ler logs de erro\n');
}

// ========== GERAR RELATÓRIO ==========
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalPages: pages.length,
    pagesWithInteractions: frontendInteractions.length,
    totalProcedures: procedures.length,
    totalMocks: totalMocks,
  },
  frontendInteractions,
  procedures,
  mockFiles: mockFiles.slice(0, 20), // Top 20
};

writeFileSync('AUDIT_REPORT.json', JSON.stringify(report, null, 2));

console.log('✅ Relatório gerado: AUDIT_REPORT.json\n');
console.log('📊 RESUMO:');
console.log(`   Total de páginas: ${pages.length}`);
console.log(`   Páginas com interações tRPC: ${frontendInteractions.length}`);
console.log(`   Total de procedures tRPC: ${procedures.length}`);
console.log(`   Código mockado encontrado: ${totalMocks} ocorrências`);
console.log(`   Arquivos com mocks: ${mockFiles.length}`);
