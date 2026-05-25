import type { ReactNode } from "react";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  FileText,
  HelpCircle,
  IdCard,
  MessageSquare,
  Minus,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Become an Agent",
  description: "Join DreamHomes as an agent: verified profiles, serious leads, transparent fees, and on-platform inspections and offers.",
};

const VALUE_PILLS = [
  { label: "Verification-first", body: "Badges tied to credential review, not marketing stickers." },
  { label: "Serious discovery", body: "Applicants arrive after search, compare, and shortlist work." },
  { label: "Documented flow", body: "Inspections and offers stay on-platform, not lost in SMS." },
] as const;

const OFFERINGS = [
  {
    title: "Verified badge that means something",
    body: "Stand out with trust signals backed by credential review, not generic marketing claims.",
    icon: BadgeCheck,
  },
  {
    title: "Leads from people who did the homework",
    body: "Meet applicants who filtered, compared, and often used Dream AI before they reach out.",
    icon: TrendingUp,
  },
  {
    title: "Transparent fee posture",
    body: "Set expectations early so the first conversation is about fit, not surprise line items.",
    icon: ShieldCheck,
  },
  {
    title: "Inspection and deal hygiene",
    body: "Keep viewings, notes, and next steps in one thread instead of scattered chats.",
    icon: ClipboardCheck,
  },
] as const;

const COMPARE = {
  legacy: [
    "Profiles that read like brochure copy",
    "Leads that bounce between five apps",
    "Fees explained only after the call",
  ],
  dreamhomes: [
    "Public profile tied to verification and reviews",
    "Search, shortlist, and messaging in one place",
    "Fee fields surfaced where prospects expect them",
  ],
} as const;

const REQUIREMENTS: Array<{
  title: string;
  detail: string;
  icon: typeof IdCard;
  tag: string;
}> = [
  {
    title: "Active real estate licence",
    detail: "We capture your licence number at signup so your public profile can anchor to a regulated identity.",
    icon: IdCard,
    tag: "Required",
  },
  {
    title: "Government-issued ID",
    detail: "Identity checks protect owners and applicants from impersonation and keep escalation paths clear.",
    icon: FileText,
    tag: "Required",
  },
  {
    title: "CAC or company paperwork",
    detail: "Optional but recommended for incorporated teams. It strengthens the story when you represent a brand, not just yourself.",
    icon: Building2,
    tag: "Optional",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Create your agent account",
    body: "Choose the agent role, add your licence, and submit identity details in one guided flow.",
  },
  {
    step: "02",
    title: "Complete trust checks",
    body: "Our team reviews credentials so the badge on your profile reflects reality, not aspiration.",
  },
  {
    step: "03",
    title: "Go live with credibility",
    body: "Publish listings, respond to inspections, and let reviews compound in public view.",
  },
] as const;

const PREPARE_ITEMS: Array<{ q: string; a: ReactNode }> = [
  {
    q: "What should I upload before I start?",
    a: (
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
        <li className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          Clear photo or scan of your practising licence (front and back if applicable).
        </li>
        <li className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          Government ID that matches the name on your DreamHomes account.
        </li>
        <li className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          Optional: CAC certificate or letterhead if you operate as a registered company.
        </li>
      </ul>
    ),
  },
  {
    q: "How long does verification usually take?",
    a: (
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Most submissions receive a first-pass review within a few business days. Complex cases (mismatched names, expired documents) may take longer because we resolve them properly instead of auto-approving.
      </p>
    ),
  },
  {
    q: "What happens if something is rejected?",
    a: (
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        You will see a specific reason in-product and can re-upload without losing your draft profile. We would rather slow you down once than let a bad actor through.
      </p>
    ),
  },
];

const STORIES = [
  {
    name: "Silas",
    role: "Lagos corridor",
    quote:
      "He needed a platform where clean process could become a visible advantage. DreamHomes is built for agents who win by being organised before the first handshake.",
  },
  {
    name: "Ngozi",
    role: "Repeat business focus",
    quote:
      "She cares about repeat trust, not just one fast close. Public credibility compounds when every inspection and offer stays documented.",
  },
  {
    name: "Temi",
    role: "Applicant perspective",
    quote:
      "Applicants respond better when a profile already feels clear, legitimate, and fee-transparent before the introduction. That is the bar we help you meet.",
  },
] as const;

export default function BecomeAnAgentPage() {
  return (
    <div className="container max-w-6xl py-10 md:py-16">
      <header className="relative overflow-hidden border border-border bg-card shadow-[0_1px_0_rgba(15,23,42,0.06)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-primary before:content-['']">
        <div className="px-6 py-8 md:px-10 md:py-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 border border-border bg-secondary/40 px-2.5 py-1 text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5 text-primary" aria-hidden />
              Become an agent
            </span>
            <span className="text-xs text-muted-foreground">Nigeria-first · Haven-backed workflows</span>
          </div>
          <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-[3.15rem] lg:leading-[1.05]">
            Show up verified before the first call.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            DreamHomes is for agents who want prospects to see who you are, what you charge, and how you run a viewing before they dial your number.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup?role=AGENT"
              className={cn(buttonVariants({ variant: "primary", size: "lg" }), "rounded-none px-8")}
            >
              Register as an agent
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/agents" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-none")}>
              Browse agent profiles
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
          eyebrow="Why join"
          title="What you get on DreamHomes"
          supporting="Four reasons agents join when clarity beats volume."
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
              Same internet, two defaults
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            One path optimises for volume. The other optimises for what still matters after the tenth message on WhatsApp.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
          <div className="flex flex-col border border-red-200/90 bg-gradient-to-b from-red-50 to-red-50/30 p-6 dark:border-red-900/45 dark:from-red-950/35 dark:to-red-950/10 md:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-200">
                <XCircle className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-red-800/90 dark:text-red-300/90">Typical portals</p>
                <p className="text-base font-semibold tracking-tight text-red-950 dark:text-red-50">Friction in the blind spots</p>
              </div>
            </div>
            <ul className="mt-6 space-y-3.5">
              {COMPARE.legacy.map((line) => (
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
                <p className="text-base font-semibold tracking-tight text-emerald-950 dark:text-emerald-50">Clarity where it counts</p>
              </div>
            </div>
            <ul className="mt-6 space-y-3.5">
              {COMPARE.dreamhomes.map((line) => (
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
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">What you need ready</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Requirements checklist</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Nothing here is meant to slow you down for sport. Each item exists so owners and applicants can trust the person behind the profile.
          </p>
          <ul className="mt-8 divide-y divide-border border border-border">
            {REQUIREMENTS.map((row) => {
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
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Three moves from signup to credibility</h2>
          <ol className="mt-8 space-y-0">
            {PROCESS_STEPS.map((item, index) => (
              <li key={item.step} className="relative flex gap-4 pb-10 last:pb-0">
                {index < PROCESS_STEPS.length - 1 ? (
                  <span
                    className="absolute left-[22px] top-12 bottom-0 w-px bg-border md:left-[23px]"
                    aria-hidden
                  />
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

          <div className="mt-8 grid gap-3 border-t border-border pt-8 sm:grid-cols-3">
            <MiniFact icon={Users} title="Public profile" body="Reviews and verification badges surface where prospects look first." />
            <MiniFact icon={MessageSquare} title="On-platform chat" body="Keep material negotiation documented instead of lost in SMS." />
            <MiniFact icon={Clock3} title="Predictable review" body="Credential checks with clear pass, fail, or needs-info outcomes." />
          </div>
        </div>
      </section>

      <section className="mt-16 border border-border bg-secondary/15 p-6 md:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <HelpCircle className="h-6 w-6 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Before you hit register</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Quick answers before you start. Same guidance we send when paperwork questions come up.
            </p>
            <div className="mt-6 divide-y divide-border border border-border bg-card">
              {PREPARE_ITEMS.map((item) => (
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
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Personas, not endorsements</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Illustrative voices. They sketch how agents and applicants behave when the process is visible, not buried in DMs.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STORIES.map((story, index) => (
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
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Ready to register with credentials on file?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Create your agent account, upload documents once, and let verification and public fees speak before every listing touchpoint.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup?role=AGENT"
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "rounded-none px-8")}
          >
            Start agent registration
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href="/contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-none border-foreground/20 bg-background")}>
            Talk to partnerships
          </Link>
        </div>
      </section>
    </div>
  );
}

function MiniFact({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="border border-border bg-secondary/20 p-4">
      <Icon className="h-4 w-4 text-primary" aria-hidden />
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
