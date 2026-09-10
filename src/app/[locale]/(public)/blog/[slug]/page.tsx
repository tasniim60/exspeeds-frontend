import { getPostBySlug, getPosts, getRankMathSchema } from "@/lib/wordpress";
import SinglePostClient from "@/components/SinglePostClient";
import { Metadata } from "next";

export const revalidate = 60; // ISR: revalidate every 60 seconds

interface PageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateStaticParams() {
  try {
    const [arPosts, enPosts] = await Promise.all([
      getPosts(50, "ar"),
      getPosts(50, "en"),
    ]);
    const arParams = arPosts.map((post) => ({
      locale: "ar",
      slug: post.slug,
    }));
    const enParams = enPosts.map((post) => ({
      locale: "en",
      slug: post.slug,
    }));
    return [...arParams, ...enParams];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params?.locale === "en" ? "en" : "ar";
  const post = await getPostBySlug(params.slug, locale);
  const rawTitle = post?.rank_math_seo?.title || post?.title.rendered || "Logistics Insights";
  const cleanTitle = rawTitle.replace(/<[^>]*>?/gm, "").replace(/&#\d+;/g, "").trim();
  const pageTitle = cleanTitle.replace(/\s*\|\s*XSPEED/gi, "").replace(/\s*\|\s*إكس سبيد/gi, "").trim();

  const rawDesc =
    post?.rank_math_seo?.description ||
    post?.excerpt?.rendered ||
    "Express logistics analysis, supply chain optimizations, and freight intelligence from XSPEED.";
  const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim().slice(0, 160);

  const rawImage = post?.rank_math_seo?.og_image || post?.featured_image_url || "/assets/xspeed_about_showcase.jpg";
  const ogImageUrl = rawImage.startsWith("http") ? rawImage : "https://exspeeds.com" + (rawImage.startsWith("/") ? "" : "/") + rawImage;

  const postUrl = "https://exspeeds.com/" + locale + "/blog/" + params.slug;

  const keywords = [
    post?.rank_math_seo?.focus_keyword,
    post?.category_name,
    "logistics",
    "express freight",
    "customs clearance",
  ].filter(Boolean) as string[];

  return {
    title: pageTitle,
    description: cleanDesc,
    keywords: keywords,
    alternates: {
      canonical: postUrl,
      languages: {
        ar: "https://exspeeds.com/ar/blog/" + params.slug,
        en: "https://exspeeds.com/en/blog/" + params.slug,
        "x-default": "https://exspeeds.com/en/blog/" + params.slug,
      },
    },
    openGraph: {
      type: "article",
      title: post?.rank_math_seo?.og_title || pageTitle,
      description: post?.rank_math_seo?.og_description || cleanDesc,
      url: postUrl,
      siteName: locale === "ar" ? "إكس سبيد للخدمات اللوجستية" : "XSPEED Logistics",
      locale: locale === "ar" ? "ar_EG" : "en_US",
      publishedTime: post?.date,
      modifiedTime: post?.modified || post?.date,
      authors: [post?.author_name || (locale === "ar" ? "فريق تحرير إكس سبيد" : "XSPEED Editorial Team")],
      section: post?.category_name || "Technology & Logistics",
      tags: keywords,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: cleanTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post?.rank_math_seo?.twitter_title || pageTitle,
      description: post?.rank_math_seo?.twitter_description || cleanDesc,
      images: [post?.rank_math_seo?.twitter_image || ogImageUrl],
      creator: "@xspeed_express",
    },
  };
}

export default async function SinglePostPage({ params }: PageProps) {
  const locale = params?.locale === "en" ? "en" : "ar";
  const post = await getPostBySlug(params.slug, locale);
  const postUrl = "https://exspeeds.com/" + locale + "/blog/" + params.slug;

  // Fetch canonical Rank Math Schema
  const schemas = await getRankMathSchema(postUrl, post);

  return (
    <>
      {/* Schema.org JSON-LD Structured Data for Google Rich Snippets & AI Citations */}
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <SinglePostClient slug={params.slug} initialPost={post} />
    </>
  );
}