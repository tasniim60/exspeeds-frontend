import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { createWordPressPost } from "@/lib/wordpress";

export const dynamic = "force-dynamic";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY || "c1dd229f-c9a2-4cfd-9090-dcb1cffa6475:fx";
const DEEPL_ENDPOINT = "https://api-free.deepl.com/v2";

function normalizeLang(lang: string, isTarget: boolean = false): string {
  const upper = (lang || "").toUpperCase().trim();
  if (upper.startsWith("AR")) return "AR";
  if (upper.startsWith("EN")) return isTarget ? "EN-US" : "EN";
  return upper;
}

async function translateDeepL(text: string, sourceLang: string, targetLang: string, isHtml: boolean = false) {
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

  const res = await fetch(`${DEEPL_ENDPOINT}/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`DeepL API failed with status ${res.status}`);
  }

  const json = await res.json();
  return json.translations?.[0]?.text || text;
}

/**
 * POST /api/posts/retry -> Retries translation for a pending or failed post
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ success: false, error: "Post ID is required" }, { status: 400 });
    }

    const posts = ServerStore.getBlogPosts();
    const post = posts.find((p) => p.id === postId);

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    const sourceLang = post.lang === "en" ? "en" : "ar";
    const targetLang = sourceLang === "ar" ? "en" : "ar";

    // 1. Translate with DeepL
    const [transTitle, transExcerpt, transContent] = await Promise.all([
      translateDeepL(post.title, sourceLang, targetLang, false),
      post.excerpt ? translateDeepL(post.excerpt, sourceLang, targetLang, false) : Promise.resolve(""),
      post.content ? translateDeepL(post.content, sourceLang, targetLang, true) : Promise.resolve(""),
    ]);

    const transSlug = transTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // 2. Extract numeric WP ID if present
    const originalWpId = post.id.startsWith("wp-") ? parseInt(post.id.replace("wp-", "")) : undefined;

    // 3. Sync translated post to WordPress with translation_of
    const wpResult = await createWordPressPost({
      title: transTitle,
      slug: transSlug,
      content: transContent || `<p>${transTitle}</p>`,
      excerpt: transExcerpt || transTitle,
      category: post.category,
      author: post.author,
      focusKeyword: post.focusKeyword,
      seoScore: post.seoScore,
      imageUrl: post.imageUrl,
      locale: targetLang,
      translationOf: originalWpId,
    });

    // 4. Update original post status and save translated post to ServerStore
    const updatedOriginal = {
      ...post,
      status: "published" as const,
      deeplStatus: "translated" as const,
    };

    const newTranslatedPost = {
      id: wpResult.wpId ? `wp-${wpResult.wpId}` : `post-${Date.now()}`,
      title: transTitle,
      slug: transSlug,
      author: post.author,
      category: post.category,
      date: new Date().toISOString(),
      status: "published" as const,
      views: 1,
      seoScore: post.seoScore || 90,
      focusKeyword: post.focusKeyword,
      wordCount: transContent ? transContent.split(/\s+/).length : 500,
      wpEditUrl: `/wp-admin/post.php?post=${wpResult.wpId || 101}&action=edit`,
      imageUrl: post.imageUrl,
      excerpt: transExcerpt || transTitle,
      content: transContent || `<p>${transTitle}</p>`,
      lang: targetLang as "ar" | "en",
      translationOf: post.id,
      deeplStatus: "translated" as const,
    };

    const remainingPosts = posts.filter((p) => p.id !== post.id && p.slug !== transSlug);
    ServerStore.saveBlogPosts([updatedOriginal, newTranslatedPost, ...remainingPosts]);

    return NextResponse.json({
      success: true,
      original: updatedOriginal,
      translation: newTranslatedPost,
      message: "Translation retried and linked successfully.",
    });
  } catch (error: any) {
    console.error("[Retry Translation Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Retry translation failed" },
      { status: 500 }
    );
  }
}

