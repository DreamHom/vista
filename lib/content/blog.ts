export const BLOG_CATEGORIES = [
  "First Time Renter",
  "Buying Guide",
  "Lagos Market",
  "Legal & Documents",
  "Agent Tips",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface BlogArticle {
  slug: string;
  title: string;
  category: BlogCategory;
  readTime: string;
  excerpt: string;
  featured?: boolean;
  publishedAt: string;
  author: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
}

export const BLOG_ARTICLES: readonly BlogArticle[] = [
  {
    slug: "first-rental-in-lagos-checklist",
    title: "The first rental checklist every Lagos apartment hunter should use",
    category: "First Time Renter",
    readTime: "6 min read",
    excerpt:
      "A practical pre-inspection checklist covering hidden fees, power realities, water pressure, access roads, and landlord questions before you commit.",
    featured: true,
    publishedAt: "May 13, 2026",
    author: "DreamHomes Editorial",
    sections: [
      {
        heading: "Start with the money story",
        paragraphs: [
          "In Lagos, the headline rent rarely tells the whole story. Before you fall in love with a flat, ask for the annual rent, agency fee, legal fee, caution fee, service charge, and any recurring estate levy in one place.",
          "If a lister cannot state those numbers clearly, that confusion will usually get worse after payment, not better.",
        ],
      },
      {
        heading: "Inspect the building like you will live there",
        paragraphs: [
          "Stand in the compound, not just the living room. Check drainage, parking behaviour, refuse handling, stairwell lighting, and whether the building feels maintained when no one is trying to impress you.",
          "Small operational details reveal whether the property will stay calm after move-in.",
        ],
      },
      {
        heading: "Ask the uncomfortable questions early",
        paragraphs: [
          "How many hours of power are realistic? What is the water source? Who pays for repairs? Is there a house rule that will affect visitors, generators, pets, or parking?",
          "Serious landlords and agents should answer clearly without acting offended.",
        ],
      },
    ],
  },
  {
    slug: "buying-with-financing-in-nigeria",
    title: "What to prepare before applying for home financing in Nigeria",
    category: "Buying Guide",
    readTime: "7 min read",
    excerpt:
      "From proof of income to valuation expectations, here is what helps buyers move faster when a financing option becomes available.",
    publishedAt: "May 11, 2026",
    author: "DreamHomes Editorial",
    sections: [
      {
        heading: "Get your paperwork tidy first",
        paragraphs: [
          "Financing conversations move more smoothly when your income record, identification, bank statements, and employment details are already organised.",
          "A buyer who is structurally ready usually negotiates from a calmer position than a buyer who is scrambling for documents mid-process.",
        ],
      },
      {
        heading: "Know your real monthly comfort zone",
        paragraphs: [
          "Borrowing capacity and financial comfort are not the same thing. Build your budget around a payment level that still leaves room for transport, maintenance, service charges, and emergencies.",
        ],
      },
      {
        heading: "Treat the property itself as part of the risk",
        paragraphs: [
          "Even where financing is available, you still need to inspect title quality, neighbourhood dynamics, infrastructure, and long-term livability.",
          "Cheap debt does not rescue a weak property decision.",
        ],
      },
    ],
  },
  {
    slug: "ojodu-yaba-lekki-value-signals",
    title: "Ojodu, Yaba, or Lekki: how to think about value instead of hype",
    category: "Lagos Market",
    readTime: "5 min read",
    excerpt:
      "A practical way to compare commute, lifestyle, pricing pressure, and long-term fit across three very different Lagos search zones.",
    publishedAt: "May 9, 2026",
    author: "DreamHomes Editorial",
    sections: [
      {
        heading: "Value is personal, not universal",
        paragraphs: [
          "Lekki may look aspirational, Yaba may feel practical, and Ojodu may stretch your money further. None of those is automatically the smartest choice.",
          "The right question is whether the location supports your actual weekly rhythm, not whether it wins a status contest.",
        ],
      },
      {
        heading: "Measure time like money",
        paragraphs: [
          "Long commutes quietly tax your quality of life. When comparing neighbourhoods, convert transport time and unpredictability into real emotional and financial cost.",
        ],
      },
    ],
  },
  {
    slug: "documents-that-matter-before-payment",
    title: "The documents that matter before you pay for a rental or purchase",
    category: "Legal & Documents",
    readTime: "8 min read",
    excerpt:
      "A non-lawyer-friendly guide to asking for the right documents, understanding what they mean, and knowing when to pause the transaction.",
    publishedAt: "May 7, 2026",
    author: "DreamHomes Editorial",
    sections: [
      {
        heading: "Do not confuse confidence with proof",
        paragraphs: [
          "A confident agent, a polished inspection, or a polished building does not replace documentary comfort. Ask what establishes ownership, what supports authority to list, and what governs the transaction.",
        ],
      },
      {
        heading: "Pause when the story changes",
        paragraphs: [
          "If the name on the document, the person collecting payment, and the person showing the property do not line up cleanly, slow down and escalate the check.",
        ],
      },
    ],
  },
  {
    slug: "how-agents-build-public-trust",
    title: "How strong agents build trust before the first phone call",
    category: "Agent Tips",
    readTime: "4 min read",
    excerpt:
      "The public signals that help serious agents stand out: clean pricing, quick responses, documented communication, and honest listing information.",
    publishedAt: "May 5, 2026",
    author: "DreamHomes Editorial",
    sections: [
      {
        heading: "Trust starts before contact",
        paragraphs: [
          "Clear fees, realistic listing copy, and visible verification cues reduce friction before a prospect ever reaches out.",
          "The best agents make the first decision easy: 'yes, this person seems organised and safe to deal with.'",
        ],
      },
      {
        heading: "Response quality beats response theatre",
        paragraphs: [
          "Fast replies help, but useful replies matter more. Agents win when they answer clearly, set expectations honestly, and keep decisions documented on-platform.",
        ],
      },
    ],
  },
  {
    slug: "inspection-red-flags-you-shouldnt-ignore",
    title: "Inspection red flags you should never wave away",
    category: "First Time Renter",
    readTime: "5 min read",
    excerpt:
      "From pressure tactics to unexplained fees and suspicious title stories, here are the warning signs that should slow you down immediately.",
    publishedAt: "May 3, 2026",
    author: "DreamHomes Editorial",
    sections: [
      {
        heading: "Urgency is not always legitimacy",
        paragraphs: [
          "If someone tells you three other people are paying today and you must transfer immediately, treat that as pressure, not proof.",
        ],
      },
      {
        heading: "Off-platform money requests are a warning",
        paragraphs: [
          "Any unexpected inspection fee, reservation fee, or account-switching story deserves real scrutiny.",
        ],
      },
    ],
  },
] as const;

export function getBlogArticle(slug: string) {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}

export function getRelatedArticles(article: BlogArticle, limit = 3) {
  return BLOG_ARTICLES.filter((candidate) => candidate.slug !== article.slug)
    .sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category))
    .slice(0, limit);
}
