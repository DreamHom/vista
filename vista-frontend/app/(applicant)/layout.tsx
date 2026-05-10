import { DashboardShellClient } from "@/components/dashboard/dashboard-shell-client";
import { Icon } from "@/components/icons";
import { applicants } from "@/lib/mock-data";

const me = applicants[0];

const groups = [
  {
    title: "Browse & save",
    links: [
      { href: "/dashboard", label: "Overview", icon: <Icon.Home size={14} /> },
      { href: "/dashboard/saved", label: "Saved listings", icon: <Icon.Bookmark size={14} />, badge: 8 },
    ],
  },
  {
    title: "Activity",
    links: [
      { href: "/dashboard/inspections", label: "Inspections", icon: <Icon.Calendar size={14} />, badge: 2 },
      { href: "/dashboard/offers", label: "Offers", icon: <Icon.Coin size={14} />, badge: 1 },
      { href: "/dashboard/messages", label: "Messages", icon: <Icon.Chat size={14} />, badge: 3 },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/dashboard/profile", label: "Profile", icon: <Icon.Users size={14} /> },
      { href: "/dashboard/verification", label: "Verification", icon: <Icon.ShieldCheck size={14} /> },
    ],
  },
];

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShellClient
      groups={groups}
      user={{
        name: me.name,
        subline: `${me.intent === "rent" ? "Renting" : "Buying"} in ${me.city ?? "Lagos"}`,
        avatar: me.avatar,
      }}
      role="applicant"
    >
      {children}
    </DashboardShellClient>
  );
}
