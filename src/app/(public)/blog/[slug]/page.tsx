import { getPostBySlug } from "@/lib/wordpress";
import SinglePostClient from "@/components/SinglePostClient";
import { Metadata } from "next";

export const revalidate = 60; // ISR: revalidate every 60 seconds

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  const pageTitle = post?.rank_math_seo?.title || post?.title.rendered || "XSPEED Logistics Article";
  const pageDesc = post?.rank_math_seo?.description || "Express Logistics & Supply Chain Intelligence";

  return {
    title: `${pageTitle} | XSPEED`,
    description: pageDesc,
  };
}

export default async function SinglePostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug);

  return <SinglePostClient slug={params.slug} initialPost={post} />;
}
