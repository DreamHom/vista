import type {
  Agent,
  AdminVerificationItem,
  AuditLogEntry,
  Comment,
  Conversation,
  InspectionSlot,
  Lead,
  Listing,
  Message,
  Offer,
  Owner,
  Applicant,
} from "./types";

/* ------------------------------------------------------------------ */
/* Photos — Unsplash (free) seeded URLs.                              */
/* These are inline so we don't need an external image config yet.    */
/* ------------------------------------------------------------------ */
const photo = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const owners: Owner[] = [
  {
    id: "own_1",
    name: "Adaeze Okafor",
    avatar: photo("photo-1544005313-94ddf0286df2", 200),
    joinedAt: "2024-08-12",
    verified: true,
    listings: 4,
    city: "Lagos",
  },
  {
    id: "own_2",
    name: "Tunde Bakare",
    avatar: photo("photo-1507003211169-0a1dd7228f2d", 200),
    joinedAt: "2025-02-04",
    verified: false,
    listings: 1,
    city: "Abuja",
  },
  {
    id: "own_3",
    name: "Halima Yusuf",
    avatar: photo("photo-1531123897727-8f129e1688ce", 200),
    joinedAt: "2024-11-21",
    verified: true,
    listings: 7,
    city: "Lagos",
  },
];

export const agents: Agent[] = [
  {
    id: "agt_1",
    name: "Ifeoma Eze",
    headline: "Lekki & Ikoyi specialist · 6 years closing premium rentals",
    bio: "I help young professionals land clean, well-priced apartments on the Island. No surprise fees, no ghost agents in the middle. I either find it for you, or I tell you where to find it.",
    avatar: photo("photo-1573496359142-b8d87734a5a2", 300),
    city: "Lagos",
    areasCovered: ["Lekki Phase 1", "Ikoyi", "Victoria Island", "Oniru"],
    specializations: ["Luxury rentals", "Expat relocations", "Short-let to long-let"],
    rating: 4.9,
    reviews: 128,
    dealsClosed: 214,
    responseRate: 98,
    responseTimeMins: 12,
    feePercent: 10,
    verified: true,
    joinedAt: "2024-03-15",
    languages: ["English", "Igbo"],
  },
  {
    id: "agt_2",
    name: "Babatunde Ade",
    headline: "Mainland family homes · honest pricing, faster paperwork",
    bio: "Family man, 9 years on the mainland. I know which streets flood and which landlords drag. I tell you both before we get there.",
    avatar: photo("photo-1568602471122-7832951cc4c5", 300),
    city: "Lagos",
    areasCovered: ["Yaba", "Surulere", "Gbagada", "Magodo"],
    specializations: ["Family rentals", "Mid-market sales", "Mortgage-ready buyers"],
    rating: 4.7,
    reviews: 86,
    dealsClosed: 157,
    responseRate: 94,
    responseTimeMins: 22,
    feePercent: 8,
    verified: true,
    joinedAt: "2024-05-02",
    languages: ["English", "Yoruba"],
  },
  {
    id: "agt_3",
    name: "Chiamaka Nnamdi",
    headline: "Abuja serviced apartments & corporate placements",
    bio: "Maitama, Asokoro, Wuse. I work with HR teams and embassies, but private clients welcome. Documents come first, vibes come second.",
    avatar: photo("photo-1580489944761-15a19d654956", 300),
    city: "Abuja",
    areasCovered: ["Maitama", "Asokoro", "Wuse 2", "Jabi"],
    specializations: ["Corporate housing", "Diplomatic clients", "Serviced apartments"],
    rating: 4.8,
    reviews: 64,
    dealsClosed: 92,
    responseRate: 96,
    responseTimeMins: 18,
    feePercent: 10,
    verified: true,
    joinedAt: "2024-06-19",
    languages: ["English", "Hausa"],
  },
  {
    id: "agt_4",
    name: "Samuel Ojo",
    headline: "Off-plan & new builds · land-banking advisory",
    bio: "If you're buying for the next ten years instead of this year, talk to me. I track development corridors so you don't buy the wrong dirt.",
    avatar: photo("photo-1500648767791-00dcc994a43e", 300),
    city: "Lagos",
    areasCovered: ["Sangotedo", "Ibeju-Lekki", "Epe", "Awoyaya"],
    specializations: ["Off-plan", "Land", "Investor advisory"],
    rating: 4.6,
    reviews: 41,
    dealsClosed: 68,
    responseRate: 89,
    responseTimeMins: 35,
    feePercent: 5,
    verified: false,
    joinedAt: "2025-01-08",
    languages: ["English", "Yoruba"],
  },
];

export const applicants: Applicant[] = [
  {
    id: "app_1",
    name: "Daniel Olatunji",
    avatar: photo("photo-1535713875002-d1d0cf377fde", 200),
    budgetMin: 1_500_000,
    budgetMax: 2_500_000,
    city: "Lagos",
    intent: "rent",
    trustBadge: true,
    joinedAt: "2025-09-10",
  },
  {
    id: "app_2",
    name: "Zainab Mohammed",
    avatar: photo("photo-1438761681033-6461ffad8d80", 200),
    budgetMin: 60_000_000,
    budgetMax: 90_000_000,
    city: "Abuja",
    intent: "sale",
    trustBadge: false,
    joinedAt: "2026-01-22",
  },
  {
    id: "app_3",
    name: "Kemi Adebayo",
    avatar: photo("photo-1494790108377-be9c29b29330", 200),
    budgetMin: 800_000,
    budgetMax: 1_400_000,
    city: "Lagos",
    intent: "rent",
    trustBadge: true,
    joinedAt: "2025-12-03",
  },
];

export const listings: Listing[] = [
  {
    id: "lst_1",
    slug: "3-bed-lekki-phase-1-quiet-street",
    title: "3-bed apartment, quiet street in Lekki Phase 1",
    purpose: "rent",
    type: "Apartment",
    bedrooms: 3,
    bathrooms: 3,
    toilets: 4,
    area: "Lekki Phase 1",
    city: "Lagos",
    state: "Lagos",
    description:
      "A clean, sunlit 3-bedroom on a quiet residential street, two minutes from Admiralty. Open kitchen, fitted wardrobes, and a balcony that actually catches a breeze. Building has 24/7 power, water treatment, and a gym you'll probably use twice.",
    highlights: [
      "24/7 dedicated power",
      "Treated borehole water",
      "Quiet residential street",
      "On-site gym & pool",
    ],
    amenities: [
      "Air conditioning",
      "Fitted kitchen",
      "Fitted wardrobes",
      "Pool",
      "Gym",
      "CCTV",
      "Estate security",
      "Elevator",
    ],
    fees: {
      rent: 6_500_000,
      caution: 1_000_000,
      serviceCharge: 850_000,
      agencyFee: 650_000,
      legalFee: 650_000,
      rentFrequency: "yearly",
    },
    photos: [
      photo("photo-1502672260266-1c1ef2d93688"),
      photo("photo-1505691938895-1758d7feb511"),
      photo("photo-1493809842364-78817add7ffb"),
      photo("photo-1494526585095-c41746248156"),
    ],
    ownerId: "own_1",
    agentId: "agt_1",
    ownerVerified: true,
    documentsVerified: true,
    status: "live",
    createdAt: "2026-04-22",
    views: 1284,
    saves: 87,
    likes: 64,
    inspections: 14,
    comments: 9,
    virtualTourUrl: "https://example.com/tour/lst_1",
  },
  {
    id: "lst_2",
    slug: "self-contained-yaba-near-unilag",
    title: "Self-contained near UNILAG, freshly repainted",
    purpose: "rent",
    type: "Self-contained",
    bedrooms: 1,
    bathrooms: 1,
    area: "Yaba",
    city: "Lagos",
    state: "Lagos",
    description:
      "Compact, neat self-contained five minutes from UNILAG main gate. New tiles, new paint, prepaid meter. Landlord lives in the next compound, so vibes are calm.",
    highlights: ["Walk to UNILAG", "Prepaid meter", "Newly renovated"],
    amenities: ["Tiled floors", "Wardrobe", "Kitchen", "Bathroom", "Borehole water"],
    fees: {
      rent: 750_000,
      caution: 100_000,
      serviceCharge: 50_000,
      agencyFee: 75_000,
      legalFee: 75_000,
      rentFrequency: "yearly",
    },
    photos: [
      photo("photo-1493809842364-78817add7ffb"),
      photo("photo-1505691938895-1758d7feb511"),
      photo("photo-1494526585095-c41746248156"),
    ],
    ownerId: "own_2",
    ownerVerified: false,
    documentsVerified: false,
    status: "live",
    createdAt: "2026-04-30",
    views: 432,
    saves: 28,
    likes: 19,
    inspections: 4,
    comments: 3,
  },
  {
    id: "lst_3",
    slug: "4-bed-detached-maitama",
    title: "4-bed detached with BQ in Maitama",
    purpose: "sale",
    type: "Detached house",
    bedrooms: 4,
    bathrooms: 5,
    toilets: 6,
    area: "Maitama",
    city: "Abuja",
    state: "FCT",
    description:
      "Tucked behind mature trees on a Maitama close. Four en-suite bedrooms, large family lounge, separate dining, fitted kitchen with breakfast nook, two-room boys' quarters. C of O ready, no encumbrance.",
    highlights: [
      "Certificate of Occupancy ready",
      "Mature, gated close",
      "Boys' quarters included",
      "Walled compound, ample parking",
    ],
    amenities: [
      "Boys' quarters",
      "Family lounge",
      "Fitted kitchen",
      "Walled compound",
      "Borehole + treatment plant",
      "Solar inverter",
    ],
    fees: {
      price: 850_000_000,
      legalFee: 8_500_000,
      agencyFee: 8_500_000,
    },
    photos: [
      photo("photo-1568605114967-8130f3a36994"),
      photo("photo-1600585154340-be6161a56a0c"),
      photo("photo-1600596542815-ffad4c1539a9"),
    ],
    ownerId: "own_3",
    agentId: "agt_3",
    ownerVerified: true,
    documentsVerified: true,
    status: "live",
    createdAt: "2026-04-10",
    views: 2102,
    saves: 156,
    likes: 102,
    inspections: 22,
    comments: 18,
    virtualTourUrl: "https://example.com/tour/lst_3",
  },
  {
    id: "lst_4",
    slug: "2-bed-gbagada-family-friendly",
    title: "2-bed flat in Gbagada, family-friendly estate",
    purpose: "rent",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    toilets: 3,
    area: "Gbagada",
    city: "Lagos",
    state: "Lagos",
    description:
      "A solid 2-bedroom on the second floor of a 4-flat building. Estate has a gate, a small playground, and neighbours who actually say good morning.",
    highlights: ["Family estate", "Children's play area", "Steady power band"],
    amenities: ["Tiled floors", "Wardrobes", "Pop ceiling", "Borehole", "Estate security"],
    fees: {
      rent: 2_200_000,
      caution: 200_000,
      serviceCharge: 250_000,
      agencyFee: 220_000,
      legalFee: 220_000,
      rentFrequency: "yearly",
    },
    photos: [
      photo("photo-1505691938895-1758d7feb511"),
      photo("photo-1502672260266-1c1ef2d93688"),
      photo("photo-1493809842364-78817add7ffb"),
    ],
    ownerId: "own_3",
    agentId: "agt_2",
    ownerVerified: true,
    documentsVerified: false,
    status: "live",
    createdAt: "2026-05-01",
    views: 612,
    saves: 41,
    likes: 23,
    inspections: 6,
    comments: 4,
  },
  {
    id: "lst_5",
    slug: "off-plan-2-bed-sangotedo",
    title: "Off-plan 2-bed in Sangotedo, Moniepoint mortgage-ready",
    purpose: "sale",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: "Sangotedo",
    city: "Lagos",
    state: "Lagos",
    description:
      "A 24-month off-plan in a serviced estate on the Lekki-Epe corridor. Pre-approved for Moniepoint home financing, so you can stretch the down payment without sweating.",
    highlights: [
      "Moniepoint mortgage pre-approved",
      "24-month build, milestone payments",
      "Serviced estate (power, water, security)",
    ],
    amenities: ["Power", "Water treatment", "Security", "Recreation deck", "Mini gym"],
    fees: {
      price: 95_000_000,
      legalFee: 1_500_000,
      agencyFee: 1_500_000,
    },
    photos: [
      photo("photo-1600585154340-be6161a56a0c"),
      photo("photo-1568605114967-8130f3a36994"),
      photo("photo-1600596542815-ffad4c1539a9"),
    ],
    ownerId: "own_1",
    agentId: "agt_4",
    ownerVerified: true,
    documentsVerified: true,
    status: "live",
    createdAt: "2026-04-18",
    views: 1850,
    saves: 134,
    likes: 88,
    inspections: 9,
    comments: 12,
  },
  {
    id: "lst_6",
    slug: "studio-victoria-island",
    title: "Studio in Victoria Island, walk to the office",
    purpose: "rent",
    type: "Studio",
    bedrooms: 0,
    bathrooms: 1,
    area: "Victoria Island",
    city: "Lagos",
    state: "Lagos",
    description:
      "A small, well-laid studio for the person who is mostly out anyway. Furnished, with a tiny kitchenette and a balcony that overlooks a quiet inner road.",
    highlights: ["Walk to office cluster", "Furnished", "24/7 power"],
    amenities: ["Furnished", "Kitchenette", "Air conditioning", "Power", "Lift access"],
    fees: {
      rent: 3_200_000,
      caution: 400_000,
      serviceCharge: 600_000,
      agencyFee: 320_000,
      legalFee: 320_000,
      rentFrequency: "yearly",
    },
    photos: [
      photo("photo-1494526585095-c41746248156"),
      photo("photo-1502672260266-1c1ef2d93688"),
      photo("photo-1505691938895-1758d7feb511"),
    ],
    ownerId: "own_1",
    agentId: "agt_1",
    ownerVerified: true,
    documentsVerified: true,
    status: "live",
    createdAt: "2026-04-26",
    views: 974,
    saves: 52,
    likes: 31,
    inspections: 7,
    comments: 5,
  },
];

export const inspections: InspectionSlot[] = [
  {
    id: "ins_1",
    listingId: "lst_1",
    date: "2026-05-12T10:00:00Z",
    durationMins: 45,
    status: "booked",
    applicantId: "app_1",
  },
  {
    id: "ins_2",
    listingId: "lst_1",
    date: "2026-05-12T13:00:00Z",
    durationMins: 45,
    status: "open",
  },
  {
    id: "ins_3",
    listingId: "lst_3",
    date: "2026-05-14T11:00:00Z",
    durationMins: 60,
    status: "booked",
    applicantId: "app_2",
  },
  {
    id: "ins_4",
    listingId: "lst_4",
    date: "2026-05-09T15:00:00Z",
    durationMins: 30,
    status: "completed",
    applicantId: "app_3",
    notes: "Liked the unit but pushed back on service charge. Will consider counter-offer.",
  },
  {
    id: "ins_5",
    listingId: "lst_2",
    date: "2026-05-08T16:00:00Z",
    durationMins: 30,
    status: "no_show",
    applicantId: "app_3",
  },
];

export const offers: Offer[] = [
  {
    id: "off_1",
    listingId: "lst_1",
    applicantId: "app_1",
    amount: 6_000_000,
    terms: "1 year, single payment, move-in 1st June.",
    status: "countered",
    history: [
      {
        by: "applicant",
        amount: 6_000_000,
        note: "Best I can stretch. Single payment, no agency haggling.",
        at: "2026-05-04T09:12:00Z",
      },
      {
        by: "owner",
        amount: 6_300_000,
        note: "Can do 6.3 with the regular fees. Clean tenant, glad to host.",
        at: "2026-05-05T18:40:00Z",
      },
    ],
    createdAt: "2026-05-04",
  },
  {
    id: "off_2",
    listingId: "lst_3",
    applicantId: "app_2",
    amount: 800_000_000,
    terms: "Cash + Moniepoint mortgage top-up. Closing in 6 weeks.",
    status: "submitted",
    history: [
      {
        by: "applicant",
        amount: 800_000_000,
        note: "Subject to clean title verification.",
        at: "2026-05-06T11:00:00Z",
      },
    ],
    createdAt: "2026-05-06",
  },
];

export const leads: Lead[] = [
  {
    id: "ld_1",
    listingId: "lst_1",
    applicantId: "app_1",
    temperature: "hot",
    source: "search",
    lastActivityAt: "2026-05-05T18:40:00Z",
  },
  {
    id: "ld_2",
    listingId: "lst_1",
    applicantId: "app_3",
    temperature: "warm",
    source: "dream-ai",
    lastActivityAt: "2026-05-06T08:15:00Z",
  },
  {
    id: "ld_3",
    listingId: "lst_4",
    applicantId: "app_3",
    temperature: "warm",
    source: "search",
    lastActivityAt: "2026-05-09T15:30:00Z",
  },
  {
    id: "ld_4",
    listingId: "lst_3",
    applicantId: "app_2",
    temperature: "hot",
    source: "agent",
    lastActivityAt: "2026-05-06T11:00:00Z",
  },
];

export const comments: Comment[] = [
  {
    id: "cm_1",
    listingId: "lst_1",
    applicantId: "app_3",
    body: "Is the service charge yearly or quarterly? And does it cover the gym?",
    createdAt: "2026-05-02T10:30:00Z",
    likes: 6,
    replies: [
      {
        by: "agent",
        body: "Yearly, and yes — gym, pool, common areas, and lift maintenance all sit inside it.",
        at: "2026-05-02T12:10:00Z",
      },
    ],
  },
  {
    id: "cm_2",
    listingId: "lst_1",
    applicantId: "app_1",
    body: "What's the situation with parking? Two cars or one?",
    createdAt: "2026-05-03T08:00:00Z",
    likes: 3,
    replies: [
      {
        by: "owner",
        body: "Two dedicated bays per unit, plus visitor parking by the gate.",
        at: "2026-05-03T08:45:00Z",
      },
    ],
  },
  {
    id: "cm_3",
    listingId: "lst_5",
    applicantId: "app_2",
    body: "Can the Moniepoint mortgage cover up to 70% on this?",
    createdAt: "2026-05-04T14:20:00Z",
    likes: 11,
    replies: [
      {
        by: "agent",
        body: "Up to 70% subject to your credit profile. The estate is on the pre-approved list, so the property side is sorted.",
        at: "2026-05-04T16:00:00Z",
      },
    ],
  },
];

export const conversations: Conversation[] = [
  {
    id: "cv_1",
    participantIds: ["app_1", "agt_1"],
    preview: "Great, see you Thursday at 10. Bring an ID for the gate.",
    unread: 0,
    updatedAt: "2026-05-08T17:30:00Z",
    context: { listingId: "lst_1" },
  },
  {
    id: "cv_2",
    participantIds: ["app_2", "agt_3"],
    preview: "I've shared the C of O scan. Have your lawyer take a look.",
    unread: 1,
    updatedAt: "2026-05-09T09:10:00Z",
    context: { listingId: "lst_3" },
  },
  {
    id: "cv_3",
    participantIds: ["own_3", "agt_2"],
    preview: "I'll lower the asking by 100k if we can close before month-end.",
    unread: 0,
    updatedAt: "2026-05-07T15:45:00Z",
    context: { listingId: "lst_4" },
  },
];

export const messages: Message[] = [
  {
    id: "m_1",
    conversationId: "cv_1",
    senderId: "app_1",
    body: "Hi Ifeoma, I'd like to inspect the Lekki Phase 1 listing. Thursday morning if possible?",
    at: "2026-05-08T16:50:00Z",
  },
  {
    id: "m_2",
    conversationId: "cv_1",
    senderId: "agt_1",
    body: "10am works. The estate uses a one-time visitor pass — I'll send you the QR an hour before.",
    at: "2026-05-08T17:10:00Z",
  },
  {
    id: "m_3",
    conversationId: "cv_1",
    senderId: "app_1",
    body: "Perfect. Anything I should bring?",
    at: "2026-05-08T17:20:00Z",
  },
  {
    id: "m_4",
    conversationId: "cv_1",
    senderId: "agt_1",
    body: "Great, see you Thursday at 10. Bring an ID for the gate.",
    at: "2026-05-08T17:30:00Z",
  },
];

export const verificationQueue: AdminVerificationItem[] = [
  {
    id: "vq_1",
    track: "owner",
    subject: "Tunde Bakare",
    submittedAt: "2026-05-06T10:00:00Z",
    status: "pending",
    documents: ["NIN slip", "Utility bill"],
    submittedBy: "own_2",
  },
  {
    id: "vq_2",
    track: "agent",
    subject: "Samuel Ojo",
    submittedAt: "2026-05-04T14:30:00Z",
    status: "pending",
    documents: ["NIESV license", "CAC certificate"],
    submittedBy: "agt_4",
  },
  {
    id: "vq_3",
    track: "property",
    subject: "Self-contained near UNILAG, freshly repainted",
    submittedAt: "2026-05-05T08:20:00Z",
    status: "pending",
    documents: ["Tenancy agreement", "Receipts"],
    submittedBy: "own_2",
  },
  {
    id: "vq_4",
    track: "applicant",
    subject: "Zainab Mohammed",
    submittedAt: "2026-05-07T18:10:00Z",
    status: "pending",
    documents: ["Drivers license"],
    submittedBy: "app_2",
  },
];

export const auditLog: AuditLogEntry[] = [
  {
    id: "al_1",
    actor: "admin@dreamhomes.ng",
    action: "VERIFY_OWNER",
    target: "Adaeze Okafor (own_1)",
    at: "2026-05-09T08:30:00Z",
    meta: "Approved · NIN + utility bill matched.",
  },
  {
    id: "al_2",
    actor: "admin@dreamhomes.ng",
    action: "TAKEDOWN_LISTING",
    target: "lst_8 — '2-bed Lekki executive'",
    at: "2026-05-08T16:10:00Z",
    meta: "Duplicate of lst_1, fake photos. Owner notified.",
  },
  {
    id: "al_3",
    actor: "admin@dreamhomes.ng",
    action: "SUSPEND_AGENT",
    target: "agt_99 — Patrick Bem",
    at: "2026-05-07T13:45:00Z",
    meta: "3 verified fraud reports in 7 days.",
  },
  {
    id: "al_4",
    actor: "admin@dreamhomes.ng",
    action: "PROMOTE_LISTING",
    target: "lst_5 — Off-plan Sangotedo",
    at: "2026-05-06T09:00:00Z",
    meta: "Featured for 14 days · ad slot A1.",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers — used by pages to resolve relations                       */
/* ------------------------------------------------------------------ */

export function getListing(id: string): Listing | undefined {
  return listings.find((l) => l.id === id || l.slug === id);
}

export function getAgent(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

export function getOwner(id: string): Owner | undefined {
  return owners.find((o) => o.id === id);
}

export function getApplicant(id: string): Applicant | undefined {
  return applicants.find((a) => a.id === id);
}

export function getCommentsFor(listingId: string): Comment[] {
  return comments.filter((c) => c.listingId === listingId);
}

export function getInspectionsFor(listingId: string): InspectionSlot[] {
  return inspections.filter((i) => i.listingId === listingId);
}

export function getOffersFor(listingId: string): Offer[] {
  return offers.filter((o) => o.listingId === listingId);
}

export function getLeadsFor(listingId: string): Lead[] {
  return leads.filter((l) => l.listingId === listingId);
}
