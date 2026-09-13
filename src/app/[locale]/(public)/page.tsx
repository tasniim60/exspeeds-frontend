import { Metadata } from "next";
import { getPosts } from "@/lib/wordpress";
import HomeBlogSection from "@/components/HomeBlogSection";
import HomeCtaSection from "@/components/HomeCtaSection";
import {
  HomeHeroSection,
  HomeStatsSection,
  HomeAboutSection,
  HomeFeaturesSection,
  HomeBlogHeader,
} from "@/components/HomeClientSections";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params?.locale !== "en";
  const locale = isAr ? "ar" : "en";

  const title = isAr
    ? "إكس سبيد — منصة وتكنولوجيا الشحن اللوجستي السريع"
    : "XSPEED — Express Logistics & Freight Technology";
  const description = isAr
    ? "أسرع خدمات الشحن والتوصيل الإقليمي والدولي في مصر والشرق الأوسط. تتبع حي بالوقت الفعلي، أسعار تنافسية، وتغطية شاملة لأكثر من 220 وجهة عالمية."
    : "The fastest regional and international express logistics in Egypt and MENA. Real-time telemetry tracking, competitive freight rates, and 220+ global trade corridors.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://exspeeds.com/${locale}`,
      languages: {
        ar: "https://exspeeds.com/ar",
        en: "https://exspeeds.com/en",
        "x-default": "https://exspeeds.com/en",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://exspeeds.com/${locale}`,
      images: [
        {
          url: "/assets/xspeed_about_showcase.jpg",
          width: 1200,
          height: 896,
          alt: "XSPEED Logistics Operations",
        },
      ],
    },
  };
}

export default async function Home({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale === "en" ? "en" : "ar";
  const posts = await getPosts(6, locale);

  return (
    <main className="min-h-screen bg-white text-[#0F172A]">
      {/* 1. Hero Banner Section with Integrated Track & Ship Hub */}
      <HomeHeroSection />

      {/* 2. Live Animated Stats Section */}
      <HomeStatsSection />

      {/* 3. About XSPEED Section */}
      <HomeAboutSection />

      {/* 4. Features Section */}
      <HomeFeaturesSection />

      {/* 4. Blog Section */}
      <section className="bg-white py-20 section-spacing">
        <div className="max-w-[1400px] mx-auto px-6 space-y-10">
          <HomeBlogHeader />
          <HomeBlogSection initialPosts={posts} />
        </div>
      </section>

      {/* 5. Dynamic Personalized CTA Section */}
      <HomeCtaSection />
    </main>
  );
}