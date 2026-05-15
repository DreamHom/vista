"use client";

import { ExternalLink, FileText, Image as ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const IMAGE_URL = /\.(png|jpe?g|webp|gif)(\?|#|$)/i;

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** Accepts API string, already-parsed JSON, or empty. */
export function normalizeVerificationDocumentRefs(
  raw: string | Record<string, unknown> | null | undefined,
): unknown | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw;
  const s = String(raw).trim();
  if (!s) return null;
  if (!(s.startsWith("{") && s.endsWith("}")) && !(s.startsWith("[") && s.endsWith("]"))) {
    return s;
  }
  try {
    return JSON.parse(s) as unknown;
  } catch {
    return s;
  }
}

function isDocumentRefEntry(value: unknown): value is { kind?: unknown; ref?: unknown } {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && ("ref" in (value as object) || "kind" in (value as object));
}

function formatScalar(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function PrimitiveRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border/80 py-2 last:border-b-0 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="min-w-0 text-sm text-foreground">{children}</div>
    </div>
  );
}

function AttachmentCard({
  slotKey,
  kindLabel,
  refValue,
}: {
  slotKey: string;
  kindLabel: string;
  refValue: string;
}) {
  const href = isHttpUrl(refValue) ? refValue : null;
  const showImage = Boolean(href && IMAGE_URL.test(refValue));

  return (
    <div className="rounded-lg border border-border bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="font-mono text-[11px] uppercase tracking-wide">{slotKey}</span>
        {kindLabel !== slotKey ? <span className="text-foreground">· {kindLabel}</span> : null}
      </div>
      {href ? (
        <div className="mt-3 space-y-2">
          {showImage ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-md border border-border bg-secondary/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- admin R2 URLs are dynamic; avoid remotePatterns churn */}
              <img src={href} alt={kindLabel} className="max-h-48 w-full object-contain" loading="lazy" />
            </a>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                Open attachment
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          )}
          <p className="break-all font-mono text-xs text-muted-foreground">{href}</p>
        </div>
      ) : (
        <p className="mt-2 break-all font-mono text-sm text-foreground">{refValue}</p>
      )}
    </div>
  );
}

function renderObjectEntries(data: Record<string, unknown>, depth: number): React.ReactNode {
  const entries = Object.entries(data);
  const allDocLike =
    entries.length > 0 &&
    entries.every(
      ([, v]) => isDocumentRefEntry(v) && typeof (v as { ref?: unknown }).ref === "string" && String((v as { ref: string }).ref).length > 0,
    );

  if (allDocLike) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map(([key, value]) => {
          const o = value as { kind?: unknown; ref?: unknown };
          const refStr = typeof o.ref === "string" ? o.ref : "";
          const kindStr = typeof o.kind === "string" ? o.kind : key;
          if (!refStr) {
            return (
              <div key={key} className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                <span className="font-mono text-xs">{key}</span> — missing <code className="text-xs">ref</code>
              </div>
            );
          }
          return <AttachmentCard key={key} slotKey={key} kindLabel={kindStr} refValue={refStr} />;
        })}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/80 rounded-md border border-border bg-white">
      {entries.map(([key, value]) => (
        <PrimitiveRow key={key} label={key.replaceAll("_", " ")}>
          <NestedValue value={value} depth={depth + 1} />
        </PrimitiveRow>
      ))}
    </div>
  );
}

function NestedValue({ value, depth }: { value: unknown; depth: number }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const s = String(value);
    if (typeof value === "string" && isHttpUrl(s)) {
      const img = IMAGE_URL.test(s);
      return (
        <span className="inline-flex flex-wrap items-center gap-2">
          <a href={s} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
            {img ? "Open image" : "Open link"}
            <ExternalLink className="ml-0.5 inline h-3.5 w-3.5 align-text-bottom" aria-hidden />
          </a>
          {img ? (
            <span className="block w-full max-w-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s} alt="" className="mt-1 max-h-32 rounded border border-border object-contain" loading="lazy" />
            </span>
          ) : null}
        </span>
      );
    }
    return <span className="break-words">{s}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground">Empty list</span>;
    return (
      <ul className="list-inside list-disc space-y-1 text-sm">
        {value.map((item, index) => (
          <li key={index}>
            <NestedValue value={item} depth={depth + 1} />
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    if (depth > 6) {
      return <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs">{formatScalar(value)}</pre>;
    }
    return renderObjectEntries(value as Record<string, unknown>, depth);
  }
  return <span>{formatScalar(value)}</span>;
}

export function VerificationDocumentRefsDetail({
  documentRefs,
  className,
}: {
  documentRefs: string | Record<string, unknown> | null | undefined;
  className?: string;
}) {
  const parsed = normalizeVerificationDocumentRefs(documentRefs);

  if (parsed === null) {
    return (
      <div className={cn("border border-border bg-secondary/40 px-4 py-4", className)}>
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Submission detail</p>
        <p className="mt-2 text-sm text-muted-foreground">No document metadata was included in this submission.</p>
      </div>
    );
  }

  if (typeof parsed === "string") {
    return (
      <div className={cn("border border-border bg-secondary/40 px-4 py-4", className)}>
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Submission detail</p>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">{parsed}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 border border-border bg-secondary/40 px-4 py-4", className)}>
      <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Submission detail</p>
      <NestedValue value={parsed} depth={0} />
    </div>
  );
}
