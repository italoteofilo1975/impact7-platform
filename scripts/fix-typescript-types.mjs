#!/usr/bin/env node

/**
 * Script Avançado de Refatoração TypeScript
 * Corrige tipos de retorno, interfaces e definições de tipos
 * 
 * Foco: Date → number em tipos, interfaces e retornos de funções
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
 * Padrões de refatoração de tipos
 */
const typePatterns = [
  // Padrão 1: Tipos em interfaces e types
  {
    name: 'createdAt: Date → createdAt: number em interfaces',
    regex: /(createdAt|updatedAt|lastSignedIn|deliveredAt|nextRetryAt|confirmedAt|unsubscribedAt|downloadedAt|lastEmailSentAt|startedAt|completedAt|expiresAt|sentAt|readAt|publishedAt|scheduledAt|registeredAt|enrolledAt|lastActivityAt|lastLoginAt|verifiedAt|approvedAt|rejectedAt|canceledAt|refundedAt|paidAt|timestamp):\s*Date([;\s,}])/g,
    replacement: '$1: number$2'
  },
  
  // Padrão 2: Tipos opcionais Date | null
  {
    name: 'field: Date | null → field: number | null',
    regex: /(createdAt|updatedAt|lastSignedIn|deliveredAt|nextRetryAt|confirmedAt|unsubscribedAt|downloadedAt|lastEmailSentAt|startedAt|completedAt|expiresAt|sentAt|readAt|publishedAt|scheduledAt|registeredAt|enrolledAt|lastActivityAt|lastLoginAt|verifiedAt|approvedAt|rejectedAt|canceledAt|refundedAt|paidAt|timestamp):\s*Date\s*\|\s*null/g,
    replacement: '$1: number | null'
  },
  
  // Padrão 3: Tipos opcionais Date | undefined
  {
    name: 'field: Date | undefined → field: number | undefined',
    regex: /(createdAt|updatedAt|lastSignedIn|deliveredAt|nextRetryAt|confirmedAt|unsubscribedAt|downloadedAt|lastEmailSentAt|startedAt|completedAt|expiresAt|sentAt|readAt|publishedAt|scheduledAt|registeredAt|enrolledAt|lastActivityAt|lastLoginAt|verifiedAt|approvedAt|rejectedAt|canceledAt|refundedAt|paidAt|timestamp):\s*Date\s*\|\s*undefined/g,
    replacement: '$1: number | undefined'
  },
  
  // Padrão 4: Tipos em Promise<Type>
  {
    name: 'Promise<{ ...createdAt: Date }> → Promise<{ ...createdAt: number }>',
    regex: /Promise<([^>]*)(createdAt|updatedAt|lastSignedIn|deliveredAt|nextRetryAt|confirmedAt|unsubscribedAt|downloadedAt|lastEmailSentAt|startedAt|completedAt|expiresAt|sentAt|readAt|publishedAt|scheduledAt|registeredAt|enrolledAt|lastActivityAt|lastLoginAt|verifiedAt|approvedAt|rejectedAt|canceledAt|refundedAt|paidAt|timestamp):\s*Date([^>]*)>/g,
    replacement: 'Promise<$1$2: number$3>'
  },
  
  // Padrão 5: Tipos em Array<Type>
  {
    name: 'Array<{ ...createdAt: Date }> → Array<{ ...createdAt: number }>',
    regex: /Array<([^>]*)(createdAt|updatedAt|lastSignedIn|deliveredAt|nextRetryAt|confirmedAt|unsubscribedAt|downloadedAt|lastEmailSentAt|startedAt|completedAt|expiresAt|sentAt|readAt|publishedAt|scheduledAt|registeredAt|enrolledAt|lastActivityAt|lastLoginAt|verifiedAt|approvedAt|rejectedAt|canceledAt|refundedAt|paidAt|timestamp):\s*Date([^>]*)>/g,
    replacement: 'Array<$1$2: number$3>'
  },
  
  // Padrão 6: Conversões de timestamp para Date no frontend
  {
    name: 'Adicionar new Date() ao exibir timestamps',
    regex: /(\{[^}]*)(createdAt|updatedAt|timestamp)(\}[^}]*toLocaleString\(\))/g,
    replacement: '$1new Date($2)$3'
  },
  
  // Padrão 7: Comparações SQL com Date
  {
    name: 'Corrigir comparações SQL (lte, gte com Date)',
    regex: /(lte|gte|lt|gt)\(([^,]+),\s*new Date\(\)/g,
    replacement: '$1($2, Date.now()'
  },
  
  // Padrão 8: Tipos em parâmetros de função
  {
    name: 'Parâmetros de função Date → number',
    regex: /\(([\w\s,]*)(createdAt|updatedAt|lastSignedIn|deliveredAt|nextRetryAt|confirmedAt|unsubscribedAt|downloadedAt|lastEmailSentAt|startedAt|completedAt|expiresAt|sentAt|readAt|publishedAt|scheduledAt|registeredAt|enrolledAt|lastActivityAt|lastLoginAt|verifiedAt|approvedAt|rejectedAt|canceledAt|refundedAt|paidAt|timestamp):\s*Date([\s,)])/g,
    replacement: '($1$2: number$3'
  },
  
  // Padrão 9: Retornos de função com Date
  {
    name: 'Retornos de função Date → number',
    regex: /:\s*Promise<([^>]*)(createdAt|updatedAt|lastSignedIn|deliveredAt|nextRetryAt|confirmedAt|unsubscribedAt|downloadedAt|lastEmailSentAt|startedAt|completedAt|expiresAt|sentAt|readAt|publishedAt|scheduledAt|registeredAt|enrolledAt|lastActivityAt|lastLoginAt|verifiedAt|approvedAt|rejectedAt|canceledAt|refundedAt|paidAt|timestamp):\s*Date([^>]*)>/g,
    replacement: ': Promise<$1$2: number$3>'
  },
  
  // Padrão 10: Objetos literais com Date
  {
    name: 'Objetos literais Date → number',
    regex: /\{([^}]*)(createdAt|updatedAt|lastSignedIn|deliveredAt|nextRetryAt|confirmedAt|unsubscribedAt|downloadedAt|lastEmailSentAt|startedAt|completedAt|expiresAt|sentAt|readAt|publishedAt|scheduledAt|registeredAt|enrolledAt|lastActivityAt|lastLoginAt|verifiedAt|approvedAt|rejectedAt|canceledAt|refundedAt|paidAt|timestamp):\s*Date([^}]*)\}/g,
    replacement: '{$1$2: number$3}'
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
    typePatterns.forEach(pattern => {
      const before = content;
      content = content.replace(pattern.regex, pattern.replacement);
      
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
console.log('🚀 Iniciando Refatoração Avançada de Tipos TypeScript...\n');
console.log('📋 Padrões de refatoração:');
typePatterns.forEach((p, i) => console.log(`   ${i + 1}. ${p.name}`));
console.log('\n');

// Processar diretórios principais
console.log('📁 Processando server/...');
processDirectory(path.join(rootDir, 'server'));

console.log('\n📁 Processando client/src/...');
processDirectory(path.join(rootDir, 'client', 'src'));

// Relatório final
console.log('\n' + '='.repeat(60));
console.log('✅ REFATORAÇÃO DE TIPOS COMPLETA!');
console.log('='.repeat(60));
console.log(`📊 Arquivos modificados: ${filesModified}`);
console.log(`🔧 Total de mudanças: ${totalChanges}`);
console.log('\n🎯 Próximos passos:');
console.log('   1. Executar: pnpm tsc --noEmit');
console.log('   2. Verificar redução de erros');
console.log('   3. Testar funcionalidades');
console.log('='.repeat(60));
