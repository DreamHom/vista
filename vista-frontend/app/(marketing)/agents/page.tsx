import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Find a verified agent",
  description:
    "Browse licensed real estate professionals reviewed and approved by DreamHomes admin.",
};

export default function AgentsPage() {
  return (
    <>
      <Section className="bg-bg-elevated border-b border-border">
        <div className="py-12">
          <Badge tone="verified" className="mb-3">
            <Icon.ShieldCheck size={12} />
            Directory backed by haven
          </Badge>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-fg">
            Talk to an agent who keeps the receipts.
          </h1>
          <p className="mt-3 text-fg-muted max-w-2xl">
            A public agent directory requires a haven endpoint (for example{" "}
            <code className="rounded bg-bg-sunken px-1 text-xs">GET /api/users?role=AGENT</code>
            ). Until then, open agents from listing cards or your assignments.
          </p>

          <form className="mt-8 grid gap-4 rounded-2xl border border-border bg-bg-elevated p-5 md:grid-cols-5">
            <div className="md:col-span-2">
              <Field label="Where">
                <Input placeholder="Lekki, Maitama, Yaba…" disabled />
              </Field>
            </div>
            <Field label="Specialisation">
              <Select defaultValue="" disabled>
                <option value="">Any</option>
                <option>Luxury rentals</option>
                <option>Family homes</option>
                <option>Off-plan / land</option>
                <option>Corporate placements</option>
              </Select>
            </Field>
            <Field label="Min rating">
              <Select defaultValue="any" disabled>
                <option value="any">Any</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
                <option value="4.8">4.8+</option>
              </Select>
            </Field>
            <div className="flex items-end">
              <Button leadingIcon={<Icon.Search size={16} />} className="w-full" disabled>
                Search
              </Button>
            </div>
          </form>
        </div>
      </Section>

      <Section className="py-12">
        <SectionHeading
          title="Agent directory"
          description="Powered by haven once the listing endpoint ships."
        />
        <div className="mt-8">
          <EmptyState
            title="No directory feed yet"
            description="Connect haven’s agent listing API to populate this grid. Individual profiles already work at /agents/[id] when you know the user id."
            icon={<Icon.Users size={20} />}
          />
        </div>
      </Section>
    </>
  );
}
