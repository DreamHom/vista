import Link from "next/link";
import { Logo, Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex-1 grid lg:grid-cols-2">
      {/* form column */}
      <div className="flex flex-col px-6 lg:px-12 py-8 lg:py-10">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="text-xs text-fg-subtle text-center">
          By continuing, you agree to our{" "}
          <Link href="/legal/terms" className="underline hover:text-fg">terms</Link> and{" "}
          <Link href="/legal/privacy" className="underline hover:text-fg">privacy policy</Link>.
        </p>
      </div>

      {/* art column */}
      <div className="relative hidden lg:flex flex-col bg-brand text-brand-fg p-12 overflow-hidden">
        <div className="absolute inset-0 bg-grid-faint opacity-15 pointer-events-none" />
        <div className="relative max-w-md">
          <Badge tone="accent" className="mb-5">
            <Icon.Sparkles size={12} />
            Built at Moniepoint DreamDev 2026
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight leading-tight">
            One account. Every side of the door.
          </h2>
          <p className="mt-4 text-brand-fg/85 leading-relaxed">
            Sign in once and switch between roles when you need to: rent today, list
            tomorrow, agent the day after. Your verification status, listings, leads and
            messages travel with you.
          </p>
        </div>
        <div className="relative mt-auto grid gap-3 max-w-md">
          {[
            "Verified listings, verified agents.",
            "Inspection conflict prevention built-in.",
            "Moniepoint financing in the same flow.",
          ].map((line) => (
            <div
              key={line}
              className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur px-4 py-3 text-sm"
            >
              <Icon.ShieldCheck size={16} />
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
