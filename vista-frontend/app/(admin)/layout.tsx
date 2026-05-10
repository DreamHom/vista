import { DashboardShellClient } from "@/components/dashboard/dashboard-shell-client";
import { Icon } from "@/components/icons";

const groups = [
  {
    title: "Operations",
    links: [
      { href: "/admin", label: "Overview", icon: <Icon.Home size={14} /> },
      { href: "/admin/users", label: "Users", icon: <Icon.Users size={14} /> },
      { href: "/admin/listings", label: "Listings", icon: <Icon.Building size={14} /> },
      { href: "/admin/comments", label: "Comments", icon: <Icon.Chat size={14} /> },
    ],
  },
  {
    title: "Verification",
    links: [
      { href: "/admin/verifications", label: "Queue", icon: <Icon.ShieldCheck size={14} />, badge: 4 },
      { href: "/admin/verifications/owners", label: "Owners", icon: <Icon.Users size={14} /> },
      { href: "/admin/verifications/agents", label: "Agents", icon: <Icon.Users size={14} /> },
      { href: "/admin/verifications/properties", label: "Properties", icon: <Icon.Doc size={14} /> },
    ],
  },
  {
    title: "Growth & insight",
    links: [
      { href: "/admin/ads", label: "Ads", icon: <Icon.Megaphone size={14} /> },
      { href: "/admin/analytics", label: "Analytics", icon: <Icon.Chart size={14} /> },
      { href: "/admin/audit-log", label: "Audit log", icon: <Icon.Doc size={14} /> },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShellClient
      groups={groups}
      user={{
        name: "Admin · ops",
        subline: "admin@dreamhomes.ng",
      }}
      role="admin"
    >
      {children}
    </DashboardShellClient>
  );
}
