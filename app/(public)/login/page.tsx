import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/public/auth-forms";
import { FormShell } from "@/components/public/form-shell";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to DreamHomes to save listings, book inspections, and manage offers.",
};

interface LoginSearchParams {
  next?: string;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  const params = await searchParams;

  return (
    <FormShell
      eyebrow="Sign in"
      title="Welcome back. Pick up where you left off."
      description="Access your saves, inspections, offers, and workspaces."
      maxWidth="max-w-2xl"
      footer={
        <p>
          New to DreamHomes?{" "}
          <Link
            href={params.next ? `/signup?next=${encodeURIComponent(params.next)}` : "/signup"}
            className="font-medium text-primary hover:text-primary/80"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <LoginForm next={params.next} />
    </FormShell>
  );
}
