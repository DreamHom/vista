import {
  Activity,
  BadgeDollarSign,
  Bell,
  Building2,
  ClipboardList,
  FileCheck2,
  Flag,
  HandCoins,
  Heart,
  LayoutDashboard,
  MessageSquare,
  MessageSquareMore,
  MessageSquareWarning,
  Search,
  Sparkles,
  Settings,
  ShieldCheck,
  SquareStack,
  Star,
  UserRound,
  UserSearch,
  Users,
  UsersRound,
  View,
} from "lucide-react";

import type { AccountMenuItem } from "@/components/layout/workspace-account-menu";
import type { Role } from "@/lib/types";

/** Shown under role routes in account dropdowns (browse + Dream AI). */
export const ACCOUNT_MENU_GLOBAL_EXTRAS: AccountMenuItem[] = [
  { href: "/listings", label: "Browse listings", icon: ShieldCheck },
  { href: "/dream-ai", label: "Dream AI", icon: Search },
];

const APPLICANT_ITEMS: AccountMenuItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/saved", label: "Saved listings", icon: Heart },
  { href: "/dashboard/inspections", label: "My inspections", icon: ClipboardList },
  { href: "/dashboard/offers", label: "My offers", icon: HandCoins },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "My profile", icon: UserRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const OWNER_ITEMS: AccountMenuItem[] = [
  { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/properties", label: "My properties", icon: Building2 },
  { href: "/owner/leads", label: "Leads", icon: UserSearch },
  { href: "/owner/inspections", label: "Inspections", icon: ClipboardList },
  { href: "/owner/offers", label: "Offers", icon: HandCoins },
  { href: "/owner/agents", label: "Agent management", icon: UsersRound },
  { href: "/owner/comments", label: "Comments", icon: MessageSquareMore },
  { href: "/owner/verification", label: "Verification", icon: FileCheck2 },
  { href: "/owner/notifications", label: "Notifications", icon: Bell },
  { href: "/owner/profile", label: "Profile", icon: UserRound },
  { href: "/owner/settings", label: "Settings", icon: Settings },
];

const AGENT_ITEMS: AccountMenuItem[] = [
  { href: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agent/listings", label: "My listings", icon: View },
  { href: "/agent/inspections", label: "Inspections", icon: ClipboardList },
  { href: "/agent/leads", label: "Leads & pipeline", icon: Users },
  { href: "/agent/offers", label: "Offers", icon: HandCoins },
  { href: "/agent/owners", label: "Owner relationships", icon: MessageSquare },
  { href: "/agent/reviews", label: "Ratings & reviews", icon: Star },
  { href: "/agent/profile", label: "Agent profile", icon: ShieldCheck },
  { href: "/agent/ads", label: "Ads", icon: Sparkles },
  { href: "/agent/notifications", label: "Notifications", icon: Bell },
  { href: "/agent/settings", label: "Settings", icon: Settings },
];

const ADMIN_ITEMS: AccountMenuItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/verification", label: "Verification queues", icon: FileCheck2 },
  { href: "/admin/users", label: "User management", icon: Users },
  { href: "/admin/listings", label: "Listings management", icon: SquareStack },
  { href: "/admin/comments", label: "Comments moderation", icon: MessageSquareWarning },
  { href: "/admin/reports", label: "Reported listings", icon: Flag },
  { href: "/admin/audit", label: "Audit log", icon: Activity },
  { href: "/admin/analytics", label: "Analytics", icon: Bell },
  { href: "/admin/ads", label: "Ads management", icon: BadgeDollarSign },
  { href: "/admin/settings", label: "Platform settings", icon: Settings },
];

export function getAccountMenuItemsForRole(role: Role): AccountMenuItem[] {
  switch (role) {
    case "APPLICANT":
      return APPLICANT_ITEMS;
    case "OWNER":
      return OWNER_ITEMS;
    case "AGENT":
      return AGENT_ITEMS;
    case "ADMIN":
      return ADMIN_ITEMS;
  }
}

export function accountSubtitleForRole(role: Role): string {
  switch (role) {
    case "APPLICANT":
      return "Applicant account";
    case "OWNER":
      return "Owner account";
    case "AGENT":
      return "Agent account";
    case "ADMIN":
      return "Admin account";
  }
}
