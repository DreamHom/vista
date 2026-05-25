import type { Metadata } from "next";

import { MoniepointFinancingView } from "@/components/public/moniepoint-financing-view";

export const metadata: Metadata = {
  title: "Moniepoint Financing · DreamHomes",
  description:
    "How DreamHomes and Moniepoint fit together around property discovery and business credit in Nigeria. Plain language, clear limits, links to browse listings.",
  alternates: { canonical: "/moniepoint-financing" },
  openGraph: {
    title: "DreamHomes · Moniepoint Financing",
    description:
      "A trust-first property platform meets simplified business credit: the story behind our financing partnership.",
    url: "/moniepoint-financing",
    type: "website",
  },
};

export default function MoniepointFinancingPage() {
  return <MoniepointFinancingView />;
}
