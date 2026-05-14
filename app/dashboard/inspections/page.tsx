import { Suspense } from "react";
import { ApplicantInspectionsPage } from "@/components/dashboard/inspections-page";
import { Spinner } from "@/components/ui/spinner";

export default function InspectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      }
    >
      <ApplicantInspectionsPage />
    </Suspense>
  );
}
