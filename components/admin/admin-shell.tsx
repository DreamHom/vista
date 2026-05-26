"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BadgeDollarSign,
  Bell,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  SquareStack,
  Users,
  FileCheck2,
  Flag,
  MessageSquareWarning,
} from "lucide-react";
import { NotificationBell } from "@/components/layout/notification-bell";
import { WorkspaceAccountMenu } from "@/components/layout/workspace-account-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";
import { ACCOUNT_MENU_GLOBAL_EXTRAS, notificationHubHref } from "@/lib/account-menu-by-role";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

const ADMIN_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/verification", label: "Verification Queues", icon: FileCheck2 },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/listings", label: "Listings Management", icon: SquareStack },
  { href: "/admin/comments", label: "Comments Moderation", icon: MessageSquareWarning },
  { href: "/admin/reports", label: "Reported Listings", icon: Flag },
  { href: "/admin/audit", label: "Audit Log", icon: Activity },
  { href: "/admin/analytics", label: "Analytics", icon: Bell },
  { href: "/admin/ads", label: "Ads Management", icon: BadgeDollarSign },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clear } = useAuth();
  const notifHref = user ? notificationHubHref(user.role) : null;

  function handleLogout() {
    clear();
    toast.success("Signed out");
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="grid min-h-screen w-full lg:grid-cols-[256px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border bg-white text-foreground lg:sticky lg:top-0 lg:flex lg:h-svh lg:max-h-svh lg:flex-col lg:overflow-hidden">
          <div className="shrink-0 border-b border-border px-6 py-5">
            <Link href="/admin/dashboard" className="inline-flex">
              <LogoMark size="md" />
            </Link>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <div className="mb-3 px-3 text-[11px] uppercase tracking-eyebrow text-muted-foreground">Navigation</div>
            <div className="space-y-px">
              {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(`${href}/`));

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 border-l px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "border-foreground bg-secondary text-foreground"
                        : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="shrink-0 border-t border-border px-3 py-4">
            <div className="mb-3 px-3 text-[11px] uppercase tracking-eyebrow text-muted-foreground">Queue access</div>
            <div className="space-y-px">
              <Link
                href="/admin/verification"
                className="flex items-center justify-between border-l border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <span>Verification queue</span>
                <ShieldCheck className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/admin/reports"
                className="flex items-center justify-between border-l border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <span>Reported listings</span>
                <Flag className="h-4 w-4" aria-hidden />
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col bg-background">
          <header className="sticky top-0 z-30 border-b border-border bg-background">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4 lg:hidden">
                <Link href="/admin/dashboard" className="inline-flex">
                  <LogoMark size="sm" />
                </Link>
              <div className="flex items-center gap-1.5">
                {notifHref ? (
                  <NotificationBell
                    href={notifHref}
                    size="small"
                    className={cn(pathname.startsWith(notifHref) && "bg-secondary text-foreground")}
                  />
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Sign out"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                </Button>
                <WorkspaceAccountMenu
                  fullName={user?.fullName ?? "Admin"}
                  email={user?.email}
                  accountSubtitle="Admin account"
                  menuItems={ADMIN_NAV_ITEMS}
                  extraLinks={ACCOUNT_MENU_GLOBAL_EXTRAS}
                  onSignOut={handleLogout}
                  triggerVariant="mobile"
                  photoUrl={user?.profileImageUrl}
                />
              </div>
              </div>

              <div className="hidden items-center justify-end gap-1.5 lg:flex">
                {notifHref ? (
                  <NotificationBell
                    href={notifHref}
                    size="small"
                    className={cn(pathname.startsWith(notifHref) && "bg-secondary text-foreground")}
                  />
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Sign out"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                </Button>
                <WorkspaceAccountMenu
                  fullName={user?.fullName ?? "Admin"}
                  email={user?.email}
                  accountSubtitle="Admin account"
                  menuItems={ADMIN_NAV_ITEMS}
                  extraLinks={ACCOUNT_MENU_GLOBAL_EXTRAS}
                  onSignOut={handleLogout}
                  triggerVariant="desktop"
                  photoUrl={user?.profileImageUrl}
                />
              </div>

              <nav className="-mx-1 flex gap-px overflow-x-auto border-t border-border pt-4 lg:hidden">
                {ADMIN_NAV_ITEMS.map(({ href, label }) => {
                  const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(`${href}/`));

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "whitespace-nowrap border px-4 py-2 text-sm transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
