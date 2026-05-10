import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Trust & safety" };

const tracks = [
  {
    title: "Owner identity",
    icon: <Icon.Users size={18} />,
    copy: "Government ID, NIN reference, address verification. We confirm you are who you say you are before granting the badge.",
  },
  {
    title: "Property documents",
    icon: <Icon.Doc size={18} />,
    copy: "Certificate of Occupancy, deed of assignment, tenancy paperwork. The blue tick on a listing means a human checked the file.",
  },
  {
    title: "Agent credentials",
    icon: <Icon.ShieldCheck size={18} />,
    copy: "Real estate license, CAC registration, identity match. Verified agents must keep their docs current — expiry triggers re-review.",
  },
  {
    title: "Applicant trust badge",
    icon: <Icon.Heart size={18} />,
    copy: "Optional. Submit ID once and earn a soft trust badge that gets you a faster reply from owners and agents.",
  },
];

export default function TrustPage() {
  return (
    <>
      <Section className="bg-dream-gradient">
        <div className="py-16 lg:py-24 max-w-3xl">
          <Badge tone="verified" className="mb-4">
            <Icon.ShieldCheck size={12} />
            Trust &amp; safety
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-fg leading-tight">
            The blue tick is not for sale. It&rsquo;s earned.
          </h1>
          <p className="mt-5 text-lg text-fg-muted leading-relaxed">
            Every verification on DreamHomes is reviewed by a real person on the admin team
            with a full audit trail. We&rsquo;d rather have fewer verified items than a
            badge that means nothing.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <VerifiedBadge kind="owner" />
            <VerifiedBadge kind="documents" />
            <VerifiedBadge kind="agent" />
            <VerifiedBadge kind="applicant" />
          </div>
        </div>
      </Section>

      <Section className="py-16 lg:py-24">
        <SectionHeading
          eyebrow="The four tracks"
          title="Four separate checks. Four separate badges."
          description="Verification is non-blocking — your listing or profile goes live immediately. The badges layer on as you complete each track."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {tracks.map((t) => (
            <div key={t.title} className="rounded-2xl border border-border bg-bg-elevated p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-verified-soft text-verified">
                {t.icon}
              </span>
              <h3 className="mt-4 text-base font-semibold text-fg">{t.title}</h3>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed">{t.copy}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pb-24 grid gap-10 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-bg-elevated p-8 lg:p-10">
          <h3 className="text-xl font-semibold text-fg">If something goes wrong</h3>
          <p className="mt-3 text-fg-muted">
            All messaging stays in-app. If a deal sours, dispute resolution can pull every
            message, offer and inspection note in seconds. Off-platform side deals are not
            our friend.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-fg-muted">
            {[
              "Report a listing in two taps — admin reviews within 24 hours.",
              "Suspend, deactivate or override accounts the moment fraud is confirmed.",
              "Full audit log for every admin decision, viewable on request.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-success-soft text-success">
                  <Icon.Check size={10} />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-bg-elevated p-8 lg:p-10">
          <h3 className="text-xl font-semibold text-fg">What we won&rsquo;t do</h3>
          <ul className="mt-5 space-y-3 text-sm text-fg-muted">
            {[
              "Sell verification badges. Ever.",
              "Hide agent fees, service charges or caution deposits in fine print.",
              "Encourage moving conversations to WhatsApp.",
              "Recommend a listing or agent we wouldn&rsquo;t recommend to ourselves.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-danger-soft text-danger">
                  <Icon.X size={10} />
                </span>
                <span dangerouslySetInnerHTML={{ __html: line }} />
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
