import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ListingScheduleInspectionLink } from "./listing-schedule-inspection-link";

export function PrimaryCtaRow({
  scheduleHref,
  scheduleListingId,
  contactHref,
  contactLabel = "Contact Agent",
  layout = "responsive",
}: {
  scheduleHref: string;
  /** When set, the schedule CTA is auth-aware (applicants → inspections workspace). */
  scheduleListingId?: string;
  contactHref: string;
  contactLabel?: string;
  /** `stack`: always full-width vertical (narrow sidebars). `responsive`: column on xs, row from sm up. */
  layout?: "responsive" | "stack";
}) {
  const stack = layout === "stack";
  return (
    <div className={cn("flex gap-3", stack ? "w-full min-w-0 flex-col" : "min-w-0 flex-col sm:flex-row")}>
      {scheduleListingId ? (
        <ListingScheduleInspectionLink
          listingId={scheduleListingId}
          variant="primary"
          size="lg"
          className={cn(stack && "w-full min-w-0 justify-center text-center")}
        >
          Schedule Inspection
        </ListingScheduleInspectionLink>
      ) : (
        <Link
          href={scheduleHref}
          className={cn(
            buttonVariants({ variant: "primary", size: "lg" }),
            stack && "w-full min-w-0 justify-center text-center",
          )}
        >
          Schedule Inspection
        </Link>
      )}
      <Link
        href={contactHref}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          stack && "w-full min-w-0 justify-center text-center",
        )}
      >
        {contactLabel}
      </Link>
    </div>
  );
}
