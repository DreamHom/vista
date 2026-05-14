"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { WorkspaceAccountMenu } from "@/components/layout/workspace-account-menu";
import { toast } from "@/components/ui/toast";
import { accountSubtitleForRole, ACCOUNT_MENU_GLOBAL_EXTRAS, getAccountMenuItemsForRole } from "@/lib/account-menu-by-role";
import { PUBLIC_AUTH_NAV } from "@/lib/public-site";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

const [loginItem, signupItem] = PUBLIC_AUTH_NAV;

/**
 * Login / Sign up vs name + avatar for public surfaces (marketing header, hero).
 * Reads the same persisted auth store as the rest of the app.
 */
export function PublicAuthDesktopCluster({ className }: { className?: string }) {
  const router = useRouter();
  const { user, isAuthenticated, hydrated, clear } = useAuth();

  function handleSignOut() {
    clear();
    toast.success("Signed out");
    router.replace("/login");
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!hydrated ? (
        <div className="h-9 w-44 shrink-0 rounded-none bg-muted/30" aria-hidden />
      ) : isAuthenticated && user ? (
        <WorkspaceAccountMenu
          fullName={user.fullName}
          email={user.email}
          accountSubtitle={accountSubtitleForRole(user.role)}
          menuItems={getAccountMenuItemsForRole(user.role)}
          extraLinks={ACCOUNT_MENU_GLOBAL_EXTRAS}
          onSignOut={handleSignOut}
          triggerVariant="desktop"
          avatarVariant="person"
          personAvatarSize={36}
        />
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
}: {
  onNavigate?: () => void;
  /** `header`: compact row of sm buttons. `hero`: stacked md buttons in the landing drawer. */
  variant: "header" | "hero";
}) {
  const router = useRouter();
  const { user, isAuthenticated, hydrated, clear } = useAuth();
  const isHero = variant === "hero";

  function handleSignOut() {
    clear();
    toast.success("Signed out");
    router.replace("/login");
    onNavigate?.();
  }

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
      <div onClick={(e) => e.stopPropagation()}>
        <WorkspaceAccountMenu
          fullName={user.fullName}
          email={user.email}
          accountSubtitle={accountSubtitleForRole(user.role)}
          menuItems={getAccountMenuItemsForRole(user.role)}
          extraLinks={ACCOUNT_MENU_GLOBAL_EXTRAS}
          onSignOut={handleSignOut}
          onItemNavigate={onNavigate}
          triggerVariant="mobile"
          avatarVariant="person"
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
