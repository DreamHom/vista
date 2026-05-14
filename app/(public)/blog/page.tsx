import type { Metadata } from "next";
import { Search } from "lucide-react";
import { ArticleCard } from "@/components/public/article-card";
import { BLOG_ARTICLES, BLOG_CATEGORIES } from "@/lib/content/blog";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Property education, market guidance, and practical resources from DreamHomes.",
};

interface BlogSearchParams {
  q?: string;
  category?: string;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<BlogSearchParams>;
}) {
  const params = await searchParams;
  const q = params.q?.trim().toLowerCase() ?? "";
  const category = params.category?.trim();

  const filtered = BLOG_ARTICLES.filter((article) => {
    const matchesCategory = !category || article.category === category;
    const haystack = `${article.title} ${article.excerpt} ${article.category}`.toLowerCase();
    const matchesQuery = !q || haystack.includes(q);
    return matchesCategory && matchesQuery;
  });

  const featured = filtered.find((article) => article.featured) ?? filtered[0];
  const rest = filtered.filter((article) => article.slug !== featured?.slug);

  return (
    <div className="container py-10 md:py-14">
      <section className="border border-border bg-card p-6 md:p-8">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Blog / Resources</p>
        <h1 className="mt-3 max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          Property education for people trying to make better decisions, not faster mistakes.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Browse guides for renters, buyers, owners, and agents navigating Nigerian real estate with more clarity.
        </p>

        <form action="/blog" className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search articles"
              className="pl-10"
              size="lg"
            />
          </div>
          <button type="submit" className={buttonVariants({ variant: "primary", size: "lg" })}>
            Search
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          <a href="/blog" className={cn(buttonVariants({ variant: !category ? "primary" : "outline", size: "sm" }))}>
            All
          </a>
          {BLOG_CATEGORIES.map((item) => (
            <a
              key={item}
              href={`/blog?category=${encodeURIComponent(item)}`}
              className={cn(buttonVariants({ variant: category === item ? "primary" : "outline", size: "sm" }))}
            >
              {item}
            </a>
          ))}
        </div>
      </section>

      {featured ? (
        <section className="mt-8">
          <ArticleCard article={featured} featured />
        </section>
      ) : null}

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rest.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </section>
    </div>
  );
}
