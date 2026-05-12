import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { ListingCard } from "@/components/listings/listing-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";
import * as Saves from "@/lib/api/saves";
import * as Listings from "@/lib/api/listings";
import { listingFromApi } from "@/lib/api/adapters";
import { getToken } from "@/lib/api/session";

export const metadata: Metadata = { title: "Saved listings" };

export default async function SavedPage() {
  const token = await getToken();
  if (!token) {
    redirect("/login?next=/dashboard/saved");
  }

  let saved: ReturnType<typeof listingFromApi>[] = [];
  let error: string | null = null;
  try {
    const items = await Saves.listMySaves(token, 0, 100);
    const listings = await Promise.all(
      items.content.map(async (s) => {
        const api = await Listings.getListing(String(s.listingId)).catch(() => null);
        if (!api) return null;
        const photos = await Listings.getListingPhotos(String(s.listingId)).catch(() => []);
        return listingFromApi(api, photos);
      }),
    );
    saved = listings.filter(Boolean) as ReturnType<typeof listingFromApi>[];
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load saves.";
  }

  return (
    <>
      <PageHeader
        title="Saved listings"
        description="The shortlist. Compare them, request inspections, drop questions in the public thread."
      />
      <div className="px-6 lg:px-8 py-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn">
            {error}
          </div>
        ) : null}

        {saved.length === 0 ? (
          <EmptyState
            title="No saves yet."
            description="Heart a listing to keep it here. You can compare them side-by-side and request inspections from one place."
            icon={<Icon.Heart size={20} />}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {saved.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
