import { OwnerPropertyDetailPage } from "@/components/owner/owner-pages";

export default async function OwnerPropertyDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <OwnerPropertyDetailPage propertyId={Number(id)} />;
}
