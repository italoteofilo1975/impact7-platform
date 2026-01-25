#!/usr/bin/env node
/**
 * Script para adicionar updatedAt: Date.now() em todos os inserts faltantes
 * Elimina ~100 erros TypeScript relacionados a "Property 'updatedAt' is missing"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

let totalFiles = 0;
let totalChanges = 0;

/**
 * Processa um arquivo TypeScript adicionando updatedAt onde faltante
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modified = content;
  let fileChanges = 0;

  // Padrão 1: .insert(table).values({ ... }) sem updatedAt
  // Captura: .insert(X).values({ campos })
  const insertPattern = /\.insert\((\w+)\)\.values\(\{([^}]+)\}\)/g;
  
  modified = modified.replace(insertPattern, (match, tableName, fields) => {
    // Verifica se já tem updatedAt
    if (fields.includes('updatedAt')) {
      return match;
    }
    
    // Verifica se já tem createdAt (indica que é um insert de dados)
    if (!fields.includes('createdAt')) {
      return match; // Pula se não tem createdAt (pode ser insert especial)
    }
    
    // Adiciona updatedAt antes do fechamento
    const newFields = fields.trim() + ',\n      updatedAt: Date.now()';
    fileChanges++;
    return `.insert(${tableName}).values({${newFields}})`;
  });

  // Padrão 2: Objetos literais em arrays de insert
  // Exemplo: [{ campo: valor, createdAt: ... }] → adiciona updatedAt
  const arrayInsertPattern = /\.insert\([^)]+\)\.values\(\[([^\]]+)\]\)/gs;
  
  modified = modified.replace(arrayInsertPattern, (match) => {
    if (match.includes('updatedAt')) {
      return match;
    }
    
    if (!match.includes('createdAt')) {
      return match;
    }
    
    // Adiciona updatedAt antes de cada fechamento de objeto
    const updated = match.replace(/(\s+)(createdAt:[^,\n]+)(,?\s*\})/g, (m, space, created, closing) => {
      fileChanges++;
      return `${space}${created},\n${space}updatedAt: Date.now()${closing}`;
    });
    
    return updated;
  });

  // Padrão 3: Objetos em variáveis antes de insert
  // Exemplo: const data = { campo: valor, createdAt: ... }; db.insert(table).values(data);
  const varPattern = /(const|let)\s+(\w+)\s*=\s*\{([^}]+createdAt[^}]+)\}/g;
  
  modified = modified.replace(varPattern, (match, keyword, varName, fields) => {
    if (fields.includes('updatedAt')) {
      return match;
    }
    
    // Adiciona updatedAt após createdAt
    const updated = fields.replace(/(createdAt:[^,\n]+)(,?)/, (m, created, comma) => {
      fileChanges++;
      return `${created},\n    updatedAt: Date.now()`;
    });
    
    return `${keyword} ${varName} = {${updated}}`;
  });

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, modified, 'utf-8');
    totalFiles++;
    totalChanges += fileChanges;
    console.log(`✅ ${path.relative(projectRoot, filePath)}: ${fileChanges} mudanças`);
  }
}

/**
 * Processa recursivamente todos os arquivos .ts em um diretório
 */
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Pula node_modules, dist, build
      if (['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
        continue;
      }
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
      processFile(fullPath);
    }
  }
}

console.log('🔧 Adicionando updatedAt em inserts faltantes...\n');

// Processa diretório server/
const serverDir = path.join(projectRoot, 'server');
if (fs.existsSync(serverDir)) {
  processDirectory(serverDir);
}

console.log(`\n✅ Concluído!`);
console.log(`📁 Arquivos modificados: ${totalFiles}`);
console.log(`🔄 Total de mudanças: ${totalChanges}`);
