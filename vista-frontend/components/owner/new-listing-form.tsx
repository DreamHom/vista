"use client";

import { useActionState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { PROPERTY_TYPES } from "@/lib/constants";
import {
  createListingAction,
  type ActionState,
} from "@/lib/actions/listings";

export function NewListingForm() {
  const [state, formAction, pending] = useActionState<
    ActionState | undefined,
    FormData
  >(createListingAction, undefined);

  return (
    <form action={formAction} className="grid gap-6">
      {state?.ok === false ? (
        <div
          role="alert"
          className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {state.error}
        </div>
      ) : null}

      <Card>
        <CardHeader
          title="The basics"
          description="What is it, where is it, how do you describe it?"
        />
        <CardBody className="space-y-5">
          <Field
            label="Listing title"
            hint="Be specific. &lsquo;3-bed flat in Lekki Phase 1&rsquo; beats &lsquo;Beautiful apartment.&rsquo;"
          >
            <Input
              name="title"
              required
              placeholder="e.g. 3-bed apartment, quiet street in Lekki Phase 1"
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Purpose">
              <Select name="purpose" defaultValue="RENT" required>
                <option value="RENT">For rent</option>
                <option value="SALE">For sale</option>
              </Select>
            </Field>
            <Field label="Property type">
              <Select name="propertyType" required>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              name="description"
              required
              rows={5}
              placeholder="Walk us through the place. What's the vibe, what's the flooding situation, what's the power band?"
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Where" />
        <CardBody>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="State">
              <Select name="state" defaultValue="Lagos">
                <option>Lagos</option>
                <option>FCT</option>
                <option>Rivers</option>
                <option>Oyo</option>
              </Select>
            </Field>
            <Field label="City">
              <Input name="city" required placeholder="Lagos" />
            </Field>
            <Field label="Area / neighbourhood">
              <Input name="area" required placeholder="Lekki Phase 1" />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Layout" />
        <CardBody className="grid gap-4 md:grid-cols-3">
          <Field label="Bedrooms">
            <Input name="bedrooms" type="number" min={0} defaultValue={3} required />
          </Field>
          <Field label="Bathrooms">
            <Input name="bathrooms" type="number" min={0} defaultValue={3} required />
          </Field>
          <Field label="Toilets">
            <Input name="toilets" type="number" min={0} defaultValue={4} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Fees & terms"
          description="Be honest. Hidden fees get listings flagged."
        />
        <CardBody className="grid gap-4 md:grid-cols-2">
          <Field label="Rent (annual, ₦)">
            <Input name="rent" type="number" min={0} placeholder="0" />
          </Field>
          <Field label="Asking price (sale, ₦)">
            <Input name="price" type="number" min={0} placeholder="0" />
          </Field>
          <Field label="Caution deposit">
            <Input name="caution" type="number" min={0} placeholder="0" />
          </Field>
          <Field label="Service charge">
            <Input name="serviceCharge" type="number" min={0} placeholder="0" />
          </Field>
          <Field label="Agency fee">
            <Input name="agencyFee" type="number" min={0} placeholder="0" />
          </Field>
          <Field label="Legal fee">
            <Input name="legalFee" type="number" min={0} placeholder="0" />
          </Field>
          <Field label="Rent frequency">
            <Select name="rentFrequency" defaultValue="YEARLY">
              <option value="YEARLY">Yearly</option>
              <option value="MONTHLY">Monthly</option>
            </Select>
          </Field>
          <Field label="Virtual tour URL (optional)">
            <Input
              name="virtualTourUrl"
              type="url"
              placeholder="https://"
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Amenities & highlights"
          description="Goes on the listing card and detail page."
        />
        <CardBody className="space-y-4">
          <Field
            label="Amenities"
            hint="Comma-separated. e.g. 24/7 power, Gated estate, Borehole"
          >
            <Input
              name="amenities"
              placeholder="24/7 power, Gated estate, Borehole"
            />
          </Field>
          <Field
            label="Highlights"
            hint="One per line. Be specific about what makes this place a yes."
          >
            <Textarea
              name="highlights"
              rows={4}
              placeholder={`Quiet street\nFresh paint\nWorks-from-home friendly internet`}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Photos & tour"
          description="Upload after the listing is created — you'll land on its dashboard where you can manage media and ordering."
        />
        <CardBody>
          <div className="rounded-xl border border-dashed border-border bg-bg-sunken/40 p-6 text-sm text-fg-muted">
            <Icon.Plus size={16} className="inline -mt-0.5 mr-1.5" />
            After publishing you&rsquo;ll be redirected to the listing page where
            you can upload photos and set the cover image.
          </div>
        </CardBody>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ButtonLink href="/owner/listings" variant="ghost">
          Cancel
        </ButtonLink>
        <Button
          size="lg"
          type="submit"
          disabled={pending}
          trailingIcon={<Icon.ArrowRight size={16} />}
        >
          {pending ? "Publishing…" : "Publish listing"}
        </Button>
      </div>
    </form>
  );
}
