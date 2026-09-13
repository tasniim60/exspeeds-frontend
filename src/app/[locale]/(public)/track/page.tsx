import { Metadata } from "next";
import TrackClient from "@/components/TrackClient";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params?.locale !== "en";
  const locale = isAr ? "ar" : "en";

  const title = isAr
    ? "تتبع الشحنات بالوقت الفعلي | إكس سبيد"
    : "Live Real-Time Shipment Tracking | XSPEED";
  const description = isAr
    ? "تتبع شحنتك فورياً برقم بوليصة الشحن (AWB). يدعم تتبع إكس سبيد، DHL، فيديكس، أرامكس، سمسا، والشحن الجوي والبحري الدولي."
    : "Track your international and domestic consignments in real time with your AWB number. Supports XSPEED, DHL, FedEx, Aramex, SMSA, and multi-carrier freight.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://exspeeds.com/${locale}/track`,
      languages: {
        ar: "https://exspeeds.com/ar/track",
        en: "https://exspeeds.com/en/track",
        "x-default": "https://exspeeds.com/en/track",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://exspeeds.com/${locale}/track`,
      images: [
        {
          url: "/assets/xspeed_track_header.jpg",
          width: 1200,
          height: 800,
          alt: "Track Consignment with XSPEED",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/xspeed_track_header.jpg"],
    },
  };
}

export default function TrackPage({
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
        "@id": `https://exspeeds.com/${locale}/track#webpage`,
        url: `https://exspeeds.com/${locale}/track`,
        name: isAr ? "تتبع الشحنات المباشر" : "Real-Time Shipment Tracking Console",
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
            name: isAr ? "تتبع الشحنة" : "Track Consignment",
            item: `https://exspeeds.com/${locale}/track`,
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
      <TrackClient />
    </>
  );
}
