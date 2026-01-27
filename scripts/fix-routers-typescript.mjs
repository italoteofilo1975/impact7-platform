#!/usr/bin/env node
/**
 * Script para corrigir erros TypeScript em routers.ts
 * Foca em conversões Date vs number e métodos incorretos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const filePath = path.join(projectRoot, 'server/routers.ts');

console.log('🔧 Iniciando correção de routers.ts...\n');

let content = fs.readFileSync(filePath, 'utf8');
const originalContent = content;
let changes = 0;

// Correção 1: now = Date.now() → now = new Date()
// Linha 314: const now = Date.now(); deve ser const now = new Date();
content = content.replace(
  /const now = Date\.now\(\);/g,
  'const now = new Date();'
);
if (content !== originalContent) {
  changes++;
  console.log('✅ Correção 1: const now = Date.now() → const now = new Date()');
}

// Correção 2: new Date(l.createdAt) onde createdAt é number (timestamp)
// Manter new Date() para conversão de timestamp para Date object
// Não precisa mudar, está correto

// Correção 3: Operador >= com Date e number
// Linha 337: created >= date (Date >= Date) está correto
// Linha 344, 348: created >= date (Date >= Date) está correto
// Não precisa mudar

// Correção 4: Type 'number | Date' is not assignable to type 'Date'
// Linha 2063, 2272, 3007: variáveis que são number mas deveriam ser Date
// Buscar padrão: variável = timestamp mas tipo esperado é Date

// Correção 5: Property 'openId' does not exist
// Linha 2435: ctx.user.openId deve ser removido ou usar campo correto
content = content.replace(
  /ctx\.user\.openId/g,
  'ctx.user.id.toString()'
);
if (content.includes('ctx.user.id.toString()')) {
  changes++;
  console.log('✅ Correção 5: ctx.user.openId → ctx.user.id.toString()');
}

// Correção 6: boolean vs number em notificationPreferences
// Linha 2495: { infoEnabled?: boolean } deve ser { infoEnabled?: number }
// Buscar padrão de update com boolean e converter para number
const booleanUpdatePattern = /(infoEnabled|successEnabled|warningEnabled|errorEnabled|casePendingEnabled|caseApprovedEnabled|caseRejectedEnabled|leadNewEnabled|leadConvertedEnabled|emailEnabled|smsEnabled|pushEnabled):\s*(input\.\w+)/g;

let match;
const matches = [];
while ((match = booleanUpdatePattern.exec(content)) !== null) {
  matches.push(match);
}

// Aplicar conversão toBoolean em cada campo boolean
matches.forEach(m => {
  const field = m[1];
  const value = m[2];
  const oldPattern = `${field}: ${value}`;
  const newPattern = `${field}: ${value} !== undefined ? (${value} ? 1 : 0) : undefined`;
  
  // Só aplicar se ainda não foi convertido
  if (content.includes(oldPattern) && !content.includes(newPattern)) {
    content = content.replace(oldPattern, newPattern);
    changes++;
  }
});

if (matches.length > 0) {
  console.log(`✅ Correção 6: ${matches.length} campos boolean → number convertidos`);
}

// Correção 7: Property 'complianceService' does not exist
// Linha 3735, 3760: complianceService não existe, remover ou comentar
content = content.replace(
  /const complianceData = await compliance\.complianceService\(\);/g,
  '// const complianceData = await compliance.complianceService(); // TODO: Implementar'
);
if (content.includes('// TODO: Implementar')) {
  changes++;
  console.log('✅ Correção 7: complianceService comentado (não implementado)');
}

// Correção 8: Property 'details' does not exist in type 'AuditLogEntry'
// Linha 3747, 3772: remover campo 'details'
content = content.replace(
  /details: `.*?`,\s*\n/g,
  ''
);

// Correção 9: .toISOString() em number
// Linha 3750: timestamp.toISOString() deve ser new Date(timestamp).toISOString()
content = content.replace(
  /(\w+)\.toISOString\(\)/g,
  (match, varName) => {
    // Se a variável é claramente um timestamp (number), converter
    if (varName.includes('At') || varName === 'timestamp' || varName === 'date') {
      return `new Date(${varName}).toISOString()`;
    }
    return match;
  }
);

// Correção 10: Cannot find name 'roles' e 'permissions'
// Linha 3977, 3987: importar ou definir roles e permissions
// Verificar se já existe import
if (!content.includes('import { roles, permissions }')) {
  // Adicionar import após outros imports do schema
  content = content.replace(
    /(import \{[^}]+\} from ['"]\.\.\/drizzle\/schema['"];)/,
    '$1\nimport { roles, permissions } from "../drizzle/schema";'
  );
  changes++;
  console.log('✅ Correção 10: Adicionado import de roles e permissions');
}

// Salvar arquivo
if (content !== originalContent) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n✨ Total: ${changes} tipos de correções aplicadas em routers.ts`);
  console.log('📊 Execute "pnpm tsc --noEmit" para verificar erros restantes');
} else {
  console.log('⏭️  Nenhuma mudança necessária');
}
