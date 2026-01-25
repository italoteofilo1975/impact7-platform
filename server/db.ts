import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { InsertUser, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

let _db: BetterSQLite3Database | null = null;
let _sqlite: Database.Database | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getSqlite() {
  if (!_sqlite && process.env.DATABASE_URL) {
    await getDb(); // Ensure db is initialized
  }
  return _sqlite;
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Extract file path from DATABASE_URL (format: file:./data/impact7.db)
      const dbPath = process.env.DATABASE_URL.replace('file:', '');
      console.log(`[Database] Connecting to SQLite: ${dbPath}`);
      
      _sqlite = new Database(dbPath);
      _db = drizzle(_sqlite);
      
      // Initialize database with tables if needed
      await initializeDatabase();
      
      console.log('[Database] Connected successfully');
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _sqlite = null;
    }
  }
  return _db;
}

async function initializeDatabase() {
  if (!_sqlite) return;
  
  try {
    // Check if database is already initialized
    const tables = _sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").all();
    
    if (tables.length === 0) {
      console.log('[Database] Initializing database with Drizzle migration...');
      
      // Read and execute migration SQL
      const migrationPath = path.join(process.cwd(), 'drizzle', 'migrations', '0000_hard_firestar.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
      
      // Split by statement breakpoint and execute each statement
      const statements = migrationSQL
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        try {
          _sqlite.exec(statement);
        } catch (error: any) {
          console.warn(`[Database] Warning executing statement: ${error.message}`);
        }
      }
      
      console.log('[Database] Migration applied successfully');
      
      // Create default admin user
      await createDefaultAdmin();
    } else {
      console.log('[Database] Database already initialized');
    }
  } catch (error) {
    console.error('[Database] Error initializing database:', error);
  }
}

async function createDefaultAdmin() {
  if (!_db) return;
  
  try {
    // Check if admin user already exists
    const existingAdmin = await _db.select().from(users).where(eq(users.openId, 'admin-default')).limit(1);
    
    if (existingAdmin.length === 0) {
      console.log('[Database] Creating default admin user...');
      
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      await _db.insert(users).values({
        openId: 'admin-default',
        name: 'Admin',
        email: 'admin@impact7.com',
        passwordHash,
        loginMethod: 'password',
        role: 'admin',
      } as InsertUser);
      
      console.log('[Database] Default admin user created (email: admin@impact7.com, password: admin123)');
    }
  } catch (error) {
    console.error('[Database] Error creating default admin:', error);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [user] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return user || null;
}

export async function upsertUser(userData: Partial<InsertUser> & { openId: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existingUser = await getUserByOpenId(userData.openId);
  
  if (existingUser) {
    // Update existing user
    await db.update(users)
      .set({
        name: userData.name,
        email: userData.email,
        loginMethod: userData.loginMethod,
        role: userData.role,
      })
      .where(eq(users.openId, userData.openId));
    
    return await getUserByOpenId(userData.openId);
  } else {
    // Insert new user
    await db.insert(users).values(userData as InsertUser);
    return await getUserByOpenId(userData.openId);
  }
}

// Local Authentication Functions

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user || null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user || null;
}

export async function createLocalUser(userData: {
  email: string;
  name: string | null;
  passwordHash: string;
  loginMethod: string;
  role: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(users).values({
    ...userData,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
    lastSignedIn: Math.floor(Date.now() / 1000),
  }).returning({ id: users.id });
  
  return result[0].id;
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({ lastSignedIn: Math.floor(Date.now() / 1000) })
    .where(eq(users.id, userId));
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({ 
      passwordHash,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(users.id, userId));
}
