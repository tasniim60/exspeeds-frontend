import { http } from "./apiClient";
import { BlogPost, AdminStorage } from "@/lib/adminData";

function normalizePost(p: any): BlogPost {
  return {
    id: p?.id ? (String(p.id).startsWith("wp-") || String(p.id).startsWith("post-") ? String(p.id) : `wp-${p.id}`) : `post-${Date.now()}`,
    title: typeof p?.title === "string" ? p.title : p?.title?.rendered || "Untitled Post",
    slug: p?.slug || "post",
    author: typeof p?.author === "string" ? p.author : p?.author_name || "XSPEED Editorial Team",
    category: typeof p?.category === "string" ? p.category : p?.category_name || "Technology & Logistics",
    date: p?.date || new Date().toISOString().split("T")[0],
    status: p?.status === "publish" ? "published" : (p?.status || "published"),
    views: typeof p?.views === "number" ? p.views : 1,
    seoScore: typeof p?.seoScore === "number" ? p.seoScore : p?.rank_math_seo?.seo_score || 85,
    focusKeyword: typeof p?.focusKeyword === "string" ? p.focusKeyword : p?.rank_math_seo?.focus_keyword || "",
    wordCount: typeof p?.wordCount === "number" ? p.wordCount : 100,
    wpEditUrl: p?.wpEditUrl || "",
    content: typeof p?.content === "string" ? p.content : p?.content?.rendered || "",
    excerpt: typeof p?.excerpt === "string" ? p.excerpt : p?.excerpt?.rendered || "",
    imageUrl: p?.imageUrl || p?.featured_image_url || "/assets/xspeed_about_showcase.jpg",
    lang: p?.lang || (p?.locale === "en" ? "en" : "ar"),
    translationOf: p?.translationOf,
    translations: p?.translations,
    deeplStatus: p?.deeplStatus,
    deeplError: p?.deeplError,
  };
}

export const postService = {
  async getPosts(): Promise<BlogPost[]> {
    try {
      const data = await http.get<{ posts?: BlogPost[] }>("/api/posts");
      if (data && Array.isArray(data.posts) && data.posts.length > 0) {
        AdminStorage.saveBlogPosts(data.posts);
        return data.posts;
        const normalized = data.posts.map(normalizePost);
        AdminStorage.saveBlogPosts(normalized);
        return normalized;
      }
    } catch (e) {
      console.warn("Falling back to local storage posts:", e);
    }
    return AdminStorage.getBlogPosts();
    const local = AdminStorage.getBlogPosts();
    return (local || []).map(normalizePost);
  },

  async createPost(post: Partial<BlogPost>): Promise<BlogPost> {
    try {
      await http.post("/api/posts", post);
    } catch (e) {
      console.warn("Failed to sync post to backend:", e);
    }
    const current = AdminStorage.getBlogPosts();
    const newPost: BlogPost = {
      id: post.id || `post-${Date.now()}`,
      title: post.title || "Untitled Post",
      slug: post.slug || "post",
      author: post.author || "XSPEED Editorial Team",
      category: post.category || "Logistics",
      date: post.date || new Date().toISOString().split("T")[0],
      status: post.status || "published",
      views: post.views || 0,
      seoScore: post.seoScore || 85,
      focusKeyword: post.focusKeyword || "",
      wordCount: post.wordCount || 100,
      wpEditUrl: post.wpEditUrl || "",
      content: post.content || "",
      excerpt: post.excerpt || "",
      imageUrl: post.imageUrl || "",
      lang: post.lang,
      translationOf: post.translationOf,
      translations: post.translations,
      deeplStatus: post.deeplStatus,
      deeplError: post.deeplError,
    };
    const updated = [newPost, ...current.filter((p) => p.id !== newPost.id)];
    AdminStorage.saveBlogPosts(updated);
    return newPost;
  },

  async updatePost(post: BlogPost): Promise<BlogPost> {
    try {
      await http.put("/api/posts", post);
    } catch (e) {
      console.warn("Failed to sync post update to backend:", e);
    }
    const current = AdminStorage.getBlogPosts();
    const updated = current.map((p) => (p.id === post.id ? post : p));
    AdminStorage.saveBlogPosts(updated);
    return post;
  },

  async deletePost(id: string): Promise<boolean> {
    try {
      await http.delete(`/api/posts?id=${encodeURIComponent(id)}`);
    } catch (e) {
      console.warn("Failed to sync post deletion to backend:", e);
    }
    const current = AdminStorage.getBlogPosts();
    const updated = current.filter((p) => p.id !== id);
    AdminStorage.saveBlogPosts(updated);
    return true;
  },
};

export const PostService = postService;
