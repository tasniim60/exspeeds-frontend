import { getPosts, getRankMathSchema } from "@/lib/wordpress";
import BlogList from "@/components/BlogList";
import BlogHeader from "@/components/BlogHeader";
import { Metadata } from "next";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params?.locale === "en" ? "en" : "ar";
  const isAr = locale === "ar";

  const title = isAr
    ? "المدونة والأخبار | أحدث تحليلات الشحن واللوجستيات"
    : "Blog & Insights | Logistics Intelligence & Freight News";
  const description = isAr
    ? "ابق في صدارة أعمالك مع تحليلات إكس سبيد اللوجستية. مقالات متخصصة في الشحن السريع، وتخليص الجمارك، وممرات التجارة بين مصر والخليج."
    : "Stay ahead with XSPEED Logistics intelligence. Read expert guides on express courier dispatch, Egypt-GCC freight corridors, customs clearance, and cold-chain pharma logistics.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://exspeeds.com/" + locale + "/blog",
      languages: {
        ar: "https://exspeeds.com/ar/blog",
        en: "https://exspeeds.com/en/blog",
        "x-default": "https://exspeeds.com/en/blog",
      },
    },
    openGraph: {
      title,
      description,
      url: "https://exspeeds.com/" + locale + "/blog",
      siteName: isAr ? "إكس سبيد للخدمات اللوجستية" : "XSPEED Logistics",
      type: "website",
      locale: isAr ? "ar_EG" : "en_US",
      images: [
        {
          url: "/assets/xspeed_about_showcase.jpg",
          width: 1200,
          height: 896,
          alt: isAr ? "مدونة إكس سبيد اللوجستية" : "XSPEED Logistics Blog & Insights",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/xspeed_about_showcase.jpg"],
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale === "en" ? "en" : "ar";
  const posts = await getPosts(30, locale);
  const blogUrl = "https://exspeeds.com/" + locale + "/blog";

  // Fetch canonical Rank Math Schema for Blog listing page
  const schemas = await getRankMathSchema(blogUrl);

  const isAr = locale === "ar";
  const fallbackBlogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: isAr ? "مدونة وأخبار إكس سبيد للخدمات اللوجستية" : "XSPEED Logistics Blog & Insights",
    description: isAr
      ? "مقالات متخصصة في الشحن السريع واللوجستيات وسلاسل الإمداد من فريق إكس سبيد."
      : "Industry insights, shipping guides, and logistics news from the XSPEED team.",
    url: blogUrl,
    inLanguage: isAr ? "ar-EG" : "en-US",
    publisher: {
      "@type": "Organization",
      name: "XSPEED Logistics",
      url: "https://exspeeds.com",
      logo: {
        "@type": "ImageObject",
        url: "https://exspeeds.com/assets/Favlogo-DSIHncWK.png",
      },
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: (post.rank_math_seo?.title || post.title.rendered).replace(/<[^>]*>?/gm, "").trim(),
      description: (post.rank_math_seo?.description || post.excerpt.rendered)
        .replace(/<[^>]*>?/gm, "")
        .replace(/\s+/g, " ")
        .trim(),
      url: "https://exspeeds.com/" + locale + "/blog/" + post.slug,
      inLanguage: isAr ? "ar-EG" : "en-US",
      datePublished: post.date,
      dateModified: post.modified || post.date,
      image: post.rank_math_seo?.og_image || post.featured_image_url || "/assets/xspeed_about_showcase.jpg",
      author: {
        "@type": "Person",
        name: post.author_name || (isAr ? "فريق تحرير إكس سبيد" : "XSPEED Operations & Logistics Team"),
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isAr ? "الرئيسية" : "Home",
        item: "https://exspeeds.com/" + locale,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isAr ? "المدونة" : "Blog",
        item: blogUrl,
      },
    ],
  };

  const activeSchemas = schemas.length > 0 ? schemas : [fallbackBlogSchema, breadcrumbSchema];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Structured Data JSON-LD for SEO & Rich Results */}
      {activeSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Localized Hero Header */}
      <BlogHeader />

      {/* Posts Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <BlogList initialPosts={posts} />
      </section>
    </div>
  );
}