import { notFound } from "next/navigation";
import {
  AdminAdsPage,
  AdminAnalyticsPage,
  AdminAuditPage,
  AdminCommentsPage,
  AdminDashboardPage,
  AdminListingsPage,
  AdminReportsPage,
  AdminSettingsPage,
  AdminUsersPage,
  AdminVerificationPage,
} from "@/components/admin/admin-pages";

type PageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function AdminCatchAllPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug.length === 1) {
    switch (slug[0]) {
      case "dashboard":
        return <AdminDashboardPage />;
      case "verification":
        return <AdminVerificationPage />;
      case "users":
        return <AdminUsersPage />;
      case "listings":
        return <AdminListingsPage />;
      case "comments":
        return <AdminCommentsPage />;
      case "reports":
        return <AdminReportsPage />;
      case "audit":
        return <AdminAuditPage />;
      case "analytics":
        return <AdminAnalyticsPage />;
      case "ads":
        return <AdminAdsPage />;
      case "settings":
        return <AdminSettingsPage />;
      default:
        notFound();
    }
  }

  notFound();
}
