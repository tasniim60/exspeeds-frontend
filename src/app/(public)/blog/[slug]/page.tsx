import { getPostBySlug, getPosts } from "@/lib/wordpress";
import SinglePostClient from "@/components/SinglePostClient";
import { Metadata } from "next";

export const revalidate = 60; // ISR: revalidate every 60 seconds

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  try {
    const posts = await getPosts(50);
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  const rawTitle = post?.rank_math_seo?.title || post?.title.rendered || "Logistics Insights";
  const cleanTitle = rawTitle.replace(/<[^>]*>?/gm, "").replace(/&#\d+;/g, "").trim();
  const pageTitle = cleanTitle.includes("XSPEED") ? cleanTitle : `${cleanTitle} | XSPEED`;

  const rawDesc =
    post?.rank_math_seo?.description ||
    post?.excerpt?.rendered ||
    "Express logistics analysis, supply chain optimizations, and freight intelligence from XSPEED.";
  const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim().slice(0, 160);

  const rawImage = post?.rank_math_seo?.og_image || post?.featured_image_url || "/assets/Home-pic1-C9kYJzAW.jpg";
  const ogImageUrl = rawImage.startsWith("http") ? rawImage : `https://exspeeds.com${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;

  const postUrl = post?.rank_math_seo?.canonical || `https://exspeeds.com/blog/${params.slug}`;

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
    },
    openGraph: {
      type: "article",
      title: post?.rank_math_seo?.og_title || pageTitle,
      description: post?.rank_math_seo?.og_description || cleanDesc,
      url: postUrl,
      siteName: "XSPEED Logistics",
      publishedTime: post?.date,
      modifiedTime: post?.modified || post?.date,
      authors: [post?.author_name || "XSPEED Editorial Team"],
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
  const post = await getPostBySlug(params.slug);

  const cleanTitle = post?.title.rendered
    ? post.title.rendered.replace(/<[^>]*>?/gm, "").replace(/&#\d+;/g, "").trim()
    : "XSPEED Logistics Article";

  const cleanDesc = post?.rank_math_seo?.description || (post?.excerpt?.rendered
    ? post.excerpt.rendered.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim()
    : "Express logistics insights and supply chain updates.");

  const rawImage = post?.rank_math_seo?.og_image || post?.featured_image_url || "/assets/Home-pic1-C9kYJzAW.jpg";
  const ogImageUrl = rawImage.startsWith("http") ? rawImage : `https://exspeeds.com${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;
  const postUrl = post?.rank_math_seo?.canonical || `https://exspeeds.com/blog/${params.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    headline: post?.rank_math_seo?.title ? post.rank_math_seo.title.replace(/<[^>]*>?/gm, "") : cleanTitle,
    description: cleanDesc,
    image: [ogImageUrl],
    datePublished: post?.date || "2026-08-01T00:00:00Z",
    dateModified: post?.modified || post?.date || "2026-08-01T00:00:00Z",
    author: {
      "@type": "Person",
      name: post?.author_name || "XSPEED Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: "XSPEED Logistics",
      url: "https://exspeeds.com",
      logo: {
        "@type": "ImageObject",
        url: "https://exspeeds.com/assets/Favlogo-DSIHncWK.png",
      },
    },
    articleSection: post?.category_name || "Technology & Logistics",
    keywords: post?.rank_math_seo?.focus_keyword || "express logistics, freight customs, cargo delivery",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://exspeeds.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://exspeeds.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cleanTitle,
        item: postUrl,
      },
    ],
  };

  return (
    <>
      {/* Schema.org JSON-LD Structured Data for Google Rich Snippets & AI Citations */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <SinglePostClient slug={params.slug} initialPost={post} />
    </>
  );
}
