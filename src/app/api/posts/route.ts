import { NextResponse } from "next/server";
import { getPosts, createWordPressPost } from "@/lib/wordpress";
import { ServerStore } from "@/lib/serverStore";
import { BlogPost } from "@/lib/adminData";

export const dynamic = "force-dynamic";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY || "c1dd229f-c9a2-4cfd-9090-dcb1cffa6475:fx";
const DEEPL_ENDPOINT = "https://api-free.deepl.com/v2";

function normalizeLang(lang: string, isTarget: boolean = false): string {
  const upper = (lang || "").toUpperCase().trim();
  if (upper.startsWith("AR")) return "AR";
  if (upper.startsWith("EN")) return isTarget ? "EN-US" : "EN";
  return upper;
}

async function translateWithDeepL(text: string, sourceLang: string, targetLang: string, isHtml: boolean = false): Promise<string> {
  if (!text || !text.trim()) return text;

  const src = normalizeLang(sourceLang, false);
  const tgt = normalizeLang(targetLang, true);

  if (src === tgt || (src.startsWith("EN") && tgt.startsWith("EN"))) {
    return text;
  }

  const payload: any = {
    text: [text],
    source_lang: src,
    target_lang: tgt,
  };

  if (isHtml) {
    payload.tag_handling = "html";
  }

  try {
    const res = await fetch(`${DEEPL_ENDPOINT}/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return data.translations?.[0]?.text || text;
    }
  } catch (err) {
    console.error("[DeepL API] Translation failed:", err);
  }

  return text;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedLang = searchParams.get("lang") || "ar";
    const normalizedLang = requestedLang === "en" ? "en" : "ar";
    const posts = await getPosts(50, normalizedLang);
    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      category,
      author,
      focusKeyword,
      seoScore,
      imageUrl,
      lang = "ar",
      autoTranslate = true,
      translatedTitle,
      translatedContent,
      translatedExcerpt,
      translatedSlug,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const sourceLang: "ar" | "en" = lang === "en" ? "en" : "ar";
    const targetLang: "ar" | "en" = sourceLang === "ar" ? "en" : "ar";

    const computedSlug =
      slug ||
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // 1. Create original post in WordPress
    const originalResult = await createWordPressPost({
      title,
      slug: computedSlug,
      content: content || `<p>${title}</p>`,
      excerpt: excerpt || title,
      category: category || "Technology & Logistics",
      author: author || "XSPEED Editorial Team",
      focusKeyword: focusKeyword || title.toLowerCase().slice(0, 25),
      seoScore: seoScore || 90,
      imageUrl: imageUrl || "/assets/xspeed_about_showcase.jpg",
      locale: sourceLang,
    });

    let translationSucceeded = false;
    let finalTransTitle = translatedTitle;
    let finalTransContent = translatedContent;
    let finalTransExcerpt = translatedExcerpt;
    let finalTransSlug = translatedSlug;
    let translatedWpResult = null;

    // 2. Handle Automated / Reviewed DeepL Translation
    if (autoTranslate) {
      if (!finalTransTitle || !finalTransContent) {
        // Automatically translate via DeepL
        try {
          const [tTitle, tExcerpt, tContent] = await Promise.all([
            translateWithDeepL(title, sourceLang, targetLang, false),
            excerpt ? translateWithDeepL(excerpt, sourceLang, targetLang, false) : Promise.resolve(""),
            content ? translateWithDeepL(content, sourceLang, targetLang, true) : Promise.resolve(""),
          ]);

          if (tTitle && tTitle !== title) {
            finalTransTitle = tTitle;
            finalTransExcerpt = tExcerpt || tTitle;
            finalTransContent = tContent || `<p>${tTitle}</p>`;
            finalTransSlug = tTitle
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");
            translationSucceeded = true;
          }
        } catch (e) {
          console.warn("[DeepL Auto-Translate] Warning during batch translation:", e);
        }
      } else {
        // Admin reviewed and customized translation
        translationSucceeded = true;
        if (!finalTransSlug) {
          finalTransSlug = finalTransTitle
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        }
      }

      // 3. If translation succeeded, create translated post in WordPress and link it
      if (translationSucceeded && finalTransTitle) {
        translatedWpResult = await createWordPressPost({
          title: finalTransTitle,
          slug: finalTransSlug,
          content: finalTransContent || `<p>${finalTransTitle}</p>`,
          excerpt: finalTransExcerpt || finalTransTitle,
          category: category || "Technology & Logistics",
          author: author || "XSPEED Editorial Team",
          focusKeyword: focusKeyword || "",
          seoScore: seoScore || 90,
          imageUrl: imageUrl || "/assets/xspeed_about_showcase.jpg",
          locale: targetLang,
          translationOf: originalResult.wpId,
        });
      }
    }

    // 4. Persist to ServerStore for local and admin persistence
    try {
      const nowIso = new Date().toISOString();
      const originalPostId = originalResult.wpId ? `wp-${originalResult.wpId}` : `post-${Date.now()}`;

      const newBlogPost: BlogPost = {
        id: originalPostId,
        title: title,
        slug: computedSlug,
        author: author || "XSPEED Operations & Logistics Team",
        category: category || "Technology & Logistics",
        date: nowIso,
        status: autoTranslate && !translationSucceeded ? "pending_translation" : "published",
        views: 1,
        seoScore: seoScore || 90,
        focusKeyword: focusKeyword || title.toLowerCase().slice(0, 25),
        wordCount: content ? content.split(/\s+/).length : 500,
        wpEditUrl: `/wp-admin/post.php?post=${originalResult.wpId || 101}&action=edit`,
        imageUrl: imageUrl || "/assets/xspeed_about_showcase.jpg",
        excerpt: excerpt || title,
        content: content || `<p>${title}</p>`,
        lang: sourceLang,
        deeplStatus: translationSucceeded ? "translated" : (autoTranslate ? "failed" : "none"),
      };

      const postsToSave = [newBlogPost];

      if (translationSucceeded && finalTransTitle) {
        const translatedPostId = translatedWpResult?.wpId ? `wp-${translatedWpResult.wpId}` : `post-${Date.now() + 1}`;
        const newTranslatedPost: BlogPost = {
          id: translatedPostId,
          title: finalTransTitle,
          slug: finalTransSlug,
          author: author || "XSPEED Operations & Logistics Team",
          category: category || "Technology & Logistics",
          date: nowIso,
          status: "published",
          views: 1,
          seoScore: seoScore || 90,
          focusKeyword: focusKeyword || "",
          wordCount: finalTransContent ? finalTransContent.split(/\s+/).length : 500,
          wpEditUrl: `/wp-admin/post.php?post=${translatedWpResult?.wpId || 102}&action=edit`,
          imageUrl: imageUrl || "/assets/xspeed_about_showcase.jpg",
          excerpt: finalTransExcerpt || finalTransTitle,
          content: finalTransContent || `<p>${finalTransTitle}</p>`,
          lang: targetLang,
          translationOf: originalPostId,
          deeplStatus: "translated",
        };
        postsToSave.push(newTranslatedPost);
      }

      const existingPosts = ServerStore.getBlogPosts();
      const slugsToFilter = new Set(postsToSave.map((p) => p.slug));
      const filtered = existingPosts.filter((p) => !slugsToFilter.has(p.slug));
      ServerStore.saveBlogPosts([...postsToSave, ...filtered]);

      return NextResponse.json({
        success: true,
        original: newBlogPost,
        translation: postsToSave.length > 1 ? postsToSave[1] : null,
        wpId: originalResult.wpId,
        translatedWpId: translatedWpResult?.wpId,
        translationStatus: translationSucceeded ? "translated" : (autoTranslate ? "pending_translation" : "none"),
      });

    } catch (storeErr) {
      console.warn("[ServerStore] Could not persist to local JSON store:", storeErr);
    }

    return NextResponse.json(originalResult);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}
