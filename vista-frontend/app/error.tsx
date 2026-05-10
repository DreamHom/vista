"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Logo, Icon } from "@/components/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex-1 flex flex-col items-center justify-center px-6 py-20 bg-bg">
      <Logo />
      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-danger">
        Something broke
      </p>
      <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-fg max-w-2xl text-center">
        Don&rsquo;t worry — we&rsquo;re on it. Try again, or head somewhere safe.
      </h1>
      {error.digest && (
        <p className="mt-3 text-xs text-fg-subtle font-mono">ref · {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap items-center gap-3 justify-center">
        <Button onClick={reset} trailingIcon={<Icon.ArrowRight size={16} />}>
          Try again
        </Button>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
