"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/PostCard";
import { WPPost } from "@/lib/wordpress";
import { AdminStorage } from "@/lib/adminData";
import { mergeAdminPosts } from "@/lib/blogUtils";
import { useLanguage } from "@/context/LanguageContext";
import { BookOpen } from "lucide-react";

interface BlogListProps {
  initialPosts: WPPost[];
}

export default function BlogList({ initialPosts }: BlogListProps) {
  const [posts, setPosts] = useState<WPPost[]>(initialPosts);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const adminPosts = AdminStorage.getBlogPosts();
    if (adminPosts && adminPosts.length > 0) {
      setPosts(mergeAdminPosts(initialPosts, adminPosts));
    }
  }, [initialPosts]);

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-[32px] p-12 text-center border border-orange-100 shadow-sm space-y-3">
        <div className="w-12 h-12 rounded-full bg-orange-50 text-[#C45B2A] flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <p className="text-gray-600 font-bold text-sm">
          {t("blogPage.empty") || (isRTL ? "لا توجد مقالات منشورة حالياً." : "No articles found.")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-start">
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-display font-black text-gray-950">
          {isRTL ? "جميع المقالات والتحليلات اللوجستية" : "All Articles & Industry Intelligence"}
        </h2>
        <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3.5 py-1 rounded-full shadow-2xs">
          {posts.length} {isRTL ? "مقالات" : "Articles"}
        </span>
      </div>

      {/* Grid of Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}


