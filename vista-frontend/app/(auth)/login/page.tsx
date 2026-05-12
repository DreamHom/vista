import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = (await searchParams) ?? {};
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-fg">
        Welcome back.
      </h1>
      <p className="mt-2 text-sm text-fg-muted">
        Sign in to keep saved listings, inspections and offers in one place.
      </p>

      <LoginForm nextHref={params.next} />

      <p className="mt-8 text-center text-sm text-fg-muted">
        New here?{" "}
        <Link
          href="/register"
          className="font-medium text-brand hover:text-brand-hover"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}