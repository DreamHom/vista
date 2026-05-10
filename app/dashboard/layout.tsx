"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/use-auth";
import { AppHeader } from "@/components/layout/app-header";
import { Spinner } from "@/components/ui/spinner";

/**
 * Authenticated-routes shell.
 *
 * Route guard: while the auth store is hydrating from localStorage we render a
 * spinner. Once hydrated, an unauthenticated user is redirected to /login.
 * This avoids the brief flash of "no auth" content during the hydration window.
 */
export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
