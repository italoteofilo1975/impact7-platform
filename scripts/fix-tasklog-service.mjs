import { readFileSync, writeFileSync } from 'fs';

const filePath = 'server/services/set7/tasklog-service.ts';
let content = readFileSync(filePath, 'utf-8');

// Fix toISOString on number (lines 457-459)
// Replace timestamp.toISOString() with new Date(timestamp).toISOString()
content = content.replace(
  /(\w+)\.toISOString\(\)/g,
  (match, varName) => {
    // Only replace if it's a timestamp field (not already a Date)
    if (varName.includes('timestamp') || varName.includes('At') || varName.includes('Time')) {
      return `new Date(${varName}).toISOString()`;
    }
    return match;
  }
);

writeFileSync(filePath, content, 'utf-8');
console.log('✅ Fixed tasklog-service.ts - converted toISOString() calls');
