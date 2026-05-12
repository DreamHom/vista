import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Owner · agents" };

export default function OwnerAgentsPage() {
  return (
    <>
      <PageHeader
        title="Find an agent"
        description="Invite verified agents to manage your listings. Directory search is powered by haven when available."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardBody className="py-12">
            <EmptyState
              title="Agent directory not loaded"
              description="Use listing-level assignment to pick agents you already know, or browse the marketing agents page for public profiles."
              icon={<Icon.Users size={20} />}
            />
            <div className="mt-6 flex justify-center">
              <ButtonLink href="/agents" variant="outline" trailingIcon={<Icon.ArrowRight size={14} />}>
                Open agents page
              </ButtonLink>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
