"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import { WPPost } from "@/lib/wordpress";
import { AdminStorage } from "@/lib/adminData";
import { mergeAdminPosts } from "@/lib/blogUtils";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight } from "lucide-react";

interface HomeBlogSectionProps {
  initialPosts: WPPost[];
}

export default function HomeBlogSection({ initialPosts }: HomeBlogSectionProps) {
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
      <div className="card-elevated p-12 text-center text-gray-500 font-body">
        {isRTL ? "لا توجد مقالات منشورة حالياً." : "No articles found in database."}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.slice(0, 6).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <div className="text-center pt-4">
        <Link href="/blog" className="btn-secondary inline-flex items-center gap-2">
          <span>{isRTL ? "عرض جميع المقالات اللوجستية" : "View All Blog Articles"}</span>
          <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 ${isRTL ? "rotate-180" : ""}`} />
        </Link>
      </div>
    </>
  );
}
