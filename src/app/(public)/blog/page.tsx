import { getPosts } from "@/lib/wordpress";
import BlogList from "@/components/BlogList";
import BlogHeader from "@/components/BlogHeader";
import { Metadata } from "next";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export const metadata: Metadata = {
  title: "Blog & Insights | Logistics Intelligence & Freight News",
  description:
    "Stay ahead with XSPEED Logistics intelligence. Read expert guides on express courier dispatch, Egypt-GCC freight corridors, customs clearance, and cold-chain pharma logistics.",
  alternates: {
    canonical: "https://exspeeds.com/blog",
  },
  openGraph: {
    title: "Blog & Insights | XSPEED Logistics Intelligence",
    description:
      "Expert insights on express freight, automated courier dispatching, and regional trade corridors from XSPEED Logistics.",
    url: "https://exspeeds.com/blog",
    siteName: "XSPEED Logistics",
    type: "website",
    images: [
      {
        url: "/assets/Home-pic1-C9kYJzAW.jpg",
        width: 1200,
        height: 630,
        alt: "XSPEED Logistics Blog & Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Insights | XSPEED Logistics Intelligence",
    description:
      "Expert insights on express freight, automated courier dispatching, and regional trade corridors from XSPEED Logistics.",
    images: ["/assets/Home-pic1-C9kYJzAW.jpg"],
  },
};

export default async function BlogPage() {
  const posts = await getPosts(30);

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "XSPEED Logistics Blog & Insights",
    description:
      "Industry insights, shipping guides, and logistics news from the XSPEED team.",
    url: "https://exspeeds.com/blog",
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
      headline: post.title.rendered.replace(/<[^>]*>?/gm, ""),
      url: `https://exspeeds.com/blog/${post.slug}`,
      datePublished: post.date,
      author: {
        "@type": "Person",
        name: post.author_name || "XSPEED Editorial Team",
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
        name: "Home",
        item: "https://exspeeds.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://exspeeds.com/blog",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Structured Data JSON-LD for SEO & Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Localized Hero Header */}
      <BlogHeader />

      {/* Posts Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <BlogList initialPosts={posts} />
      </section>
    </div>
  );
}
