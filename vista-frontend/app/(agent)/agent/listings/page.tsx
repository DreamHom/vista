import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { ListingCard } from "@/components/listings/listing-card";
import { listings } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Agent · listings" };

const myListings = listings.filter((l) => l.agentId);

export default function AgentListingsPage() {
  return (
    <>
      <PageHeader
        title="Listings I manage"
        description="Across multiple owners. Each listing keeps its own pipeline."
      />
      <div className="px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {myListings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </div>
    </>
  );
}
