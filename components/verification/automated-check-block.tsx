import { Badge } from "@/components/ui/badge";
import {
  formatExtractedFieldKey,
  parseExtractedFields,
  type AutomatedCheckResultResponse,
} from "@/lib/verification-types";

function statusVariant(status: AutomatedCheckResultResponse["status"]) {
  if (status === "PASSED") return "default" as const;
  if (status === "FAILED") return "destructive" as const;
  return "outline" as const;
}

function formatScore(score: number) {
  return `${Math.round(score * 100)}%`;
}

export function AutomatedCheckBlock({
  checks,
}: {
  checks: AutomatedCheckResultResponse[] | null | undefined;
}) {
  if (checks == null) {
    return (
      <p className="text-xs text-muted-foreground">No automated check ran on this submission (legacy row).</p>
    );
  }

  if (checks.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No automated check ran on this submission.</p>
    );
  }

  return (
    <div className="space-y-3 border border-border bg-secondary/20 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-foreground">Automated pre-check</p>
        {checks.some((row) => row.providerName === "MOCK") ? (
          <Badge variant="outline" className="text-xs">
            MOCKED v1
          </Badge>
        ) : null}
      </div>
      {checks.map((row) => {
        const extracted = parseExtractedFields(row.extractedFields);
        return (
          <div key={`${row.checkType}-${row.providerReference}`} className="space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
              <span className="text-muted-foreground">
                {row.providerName} · {formatScore(row.score)} confidence
              </span>
            </div>
            {extracted ? (
              <ul className="space-y-1 text-muted-foreground">
                {Object.entries(extracted).map(([key, value]) => (
                  <li key={key}>
                    <span className="font-medium text-foreground">{formatExtractedFieldKey(key)}:</span>{" "}
                    {String(value)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">{row.extractedFields}</p>
            )}
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground">
        MOCKED v1: admins remain the source of truth. Automated results do not auto-approve.
      </p>
    </div>
  );
}
