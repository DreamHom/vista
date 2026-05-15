import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verified Badge Explained",
  description: "Understand what Owner Verified, Property Verified, and Agent Verified mean on DreamHomes.",
};

const BADGES = [
  {
    title: "Owner Verified",
    description:
      "The person behind the listing has submitted identity documentation for admin review. This helps applicants know there is a real, accountable human behind the property.",
    requirements: ["Government-issued ID", "NIN or BVN reference", "Manual admin approval"],
  },
  {
    title: "Property Verified",
    description:
      "DreamHomes has reviewed the ownership document trail attached to the property. This does not replace your own due diligence, but it is a serious trust signal.",
    requirements: ["Certificate of Occupancy or deed reference", "Property-to-owner match", "Manual admin approval"],
  },
  {
    title: "Agent Verified",
    description:
      "The agent has submitted professional credentials and passed DreamHomes review. We surface this separately because a verified property and a verified agent are not the same promise.",
    requirements: ["Professional license details", "Means of identification", "Manual admin approval"],
  },
] as const;

export default function VerifiedPage() {
  return (
    <div className="container py-10 md:py-14">
      <section className="border border-border bg-card p-6 md:p-8">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Verification Badge Explained</p>
        <h1 className="mt-3 max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          What does Verified mean on DreamHomes?
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          A badge on DreamHomes is not decoration. It is a promise that a specific trust check has happened and that the result is visible to everyone browsing.
        </p>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-3">
        {BADGES.map((badge) => (
          <article key={badge.title} className="border border-border bg-card p-6">
            <div className="inline-flex h-11 w-11 items-center justify-center bg-secondary text-accent">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">{badge.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{badge.description}</p>
            <div className="mt-5 space-y-2">
              {badge.requirements.map((item) => (
                <div key={item} className="border border-border px-3 py-2 text-sm text-foreground">
                  {item}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[0.7fr_0.3fr]">
        <div className="border border-border bg-card p-6">
          <h2 className="text-xl font-semibold tracking-tight">What it means for you</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Verified badges make trust visible before you ask a question, before you spend transport money, and before you take an inspection seriously.
            </p>
            <p>
              They do not remove the need for physical inspection or legal review, but they do make it harder for bad actors to look credible on the platform.
            </p>
            <p>
              DreamHomes treats verification as a high-bar premium signal. Only <span className="font-medium text-foreground">1 in 3 submissions</span> is approved after review.
            </p>
          </div>
        </div>

        <div className="border border-border bg-secondary/40 p-6">
          <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Ready to earn a badge?</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Start verification.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Create an account, choose the right role, and submit the trust documents that apply to you.
          </p>
          <Link href="/signup" className={`${buttonVariants({ variant: "primary", size: "md" })} mt-5`}>
            Start Verification
          </Link>
        </div>
      </section>

      <section className="mt-8 border border-border bg-secondary/30 p-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          Badges describe checks we performed, not a warranty about a future deal. For how that fits our legal terms, see{" "}
          <Link href="/terms#verification-badges" className="font-medium text-foreground underline decoration-primary/40 underline-offset-2 hover:text-primary">
            Verification badges and trust signals
          </Link>{" "}
          in our Terms &amp; Conditions.
        </p>
      </section>
    </div>
  );
}
