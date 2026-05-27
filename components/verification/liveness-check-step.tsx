"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Camera } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { runLivenessCheck, type LivenessCheckResponse } from "@/lib/verification-liveness";

export function LivenessCheckStep({
  livenessId,
  onLivenessId,
  onContinue,
}: {
  livenessId: number | null;
  onLivenessId: (id: number | null) => void;
  onContinue: () => void;
}) {
  const [result, setResult] = useState<LivenessCheckResponse | null>(null);

  const mutation = useMutation({
    mutationFn: runLivenessCheck,
    onSuccess: (row) => {
      setResult(row);
      onLivenessId(row.id);
      toast.success("Liveness check passed (mocked).");
    },
    onError: () => toast.error("We could not run the liveness check. Try again."),
  });

  if (livenessId != null && result) {
    return (
      <div className="space-y-4 border border-border bg-secondary/20 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Liveness check passed (mocked)</p>
          <Badge variant="outline">MOCKED v1</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Provider {result.provider}, score {Math.round(result.score * 100)}%. Continue to upload documents.
        </p>
        <Button type="button" variant="primary" onClick={onContinue}>
          Continue to documents
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 border border-dashed border-border bg-secondary/15 p-5">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-foreground">Step 1 of 2: Liveness check</p>
        <Badge variant="outline">MOCKED v1</Badge>
      </div>
      <div className="flex min-h-[10rem] flex-col items-center justify-center gap-3 border border-dashed border-border bg-background px-4 py-8 text-center">
        <Camera className="h-10 w-10 text-muted-foreground" aria-hidden />
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Production verification would ask you to blink and turn your head on cue. For v1 this step is mocked:
          the integration point is real, and a biometric provider plugs in here in phase 2.
        </p>
      </div>
      <Button type="button" variant="primary" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
        {mutation.isPending ? "Running mocked check…" : "Run mocked check"}
      </Button>
    </div>
  );
}
