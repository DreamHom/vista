import type { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <Section className="py-16 lg:py-24 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Legal</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-fg">
        Terms of service
      </h1>
      <p className="mt-3 text-fg-muted">
        Last updated: 1 May 2026 · Capstone draft. Replace before production.
      </p>
      <div className="mt-10 prose-content space-y-6 text-fg-muted leading-relaxed">
        <p>
          DreamHomes (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates a property platform that
          connects owners, agents and applicants. By using the service you agree to these
          terms. They&rsquo;re short on purpose — we&rsquo;d rather you read them.
        </p>
        <h2 className="text-xl font-semibold text-fg">1. Listings & verification</h2>
        <p>
          Owners are responsible for the accuracy of their listings. Verified badges only
          confirm what we have checked, not the suitability of any property for any person.
          Misleading listings will be taken down and may result in account suspension.
        </p>
        <h2 className="text-xl font-semibold text-fg">2. Off-platform activity</h2>
        <p>
          We strongly discourage moving conversations off the platform. Messages, offers and
          inspection notes inside DreamHomes form the record we use for dispute resolution.
        </p>
        <h2 className="text-xl font-semibold text-fg">3. Financing</h2>
        <p>
          Moniepoint home financing is offered through our partner under their own terms.
          DreamHomes is not a lender.
        </p>
        <h2 className="text-xl font-semibold text-fg">4. Liability</h2>
        <p>
          DreamHomes connects parties; we do not own or sell properties. We&rsquo;ll do our
          job — verification, moderation, dispute support — but we&rsquo;re not the
          counterparty in any deal between users.
        </p>
        <h2 className="text-xl font-semibold text-fg">5. Changes</h2>
        <p>
          We&rsquo;ll update these terms as the product matures. Material changes get a
          heads-up notice; trivial ones get logged here.
        </p>
      </div>
    </Section>
  );
}
