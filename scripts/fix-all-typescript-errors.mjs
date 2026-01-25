#!/usr/bin/env node
/**
 * Script de Refatoração Automática - Drizzle Schema
 * 
 * Corrige automaticamente 520+ erros TypeScript no schema.ts
 */

import fs from 'fs';

const SCHEMA_PATH = '/home/ubuntu/impact7-platform-permanent/drizzle/schema.ts';

console.log('🔧 Iniciando refatoração automática do schema Drizzle...\n');

let content = fs.readFileSync(SCHEMA_PATH, 'utf-8');
let changeCount = 0;

// 1. Corrigir text("field", [...]) → text("field")
// Exemplo: text("partnerType", ["strategic", "technology"]) → text("partnerType")
const textArrayPattern = /text\("([^"]+)",\s*\[[^\]]+\]\)/g;
const textMatches = [...content.matchAll(textArrayPattern)];
console.log(`📝 Encontrados ${textMatches.length} campos text() com arrays`);
content = content.replace(textArrayPattern, 'text("$1")');
changeCount += textMatches.length;

// 2. Corrigir .default(true) → .default(1)
const defaultTruePattern = /\.default\(true\)/g;
const trueMatches = [...content.matchAll(defaultTruePattern)];
console.log(`✅ Encontrados ${trueMatches.length} .default(true)`);
content = content.replace(defaultTruePattern, '.default(1)');
changeCount += trueMatches.length;

// 3. Corrigir .default(false) → .default(0)
const defaultFalsePattern = /\.default\(false\)/g;
const falseMatches = [...content.matchAll(defaultFalsePattern)];
console.log(`❌ Encontrados ${falseMatches.length} .default(false)`);
content = content.replace(defaultFalsePattern, '.default(0)');
changeCount += falseMatches.length;

// 4. Corrigir int("field", ...) com argumentos extras → int("field")
const intExtraArgsPattern = /int\("([^"]+)",\s*[^)]+\)/g;
const intMatches = [...content.matchAll(intExtraArgsPattern)];
if (intMatches.length > 0) {
  console.log(`🔧 Encontrados ${intMatches.length} int() com argumentos extras`);
  content = content.replace(intExtraArgsPattern, 'int("$1")');
  changeCount += intMatches.length;
}

// Salvar arquivo corrigido
fs.writeFileSync(SCHEMA_PATH, content, 'utf-8');

console.log(`\n✅ Refatoração concluída!`);
console.log(`📊 Total de correções aplicadas: ${changeCount}`);
console.log(`📁 Arquivo atualizado: ${SCHEMA_PATH}\n`);
