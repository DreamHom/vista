"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Icon } from "@/components/icons";

interface Props {
  listingId: string;
}

export function PhotoUploader({ listingId }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (caption) form.append("caption", caption);
      const res = await fetch(`/api/listings/${listingId}/photos`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const problem = await res.json().catch(() => ({}));
        setError(
          problem?.detail ??
            problem?.title ??
            "Could not upload that photo.",
        );
        return;
      }
      setCaption("");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch {
      setError("Network error — try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      ) : null}
      <Field label="Photo caption (optional)">
        <Input
          name="caption"
          placeholder="e.g. Living room, north-facing"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </Field>
      <div className="rounded-xl border border-dashed border-border bg-bg-sunken/40 p-8 text-center">
        <Icon.Plus size={20} className="mx-auto text-fg-muted" />
        <p className="mt-2 text-sm font-medium text-fg">Drop a photo</p>
        <p className="text-xs text-fg-muted">
          JPG or PNG · 4:3 looks best · uploaded one at a time
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="mt-4"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Choose a photo"}
        </Button>
      </div>
    </div>
  );
}
