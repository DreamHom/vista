"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Icon } from "@/components/icons";

export function SignOutLink() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } 
      
      catch {
      }
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-fg-muted hover:text-fg hover:bg-bg-sunken transition disabled:opacity-60"
    >
      <Icon.Logout size={16} />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
