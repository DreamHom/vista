import { DashboardShellClient } from "@/components/dashboard/dashboard-shell-client";
import { Icon } from "@/components/icons";
import { owners } from "@/lib/mock-data";

const me = owners[0];

const groups = [
  {
    title: "Workspace",
    links: [
      { href: "/owner", label: "Overview", icon: <Icon.Home size={14} /> },
      { href: "/owner/listings", label: "Listings", icon: <Icon.Building size={14} />, badge: 4 },
      { href: "/owner/agents", label: "Agents", icon: <Icon.Users size={14} /> },
    ],
  },
  {
    title: "Pipeline",
    links: [
      { href: "/owner/leads", label: "Leads", icon: <Icon.Chart size={14} />, badge: 12 },
      { href: "/owner/inspections", label: "Inspections", icon: <Icon.Calendar size={14} />, badge: 3 },
      { href: "/owner/offers", label: "Offers", icon: <Icon.Coin size={14} />, badge: 2 },
      { href: "/owner/messages", label: "Messages", icon: <Icon.Chat size={14} />, badge: 1 },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/owner/verification", label: "Verification", icon: <Icon.ShieldCheck size={14} /> },
      { href: "/owner/settings", label: "Settings", icon: <Icon.Settings size={14} /> },
    ],
  },
];

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShellClient
      groups={groups}
      user={{
        name: me.name,
        subline: `Owner · ${me.listings} live listings`,
        avatar: me.avatar,
      }}
      role="owner"
    >
      {children}
    </DashboardShellClient>
  );
}
