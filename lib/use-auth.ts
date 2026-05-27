"use client";

import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "./auth-store";

/**
 * Hook for reading + acting on auth state from React components.
 *
 * Returns just the slice the caller needs so re-renders only fire when those
 * specific fields change (Zustand + useShallow shallow-equality check).
 *
 *   const { user, isAuthenticated, logout } = useAuth();
 */
export function useAuth() {
  return useAuthStore(
    useShallow((s) => ({
      token: s.token,
      user: s.user,
      hydrated: s.hydrated,
      isAuthenticated: s.user != null,
      role: s.user?.role ?? null,
      setSession: s.setSession,
      setUser: s.setUser,
      clear: s.clear,
    })),
  );
}
