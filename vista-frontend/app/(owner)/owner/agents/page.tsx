import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AgentCard } from "@/components/agents/agent-card";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { agents } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Find agents" };

export default function OwnerAgentsPage() {
  return (
    <>
      <PageHeader
        title="Assign an agent"
        description="Optional, but recommended. Owners with assigned agents convert offers ~2× faster."
      />
      <div className="px-6 lg:px-8 py-8 space-y-8">
        <Card>
          <CardHeader title="Find by area & specialisation" />
          <CardBody className="grid gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <Field label="Area">
                <Input placeholder="Lekki Phase 1, Maitama…" />
              </Field>
            </div>
            <Field label="Specialisation">
              <Select>
                <option value="">Any</option>
                <option>Luxury rentals</option>
                <option>Family homes</option>
                <option>Off-plan</option>
                <option>Corporate</option>
              </Select>
            </Field>
            <Field label="Min rating">
              <Select defaultValue="any">
                <option value="any">Any</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
              </Select>
            </Field>
            <div className="flex items-end">
              <Button leadingIcon={<Icon.Search size={16} />} className="w-full">
                Search
              </Button>
            </div>
          </CardBody>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      </div>
    </>
  );
}
