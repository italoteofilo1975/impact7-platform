#!/usr/bin/env node
/**
 * Script Ultra-Agressivo: Eliminar TODOS os 264 Erros TypeScript
 * 
 * Foco: 210 erros (79%) são Date vs number
 * - TS2769 (112): No overload matches
 * - TS2322 (73): Type incompatibility
 * - TS2345 (25): Argument type mismatch
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('🚀 SCRIPT ULTRA-AGRESSIVO: Eliminando TODOS os erros TypeScript\n');

let totalFiles = 0;
let totalChanges = 0;

// Padrões de conversão Date→number
const patterns = [
  // Padrão 1: new Date() em assignments
  {
    find: /(\w+):\s*new Date\(\)/g,
    replace: '$1: Date.now()',
    name: 'new Date() → Date.now() em assignments'
  },
  
  // Padrão 2: new Date(timestamp) em assignments
  {
    find: /(\w+):\s*new Date\(([^)]+)\)/g,
    replace: '$1: $2',
    name: 'new Date(timestamp) → timestamp'
  },
  
  // Padrão 3: createdAt: new Date() sem updatedAt
  {
    find: /(createdAt:\s*Date\.now\(\)),(\s*}\))/g,
    replace: '$1,\n      updatedAt: Date.now()$2',
    name: 'Adicionar updatedAt após createdAt'
  },
  
  // Padrão 4: Converter Date.toISOString() para new Date().toISOString()
  {
    find: /Date\.now\(\)\.toISOString\(\)/g,
    replace: 'new Date().toISOString()',
    name: 'Date.now().toISOString() → new Date().toISOString()'
  },
  
  // Padrão 5: expiresAt com Date
  {
    find: /expiresAt:\s*new Date\(Date\.now\(\) \+ ([^)]+)\)/g,
    replace: 'expiresAt: Date.now() + $1',
    name: 'expiresAt: new Date(Date.now() + X) → Date.now() + X'
  },
];

function processFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;
    let fileChanges = 0;
    
    for (const { find, replace, name } of patterns) {
      const before = content;
      content = content.replace(find, replace);
      
      if (content !== before) {
        const matches = before.match(find);
        fileChanges += matches ? matches.length : 0;
        modified = true;
      }
    }
    
    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      totalFiles++;
      totalChanges += fileChanges;
      console.log(`✅ ${filePath.replace('/home/ubuntu/impact7-platform-permanent/', '')} (${fileChanges} mudanças)`);
    }
  } catch (error) {
    // Ignorar erros
  }
}

function walkDirectory(dir) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorar node_modules, .git, etc
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDirectory(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      processFile(filePath);
    }
  }
}

// Processar server/ e client/src/
console.log('📂 Processando server/...\n');
walkDirectory('server');

console.log('\n📂 Processando client/src/...\n');
walkDirectory('client/src');

console.log(`\n✅ CONCLUÍDO!`);
console.log(`   Arquivos modificados: ${totalFiles}`);
console.log(`   Total de mudanças: ${totalChanges}`);
console.log(`\n⏳ Aguarde recompilação TypeScript para verificar redução de erros...`);
