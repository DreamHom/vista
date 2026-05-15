"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { loadSessionUserWithAvatar } from "@/lib/auth-hydrate-user";
import { getDefaultDashboardPath } from "@/lib/dashboard-routes";
import { OwnerShell } from "@/components/owner/owner-shell";
import { useAuth } from "@/lib/use-auth";
import { Spinner } from "@/components/ui/spinner";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hydrated, setUser, clear } = useAuth();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (!hydrated || !isAuthenticated) {
        return;
      }

      try {
        const me = await loadSessionUserWithAvatar();
        if (cancelled) return;
        if (me.role !== "OWNER") {
          router.replace(getDefaultDashboardPath(me.role));
          return;
        }
        setUser({
          id: me.id,
          email: me.email,
          fullName: me.fullName,
          role: me.role,
          profileImageUrl: me.profileImageUrl,
        });
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.isUnauthorized) {
          clear();
          router.replace("/login");
          return;
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    setCheckingSession(true);
    void verifySession();

    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated, router, setUser, clear]);

  if (!hydrated || !isAuthenticated || checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center font-sans">
        <Spinner className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return <OwnerShell>{children}</OwnerShell>;
}
