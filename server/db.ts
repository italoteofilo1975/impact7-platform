import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

let _db: PostgresJsDatabase | null = null;
let _sql: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getPool() {
  if (!_sql && process.env.DATABASE_URL) {
    await getDb(); // Ensure db is initialized
  }
  return _sql;
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      console.log(`[Database] Connecting to Postgres with connection pool...`);

      // O pooler do Supabase serve o serverless; prepare desligado para o pgBouncer.
      _sql = postgres(process.env.DATABASE_URL, {
        max: 10,
        prepare: false,
      });
      _db = drizzle(_sql);

      console.log("[Database] Connected successfully with pool");
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _sql = null;
    }
  }
  return _db;
}

// Database initialization is handled by Drizzle migrations (npm run db:push)

export async function createDefaultAdmin() {
  const db = await getDb();
  if (!db) return;

  try {
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@impact7.com"))
      .limit(1);

    if (existingAdmin.length === 0) {
      console.log("[Database] Creating default admin user...");

      const passwordHash = await bcrypt.hash("admin123", 10);

      await db.insert(users).values({
        name: "Admin",
        email: "admin@impact7.com",
        passwordHash,
        loginMethod: "password",
        role: "admin",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastSignedIn: Date.now(),
      });

      console.log(
        "[Database] Default admin user created (email: admin@impact7.com, password: admin123)"
      );
    }
  } catch (error) {
    console.error("[Database] Error creating default admin:", error);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, openId))
    .limit(1);
  return user || null;
}

export async function upsertUser(
  userData: Partial<InsertUser> & { openId: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existingUser = await getUserByOpenId(userData.openId);

  if (existingUser) {
    await db
      .update(users)
      .set({
        name: userData.name,
        email: userData.email,
        loginMethod: userData.loginMethod,
        role: userData.role,
      })
      .where(eq(users.email, userData.openId));

    return await getUserByOpenId(userData.openId);
  } else {
    await db.insert(users).values(userData as InsertUser);
    return await getUserByOpenId(userData.openId);
  }
}

// Local Authentication Functions

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user || null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
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

  // Postgres suporta RETURNING, sem o insertId do MySQL.
  const [row] = await db
    .insert(users)
    .values({
      ...userData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastSignedIn: Date.now(),
    })
    .returning({ id: users.id });

  return row?.id ?? 0;
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({ lastSignedIn: Date.now() })
    .where(eq(users.id, userId));
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: Date.now(),
    })
    .where(eq(users.id, userId));
}
