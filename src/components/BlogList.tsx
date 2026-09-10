"use client";

import { useState, useEffect, useMemo } from "react";
import PostCard from "@/components/PostCard";
import { WPPost } from "@/lib/wordpress";
import { AdminStorage } from "@/lib/adminData";
import { mergeAdminPosts } from "@/lib/blogUtils";
import { useLanguage } from "@/context/LanguageContext";
import { BookOpen, Search, Filter, X } from "lucide-react";

interface BlogListProps {
  initialPosts: WPPost[];
}

export default function BlogList({ initialPosts }: BlogListProps) {
  const [posts, setPosts] = useState<WPPost[]>(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const adminPosts = AdminStorage.getBlogPosts();
    if (adminPosts && adminPosts.length > 0) {
      setPosts(mergeAdminPosts(initialPosts, adminPosts));
    } else {
      setPosts(initialPosts);
    }
  }, [initialPosts]);

  const categories = [
    { id: "all", labelAr: "جميع المقالات", labelEn: "All Articles" },
    { id: "express", labelAr: "الشحن السريع والطرود", labelEn: "Express & Courier" },
    { id: "customs", labelAr: "التخليص الجمركي وACI", labelEn: "Customs Clearance" },
    { id: "supply-chain", labelAr: "سلاسل الإمداد والتخزين", labelEn: "Supply Chain & Warehousing" },
    { id: "tech", labelAr: "التكنولوجيا والذكاء الاصطناعي", labelEn: "Logistics Tech & AI" },
  ];

  // Helper filter logic
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const title = (post.title?.rendered || "").toLowerCase();
      const excerpt = (post.excerpt?.rendered || "").toLowerCase();
      const content = (post.content?.rendered || "").toLowerCase();
      const categoryName = (post.category_name || "").toLowerCase();
      const fullText = `${title} ${excerpt} ${content} ${categoryName}`;

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        if (!fullText.includes(query)) {
          return false;
        }
      }

      // Category match
      if (selectedCategory === "all") return true;

      if (selectedCategory === "express") {
        return (
          categoryName.includes("express") ||
          categoryName.includes("courier") ||
          categoryName.includes("سريع") ||
          categoryName.includes("طرد") ||
          fullText.includes("express") ||
          fullText.includes("courier") ||
          fullText.includes("طرد") ||
          fullText.includes("شحن سريع") ||
          fullText.includes("توصيل") ||
          fullText.includes("last-mile")
        );
      }

      if (selectedCategory === "customs") {
        return (
          categoryName.includes("customs") ||
          categoryName.includes("جمرك") ||
          fullText.includes("customs") ||
          fullText.includes("جمرك") ||
          fullText.includes("جمارك") ||
          fullText.includes("تخليص") ||
          fullText.includes("نافذة") ||
          fullText.includes("aci") ||
          fullText.includes("tariff")
        );
      }

      if (selectedCategory === "supply-chain") {
        return (
          categoryName.includes("supply") ||
          categoryName.includes("chain") ||
          categoryName.includes("إمداد") ||
          fullText.includes("supply chain") ||
          fullText.includes("سلاسل") ||
          fullText.includes("إمداد") ||
          fullText.includes("تخزين") ||
          fullText.includes("مستودع") ||
          fullText.includes("warehouse") ||
          fullText.includes("inventory")
        );
      }

      if (selectedCategory === "tech") {
        return (
          categoryName.includes("tech") ||
          categoryName.includes("ai") ||
          fullText.includes("ai") ||
          fullText.includes("ذكاء") ||
          fullText.includes("تكنولوجيا") ||
          fullText.includes("أتمتة") ||
          fullText.includes("automation") ||
          fullText.includes("digital") ||
          fullText.includes("api") ||
          fullText.includes("خوارزمي")
        );
      }

      return true;
    });
  }, [posts, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 text-start" dir={isRTL ? "rtl" : "ltr"}>
      {/* Search & Category Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-orange-100/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-gradient-to-r from-[#C45B2A] to-[#E65100] text-white shadow-orange-500/20 scale-[1.02]"
                      : "bg-[#FAF8F5] text-gray-700 hover:bg-white hover:text-[#C45B2A] border border-gray-200/80"
                  }`}
                >
                  <span>{isRTL ? cat.labelAr : cat.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className={`w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3.5" : "left-3.5"}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? "ابحث في المقالات والمواضيع..." : "Search articles & topics..."}
              className={`w-full bg-[#FAF8F5] border border-gray-200/90 rounded-full py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#C45B2A] focus:bg-white transition-all ${
                isRTL ? "pr-10 pl-8" : "pl-10 pr-8"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 ${isRTL ? "left-2.5" : "right-2.5"}`}
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Header Results Summary */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-display font-black text-gray-950">
          {selectedCategory === "all"
            ? isRTL
              ? "جميع المقالات والتحليلات اللوجستية"
              : "All Articles & Logistics Intelligence"
            : categories.find((c) => c.id === selectedCategory)?.[isRTL ? "labelAr" : "labelEn"]}
        </h2>
        <span className="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3.5 py-1 rounded-full shadow-2xs">
          {filteredPosts.length} {isRTL ? "مقالات" : "Articles"}
        </span>
      </div>

      {/* Grid of Posts or Empty State */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md rounded-[32px] p-12 text-center border border-orange-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-[#C45B2A] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {isRTL ? "لم نجد مقالات مطابقة لبحثك" : "No matching articles found"}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm">
            {isRTL
              ? "جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً."
              : "Try searching with different keywords or switch categories."}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="mt-2 text-xs font-bold text-[#C45B2A] hover:underline"
          >
            {isRTL ? "إعادة تعيين الفلاتر" : "Reset Filters"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
