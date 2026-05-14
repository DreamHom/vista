import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PolicyPage } from "@/components/public/policy-page";
import { getPolicyDocument } from "@/lib/content/policies";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "DreamHomes terms of use: eligibility, listings, conduct, inspections, liability, governing law in Nigeria, and how we enforce platform rules.",
};

export default function TermsPage() {
  const document = getPolicyDocument("terms");
  if (!document) notFound();
  return <PolicyPage document={document} />;
}
