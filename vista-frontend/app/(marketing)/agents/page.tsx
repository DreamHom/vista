import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { AgentCard } from "@/components/agents/agent-card";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { agents } from "@/lib/mock-data";

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
            All agents below are verified
          </Badge>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-fg">
            Talk to an agent who keeps the receipts.
          </h1>
          <p className="mt-3 text-fg-muted max-w-2xl">
            Every agent here passed identity, license and CAC checks. You can see their
            commissions, areas, deal history and review score before you say hello.
          </p>

          <form className="mt-8 grid gap-4 rounded-2xl border border-border bg-bg-elevated p-5 md:grid-cols-5">
            <div className="md:col-span-2">
              <Field label="Where">
                <Input placeholder="Lekki, Maitama, Yaba…" />
              </Field>
            </div>
            <Field label="Specialisation">
              <Select defaultValue="">
                <option value="">Any</option>
                <option>Luxury rentals</option>
                <option>Family homes</option>
                <option>Off-plan / land</option>
                <option>Corporate placements</option>
              </Select>
            </Field>
            <Field label="Min rating">
              <Select defaultValue="any">
                <option value="any">Any</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
                <option value="4.8">4.8+</option>
              </Select>
            </Field>
            <div className="flex items-end">
              <Button leadingIcon={<Icon.Search size={16} />} className="w-full">
                Search
              </Button>
            </div>
          </form>
        </div>
      </Section>

      <Section className="py-12">
        <SectionHeading
          title={`${agents.length} verified agents`}
          description="Sorted by deals closed in the last 12 months."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      </Section>
    </>
  );
}
