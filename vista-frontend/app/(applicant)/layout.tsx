import { DashboardShellClient } from "@/components/dashboard/dashboard-shell-client";
import { Icon } from "@/components/icons";
import {
  meToShellUser,
  requireSessionRole,
} from "@/lib/api/session-user";

const groups = [
  {
    title: "Browse & save",
    links: [
      { href: "/dashboard", label: "Overview", icon: <Icon.Home size={14} /> },
      {
        href: "/dashboard/saved",
        label: "Saved listings",
        icon: <Icon.Bookmark size={14} />,
      },
    ],
  },
  {
    title: "Activity",
    links: [
      {
        href: "/dashboard/inspections",
        label: "Inspections",
        icon: <Icon.Calendar size={14} />,
      },
      {
        href: "/dashboard/offers",
        label: "Offers",
        icon: <Icon.Coin size={14} />,
      },
      {
        href: "/dashboard/messages",
        label: "Messages",
        icon: <Icon.Chat size={14} />,
      },
    ],
  },
  {
    title: "Account",
    links: [
      {
        href: "/dashboard/profile",
        label: "Profile",
        icon: <Icon.Users size={14} />,
      },
      {
        href: "/dashboard/verification",
        label: "Verification",
        icon: <Icon.ShieldCheck size={14} />,
      },
    ],
  },
];

export default async function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await requireSessionRole("APPLICANT", "/dashboard");

  return (
    <DashboardShellClient
      groups={groups}
      user={meToShellUser(me)}
      role="applicant"
    >
      {children}
    </DashboardShellClient>
  );
}
