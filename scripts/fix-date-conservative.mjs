#!/usr/bin/env node

/**
 * Script conservador para converter new Date() → Date.now()
 * Foca APENAS em conversões simples sem adicionar campos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Arquivos críticos para corrigir
const targetFiles = [
  'server/routers.ts',
  'server/services/webhooks/webhook-service.ts',
  'server/db.ts',
];

let totalChanges = 0;
let filesModified = 0;

function fixFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipping ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let changes = 0;

  // Padrão 1: new Date() em assignments simples
  // createdAt: new Date() → createdAt: Date.now()
  content = content.replace(
    /(\w+):\s*new Date\(\)/g,
    (match, fieldName) => {
      changes++;
      return `${fieldName}: Date.now()`;
    }
  );

  // Padrão 2: new Date().getTime() → Date.now()
  const pattern2 = /new Date\(\)\.getTime\(\)/g;
  const matches2 = content.match(pattern2);
  if (matches2) {
    content = content.replace(pattern2, 'Date.now()');
    changes += matches2.length;
  }

  // Padrão 3: new Date(timestamp) onde timestamp é number → timestamp direto
  // Mas APENAS se for óbvio que é number (ex: Date.now(), timestamp, etc)
  content = content.replace(
    /new Date\((Date\.now\(\)|timestamp|now)\)/g,
    (match, inner) => {
      changes++;
      return inner;
    }
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    filesModified++;
    totalChanges += changes;
    console.log(`✅ ${filePath}: ${changes} mudanças`);
  } else {
    console.log(`⏭️  ${filePath}: sem mudanças`);
  }
}

console.log('🔧 Iniciando correção conservadora Date → number...\n');

targetFiles.forEach(fixFile);

console.log(`\n✅ Script concluído!`);
console.log(`📁 Arquivos modificados: ${filesModified}`);
console.log(`🔄 Total de mudanças: ${totalChanges}`);
