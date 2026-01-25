#!/usr/bin/env node
/**
 * Script para corrigir tipos de timestamp no schema Drizzle
 * Converte todos os campos int() de timestamp para usar .$type<number>() explicitamente
 */

import fs from 'fs';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'drizzle/schema.ts');

console.log('🔧 Corrigindo tipos de timestamp no schema Drizzle...\n');

// Ler schema atual
let schema = fs.readFileSync(schemaPath, 'utf8');

// Padrões para identificar campos de timestamp
const timestampPatterns = [
  /int\("createdAt"\)\.notNull\(\)/g,
  /int\("updatedAt"\)\.notNull\(\)/g,
  /int\("deletedAt"\)/g,
  /int\("lastLoginAt"\)/g,
  /int\("expiresAt"\)/g,
  /int\("validUntil"\)/g,
  /int\("startDate"\)/g,
  /int\("endDate"\)/g,
  /int\("completedAt"\)/g,
  /int\("approvedAt"\)/g,
  /int\("rejectedAt"\)/g,
  /int\("publishedAt"\)/g,
  /int\("deliveredAt"\)/g,
  /int\("sentAt"\)/g,
  /int\("openedAt"\)/g,
  /int\("clickedAt"\)/g,
  /int\("timestamp"\)/g,
  /int\("date"\)\.notNull\(\)/g,
];

let replacements = 0;

// Aplicar correções
timestampPatterns.forEach(pattern => {
  const matches = schema.match(pattern);
  if (matches) {
    replacements += matches.length;
    // Adicionar .$type<number>() explicitamente
    schema = schema.replace(pattern, (match) => {
      return match.replace(')', ').$type<number>()');
    });
  }
});

// Salvar schema corrigido
fs.writeFileSync(schemaPath, schema, 'utf8');

console.log(`✅ ${replacements} campos de timestamp corrigidos`);
console.log(`📄 Schema atualizado: ${schemaPath}\n`);
console.log('⚠️  Execute "pnpm db:push" para sincronizar com o banco');
