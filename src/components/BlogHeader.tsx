"use client";

import { useLanguage } from "@/context/LanguageContext";
import { BookOpen, Sparkles } from "lucide-react";

interface BlogHeaderProps {
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function BlogHeader({
  activeCategory = "all",
  onSelectCategory,
  searchQuery = "",
  onSearchChange,
}: BlogHeaderProps) {
  const { t, isRTL } = useLanguage();

  const categories = [
    { id: "all", label: isRTL ? "جميع المقالات" : "All Articles" },
    { id: "express", label: isRTL ? "الشحن السريع والطرود" : "Express & Courier" },
    { id: "supply-chain", label: isRTL ? "سلاسل الإمداد" : "Supply Chain" },
    { id: "customs", label: isRTL ? "التخليص الجمركي" : "Customs Clearance" },
    { id: "tech", label: isRTL ? "التكنولوجيا واللوجستيات" : "Tech & Innovation" },
  ];

  return (
    <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-[#ECE2D5] overflow-hidden mb-12">
      {/* 3D Logistics Background Asset */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/assets/xspeed_blog_header.jpg')" }}
      />
      {/* Luminous Warm Light Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAF8F5]/85 via-[#FAF8F5]/75 to-[#FAF8F5]/95 backdrop-blur-[1px] pointer-events-none" />

      {/* Content Container */}
      <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-white/90 border border-orange-200/80 px-4 py-1.5 rounded-full shadow-2xs">
          <BookOpen className="w-3.5 h-3.5 text-[#C45B2A]" />
          <span className="text-[#C45B2A] text-xs font-black uppercase tracking-wider">
            {t("blogPage.badge") || (isRTL ? "أحدث المقالات والأخبار" : "Insights & Global Logistics Intelligence")}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-gray-950 tracking-[-0.03em] leading-[1.15]">
          {isRTL ? (
            <>
              مدونة الأخبار والتحليلات اللوجستية <span className="text-[#C45B2A]">XSPEED</span>
            </>
          ) : (
            <>
              Insights & Logistics Intelligence from <span className="text-[#C45B2A]">XSPEED</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
          {t("blogPage.subtitle") ||
            (isRTL
              ? "دليلك الشامل لمتابعة أحدث اتجاهات الشحن الدولي، قوانين الجمارك، وابتكارات سلاسل الإمداد."
              : "Your comprehensive guide to international freight trends, tariff updates, and supply chain technology.")}
        </p>

        {/* Category Pills */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-[#C45B2A] to-[#E65100] text-white shadow-orange-500/20"
                  : "bg-white/90 text-gray-700 hover:bg-white hover:text-[#C45B2A] border border-gray-200/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

