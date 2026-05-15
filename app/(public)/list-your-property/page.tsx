import type { ReactNode } from "react";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  HandCoins,
  HelpCircle,
  Home,
  House,
  Minus,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "List Your Property",
  description: "Publish where trust signals, visible fees, and serious discovery help owners and tenants meet with less noise.",
};

const VALUE_PILLS = [
  { label: "Trust-first discovery", body: "Verification and fee clarity before the first message." },
  { label: "You stay in control", body: "Self-serve or bring an agent without losing the thread." },
  { label: "One documented trail", body: "Inspections and offers stay on-platform where they belong." },
] as const;

const OFFERINGS = [
  {
    title: "Serious buyers and tenants",
    body: "Your listing sits in a flow built for people who compare, shortlist, and read fees before they call.",
    icon: House,
  },
  {
    title: "Verification that reads",
    body: "Identity and property checks give strangers a reason to trust the listing, not just the photo.",
    icon: ShieldCheck,
  },
  {
    title: "Agent when you want one",
    body: "Publish solo or assign an agent without handing the whole story to a black box.",
    icon: Building2,
  },
  {
    title: "Transparent money story",
    body: "Agency, service, and caution lines show up where applicants expect them, not buried in chat.",
    icon: HandCoins,
  },
] as const;

const OWNER_COMPARE = {
  chaos: [
    "Interest scattered across calls and DMs",
    "Fees explained only after someone is hooked",
    "Hard to prove you are the real owner online",
  ],
  dreamhomes: [
    "Search, shortlist, and chat in one place",
    "Fee fields on the listing card applicants actually read",
    "Verification signals before the first viewing",
  ],
} as const;

const OWNER_REQUIREMENTS: Array<{
  title: string;
  detail: string;
  icon: LucideIcon;
  tag: string;
}> = [
  {
    title: "Proof you can market the home",
    detail: "Title trail or authority to represent the property so we can stand behind what is published.",
    icon: ClipboardList,
    tag: "Required",
  },
  {
    title: "Government-issued ID",
    detail: "Matches your account so escalation and verification stay coherent if something goes wrong.",
    icon: ShieldCheck,
    tag: "Required",
  },
  {
    title: "Agent mandate (optional)",
    detail: "If an agent lists for you, we expect a clear scope of work, not a handshake lost in email.",
    icon: Building2,
    tag: "If represented",
  },
];

const OWNER_STEPS = [
  {
    step: "01",
    title: "Create your owner account",
    body: "Add the property record, choose self-serve or agent-led, and line up the documents you will verify with.",
  },
  {
    step: "02",
    title: "Complete trust checks",
    body: "Identity and property review protects you too: fewer time-wasters and a clearer paper trail.",
  },
  {
    step: "03",
    title: "Go live where people compare",
    body: "Show up in discovery, compare, and Dream AI flows where budgets and neighbourhoods are already narrowed.",
  },
] as const;

const OWNER_PREPARE: Array<{ q: string; a: ReactNode }> = [
  {
    q: "What should I have ready before I publish?",
    a: (
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
        <li className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          Address, title or ownership reference, and realistic availability.
        </li>
        <li className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          Fee lines you are willing to show publicly (agency, service, caution where they apply).
        </li>
        <li className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          Photos you have rights to use, with honest room counts and finishes.
        </li>
      </ul>
    ),
  },
  {
    q: "Can I list without an agent?",
    a: (
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Yes. Owners can publish directly. Bring an agent later if inbound volume or negotiation needs a second pair of hands.
      </p>
    ),
  },
  {
    q: "What if verification flags a document?",
    a: (
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        You will see a specific reason in-product and can re-upload without losing your draft. We would rather slow you once than publish something we cannot stand behind.
      </p>
    ),
  },
];

const OWNER_STORIES = [
  {
    name: "Kemi",
    role: "First-time landlord",
    quote:
      "She wanted applicants to see fees and verification before transport, not after three voice notes and a detour.",
  },
  {
    name: "Uche",
    role: "Busy professional",
    quote:
      "He needed one thread for viewings and offers instead of reconciling WhatsApp, SMS, and a cousin who is also helping.",
  },
  {
    name: "Amaka",
    role: "Co-listing with an agent",
    quote:
      "She keeps the final say on price and availability while the agent handles volume, all visible on-platform.",
  },
] as const;

export default function ListYourPropertyPage() {
  return (
    <div className="container max-w-6xl py-10 md:py-16">
      <header className="relative overflow-hidden border border-border bg-card shadow-[0_1px_0_rgba(15,23,42,0.06)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-primary before:content-['']">
        <div className="px-6 py-8 md:px-10 md:py-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 border border-border bg-secondary/40 px-2.5 py-1 text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
              <Home className="h-3.5 w-3.5 text-primary" aria-hidden />
              List your property
            </span>
            <span className="text-xs text-muted-foreground">Owners · Verification-first · Haven-backed</span>
          </div>
          <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-[3.05rem] lg:leading-[1.05]">
            Your property deserves to be someone&apos;s dream home, not a mystery in someone&apos;s inbox.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            Publish where trust signals, visible fees, and serious discovery help buyers and tenants decide before they burn your Saturday on a mismatch.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup?role=OWNER" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "rounded-none px-8")}>
              Start owner signup
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/verified" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-none")}>
              How verification reads
            </Link>
          </div>

          <div className="mt-10 grid gap-3 border-t border-border pt-8 sm:grid-cols-3">
            {VALUE_PILLS.map((pill) => (
              <div key={pill.label} className="border border-border bg-secondary/15 px-4 py-4">
                <p className="text-sm font-semibold text-foreground">{pill.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{pill.body}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="mt-14">
        <SectionHeading
          eyebrow="Why publish here"
          title="Built for owners who want signal, not noise"
          supporting="The same product principles we use for agents: clarity early, verification that means something, and a trail when things get serious."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OFFERINGS.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="flex flex-col border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/[0.02]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 text-base font-semibold leading-snug tracking-tight text-foreground">{item.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-16 border border-border bg-card p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Reality check</p>
            <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Scattered interest versus a single trail
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            The left column is where high-ticket listings quietly lose people. The right is where DreamHomes invests by default.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
          <div className="flex flex-col border border-red-200/90 bg-gradient-to-b from-red-50 to-red-50/30 p-6 dark:border-red-900/45 dark:from-red-950/35 dark:to-red-950/10 md:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-200">
                <XCircle className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-red-800/90 dark:text-red-300/90">Informal channels</p>
                <p className="text-base font-semibold tracking-tight text-red-950 dark:text-red-50">Trust erodes in the gaps</p>
              </div>
            </div>
            <ul className="mt-6 space-y-3.5">
              {OWNER_COMPARE.chaos.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-snug text-red-950/90 dark:text-red-100/88">
                  <Minus className="mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col border border-emerald-200/90 bg-gradient-to-b from-emerald-50 to-emerald-50/30 p-6 dark:border-emerald-900/45 dark:from-emerald-950/35 dark:to-emerald-950/10 md:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-200">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-emerald-800/90 dark:text-emerald-300/90">DreamHomes</p>
                <p className="text-base font-semibold tracking-tight text-emerald-950 dark:text-emerald-50">Clarity by default</p>
              </div>
            </div>
            <ul className="mt-6 space-y-3.5">
              {OWNER_COMPARE.dreamhomes.map((line) => (
                <li key={line} className="flex gap-3 text-sm font-medium leading-snug text-emerald-950/92 dark:text-emerald-100/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="border border-border bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">What we need on file</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Checklist before you publish</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Nothing here exists to slow you down for sport. Each line is so buyers know who they are dealing with and you keep a clean record.
          </p>
          <ul className="mt-8 divide-y divide-border border border-border">
            {OWNER_REQUIREMENTS.map((row) => {
              const Icon = row.icon;
              return (
                <li key={row.title} className="flex gap-4 bg-background p-4 md:p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-secondary text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">{row.title}</h3>
                      <span
                        className={cn(
                          "border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-eyebrow",
                          row.tag === "Required"
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-secondary text-muted-foreground",
                        )}
                      >
                        {row.tag}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{row.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border border-border bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">How it works</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Three moves from signup to live</h2>
          <ol className="mt-8 space-y-0">
            {OWNER_STEPS.map((item, index) => (
              <li key={item.step} className="relative flex gap-4 pb-10 last:pb-0">
                {index < OWNER_STEPS.length - 1 ? (
                  <span className="absolute bottom-0 left-[22px] top-12 w-px bg-border md:left-[23px]" aria-hidden />
                ) : null}
                <span className="relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center border-2 border-primary bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </span>
                <div className="min-w-0 pt-1">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">Financing note</p>
            <p className="mt-2">
              Qualified buyers can explore home financing through Moniepoint as the DreamHomes product vision matures, so serious interest can move toward action with fewer dead ends.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16 border border-border bg-secondary/15 p-6 md:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <HelpCircle className="h-6 w-6 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Before you publish</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Short answers owners ask right before signup. Tap a row to expand.
            </p>
            <div className="mt-6 divide-y divide-border border border-border bg-card">
              {OWNER_PREPARE.map((item) => (
                <details key={item.q} className="group px-4 py-1">
                  <summary className="cursor-pointer list-none py-4 text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-3">
                      <span className="min-w-0 flex-1 pr-2">{item.q}</span>
                      <ChevronDown
                        className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                        aria-hidden
                      />
                    </span>
                  </summary>
                  <div className="border-t border-border pb-4 pt-2">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 border border-border bg-card p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Who this is for</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Owners we had in mind</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Illustrative personas, not endorsements. They capture how people behave when the listing is finally legible online.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OWNER_STORIES.map((story, index) => (
            <figure
              key={story.name}
              className={cn(
                "relative flex flex-col overflow-hidden border border-border bg-background",
                index === 0 && "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-primary before:content-['']",
                index === 1 && "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-sky-500 before:content-['']",
                index === 2 && "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-amber-500 before:content-['']",
              )}
            >
              <div className="flex flex-1 flex-col p-5 pt-6">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-secondary text-base font-semibold tabular-nums text-foreground"
                    aria-hidden
                  >
                    {story.name.charAt(0)}
                  </span>
                  <figcaption>
                    <span className="block text-sm font-semibold text-foreground">{story.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{story.role}</span>
                  </figcaption>
                </div>
                <blockquote className="mt-4 line-clamp-5 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{story.quote}&rdquo;
                </blockquote>
              </div>
            </figure>
          ))}
        </div>
      </section>

      <section className="mt-16 border border-primary/25 bg-primary/[0.06] px-6 py-10 text-center md:px-12">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Ready to list where trust is visible?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Create your owner account, add the property once, and let verification and fee clarity do the early filtering for you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/signup?role=OWNER" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "rounded-none px-8")}>
            Start owner signup
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href="/contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-none border-foreground/20 bg-background")}>
            Talk to us first
          </Link>
        </div>
      </section>
    </div>
  );
}
