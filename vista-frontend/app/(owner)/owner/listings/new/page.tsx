import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { PROPERTY_TYPES } from "@/lib/constants";

export const metadata: Metadata = { title: "New listing" };

export default function NewListingPage() {
  return (
    <>
      <PageHeader
        title="Create a listing"
        description="Goes live immediately with an unverified badge. Submit docs separately to earn the blue tick."
        actions={<ButtonLink href="/owner/listings" variant="ghost">Cancel</ButtonLink>}
      />

      <div className="px-6 lg:px-8 py-8 grid gap-6 max-w-4xl">
        <Card>
          <CardHeader title="The basics" description="What is it, where is it, how do you describe it?" />
          <CardBody className="space-y-5">
            <Field label="Listing title" hint="Be specific. &lsquo;3-bed flat in Lekki Phase 1&rsquo; beats &lsquo;Beautiful apartment.&rsquo;">
              <Input placeholder="e.g. 3-bed apartment, quiet street in Lekki Phase 1" />
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Purpose">
                <Select defaultValue="rent">
                  <option value="rent">For rent</option>
                  <option value="sale">For sale</option>
                </Select>
              </Field>
              <Field label="Property type">
                <Select>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Status">
                <Select defaultValue="live">
                  <option value="draft">Save as draft</option>
                  <option value="live">Publish live</option>
                </Select>
              </Field>
            </div>
            <Field label="Description">
              <Textarea placeholder="Walk us through the place. What's the vibe, what's the flooding situation, what's the power band?" />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Where" />
          <CardBody>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="State">
                <Select defaultValue="Lagos">
                  <option>Lagos</option>
                  <option>FCT</option>
                  <option>Rivers</option>
                  <option>Oyo</option>
                </Select>
              </Field>
              <Field label="City">
                <Input placeholder="Lagos" />
              </Field>
              <Field label="Area / neighbourhood">
                <Input placeholder="Lekki Phase 1" />
              </Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Layout" />
          <CardBody className="grid gap-4 md:grid-cols-3">
            <Field label="Bedrooms">
              <Input type="number" defaultValue={3} />
            </Field>
            <Field label="Bathrooms">
              <Input type="number" defaultValue={3} />
            </Field>
            <Field label="Toilets">
              <Input type="number" defaultValue={4} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Fees & terms" description="Be honest. Hidden fees get listings flagged." />
          <CardBody className="grid gap-4 md:grid-cols-2">
            <Field label="Rent (yearly)">
              <Input type="number" placeholder="₦" />
            </Field>
            <Field label="Caution deposit">
              <Input type="number" placeholder="₦" />
            </Field>
            <Field label="Service charge">
              <Input type="number" placeholder="₦" />
            </Field>
            <Field label="Agency fee">
              <Input type="number" placeholder="₦" />
            </Field>
            <Field label="Legal fee">
              <Input type="number" placeholder="₦" />
            </Field>
            <Field label="Rent frequency">
              <Select defaultValue="yearly">
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Photos & tour" description="Up to 12 photos. First one is the cover." />
          <CardBody>
            <div className="rounded-xl border border-dashed border-border bg-bg-sunken/40 p-8 text-center">
              <Icon.Plus size={20} className="mx-auto text-fg-muted" />
              <p className="mt-2 text-sm font-medium text-fg">Drop photos here</p>
              <p className="text-xs text-fg-muted">JPG or PNG · 4:3 looks best · max 8MB each</p>
              <Button variant="outline" size="sm" className="mt-4">Choose files</Button>
            </div>
            <div className="mt-4">
              <Field label="Virtual tour URL (optional)">
                <Input placeholder="https://" />
              </Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Management"
            description="Self-manage now, assign an agent later. Or assign one now."
          />
          <CardBody>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm flex-1 cursor-pointer">
                <input type="radio" name="manage" defaultChecked />
                Self-manage for now
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm flex-1 cursor-pointer">
                <input type="radio" name="manage" />
                Assign a verified agent
                <Badge tone="brand" className="ml-auto">recommended</Badge>
              </label>
            </div>
          </CardBody>
        </Card>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <ButtonLink href="/owner/listings" variant="ghost">
            Save draft
          </ButtonLink>
          <Button size="lg" trailingIcon={<Icon.ArrowRight size={16} />}>
            Publish listing
          </Button>
        </div>
      </div>
    </>
  );
}
