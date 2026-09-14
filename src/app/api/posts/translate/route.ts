import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY || "c1dd229f-c9a2-4cfd-9090-dcb1cffa6475:fx";
const DEEPL_ENDPOINT = "https://api-free.deepl.com/v2";

/**
 * Normalize language parameter for DeepL API
 */
function normalizeLang(lang: string, isTarget: boolean = false): string {
  const upper = (lang || "").toUpperCase().trim();
  if (upper.startsWith("AR")) return "AR";
  if (upper.startsWith("EN")) return isTarget ? "EN-US" : "EN";
  return upper;
}

/**
 * Helper to call DeepL translate API
 */
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
    const errorText = await res.text();
    throw new Error(`DeepL API error (${res.status}): ${errorText}`);
  }

  const json = await res.json();
  return json.translations?.[0]?.text || text;
}

/**
 * GET /api/posts/translate -> Returns live DeepL character usage
 */
export async function GET() {
  try {
    const res = await fetch(`${DEEPL_ENDPOINT}/usage`, {
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        usage: { character_count: 0, character_limit: 1000000, percentage: 0, remaining: 1000000 },
      });
    }

    const data = await res.json();
    const count = data.character_count || 0;
    const limit = data.character_limit || 1000000;
    const percent = limit > 0 ? Number(((count / limit) * 100).toFixed(2)) : 0;

    return NextResponse.json({
      success: true,
      usage: {
        character_count: count,
        character_limit: limit,
        remaining: Math.max(0, limit - count),
        percentage: percent,
        status: "online",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      usage: {
        character_count: 0,
        character_limit: 1000000,
        percentage: 0,
        remaining: 1000000,
        status: "offline",
      },
    });
  }
}

/**
 * POST /api/posts/translate -> Translates title, excerpt, focusKeyword, and content
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, excerpt, content, focusKeyword, sourceLang = "ar" } = body;

    const src = sourceLang.toLowerCase() === "en" ? "en" : "ar";
    const tgt = src === "ar" ? "en" : "ar";

    if (!title && !content) {
      return NextResponse.json(
        { success: false, error: "Title or content is required to translate." },
        { status: 400 }
      );
    }

    // Parallel translation of fields
    const [translatedTitle, translatedExcerpt, translatedKeyword, translatedContent] = await Promise.all([
      title ? translateDeepL(title, src, tgt, false) : Promise.resolve(""),
      excerpt ? translateDeepL(excerpt, src, tgt, false) : Promise.resolve(""),
      focusKeyword ? translateDeepL(focusKeyword, src, tgt, false) : Promise.resolve(""),
      content ? translateDeepL(content, src, tgt, true) : Promise.resolve(""),
    ]);

    // Generate translated slug
    const translatedSlug = translatedTitle
      ? translatedTitle
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : "";

    // Fetch live usage in background/alongside
    let usage = null;
    try {
      const usageRes = await fetch(`${DEEPL_ENDPOINT}/usage`, {
        headers: { Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}` },
      });
      if (usageRes.ok) {
        const uData = await usageRes.json();
        const count = uData.character_count || 0;
        const limit = uData.character_limit || 1000000;
        usage = {
          character_count: count,
          character_limit: limit,
          remaining: Math.max(0, limit - count),
          percentage: limit > 0 ? Number(((count / limit) * 100).toFixed(2)) : 0,
        };
      }
    } catch {}

    return NextResponse.json({
      success: true,
      sourceLang: src,
      targetLang: tgt,
      translated: {
        title: translatedTitle,
        slug: translatedSlug,
        excerpt: translatedExcerpt,
        focusKeyword: translatedKeyword,
        content: translatedContent,
      },
      usage,
    });
  } catch (error: any) {
    console.error("[DeepL API Route] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to translate via DeepL" },
      { status: 500 }
    );
  }
}

