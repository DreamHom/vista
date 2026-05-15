import type { Metadata } from "next";
import { FaqView } from "@/components/public/faq-view";
import { FAQ_GROUPS } from "@/lib/content/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about DreamHomes.",
};

export default function FaqPage() {
  return <FaqView groups={FAQ_GROUPS} />;
}
