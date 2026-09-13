import { Metadata } from "next";
import ServicesClient from "@/components/ServicesClient";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params?.locale !== "en";
  const locale = isAr ? "ar" : "en";

  const title = isAr
    ? "خدمات الشحن السريع واللوجستيات الدولية | إكس سبيد"
    : "Express Shipping & Global Freight Services | XSPEED";
  const description = isAr
    ? "اكتشف خدمات إكس سبيد اللوجستية المتكاملة: الشحن الجوي السريع، الشحن البحري، النقل البري، التخليص الجمركي بمطار القاهرة، وإدارة التجارة الإلكترونية COD."
    : "Explore comprehensive XSPEED logistics solutions: Express Air Cargo, Ocean Freight, Linehaul Trucking, Customs Clearance, and eCommerce COD Fulfillment.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://exspeeds.com/${locale}/services`,
      languages: {
        ar: "https://exspeeds.com/ar/services",
        en: "https://exspeeds.com/en/services",
        "x-default": "https://exspeeds.com/en/services",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://exspeeds.com/${locale}/services`,
      images: [
        {
          url: "/assets/xspeed_plane.jpg",
          width: 1200,
          height: 800,
          alt: "XSPEED Express Logistics Services",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/xspeed_plane.jpg"],
    },
  };
}

export default function ServicesPage({
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
        "@type": "CollectionPage",
        "@id": `https://exspeeds.com/${locale}/services#webpage`,
        url: `https://exspeeds.com/${locale}/services`,
        name: isAr ? "خدمات إكس سبيد اللوجستية" : "XSPEED Logistics Services",
        description: isAr
          ? "منظومة متكاملة من خدمات الشحن الجوي والبحري والبري والتخليص الجمركي."
          : "Full suite of air, ocean, and land freight forwarding services.",
        inLanguage: isAr ? "ar-EG" : "en-US",
        isPartOf: {
          "@id": "https://exspeeds.com/#website",
        },
      },
      {
        "@type": "ItemList",
        name: isAr ? "قائمة الخدمات اللوجستية" : "Logistics Services Directory",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            url: `https://exspeeds.com/${locale}/services/air-freight`,
            name: isAr ? "الشحن الجوي السريع" : "Express Air Freight",
          },
          {
            "@type": "ListItem",
            position: 2,
            url: `https://exspeeds.com/${locale}/services/ocean-freight`,
            name: isAr ? "الشحن البحري الدولي" : "Ocean Freight Forwarding",
          },
          {
            "@type": "ListItem",
            position: 3,
            url: `https://exspeeds.com/${locale}/services/land-freight`,
            name: isAr ? "النقل البري والشاحنات" : "Land Freight & Trucking",
          },
          {
            "@type": "ListItem",
            position: 4,
            url: `https://exspeeds.com/${locale}/services/customs-clearance`,
            name: isAr ? "التخليص الجمركي واللوجستي" : "Customs Clearance & Brokerage",
          },
          {
            "@type": "ListItem",
            position: 5,
            url: `https://exspeeds.com/${locale}/services/warehousing`,
            name: isAr ? "التخزين وسلاسل الإمداد" : "Warehousing & Supply Chain",
          },
          {
            "@type": "ListItem",
            position: 6,
            url: `https://exspeeds.com/${locale}/services/ecommerce-fulfillment`,
            name: isAr ? "حلول التجارة الإلكترونية والدفع عند الاستلام" : "eCommerce Fulfillment & COD",
          },
        ],
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
            name: isAr ? "الخدمات" : "Services",
            item: `https://exspeeds.com/${locale}/services`,
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
      <ServicesClient />
    </>
  );
}
