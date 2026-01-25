#!/usr/bin/env node
/**
 * Script Final: Correção Date→number em Arquivos Críticos
 * 
 * Foco: Corrigir apenas os arquivos com mais erros TypeScript
 * - server/_core/auth.ts (autenticação)
 * - server/_core/session.ts (sessões)
 * - server/routers.ts (procedures principais)
 * 
 * Estratégia: Substituir `new Date()` por `Date.now()` apenas em contextos seguros
 */

import { readFileSync, writeFileSync } from 'fs';

const criticalFiles = [
  'server/_core/auth.ts',
  'server/_core/session.ts',
  'server/routers.ts',
];

let totalFiles = 0;
let totalChanges = 0;

for (const filePath of criticalFiles) {
  const fullPath = `/home/ubuntu/impact7-platform-permanent/${filePath}`;
  
  try {
    let content = readFileSync(fullPath, 'utf-8');
    const originalContent = content;
    let fileChanges = 0;

    // 1. Substituir `expiresAt: new Date(...)` por `expiresAt: Date.now() + ...`
    content = content.replace(
      /expiresAt:\s*new Date\(Date\.now\(\)\s*\+\s*([^)]+)\)/g,
      (match, offset) => {
        fileChanges++;
        return `expiresAt: Date.now() + ${offset}`;
      }
    );

    // 2. Substituir `createdAt: new Date()` por `createdAt: Date.now()`
    content = content.replace(
      /createdAt:\s*new Date\(\)/g,
      () => {
        fileChanges++;
        return 'createdAt: Date.now()';
      }
    );

    // 3. Substituir `updatedAt: new Date()` por `updatedAt: Date.now()`
    content = content.replace(
      /updatedAt:\s*new Date\(\)/g,
      () => {
        fileChanges++;
        return 'updatedAt: Date.now()';
      }
    );

    // 4. Substituir `lastUsedAt: new Date()` por `lastUsedAt: Date.now()`
    content = content.replace(
      /lastUsedAt:\s*new Date\(\)/g,
      () => {
        fileChanges++;
        return 'lastUsedAt: Date.now()';
      }
    );

    // 5. Substituir `const now = new Date();` por `const now = Date.now();`
    content = content.replace(
      /const\s+now\s*=\s*new Date\(\);/g,
      () => {
        fileChanges++;
        return 'const now = Date.now();';
      }
    );

    if (content !== originalContent) {
      writeFileSync(fullPath, content, 'utf-8');
      totalFiles++;
      totalChanges += fileChanges;
      console.log(`✅ ${filePath}: ${fileChanges} mudanças`);
    } else {
      console.log(`⏭️  ${filePath}: sem mudanças`);
    }
  } catch (error) {
    console.log(`⚠️  ${filePath}: arquivo não encontrado`);
  }
}

console.log(`\n📊 Resumo:`);
console.log(`   Arquivos modificados: ${totalFiles}`);
console.log(`   Total de mudanças: ${totalChanges}`);
