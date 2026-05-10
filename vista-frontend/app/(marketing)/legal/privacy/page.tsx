import type { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <Section className="py-16 lg:py-24 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Legal</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-fg">
        Privacy policy
      </h1>
      <p className="mt-3 text-fg-muted">
        Last updated: 1 May 2026 · Capstone draft.
      </p>
      <div className="mt-10 space-y-6 text-fg-muted leading-relaxed">
        <p>
          We collect what we need to do verification, financing and matchmaking — and not
          much else. Listings, identity documents, conversation history and transactional
          metadata are stored encrypted at rest.
        </p>
        <h2 className="text-xl font-semibold text-fg">What we collect</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Account info: name, email, phone, role.</li>
          <li>Verification artefacts: ID, property documents, agent credentials.</li>
          <li>Activity: searches, saves, inspections, offers, messages.</li>
        </ul>
        <h2 className="text-xl font-semibold text-fg">What we don&rsquo;t do</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Sell your data to advertisers.</li>
          <li>Share verification documents outside the admin verification workflow.</li>
          <li>Use private messages to train models without explicit consent.</li>
        </ul>
        <h2 className="text-xl font-semibold text-fg">Your rights</h2>
        <p>
          You can request a copy of your data, ask us to delete it, or revoke verification
          artefacts at any time. We&rsquo;ll honour requests within 30 days.
        </p>
      </div>
    </Section>
  );
}
