#!/usr/bin/env node

/**
 * Script de Refatoração Completa TypeScript
 * Elimina 412 erros TypeScript focando em conversão Date ↔ number
 * 
 * Rodada 16 - Refatoração Sistemática
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
 * Padrões de refatoração Date → number
 */
const patterns = [
  // Padrão 1: new Date() em assignments de timestamps
  {
    name: 'new Date() → Date.now() em assignments',
    regex: /(\w+At|timestamp|createdAt|updatedAt|lastSignedIn|deliveredAt|nextRetryAt|confirmedAt|unsubscribedAt|downloadedAt|lastEmailSentAt|startedAt|completedAt|expiresAt|sentAt|readAt|publishedAt|scheduledAt|registeredAt|enrolledAt|lastActivityAt|lastLoginAt|verifiedAt|approvedAt|rejectedAt|canceledAt|refundedAt|paidAt):\s*new Date\(\)/g,
    replacement: '$1: Date.now()'
  },
  
  // Padrão 2: new Date() em objetos de insert/update
  {
    name: 'new Date() → Date.now() em insert/update objects',
    regex: /{\s*(\w+At|timestamp):\s*new Date\(\)\s*}/g,
    replacement: '{ $1: Date.now() }'
  },
  
  // Padrão 3: new Date() em comparações SQL (eq, gt, lt, gte, lte)
  {
    name: 'new Date() → Date.now() em SQL comparisons',
    regex: /(eq|gt|lt|gte|lte|between)\(([^,]+),\s*new Date\(\)/g,
    replacement: '$1($2, Date.now()'
  },
  
  // Padrão 4: Date.getTime() desnecessário (já é number)
  {
    name: 'Remover .getTime() redundante',
    regex: /Date\.now\(\)\.getTime\(\)/g,
    replacement: 'Date.now()'
  },
  
  // Padrão 5: new Date().getTime() → Date.now()
  {
    name: 'new Date().getTime() → Date.now()',
    regex: /new Date\(\)\.getTime\(\)/g,
    replacement: 'Date.now()'
  },
  
  // Padrão 6: Conversão de Date para timestamp em updates
  {
    name: 'someDate.getTime() em updates',
    regex: /(\w+At|timestamp):\s*(\w+)\.getTime\(\)/g,
    replacement: '$1: $2'
  },
  
  // Padrão 7: Date em set() do Drizzle
  {
    name: 'Date em .set() → timestamp',
    regex: /\.set\(\{([^}]*new Date\(\)[^}]*)\}\)/g,
    replacement: (match, content) => {
      const fixed = content.replace(/new Date\(\)/g, 'Date.now()');
      return `.set({${fixed}})`;
    }
  },
  
  // Padrão 8: Date em values() do Drizzle
  {
    name: 'Date em .values() → timestamp',
    regex: /\.values\(\{([^}]*new Date\(\)[^}]*)\}\)/g,
    replacement: (match, content) => {
      const fixed = content.replace(/new Date\(\)/g, 'Date.now()');
      return `.values({${fixed}})`;
    }
  },
  
  // Padrão 9: Comparações diretas com Date
  {
    name: 'Comparações Date > Date → timestamp > timestamp',
    regex: /new Date\(\)\s*([><=]+)\s*new Date\(/g,
    replacement: 'Date.now() $1 Date.now('
  },
  
  // Padrão 10: Date em arrays/objetos literais
  {
    name: 'Date em arrays → timestamp',
    regex: /\[\s*new Date\(\)/g,
    replacement: '[Date.now()'
  }
];

/**
 * Processa um arquivo aplicando todos os padrões
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileChanges = 0;
    
    // Aplicar todos os padrões
    patterns.forEach(pattern => {
      const before = content;
      if (typeof pattern.replacement === 'function') {
        content = content.replace(pattern.regex, pattern.replacement);
      } else {
        content = content.replace(pattern.regex, pattern.replacement);
      }
      
      if (content !== before) {
        const matches = (before.match(pattern.regex) || []).length;
        fileChanges += matches;
        console.log(`  ✓ ${pattern.name}: ${matches} correções`);
      }
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
        entry.name === 'build' || entry.name === 'coverage') {
      continue;
    }
    
    if (entry.isDirectory()) {
      processDirectory(fullPath, extensions);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        processFile(fullPath);
      }
    }
  }
}

/**
 * Main execution
 */
console.log('🚀 Iniciando Refatoração Completa TypeScript...\n');
console.log('📋 Padrões de refatoração:');
patterns.forEach((p, i) => console.log(`   ${i + 1}. ${p.name}`));
console.log('\n');

// Processar diretórios principais
console.log('📁 Processando server/...');
processDirectory(path.join(rootDir, 'server'));

console.log('\n📁 Processando client/src/...');
processDirectory(path.join(rootDir, 'client', 'src'));

console.log('\n📁 Processando drizzle/...');
processDirectory(path.join(rootDir, 'drizzle'));

// Relatório final
console.log('\n' + '='.repeat(60));
console.log('✅ REFATORAÇÃO COMPLETA!');
console.log('='.repeat(60));
console.log(`📊 Arquivos modificados: ${filesModified}`);
console.log(`🔧 Total de mudanças: ${totalChanges}`);
console.log('\n🎯 Próximos passos:');
console.log('   1. Executar: pnpm tsc --noEmit');
console.log('   2. Verificar redução de erros');
console.log('   3. Testar homepage e funcionalidades');
console.log('   4. Salvar checkpoint');
console.log('='.repeat(60));
