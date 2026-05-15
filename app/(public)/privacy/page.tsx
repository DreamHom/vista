import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PolicyPage } from "@/components/public/policy-page";
import { getPolicyDocument } from "@/lib/content/policies";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "DreamHomes privacy policy: what we collect, legal bases, cookies, retention, security, your rights, and how to contact us about data practices.",
};

export default function PrivacyPage() {
  const document = getPolicyDocument("privacy");
  if (!document) notFound();
  return <PolicyPage document={document} />;
}
