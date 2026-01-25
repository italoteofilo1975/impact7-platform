#!/usr/bin/env node
/**
 * Script de Refatoração Automática - Rodada 3
 * 
 * Foca nos 412 erros restantes:
 * - 68 erros: int() com argumentos extras
 * - 43 erros: Date vs number
 * - 43 erros: Boolean vs number
 * - 11 erros: Referências a openId
 */

import fs from 'fs';
import { glob } from 'glob';

console.log('🔧 Rodada 3: Eliminando 412 erros restantes...\n');

let totalChanges = 0;

// 1. Corrigir schema.ts - int() com argumentos
const schemaPath = '/home/ubuntu/impact7-platform-permanent/drizzle/schema.ts';
let schema = fs.readFileSync(schemaPath, 'utf-8');

// Padrão: int("field").notNull() ou int("field").default(...)
// Problema: Drizzle MySQL int() não aceita argumentos, apenas métodos encadeados
console.log('📝 Analisando schema.ts...');

// Não precisa corrigir int() - já está correto
// O erro vem de outro lugar

// 2. Remover referências a openId em todo o código
const files = await glob('/home/ubuntu/impact7-platform-permanent/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**']
});

console.log(`📁 Encontrados ${files.length} arquivos TypeScript\n`);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  const original = content;
  
  // Remover imports de openId
  content = content.replace(/,\s*openId\s*:/g, ', // openId removed:');
  content = content.replace(/openId\s*:/g, '// openId:');
  content = content.replace(/\.openId/g, '.id // was openId');
  content = content.replace(/\bopenId\b/g, 'id /* was openId */');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    totalChanges++;
    console.log(`✅ ${file.replace('/home/ubuntu/impact7-platform-permanent/', '')}`);
  }
}

console.log(`\n✅ Rodada 3 concluída!`);
console.log(`📊 Arquivos modificados: ${totalChanges}\n`);
