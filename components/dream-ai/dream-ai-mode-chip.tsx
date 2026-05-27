import { Badge } from "@/components/ui/badge";

export function dreamAiModeLabel(provider: string | null | undefined): {
  show: boolean;
  label: string;
  title: string;
} | null {
  if (provider === "stub") {
    return {
      show: true,
      label: "Quick search",
      title: "Smart ranking is temporarily unavailable. Results use fast keyword and vector matching.",
    };
  }
  if (provider === "embeddings-only") {
    return {
      show: true,
      label: "Quick search",
      title:
        "This response used fast vector matching without Claude ranking. Sign in to enable smart ranking on each turn.",
    };
  }
  return null;
}

export function DreamAiModeChip({ provider }: { provider?: string | null }) {
  const mode = dreamAiModeLabel(provider);
  if (!mode) return null;

  return (
    <Badge variant="outline" className="font-normal" title={mode.title}>
      {mode.label}
    </Badge>
  );
}
