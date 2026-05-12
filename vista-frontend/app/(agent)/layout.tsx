import { DashboardShellClient } from "@/components/dashboard/dashboard-shell-client";
import { Icon } from "@/components/icons";
import {
  meToShellUser,
  requireSessionRole,
} from "@/lib/api/session-user";

const groups = [
  {
    title: "Workspace",
    links: [
      { href: "/agent", label: "Overview", icon: <Icon.Home size={14} /> },
      {
        href: "/agent/listings",
        label: "Listings",
        icon: <Icon.Building size={14} />,
      },
      { href: "/agent/leads", label: "Leads", icon: <Icon.Chart size={14} /> },
    ],
  },
  {
    title: "Pipeline",
    links: [
      {
        href: "/agent/inspections",
        label: "Inspections",
        icon: <Icon.Calendar size={14} />,
      },
      { href: "/agent/offers", label: "Offers", icon: <Icon.Coin size={14} /> },
      {
        href: "/agent/messages",
        label: "Messages",
        icon: <Icon.Chat size={14} />,
      },
    ],
  },
  {
    title: "Account",
    links: [
      {
        href: "/agent/profile",
        label: "Public profile",
        icon: <Icon.Users size={14} />,
      },
      {
        href: "/agent/credentials",
        label: "Credentials",
        icon: <Icon.ShieldCheck size={14} />,
      },
      {
        href: "/agent/settings",
        label: "Settings",
        icon: <Icon.Settings size={14} />,
      },
    ],
  },
];

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await requireSessionRole("AGENT", "/agent");

  return (
    <DashboardShellClient
      groups={groups}
      user={meToShellUser(me)}
      role="agent"
    >
      {children}
    </DashboardShellClient>
  );
}
