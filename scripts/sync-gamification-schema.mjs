import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log('Syncing gamification schema...');

// Fix badges table - add missing columns that Drizzle schema expects
const badgesFixes = [
  "ALTER TABLE badges ADD COLUMN IF NOT EXISTS slug VARCHAR(50)",
  "ALTER TABLE badges ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#f97316' NOT NULL",
  "ALTER TABLE badges ADD COLUMN IF NOT EXISTS requirement VARCHAR(50) DEFAULT 'manual' NOT NULL",
  "ALTER TABLE badges ADD COLUMN IF NOT EXISTS requiredValue INT DEFAULT 1 NOT NULL",
  "ALTER TABLE badges ADD COLUMN IF NOT EXISTS pointsReward INT DEFAULT 100 NOT NULL",
  "ALTER TABLE badges ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common' NOT NULL",
];

for (const sql of badgesFixes) {
  try {
    await conn.query(sql);
    console.log('OK:', sql.substring(0, 70));
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME' || e.message.includes('Duplicate column')) {
      console.log('Already exists:', sql.substring(0, 70));
    } else {
      console.error('Error:', e.message.substring(0, 100));
    }
  }
}

// Populate slug from name for existing badges
try {
  await conn.query(`
    UPDATE badges SET slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '/', '-'), '(', ''))
    WHERE slug IS NULL OR slug = ''
  `);
  console.log('Updated badge slugs from name');
} catch (e) {
  console.error('Slug update error:', e.message);
}

// Add unique index on slug (ignore if exists)
try {
  await conn.query('CREATE UNIQUE INDEX idx_badges_slug ON badges (slug)');
  console.log('Added unique index on badges.slug');
} catch (e) {
  console.log('Slug index already exists or error:', e.message.substring(0, 80));
}

// Fix userBadges table - ensure it exists
try {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS userBadges (
      id INT PRIMARY KEY AUTO_INCREMENT,
      userId INT NOT NULL,
      badgeId INT NOT NULL,
      earnedAt BIGINT NOT NULL,
      INDEX idx_userId (userId),
      INDEX idx_badgeId (badgeId)
    )
  `);
  console.log('userBadges table ready');
} catch (e) {
  console.log('userBadges:', e.message.substring(0, 80));
}

// Check final state
const [badgeCols] = await conn.query('DESCRIBE badges');
console.log('\nbadges columns:', badgeCols.map(r => r.Field).join(', '));

const [upCols] = await conn.query('DESCRIBE userPoints');
console.log('userPoints columns:', upCols.map(r => r.Field).join(', '));

const [badgeCount] = await conn.query('SELECT COUNT(*) as cnt FROM badges');
console.log('Badge count:', badgeCount[0].cnt);

const [badgeList] = await conn.query('SELECT id, name, slug FROM badges LIMIT 5');
console.log('Sample badges:', badgeList.map(b => `${b.id}: ${b.name} (${b.slug})`).join(', '));

await conn.end();
console.log('\nSchema sync complete!');
