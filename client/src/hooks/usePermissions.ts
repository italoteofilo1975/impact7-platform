import { useMemo } from "react";
import type { ReactNode } from "react";
import { trpc } from "../lib/trpc";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook para verificar permissões do usuário logado
 */
export function usePermissions() {
  const { user } = useAuth();
  
  // Buscar permissões e roles do usuário
  const { data: rbacData, isLoading } = trpc.rbac.getUserRBAC.useQuery(
    { userId: user?.id! },
    { enabled: !!user?.id }
  );

  const permissions = useMemo(() => rbacData?.permissions || [], [rbacData]);
  const roles = useMemo(() => rbacData?.roles || [], [rbacData]);

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  const hasPermission = (permissionCode: string): boolean => {
    return permissions.includes(permissionCode);
  };

  /**
   * Verifica se o usuário tem um role específico
   */
  const hasRole = (roleCode: string): boolean => {
    return roles.includes(roleCode);
  };

  /**
   * Verifica se o usuário tem QUALQUER uma das permissões
   */
  const hasAnyPermission = (...permissionCodes: string[]): boolean => {
    return permissionCodes.some(code => permissions.includes(code));
  };

  /**
   * Verifica se o usuário tem TODAS as permissões
   */
  const hasAllPermissions = (...permissionCodes: string[]): boolean => {
    return permissionCodes.every(code => permissions.includes(code));
  };

  /**
   * Verifica se o usuário tem QUALQUER um dos roles
   */
  const hasAnyRole = (...roleCodes: string[]): boolean => {
    return roleCodes.some(code => roles.includes(code));
  };

  /**
   * Verifica se o usuário é admin (tem role 'admin')
   */
  const isAdmin = hasRole('admin');

  /**
   * Verifica se o usuário é manager (tem role 'manager')
   */
  const isManager = hasRole('manager');

  return {
    permissions,
    roles,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    isAdmin,
    isManager,
    isLoading,
  };
}

/**
 * Componente wrapper para mostrar conteúdo baseado em permissões
 */
interface PermissionGuardProps {
  permission?: string;
  role?: string;
  anyPermission?: string[];
  allPermissions?: string[];
  anyRole?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  permission,
  role,
  anyPermission,
  allPermissions,
  anyRole,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    isLoading,
  } = usePermissions();

  if (isLoading) return null;

  let hasAccess = true;

  if (permission && !hasPermission(permission)) hasAccess = false;
  if (role && !hasRole(role)) hasAccess = false;
  if (anyPermission && !hasAnyPermission(...anyPermission)) hasAccess = false;
  if (allPermissions && !hasAllPermissions(...allPermissions)) hasAccess = false;
  if (anyRole && !hasAnyRole(...anyRole)) hasAccess = false;

  return hasAccess ? (children as any) : (fallback as any);
}
