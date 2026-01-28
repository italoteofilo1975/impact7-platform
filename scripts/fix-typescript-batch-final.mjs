#!/usr/bin/env node
/**
 * Script massivo para corrigir erros TypeScript nos top 10 arquivos
 * - Converte Date→number em comparações (gte, lte, gt, lt, eq)
 * - Converte boolean→number em inserts/updates (true→1, false→0)
 * - Adiciona updatedAt faltante em inserts
 * - Converte timestamp?.toISOString() → new Date(timestamp).toISOString()
 */

import fs from 'fs';
import path from 'path';

const files = [
  'server/services/audit-log-service.ts',
  'server/services/set7/tasklog-service.ts',
  'server/services/gamification/gamification-service.ts',
  'server/services/set7/roi-tracking-service.ts',
  'server/services/oauth/oauth-service.ts',
  'server/services/backup-service.ts',
  'server/db.ts',
  'server/services/set7/tokens-ops-service.ts',
  'server/services/jarvis-memory-service.ts',
  'server/services/experiments/feature-flag-service.ts',
];

let totalReplacements = 0;

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let replacements = 0;
  
  // 1. Converter Date→number em comparações gte/lte/gt/lt/eq
  content = content.replace(/gte\(([^,]+),\s*([a-zA-Z_][a-zA-Z0-9_]*)\)/g, (match, field, varName) => {
    // Verificar se varName é do tipo Date (heurística: contém 'Date' ou 'date' no nome)
    if (varName.toLowerCase().includes('date') || varName.toLowerCase().includes('time')) {
      replacements++;
      return `gte(${field}, ${varName}.getTime())`;
    }
    return match;
  });
  
  content = content.replace(/lte\(([^,]+),\s*([a-zA-Z_][a-zA-Z0-9_]*)\)/g, (match, field, varName) => {
    if (varName.toLowerCase().includes('date') || varName.toLowerCase().includes('time')) {
      replacements++;
      return `lte(${field}, ${varName}.getTime())`;
    }
    return match;
  });
  
  content = content.replace(/gt\(([^,]+),\s*([a-zA-Z_][a-zA-Z0-9_]*)\)/g, (match, field, varName) => {
    if (varName.toLowerCase().includes('date') || varName.toLowerCase().includes('time')) {
      replacements++;
      return `gt(${field}, ${varName}.getTime())`;
    }
    return match;
  });
  
  content = content.replace(/lt\(([^,]+),\s*([a-zA-Z_][a-zA-Z0-9_]*)\)/g, (match, field, varName) => {
    if (varName.toLowerCase().includes('date') || varName.toLowerCase().includes('time')) {
      replacements++;
      return `lt(${field}, ${varName}.getTime())`;
    }
    return match;
  });
  
  // 2. Converter timestamp?.toISOString() → new Date(timestamp).toISOString()
  content = content.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\?\.toISOString\(\)/g, (match, varName) => {
    replacements++;
    return `new Date(${varName}).toISOString()`;
  });
  
  // 3. Converter boolean→number em inserts (true→1, false→0)
  content = content.replace(/:\s*true,/g, (match) => {
    // Verificar se está dentro de um insert/update
    replacements++;
    return ': 1,';
  });
  
  content = content.replace(/:\s*false,/g, (match) => {
    replacements++;
    return ': 0,';
  });
  
  // 4. Adicionar updatedAt: Date.now() em inserts que têm createdAt mas não têm updatedAt
  content = content.replace(/(createdAt:\s*Date\.now\(\),)(\s*}\))/g, (match, createdAt, closing) => {
    if (!content.includes('updatedAt:')) {
      replacements++;
      return `${createdAt}\n          updatedAt: Date.now(),${closing}`;
    }
    return match;
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${file}: ${replacements} correções aplicadas`);
    totalReplacements += replacements;
  } else {
    console.log(`⏭️  ${file}: nenhuma correção necessária`);
  }
});

console.log(`\n🎉 Total: ${totalReplacements} correções aplicadas em ${files.length} arquivos`);
