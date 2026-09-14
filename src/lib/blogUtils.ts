import { BlogPost } from "@/lib/adminData";
import { WPPost } from "@/lib/wordpress";

/**
 * Detect language of a post (ar or en) with high accuracy:
 * checks explicit lang/locale fields, then falls back to Arabic unicode range check.
 */
export function detectPostLanguage(post: BlogPost | WPPost): "ar" | "en" {
  if (post.lang === "ar" || post.lang === "en") return post.lang;
  if ((post as any).locale === "ar" || (post as any).locale === "en") {
    return (post as any).locale;
  }

  const title = typeof post.title === "string" ? post.title : post.title?.rendered || "";
  const excerpt = typeof post.excerpt === "string" ? post.excerpt : post.excerpt?.rendered || "";
  const sample = `${title} ${excerpt}`;

  return /[\u0600-\u06FF]/.test(sample) ? "ar" : "en";
}

/**
 * Convert admin BlogPost to WPPost format for rendering in public views.
 * Preserves multilingual metadata (lang, translationOf, translations).
 */
export function convertAdminPostToWP(post: BlogPost, index: number): WPPost {
  const defaultImage = post.imageUrl || "/assets/xspeed_about_showcase.jpg";
  const defaultExcerpt = post.excerpt || `${post.title}. Comprehensive logistics insights on ${post.focusKeyword}.`;
  const detectedLang = post.lang || detectPostLanguage(post);

  // Format content: if rich HTML, preserve; if plain text, wrap gracefully into structured article
  let formattedContent = post.content;
  if (!formattedContent) {
    formattedContent = `
      <p class="lead">${post.title}</p>
      <p>Comprehensive logistics and express supply chain analysis by <strong>${post.author}</strong> in category <strong>${post.category}</strong>.</p>
      <h2>Key Operational Insights</h2>
      <p>Targeting <strong>${post.focusKeyword}</strong>, modern regional freight operations require synchronized tracking telemetry, high-speed linehauls, and automated customs pre-clearance to guarantee end-to-end delivery performance.</p>
      <blockquote>
        "Precision in last-mile dispatching and cross-border customs optimization ensures continuous cargo velocity and client trust."
      </blockquote>
      <p>For custom rate quotes or enterprise shipment routing, connect with our XSPEED Express logistics team today.</p>
    `;
  } else if (!formattedContent.includes("<p>") && !formattedContent.includes("<div>")) {
    formattedContent = formattedContent
      .split("\n\n")
      .filter((p) => p.trim())
      .map((p) => `<p>${p.trim()}</p>`)
      .join("");
  }

  const postDate = post.date
    ? post.date.includes("T")
      ? post.date
      : `${post.date}T10:00:00Z`
    : new Date().toISOString();

  return {
    id: (parseInt(post.id.replace(/\D/g, "")) || 0) + 90000 + index,
    date: postDate,
    modified: postDate,
    slug: post.slug,
    status: "publish",
    locale: detectedLang,
    lang: detectedLang,
    translationOf: post.translationOf,
    translations: post.translations,
    title: { rendered: post.title },
    content: {
      rendered: formattedContent,
    },
    excerpt: {
      rendered: defaultExcerpt,
    },
    featured_image_url: defaultImage,
    category_name: post.category,
    author_name: post.author,
    rank_math_seo: {
      title: `${post.title} | XSPEED`,
      description: defaultExcerpt,
      focus_keyword: post.focusKeyword,
      canonical: `https://exspeeds.com/${detectedLang}/blog/${post.slug}`,
      og_title: post.title,
      og_description: defaultExcerpt,
      og_image: defaultImage,
      twitter_title: post.title,
      twitter_description: defaultExcerpt,
      twitter_image: defaultImage,
      seo_score: post.seoScore || 92,
      robots: ["index", "follow", "max-image-preview:large"],
    },
  };
}

/**
 * Merge admin posts with server-fetched WordPress posts with strict locale filtering
 * and bidirectional translation linking ("one post with two languages").
 *
 * Prevents duplicate cards (Arabic & English) from appearing on the same feed,
 * and attaches translatedSlug to each post so users can seamlessly toggle languages.
 */
export function mergeAdminPosts(
  initialPosts: WPPost[],
  adminPosts: BlogPost[],
  currentLocale: "ar" | "en" = "ar"
): WPPost[] {
  // 1. Convert published admin posts
  const convertedAdminPosts = adminPosts
    .filter((p) => p.status === "published")
    .map((p, idx) => convertAdminPostToWP(p, idx));

  // 2. Build complete pool of all candidates
  const allPosts = [...convertedAdminPosts, ...initialPosts];

  // 3. Build lookup maps for pairing translations
  const postById = new Map<string | number, WPPost>();
  const postBySlug = new Map<string, WPPost>();

  allPosts.forEach((post) => {
    postById.set(post.id, post);
    postById.set(String(post.id), post);
    postBySlug.set(post.slug, post);
  });

  // Also map original admin post IDs (e.g., "wp-105" or "post-123")
  adminPosts.forEach((p) => {
    const matched = allPosts.find((w) => w.slug === p.slug);
    if (matched) {
      postById.set(p.id, matched);
    }
  });

  // 4. Discover and establish bidirectional translation relationships
  allPosts.forEach((post) => {
    const postLang = detectPostLanguage(post);

    // Case A: post has translationOf pointing to another post
    if (post.translationOf) {
      const counterpart = postById.get(post.translationOf) || postById.get(String(post.translationOf));
      if (counterpart && counterpart.slug !== post.slug) {
        linkPostPair(post, counterpart, postLang);
      }
    }

    // Case B: Another post has translationOf pointing to this post
    const reverseCounterpart = allPosts.find(
      (other) => other.slug !== post.slug && (other.translationOf === post.id || String(other.translationOf) === String(post.id))
    );
    if (reverseCounterpart) {
      linkPostPair(post, reverseCounterpart, postLang);
    }

    // Case C: Heuristic match by slug prefix/suffix (e.g. "my-article" & "my-article-ar")
    // Case C: Heuristic match by identical slug across languages OR slug prefix/suffix
    if (!post.translatedSlug) {
      const cleanSlug = post.slug.replace(/-(ar|en)$/, "");
      const matchedSibling = allPosts.find((other) => {
        if (other.slug === post.slug) return false;
        if (other === post || other.id === post.id) return false;
        const otherLang = detectPostLanguage(other);
        if (otherLang === postLang) return false;
        if (other.slug === post.slug) return true;
        const otherCleanSlug = other.slug.replace(/-(ar|en)$/, "");
        return cleanSlug === otherCleanSlug;
      });

      if (matchedSibling) {
        linkPostPair(post, matchedSibling, postLang);
      }
    }
  });

  // 5. Filter posts to only match the current locale
  // Enforces: /en/blog only shows English posts, /ar/blog only shows Arabic posts
  const localeMatchedPosts = allPosts.filter((post) => {
    const lang = detectPostLanguage(post);
    return lang === currentLocale;
  });

  // 6. Deduplicate by slug (prefer admin posts if duplicate slug)
  const seenSlugs = new Set<string>();
  const deduplicated: WPPost[] = [];

  localeMatchedPosts.forEach((post) => {
    if (!seenSlugs.has(post.slug)) {
      seenSlugs.add(post.slug);
      deduplicated.push(post);
    }
  });

  return deduplicated;
}

/**
 * Helper to link two posts bidirectionally as translations of each other
 */
function linkPostPair(postA: WPPost, postB: WPPost, langA: "ar" | "en") {
  const langB = langA === "ar" ? "en" : "ar";

  postA.translatedSlug = postB.slug;
  postA.translatedTitle = typeof postB.title === "string" ? postB.title : postB.title?.rendered;
  postA.translations = {
    ...(postA.translations || {}),
    [langA]: postA.slug,
    [langB]: postB.slug,
  };

  postB.translatedSlug = postA.slug;
  postB.translatedTitle = typeof postA.title === "string" ? postA.title : postA.title?.rendered;
  postB.translations = {
    ...(postB.translations || {}),
    [langB]: postB.slug,
    [langA]: postA.slug,
  };
}

/**
 * Robust counterpart post lookup across any collection of WPPost or BlogPost candidates.
 */
export function findCounterpartPost(
  target: WPPost | BlogPost,
  candidates: (WPPost | BlogPost)[],
  targetLang: "ar" | "en"
): (WPPost | BlogPost) | null {
  const currentLang = detectPostLanguage(target);
  if (currentLang === targetLang) return null;

  // 1. Direct translatedSlug match
  const transSlug = (target as any).translatedSlug;
  if (transSlug) {
    const direct = candidates.find(
      (c) => c.slug === transSlug && detectPostLanguage(c) === targetLang
    );
    if (direct) return direct;
  }

  // 2. Direct translations map match
  if (target.translations && target.translations[targetLang]) {
    const targetRef = String(target.translations[targetLang]);
    const matched = candidates.find(
      (c) => (c.slug === targetRef || String(c.id) === targetRef) && detectPostLanguage(c) === targetLang
    );
    if (matched) return matched;
  }

  // 3. ID / translationOf relationship
  const targetIdStr = String(target.id);
  const byTranslationOf = candidates.find((c) => {
    if (detectPostLanguage(c) !== targetLang) return false;
    const cIdStr = String(c.id);
    const targetTransOf = target.translationOf ? String(target.translationOf) : null;
    const cTransOf = c.translationOf ? String(c.translationOf) : null;

    return (
      (targetTransOf && (targetTransOf === cIdStr || targetTransOf === c.slug)) ||
      (cTransOf && (cTransOf === targetIdStr || cTransOf === target.slug))
    );
  });
  if (byTranslationOf) return byTranslationOf;

  // 4. Clean slug match (e.g. "my-slug" & "my-slug-ar", or identical slug across fallback sets)
  const cleanTargetSlug = target.slug.replace(/-(ar|en)$/, "");
  const byCleanSlug = candidates.find((c) => {
    if (c === target) return false;
    if (detectPostLanguage(c) !== targetLang) return false;
    if (c.slug === target.slug) return true;
    const cleanCSlug = c.slug.replace(/-(ar|en)$/, "");
    return cleanTargetSlug === cleanCSlug;
  });

  return byCleanSlug || null;
}
