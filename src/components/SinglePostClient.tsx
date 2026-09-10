"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { WPPost, FALLBACK_POSTS_AR, FALLBACK_POSTS_EN } from "@/lib/wordpress";
import { AdminStorage } from "@/lib/adminData";
import { convertAdminPostToWP } from "@/lib/blogUtils";
import { useLanguage } from "@/context/LanguageContext";
import { sanitizeHtml } from "@/lib/sanitize";
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
  ListOrdered,
  ChevronRight,
  ArrowUpRight,
  BookmarkCheck,
  Loader2,
} from "lucide-react";

interface SinglePostClientProps {
  slug: string;
  initialPost: WPPost | null;
}

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export default function SinglePostClient({ slug, initialPost }: SinglePostClientProps) {
  const { t, isRTL, formatDate, getLocalizedPath } = useLanguage();
  const [post, setPost] = useState<WPPost | null>(initialPost);
  const [isLoading, setIsLoading] = useState(
    !initialPost &&
      !(isRTL ? FALLBACK_POSTS_AR : FALLBACK_POSTS_EN).some((p) => p.slug === slug)
  );
  const [copied, setCopied] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(
    initialPost?.featured_image_url || "/assets/xspeed_about_showcase.jpg"
  );
  const [scrollPercent, setScrollPercent] = useState(0);
  const [showToc, setShowToc] = useState(true);

  // Scroll Progress Tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollPercent(current);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // 1. If initialPost is available from SSR (matched for current route & locale), use it
    if (initialPost) {
      setPost(initialPost);
      if (initialPost.featured_image_url) {
        setImgSrc(initialPost.featured_image_url);
      }
      setIsLoading(false);
      return;
    }

    // 2. Fallback lookup in seeded posts matching the active locale
    const primaryFallback = isRTL ? FALLBACK_POSTS_AR : FALLBACK_POSTS_EN;
    const secondaryFallback = isRTL ? FALLBACK_POSTS_EN : FALLBACK_POSTS_AR;
    const matchedFallback =
      primaryFallback.find((p) => p.slug === slug) ||
      secondaryFallback.find((p) => p.slug === slug);

    if (matchedFallback) {
      setPost(matchedFallback);
      if (matchedFallback.featured_image_url) {
        setImgSrc(matchedFallback.featured_image_url);
      }
      setIsLoading(false);
      return;
    }

    // 3. Check local AdminStorage for custom user-created posts
    const adminPosts = AdminStorage.getBlogPosts();
    const matchedAdmin = adminPosts.find((p) => p.slug === slug);

    if (matchedAdmin) {
      const converted = convertAdminPostToWP(matchedAdmin, 0);
      setPost(converted);
      if (converted.featured_image_url) {
        setImgSrc(converted.featured_image_url);
      }
      setIsLoading(false);
      return;
    }

    // 4. Client-side live recovery: fetch directly from WordPress REST API with lang parameter
    let isMounted = true;
    setIsLoading(true);

    const tryFetchPost = async () => {
      const currentLocale = isRTL ? "ar" : "en";
      const endpoints = [
        `/wordpress/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1&lang=${currentLocale}`,
        `/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1&lang=${currentLocale}`,
        `https://exspeeds.com/wordpress/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1&lang=${currentLocale}`,
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            headers: { Accept: "application/json" },
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0 && isMounted) {
              const fetchedPost = data[0];
              const rawTitle =
                fetchedPost.title?.rendered ||
                fetchedPost.title ||
                (isRTL ? "مقال لوجستي" : "Logistics Insights");
              const defaultImage =
                fetchedPost._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
                fetchedPost.featured_media_src_url ||
                "/assets/xspeed_about_showcase.jpg";

              const formatted: WPPost = {
                ...fetchedPost,
                title: { rendered: rawTitle },
                content: { rendered: fetchedPost.content?.rendered || fetchedPost.content || "" },
                excerpt: { rendered: fetchedPost.excerpt?.rendered || fetchedPost.excerpt || "" },
                featured_image_url: defaultImage,
                author_name:
                  fetchedPost._embedded?.author?.[0]?.name ||
                  (isRTL ? "فريق تحرير إكس سبيد" : "XSPEED Editorial Team"),
                category_name:
                  fetchedPost._embedded?.["wp:term"]?.[0]?.[0]?.name ||
                  (isRTL ? "التكنولوجيا واللوجستيات" : "Technology & Logistics"),
              };

              setPost(formatted);
              setImgSrc(defaultImage);
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // continue checking next endpoint
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    tryFetchPost();

    return () => {
      isMounted = false;
    };
  }, [slug, initialPost, isRTL]);

  // Handle Share / Copy Link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Social Share URLs
  const getShareUrls = () => {
    if (typeof window === "undefined" || !post) {
      return { whatsapp: "#"};
    }
    const cleanTitle = post.title.rendered.replace(/<[^>]*>?/gm, "").trim();
    const currentUrl = window.location.href;
    const shareText = `${cleanTitle} - XSPEED Express Logistics: ${currentUrl}`;

    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    };
  };

  const getLocalizedCategory = (cat?: string) => {
    if (!isRTL) return cat || "Logistics & Supply Chain";
    if (!cat) return "الخدمات اللوجستية وسلاسل الإمداد";
    const lower = cat.toLowerCase();
    if (lower.includes("technology") || lower.includes("تكنولوجيا")) return "التكنولوجيا واللوجستيات";
    if (lower.includes("express") || lower.includes("سريع")) return "الشحن السريع والطرود";
    if (lower.includes("general") || lower.includes("عامة")) return "الخدمات اللوجستية العامة";
    if (lower.includes("trade") || lower.includes("تجارة")) return "التجارة الدولية والشحن";
    if (lower.includes("warehous") || lower.includes("مستودع")) return "إدارة المستودعات والتخزين";
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

  // Extract Table of Contents from content
  const headings = useMemo<HeadingItem[]>(() => {
    if (!post?.content?.rendered) return [];
    const matches = [...post.content.rendered.matchAll(/<h([2-3])[^>]*>(.*?)<\/h\1>/gi)];
    return matches.map((m, idx) => {
      const rawText = m[2].replace(/<[^>]*>?/gm, "").trim();
      const id = `section-${idx}-${rawText.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")}`;
      return {
        id,
        text: rawText,
        level: parseInt(m[1], 10),
      };
    });
  }, [post?.content?.rendered]);

  // Inject IDs into HTML content for anchor navigation with XSS sanitization
  const processedContent = useMemo(() => {
    if (!post?.content?.rendered) return "";
    const sanitized = sanitizeHtml(post.content.rendered);
    let idx = 0;
    return sanitized.replace(/<h([2-3])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, innerText) => {
      const rawText = innerText.replace(/<[^>]*>?/gm, "").trim();
      const id = `section-${idx}-${rawText.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")}`;
      idx++;
      return `<h${level}${attrs} id="${id}">${innerText}</h${level}>`;
    });
  }, [post?.content?.rendered]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Determine if the post itself is written in Arabic or English
  const isArabicPost = useMemo(() => {
    if (!post) return isRTL;
    const sampleText = `${post.title?.rendered || ""} ${post.excerpt?.rendered || ""} ${(post.content?.rendered || "").slice(0, 500)}`;
    const cleanSample = sampleText.replace(/<[^>]*>?/gm, "");
    const arabicMatches = cleanSample.match(/[\u0600-\u06FF]/g) || [];
    const latinMatches = cleanSample.match(/[a-zA-Z]/g) || [];
    return arabicMatches.length >= latinMatches.length;
  }, [post, isRTL]);

  const postDir = isArabicPost ? "rtl" : "ltr";
  const postAlign = isArabicPost ? "text-right" : "text-left";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // FAQs tailored for logistics intelligence
  const postFaqs = useMemo(() => {
    if (isArabicPost) {
      return [
        {
          q: "ما هي المدة المتوقعة للتسليم الدولي السريع مع XSPEED؟",
          a: "تتراوح مدة التسليم السريع بين 24 إلى 72 ساعة لمعظم الوجهات الإقليمية في الشرق الأوسط والخليج، وتصل إلى 3-5 أيام عمل للوجهات العالمية، مع متابعة لحظية عبر رقم البوليصة."
        },
        {
          q: "هل تتوفر خدمات التخليص الجمركي للشحنات التجارية والشخصية؟",
          a: "نعم، يتولى فريقنا المتخصص إجراءات التخليص الجمركي الفوري عبر منظومة نافذة والتسجيل المسبق ACI لتفادي أي تأخير أو رسوم أرضيات في الموانئ والمطارات."
        },
        {
          q: "كيف يمكنني طلب عرض أسعار مخصص لشحنتي؟",
          a: "يمكنك الضغط على زر 'طلب عرض سعر الآن' أو التواصل الفوري مع مكتب العمليات عبر الواتساب لتلقي عرض سعر تنافسي خلال دقائق."
        }
      ];
    }
    return [
      {
        q: "What is the standard transit time for XSPEED express shipments?",
        a: "Regional express consignments across the Middle East & GCC are delivered within 24–72 hours, while global freight typically arrives within 3–5 business days with real-time waypoint telemetry."
      },
      {
        q: "Does XSPEED handle customs clearance and documentation?",
        a: "Yes, our licensed brokerage desk handles pre-clearance, ACI registration, and tariff code optimization across all major airports and sea terminals."
      },
      {
        q: "How can I get an instant commercial rate quote?",
        a: "Click 'Request Quote Now' or chat directly with our 24/7 operations desk on WhatsApp for an immediate competitive rate."
      }
    ];
  }, [isArabicPost]);

  // Related posts (excluding current slug) localized
  const relatedPosts = useMemo(() => {
    const list = isArabicPost ? FALLBACK_POSTS_AR : FALLBACK_POSTS_EN;
    return list.filter((p) => p.slug !== slug).slice(0, 3);
  }, [slug, isArabicPost]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-[28px] border border-orange-100 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-[#C45B2A] flex items-center justify-center mx-auto animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin text-[#C45B2A]" />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-orange-100/60 rounded-full w-3/4 mx-auto animate-pulse"></div>
            <div className="h-3.5 bg-gray-100 rounded-full w-5/6 mx-auto animate-pulse"></div>
            <div className="h-3 bg-gray-100 rounded-full w-1/2 mx-auto animate-pulse"></div>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            {isRTL ? "جاري مزامنة بيانات المقال اللوجستي..." : "Syncing logistics article data..."}
          </p>
        </div>
      </div>
    );
  }

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
            {t("blogPage.articleNotFoundDesc") ||
              (isRTL
                ? "لم نتمكن من العثور على المقال المطلوب، ربما تم نقله أو تحديثه."
                : "The requested logistics article could not be located. It may have been moved or updated.")}
          </p>
          <div className="pt-2">
            <Link
              href={getLocalizedPath("/blog")}
              className="bg-[#C45B2A] hover:bg-[#A34920] text-white font-bold text-xs py-3 px-6 rounded-full inline-flex items-center gap-2 transition-all cursor-pointer min-h-[44px]"
            >
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

  // Upload / Publish Date & Time
  const publishDateObj = post.date ? new Date(post.date) : null;
  const hasValidPublishDate = Boolean(publishDateObj && !isNaN(publishDateObj.getTime()));

  const formattedPublishDate = hasValidPublishDate && publishDateObj
    ? publishDateObj.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : isRTL
    ? "تاريخ النشر غير متوفر"
    : "Recently Published";

  const formattedPublishTime = hasValidPublishDate && publishDateObj
    ? publishDateObj.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const fullPublishDateTimeStr = hasValidPublishDate
    ? isRTL
      ? `${formattedPublishDate} ${t("blogPage.atTime") || "الساعة"} ${formattedPublishTime}`
      : `${formattedPublishDate} ${t("blogPage.atTime") || "at"} ${formattedPublishTime}`
    : formattedPublishDate;

  // Modified / Updated Date & Time
  const modifiedDateObj = post.modified ? new Date(post.modified) : null;
  const hasValidModifiedDate = Boolean(modifiedDateObj && !isNaN(modifiedDateObj.getTime()));
  const hasModifiedDiff =
    hasValidModifiedDate &&
    hasValidPublishDate &&
    modifiedDateObj &&
    publishDateObj &&
    Math.abs(modifiedDateObj.getTime() - publishDateObj.getTime()) > 3600000;

  const formattedModifiedDate = hasModifiedDiff && modifiedDateObj
    ? modifiedDateObj.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const formattedModifiedTime = hasModifiedDiff && modifiedDateObj
    ? modifiedDateObj.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const fullModifiedDateTimeStr = hasModifiedDiff
    ? isRTL
      ? `${formattedModifiedDate} ${t("blogPage.atTime") || "الساعة"} ${formattedModifiedTime}`
      : `${formattedModifiedDate} ${t("blogPage.atTime") || "at"} ${formattedModifiedTime}`
    : null;

  const seoScore = post.rank_math_seo?.seo_score || 95;
  const shareUrls = getShareUrls();

  return (
    <div className={`min-h-screen bg-[#FAF8F5] py-10 lg:py-16 px-3 sm:px-6 lg:px-8 ${isRTL ? "text-right" : "text-left"}`}>
      {/* Sticky Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-100 pointer-events-none"
        aria-label={t("blogPage.readingProgress") || (isRTL ? "نسبة القراءة" : "Reading Progress")}
      >
        <div
          className="h-full bg-gradient-to-r from-[#C45B2A] via-orange-500 to-[#E65100] transition-[width] duration-150 ease-out"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link href={getLocalizedPath("/")} className="hover:text-[#C45B2A] transition-colors cursor-pointer">
              {isRTL ? "الرئيسية" : "Home"}
            </Link>
            <span className="text-gray-300">/</span>
            <Link href={getLocalizedPath("/blog")} className="hover:text-[#C45B2A] transition-colors cursor-pointer">
              {isRTL ? "المدونة" : "Blog"}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-bold truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {post.title.rendered.replace(/<[^>]*>?/gm, "")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={getLocalizedPath("/blog")}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#C45B2A] bg-white px-4 py-2 rounded-full border border-gray-200 shadow-2xs transition-all hover:border-[#C45B2A] cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
              <span>{t("blogPage.backToArticles") || (isRTL ? "العودة إلى جميع المقالات" : "Back to All Articles")}</span>
            </Link>

            {/* Category Pill */}
            <span className="bg-orange-50 text-[#C45B2A] border border-orange-200/80 text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-2xs">
              {getLocalizedCategory(post.category_name)}
            </span>
          </div>
        </nav>

        {/* Main Article Container */}
        <article
          dir={postDir}
          className={`bg-white/95 backdrop-blur-xl rounded-[32px] border border-orange-100/90 overflow-hidden shadow-[0_20px_50px_rgba(37,21,22,0.06)] ${postAlign}`}
          itemScope
          itemType="https://schema.org/BlogPosting"
        >
          {/* Article Header */}
          <header className={`p-6 sm:p-10 lg:p-12 space-y-6 border-b border-gray-100 ${postAlign}`}>
            <h1
              itemProp="headline"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black text-gray-950 tracking-[-0.03em] leading-[1.2]"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.title.rendered) }}
            />

            {/* Meta Row: Author, Upload Date, Modified Date, Reading Time */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-600 pt-2">
              {/* Author */}
              <div
                className="flex items-center gap-2 font-bold text-gray-900"
                itemProp="author"
                itemScope
                itemType="https://schema.org/Person"
              >
                <div className="w-8 h-8 rounded-full bg-orange-100 text-[#C45B2A] flex items-center justify-center font-black text-xs border border-orange-200/80 shrink-0">
                  {post.author_name?.charAt(0) || "X"}
                </div>
                <span itemProp="name">
                  {isArabicPost ? getLocalizedAuthor(post.author_name) : (post.author_name || "XSPEED Editorial Team")}
                </span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  {isArabicPost ? "فريق موثق" : "Verified Author"}
                </span>
              </div>

              <span className="text-gray-300">•</span>

              {/* Upload Date & Time of Publishing */}
              <time
                dateTime={post.date || new Date().toISOString()}
                itemProp="datePublished"
                className="flex items-center gap-1.5 font-semibold text-gray-800 bg-orange-50/80 px-3 py-1 rounded-full border border-orange-200/70 shadow-2xs"
                title={fullPublishDateTimeStr}
              >
                <Calendar className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
                <span>
                  {isArabicPost ? "نُشر بتاريخ:" : "Published on:"}{" "}
                  <strong className="text-gray-900">{formattedPublishDate}</strong>
                </span>
              </time>

              {/* Last Modified Date & Time (if different from publish date) */}
              {fullModifiedDateTimeStr && (
                <>
                  <span className="text-gray-300">•</span>
                  <time
                    dateTime={post.modified}
                    itemProp="dateModified"
                    className="flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 shadow-2xs"
                    title={fullModifiedDateTimeStr}
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {isArabicPost ? "آخر تحديث:" : "Last Updated:"}{" "}
                      <strong className="text-emerald-950">{formattedModifiedDate}</strong>
                    </span>
                    {formattedModifiedTime && (
                      <>
                        <span className="text-emerald-300">•</span>
                        <span className="font-mono text-emerald-800 text-[11px] bg-white/80 px-2 py-0.5 rounded-full border border-emerald-100">
                          {formattedModifiedTime}
                        </span>
                      </>
                    )}
                  </time>
                </>
              )}

              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1 text-gray-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{readTimeMinutes} {isArabicPost ? "دقائق قراءة" : "min read"}</span>
              </span>
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
          <div className={`p-6 sm:p-10 lg:p-12 space-y-8 ${postAlign}`}>
            {/* Key Takeaways Callout Box */}
            <div className="bg-orange-50/80 rounded-2xl p-5 sm:p-6 border border-orange-200/90 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#C45B2A] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{isArabicPost ? "أبرز نقاط المقال اللوجستي" : "Key Logistics Takeaways"}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-semibold">
                {isArabicPost
                  ? "يستعرض هذا المقال المعايير والتطورات الحديثة في الشحن الدولي والسريع، مع التركيز على أفضل ممارسات سلاسل الإمداد، التخليص الجمركي الفوري عبر منظومة نافذة، والتقنيات الرقمية المعتمدة لضمان سرعة وأمان الشحنات."
                  : "This article examines key standards in express freight, supply chain acceleration, rapid customs clearance protocols, and digital tracking technologies ensuring on-time delivery across global corridors."}
              </p>
            </div>

            {/* Table of Contents (TOC) - If article has 2+ headings */}
            {headings.length >= 2 && (
              <div className="bg-[#FAF8F5] rounded-2xl p-5 sm:p-6 border border-orange-100/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-wider">
                    <ListOrdered className="w-4 h-4 text-[#C45B2A] shrink-0" />
                    <span>{isArabicPost ? "فهرس المقال" : "Table of Contents"}</span>
                  </div>
                  <button
                    onClick={() => setShowToc(!showToc)}
                    className="text-xs font-bold text-gray-500 hover:text-[#C45B2A] transition-colors cursor-pointer px-2 py-1"
                  >
                    {showToc ? (isArabicPost ? "إخفاء" : "Hide") : (isArabicPost ? "عرض" : "Show")}
                  </button>
                </div>

                {showToc && (
                  <ul className="space-y-1.5 pt-2 border-t border-orange-100/60 text-xs sm:text-sm">
                    {headings.map((heading) => (
                      <li key={heading.id} className={heading.level === 3 ? (isArabicPost ? "me-4" : "ms-4") : ""}>
                        <button
                          onClick={() => scrollToHeading(heading.id)}
                          className={`flex items-center gap-1.5 text-gray-700 hover:text-[#C45B2A] font-medium transition-colors cursor-pointer group py-1 ${postAlign}`}
                        >
                          <ChevronRight
                            className={`w-3.5 h-3.5 text-orange-400 group-hover:text-[#C45B2A] transition-colors shrink-0 ${
                              isArabicPost ? "rotate-180" : ""
                            }`}
                          />
                          <span className="group-hover:underline underline-offset-2">{heading.text}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Render Enhanced HTML content with prose-xspeed and XSS sanitization */}
            <div
              itemProp="articleBody"
              dir={postDir}
              className={`prose-xspeed max-w-none ${postAlign}`}
              dangerouslySetInnerHTML={{ __html: processedContent || (post.content.rendered ? sanitizeHtml(post.content.rendered) : "") }}
            />

            {/* FAQ Accordion Section for Rich Snippets & E-E-A-T */}
            <div className="pt-6 border-t border-gray-100 space-y-4">
              <div className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-wider">
                <BookmarkCheck className="w-4 h-4 text-[#C45B2A] shrink-0" />
                <span>{isArabicPost ? "الأسئلة الشائعة حول الموضوع" : "Frequently Asked Questions"}</span>
              </div>

              <div className="space-y-3">
                {postFaqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-orange-100 rounded-2xl overflow-hidden bg-[#FAF8F5] transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className={`w-full p-4 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-gray-900 hover:text-[#C45B2A] transition-colors cursor-pointer ${postAlign}`}
                    >
                      <span>{faq.q}</span>
                      <ChevronRight
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                          openFaq === idx ? "rotate-90 text-[#C45B2A]" : (isArabicPost ? "rotate-180" : "")
                        }`}
                      />
                    </button>
                    {openFaq === idx && (
                      <div className={`px-4 pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed font-medium border-t border-orange-100/60 pt-2 ${postAlign}`}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Sharing Bar with Proper SVG Icons and AA Contrast */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FAF8F5] p-5 rounded-2xl border border-orange-100/80">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#C45B2A]" />
                <span>{isArabicPost ? "مشاركة المقال:" : "Share this article:"}</span>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* WhatsApp */}
                <a
                  href={shareUrls.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                  aria-label="Share via WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>WhatsApp</span>
                </a>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-full bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-gray-200 shadow-2xs min-h-[44px]"
                  aria-label="Copy Article Link"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700">{isArabicPost ? "تم النسخ!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{isArabicPost ? "نسخ الرابط" : "Copy Link"}</span>
                    </>
                  )}
                </button>
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
              {t("blogPage.dispatchSubtitle") ||
                (isRTL
                  ? "احصل على عرض سعر فوري، تتبع شحناتك الحالية، ونسّق مع مندوبينا عبر مصر والخليج وأكثر من 220 دولة حول العالم."
                  : "Get an instant rate quote, track regional consignments, or coordinate scheduled pickups across Egypt, UAE, Saudi Arabia, and 220+ global destinations.")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              href={getLocalizedPath("/ship")}
              className="bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white font-bold py-3.5 px-7 rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] cursor-pointer min-h-[44px]"
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>{t("blogPage.requestShipmentBtn") || (isRTL ? "طلب شحن الآن" : "Request a Shipment")}</span>
            </Link>

            <Link
              href={getLocalizedPath("/track")}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-3.5 px-7 rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
            >
              <span>{t("blogPage.trackWaybillBtn") || (isRTL ? "تتبع بوليصة" : "Track Waybill")}</span>
            </Link>
          </div>
        </section>

        {/* Related Logistics Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="space-y-6 pt-4 text-start" aria-label="Related Articles">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#C45B2A]">
                  {isRTL ? "استكشف المزيد" : "Explore More"}
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-black text-gray-950">
                  {t("blogPage.relatedArticles") || (isRTL ? "مقالات لوجستية ذات صلة" : "Related Logistics Articles")}
                </h3>
              </div>
              <Link
                href={getLocalizedPath("/blog")}
                className="text-xs font-bold text-[#C45B2A] hover:text-[#A34920] flex items-center gap-1 group transition-colors cursor-pointer"
              >
                <span>{isRTL ? "جميع المقالات" : "All Articles"}</span>
                <ArrowUpRight
                  className={`w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ${
                    isRTL ? "rotate-90" : ""
                  }`}
                />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => {
                const relDateObj = related.date ? new Date(related.date) : null;
                const hasRelDate = Boolean(relDateObj && !isNaN(relDateObj.getTime()));
                const relFormattedDate = hasRelDate && relDateObj
                  ? relDateObj.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "";
                const relFormattedTime = hasRelDate && relDateObj
                  ? relDateObj.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                return (
                  <Link
                    key={related.slug}
                    href={getLocalizedPath(`/blog/${related.slug}`)}
                    className="group bg-white rounded-2xl border border-orange-100/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer"
                  >
                    <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={related.featured_image_url || "/assets/xspeed_about_showcase.jpg"}
                        alt={related.title.rendered.replace(/<[^>]*>?/gm, "")}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 end-3 bg-white/95 backdrop-blur-md text-[#C45B2A] text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-orange-100 shadow-2xs">
                        {getLocalizedCategory(related.category_name)}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-[#C45B2A] shrink-0" />
                            <span>{relFormattedDate}</span>
                          </span>
                          {relFormattedTime && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="flex items-center gap-1 font-mono text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded text-[10px] border border-gray-100">
                                <Clock className="w-2.5 h-2.5 text-orange-400 shrink-0" />
                                <span>{relFormattedTime}</span>
                              </span>
                            </>
                          )}
                        </div>
                        <h4 className="font-display font-black text-sm text-gray-900 group-hover:text-[#C45B2A] transition-colors line-clamp-2 leading-snug">
                          {related.title.rendered.replace(/<[^>]*>?/gm, "")}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {related.excerpt.rendered.replace(/<[^>]*>?/gm, "")}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#C45B2A]">
                        <span>{t("blogPage.readArticle") || (isRTL ? "قراءة المقال" : "Read Article")}</span>
                        <ArrowUpRight
                          className={`w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ${
                            isRTL ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}



