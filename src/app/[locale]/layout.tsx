import { Inter, JetBrains_Mono, Cairo } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import NextAuthProvider from "@/components/NextAuthProvider";
import FloatingWidgets from "@/components/FloatingWidgets";
import { Metadata } from "next";
import { Locale } from "@/locales";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "600", "700"],
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
  weight: ["400", "600", "700", "800", "900"],
});

export function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const isAr = locale === "ar";

  const titleDefault = isAr
    ? "إكس سبيد — منصة وتكنولوجيا الشحن اللوجستي السريع"
    : "XSPEED — Express Logistics & Technology Platform";
  const titleTemplate = isAr ? "%s | إكس سبيد" : "%s | XSPEED";
  const description = isAr
    ? "أسرع خدمات الشحن والتوصيل الإقليمي والدولي. إرسال فوري مؤتمت، تتبع ذكي بالوقت الفعلي، ورؤية شاملة لسلاسل الإمداد عبر أكثر من 220 وجهة عالمية."
    : "The fastest regional express delivery. Automated dispatching, real-time tracking, and full supply chain visibility across 220+ global branches.";

  const keywords = isAr
    ? [
        "شحن سريع مصر",
        "لوجستيات الخليج",
        "تتبع الشحنات",
        "تخليص جمركي",
        "شحن دولي القاهرة",
        "سلاسل إمداد ذكية",
        "شحن بضائع السعودية والإمارات",
      ]
    : [
        "express logistics",
        "freight forwarding",
        "courier dispatch",
        "customs clearance",
        "Egypt cargo",
        "GCC freight",
        "cargo tracking",
        "supply chain technology",
      ];

  return {
    metadataBase: new URL("https://exspeeds.com"),
    title: {
      default: titleDefault,
      template: titleTemplate,
    },
    description,
    keywords,
    authors: [{ name: "XSPEED Logistics", url: "https://exspeeds.com" }],
    creator: "XSPEED Logistics",
    publisher: "XSPEED Logistics",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: "https://exspeeds.com/" + locale,
      languages: {
        ar: "https://exspeeds.com/ar",
        en: "https://exspeeds.com/en",
        "x-default": "https://exspeeds.com/en",
      },
    },
    openGraph: {
      title: titleDefault,
      description,
      url: "https://exspeeds.com/" + locale,
      siteName: isAr ? "إكس سبيد للخدمات اللوجستية" : "XSPEED Logistics",
      locale: isAr ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: "/assets/xspeed_about_showcase.jpg",
          width: 1200,
          height: 896,
          alt: "XSPEED Express Logistics Fleet",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
      images: ["/assets/xspeed_about_showcase.jpg"],
      creator: "@xspeed_express",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "QD1ZGw9Lxk-ITk35fNXbhrZ66LuV0-EOuMcpLFOnjAM",
    },
  };
}

export default function RootLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="scroll-smooth">
      <head>
        <link rel="icon" href="/assets/Favlogo-DSIHncWK.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://exspeeds.com/#organization",
                  name: "XSPEED Logistics",
                  alternateName: "exspeeds.com",
                  url: "https://exspeeds.com",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://exspeeds.com/assets/Favlogo-DSIHncWK.png",
                    width: "512",
                    height: "512",
                  },
                  contactPoint: {
                    "@type": "ContactPoint",
                    telephone: "+201208027171",
                    contactType: "customer service",
                    email: "sales@exspeeds.com",
                    areaServed: ["EG", "SA", "AE", "KW", "QA", "Worldwide"],
                    availableLanguage: ["Arabic", "English"],
                  },
                  sameAs: [
                    "https://web.facebook.com/profile.php?id=61561241436901",
                    "https://wa.me/201208027171",
                  ],
                  description:
                    "The fastest regional express delivery and logistics technology platform across Egypt and GCC.",
                },
                {
                  "@type": "LocalBusiness",
                  "@id": "https://exspeeds.com/#localbusiness",
                  name: locale === "ar" ? "إكس سبيد للشحن السريع واللوجستيات" : "XSPEED Express Logistics Hub",
                  image: "https://exspeeds.com/assets/xspeed_about_showcase.jpg",
                  telephone: "+201208027171",
                  email: "sales@exspeeds.com",
                  priceRange: "$$",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: locale === "ar" ? "٧ ركن الصفا من خالد امين، العريش، الهرم" : "7 Rokn El Safa, Off Khaled Amin, El Arish, Al Haram",
                    addressLocality: "Giza",
                    addressRegion: "Giza Governorate",
                    postalCode: "12555",
                    addressCountry: "EG",
                  },
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: 30.0055,
                    longitude: 31.1715,
                  },
                  openingHoursSpecification: [
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                      ],
                      opens: "00:00",
                      closes: "23:59",
                    },
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://exspeeds.com/#website",
                  url: "https://exspeeds.com/" + locale,
                  inLanguage: locale === "ar" ? "ar-EG" : "en-US",
                  name: "XSPEED Logistics",
                  publisher: {
                    "@id": "https://exspeeds.com/#organization",
                  },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://exspeeds.com/" + locale + "/blog?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`bg-white text-xspeed-dark font-body flex flex-col min-h-screen antialiased ${inter.variable} ${jetbrainsMono.variable} ${cairo.variable} font-sans`}
      >
        <NextAuthProvider>
          <LanguageProvider initialLocale={locale}>
            <AuthProvider>
              {children}
              <FloatingWidgets />
            </AuthProvider>
          </LanguageProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}