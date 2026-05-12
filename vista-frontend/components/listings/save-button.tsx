"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { toggleSaveAction } from "@/lib/actions/saves";

interface Props {
  listingId: string;
  initialSaved: boolean;
  authed: boolean;
}

export function SaveButton({ listingId, initialSaved, authed }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (!authed) {
      router.push(`/login?next=/listings/${listingId}`);
      return;
    }
    setError(null);
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const result = await toggleSaveAction(listingId, !next /* currentlySaved before flip */);
      if (!result.ok) {
        setSaved(!next);
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <Button
        type="button"
        variant={saved ? "secondary" : "ghost"}
        size="md"
        onClick={onClick}
        disabled={pending}
        leadingIcon={<Icon.Heart size={16} />}
      >
        {saved ? "Saved" : "Save listing"}
      </Button>
      {error ? (
        <p className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
