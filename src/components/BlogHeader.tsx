"use client";

import { useLanguage } from "@/context/LanguageContext";
import { BookOpen, Sparkles } from "lucide-react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

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

  return (
    <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-[#E2E8F0] overflow-hidden mb-12">
      {/* 3D Logistics Background Asset */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/assets/xspeed_blog_header.jpg')" }}
      />
      {/* Luminous Warm Light Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAFBFC]/90 via-[#FAFBFC]/80 to-[#FAFBFC]/95 backdrop-blur-[1px] pointer-events-none" />

      {/* Content Container */}
      <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
        {/* Natural Editorial Eyebrow */}
        <SectionEyebrow centered>
          {t("blogPage.badge") || (isRTL ? "أحدث المقالات والأخبار" : "Insights & Global Logistics Intelligence")}
        </SectionEyebrow>

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
      </div>
    </section>
  );
}

