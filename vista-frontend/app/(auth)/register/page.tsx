import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Choose your role" };

const roles = [
  {
    href: "/register/applicant",
    title: "I'm looking for a home",
    sub: "Rent or buy. Free forever.",
    icon: <Icon.Heart size={18} />,
  },
  {
    href: "/register/owner",
    title: "I want to list my property",
    sub: "Self-manage or assign an agent.",
    icon: <Icon.Home size={18} />,
  },
  {
    href: "/register/agent",
    title: "I'm a real estate agent",
    sub: "License, CAC and ID required.",
    icon: <Icon.Users size={18} />,
  },
];

export default function RegisterIndexPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-fg">Pick your starting line.</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Don&rsquo;t worry — you can always switch or stack roles later from your account settings.
      </p>

      <div className="mt-8 space-y-3">
        {roles.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-bg-elevated p-5 transition hover:-translate-y-0.5 hover:shadow-md hover:border-brand/30"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
              {r.icon}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-fg group-hover:text-brand">{r.title}</p>
              <p className="text-sm text-fg-muted">{r.sub}</p>
            </div>
            <Icon.ArrowRight size={16} className="text-fg-subtle group-hover:text-brand" />
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-fg-muted">
        Already with us?{" "}
        <Link href="/login" className="font-medium text-brand hover:text-brand-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
}
