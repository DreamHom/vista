import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { ButtonLink } from "@/components/ui/button";
import { NewListingForm } from "@/components/owner/new-listing-form";
import { getToken } from "@/lib/api/session";

export const metadata: Metadata = { title: "New listing" };

export default async function NewListingPage() {
  const token = await getToken();
  if (!token) {
    redirect("/login?next=/owner/listings/new");
  }
  return (
    <>
      <PageHeader
        title="Create a listing"
        description="Goes live immediately with an unverified badge. Submit docs separately to earn the blue tick."
        actions={
          <ButtonLink href="/owner/listings" variant="ghost">
            Cancel
          </ButtonLink>
        }
      />
      <div className="px-6 lg:px-8 py-8 grid gap-6 max-w-4xl">
        <NewListingForm />
      </div>
    </>
  );
}
