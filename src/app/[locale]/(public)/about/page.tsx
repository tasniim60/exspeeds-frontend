import { Metadata } from "next";
import AboutClient from "@/components/AboutClient";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params?.locale !== "en";
  const locale = isAr ? "ar" : "en";

  const title = isAr
    ? "من نحن | إكس سبيد لخدمات الشحن واللوجستيات"
    : "About Us | XSPEED Logistics & Supply Chain";
  const description = isAr
    ? "تعرف على شركة إكس سبيد للشحن السريع، شبكة أسطولنا، معايير الأمان والدقة، والتزامنا بتقديم أعلى مستويات الخدمة اللوجستية محلياً ودولياً."
    : "Learn about XSPEED Express Logistics, our high-velocity fleet, supply chain technology, and commitment to precision delivery across Egypt and 220+ countries.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://exspeeds.com/${locale}/about`,
      languages: {
        ar: "https://exspeeds.com/ar/about",
        en: "https://exspeeds.com/en/about",
        "x-default": "https://exspeeds.com/en/about",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://exspeeds.com/${locale}/about`,
      images: [
        {
          url: "/assets/xspeed_about_showcase.jpg",
          width: 1200,
          height: 896,
          alt: "About XSPEED Express Logistics",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/xspeed_about_showcase.jpg"],
    },
  };
}

export default function AboutPage({
  params,
}: {
  params: { locale: string };
}) {
  const isAr = params?.locale !== "en";
  const locale = isAr ? "ar" : "en";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `https://exspeeds.com/${locale}/about#webpage`,
        url: `https://exspeeds.com/${locale}/about`,
        name: isAr ? "من نحن | إكس سبيد" : "About Us | XSPEED Logistics",
        description: isAr
          ? "رؤية ورسالة وقيم إكس سبيد في قيادة قطاع الشحن السريع واللوجستيات الذكية."
          : "Mission, vision, and core values of XSPEED Logistics leading global express freight.",
        inLanguage: isAr ? "ar-EG" : "en-US",
        isPartOf: {
          "@id": "https://exspeeds.com/#website",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: isAr ? "الرئيسية" : "Home",
            item: `https://exspeeds.com/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: isAr ? "من نحن" : "About Us",
            item: `https://exspeeds.com/${locale}/about`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  );
}
