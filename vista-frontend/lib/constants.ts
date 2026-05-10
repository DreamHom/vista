export const BRAND = {
  name: "DreamHomes",
  product: "Vista",
  tagline: "Making dreams come true, one home at a time.",
  shortPitch:
    "List, find, finance and move. Verified listings, verified agents, no WhatsApp surprises.",
  partner: "Moniepoint",
} as const;

export const NAV_LINKS = [
  { href: "/listings", label: "Browse" },
  { href: "/agents", label: "Agents" },
  { href: "/dream", label: "Dream AI" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/trust-and-safety", label: "Trust" },
] as const;

export const FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { href: "/listings", label: "Browse listings" },
      { href: "/agents", label: "Find an agent" },
      { href: "/dream", label: "Dream AI" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "For",
    links: [
      { href: "/for-applicants", label: "Renters & buyers" },
      { href: "/for-owners", label: "Property owners" },
      { href: "/for-agents", label: "Agents" },
      { href: "/about", label: "Admins & ops" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/trust-and-safety", label: "Trust & safety" },
      { href: "/contact", label: "Contact" },
      { href: "/how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of service" },
      { href: "/legal/privacy", label: "Privacy policy" },
    ],
  },
] as const;

export const PROPERTY_TYPES = [
  "Apartment",
  "Self-contained",
  "Duplex",
  "Bungalow",
  "Terrace",
  "Detached house",
  "Studio",
  "Penthouse",
  "Land",
  "Commercial",
] as const;

export const LEAD_TEMPERATURES = [
  { id: "cold", label: "Saved", description: "On their watchlist." },
  { id: "warm", label: "Inspection requested", description: "Wants to see it." },
  { id: "hot", label: "Offer submitted", description: "Putting money down." },
] as const;
