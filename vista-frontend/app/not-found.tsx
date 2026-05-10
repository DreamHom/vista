import { ButtonLink } from "@/components/ui/button";
import { Logo, Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex-1 flex flex-col items-center justify-center px-6 py-20 bg-dream-gradient">
      <Logo />
      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
        404 · page not found
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-fg max-w-2xl text-center">
        That door doesn&rsquo;t open. Try one of these.
      </h1>
      <p className="mt-3 text-fg-muted max-w-xl text-center">
        Maybe the listing was taken down, or the link is older than the average tenancy.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3 justify-center">
        <ButtonLink href="/" trailingIcon={<Icon.ArrowRight size={16} />}>
          Go home
        </ButtonLink>
        <ButtonLink href="/listings" variant="outline">
          Browse listings
        </ButtonLink>
        <ButtonLink href="/dream" variant="ghost">
          Ask Dream AI
        </ButtonLink>
      </div>
    </div>
  );
}
