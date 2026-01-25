#!/usr/bin/env node
/**
 * Script de Refatoração Automática - Rodada 2
 * 
 * Corrige erros restantes após primeira rodada
 */

import fs from 'fs';

const SCHEMA_PATH = '/home/ubuntu/impact7-platform-permanent/drizzle/schema.ts';

console.log('🔧 Rodada 2: Corrigindo erros restantes...\n');

let content = fs.readFileSync(SCHEMA_PATH, 'utf-8');
let changeCount = 0;

// 1. Remover import de 'blob' que não existe
if (content.includes(', blob,')) {
  console.log('📝 Removendo import de blob');
  content = content.replace(', blob,', ',');
  changeCount++;
}

// 2. Corrigir timestamp("field") → int("field")
// O erro "Expected 0 arguments" vem de timestamp() sendo usado incorretamente
const timestampPattern = /timestamp\("([^"]+)"\)/g;
const timestampMatches = [...content.matchAll(timestampPattern)];
if (timestampMatches.length > 0) {
  console.log(`⏰ Encontrados ${timestampMatches.length} timestamp() que devem ser int()`);
  content = content.replace(timestampPattern, 'int("$1")');
  changeCount += timestampMatches.length;
}

// Salvar
fs.writeFileSync(SCHEMA_PATH, content, 'utf-8');

console.log(`\n✅ Rodada 2 concluída!`);
console.log(`📊 Total de correções: ${changeCount}\n`);
