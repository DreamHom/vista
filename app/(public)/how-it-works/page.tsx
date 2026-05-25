import type { Metadata } from "next";
import { HowItWorksTabs } from "@/components/public/how-it-works-tabs";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How applicants, owners, and agents use DreamHomes: browse openly, verify what matters, keep serious steps on-platform.",
};

const TABS = [
  {
    id: "applicants",
    label: "For Applicants",
    ctaHref: "/signup?role=applicant",
    ctaLabel: "Create applicant account",
    steps: [
      {
        title: "Browse and compare without signing up",
        body: "Search listings, compare fees, read trust signals, and use Dream AI before you create an account.",
      },
      {
        title: "Sign up when the shortlist is real",
        body: "Create an account to save listings, ask questions, book inspections, and keep the thread on DreamHomes.",
      },
      {
        title: "Move forward with a visible trail",
        body: "Inspections and offers stay documented on-platform instead of scattered across calls and chat apps.",
      },
    ],
  },
  {
    id: "owners",
    label: "For Owners",
    ctaHref: "/signup?role=owner",
    ctaLabel: "Create owner account",
    steps: [
      {
        title: "Publish your listing",
        body: "Add property details and choose self-serve or agent-led management from the start.",
      },
      {
        title: "Complete verification",
        body: "Submit identity and property documents so buyers and tenants trust the listing faster.",
      },
      {
        title: "Reach serious searchers",
        body: "Show up in browse, compare, and Dream AI flows where budgets and neighbourhoods are already narrowed.",
      },
    ],
  },
  {
    id: "agents",
    label: "For Agents",
    ctaHref: "/signup?role=agent",
    ctaLabel: "Create agent account",
    steps: [
      {
        title: "Register with your licence on file",
        body: "Choose the agent role and submit identity details in one guided signup flow.",
      },
      {
        title: "Earn a badge that means something",
        body: "Credential review backs the verification badge on your public profile.",
      },
      {
        title: "Run viewings and offers on-platform",
        body: "Publish listings, respond to inspections, and let reviews compound where prospects look first.",
      },
    ],
  },
] as const;

export default function HowItWorksPage() {
  return <HowItWorksTabs tabs={TABS} />;
}
