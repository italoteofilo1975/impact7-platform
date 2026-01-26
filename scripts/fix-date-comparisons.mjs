#!/usr/bin/env node
/**
 * Script para corrigir erros TypeScript em comparações de Date
 * Converte Date objects para timestamps em gte/lte
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Arquivos a corrigir (top 5 com mais erros)
const filesToFix = [
  'server/services/analytics/analytics-service.ts',
  'server/routers.ts',
  'server/services/set7/runtime-config-service.ts',
  'server/services/set7/agents-service.ts',
  'server/services/two-factor-auth-service.ts',
];

let totalChanges = 0;

console.log('🔧 Iniciando correção de comparações Date...\n');

filesToFix.forEach(file => {
  const filePath = path.join(projectRoot, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileChanges = 0;
  
  // Padrão 1: gte(field, dateVar) → gte(field, dateVar.getTime())
  // Mas só se dateVar for do tipo Date (startDate, endDate, etc)
  const gtePattern = /gte\(([^,]+),\s*(startDate|endDate|fromDate|toDate|minDate|maxDate)\)/g;
  content = content.replace(gtePattern, (match, field, dateVar) => {
    fileChanges++;
    return `gte(${field}, ${dateVar}.getTime())`;
  });
  
  // Padrão 2: lte(field, dateVar) → lte(field, dateVar.getTime())
  const ltePattern = /lte\(([^,]+),\s*(startDate|endDate|fromDate|toDate|minDate|maxDate)\)/g;
  content = content.replace(ltePattern, (match, field, dateVar) => {
    fileChanges++;
    return `lte(${field}, ${dateVar}.getTime())`;
  });
  
  // Padrão 3: gt(field, dateVar) → gt(field, dateVar.getTime())
  const gtPattern = /gt\(([^,]+),\s*(startDate|endDate|fromDate|toDate|minDate|maxDate)\)/g;
  content = content.replace(gtPattern, (match, field, dateVar) => {
    fileChanges++;
    return `gt(${field}, ${dateVar}.getTime())`;
  });
  
  // Padrão 4: lt(field, dateVar) → lt(field, dateVar.getTime())
  const ltPattern = /lt\(([^,]+),\s*(startDate|endDate|fromDate|toDate|minDate|maxDate)\)/g;
  content = content.replace(ltPattern, (match, field, dateVar) => {
    fileChanges++;
    return `lt(${field}, ${dateVar}.getTime())`;
  });
  
  // Padrão 5: eq(field, dateVar) → eq(field, dateVar.getTime())
  const eqPattern = /eq\(([^,]+),\s*(startDate|endDate|fromDate|toDate|minDate|maxDate)\)/g;
  content = content.replace(eqPattern, (match, field, dateVar) => {
    fileChanges++;
    return `eq(${field}, ${dateVar}.getTime())`;
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file}: ${fileChanges} mudanças`);
    totalChanges += fileChanges;
  } else {
    console.log(`⏭️  ${file}: sem mudanças`);
  }
});

console.log(`\n✨ Total: ${totalChanges} comparações Date→timestamp convertidas`);
console.log('\n📊 Execute "pnpm tsc --noEmit" para verificar erros restantes');
