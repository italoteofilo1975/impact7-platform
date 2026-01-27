import { readFileSync, writeFileSync } from 'fs';

const files = [
  'server/services/set7/roi-tracking-service.ts',
  'server/services/oauth/oauth-service.ts',
  'server/services/gamification/gamification-service.ts',
  'server/services/backup-service.ts',
  'server/services/audit-log-service.ts',
  'server/services/analytics/conversion-service.ts',
  'server/db.ts'
];

let totalReplacements = 0;

files.forEach(filePath => {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let replacements = 0;
    
    // Fix 1: Convert new Date() to Date.now() in comparisons and assignments
    const dateNowPattern = /(\w+)\s*=\s*new Date\(\)/g;
    const matches = content.match(dateNowPattern);
    if (matches) {
      content = content.replace(dateNowPattern, '$1 = Date.now()');
      replacements += matches.length;
    }
    
    // Fix 2: Convert .getTime() calls on Date.now() (redundant)
    const redundantGetTime = /Date\.now\(\)\.getTime\(\)/g;
    const getTimeMatches = content.match(redundantGetTime);
    if (getTimeMatches) {
      content = content.replace(redundantGetTime, 'Date.now()');
      replacements += getTimeMatches.length;
    }
    
    // Fix 3: Convert boolean literals to numbers in database operations
    // Look for patterns like: isActive: true, or enabled: false,
    const boolInDbPattern = /(\s+)(isActive|enabled|isEnabled|verified|isVerified|active):\s*(true|false),/g;
    const boolMatches = content.match(boolInDbPattern);
    if (boolMatches) {
      content = content.replace(boolInDbPattern, (match, space, field, value) => {
        const numValue = value === 'true' ? '1' : '0';
        return `${space}${field}: ${numValue},`;
      });
      replacements += boolMatches.length;
    }
    
    // Fix 4: Convert Date comparisons in gte/lte
    const gtePattern = /gte\(([^,]+),\s*(\w+)\)/g;
    content = content.replace(gtePattern, (match, field, dateVar) => {
      // Check if dateVar looks like a Date variable (startDate, endDate, etc.)
      if (dateVar.toLowerCase().includes('date') || dateVar.toLowerCase().includes('time')) {
        return `gte(${field}, ${dateVar}.getTime())`;
      }
      return match;
    });
    
    const ltePattern = /lte\(([^,]+),\s*(\w+)\)/g;
    content = content.replace(ltePattern, (match, field, dateVar) => {
      if (dateVar.toLowerCase().includes('date') || dateVar.toLowerCase().includes('time')) {
        return `lte(${field}, ${dateVar}.getTime())`;
      }
      return match;
    });
    
    writeFileSync(filePath, content, 'utf-8');
    totalReplacements += replacements;
    console.log(`✅ ${filePath}: ${replacements} replacements`);
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
  }
});

console.log(`\n🎉 Total: ${totalReplacements} replacements across ${files.length} files`);
