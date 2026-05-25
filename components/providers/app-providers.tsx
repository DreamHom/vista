"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { QueryProvider } from "./query-provider";
import { setAuthTokenProvider } from "@/lib/api";
import { getCurrentToken } from "@/lib/auth-store";
import { AUTH_EXPIRED_EVENT } from "@/lib/auth-refresh";
import { Toaster, toast } from "@/components/ui/toast";

/**
 * Wire the API client to read tokens from the auth store. Done at module load
 * (not inside a useEffect) so the very first outgoing request: even before any
 * component has mounted: picks up the bearer token. The browser executes this
 * statement once when the module's chunk loads, well before render begins.
 */
setAuthTokenProvider(getCurrentToken);

/**
 * Routes that already handle their own "you're signed out" state. We skip the
 * redirect for these so the user doesn't bounce mid-login if a request happens
 * to 401 while they're on the auth pages themselves.
 */
const AUTH_PUBLIC_PATHS = new Set<string>(["/login", "/register", "/signup", "/forgot-password"]);

function SessionExpiredListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handle(event: Event) {
      const detail = (event as CustomEvent<{ nextPath?: string }>).detail;
      const nextPath = detail?.nextPath ?? pathname ?? "/";
      if (AUTH_PUBLIC_PATHS.has(pathname ?? "")) return;
      toast.error("Your session expired. Please sign in again.");
      const params = new URLSearchParams();
      if (nextPath && nextPath !== "/login") params.set("next", nextPath);
      router.push(`/login${params.size > 0 ? `?${params.toString()}` : ""}`);
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handle);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handle);
  }, [pathname, router]);

  return null;
}

/**
 * Composition root for client-side providers.
 *
 * Mounts the toast surface: there's exactly one Toaster per app, here.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <SessionExpiredListener />
      {children}
      <Toaster />
    </QueryProvider>
  );
}
