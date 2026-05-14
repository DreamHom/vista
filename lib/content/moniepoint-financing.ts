/**
 * Marketing copy for the Moniepoint Financing partner page.
 * Framed as a human story + education; product facts align with Moniepoint’s
 * public positioning (business credit, simplified access).
 */

export const MONIEPOINT_FINANCING = {
  hero: {
    eyebrow: "Financing partner",
    title: "The quiet part of a home story is almost always money.",
    lead:
      "DreamHomes is about trust, clarity, and hope in Nigerian property. Moniepoint is about making financial access feel less like a wall and more like a door. Together, that is the spirit we want around the biggest decision many families ever make.",
  },
  whatItIs: {
    heading: "What Moniepoint Financing means on this journey",
    paragraphs: [
      "A home is never just square metres and an asking price. It is school runs, parents moving closer, a first rental that finally feels safe, or a small business that outgrew the spare room. Those stories almost always bump into one question: do we have the runway to move now, or do we wait another year?",
      "Moniepoint has built a reputation for meeting people where money feels hardest: running a business, smoothing cash flow, and accessing credit without the theatre of endless paperwork. Their public credit narrative is centred on simplified business financing so owners can hire, stock up, and grow with fewer dead ends.",
      "DreamHomes does not originate loans. We are a property platform. We spotlight Moniepoint because their mission rhymes with ours: fewer sharp edges between people and the next chapter they are trying to reach.",
    ],
  },
  howItWorks: {
    heading: "How it tends to work (in plain language)",
    intro:
      "Exact products, limits, and timelines live with Moniepoint and can change. The shape of the journey, though, is reassuringly human.",
    steps: [
      {
        title: "A relationship with money that shows up in the data",
        body: "Moniepoint’s business loan journeys often emphasise consistent activity in a business account over time, because patterns tell a truer story than a single snapshot.",
      },
      {
        title: "Apply without turning your week into a scavenger hunt",
        body: "The pitch is simple: fewer hoops, clearer expectations, and a path designed for busy operators who cannot pause their shop for three days of mystery forms.",
      },
      {
        title: "Credit that matches the rhythm of real work",
        body: "Flexible amounts and repayment cadences are built around businesses that breathe weekly or daily, not around a fantasy spreadsheet month that never arrives.",
      },
      {
        title: "Repay in a way that respects momentum",
        body: "Automated or manual repayments from the same financial home keep the mental load lower, so energy can go back to customers, staff, and family.",
      },
    ],
  },
  bridge: {
    heading: "Why DreamHomes cares about this partnership",
    paragraphs: [
      "Property is emotional even when the spreadsheet says it should not be. We watch renters weigh deposits against school fees. We watch owners delay repairs because cash flow is tight the same month rent remits late. We watch agents stretch themselves thin trying to look bigger than their runway.",
      "None of that is shameful. It is human. Financing partners do not erase hard decisions, but they can change the timing of hope. That is why we reserve space for Moniepoint here: not as a banner ad, but as a nod to the financial courage behind many of the listings you browse.",
    ],
  },
  caseStudies: {
    heading: "Brief voices from the field",
    disclaimer: "Composite vignettes — not testimonials, guarantees, or loan offers.",
    items: [
      {
        name: "Amaka",
        detail: "Fashion retail · Yaba",
        quote: "Working capital after a busy stretch meant restocking before Fashion Week, not turning people away at the door.",
      },
      {
        name: "Tunde & Ngozi",
        detail: "Upgrading · Abuja",
        quote: "A small facility covered the deposit gap for a few weeks so they did not have to borrow from family again.",
      },
      {
        name: "Ibrahim",
        detail: "Independent agency · Lekki",
        quote: "Flexible credit kept marketing and verification going while clients took the time they needed to decide.",
      },
    ],
  },
  cta: {
    heading: "Get started today",
    body: "Your dream home does not need a perfect spreadsheet first — it needs a clear next step. Browse listings on DreamHomes, or talk to us if you want a human sounding board before you move.",
    primaryHref: "/listings",
    primaryLabel: "Get your dream home today",
    heroHint: "Free to browse · Save favourites · No obligation",
    secondaryHref: "/contact",
    secondaryLabel: "Talk to DreamHomes first",
  },
  legalNote:
    "Moniepoint is a separate regulated financial services group. DreamHomes does not make lending decisions, set interest rates, or collect loan applications. Credit is subject to eligibility, approval, and terms set solely by Moniepoint and applicable regulators.",
} as const;
