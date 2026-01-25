#!/usr/bin/env node

/**
 * Script para Adicionar Timestamps Faltantes
 * Adiciona createdAt: Date.now() em todos os db.insert().values() que não têm
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
 * Processa um arquivo adicionando createdAt onde necessário
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileChanges = 0;
    
    // Padrão: db.insert(table).values({ ... }) sem createdAt
    // Procurar por .values({ que não contém createdAt
    const valuesRegex = /\.values\(\{([^}]*)\}\)/g;
    
    content = content.replace(valuesRegex, (match, innerContent) => {
      // Se já tem createdAt, não mexer
      if (innerContent.includes('createdAt:')) {
        return match;
      }
      
      // Se já tem updatedAt, não mexer (pode ser um update)
      if (innerContent.includes('updatedAt:')) {
        return match;
      }
      
      // Se está vazio ou só tem espaços, não mexer
      if (innerContent.trim() === '') {
        return match;
      }
      
      // Adicionar createdAt
      fileChanges++;
      const trimmed = innerContent.trim();
      const needsComma = trimmed.length > 0 && !trimmed.endsWith(',');
      return `.values({${innerContent}${needsComma ? ',' : ''}\n          createdAt: Date.now(),\n        })`;
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
        entry.name === 'schema.ts') { // Não mexer no schema
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
console.log('🚀 Iniciando Adição de Timestamps Faltantes...\n');

// Processar apenas server (frontend não faz inserts)
console.log('📁 Processando server/...');
processDirectory(path.join(rootDir, 'server'));

// Relatório final
console.log('\n' + '='.repeat(60));
console.log('✅ TIMESTAMPS ADICIONADOS!');
console.log('='.repeat(60));
console.log(`📊 Arquivos modificados: ${filesModified}`);
console.log(`🔧 Total de mudanças: ${totalChanges}`);
console.log('\n🎯 Próximos passos:');
console.log('   1. Executar: pnpm tsc --noEmit');
console.log('   2. Verificar redução de erros TS2769');
console.log('='.repeat(60));
