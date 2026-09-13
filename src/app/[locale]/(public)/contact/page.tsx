import { Metadata } from "next";
import ContactClient from "@/components/ContactClient";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params?.locale !== "en";
  const locale = isAr ? "ar" : "en";

  const title = isAr
    ? "اتصل بنا | إكس سبيد لخدمات الشحن والعمليات اللوجستية"
    : "Contact Us | XSPEED Logistics Operations & Support";
  const description = isAr
    ? "تواصل مباشرة مع مكتب عمليات إكس سبيد لخدمات الشحن السريع على مدار 24/7 عبر الهاتف والواتساب، أو قم بزيارة مقرنا بالهرم، الجيزة."
    : "Contact XSPEED Logistics 24/7 operations and freight dispatch desk via phone and WhatsApp, or visit our headquarters in Giza, Egypt.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://exspeeds.com/${locale}/contact`,
      languages: {
        ar: "https://exspeeds.com/ar/contact",
        en: "https://exspeeds.com/en/contact",
        "x-default": "https://exspeeds.com/en/contact",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://exspeeds.com/${locale}/contact`,
      images: [
        {
          url: "/assets/xspeed_contact_header.jpg",
          width: 1200,
          height: 800,
          alt: "Contact XSPEED Logistics Support",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/xspeed_contact_header.jpg"],
    },
  };
}

export default function ContactPage({
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
        "@type": "ContactPage",
        "@id": `https://exspeeds.com/${locale}/contact#webpage`,
        url: `https://exspeeds.com/${locale}/contact`,
        name: isAr ? "اتصل بنا | إكس سبيد" : "Contact Us | XSPEED Logistics",
        inLanguage: isAr ? "ar-EG" : "en-US",
        isPartOf: {
          "@id": "https://exspeeds.com/#website",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: isAr ? "كيف يمكنني تتبع شحنتي فوراً؟" : "How can I track my shipment immediately?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isAr
                ? "يمكنك إدخال رقم بوليصة الشحن (AWB) في صفحة التتبع بموقعنا أو إرسال رقم الشحنة مباشرة لفريق الدعم عبر الواتساب لتلقي تقرير حي خلال دقائق."
                : "You can enter your Air Waybill (AWB) number on our tracking page or message our operations team directly on WhatsApp for an instant status update.",
            },
          },
          {
            "@type": "Question",
            name: isAr ? "ما هي المستندات المطلوبة للتخليص الجمركي الدولي؟" : "What documents are required for international customs clearance?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isAr
                ? "المستندات الأساسية تشمل الفاتورة التجارية الأصلية، قائمة التعبئة (Packing List)، بوليصة الشحن، ورقم التسجيل المسبق للشحنات ACI في حالة الاستيراد لمصر."
                : "Standard requirements include the Commercial Invoice, Packing List, Bill of Lading / AWB, and the ACI registration number for Egyptian import shipments.",
            },
          },
          {
            "@type": "Question",
            name: isAr ? "ما هي سرعة الاستلام وتوصيل الشحنات العاجلة؟" : "How quickly can XSPEED arrange express pickup?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isAr
                ? "نوفر خدمة الاستلام في نفس اليوم (Same-Day Pickup) في القاهرة والجيزة والمناطق الصناعية، وجدولة الشحن على أقرب رحلة طيران مباشرة."
                : "We provide same-day scheduled pickups across Cairo, Giza, and major logistics zones, dispatched on the next available commercial or charter flight.",
            },
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
            name: isAr ? "اتصل بنا" : "Contact Us",
            item: `https://exspeeds.com/${locale}/contact`,
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
      <ContactClient />
    </>
  );
}
