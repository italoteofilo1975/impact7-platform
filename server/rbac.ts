/**
 * RBAC (Role-Based Access Control) System
 * Sistema próprio de controle de acesso e permissões
 */

import { getDb } from "./db";
import { roles, permissions, rolePermissions, userRoles } from "../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Verifica se um usuário tem uma permissão específica
 */
export async function checkPermission(userId: number, permissionCode: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // 1. Buscar roles do usuário
    const userRolesData = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));

    if (userRolesData.length === 0) return false;

    const roleIds = userRolesData.map(ur => ur.roleId);

    // 2. Buscar permission ID
    const permData = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(and(
        eq(permissions.code, permissionCode),
        eq(permissions.isActive, 1)
      ))
      .limit(1);

    if (permData.length === 0) return false;

    const permissionId = permData[0].id;

    // 3. Verificar se algum role tem essa permission
    const rolePermData = await db
      .select({ id: rolePermissions.id })
      .from(rolePermissions)
      .where(and(
        inArray(rolePermissions.roleId, roleIds),
        eq(rolePermissions.permissionId, permissionId)
      ))
      .limit(1);

    return rolePermData.length > 0;
  } catch (error) {
    console.error("[RBAC] Error checking permission:", error);
    return false;
  }
}

/**
 * Verifica se um usuário tem um role específico
 */
export async function checkRole(userId: number, roleCode: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // 1. Buscar role ID
    const roleData = await db
      .select({ id: roles.id })
      .from(roles)
      .where(and(
        eq(roles.code, roleCode),
        eq(roles.isActive, 1)
      ))
      .limit(1);

    if (roleData.length === 0) return false;

    const roleId = roleData[0].id;

    // 2. Verificar se usuário tem esse role
    const userRoleData = await db
      .select({ id: userRoles.id })
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.roleId, roleId)
      ))
      .limit(1);

    return userRoleData.length > 0;
  } catch (error) {
    console.error("[RBAC] Error checking role:", error);
    return false;
  }
}

/**
 * Retorna todas as permissões de um usuário
 */
export async function getUserPermissions(userId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // 1. Buscar roles do usuário
    const userRolesData = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));

    if (userRolesData.length === 0) return [];

    const roleIds = userRolesData.map(ur => ur.roleId);

    // 2. Buscar permission IDs dos roles
    const rolePermData = await db
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(inArray(rolePermissions.roleId, roleIds));

    if (rolePermData.length === 0) return [];

    const permissionIds = rolePermData.map(rp => rp.permissionId);

    // 3. Buscar códigos das permissions
    const permsData = await db
      .select({ code: permissions.code })
      .from(permissions)
      .where(and(
        inArray(permissions.id, permissionIds),
        eq(permissions.isActive, 1)
      ));

    return permsData.map(p => p.code);
  } catch (error) {
    console.error("[RBAC] Error getting user permissions:", error);
    return [];
  }
}

/**
 * Retorna todos os roles de um usuário
 */
export async function getUserRoles(userId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // 1. Buscar role IDs do usuário
    const userRolesData = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));

    if (userRolesData.length === 0) return [];

    const roleIds = userRolesData.map(ur => ur.roleId);

    // 2. Buscar códigos dos roles
    const rolesData = await db
      .select({ code: roles.code })
      .from(roles)
      .where(and(
        inArray(roles.id, roleIds),
        eq(roles.isActive, 1)
      ));

    return rolesData.map(r => r.code);
  } catch (error) {
    console.error("[RBAC] Error getting user roles:", error);
    return [];
  }
}

/**
 * Atribui um role a um usuário
 */
export async function assignRole(userId: number, roleCode: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // 1. Buscar role ID
    const roleData = await db
      .select({ id: roles.id })
      .from(roles)
      .where(and(
        eq(roles.code, roleCode),
        eq(roles.isActive, 1)
      ))
      .limit(1);

    if (roleData.length === 0) return false;

    const roleId = roleData[0].id;

    // 2. Inserir userRole
    await db.insert(userRoles).values({
      userId,
      roleId,
      assignedAt: Date.now(),
    
          createdAt: Date.now(),
        }).onDuplicateKeyUpdate({ set: { assignedAt: Date.now() } });

    return true;
  } catch (error) {
    console.error("[RBAC] Error assigning role:", error);
    return false;
  }
}

/**
 * Remove um role de um usuário
 */
export async function removeRole(userId: number, roleCode: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // 1. Buscar role ID
    const roleData = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.code, roleCode))
      .limit(1);

    if (roleData.length === 0) return false;

    const roleId = roleData[0].id;

    // 2. Deletar userRole
    await db.delete(userRoles).where(and(
      eq(userRoles.userId, userId),
      eq(userRoles.roleId, roleId)
    ));

    return true;
  } catch (error) {
    console.error("[RBAC] Error removing role:", error);
    return false;
  }
}

/**
 * Middleware tRPC: Requer permissão específica
 */
export function requirePermission(permissionCode: string) {
  return async ({ ctx, next }: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Você precisa estar logado",
      });
    }

    const hasPermission = await checkPermission(ctx.user.id, permissionCode);

    if (!hasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Permissão negada: ${permissionCode}`,
      });
    }

    return next({ ctx });
  };
}

/**
 * Middleware tRPC: Requer role específico
 */
export function requireRole(roleCode: string) {
  return async ({ ctx, next }: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Você precisa estar logado",
      });
    }

    const hasRole = await checkRole(ctx.user.id, roleCode);

    if (!hasRole) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Acesso negado: role '${roleCode}' necessário`,
      });
    }

    return next({ ctx });
  };
}
