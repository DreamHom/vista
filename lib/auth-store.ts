"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "./types";

/**
 * Auth state: JWT token + the authenticated user.
 *
 * Persisted to localStorage so a refresh keeps the session alive. The token
 * is read by the API client via {@link setAuthTokenProvider} (wired in
 * {@link components/providers/app-providers}).
 *
 * NOTE: localStorage is acceptable for a capstone. For production we'd want
 * an httpOnly cookie with a CSRF strategy: out of scope here.
 */
export interface AuthState {
  token: string | null;
  /** Long-lived refresh token (haven rotates on every /auth/refresh). */
  refreshToken: string | null;
  user: User | null;
  /** True once persisted state has hydrated on the client. */
  hydrated: boolean;

  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setUser: (user: User | null) => void;
  /**
   * Set the full session. `refreshToken` is optional so callers that don't
   * have one (e.g. legacy login paths) don't accidentally wipe a valid stored
   * refresh token; pass `null` explicitly to clear.
   */
  setSession: (token: string, user: User, refreshToken?: string | null) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      hydrated: false,

      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setUser: (user) => set({ user }),
      setSession: (token, user, refreshToken) =>
        set((state) => ({
          token,
          user,
          // Only overwrite the refresh token when the caller passed one (or
          // explicitly passed null to clear). `undefined` preserves the
          // existing value so non-auth callers updating user data don't drop
          // a still-valid refresh.
          refreshToken: refreshToken === undefined ? state.refreshToken : refreshToken,
        })),
      clear: () => set({ token: null, refreshToken: null, user: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "dreamhomes.auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

/** Read the current token without subscribing to changes: for API client use. */
export function getCurrentToken(): string | null {
  return useAuthStore.getState().token;
}

/** Read the current refresh token without subscribing — for the api.ts retry loop. */
export function getCurrentRefreshToken(): string | null {
  return useAuthStore.getState().refreshToken;
}
