#!/usr/bin/env node
/**
 * Script para corrigir erros TypeScript em two-factor-auth-service.ts
 * Foca em conversões boolean↔number
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const filePath = path.join(projectRoot, 'server/services/two-factor-auth-service.ts');

console.log('🔧 Iniciando correção de two-factor-auth-service.ts...\n');

let content = fs.readFileSync(filePath, 'utf8');
const originalContent = content;
let changes = 0;

// Correção 1: Literal false → 0
content = content.replace(
  /twoFactorEnabled: false,/g,
  'twoFactorEnabled: 0,'
);
if (content !== originalContent) {
  changes++;
  console.log('✅ Correção 1: twoFactorEnabled: false → 0');
}

// Correção 2: Literal true → 1
content = content.replace(
  /twoFactorEnabled: true,/g,
  'twoFactorEnabled: 1,'
);
if (content.includes('twoFactorEnabled: 1,')) {
  changes++;
  console.log('✅ Correção 2: twoFactorEnabled: true → 1');
}

// Correção 3: Return boolean conversions (number → boolean)
// Padrão: return user.twoFactorEnabled; → return user.twoFactorEnabled === 1;
content = content.replace(
  /return user\.twoFactorEnabled;/g,
  'return user.twoFactorEnabled === 1;'
);

content = content.replace(
  /return config\.twoFactorEnabled;/g,
  'return config.twoFactorEnabled === 1;'
);

content = content.replace(
  /twoFactorEnabled: user\.twoFactorEnabled,/g,
  'twoFactorEnabled: user.twoFactorEnabled === 1,'
);

// Correção 4: Conversão de timestamp para Date em returns
// lastLoginAt: user.lastLoginAt → lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null
content = content.replace(
  /lastLoginAt: user\.lastLoginAt,/g,
  'lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,'
);

content = content.replace(
  /twoFactorEnabledAt: user\.twoFactorEnabledAt,/g,
  'twoFactorEnabledAt: user.twoFactorEnabledAt ? new Date(user.twoFactorEnabledAt) : null,'
);

console.log('✅ Correções de conversão boolean↔number aplicadas');

// Salvar arquivo
if (content !== originalContent) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n✨ Total: ${changes}+ tipos de correções aplicadas`);
  console.log('📊 Execute "pnpm tsc --noEmit" para verificar erros restantes');
} else {
  console.log('⏭️  Nenhuma mudança necessária');
}
