import type { ReactNode } from "react";

export function PublicApiNotice({ children }: { children: ReactNode }) {
  return <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{children}</div>;
}
