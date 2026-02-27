import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

let _db: MySql2Database | null = null;
let _pool: mysql.Pool | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getPool() {
  if (!_pool && process.env.DATABASE_URL) {
    await getDb(); // Ensure db is initialized
  }
  return _pool;
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      console.log(`[Database] Connecting to MySQL with connection pool...`);
      
      _pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      _db = drizzle(_pool);
      
      console.log('[Database] Connected successfully with pool');
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db;
}

// Database initialization is handled by Drizzle migrations (pnpm db:push)

async function createDefaultAdmin() {
  if (!_db) return;
  
  try {
    // Check if admin user already exists
    const existingAdmin = await _db.select().from(users).where(eq(users.email, 'admin@impact7.com')).limit(1);
    
    if (existingAdmin.length === 0) {
      console.log('[Database] Creating default admin user...');
      
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      await _db.insert(users).values({
        name: 'Admin',
        email: 'admin@impact7.com',
        passwordHash,
        loginMethod: 'password',
        role: 'admin',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastSignedIn: Date.now(),
      });
      
      console.log('[Database] Default admin user created (email: admin@impact7.com, password: admin123)');
    }
  } catch (error) {
    console.error('[Database] Error creating default admin:', error);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [user] = await db.select().from(users).where(eq(users.email, openId)).limit(1);
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
      .where(eq(users.email, userData.openId));
    
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
  });
  
  // MySQL doesn't support .returning(), use insertId instead
  // insertId can be bigint or number, convert to number safely
  const rawResult = result as unknown as { insertId?: number | bigint }[];
  const insertId = rawResult[0]?.insertId;
  return typeof insertId === 'bigint' ? Number(insertId) : (insertId ?? 0);
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
