import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { ListingCard } from "@/components/listings/listing-card";
import { listings } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Saved listings" };

export default function SavedPage() {
  const saved = listings.slice(0, 4);
  return (
    <>
      <PageHeader
        title="Saved listings"
        description="The shortlist. Compare them, request inspections, drop questions in the public thread."
      />
      <div className="px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {saved.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </div>
    </>
  );
}
