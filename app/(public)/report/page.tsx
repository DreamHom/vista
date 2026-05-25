import type { Metadata } from "next";
import { FormShell } from "@/components/public/form-shell";
import { ReportListingForm } from "@/components/public/simple-public-forms";

export const metadata: Metadata = {
  title: "Report a Listing",
  description: "Flag a suspicious or inaccurate DreamHomes listing for review.",
};

export default function ReportPage() {
  return (
    <FormShell
      eyebrow="Report a listing"
      title="Flag a listing that looks wrong"
      description="Report fraud, wrong details, a property already taken, or unsafe content. You do not need an account."
      maxWidth="max-w-2xl"
    >
      <ReportListingForm />
    </FormShell>
  );
}
