import { Metadata } from "next";
import ShipClient from "@/components/ShipClient";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params?.locale !== "en";
  const locale = isAr ? "ar" : "en";

  const title = isAr
    ? "طلب حجز شحنة سريعة | إكس سبيد للخدمات اللوجستية"
    : "Book an Express Consignment | XSPEED Logistics";
  const description = isAr
    ? "احجز شحنتك الآن في خطوات بسيطة. احصل على أفضل أسعار الشحن الدولي والمحلي للشحنات التجارية والطرود السريعة مباشرة عبر إكس سبيد."
    : "Book your freight or express consignment in a few easy steps. Real-time rate estimates and direct coordination with XSPEED dispatch team.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://exspeeds.com/${locale}/ship`,
      languages: {
        ar: "https://exspeeds.com/ar/ship",
        en: "https://exspeeds.com/en/ship",
        "x-default": "https://exspeeds.com/en/ship",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://exspeeds.com/${locale}/ship`,
      images: [
        {
          url: "/assets/xspeed_about_showcase.jpg",
          width: 1200,
          height: 896,
          alt: "Ship with XSPEED Logistics",
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

export default function ShipPage({
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
        "@type": "WebPage",
        "@id": `https://exspeeds.com/${locale}/ship#webpage`,
        url: `https://exspeeds.com/${locale}/ship`,
        name: isAr ? "حجز طلب شحن" : "Book a Shipment",
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
            name: isAr ? "حجز شحن" : "Book Shipment",
            item: `https://exspeeds.com/${locale}/ship`,
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
      <ShipClient />
    </>
  );
}
