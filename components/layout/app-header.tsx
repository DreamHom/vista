"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

const ROLE_BADGE_VARIANT = {
  OWNER: "default",
  AGENT: "success",
  APPLICANT: "secondary",
  ADMIN: "warning",
} as const;

/**
 * Top navigation for authenticated routes. Shows the user's name + role badge
 * and a logout button. Logout clears the auth store (which trips the route
 * guard's useEffect and redirects to /login).
 */
export function AppHeader() {
  const router = useRouter();
  const { user, role, clear } = useAuth();

  function handleLogout() {
    clear();
    toast.success("Signed out");
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          DreamHomes
        </Link>

        <nav className="flex items-center gap-3">
          {user && role && (
            <div className="hidden flex-col items-end leading-tight sm:flex">
              <span className="text-sm font-medium text-foreground">{user.fullName}</span>
              <Badge variant={ROLE_BADGE_VARIANT[role]} className="text-[10px]">
                {role}
              </Badge>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
