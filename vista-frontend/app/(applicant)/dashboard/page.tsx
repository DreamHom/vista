import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Stat } from "@/components/ui/stat";
import { ListingCard } from "@/components/listings/listing-card";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/icons";
import { firstName, getSessionUser } from "@/lib/api/session-user";
import { getToken } from "@/lib/api/session";
import { listingFromApi } from "@/lib/api/adapters";
import * as Listings from "@/lib/api/listings";
import * as Saves from "@/lib/api/saves";
import * as Notifications from "@/lib/api/notifications";

export const metadata: Metadata = { title: "Dashboard" };

export default async function ApplicantDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");
  const token = await getToken();
  if (!token) redirect("/login?next=/dashboard");
  const greet = firstName(user);

  const [savedPage, browse, unread] = await Promise.all([
    Saves.listMySaves(token, 0, 100).catch(() => ({
      content: [],
      page: { size: 0, number: 0, totalElements: 0, totalPages: 0 },
    })),
    Listings.listListings({ page: 0, size: 6 }).catch(() => null),
    Notifications.getUnreadCount(token).catch(() => ({ count: 0 })),
  ]);
  const saves = savedPage.content;

  const savedListings = (
    await Promise.all(
      saves.slice(0, 3).map(async (saved) => {
        const api = await Listings.getListing(String(saved.listingId)).catch(() => null);
        if (!api) return null;
        const photos = await Listings.getListingPhotos(String(saved.listingId)).catch(() => []);
        return listingFromApi(api, photos);
      }),
    )
  ).filter(Boolean) as ReturnType<typeof listingFromApi>[];

  const recommended =
    saves.length > 0
      ? savedListings
      : (browse?.content ?? []).slice(0, 3).map((l) => listingFromApi(l));

  return (
    <>
      <PageHeader
        title={`Hi ${greet} — pick up where you left off.`}
        description="Your saved homes, scheduled inspections and live offers in one calm place."
        actions={
          <ButtonLink href="/listings" trailingIcon={<Icon.ArrowRight size={16} />}>
            Browse listings
          </ButtonLink>
        }
      />

      <div className="px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat
            label="Saved"
            value={`${saves.length}`}
            icon={<Icon.Bookmark size={14} />}
          />
          <Stat
            label="Inspections"
            value="—"
            icon={<Icon.Calendar size={14} />}
          />
          <Stat
            label="Open offers"
            value="—"
            icon={<Icon.Coin size={14} />}
          />
          <Stat
            label="Notifications"
            value={`${unread.count}`}
            tone={unread.count > 0 ? "positive" : undefined}
            icon={<Icon.Chat size={14} />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Recommended for you"
              description={
                saves.length > 0
                  ? "From your saved listings."
                  : "Fresh on the marketplace — save homes you like to personalize this."
              }
            />
            <CardBody>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {recommended.length === 0 ? (
                  <p className="text-sm text-fg-muted col-span-full">
                    No listings to show yet. Browse and save properties you are interested in.
                  </p>
                ) : (
                  recommended.map((l) => <ListingCard key={l.id} listing={l} />)
                )}
              </div>
            </CardBody>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Upcoming inspections" />
              <CardBody className="space-y-4">
                <p className="text-sm text-fg-muted">
                  The backend does not expose a dedicated “my inspections” feed yet. You can
                  still request an inspection from any listing page and track the response in
                  notifications.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Active offers" />
              <CardBody className="space-y-3">
                <p className="text-sm text-fg-muted">
                  The backend supports submitting and responding to offers, but it does not expose
                  a “my offers” list endpoint yet. Watch your notifications after submission.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
