"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  DashboardShell,
  type SidebarGroup,
} from "./dashboard-shell";

export function DashboardShellClient({
  groups,
  user,
  role,
  topBarSlot,
  children,
}: {
  groups: SidebarGroup[];
  user: { name: string; subline: string; avatar?: string };
  role: "applicant" | "owner" | "agent" | "admin";
  topBarSlot?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";

  // pick the longest matching href as active (handles nested routes)
  const allHrefs = groups.flatMap((g) => g.links.map((l) => l.href));
  const active =
    allHrefs
      .filter((href) => pathname === href || pathname.startsWith(href + "/"))
      .sort((a, b) => b.length - a.length)[0] ?? "";

  return (
    <DashboardShell
      groups={groups}
      active={active}
      user={user}
      role={role}
      topBarSlot={topBarSlot}
    >
      {children}
    </DashboardShell>
  );
}
