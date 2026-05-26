"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { NotificationBell } from "@/components/layout/notification-bell";
import { WorkspaceAccountMenu } from "@/components/layout/workspace-account-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  ACCOUNT_MENU_GLOBAL_EXTRAS,
  accountSubtitleForRole,
  getAccountMenuItemsForRole,
  notificationHubHref,
} from "@/lib/account-menu-by-role";
import { getDefaultDashboardPath } from "@/lib/dashboard-routes";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

/**
 * Top navigation for authenticated routes (legacy / optional shell).
 * Prefer role shells; this header mirrors the account dropdown pattern.
 */
export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, clear } = useAuth();

  function handleLogout() {
    clear();
    toast.success("Signed out");
    router.replace("/login");
  }

  const homeHref = role ? getDefaultDashboardPath(role) : "/dashboard";
  const notifHref = role ? notificationHubHref(role) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href={homeHref} className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          DreamHomes
        </Link>

        <nav className="flex items-center gap-1.5">
          {user && role ? (
            <>
              {notifHref ? (
                <NotificationBell
                  href={notifHref}
                  className={cn(pathname.startsWith(notifHref) && "bg-secondary text-foreground")}
                />
              ) : null}
              <Button type="button" variant="ghost" size="icon" aria-label="Sign out" onClick={handleLogout}>
                <LogOut className="h-4 w-4" aria-hidden />
              </Button>
              <WorkspaceAccountMenu
                fullName={user.fullName}
                email={user.email}
                accountSubtitle={accountSubtitleForRole(role)}
                menuItems={getAccountMenuItemsForRole(role)}
                extraLinks={ACCOUNT_MENU_GLOBAL_EXTRAS}
                onSignOut={handleLogout}
                triggerVariant="desktop"
                photoUrl={user.profileImageUrl}
              />
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
