"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { NotificationBell } from "@/components/layout/notification-bell";
import { WorkspaceAccountMenu } from "@/components/layout/workspace-account-menu";
import { toast } from "@/components/ui/toast";
import {
  accountSubtitleForRole,
  ACCOUNT_MENU_GLOBAL_EXTRAS,
  getAccountMenuItemsForRole,
  notificationHubHref,
} from "@/lib/account-menu-by-role";
import { PUBLIC_AUTH_NAV } from "@/lib/public-site";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

const [loginItem, signupItem] = PUBLIC_AUTH_NAV;

export type PublicAuthSurface = "landing" | "public";

/**
 * Login / Sign up vs avatar (+ optional notifications + sign out) for marketing surfaces.
 */
export function PublicAuthDesktopCluster({
  className,
  surface = "public",
}: {
  className?: string;
  /** `landing`: avatar only. `public`: notifications + sign out + avatar (menu). */
  surface?: PublicAuthSurface;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, hydrated, clear } = useAuth();

  function handleSignOut() {
    clear();
    toast.success("Signed out");
    router.replace("/login");
  }

  const notifHref = user ? notificationHubHref(user.role) : null;

  return (
    <div className={cn("flex items-center gap-1 sm:gap-1.5", className)}>
      {!hydrated ? (
        <div className="h-9 w-44 shrink-0 rounded-none bg-muted/30" aria-hidden />
      ) : isAuthenticated && user ? (
        <>
          {surface === "public" && notifHref ? (
            <NotificationBell
              href={notifHref}
              size="default"
              className={cn(pathname.startsWith(notifHref) && "bg-secondary text-foreground")}
            />
          ) : null}
          {surface === "public" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
              aria-label="Sign out"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </Button>
          ) : null}
          <WorkspaceAccountMenu
            fullName={user.fullName}
            email={user.email}
            accountSubtitle={accountSubtitleForRole(user.role)}
            menuItems={getAccountMenuItemsForRole(user.role)}
            extraLinks={ACCOUNT_MENU_GLOBAL_EXTRAS}
            onSignOut={handleSignOut}
            triggerVariant="desktop"
            photoUrl={user.profileImageUrl}
          />
        </>
      ) : (
        <>
          <Link href={loginItem.href} className={buttonVariants({ variant: "ghost", size: "sm" })}>
            {loginItem.label}
          </Link>
          <Link href={signupItem.href} className={buttonVariants({ variant: "primary", size: "sm" })}>
            {signupItem.label}
          </Link>
        </>
      )}
    </div>
  );
}

export function PublicAuthMobileCluster({
  onNavigate,
  variant,
  surface = "public",
}: {
  onNavigate?: () => void;
  /** `header`: compact row. `hero`: stacked controls in the landing drawer. */
  variant: "header" | "hero";
  surface?: PublicAuthSurface;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, hydrated, clear } = useAuth();
  const isHero = variant === "hero";

  function handleSignOut() {
    clear();
    toast.success("Signed out");
    router.replace("/login");
    onNavigate?.();
  }

  const notifHref = user ? notificationHubHref(user.role) : null;

  if (!hydrated) {
    return (
      <div
        className={cn(
          "rounded-none bg-muted/30",
          isHero ? "h-12 w-full" : "h-10 w-full max-w-xs",
        )}
        aria-hidden
      />
    );
  }

  if (isAuthenticated && user) {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn("flex items-center gap-2", isHero && "w-full flex-wrap justify-end gap-2")}
      >
        {surface === "public" && notifHref ? (
          <NotificationBell
            href={notifHref}
            size="default"
            className={cn(pathname.startsWith(notifHref) && "bg-secondary text-foreground")}
          />
        ) : null}
        {surface === "public" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
            aria-label="Sign out"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </Button>
        ) : null}
        <WorkspaceAccountMenu
          fullName={user.fullName}
          email={user.email}
          accountSubtitle={accountSubtitleForRole(user.role)}
          menuItems={getAccountMenuItemsForRole(user.role)}
          extraLinks={ACCOUNT_MENU_GLOBAL_EXTRAS}
          onSignOut={handleSignOut}
          onItemNavigate={onNavigate}
          triggerVariant="mobile"
          photoUrl={user.profileImageUrl}
          personAvatarSize={isHero ? 44 : 40}
        />
      </div>
    );
  }

  if (isHero) {
    return (
      <div className="flex flex-col gap-2">
        <Link
          href={loginItem.href}
          onClick={onNavigate}
          className={buttonVariants({ variant: "ghost", size: "md" })}
        >
          {loginItem.label}
        </Link>
        <Link
          href={signupItem.href}
          onClick={onNavigate}
          className={buttonVariants({ variant: "primary", size: "md" })}
        >
          {signupItem.label}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2">
      <Link href={loginItem.href} onClick={onNavigate} className={buttonVariants({ variant: "ghost", size: "sm" })}>
        {loginItem.label}
      </Link>
      <Link href={signupItem.href} onClick={onNavigate} className={buttonVariants({ variant: "primary", size: "sm" })}>
        {signupItem.label}
      </Link>
    </div>
  );
}
