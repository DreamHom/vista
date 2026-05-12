import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { ListingCard } from "@/components/listings/listing-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";
import { getToken } from "@/lib/api/session";
import * as Assignments from "@/lib/api/agent-assignments";
import * as Listings from "@/lib/api/listings";
import { listingFromApi } from "@/lib/api/adapters";

export const metadata: Metadata = { title: "Agent · listings" };

export default async function AgentListingsPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/agent/listings");

  const assignments = await Assignments.listMyAssignments(token).catch(() => []);
  const accepted = assignments.filter((a) => a.status === "ACCEPTED");
  const listingIds = [...new Set(accepted.map((a) => a.listingId))];

  const cards = await Promise.all(
    listingIds.map(async (lid) => {
      const api = await Listings.getListing(lid).catch(() => null);
      if (!api) return null;
      const photos = await Listings.getListingPhotos(lid).catch(() => []);
      return listingFromApi(api, photos);
    }),
  );
  const myListings = cards.filter(Boolean) as ReturnType<typeof listingFromApi>[];

  return (
    <>
      <PageHeader
        title="Listings I manage"
        description="Across multiple owners. Each listing keeps its own pipeline."
      />
      <div className="px-6 lg:px-8 py-8">
        {myListings.length === 0 ? (
          <EmptyState
            title="No accepted listings yet"
            description="Accept an owner invitation to see listings here."
            icon={<Icon.Building size={20} />}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {myListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
