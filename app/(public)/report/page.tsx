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
      eyebrow="Report a Listing"
      title="Help us keep DreamHomes trustworthy."
      description="Flag a listing that looks fraudulent, inaccurate, already taken, or otherwise unsafe. No account is required for this report form."
      maxWidth="max-w-2xl"
    >
      <ReportListingForm />
    </FormShell>
  );
}
