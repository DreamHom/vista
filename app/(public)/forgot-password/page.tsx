import Link from "next/link";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/public/auth-forms";
import { FormShell } from "@/components/public/form-shell";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a DreamHomes password reset link.",
};

export default function ForgotPasswordPage() {
  return (
    <FormShell
      eyebrow="Forgot Password"
      title="Reset your DreamHomes password."
      description="Enter the email address connected to your account and we&apos;ll send a reset link."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-accent hover:text-accent/80">
            Back to Login
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </FormShell>
  );
}
