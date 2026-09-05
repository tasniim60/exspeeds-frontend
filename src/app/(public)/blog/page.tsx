import { getPosts } from "@/lib/wordpress";
import BlogList from "@/components/BlogList";
import BlogHeader from "@/components/BlogHeader";
import { Metadata } from "next";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export const metadata: Metadata = {
  title: "Blog & Insights | XSPEED Logistics",
  description:
    "Industry insights, shipping guides, and logistics news from the XSPEED team.",
};

export default async function BlogPage() {
  const posts = await getPosts(30);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Localized Hero Header */}
      <BlogHeader />

      {/* Posts Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <BlogList initialPosts={posts} />
      </section>
    </div>
  );
}
