import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { ListingCard } from "@/components/listings/listing-card";
import { AgentCard } from "@/components/agents/agent-card";
import { listings, agents } from "@/lib/mock-data";

const featuredListings = listings.slice(0, 3);
const featuredAgents = agents.slice(0, 3);

export default function LandingPage() {
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-dream-gradient">
        <div className="absolute inset-0 bg-grid-faint opacity-40 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="max-w-3xl">
            <Badge tone="brand" className="mb-5">
              <Icon.Sparkles size={12} />
              Powered by Moniepoint home financing
            </Badge>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-fg leading-[1.05]">
              Making dreams come true,{" "}
              <span className="text-brand">one home at a time.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg md:text-xl text-fg-muted leading-relaxed">
              The property platform for people who are tired of fake agents, hidden fees and
              WhatsApp deals. List, find, finance and move — all in one place, with the
              receipts to prove it.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink
                href="/listings"
                size="lg"
                trailingIcon={<Icon.ArrowRight size={16} />}
              >
                Browse listings
              </ButtonLink>
              <ButtonLink
                href="/dream"
                variant="outline"
                size="lg"
                leadingIcon={<Icon.Sparkles size={16} />}
              >
                Ask Dream AI
              </ButtonLink>
            </div>

            {/* search-style chip rail */}
            <div className="mt-8 flex flex-wrap gap-2 text-sm">
              {[
                "3-bed in Lekki under ₦8M/yr",
                "Self-contained near UNILAG",
                "Detached in Maitama",
                "Off-plan with Moniepoint mortgage",
              ].map((q) => (
                <Link
                  key={q}
                  href={`/dream?q=${encodeURIComponent(q)}`}
                  className="rounded-full border border-border bg-bg-elevated/80 px-4 py-2 text-fg-muted hover:text-fg hover:border-border-strong transition"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>

          {/* trust strip */}
          <div className="mt-14 grid gap-3 max-w-3xl md:grid-cols-3">
            {[
              {
                icon: <Icon.ShieldCheck size={16} />,
                title: "Verified, not vibes",
                copy: "Owners and documents are checked before they get a badge.",
              },
              {
                icon: <Icon.Coin size={16} />,
                title: "Every fee, in writing",
                copy: "Caution, service charge, agency, legal — broken down up front.",
              },
              {
                icon: <Icon.Chat size={16} />,
                title: "Stays on the platform",
                copy: "No off-app side deals. Full message history, dispute-ready.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-bg-elevated/85 backdrop-blur p-4"
              >
                <div className="flex items-center gap-2 text-brand">
                  {item.icon}
                  <p className="text-sm font-semibold text-fg">{item.title}</p>
                </div>
                <p className="mt-1.5 text-sm text-fg-muted">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURED LISTINGS ---------------- */}
      <Section className="py-20 lg:py-28">
        <div className="flex items-end justify-between gap-6 mb-10">
          <SectionHeading
            eyebrow="Featured this week"
            title="Real homes. Real owners. Real prices."
            description="Hand-picked from listings that passed both owner and document verification this week."
          />
          <Link
            href="/listings"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover"
          >
            See all listings <Icon.ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredListings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </Section>

      {/* ---------------- DREAM AI BLOCK ---------------- */}
      <Section className="pb-20 lg:pb-28">
        <div className="grid gap-10 rounded-3xl border border-border bg-bg-elevated p-8 lg:p-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge tone="accent" className="mb-4">
              <Icon.Sparkles size={12} />
              Meet Dream AI
            </Badge>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-fg leading-tight">
              Stop scrolling filters. Just describe the home.
            </h2>
            <p className="mt-4 text-lg text-fg-muted leading-relaxed">
              Dream AI takes the messy way you actually think — &ldquo;3-bed, quiet street,
              near a school, under ₦2M, can the rent stretch into a Moniepoint loan?&rdquo;
              — and turns it into real, verifiable matches.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Search by vibe, not just filters.",
                "Get the area average so you know if a price is funny.",
                "Ask listing-specific questions; it reads the comments and the spec sheet.",
                "First-time renter? It explains caution, agency fees and what to look for.",
              ].map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 text-sm text-fg-muted"
                >
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <Icon.Check size={12} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <ButtonLink
                href="/dream"
                size="lg"
                trailingIcon={<Icon.ArrowRight size={16} />}
              >
                Try Dream AI
              </ButtonLink>
            </div>
          </div>

          {/* mock chat preview */}
          <div className="rounded-2xl border border-border bg-bg-sunken/60 p-5">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand text-brand-fg">
                <Icon.Sparkles size={14} />
              </span>
              <p className="text-sm font-medium text-fg">Dream AI · session preview</p>
            </div>
            <div className="space-y-4 pt-4">
              <ChatBubble side="user">
                3-bed in Lekki Phase 1, quiet street, under ₦8M/year, near a school.
              </ChatBubble>
              <ChatBubble side="ai">
                Found 4 verified listings in your range. The closest match is a 3-bed on a
                cul-de-sac, two minutes from Admiralty. ₦6.5M/yr, all-in fees ₦2.15M.
                That&rsquo;s 7% below the area average for similar units this quarter.
              </ChatBubble>
              <ChatBubble side="user">
                Can the down payment work with a Moniepoint loan?
              </ChatBubble>
              <ChatBubble side="ai">
                Yes — for rentals, Moniepoint can advance up to 9 months and you repay
                monthly. I can prep the application once you pick a place.
              </ChatBubble>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <Section className="pb-20 lg:pb-28">
        <SectionHeading
          eyebrow="How it works"
          title="Built for everyone in the room."
          description="Owners, agents and applicants get their own surface — designed for what each side actually does."
          align="center"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Owners",
              copy: "List in minutes. Choose to self-manage or assign a verified agent. See every lead, inspection and offer in one place.",
              href: "/for-owners",
              icon: <Icon.Home size={18} />,
            },
            {
              title: "Agents",
              copy: "Build a transparent profile that earns trust. Manage multiple owners, multiple listings, one calendar.",
              href: "/for-agents",
              icon: <Icon.Users size={18} />,
            },
            {
              title: "Applicants",
              copy: "Browse without an account. Save what you love, ask Dream AI what you don't know, finance through Moniepoint when you're ready.",
              href: "/for-applicants",
              icon: <Icon.Heart size={18} />,
            },
          ].map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-border bg-bg-elevated p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                {card.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-fg group-hover:text-brand">
                For {card.title.toLowerCase()}
              </h3>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed">{card.copy}</p>
              <p className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand">
                Learn more <Icon.ArrowRight size={14} />
              </p>
            </Link>
          ))}
        </div>
      </Section>

      {/* ---------------- FEATURED AGENTS ---------------- */}
      <Section className="pb-20 lg:pb-28">
        <div className="flex items-end justify-between gap-6 mb-10">
          <SectionHeading
            eyebrow="Verified agents"
            title="The professionals worth your time."
            description="Every agent on this list has a real estate license on file, a deal history we can pull up, and a response rate above 90%."
          />
          <Link
            href="/agents"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover"
          >
            Find an agent <Icon.ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredAgents.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      </Section>

      {/* ---------------- BIG CTA ---------------- */}
      <Section className="pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-brand text-brand-fg p-10 lg:p-16">
          <div className="absolute inset-0 opacity-20 bg-grid-faint pointer-events-none" />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-fg/70">
                Your next chapter
              </p>
              <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
                A home you can trust is one click away.
              </h2>
              <p className="mt-4 max-w-xl text-brand-fg/85 text-lg leading-relaxed">
                Whether it&rsquo;s your first 1-bed or your tenth investment property,
                DreamHomes makes the path obvious — and the receipts undeniable.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <ButtonLink
                href="/register"
                variant="accent"
                size="lg"
                trailingIcon={<Icon.ArrowRight size={16} />}
              >
                Create your account
              </ButtonLink>
              <ButtonLink
                href="/listings"
                variant="ghost"
                size="lg"
                className="text-brand-fg hover:bg-white/10"
              >
                Browse first
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function ChatBubble({
  side,
  children,
}: {
  side: "user" | "ai";
  children: React.ReactNode;
}) {
  if (side === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand px-4 py-3 text-sm text-brand-fg leading-relaxed">
          {children}
        </p>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <p className="max-w-[90%] rounded-2xl rounded-bl-sm bg-bg-elevated border border-border px-4 py-3 text-sm text-fg leading-relaxed">
        {children}
      </p>
    </div>
  );
}
