import Link from "next/link";
import type { Metadata } from "next";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-fg">Reset your password.</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Pop in your email — we&rsquo;ll send a link that expires in 30 minutes.
      </p>

      <form className="mt-8 space-y-5">
        <Field label="Email">
          <Input type="email" placeholder="you@example.com" />
        </Field>
        <Button size="lg" className="w-full" trailingIcon={<Icon.ArrowRight size={16} />}>
          Send reset link
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-fg-muted">
        Remembered it after all?{" "}
        <Link href="/login" className="font-medium text-brand hover:text-brand-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
}
