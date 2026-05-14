export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqGroup {
  id: "general" | "applicants" | "owners" | "agents";
  title: string;
  items: readonly FaqItem[];
}

export const FAQ_GROUPS: readonly FaqGroup[] = [
  {
    id: "general",
    title: "General",
    items: [
      {
        question: "Do I need an account to browse DreamHomes?",
        answer:
          "No. Public browsing is open by design. You only need an account when you want to save, comment, request an inspection, or take another serious action on-platform.",
      },
      {
        question: "What does Verified mean on DreamHomes?",
        answer:
          "Verification is role-specific. We separately verify owner identity, agent credentials, and property documents so people can understand what exactly has been checked.",
      },
      {
        question: "Does DreamHomes charge inspection fees?",
        answer:
          "The platform itself does not support upfront inspection fees. If someone requests one unexpectedly, treat that as a warning sign and escalate it.",
      },
    ],
  },
  {
    id: "applicants",
    title: "For Applicants",
    items: [
      {
        question: "How do I know the full cost of a property?",
        answer:
          "Look beyond the headline rent or sale price. Good listings should surface agency fees, legal fees, caution fees, service charges, and other meaningful charges before you commit.",
      },
      {
        question: "Can I use Dream AI before creating an account?",
        answer:
          "Yes. Dream AI is available during public discovery so you can refine your search, understand price context, and prepare for inspections before signing up.",
      },
      {
        question: "What should I do if a listing looks suspicious?",
        answer:
          "Use the report flow and include as much detail as possible. If money has not changed hands yet, slow down the process and keep communication on-platform.",
      },
    ],
  },
  {
    id: "owners",
    title: "For Owners",
    items: [
      {
        question: "Can I list my property without an agent?",
        answer:
          "Yes. Owners can list directly and maintain full control over the listing. Optional agent assignment is there for owners who want extra help with handling leads and inspections.",
      },
      {
        question: "Why should I verify my property?",
        answer:
          "Verification reduces buyer or tenant hesitation because it gives them a clearer trust signal before the first contact. That usually improves the quality of inbound interest.",
      },
      {
        question: "Can buyers access financing through DreamHomes?",
        answer:
          "Where available, DreamHomes can point serious buyers toward financing support, including Moniepoint-linked opportunities referenced in the product vision.",
      },
    ],
  },
  {
    id: "agents",
    title: "For Agents",
    items: [
      {
        question: "What do I need to join as an agent?",
        answer:
          "You should be ready with your full identity details and your real estate license information. CAC registration can strengthen your profile where it applies.",
      },
      {
        question: "Why does DreamHomes show fees publicly?",
        answer:
          "Transparent fee display builds trust and filters in more serious leads. Hidden charges may create short-term leverage but they erode confidence quickly.",
      },
      {
        question: "How do reviews affect my profile?",
        answer:
          "Public reviews and closed-deal signals help prospects decide whether you look reliable before reaching out. Strong communication and honest listings compound over time.",
      },
    ],
  },
] as const;
