"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";

import { PersonAvatar } from "@/components/public/widgets/person-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type AccountMenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

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
  /** Optional public profile image URL (from auth store or `/me/profile`). */
  photoUrl?: string | null;
  /** Avatar diameter in px; defaults by breakpoint. */
  personAvatarSize?: number;
};

/**
 * Account control: avatar opens a dropdown with workspace routes, shortcuts, sign out.
 * Trigger is avatar-only; name and email appear inside the menu.
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
  photoUrl,
  personAvatarSize,
}: WorkspaceAccountMenuProps) {
  const isDesktop = triggerVariant === "desktop";
  const avatarSize = personAvatarSize ?? (isDesktop ? 36 : 40);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="pr-0 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-background p-0.5 transition-colors hover:bg-secondary/60",
            isDesktop ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10",
          )}
          aria-label={`Open account menu (${fullName})`}
        >
          <PersonAvatar
            name={fullName}
            photoUrl={photoUrl?.trim() || undefined}
            size={avatarSize}
            className={cn("leading-none", avatarSize >= 40 ? "text-base" : "text-sm")}
          />
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
