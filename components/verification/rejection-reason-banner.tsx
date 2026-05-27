export function RejectionReasonBanner({ reason }: { reason: string }) {
  const trimmed = reason.trim();
  if (!trimmed) return null;

  return (
    <div className="border border-destructive/30 bg-destructive/5 p-4" role="alert">
      <p className="text-sm font-semibold text-foreground">Submission rejected</p>
      <blockquote className="mt-2 border-l-2 border-destructive/40 pl-3 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{trimmed}&rdquo;
      </blockquote>
      <p className="mt-2 text-xs text-muted-foreground">
        Fix what is noted above, then submit again when you are ready.
      </p>
    </div>
  );
}
