import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifySessionToken } from "./local-auth";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Try local JWT authentication first
    const sessionCookie = opts.req.cookies?.session;
    console.log('[Context] Session cookie:', sessionCookie ? 'present' : 'missing');
    if (sessionCookie) {
      const payload = verifySessionToken(sessionCookie);
      console.log('[Context] JWT payload:', payload);
      if (payload && payload.userId) {
        user = await db.getUserById(payload.userId);
        console.log('[Context] User loaded:', user ? `id=${user.id}` : 'null');
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    console.error('[Context] Auth error:', error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
