import { MetadataRoute } from "next";
import { getPosts, FALLBACK_POSTS_AR, FALLBACK_POSTS_EN } from "@/lib/wordpress";

const BASE_URL = "https://exspeeds.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", priority: 1.0, changefreq: "daily" as const },
    { path: "/about", priority: 0.8, changefreq: "monthly" as const },
    { path: "/services", priority: 0.9, changefreq: "weekly" as const },
    { path: "/services/air-freight", priority: 0.9, changefreq: "weekly" as const },
    { path: "/services/sea-freight", priority: 0.9, changefreq: "weekly" as const },
    { path: "/services/land-freight", priority: 0.8, changefreq: "weekly" as const },
    { path: "/services/customs-clearance", priority: 0.9, changefreq: "weekly" as const },
    { path: "/services/warehousing", priority: 0.8, changefreq: "weekly" as const },
    { path: "/services/ecommerce-fulfillment", priority: 0.8, changefreq: "weekly" as const },
    { path: "/blog", priority: 0.9, changefreq: "daily" as const },
    { path: "/track", priority: 0.9, changefreq: "always" as const },
    { path: "/ship", priority: 0.8, changefreq: "weekly" as const },
    { path: "/contact", priority: 0.7, changefreq: "monthly" as const },
    { path: "/privacy", priority: 0.5, changefreq: "yearly" as const },
    { path: "/terms", priority: 0.5, changefreq: "yearly" as const },
  ];

  const now = new Date().toISOString();

  // Generate static page entries for both locales
  const staticEntries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    for (const locale of ["ar", "en"]) {
      const url = `${BASE_URL}/${locale}${route.path}`;
      staticEntries.push({
        url,
        lastModified: now,
        changeFrequency: route.changefreq,
        priority: route.priority,
        alternates: {
          languages: {
            ar: `${BASE_URL}/ar${route.path}`,
            en: `${BASE_URL}/en${route.path}`,
            "x-default": `${BASE_URL}/en${route.path}`,
          },
        },
      });
    }
  }

  // Fetch all posts
  let postsAr = FALLBACK_POSTS_AR;
  let postsEn = FALLBACK_POSTS_EN;

  try {
    const [fetchedAr, fetchedEn] = await Promise.all([
      getPosts(100, "ar"),
      getPosts(100, "en"),
    ]);
    if (fetchedAr && fetchedAr.length > 0) postsAr = fetchedAr;
    if (fetchedEn && fetchedEn.length > 0) postsEn = fetchedEn;
  } catch {
    // fallback
  }

  // Combine unique slugs
  const slugSet = new Set<string>();
  postsAr.forEach((p) => slugSet.add(p.slug));
  postsEn.forEach((p) => slugSet.add(p.slug));

  const postEntries: MetadataRoute.Sitemap = [];
  slugSet.forEach((slug) => {
    for (const locale of ["ar", "en"]) {
      postEntries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            ar: `${BASE_URL}/ar/blog/${slug}`,
            en: `${BASE_URL}/en/blog/${slug}`,
            "x-default": `${BASE_URL}/en/blog/${slug}`,
          },
        },
      });
    }
  });

  return [...staticEntries, ...postEntries];
}