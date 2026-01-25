// Local authentication - no external OAuth
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
  require2FA?: boolean;
};

// Check if 2FA verification is still valid (within 24 hours)
function is2FAVerified(): boolean {
  const verified = sessionStorage.getItem('2fa_verified');
  const verifiedAt = sessionStorage.getItem('2fa_verified_at');
  
  if (!verified || !verifiedAt) return false;
  
  const verifiedTime = parseInt(verifiedAt, 10);
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  // 2FA verification is valid for 24 hours
  return (now - verifiedTime) < twentyFourHours;
}

// Clear 2FA verification
export function clear2FAVerification() {
  sessionStorage.removeItem('2fa_verified');
  sessionStorage.removeItem('2fa_verified_at');
}

export function useAuth(options?: UseAuthOptions) {
  const { 
    redirectOnUnauthenticated = false, 
    redirectPath = "/login",
    require2FA = true 
  } = options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Query 2FA status only if user is authenticated
  const twoFactorQuery = trpc.twoFactor.getStatus.useQuery(undefined, {
    enabled: Boolean(meQuery.data) && require2FA,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      clear2FAVerification();
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      clear2FAVerification();
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  // Check if user needs 2FA verification
  const needs2FAVerification = useMemo(() => {
    if (!require2FA) return false;
    if (!meQuery.data) return false;
    if (!twoFactorQuery.data?.isEnabled) return false;
    return !is2FAVerified();
  }, [require2FA, meQuery.data, twoFactorQuery.data?.isEnabled]);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(meQuery.data)
    );
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending || (require2FA && twoFactorQuery.isLoading),
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
      needs2FAVerification,
      twoFactorEnabled: twoFactorQuery.data?.isEnabled ?? false,
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
    require2FA,
    twoFactorQuery.isLoading,
    twoFactorQuery.data?.isEnabled,
    needs2FAVerification,
  ]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;
    if (window.location.pathname === '/verify-2fa') return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  // Redirect to 2FA verification if needed
  useEffect(() => {
    if (!require2FA) return;
    if (!state.user) return;
    if (twoFactorQuery.isLoading) return;
    if (!needs2FAVerification) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === '/verify-2fa') return;
    if (window.location.pathname === '/security') return; // Allow access to security page to manage 2FA

    // Redirect to 2FA verification with return URL
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/verify-2fa?redirect=${encodeURIComponent(currentPath)}`;
  }, [
    require2FA,
    state.user,
    twoFactorQuery.isLoading,
    needs2FAVerification,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
