import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/public/article-card";
import { BLOG_ARTICLES, getBlogArticle, getRelatedArticles } from "@/lib/content/blog";
import { truncateMetaDescription } from "@/lib/seo-metadata";

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) return { title: "Blog", robots: { index: false, follow: true } };
  const description = truncateMetaDescription(article.excerpt);
  return {
    title: article.title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: article.title,
      description,
      url: `/blog/${slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) notFound();

  const related = getRelatedArticles(article);

  return (
    <div className="container py-10 md:py-14">
      <article className="mx-auto max-w-4xl border border-border bg-card p-6 md:p-8">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{article.category}</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-5xl">
          {article.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>{article.publishedAt}</span>
          <span>{article.readTime}</span>
          <span>{article.author}</span>
        </div>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">{article.excerpt}</p>

        <div className="mt-8 space-y-8">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">{section.heading}</h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Related articles</h2>
          <Link href="/blog" className="text-sm font-medium text-accent hover:text-accent/80">
            Back to blog
          </Link>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {related.map((item) => (
            <ArticleCard key={item.slug} article={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
