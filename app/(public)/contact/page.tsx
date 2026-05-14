import type { Metadata } from "next";
import { FormShell } from "@/components/public/form-shell";
import { ContactForm } from "@/components/public/simple-public-forms";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Reach DreamHomes for support, partnerships, and press requests.",
};

export default function ContactPage() {
  return (
    <FormShell
      eyebrow="Contact Us"
      title="Talk to the DreamHomes team."
      description="Reach out for general questions, support issues, partnerships, or press inquiries."
      maxWidth="max-w-2xl"
      footer={
        <p>
          Prefer email? Reach us at{" "}
          <a href="mailto:hello@dreamhomes.today" className="font-medium text-accent hover:text-accent/80">
            hello@dreamhomes.today
          </a>
          .
        </p>
      }
    >
      <ContactForm />
    </FormShell>
  );
}
