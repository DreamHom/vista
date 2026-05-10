import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { PROPERTY_TYPES } from "@/lib/constants";

export function ListingFilters() {
  return (
    <form className="rounded-2xl border border-border bg-bg-elevated p-5">
      <div className="grid gap-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <Field label="Where" htmlFor="filter-where">
            <Input
              id="filter-where"
              placeholder="Lekki, Yaba, Maitama…"
              defaultValue=""
            />
          </Field>
        </div>
        <Field label="Purpose" htmlFor="filter-purpose">
          <Select id="filter-purpose" defaultValue="rent">
            <option value="rent">For rent</option>
            <option value="sale">For sale</option>
          </Select>
        </Field>
        <Field label="Type" htmlFor="filter-type">
          <Select id="filter-type" defaultValue="">
            <option value="">Any type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Beds" htmlFor="filter-beds">
          <Select id="filter-beds" defaultValue="">
            <option value="">Any</option>
            <option value="0">Studio</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </Select>
        </Field>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-5">
        <Field label="Min budget" htmlFor="filter-min">
          <Input id="filter-min" type="number" placeholder="₦" />
        </Field>
        <Field label="Max budget" htmlFor="filter-max">
          <Input id="filter-max" type="number" placeholder="₦" />
        </Field>
        <Field label="Verified" htmlFor="filter-verified">
          <Select id="filter-verified" defaultValue="any">
            <option value="any">Any</option>
            <option value="owner">Owner verified</option>
            <option value="docs">Documents verified</option>
            <option value="both">Both</option>
          </Select>
        </Field>
        <Field label="Furnishing" htmlFor="filter-furnish">
          <Select id="filter-furnish" defaultValue="any">
            <option value="any">Any</option>
            <option value="furnished">Furnished</option>
            <option value="semi">Semi-furnished</option>
            <option value="none">Unfurnished</option>
          </Select>
        </Field>
        <div className="flex items-end gap-2">
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            leadingIcon={<Icon.Search size={16} />}
          >
            Search
          </Button>
          <Button variant="outline" size="md" leadingIcon={<Icon.Filter size={16} />}>
            More
          </Button>
        </div>
      </div>
    </form>
  );
}
