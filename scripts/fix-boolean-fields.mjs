#!/usr/bin/env node

/**
 * Script Completo: Conversão Boolean → Int
 * 
 * Parte 1: Adiciona .$type<boolean>() nos campos int que representam boolean no schema
 * Parte 2: Converte true/false → 1/0 nas queries Drizzle
 * 
 * Objetivo: Eliminar 143 erros TS2769 (No overload matches)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

let totalChanges = 0;
let filesModified = 0;

/**
 * Lista de campos que representam boolean (armazenados como int 0/1)
 */
const booleanFields = [
  'isActive',
  'isRead',
  'isFeatured',
  'welcomeEmailSent',
  'unsubscribed',
  'emailSent',
  'isVerified',
  'isApproved',
  'isPublished',
  'enabled',
  'disabled',
  'isOpen',
  'isClosed',
  'isDeleted',
  'isArchived',
  'isPinned',
  'isLocked',
  'isHidden',
  'isPublic',
  'isPrivate'
];

/**
 * PARTE 1: Adicionar .$type<boolean>() no schema.ts
 */
function fixSchemaFile() {
  const schemaPath = path.join(rootDir, 'drizzle', 'schema.ts');
  let content = fs.readFileSync(schemaPath, 'utf8');
  let originalContent = content;
  let changes = 0;
  
  console.log('\n📋 PARTE 1: Convertendo schema.ts\n');
  
  // Para cada campo boolean, adicionar .$type<boolean>() se não tiver
  booleanFields.forEach(fieldName => {
    // Padrão: int("fieldName").default(0|1).notNull() SEM .$type<boolean>()
    const regex = new RegExp(
      `(${fieldName}:\\s*int\\("${fieldName}"\\))((?!\\$type).*?)(\\.(default\\([01]\\)|notNull\\(\\)))`,
      'g'
    );
    
    const before = content;
    content = content.replace(regex, (match, prefix, middle, suffix) => {
      // Se já tem .$type, não mexer
      if (middle.includes('.$type')) {
        return match;
      }
      changes++;
      return `${prefix}.$type<boolean>()${middle}${suffix}`;
    });
    
    if (content !== before) {
      const fieldChanges = (before.match(regex) || []).length;
      console.log(`  ✓ ${fieldName}: ${fieldChanges} ocorrências`);
    }
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(schemaPath, content, 'utf8');
    console.log(`\n✅ schema.ts modificado: ${changes} campos convertidos\n`);
    return changes;
  } else {
    console.log(`\n⚠️  Nenhuma mudança necessária no schema.ts\n`);
    return 0;
  }
}

/**
 * PARTE 2: Converter true/false → 1/0 nas queries
 */
function fixQueriesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileChanges = 0;
    
    // Padrão 1: eq(table.booleanField, true) → eq(table.booleanField, 1)
    booleanFields.forEach(fieldName => {
      // eq(*.fieldName, true)
      const regexTrue = new RegExp(
        `eq\\(([\\w.]+\\.${fieldName}),\\s*true\\)`,
        'g'
      );
      content = content.replace(regexTrue, (match, field) => {
        fileChanges++;
        return `eq(${field}, 1)`;
      });
      
      // eq(*.fieldName, false)
      const regexFalse = new RegExp(
        `eq\\(([\\w.]+\\.${fieldName}),\\s*false\\)`,
        'g'
      );
      content = content.replace(regexFalse, (match, field) => {
        fileChanges++;
        return `eq(${field}, 0)`;
      });
    });
    
    // Padrão 2: { booleanField: true } → { booleanField: 1 } em .values() e .set()
    booleanFields.forEach(fieldName => {
      // { fieldName: true }
      const regexObjTrue = new RegExp(
        `(${fieldName}):\\s*true([,\\s}])`,
        'g'
      );
      content = content.replace(regexObjTrue, (match, field, after) => {
        fileChanges++;
        return `${field}: 1${after}`;
      });
      
      // { fieldName: false }
      const regexObjFalse = new RegExp(
        `(${fieldName}):\\s*false([,\\s}])`,
        'g'
      );
      content = content.replace(regexObjFalse, (match, field, after) => {
        fileChanges++;
        return `${field}: 0${after}`;
      });
    });
    
    // Padrão 3: Conversões condicionais (field ? true : false → field ? 1 : 0)
    booleanFields.forEach(fieldName => {
      // condition ? true : false
      const regexTernary = new RegExp(
        `(${fieldName}:\\s*[^?]+\\?)\\s*true\\s*:\\s*false`,
        'g'
      );
      content = content.replace(regexTernary, (match, prefix) => {
        fileChanges++;
        return `${prefix} 1 : 0`;
      });
    });
    
    // Salvar se houve mudanças
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      totalChanges += fileChanges;
      console.log(`✅ ${path.relative(rootDir, filePath)} - ${fileChanges} mudanças`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Processa todos os arquivos TypeScript em um diretório
 */
function processDirectory(dirPath, extensions = ['.ts', '.tsx']) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    // Ignorar node_modules, .git, dist, etc
    if (entry.name === 'node_modules' || entry.name === '.git' || 
        entry.name === 'dist' || entry.name === '.vite' ||
        entry.name === 'build' || entry.name === 'coverage' ||
        entry.name === 'schema.ts') { // Schema já foi processado
      continue;
    }
    
    if (entry.isDirectory()) {
      processDirectory(fullPath, extensions);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        fixQueriesInFile(fullPath);
      }
    }
  }
}

/**
 * Main execution
 */
console.log('🚀 Iniciando Conversão Boolean → Int...\n');
console.log('📋 Campos boolean identificados:', booleanFields.length);
console.log('   ', booleanFields.join(', '));

// PARTE 1: Converter schema.ts
const schemaChanges = fixSchemaFile();

// PARTE 2: Converter queries
console.log('📋 PARTE 2: Convertendo queries (true/false → 1/0)\n');
console.log('📁 Processando server/...');
processDirectory(path.join(rootDir, 'server'));

console.log('\n📁 Processando client/src/...');
processDirectory(path.join(rootDir, 'client', 'src'));

// Relatório final
console.log('\n' + '='.repeat(60));
console.log('✅ CONVERSÃO BOOLEAN → INT COMPLETA!');
console.log('='.repeat(60));
console.log(`📊 Schema: ${schemaChanges} campos convertidos`);
console.log(`📊 Queries: ${filesModified} arquivos modificados`);
console.log(`🔧 Total de mudanças em queries: ${totalChanges}`);
console.log(`🔧 Total geral: ${schemaChanges + totalChanges} mudanças`);
console.log('\n🎯 Próximos passos:');
console.log('   1. Executar: pnpm tsc --noEmit');
console.log('   2. Verificar redução de erros TS2769');
console.log('   3. Testar funcionalidades');
console.log('   4. Salvar checkpoint v2.2.0');
console.log('='.repeat(60));
