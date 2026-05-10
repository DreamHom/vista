import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Icon, Logo } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

export interface SidebarLink {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string | number;
}

export interface SidebarGroup {
  title?: string;
  links: SidebarLink[];
}

export function DashboardShell({
  groups,
  active,
  user,
  role,
  topBarSlot,
  children,
}: {
  groups: SidebarGroup[];
  active: string;
  user: { name: string; subline: string; avatar?: string };
  role: "applicant" | "owner" | "agent" | "admin";
  topBarSlot?: ReactNode;
  children: ReactNode;
}) {
  const roleLabel =
    role === "applicant"
      ? "Applicant"
      : role === "owner"
        ? "Owner"
        : role === "agent"
          ? "Agent"
          : "Admin";

  return (
    <div className="flex min-h-screen flex-1 bg-bg">
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-bg-elevated">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="focus-ring rounded-md">
            <Logo />
          </Link>
        </div>
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} src={user.avatar} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg">{user.name}</p>
              <p className="truncate text-xs text-fg-muted">{user.subline}</p>
            </div>
          </div>
          <div className="mt-3">
            <Badge tone="brand">{roleLabel} workspace</Badge>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {groups.map((group, idx) => (
            <div key={idx}>
              {group.title && (
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-subtle">
                  {group.title}
                </p>
              )}
              <ul className="space-y-1">
                {group.links.map((link) => {
                  const isActive = link.href === active;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                          isActive
                            ? "bg-brand text-brand-fg"
                            : "text-fg-muted hover:text-fg hover:bg-bg-sunken",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-7 w-7 items-center justify-center rounded-lg",
                            isActive
                              ? "bg-white/15 text-brand-fg"
                              : "bg-bg-sunken text-fg-muted",
                          )}
                        >
                          {link.icon}
                        </span>
                        <span className="flex-1 truncate">{link.label}</span>
                        {link.badge !== undefined && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              isActive
                                ? "bg-white/20 text-brand-fg"
                                : "bg-accent-soft text-accent-fg",
                            )}
                          >
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-fg-muted hover:text-fg hover:bg-bg-sunken transition"
          >
            <Icon.Logout size={16} />
            Sign out
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-bg/90 px-6 backdrop-blur">
          <Link href="/" className="lg:hidden focus-ring rounded-md">
            <Logo withWordmark={false} />
          </Link>
          <div className="flex-1">{topBarSlot}</div>
          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-elevated text-fg-muted hover:text-fg"
            aria-label="Notifications"
          >
            <Icon.Bell size={16} />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-bg-elevated" />
          </button>
          <Avatar name={user.name} src={user.avatar} size={36} />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border bg-bg-elevated/40 px-6 lg:px-8 py-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-fg-muted max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
