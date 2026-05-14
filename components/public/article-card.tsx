import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BlogArticle } from "@/lib/content/blog";

export function ArticleCard({
  article,
  featured = false,
}: {
  article: BlogArticle;
  featured?: boolean;
}) {
  return (
    <article className={`border border-border bg-card ${featured ? "p-6 md:p-8" : "p-5"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{article.category}</Badge>
        <span className="text-xs uppercase tracking-eyebrow text-muted-foreground">
          {article.readTime}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <Link
          href={`/blog/${article.slug}`}
          className={`block font-semibold tracking-tight text-foreground hover:text-accent ${featured ? "text-3xl md:text-4xl" : "text-xl"}`}
        >
          {article.title}
        </Link>
        <p className={`text-muted-foreground ${featured ? "max-w-3xl text-base leading-relaxed" : "text-sm leading-relaxed"}`}>
          {article.excerpt}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>
          {article.publishedAt} · {article.author}
        </span>
        <Link href={`/blog/${article.slug}`} className="inline-flex items-center gap-2 font-medium text-accent hover:text-accent/80">
          Read article
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
