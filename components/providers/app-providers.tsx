"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { setAuthTokenProvider } from "@/lib/api";
import { getCurrentToken } from "@/lib/auth-store";
import { Toaster } from "@/components/ui/toast";

/**
 * Wire the API client to read tokens from the auth store. Done at module load
 * (not inside a useEffect) so the very first outgoing request: even before any
 * component has mounted: picks up the bearer token. The browser executes this
 * statement once when the module's chunk loads, well before render begins.
 */
setAuthTokenProvider(getCurrentToken);

/**
 * Composition root for client-side providers.
 *
 * Mounts the toast surface: there's exactly one Toaster per app, here.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  );
}
