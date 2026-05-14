import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PolicyPage } from "@/components/public/policy-page";
import { getPolicyDocument } from "@/lib/content/policies";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How DreamHomes uses essential, preference, and analytics cookies, and how you can control them.",
};

export default function CookiesPage() {
  const document = getPolicyDocument("cookies");
  if (!document) notFound();
  return <PolicyPage document={document} />;
}
