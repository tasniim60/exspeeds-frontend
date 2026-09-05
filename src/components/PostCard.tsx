"use client";

import { useState } from "react";
import Link from "next/link";
import { WPPost } from "@/lib/wordpress";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";

export default function PostCard({ post }: { post: WPPost }) {
  const { t, isRTL } = useLanguage();
  const [imgSrc, setImgSrc] = useState(
    post.featured_image_url || "/assets/xspeed_about_showcase.jpg"
  );

  const publishDateObj = post.date ? new Date(post.date) : null;
  const hasValidDate = Boolean(publishDateObj && !isNaN(publishDateObj.getTime()));

  const dateStr = hasValidDate && publishDateObj
    ? publishDateObj.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : isRTL ? "مؤخراً" : "Recently";

  const timeStr = hasValidDate && publishDateObj
    ? publishDateObj.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const rawExcerpt = post.excerpt?.rendered
    ? post.excerpt.rendered.replace(/<[^>]*>?/gm, "").trim()
    : "";

  const getLocalizedCategory = (cat?: string) => {
    if (!isRTL) return cat || t("blogPage.categories.blog") || "Logistics";
    if (!cat) return "المدونة";
    const lower = cat.toLowerCase();
    if (lower.includes("technology") || lower.includes("تكنولوجيا")) return "التكنولوجيا واللوجستيات";
    if (lower.includes("express") || lower.includes("سريع")) return "الشحن السريع والطرود";
    if (lower.includes("general") || lower.includes("عامة")) return "الخدمات اللوجستية العامة";
    return cat;
  };

  const getLocalizedAuthor = (author?: string) => {
    if (!isRTL) return author || "XSPEED Editorial";
    if (!author || author.toLowerCase().includes("editorial") || author.toLowerCase().includes("xspeed")) {
      return "فريق تحرير إكس سبيد";
    }
    if (author.toLowerCase() === "admin") {
      return "إدارة إكس سبيد";
    }
    return author;
  };

  return (
    <article className="bg-white/95 backdrop-blur-md rounded-[28px] border border-orange-100/90 overflow-hidden shadow-[0_10px_30px_rgba(37,21,22,0.04)] hover:shadow-[0_20px_50px_rgba(196,91,42,0.12)] hover:border-[#C45B2A]/40 transition-all duration-300 flex flex-col group text-start">
      {/* Featured Image */}
      <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={post.title.rendered}
          width={600}
          height={340}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgSrc("/assets/xspeed_about_showcase.jpg")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />
        <span
          className={`absolute top-4 ${
            isRTL ? "right-4" : "left-4"
          } bg-white/90 backdrop-blur-md text-[#C45B2A] border border-orange-200/80 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs`}
        >
          {getLocalizedCategory(post.category_name)}
        </span>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-7 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-3">
          {/* Date, Time of Publishing & Read time */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
            <time
              dateTime={post.date}
              className="flex items-center gap-1.5 text-gray-700 font-medium"
              title={hasValidDate && timeStr ? `${dateStr} - ${timeStr}` : dateStr}
            >
              <Calendar className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
              <span>{dateStr}</span>
            </time>
            {timeStr && (
              <>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-gray-600 bg-orange-50/60 px-2 py-0.5 rounded-full border border-orange-100/80">
                  <Clock className="w-3 h-3 text-[#C45B2A] shrink-0" />
                  <span>{timeStr}</span>
                </span>
              </>
            )}
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1 text-gray-400">
              <span>3 {isRTL ? "دقائق" : "min read"}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-display font-black text-gray-950 leading-snug tracking-tight group-hover:text-[#C45B2A] transition-colors">
            <Link href={`/blog/${post.slug}`}>
              <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
            </Link>
          </h3>

          {/* Excerpt */}
          <p
            className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: rawExcerpt }}
          />
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-50 text-[#C45B2A] flex items-center justify-center font-bold text-[10px] border border-orange-200/80">
              <User className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-gray-700 truncate max-w-[120px]">
              {getLocalizedAuthor(post.author_name)}
            </span>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C45B2A] hover:text-[#A34920] transition-colors group-hover:translate-x-1"
          >
            <span>{t("blogPage.readArticle") || (isRTL ? "اقرأ المقال" : "Read Article")}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
          </Link>
        </div>
      </div>
    </article>
  );
}

