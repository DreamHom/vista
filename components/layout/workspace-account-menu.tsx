"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, LogOut } from "lucide-react";

import { PersonAvatar } from "@/components/public/widgets/person-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { nameAvatarPastelClassName } from "@/lib/name-avatar-seed";
import { cn } from "@/lib/utils";

export type AccountMenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "DH";
}

type WorkspaceAccountMenuProps = {
  fullName: string;
  email?: string | null;
  accountSubtitle: string;
  menuItems: readonly AccountMenuItem[] | AccountMenuItem[];
  /** Shown after main nav, before sign out (e.g. Browse listings, Dream AI). */
  extraLinks?: readonly AccountMenuItem[] | AccountMenuItem[];
  onSignOut: () => void;
  /** Called when a navigation link in the menu is activated (e.g. close drawer). */
  onItemNavigate?: () => void;
  triggerVariant: "desktop" | "mobile";
  /** Public marketing header uses `PersonAvatar`; dashboards use pastel initials. */
  avatarVariant: "person" | "initials";
  /** Used when `avatarVariant` is `person` (public header). */
  personAvatarSize?: number;
  /**
   * When false with `avatarVariant="person"`, the menu trigger is only the avatar
   * (no visible name or chevron). Identity stays in the opened menu.
   */
  showTriggerName?: boolean;
};

/**
 * Account chip that opens a dropdown: workspace routes, optional shortcuts, sign out.
 * Used in dashboard shells and the public auth cluster.
 */
export function WorkspaceAccountMenu({
  fullName,
  email,
  accountSubtitle,
  menuItems,
  extraLinks,
  onSignOut,
  onItemNavigate,
  triggerVariant,
  avatarVariant,
  personAvatarSize = 36,
  showTriggerName = true,
}: WorkspaceAccountMenuProps) {
  const isDesktop = triggerVariant === "desktop";
  const personAvatarOnly = avatarVariant === "person" && !showTriggerName;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDesktop && !personAvatarOnly ? "pr-2" : "pr-0",
        )}
      >
        <button
          type="button"
          className={cn(
            "group flex items-center gap-2 text-left transition-colors",
            personAvatarOnly &&
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background p-0.5 hover:bg-secondary/60",
            !personAvatarOnly &&
              isDesktop &&
              "max-w-[min(100%,18rem)] gap-3 border border-border bg-background px-3 py-2.5 hover:bg-secondary/40 sm:px-4 sm:py-3",
            !personAvatarOnly && !isDesktop && "rounded-full border border-border bg-background p-0.5 pr-1 hover:bg-secondary/40",
            !personAvatarOnly &&
              avatarVariant === "person" &&
              isDesktop &&
              "max-w-[min(100%,16rem)] rounded-none border-transparent py-1 pl-1 pr-2 hover:border-border hover:bg-secondary/60",
            !personAvatarOnly &&
              avatarVariant === "person" &&
              !isDesktop &&
              "w-full border border-border bg-secondary/15 px-3 py-3 hover:bg-secondary/25",
          )}
          aria-label={`Account menu for ${fullName}`}
        >
          {avatarVariant === "person" ? (
            <>
              <PersonAvatar name={fullName} size={personAvatarSize} className="shrink-0 text-xs" />
              {showTriggerName ? (
                isDesktop ? (
                  <>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{fullName}</span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-muted-foreground opacity-70 transition-transform group-data-[state=open]:rotate-180"
                      aria-hidden
                    />
                  </>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground">{fullName}</span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-muted-foreground opacity-70 transition-transform group-data-[state=open]:rotate-180"
                      aria-hidden
                    />
                  </>
                )
              ) : null}
            </>
          ) : (
            <>
              <div
                className={cn(
                  "inline-flex shrink-0 items-center justify-center rounded-full border border-black/[0.06] font-semibold",
                  isDesktop
                    ? "h-11 w-11 text-xs"
                    : "h-10 w-10 text-xs ring-2 ring-background group-data-[state=open]:ring-primary/25",
                  nameAvatarPastelClassName(fullName),
                )}
              >
                {initials(fullName)}
              </div>
              {isDesktop ? (
                <>
                  <div className="min-w-0 flex-1 text-right">
                    <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-eyebrow text-muted-foreground">{accountSubtitle}</p>
                  </div>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-muted-foreground opacity-70 transition-transform group-data-[state=open]:rotate-180"
                    aria-hidden
                  />
                </>
              ) : (
                <ChevronDown className="mr-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-70" aria-hidden />
              )}
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[12.5rem]">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-semibold text-foreground">{fullName}</p>
          {email ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{email}</p> : null}
          <p className="mt-1 text-[11px] uppercase tracking-eyebrow text-muted-foreground">{accountSubtitle}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {menuItems.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild>
            <Link
              href={href}
              className="flex cursor-pointer items-center gap-2"
              onClick={() => {
                onItemNavigate?.();
              }}
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}

        {extraLinks?.length ? (
          <>
            <DropdownMenuSeparator />
            {extraLinks.map(({ href, label, icon: Icon }) => (
              <DropdownMenuItem key={href} asChild>
                <Link
                  href={href}
                  className="flex cursor-pointer items-center gap-2"
                  onClick={() => {
                    onItemNavigate?.();
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  {label}
                </Link>
              </DropdownMenuItem>
            ))}
          </>
        ) : null}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            onSignOut();
          }}
          className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
