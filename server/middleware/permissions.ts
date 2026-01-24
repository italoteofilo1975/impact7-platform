/**
 * Middleware de Verificação de Permissões
 * Garante que usuários têm acesso apenas aos recursos autorizados
 */

import { TRPCError } from "@trpc/server";

export type Permission =
  | "read:cases"
  | "write:cases"
  | "delete:cases"
  | "approve:cases"
  | "read:users"
  | "write:users"
  | "delete:users"
  | "read:analytics"
  | "write:settings"
  | "manage:api_keys"
  | "manage:webhooks"
  | "manage:oauth_clients"
  | "manage:tags"
  | "admin:full";

export type Role = "user" | "admin" | "super_admin";

/**
 * Mapeamento de roles para permissões
 */
const rolePermissions: Record<Role, Permission[]> = {
  user: [
    "read:cases",
    "read:analytics",
    "manage:api_keys",
    "manage:webhooks",
  ],
  admin: [
    "read:cases",
    "write:cases",
    "approve:cases",
    "read:users",
    "read:analytics",
    "write:settings",
    "manage:api_keys",
    "manage:webhooks",
    "manage:oauth_clients",
    "manage:tags",
  ],
  super_admin: [
    "read:cases",
    "write:cases",
    "delete:cases",
    "approve:cases",
    "read:users",
    "write:users",
    "delete:users",
    "read:analytics",
    "write:settings",
    "manage:api_keys",
    "manage:webhooks",
    "manage:oauth_clients",
    "manage:tags",
    "admin:full",
  ],
};

/**
 * Verificar se um role tem uma permissão específica
 */
export function hasPermission(role: Role | string, permission: Permission): boolean {
  const normalizedRole = (role === "admin" ? "admin" : role === "super_admin" ? "super_admin" : "user") as Role;
  const permissions = rolePermissions[normalizedRole] || rolePermissions.user;
  return permissions.includes(permission) || permissions.includes("admin:full");
}

/**
 * Verificar múltiplas permissões (todas devem ser verdadeiras)
 */
export function hasAllPermissions(role: Role | string, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Verificar múltiplas permissões (pelo menos uma deve ser verdadeira)
 */
export function hasAnyPermission(role: Role | string, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Obter todas as permissões de um role
 */
export function getPermissions(role: Role | string): Permission[] {
  const normalizedRole = (role === "admin" ? "admin" : role === "super_admin" ? "super_admin" : "user") as Role;
  return rolePermissions[normalizedRole] || rolePermissions.user;
}

/**
 * Verificar se usuário pode acessar recurso de outro usuário
 */
export function canAccessUserResource(
  currentUserId: string,
  currentUserRole: Role | string,
  resourceOwnerId: string
): boolean {
  // Usuário pode acessar seus próprios recursos
  if (currentUserId === resourceOwnerId) return true;
  
  // Admin pode acessar recursos de qualquer usuário
  if (hasPermission(currentUserRole, "read:users")) return true;
  
  return false;
}

/**
 * Verificar se usuário pode modificar recurso de outro usuário
 */
export function canModifyUserResource(
  currentUserId: string,
  currentUserRole: Role | string,
  resourceOwnerId: string
): boolean {
  // Usuário pode modificar seus próprios recursos
  if (currentUserId === resourceOwnerId) return true;
  
  // Apenas super_admin pode modificar recursos de outros
  if (hasPermission(currentUserRole, "write:users")) return true;
  
  return false;
}

/**
 * Middleware para verificar permissão em procedure tRPC
 */
export function requirePermission(permission: Permission) {
  return (ctx: { user?: { id: string; role?: string } }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Autenticação necessária",
      });
    }
    
    const role = ctx.user.role || "user";
    if (!hasPermission(role, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Permissão negada: ${permission}`,
      });
    }
    
    return true;
  };
}

/**
 * Middleware para verificar se é admin
 */
export function requireAdmin(ctx: { user?: { id: string; role?: string } }) {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Autenticação necessária",
    });
  }
  
  if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso restrito a administradores",
    });
  }
  
  return true;
}

/**
 * Middleware para verificar propriedade de recurso
 */
export function requireOwnership(
  ctx: { user?: { id: string; role?: string } },
  resourceOwnerId: string
) {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Autenticação necessária",
    });
  }
  
  if (!canModifyUserResource(ctx.user.id, ctx.user.role || "user", resourceOwnerId)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Você não tem permissão para modificar este recurso",
    });
  }
  
  return true;
}

/**
 * Descrição legível das permissões
 */
export const permissionDescriptions: Record<Permission, string> = {
  "read:cases": "Visualizar cases de sucesso",
  "write:cases": "Criar e editar cases",
  "delete:cases": "Excluir cases",
  "approve:cases": "Aprovar ou rejeitar cases submetidos",
  "read:users": "Visualizar informações de usuários",
  "write:users": "Editar informações de usuários",
  "delete:users": "Excluir contas de usuários",
  "read:analytics": "Visualizar analytics e métricas",
  "write:settings": "Modificar configurações do sistema",
  "manage:api_keys": "Gerenciar chaves de API",
  "manage:webhooks": "Gerenciar webhooks",
  "manage:oauth_clients": "Gerenciar aplicações OAuth",
  "manage:tags": "Gerenciar tags de cases",
  "admin:full": "Acesso administrativo completo",
};
