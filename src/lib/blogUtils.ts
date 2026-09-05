import { BlogPost } from "@/lib/adminData";
import { WPPost } from "@/lib/wordpress";

/**
 * Convert admin BlogPost to WPPost format for rendering in public views.
 * Shared across BlogList, HomeBlogSection, and SinglePostClient.
 */
export function convertAdminPostToWP(post: BlogPost, index: number): WPPost {
  const defaultImage = post.imageUrl || "/assets/Home-pic1-C9kYJzAW.jpg";
  const defaultExcerpt = post.excerpt || `${post.title}. Comprehensive logistics insights on ${post.focusKeyword}.`;

  // Format content: if rich HTML, preserve; if plain text, wrap gracefully into structured article
  let formattedContent = post.content;
  if (!formattedContent) {
    formattedContent = `
      <p class="lead">${post.title}</p>
      <p>Comprehensive logistics and express supply chain analysis by <strong>${post.author}</strong> in category <strong>${post.category}</strong>.</p>
      <h2>Key Operational Insights</h2>
      <p>Targeting <strong>${post.focusKeyword}</strong>, modern regional freight operations require synchronized tracking telemetry, high-speed linehauls, and automated customs pre-clearance to guarantee end-to-end delivery performance.</p>
      <blockquote>
        "Precision in last-mile dispatching and cross-border customs optimization ensures continuous cargo velocity and client trust."
      </blockquote>
      <p>For custom rate quotes or enterprise shipment routing, connect with our XSPEED Express logistics team today.</p>
    `;
  } else if (!formattedContent.includes("<p>") && !formattedContent.includes("<div>")) {
    formattedContent = formattedContent
      .split("\n\n")
      .filter((p) => p.trim())
      .map((p) => `<p>${p.trim()}</p>`)
      .join("");
  }

  const postDate = post.date
    ? post.date.includes("T")
      ? post.date
      : `${post.date}T10:00:00Z`
    : new Date().toISOString();

  return {
    id: parseInt(post.id.replace(/\D/g, "")) || 500 + index,
    date: postDate,
    modified: postDate,
    slug: post.slug,
    status: "publish",
    title: { rendered: post.title },
    content: {
      rendered: formattedContent,
    },
    excerpt: {
      rendered: defaultExcerpt,
    },
    featured_image_url: defaultImage,
    category_name: post.category,
    author_name: post.author,
    rank_math_seo: {
      title: `${post.title} | XSPEED`,
      description: defaultExcerpt,
      focus_keyword: post.focusKeyword,
      canonical: `https://exspeeds.com/blog/${post.slug}`,
      og_title: post.title,
      og_description: defaultExcerpt,
      og_image: defaultImage,
      twitter_title: post.title,
      twitter_description: defaultExcerpt,
      twitter_image: defaultImage,
      seo_score: post.seoScore || 92,
      robots: ["index", "follow", "max-image-preview:large"],
    },
  };
}

/**
 * Merge admin posts with server-fetched WordPress posts,
 * deduplicating by slug.
 */
export function mergeAdminPosts(initialPosts: WPPost[], adminPosts: BlogPost[]): WPPost[] {
  const publishedAdminPosts = adminPosts
    .filter((p) => p.status === "published")
    .map((p, idx) => convertAdminPostToWP(p, idx));

  const existingSlugs = new Set(initialPosts.map((p) => p.slug));
  const newPosts = publishedAdminPosts.filter((p) => !existingSlugs.has(p.slug));

  return [...newPosts, ...initialPosts];
}
