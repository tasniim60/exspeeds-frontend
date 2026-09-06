import { NextResponse } from "next/server";
import { getPosts, createWordPressPost } from "@/lib/wordpress";
import { ServerStore } from "@/lib/serverStore";
import { BlogPost } from "@/lib/adminData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await getPosts(50);
    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, content, excerpt, category, author, focusKeyword, seoScore, imageUrl } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const computedSlug =
      slug ||
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const result = await createWordPressPost({
      title,
      slug: computedSlug,
      content: content || `<p>${title}</p>`,
      excerpt: excerpt || title,
      category: category || "Technology & Logistics",
      author: author || "XSPEED Editorial Team",
      focusKeyword: focusKeyword || title.toLowerCase().slice(0, 25),
      seoScore: seoScore || 90,
      imageUrl: imageUrl || "/assets/Home-pic1-C9kYJzAW.jpg",
    });

    // Persist to ServerStore for local and admin persistence
    try {
      const newBlogPost: BlogPost = {
        id: result.wpId ? `wp-${result.wpId}` : `post-${Date.now()}`,
        title: title,
        slug: computedSlug,
        author: author || "XSPEED Operations & Logistics Team",
        category: category || "Technology & Logistics",
        date: new Date().toISOString(),
        status: "published",
        views: 1,
        seoScore: seoScore || 90,
        focusKeyword: focusKeyword || title.toLowerCase().slice(0, 25),
        wordCount: content ? content.split(/\s+/).length : 500,
        wpEditUrl: `/wp-admin/post.php?post=${result.wpId || 101}&action=edit`,
        imageUrl: imageUrl || "/assets/Home-pic1-C9kYJzAW.jpg",
        excerpt: excerpt || title,
        content: content || `<p>${title}</p>`,
      };
      const existingPosts = ServerStore.getBlogPosts();
      const filtered = existingPosts.filter((p) => p.slug !== computedSlug);
      ServerStore.saveBlogPosts([newBlogPost, ...filtered]);
    } catch (storeErr) {
      console.warn("[ServerStore] Could not persist to local JSON store:", storeErr);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}
