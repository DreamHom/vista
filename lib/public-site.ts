export const PUBLIC_PRIMARY_NAV = [
  { href: "/listings", label: "Browse Listings" },
  { href: "/agents", label: "Find an Agent" },
  { href: "/dream-ai", label: "Dream AI" },
  { href: "/list-your-property", label: "List Your Property" },
  { href: "/become-an-agent", label: "Become an Agent" },
] as const;

export const PUBLIC_AUTH_NAV = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Sign Up" },
] as const;

export const PUBLIC_FOOTER_LINKS = [
  { href: "/moniepoint-financing", label: "Moniepoint Financing" },
  { href: "/about", label: "About Us" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact Us" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/press", label: "Press" },
] as const;

export interface StaticPageContent {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
  cta?: {
    href: string;
    label: string;
  };
}

export const STATIC_PAGES: readonly StaticPageContent[] = [
  {
    slug: "about",
    eyebrow: "About DreamHomes",
    title: "A trust-first property platform built for real Nigerian housing journeys.",
    description:
      "DreamHomes exists to replace fake listings, hidden charges, and WhatsApp chaos with a calmer, verified way to discover, compare, and close on a home.",
    sections: [
      {
        heading: "What we believe",
        body: [
          "Home search should feel hopeful, not defensive. That means clear fees, visible trust signals, and honest property information from the first click.",
          "We design for Lagos pressure, Abuja expectations, and Port Harcourt pace, while keeping the experience warm enough for first-time renters and serious enough for investors.",
        ],
      },
      {
        heading: "What makes DreamHomes different",
        body: [
          "Verification is meaningful, not decorative. Owners, agents, and property documents go through separate checks because trust in Nigerian real estate is layered.",
          "Discovery stays open to everyone. You can browse freely, use Dream AI for guidance, and only create an account when you are ready to save, inspect, or make an offer.",
        ],
      },
    ],
    cta: { href: "/verified", label: "See how verification works" },
  },
  {
    slug: "how-it-works",
    eyebrow: "How It Works",
    title: "DreamHomes keeps discovery open and serious actions accountable.",
    description:
      "Browse listings, review trust signals, compare options, then move deeper only when the property feels right.",
    sections: [
      {
        heading: "For applicants",
        body: [
          "Browse without pressure, filter by what matters, and use Dream AI to understand pricing, fees, and inspection prep in plain English.",
          "When you are ready, create an account to save listings, book an inspection, comment publicly, or submit an offer through the platform.",
        ],
      },
      {
        heading: "For owners and agents",
        body: [
          "Owners can list directly or assign an agent. Agents build public credibility through transparent fees, closed-deal history, ratings, and verification.",
          "Every important action leaves a trail, from inspection requests to offers, so nobody has to rely on scattered calls and screenshots.",
        ],
      },
    ],
    cta: { href: "/listings", label: "Start browsing listings" },
  },
  {
    slug: "contact",
    eyebrow: "Contact Us",
    title: "Talk to the DreamHomes team.",
    description:
      "For support, partnerships, press requests, or trust and safety issues, reach out and we will route you to the right person.",
    sections: [
      {
        heading: "Support channels",
        body: [
          "General support: hello@dreamhomes.today",
          "Trust and safety: safety@dreamhomes.today",
          "Partnerships and press: press@dreamhomes.today",
        ],
      },
      {
        heading: "Office hours",
        body: [
          "Monday to Friday, 9:00 AM to 6:00 PM WAT.",
          "Primary office: 23 Admiralty Way, Lekki Phase 1, Lagos.",
        ],
      },
    ],
    cta: { href: "/dream-ai", label: "Ask Dream AI first" },
  },
  {
    slug: "faq",
    eyebrow: "FAQ",
    title: "Clear answers to the questions people ask before they trust a platform.",
    description:
      "These are the practical questions that come up most often across browsing, verification, inspections, and offers.",
    sections: [
      {
        heading: "Do I need an account to browse?",
        body: [
          "No. Public discovery is open by design. You can browse listings, compare options, and view agent profiles before signing up.",
          "You only need an account when you want to save a listing, request an inspection, comment, or make an offer.",
        ],
      },
      {
        heading: "Are there inspection fees?",
        body: [
          "No upfront inspection fees are charged by the platform. If any lister asks for one off-platform, treat that as a red flag and disengage.",
          "Agent fees, service charges, caution fees, and other costs should be surfaced on the listing or profile before you commit.",
        ],
      },
    ],
    cta: { href: "/verified", label: "Read about badge standards" },
  },
  {
    slug: "privacy-policy",
    eyebrow: "Privacy Policy",
    title: "We collect only what is needed to run a trustworthy property platform.",
    description:
      "DreamHomes handles account, verification, and communication data with the minimum detail needed to support discovery, accountability, and platform safety.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Account basics such as name, email, phone, and role, plus listing, inspection, and offer activity connected to your account.",
          "Verification submissions are handled as metadata references for review workflows. Sensitive raw documents should not be embedded directly into the product database.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "To power search, trust signals, notifications, moderation, and secure platform operations.",
          "To keep communication on-platform so disputes can be reviewed and resolved fairly when necessary.",
        ],
      },
    ],
  },
  {
    slug: "terms-and-conditions",
    eyebrow: "Terms & Conditions",
    title: "DreamHomes is a platform for verified discovery, not a substitute for physical due diligence.",
    description:
      "By using DreamHomes, you agree to engage honestly, keep activity on-platform where possible, and avoid deceptive listing or payment behavior.",
    sections: [
      {
        heading: "Platform conduct",
        body: [
          "Owners and agents must provide accurate listing information, disclose charges clearly, and avoid collecting off-platform inspection fees or undisclosed markups.",
          "Applicants must use the platform in good faith, attend booked inspections responsibly, and avoid spam, impersonation, or abuse.",
        ],
      },
      {
        heading: "Important limits",
        body: [
          "DreamHomes surfaces trust signals and moderation workflows, but users should still inspect properties physically and review documents independently before closing a deal.",
          "We may suspend, take down, or restrict accounts and listings that violate trust, transparency, or safety standards.",
        ],
      },
    ],
  },
  {
    slug: "cookie-policy",
    eyebrow: "Cookie Policy",
    title: "Cookies help DreamHomes remember preferences and keep the experience fast.",
    description:
      "We use a small set of essential and analytics cookies to preserve session state, improve performance, and understand what helps users discover homes more effectively.",
    sections: [
      {
        heading: "Essential cookies",
        body: [
          "These support authentication, security, and basic site preferences such as remembering session context and keeping navigation stable.",
          "Without them, core flows like saving listings or staying signed in may not work correctly.",
        ],
      },
      {
        heading: "Analytics cookies",
        body: [
          "These help us understand which search, listing, and trust features actually help users move from browsing to booking an inspection.",
          "We use that insight to improve the product, not to clutter it with cheap growth mechanics.",
        ],
      },
    ],
  },
  {
    slug: "press",
    eyebrow: "Press",
    title: "DreamHomes is building a calmer, more accountable way to transact on property in Nigeria.",
    description:
      "For interviews, product notes, partnerships, and launch stories, our press desk can provide background, assets, and leadership contacts.",
    sections: [
      {
        heading: "What to know",
        body: [
          "DreamHomes focuses on trust, fee transparency, verification, and guided discovery for owners, agents, and applicants.",
          "The product vision is to connect discovery, accountability, and eventually financing into a single premium platform experience.",
        ],
      },
      {
        heading: "Media requests",
        body: [
          "Email press@dreamhomes.today with your deadline, outlet, and the angle you are covering.",
          "Brand assets and approved product screenshots can be shared on request.",
        ],
      },
    ],
  },
] as const;

export function getStaticPage(slug: string) {
  return STATIC_PAGES.find((page) => page.slug === slug);
}
