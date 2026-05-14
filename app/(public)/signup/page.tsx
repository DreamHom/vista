import type { Metadata } from "next";
import Link from "next/link";
import { FormShell } from "@/components/public/form-shell";
import { SignupForm } from "@/components/public/auth-forms";
import type { PublicRole } from "@/lib/types";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a DreamHomes account as an applicant, owner, or agent.",
};

interface SignupSearchParams {
  role?: string;
  next?: string;
}

function normalizeRole(role?: string): PublicRole {
  if (!role) return "APPLICANT";
  const normalized = role.trim().toUpperCase();
  if (normalized === "OWNER" || normalized === "AGENT" || normalized === "APPLICANT") {
    return normalized;
  }
  return "APPLICANT";
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<SignupSearchParams>;
}) {
  const params = await searchParams;
  const initialRole = normalizeRole(params.role);

  return (
    <FormShell
      eyebrow="Sign up"
      title="Create an account built around what you are here to do."
      description="Pick the path that matches you. We will tailor verification, dashboards, and next steps so you are never dropped into the wrong workflow."
      maxWidth="max-w-4xl"
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href={params.next ? `/login?next=${encodeURIComponent(params.next)}` : "/login"}
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <SignupForm initialRole={initialRole} next={params.next} />
    </FormShell>
  );
}
