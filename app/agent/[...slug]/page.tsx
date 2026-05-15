import { notFound } from "next/navigation";
import {
  AgentAdsPage,
  AgentDashboardPage,
  AgentInspectionsPage,
  AgentLeadsPage,
  AgentListingManagementPage,
  AgentListingsPage,
  AgentNotificationsPage,
  AgentOffersPage,
  AgentOwnersPage,
  AgentProfilePage,
  AgentReviewsPage,
  AgentSettingsPage,
} from "@/components/agent/agent-pages";

type PageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function AgentCatchAllPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug.length === 1) {
    switch (slug[0]) {
      case "dashboard":
        return <AgentDashboardPage />;
      case "listings":
        return <AgentListingsPage />;
      case "inspections":
        return <AgentInspectionsPage />;
      case "leads":
        return <AgentLeadsPage />;
      case "offers":
        return <AgentOffersPage />;
      case "owners":
        return <AgentOwnersPage />;
      case "reviews":
        return <AgentReviewsPage />;
      case "profile":
        return <AgentProfilePage />;
      case "ads":
        return <AgentAdsPage />;
      case "notifications":
        return <AgentNotificationsPage />;
      case "settings":
        return <AgentSettingsPage />;
      default:
        notFound();
    }
  }

  if (slug.length === 2 && slug[0] === "listings") {
    const listingId = Number(slug[1]);
    if (!Number.isFinite(listingId)) {
      notFound();
    }
    return <AgentListingManagementPage listingId={listingId} />;
  }

  notFound();
}
