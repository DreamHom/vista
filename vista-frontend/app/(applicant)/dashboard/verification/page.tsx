import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { VerificationSubmitForm } from "@/components/verification/verification-submit-form";

export const metadata: Metadata = { title: "Verification" };

export default function VerificationPage() {
  return (
    <>
      <PageHeader
        title="Trust badge"
        description="Optional — but verified applicants get faster replies and stronger negotiation positions."
      />
      <div className="px-6 lg:px-8 py-8 grid gap-6 max-w-3xl">
        <Card>
          <CardHeader
            title="Identity verification"
            description="Submit one government-issued ID. We confirm and never share."
            action={<VerifiedBadge kind="applicant" />}
          />
          <CardBody className="space-y-4">
            <VerificationSubmitForm
              track="APPLICANT_IDENTITY"
              hint="Upload your ID somewhere safe (e.g. Drive, Dropbox) and paste a shareable link per line. We&rsquo;ll review within 24 hours."
            />
            <p className="text-xs text-fg-subtle">
              Documents are encrypted at rest. Only the admin verification team
              can view them, and access is logged in the audit trail.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="What you unlock" />
          <CardBody>
            <ul className="space-y-3 text-sm text-fg-muted">
              {[
                "A trust badge that displays on offers and inspection requests.",
                "Priority response from many top agents.",
                "Stronger negotiating position — owners trust verified applicants.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <Icon.Check size={14} className="mt-1 text-success" />
                  {line}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <p className="text-xs text-fg-subtle">
          Reviewed within 24 hours by the DreamHomes admin team.{" "}
          <Badge tone="muted">SLA · 24h</Badge>
        </p>
      </div>
    </>
  );
}
