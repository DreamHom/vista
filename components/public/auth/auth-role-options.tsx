import type { LucideIcon } from "lucide-react";
import { Briefcase, Building2, Home } from "lucide-react";
import type { PublicRole } from "@/lib/types";

export const AUTH_ROLE_OPTIONS: Array<{
  value: PublicRole;
  title: string;
  body: string;
  icon: LucideIcon;
  perks: readonly string[];
}> = [
  {
    value: "APPLICANT",
    title: "I want to find a home",
    body: "Search, shortlist, compare, and book viewings with context carried through every step.",
    icon: Home,
    perks: [
      "Shortlists and Dream AI threads stay on your account",
      "Inspection requests stay documented for agents and owners",
      "One login for renter and buyer journeys",
    ],
  },
  {
    value: "OWNER",
    title: "I want to list my property",
    body: "Publish, verify, and manage serious interest without losing control of your asset.",
    icon: Building2,
    perks: [
      "Owner dashboard tuned for listings and verification",
      "Optional agent assignment with a clear audit trail",
      "Leads, offers, and inspections in one place",
    ],
  },
  {
    value: "AGENT",
    title: "I am a real estate agent",
    body: "Show verified credentials, build trust from real reviews, and keep deals on-platform.",
    icon: Briefcase,
    perks: [
      "Public profile tied to review and activity history",
      "Credential checks you can surface to clients",
      "Pipeline-friendly tools as Haven grows",
    ],
  },
];
