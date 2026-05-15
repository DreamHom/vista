"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Heart,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  CalendarDays,
  HandCoins,
} from "lucide-react";
import { WorkspaceAccountMenu } from "@/components/layout/workspace-account-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";
import {
  ACCOUNT_MENU_GLOBAL_EXTRAS,
  accountSubtitleForRole,
  getAccountMenuItemsForRole,
  notificationHubHref,
} from "@/lib/account-menu-by-role";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/use-auth";
import { toast } from "@/components/ui/toast";

const APPLICANT_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/saved", label: "Saved Listings", icon: Heart },
  { href: "/dashboard/inspections", label: "My Inspections", icon: CalendarDays },
  { href: "/dashboard/offers", label: "My Offers", icon: HandCoins },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "My Profile", icon: UserRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function ApplicantShell({ children }: { children: React.ReactNode }) {
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
      <div className="grid min-h-screen w-full lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border bg-white text-foreground lg:sticky lg:top-0 lg:flex lg:h-svh lg:max-h-svh lg:flex-col lg:overflow-hidden">
          <div className="shrink-0 border-b border-border px-6 py-5">
            <Link href="/" className="inline-flex" aria-label="DreamHomes home">
              <LogoMark size="md" />
            </Link>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <div className="mb-3 px-3 text-[11px] uppercase tracking-eyebrow text-muted-foreground">Navigation</div>
            <div className="space-y-px">
            {APPLICANT_NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

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
            <div className="mb-3 px-3 text-[11px] uppercase tracking-eyebrow text-muted-foreground">Shortcuts</div>
            <div className="space-y-px">
            <Link
              href="/dream-ai"
              className="flex items-center justify-between border-l border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <span>Continue with Dream AI</span>
              <Search className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/listings"
              className="flex items-center justify-between border-l border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <span>Browse listings</span>
              <ShieldCheck className="h-4 w-4" aria-hidden />
            </Link>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col bg-background">
          <header className="sticky top-0 z-30 border-b border-border bg-background">
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
              <Link href="/" className="inline-flex shrink-0 lg:hidden" aria-label="DreamHomes home">
                <LogoMark size="sm" />
              </Link>
              <div className="hidden min-w-0 flex-1 lg:block" aria-hidden />
              <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                {notifHref ? (
                  <Link
                    href={notifHref}
                    aria-label="Notifications"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "h-8 w-8 sm:h-9 sm:w-9",
                      pathname.startsWith(notifHref) && "bg-secondary text-foreground",
                    )}
                  >
                    <Bell className="h-4 w-4" aria-hidden />
                  </Link>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  aria-label="Sign out"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
                </Button>
                {user ? (
                  <WorkspaceAccountMenu
                    fullName={user.fullName}
                    email={user.email}
                    accountSubtitle={accountSubtitleForRole(user.role)}
                    menuItems={getAccountMenuItemsForRole(user.role)}
                    extraLinks={ACCOUNT_MENU_GLOBAL_EXTRAS}
                    onSignOut={handleLogout}
                    triggerVariant="desktop"
                    photoUrl={user.profileImageUrl}
                    personAvatarSize={32}
                  />
                ) : null}
              </div>
            </div>

            <nav
              className="-mx-1 flex gap-px overflow-x-auto border-t border-border px-4 py-2 sm:px-6 lg:hidden"
              aria-label="Dashboard sections"
            >
                {APPLICANT_NAV_ITEMS.map(({ href, label }) => {
                  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

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
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
