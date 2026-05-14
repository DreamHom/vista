"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { WorkspaceAccountMenu } from "@/components/layout/workspace-account-menu";
import { toast } from "@/components/ui/toast";
import { ACCOUNT_MENU_GLOBAL_EXTRAS, accountSubtitleForRole, getAccountMenuItemsForRole } from "@/lib/account-menu-by-role";
import { getDefaultDashboardPath } from "@/lib/dashboard-routes";
import { useAuth } from "@/lib/use-auth";

/**
 * Top navigation for authenticated routes (legacy / optional shell).
 * Prefer role shells; this header mirrors the account dropdown pattern.
 */
export function AppHeader() {
  const router = useRouter();
  const { user, role, clear } = useAuth();

  function handleLogout() {
    clear();
    toast.success("Signed out");
    router.replace("/login");
  }

  const homeHref = role ? getDefaultDashboardPath(role) : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href={homeHref} className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          DreamHomes
        </Link>

        <nav className="flex items-center gap-3">
          {user && role ? (
            <WorkspaceAccountMenu
              fullName={user.fullName}
              email={user.email}
              accountSubtitle={accountSubtitleForRole(role)}
              menuItems={getAccountMenuItemsForRole(role)}
              extraLinks={ACCOUNT_MENU_GLOBAL_EXTRAS}
              onSignOut={handleLogout}
              triggerVariant="desktop"
              avatarVariant="initials"
            />
          ) : null}
        </nav>
      </div>
    </header>
  );
}
