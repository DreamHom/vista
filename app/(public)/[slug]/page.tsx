import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaticPage } from "@/components/public/static-page";
import { getStaticPage, STATIC_PAGES } from "@/lib/public-site";
import { truncateMetaDescription } from "@/lib/seo-metadata";

export async function generateStaticParams() {
  return STATIC_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getStaticPage(slug);
  if (!page) {
    return { title: "Page", robots: { index: false, follow: true } };
  }

  const description = truncateMetaDescription(page.description);

  return {
    title: page.title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: page.title,
      description,
      url: `/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description,
    },
  };
}

export default async function StaticInfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getStaticPage(slug);
  if (!page) notFound();

  return <StaticPage page={page} />;
}
