import { readFileSync, writeFileSync } from 'fs';

const filePath = 'server/routers.ts';
let content = readFileSync(filePath, 'utf-8');

// Fix 1: Line 2063, 2272, 3017 - Type 'number' is not assignable to type 'Date'
// These are likely Date.now() being assigned to Date fields - need to see context

// Fix 2: Lines 3746, 3770 - Argument of type 'number' is not assignable to parameter of type 'string'
// Convert ctx.user.id (number) to String(ctx.user.id)
content = content.replace(
  /exportUserData\(ctx\.user\.id,/g,
  'exportUserData(String(ctx.user.id),'
);
content = content.replace(
  /anonymizeUserData\(ctx\.user\.id\)/g,
  'anonymizeUserData(String(ctx.user.id))'
);

// Fix 3: Lines 2805, 2855, 3485, 3848, 3862, 3876, 3890 - No overload matches this call
// These are likely missing updatedAt in insert/update operations

writeFileSync(filePath, content, 'utf-8');
console.log('✅ Fixed routers.ts - converted user.id to String');
