import { formatDateTime } from "@/components/dashboard/utils";

export function PendingVerificationNotice({ submittedAt }: { submittedAt: string }) {
  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
      <p className="text-sm font-semibold text-foreground">Under review</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Review usually takes up to three business days. When there is a decision, your status will update here and you will get a response through your notifications.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">Submitted {formatDateTime(submittedAt)}.</p>
    </div>
  );
}
