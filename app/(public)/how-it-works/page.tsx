import type { Metadata } from "next";
import { HowItWorksTabs } from "@/components/public/how-it-works-tabs";

export const metadata: Metadata = {
  title: "How It Works",
  description: "See how applicants, owners, and agents move through DreamHomes.",
};

const TABS = [
  {
    id: "applicants",
    label: "For Applicants",
    ctaHref: "/signup?role=applicant",
    ctaLabel: "Sign up as Applicant",
    steps: [
      {
        title: "Browse and compare freely",
        body: "Search listings, compare fees, review trust signals, and use Dream AI before creating an account.",
      },
      {
        title: "Create an account when the shortlist gets serious",
        body: "Sign up when you want to save listings, ask questions, request inspections, or move into more documented interaction.",
      },
      {
        title: "Close with more clarity",
        body: "Use DreamHomes to keep inspection and offer activity in one visible trail instead of scattered side chats.",
      },
    ],
  },
  {
    id: "owners",
    label: "For Owners",
    ctaHref: "/signup?role=owner",
    ctaLabel: "Sign up as Owner",
    steps: [
      {
        title: "Create and publish your listing",
        body: "Add the core property details and choose whether you want to manage it directly or work with an agent.",
      },
      {
        title: "Verify what matters",
        body: "Submit the identity and property details that help future buyers or tenants trust your listing faster.",
      },
      {
        title: "Get discovered by serious searchers",
        body: "Appear in DreamHomes browse, compare, and AI-assisted discovery flows where intent is already clearer.",
      },
    ],
  },
  {
    id: "agents",
    label: "For Agents",
    ctaHref: "/signup?role=agent",
    ctaLabel: "Sign up as Agent",
    steps: [
      {
        title: "Build your public trust profile",
        body: "Start with the role, identity, and license information that supports a serious agent story.",
      },
      {
        title: "Show your credibility before contact",
        body: "Surface verification, transparent expectations, and public trust signals that make first contact easier.",
      },
      {
        title: "Track real progress",
        body: "Move from raw lead generation into inspection and deal workflows that remain documented and easier to manage.",
      },
    ],
  },
] as const;

export default function HowItWorksPage() {
  return <HowItWorksTabs tabs={TABS} />;
}
