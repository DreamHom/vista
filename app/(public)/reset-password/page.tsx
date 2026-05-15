import Link from "next/link";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/public/auth-forms";
import { FormShell } from "@/components/public/form-shell";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new DreamHomes password.",
};

export default function ResetPasswordPage() {
  return (
    <FormShell
      eyebrow="Reset Password"
      title="Choose a new password."
      description="Create a new password for your DreamHomes account and get back to your search."
      footer={
        <p>
          Want to go back?{" "}
          <Link href="/login" className="font-medium text-accent hover:text-accent/80">
            Return to Login
          </Link>
        </p>
      }
    >
      <ResetPasswordForm />
    </FormShell>
  );
}
