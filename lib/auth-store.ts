"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "./types";

/**
 * Auth state — JWT token + the authenticated user.
 *
 * Persisted to localStorage so a refresh keeps the session alive. The token
 * is read by the API client via {@link setAuthTokenProvider} (wired in
 * {@link components/providers/app-providers}).
 *
 * NOTE: localStorage is acceptable for a capstone. For production we'd want
 * an httpOnly cookie with a CSRF strategy — out of scope here.
 */
export interface AuthState {
  token: string | null;
  user: User | null;
  /** True once persisted state has hydrated on the client. */
  hydrated: boolean;

  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setSession: (token: string, user: User) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setSession: (token, user) => set({ token, user }),
      clear: () => set({ token: null, user: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "dreamhomes.auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

/** Read the current token without subscribing to changes — for API client use. */
export function getCurrentToken(): string | null {
  return useAuthStore.getState().token;
}
