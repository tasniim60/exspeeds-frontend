import { http } from "./apiClient";
import { BlogPost, AdminStorage } from "@/lib/adminData";

export const postService = {
  async getPosts(): Promise<BlogPost[]> {
    try {
      const data = await http.get<{ posts?: BlogPost[] }>("/api/posts");
      if (data && Array.isArray(data.posts) && data.posts.length > 0) {
        AdminStorage.saveBlogPosts(data.posts);
        return data.posts;
      }
    } catch (e) {
      console.warn("Falling back to local storage posts:", e);
    }
    return AdminStorage.getBlogPosts();
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
    };
    const updated = [newPost, ...current.filter((p) => p.id !== newPost.id)];
    AdminStorage.saveBlogPosts(updated);
    return newPost;
  },

  updatePost(post: BlogPost): BlogPost {
    const current = AdminStorage.getBlogPosts();
    const updated = current.map((p) => (p.id === post.id ? post : p));
    AdminStorage.saveBlogPosts(updated);
    return post;
  },

  deletePost(id: string): boolean {
    const current = AdminStorage.getBlogPosts();
    const updated = current.filter((p) => p.id !== id);
    AdminStorage.saveBlogPosts(updated);
    return true;
  },
};

export const PostService = postService;
