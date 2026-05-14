export interface PolicySection {
  id: string;
  heading: string;
  /** Main narrative paragraphs. */
  body: readonly string[];
  /** Optional supporting list rendered under the paragraphs. */
  bullets?: readonly string[];
}

export interface PolicyDocument {
  slug: "privacy" | "terms" | "cookies";
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  contactEmail: string;
  sections: readonly PolicySection[];
}

export const POLICY_DOCUMENTS: readonly PolicyDocument[] = [
  {
    slug: "privacy",
    eyebrow: "Privacy Policy",
    title: "How DreamHomes collects, uses, and protects your information.",
    description:
      "DreamHomes connects applicants, owners, and agents around high-stakes property decisions. This policy explains what we process, why we process it, how long we keep it, and the choices you have. It is written to be readable first and precise second.",
    lastUpdated: "May 14, 2026",
    contactEmail: "privacy@dreamhomes.today",
    sections: [
      {
        id: "introduction",
        heading: "Introduction and scope",
        body: [
          "This Privacy Policy applies to the DreamHomes website, web applications, and related services that link to this page (together, the \"Services\"). It describes how DreamHomes processes personal data when you browse listings, create an account, verify identity or property documents, book inspections, exchange messages, or otherwise interact with the platform.",
          "Where listings, offers, or verification data are synchronized with our Haven backend or other processors, those systems operate under agreements that require appropriate confidentiality and security. This policy focuses on what you should expect at the product level.",
        ],
      },
      {
        id: "controller",
        heading: "Who is responsible for your data",
        body: [
          "DreamHomes acts as the primary controller for account, product usage, and support data collected through the Services. Some workflows (for example, regulated verification checks) may involve specialised partners who process data strictly on documented instructions.",
          "If you interact with an owner or agent through the platform, they may also hold copies of messages or documents you share with them. Their use of that information is governed by their own legal obligations and, where applicable, separate agreements with DreamHomes.",
        ],
      },
      {
        id: "what-we-collect",
        heading: "Information we collect",
        body: [
          "We collect information in three broad ways: information you provide directly, information generated when you use the Services, and limited information from third parties where needed for safety or verification.",
        ],
        bullets: [
          "Account and profile data: full name, email address, phone number, password hash, role (applicant, owner, or agent), and optional profile fields you choose to add.",
          "Property and transaction context: listing descriptions, media, pricing, availability, inspection slots you book or offer, saved listings, questions in public Q&A threads, and offer-related metadata.",
          "Verification and trust data: government identifiers or property documents you upload where the product requests them, status of verification checks, and audit logs needed to evidence compliance.",
          "Technical and security data: device type, browser, approximate location derived from IP, session tokens, timestamps, and diagnostic logs that help us detect abuse or recover from incidents.",
          "Support and communications: messages you send to DreamHomes support, call notes where you consent, and records of how we resolved your request.",
        ],
      },
      {
        id: "how-we-use",
        heading: "How we use information",
        body: [
          "We only use personal data for defined purposes. We do not sell your personal information and we do not build hidden behavioural profiles to resell to unrelated advertisers.",
        ],
        bullets: [
          "To create and secure your account, authenticate sessions, reset passwords, and prevent credential stuffing or account takeover.",
          "To operate discovery, search, comparison, and Dream AI features you explicitly invoke, including saving preferences you set.",
          "To coordinate inspections, notifications, and on-platform messaging so owners, agents, and applicants stay aligned.",
          "To operate verification and moderation workflows, investigate reports, enforce our Terms, and meet lawful requests from regulators where required.",
          "To measure reliability, fix bugs, plan product improvements, and generate aggregated statistics that do not identify individuals.",
          "To send service messages (for example, booking confirmations or security alerts). Marketing emails, where we send them at all, are optional and controlled by preference centres.",
        ],
      },
      {
        id: "legal-bases",
        heading: "Legal bases (where they apply)",
        body: [
          "Depending on your location, privacy laws may require us to point to a \"legal basis\" for processing. DreamHomes is built with Nigeria-first operations, but we describe common bases here for transparency.",
        ],
        bullets: [
          "Contract: processing needed to deliver the Services you request, such as hosting your account or routing an inspection request.",
          "Legitimate interests: processing needed to secure the platform, prevent fraud, improve reliability, and communicate proportionate product updates, balanced against your rights.",
          "Legal obligation: processing we must perform to comply with applicable law, court orders, or lawful regulatory instructions.",
          "Consent: processing that is not strictly necessary, such as certain analytics cookies or optional marketing, where we ask for consent and you can withdraw it without losing core functionality.",
        ],
      },
      {
        id: "cookies",
        heading: "Cookies and similar technologies",
        body: [
          "We use cookies and similar storage to keep sessions stable, remember UI preferences, and understand aggregate traffic patterns. A dedicated Cookie Policy explains categories, retention, and controls in more detail.",
          "You can review the Cookie Policy at any time. Browser settings remain the primary way to block non-essential cookies, though doing so may affect parts of the experience.",
        ],
      },
      {
        id: "sharing",
        heading: "Sharing, subprocessors, and on-platform visibility",
        body: [
          "We share personal data only where needed to run the Services, comply with law, or protect people on the platform.",
        ],
        bullets: [
          "With other users where the product requires it, such as showing your name to an agent when you book an inspection, or publishing listing media you submit as an owner.",
          "With infrastructure and communications vendors who host servers, deliver email or SMS, monitor uptime, or provide security tooling under strict contracts.",
          "With professional advisers (lawyers, accountants) under confidentiality, and with acquirers as part of a lawful merger or asset sale subject to continuity protections.",
          "With authorities when we believe disclosure is required to prevent harm, investigate illegal activity, or respond to lawful requests after appropriate review.",
        ],
      },
      {
        id: "retention",
        heading: "Retention",
        body: [
          "We retain personal data for as long as your account is active, as long as needed to provide follow-on services (for example, dispute resolution), and as long as law or prudent record-keeping requires.",
          "Verification artefacts may be retained longer than casual browsing data because they support auditability and trust signals. When retention periods end, we delete or irreversibly anonymise data where technically feasible.",
        ],
      },
      {
        id: "security",
        heading: "Security",
        body: [
          "We implement administrative, technical, and physical safeguards appropriate to the sensitivity of the data we handle. Examples include encrypted transport for web traffic, access controls on production systems, logging for security investigations, and least-privilege policies for internal staff.",
          "No online service can guarantee perfect security. You should use a unique password, enable any second-factor option we offer, and report suspected compromise immediately so we can help protect your account.",
        ],
      },
      {
        id: "rights",
        heading: "Your rights and choices",
        body: [
          "We want you to stay in control of your information. Depending on applicable law, you may have rights to access, correct, delete, export, or restrict certain processing, and to object to processing based on legitimate interests.",
        ],
        bullets: [
          "Account holders can update many profile fields directly in product settings.",
          "You may request a copy of personal data we hold about you, subject to identity verification and legal exceptions.",
          "You may request deletion of your account where no overriding legal obligation requires retention. Some records may persist in encrypted backups for a limited period before rotation.",
          "You may opt out of non-essential marketing communications through unsubscribe links or preference centres.",
        ],
      },
      {
        id: "international",
        heading: "Cross-border transfers",
        body: [
          "DreamHomes infrastructure may span regions chosen for reliability and latency. Where personal data moves across borders, we implement safeguards such as contractual clauses or equivalent measures required by applicable law.",
        ],
      },
      {
        id: "children",
        heading: "Children",
        body: [
          "The Services are not directed to children under the age where they can lawfully enter contracts in their jurisdiction without guardian involvement. We do not knowingly collect personal information from children for marketing purposes.",
          "If you believe a child has provided us personal data without appropriate authority, contact us and we will take prompt steps to investigate and delete information where appropriate.",
        ],
      },
      {
        id: "automated",
        heading: "Automated recommendations",
        body: [
          "Some features (including parts of Dream AI) may rank or suggest listings based on signals you provide, such as budget, location, or amenities. These systems are designed to assist, not replace, your judgement.",
          "You can usually understand the main inputs influencing a suggestion by reviewing the prompts or filters you supplied. If you have concerns about a materially automated decision with legal effect, contact us and we will explain the logic at a high level where feasible.",
        ],
      },
      {
        id: "changes",
        heading: "Changes to this policy",
        body: [
          "We may update this Privacy Policy as the product evolves or as law changes. When we make material changes, we will post the updated policy, revise the \"Last updated\" date, and use reasonable in-product notices or email where appropriate.",
          "Continued use of the Services after the effective date of an update constitutes your acceptance of the revised policy, except where your explicit consent is required for new processing.",
        ],
      },
      {
        id: "contact",
        heading: "Contact and complaints",
        body: [
          "Questions about this Privacy Policy or our data practices should be sent to the contact email shown in the header of this page. We aim to acknowledge substantive requests within a few business days and resolve them without undue delay.",
          "If you are not satisfied with our response and applicable law provides a right to escalate, you may contact your local data protection authority. We will cooperate in good faith with regulators.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    eyebrow: "Terms & Conditions",
    title: "The agreement between you and DreamHomes when you use the platform.",
    description:
      "These Terms explain the rules for browsing, registering, listing properties, coordinating inspections, and exchanging messages on DreamHomes. They also describe what we do not do (we are not your lawyer, surveyor, or bank) and how disputes are handled.",
    lastUpdated: "May 14, 2026",
    contactEmail: "legal@dreamhomes.today",
    sections: [
      {
        id: "agreement",
        heading: "Agreement to these Terms",
        body: [
          "By accessing or using the Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must stop using the Services.",
          "If you use the Services on behalf of a company or agency, you represent that you have authority to bind that organisation, and \"you\" in these Terms includes the organisation where context requires.",
        ],
      },
      {
        id: "eligibility",
        heading: "Eligibility and accounts",
        body: [
          "You must be old enough to form a binding contract in your jurisdiction and must not be barred from using the Services under applicable law.",
          "You are responsible for maintaining accurate account information and for safeguarding credentials. Notify us promptly if you suspect unauthorised access.",
        ],
        bullets: [
          "You may not share login credentials with unrelated third parties or operate multiple accounts to evade enforcement.",
          "We may require verification before unlocking certain actions, such as publishing listings or booking inspections.",
        ],
      },
      {
        id: "roles",
        heading: "Roles and expectations",
        body: [
          "DreamHomes supports applicants searching for homes, owners marketing properties, and agents acting with proper authority. Each role carries distinct responsibilities.",
        ],
        bullets: [
          "Applicants should communicate honestly about intent, budget, and timing, and should respect agents' and owners' time when booking inspections.",
          "Owners must have the right to market the property, must disclose material facts they know, and must honour availability and pricing representations unless legitimately updated in the product.",
          "Agents must hold valid licensing where required, must act within the scope of their mandate from owners, and must not misrepresent exclusivity or buyer interest.",
        ],
      },
      {
        id: "listings",
        heading: "Listings, media, and pricing",
        body: [
          "Listings must reflect real properties available on represented terms. You may not upload deceptive imagery, fake comparables, or addresses you do not control.",
          "Fees such as agency fees, service charges, or caution deposits should be described clearly. Material changes to price or availability should be updated promptly to avoid wasted inspections.",
        ],
      },
      {
        id: "verification-badges",
        heading: "Verification badges and trust signals",
        body: [
          "DreamHomes may display badges or labels that indicate a documented review step was completed at a point in time (for example identity checks for owners, ownership or property records, or professional credentials for agents). A badge describes a review process, not a guarantee about future behaviour, legal title, physical condition, or whether a deal will complete.",
          "You should still carry out your own viewings, inspections, and legal and financial due diligence. Where the product references typical approval rates or review standards, those figures are illustrative and may change as our processes evolve.",
        ],
        bullets: [
          "The clearest plain-language explanation of each badge is on the Verified explainer page linked from the product.",
          "Badges do not override these Terms, including the Disclaimers and Limitation of liability sections, and are not a warranty of any particular outcome.",
        ],
      },
      {
        id: "conduct",
        heading: "Acceptable use and prohibited conduct",
        body: [
          "We expect professional, lawful behaviour. The list below is illustrative, not exhaustive.",
        ],
        bullets: [
          "No harassment, hate speech, threats, or discrimination against individuals or groups.",
          "No fraud, phishing, money laundering, or attempts to move payments off-platform to evade documentation.",
          "No scraping, reverse engineering, or automated access that degrades performance or bypasses rate limits without written permission.",
          "No circumvention of safety features, verification gates, or reporting workflows.",
        ],
      },
      {
        id: "inspections-offers",
        heading: "Inspections, offers, and communications",
        body: [
          "DreamHomes provides tooling to coordinate inspections and document interest. Final contracts, payments, and legal transfer of title occur between parties and their advisers in the real world unless and until integrated payment products say otherwise in a separate agreement.",
          "You should keep material negotiations on-platform where possible so there is a clear record if a dispute arises.",
        ],
      },
      {
        id: "ip",
        heading: "Content and intellectual property",
        body: [
          "You retain ownership of content you upload. You grant DreamHomes a worldwide, non-exclusive licence to host, reproduce, adapt, display, and distribute that content solely to operate, promote, and improve the Services.",
          "You confirm you have all rights needed to grant that licence for photos, floor plans, and descriptions you submit. DreamHomes branding, software, and documentation remain our intellectual property.",
        ],
      },
      {
        id: "third-parties",
        heading: "Third-party services and links",
        body: [
          "The Services may link to third-party websites, map tiles, or document viewers. Those services have their own terms and privacy policies. DreamHomes is not responsible for their content or practices.",
        ],
      },
      {
        id: "disclaimers",
        heading: "Disclaimers",
        body: [
          "The Services are provided on an \"as is\" and \"as available\" basis to the maximum extent permitted by law. We disclaim implied warranties such as merchantability, fitness for a particular purpose, and non-infringement except where such disclaimers are not legally permitted.",
          "DreamHomes does not warrant that listings are free from defects, that transactions will complete, or that partners (including payment or verification providers) will never experience outages.",
        ],
      },
      {
        id: "liability",
        heading: "Limitation of liability",
        body: [
          "To the maximum extent permitted by law, DreamHomes and its affiliates, directors, employees, and suppliers will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, goodwill, or data, arising out of or in connection with the Services.",
          "Where liability cannot be excluded, our aggregate liability arising out of or relating to the Services in any twelve-month period is limited to the greater of (a) the fees you paid to DreamHomes for the Services in that period, or (b) a reasonable capped amount where you use free features only. Some jurisdictions do not allow certain limitations; in those cases our liability is limited to the fullest extent still permitted.",
        ],
      },
      {
        id: "indemnity",
        heading: "Indemnity",
        body: [
          "You will defend, indemnify, and hold harmless DreamHomes from claims, damages, losses, and expenses (including reasonable legal fees) arising from your content, your use of the Services, or your breach of these Terms, except to the extent caused by our wilful misconduct.",
        ],
      },
      {
        id: "suspension",
        heading: "Suspension, termination, and enforcement",
        body: [
          "We may suspend or terminate access to the Services if we reasonably believe you have violated these Terms, created risk for others, or must comply with law.",
          "You may stop using the Services at any time. Certain provisions survive termination, including intellectual property licences to the extent needed to retain archival copies, indemnity, disclaimers, and limitations of liability.",
        ],
      },
      {
        id: "law",
        heading: "Governing law and disputes",
        body: [
          "These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to conflict-of-law rules that would require another jurisdiction's law to apply.",
          "Parties will first attempt to resolve disputes in good faith through support channels. If a dispute cannot be resolved informally, exclusive jurisdiction and venue will lie with the courts of Lagos State, Nigeria, unless mandatory consumer protections in your home jurisdiction require otherwise.",
        ],
      },
      {
        id: "changes-terms",
        heading: "Changes to these Terms",
        body: [
          "We may modify these Terms as the Services evolve. We will post the updated Terms and update the \"Last updated\" date. Material changes may include additional notice in-product or by email where appropriate.",
          "If you continue to use the Services after changes become effective, you accept the revised Terms. If you do not agree, you must stop using the Services.",
        ],
      },
      {
        id: "contact-terms",
        heading: "Contact",
        body: [
          "Legal questions about these Terms should be sent to the contact email shown in the header of this page. Operational questions can also be routed through the Contact page so the right team can respond quickly.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    eyebrow: "Cookie Policy",
    title: "How cookies and similar technologies support DreamHomes.",
    description:
      "Cookies help us keep sessions reliable, remember lightweight preferences, and understand which parts of the discovery experience genuinely help people without turning the product into a noisy ad surface.",
    lastUpdated: "May 14, 2026",
    contactEmail: "privacy@dreamhomes.today",
    sections: [
      {
        id: "what-cookies",
        heading: "What we mean by cookies",
        body: [
          "When this policy says \"cookies\", it includes HTTP cookies, local storage, session storage, and similar technologies that store small pieces of information in your browser.",
        ],
      },
      {
        id: "essential-cookies",
        heading: "Essential cookies",
        body: [
          "Essential cookies are required for core functionality such as authentication, load balancing, security tokens, and fraud prevention. They may persist for the length of your session or slightly longer where needed for stability.",
        ],
      },
      {
        id: "preferences",
        heading: "Preference cookies",
        body: [
          "Preference cookies remember choices such as locale, accessibility settings, or UI density where we expose those controls. Disabling them may reset some choices on each visit.",
        ],
      },
      {
        id: "analytics-cookies",
        heading: "Analytics cookies",
        body: [
          "Where enabled, analytics cookies help us understand aggregate navigation patterns, such as which filters are confusing or where people abandon inspection booking flows.",
          "We configure analytics to minimise personal data where possible and to avoid building cross-site advertising profiles unrelated to DreamHomes.",
        ],
      },
      {
        id: "control",
        heading: "Your controls",
        body: [
          "Most browsers let you block or delete cookies. You can also use private browsing modes for ephemeral sessions. Blocking all cookies may break sign-in or security-sensitive flows.",
          "Questions about this Cookie Policy can be sent to the contact email shown on this page.",
        ],
      },
    ],
  },
] as const;

export function getPolicyDocument(slug: string) {
  return POLICY_DOCUMENTS.find((document) => document.slug === slug);
}
