import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <PublicHeader />
      <main className="min-h-[calc(100vh-4rem)] flex-1 bg-background">{children}</main>
      <PublicFooter />
    </div>
  );
}
