"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WPPost, FALLBACK_POSTS } from "@/lib/wordpress";
import { AdminStorage } from "@/lib/adminData";
import { convertAdminPostToWP } from "@/lib/blogUtils";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Check,
  MessageSquare,
  Truck,
  Sparkles,
  Tag,
  ExternalLink,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

interface SinglePostClientProps {
  slug: string;
  initialPost: WPPost | null;
}

export default function SinglePostClient({ slug, initialPost }: SinglePostClientProps) {
  const { t, isRTL } = useLanguage();
  const [post, setPost] = useState<WPPost | null>(initialPost);
  const [copied, setCopied] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>("/assets/xspeed_about_showcase.jpg");

  useEffect(() => {
    // 1. Check local AdminStorage first
    const adminPosts = AdminStorage.getBlogPosts();
    const matchedAdmin = adminPosts.find((p) => p.slug === slug);

    if (matchedAdmin) {
      const converted = convertAdminPostToWP(matchedAdmin, 0);
      setPost(converted);
      if (converted.featured_image_url) {
        setImgSrc(converted.featured_image_url);
      }
      return;
    }

    // 2. If initialPost is available from SSR, use it
    if (initialPost) {
      setPost(initialPost);
      if (initialPost.featured_image_url) {
        setImgSrc(initialPost.featured_image_url);
      }
      return;
    }

    // 3. Fallback lookup in seeded posts
    const matchedFallback = FALLBACK_POSTS.find((p) => p.slug === slug);
    if (matchedFallback) {
      setPost(matchedFallback);
      if (matchedFallback.featured_image_url) {
        setImgSrc(matchedFallback.featured_image_url);
      }
    }
  }, [slug, initialPost]);

  // Handle Share / Copy Link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // WhatsApp Share URL
  const getWhatsAppShareUrl = () => {
    if (typeof window === "undefined" || !post) return "#";
    const text = `Check out this logistics article by XSPEED Express: "${post.title.rendered}" - ${window.location.href}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };




  const getLocalizedCategory = (cat?: string) => {
    if (!isRTL) return cat || "Logistics & Supply Chain";
    if (!cat) return "الخدمات اللوجستية وسلاسل الإمداد";
    const lower = cat.toLowerCase();
    if (lower.includes("technology") || lower.includes("تكنولوجيا")) return "التكنولوجيا واللوجستيات";
    if (lower.includes("express") || lower.includes("سريع")) return "الشحن السريع والطرود";
    if (lower.includes("general") || lower.includes("عامة")) return "الخدمات اللوجستية العامة";
    return cat;
  };

  const getLocalizedAuthor = (author?: string) => {
    if (!isRTL) return author || "XSPEED Editorial Team";
    if (!author || author.toLowerCase().includes("editorial") || author.toLowerCase().includes("xspeed")) {
      return "فريق تحرير إكس سبيد";
    }
    if (author.toLowerCase() === "admin") {
      return "إدارة إكس سبيد";
    }
    return author;
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-[28px] border border-orange-100 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-[#C45B2A] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-display font-black text-gray-950">
            {t("blogPage.articleNotFound") || (isRTL ? "المقال غير موجود" : "Article Not Found")}
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            {t("blogPage.articleNotFoundDesc") || (isRTL ? "لم نتمكن من العثور على المقال المطلوب، ربما تم نقله أو تحديثه." : "The requested logistics article could not be located. It may have been moved or updated.")}
          </p>
          <div className="pt-2">
            <Link href="/blog" className="bg-[#C45B2A] hover:bg-[#A34920] text-white font-bold text-xs py-3 px-6 rounded-full inline-flex items-center gap-2 transition-all">
              <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
              <span>{t("blogPage.backToArticles") || (isRTL ? "العودة إلى جميع المقالات" : "Back to All Articles")}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Reading Time & Dates
  const wordCount = post.content?.rendered
    ? post.content.rendered.replace(/<[^>]*>?/gm, "").split(/\s+/).filter(Boolean).length
    : 800;
  const readTimeMinutes = Math.max(2, Math.ceil(wordCount / 200));

  // Upload / Publish Date
  const publishDateObj = post.date ? new Date(post.date) : null;
  const formattedPublishDate = publishDateObj && !isNaN(publishDateObj.getTime())
    ? publishDateObj.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : (isRTL ? "تاريخ النشر غير متوفر" : "Recently Published");

  // Modified / Updated Date
  const modifiedDateObj = post.modified ? new Date(post.modified) : null;
  const hasModifiedDiff =
    modifiedDateObj &&
    publishDateObj &&
    !isNaN(modifiedDateObj.getTime()) &&
    Math.abs(modifiedDateObj.getTime() - publishDateObj.getTime()) > 86400000;

  const formattedModifiedDate = hasModifiedDiff
    ? modifiedDateObj.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const seoScore = post.rank_math_seo?.seo_score || 94;

  return (
    <div className={`min-h-screen bg-[#FAF8F5] py-12 lg:py-20 px-2 sm:px-4 lg:px-6 ${isRTL ? "text-right" : "text-left"}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link href="/" className="hover:text-[#C45B2A] transition-colors">
              {isRTL ? "الرئيسية" : "Home"}
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#C45B2A] transition-colors">
              {isRTL ? "المدونة" : "Blog"}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {post.title.rendered.replace(/<[^>]*>?/gm, "")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#C45B2A] bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-2xs transition-all hover:border-[#C45B2A]"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
              <span>{t("blogPage.backToArticles") || (isRTL ? "العودة إلى جميع المقالات" : "Back to All Articles")}</span>
            </Link>

            {/* Category Pill */}
            <span className="bg-orange-50 text-[#C45B2A] border border-orange-200/80 text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-2xs">
              {getLocalizedCategory(post.category_name)}
            </span>
          </div>
        </nav>

        {/* Main Article Container */}
        <article className="bg-white/95 backdrop-blur-xl rounded-[32px] border border-orange-100/90 overflow-hidden shadow-[0_20px_50px_rgba(37,21,22,0.06)]" itemScope itemType="https://schema.org/BlogPosting">
          {/* Article Header */}
          <header className="p-7 sm:p-10 lg:p-12 space-y-6 border-b border-gray-100 text-start">
            <h1
              itemProp="headline"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black text-gray-950 tracking-[-0.03em] leading-tight"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Meta Row: Author, Upload Date, Modified Date, Rank Math Badge */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-600 pt-2">
              <div className="flex items-center gap-2 font-bold text-gray-900" itemProp="author" itemScope itemType="https://schema.org/Person">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-[#C45B2A] flex items-center justify-center font-black text-xs border border-orange-200/80">
                  {post.author_name?.charAt(0) || "X"}
                </div>
                <span itemProp="name">{getLocalizedAuthor(post.author_name)}</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {t("blogPage.verified") || (isRTL ? "فريق موثق" : "Verified")}
                </span>
              </div>

              <span className="text-gray-300">•</span>

              {/* Upload Date */}
              <time
                dateTime={post.date || new Date().toISOString()}
                itemProp="datePublished"
                className="flex items-center gap-1.5 font-medium text-gray-700"
                title={isRTL ? `تاريخ الرفع: ${formattedPublishDate}` : `Upload Date: ${formattedPublishDate}`}
              >
                <Calendar className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
                <span>{isRTL ? `نُشر: ${formattedPublishDate}` : `Published: ${formattedPublishDate}`}</span>
              </time>

              {/* Modified Date (if available) */}
              {formattedModifiedDate && (
                <>
                  <span className="text-gray-300">•</span>
                  <time
                    dateTime={post.modified}
                    itemProp="dateModified"
                    className="flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80"
                    title={isRTL ? `تاريخ التعديل الأخير: ${formattedModifiedDate}` : `Last Modified: ${formattedModifiedDate}`}
                  >
                    <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{isRTL ? `محدث: ${formattedModifiedDate}` : `Updated: ${formattedModifiedDate}`}</span>
                  </time>
                </>
              )}

              <span className="text-gray-300">•</span>

              {/* Reading Time */}
              <div className="flex items-center gap-1.5 font-medium text-gray-500">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>
                  {readTimeMinutes} {t("blogPage.minRead") || (isRTL ? "دقائق قراءة" : "min read")} ({wordCount} {t("blogPage.words") || (isRTL ? "كلمة" : "words")})
                </span>
              </div>

              {/* Rank Math SEO Score Chip */}
              <div className="ms-auto flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200/80 rounded-full font-black text-[11px]">
                <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Rank Math SEO: {seoScore}/100</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {imgSrc && (
            <div className="relative w-full h-72 sm:h-96 md:h-[440px] bg-gray-100 overflow-hidden">
              <img
                itemProp="image"
                src={imgSrc}
                alt={post.title.rendered.replace(/<[^>]*>?/gm, "")}
                className="w-full h-full object-cover"
                onError={() => setImgSrc("/assets/xspeed_about_showcase.jpg")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          {/* Article Body Content */}
          <div className="p-7 sm:p-10 lg:p-12 text-start space-y-8">
            {/* Key Takeaways Callout Box */}
            <div className="bg-orange-50/80 rounded-2xl p-5 sm:p-6 border border-orange-200/90 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#C45B2A] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>{isRTL ? "أبرز نقاط المقال" : "Key Takeaways"}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-semibold">
                {isRTL
                  ? "يستعرض هذا المقال التطورات الحديثة في مجال الشحن الدولي والسريع، مع التركيز على أفضل ممارسات سلاسل الإمداد، التسهيلات الجمركية، والتقنيات الذكية المتبعة لضمان أمان وتوقيت الشحنات."
                  : "This article examines key developments in express global freight, focusing on supply chain SLAs, Nafeza port customs compliance, and digital tracking technologies."}
              </p>
            </div>

            {/* Render Enhanced HTML content with prose-xspeed */}
            <div
              itemProp="articleBody"
              className="prose-xspeed max-w-none text-start"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />

            {/* Bottom Meta & Sharing Bar */}
            <div className="mt-12 pt-8 border-t border-gray-100 space-y-6">
              {/* Tags & Keywords */}
              {post.rank_math_seo?.focus_keyword && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-500 font-bold flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#C45B2A]" />
                    {t("blogPage.focusKeyword") || (isRTL ? "الكلمة المفتاحية:" : "Focus Keyword:")}
                  </span>
                  <span className="bg-[#FAF8F5] text-gray-900 font-mono font-bold px-3 py-1 rounded-full border border-gray-200">
                    {post.rank_math_seo.focus_keyword}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200 text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    {t("blogPage.rankMathVerified") || (isRTL ? "تحسين سيو معتمد (Rank Math)" : "Rank Math Verified")}
                  </span>
                </div>
              )}

              {/* Social Sharing */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FAF8F5] p-5 rounded-2xl border border-orange-100/80">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#C45B2A]" />
                  <span>{t("blogPage.shareArticle") || (isRTL ? "مشاركة المقال:" : "Share this article:")}</span>
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={getWhatsAppShareUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Share via WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                 

                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-full bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-gray-200 shadow-2xs"
                    title="Copy Article Link"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">{t("blogPage.copied") || (isRTL ? "تم النسخ!" : "Copied!")}</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-gray-400" />
                        <span>{t("blogPage.copyLink") || (isRTL ? "نسخ الرابط" : "Copy Link")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Commercial Conversion Callout Card */}
        <section className="bg-gradient-to-r from-gray-950 via-[#1C1415] to-gray-900 text-white rounded-[32px] p-8 sm:p-10 lg:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 text-start">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-[#C45B2A]/30 text-orange-300 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-[#C45B2A]/40 inline-block">
              {t("blogPage.cargoBadge") || (isRTL ? "شحن دولي سريع وسلس" : "Express Cargo & Global Logistics")}
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-black tracking-tight">
              {t("blogPage.readyToDispatch") || (isRTL ? "هل ترغب في شحن طردك أو بضاعتك الآن؟" : "Ready to Dispatch Your Next Shipment?")}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
              {t("blogPage.dispatchSubtitle") || (isRTL ? "احصل على عرض سعر فوري، تتبع شحناتك الحالية، ونسّق مع مندوبينا عبر مصر والخليج وأكثر من 220 دولة حول العالم." : "Get an instant rate quote, track regional consignments, or coordinate scheduled pickups across Egypt, UAE, Saudi Arabia, and 220+ global destinations.")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/ship"
              className="bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white font-bold py-3.5 px-7 rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02]"
            >
              <Truck className="w-4 h-4" />
              <span>{t("blogPage.requestShipmentBtn") || (isRTL ? "طلب شحن الآن" : "Request a Shipment")}</span>
            </Link>

            <Link
              href="/track"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-3.5 px-7 rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
            >
              <span>{t("blogPage.trackWaybillBtn") || (isRTL ? "تتبع بوليصة" : "Track Waybill")}</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}


