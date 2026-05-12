import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DreamHomes — Making dreams come true, one home at a time.",
    template: "%s · DreamHomes",
  },
  description:
    "DreamHomes is the property platform for people who are tired of fake agents, hidden fees and WhatsApp deals. List, find, finance and move — all in one place, powered by Moniepoint.",
  applicationName: "DreamHomes",
  keywords: [
    "real estate Nigeria",
    "Lagos apartments",
    "rent",
    "buy",
    "Moniepoint home financing",
    "verified agents",
    "DreamHomes",
  ],
  authors: [{ name: "Team DreamHomes" }],
  openGraph: {
    title: "DreamHomes — Making dreams come true, one home at a time.",
    description:
      "List, find, finance and move. Verified listings, verified agents, no WhatsApp surprises.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-bg text-fg flex flex-col">{children}</body>
    </html>
  );
}
