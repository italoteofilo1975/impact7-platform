import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🔧 Fixing badges and userPoints tables...\n');

// Fix badges table — add missing columns
try {
  await conn.execute(`ALTER TABLE badges ADD COLUMN IF NOT EXISTS name varchar(255) GENERATED ALWAYS AS (badgeName) VIRTUAL`);
  console.log('badges.name: added virtual column');
} catch(e) { console.log('badges.name already exists or error:', e.message); }

// Check if we need to add columns directly
const [badgeCols] = await conn.execute('DESCRIBE badges');
const badgeColNames = badgeCols.map(c => c.Field);
console.log('Current badges columns:', badgeColNames.join(', '));

// Add missing columns to badges
const badgeAlters = [
  { col: 'icon', def: "varchar(100) DEFAULT '🏆'" },
  { col: 'color', def: "varchar(50) DEFAULT '#F97316'" },
  { col: 'requirement', def: "varchar(100) DEFAULT 'interactions'" },
  { col: 'requiredValue', def: "int DEFAULT 1" },
  { col: 'pointsReward', def: "int DEFAULT 0" },
  { col: 'rarity', def: "varchar(50) DEFAULT 'common'" },
];

for (const { col, def } of badgeAlters) {
  if (!badgeColNames.includes(col)) {
    try {
      await conn.execute(`ALTER TABLE badges ADD COLUMN \`${col}\` ${def}`);
      console.log(`✅ badges.${col}: added`);
    } catch(e) { console.log(`⚠️ badges.${col}:`, e.message); }
  } else {
    console.log(`✓ badges.${col}: already exists`);
  }
}

// Fix userPoints table — add missing columns
const [upCols] = await conn.execute('DESCRIBE userPoints');
const upColNames = upCols.map(c => c.Field);
console.log('\nCurrent userPoints columns:', upColNames.join(', '));

const upAlters = [
  { col: 'totalInteractions', def: "int DEFAULT 0" },
  { col: 'streak', def: "int DEFAULT 0" },
  { col: 'lastInteractionAt', def: "bigint DEFAULT 0" },
];

for (const { col, def } of upAlters) {
  if (!upColNames.includes(col)) {
    try {
      await conn.execute(`ALTER TABLE userPoints ADD COLUMN \`${col}\` ${def}`);
      console.log(`✅ userPoints.${col}: added`);
    } catch(e) { console.log(`⚠️ userPoints.${col}:`, e.message); }
  } else {
    console.log(`✓ userPoints.${col}: already exists`);
  }
}

// Seed default badges
const now = Date.now();
const defaultBadges = [
  { badgeName: 'Pioneiro', description: 'Primeiro usuário a se cadastrar na plataforma', icon: '🚀', color: '#F97316', requirement: 'registration', requiredValue: 1, pointsReward: 100, rarity: 'legendary', criteria: 'Primeiro cadastro' },
  { badgeName: 'Explorador', description: 'Completou o tour de boas-vindas', icon: '🗺️', color: '#3B82F6', requirement: 'tour_complete', requiredValue: 1, pointsReward: 50, rarity: 'common', criteria: 'Tour completo' },
  { badgeName: 'Calculador', description: 'Usou a calculadora de impacto pela primeira vez', icon: '📊', color: '#10B981', requirement: 'calculator_use', requiredValue: 1, pointsReward: 75, rarity: 'common', criteria: '1 uso da calculadora' },
  { badgeName: 'Analista', description: 'Usou a calculadora de impacto 10 vezes', icon: '🔬', color: '#8B5CF6', requirement: 'calculator_use', requiredValue: 10, pointsReward: 200, rarity: 'rare', criteria: '10 usos da calculadora' },
  { badgeName: 'Inovador Social', description: 'Submeteu um case de impacto', icon: '💡', color: '#F59E0B', requirement: 'case_submit', requiredValue: 1, pointsReward: 150, rarity: 'uncommon', criteria: '1 case submetido' },
  { badgeName: 'Mentor', description: 'Respondeu 10 tópicos no fórum', icon: '🎓', color: '#EC4899', requirement: 'forum_replies', requiredValue: 10, pointsReward: 300, rarity: 'rare', criteria: '10 respostas no fórum' },
  { badgeName: 'Estudante SET7', description: 'Iniciou um curso na plataforma', icon: '📚', color: '#06B6D4', requirement: 'course_start', requiredValue: 1, pointsReward: 100, rarity: 'common', criteria: '1 curso iniciado' },
  { badgeName: 'Certificado SET7', description: 'Completou um curso com certificado', icon: '🏅', color: '#EAB308', requirement: 'course_complete', requiredValue: 1, pointsReward: 500, rarity: 'epic', criteria: '1 curso completo' },
];

const [existingBadges] = await conn.execute('SELECT COUNT(*) as cnt FROM badges');
if (existingBadges[0].cnt === 0) {
  for (const b of defaultBadges) {
    try {
      await conn.execute(
        `INSERT INTO badges (badgeName, description, icon, color, requirement, requiredValue, pointsReward, rarity, criteria, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [b.badgeName, b.description, b.icon, b.color, b.requirement, b.requiredValue, b.pointsReward, b.rarity, b.criteria, now]
      );
    } catch(e) { console.log('Badge insert error:', e.message); }
  }
  console.log(`\n✅ Seeded ${defaultBadges.length} default badges`);
} else {
  console.log(`\n✓ Badges already seeded (${existingBadges[0].cnt} badges)`);
  // Update existing badges with new columns
  for (const b of defaultBadges) {
    try {
      await conn.execute(
        `UPDATE badges SET icon=?, color=?, requirement=?, requiredValue=?, pointsReward=?, rarity=? WHERE badgeName=?`,
        [b.icon, b.color, b.requirement, b.requiredValue, b.pointsReward, b.rarity, b.badgeName]
      );
    } catch(e) {}
  }
  console.log('✅ Updated existing badges with new columns');
}

await conn.end();
console.log('\n✅ Migration complete!');
