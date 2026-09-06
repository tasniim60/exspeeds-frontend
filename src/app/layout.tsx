import { Inter, JetBrains_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import NextAuthProvider from "@/components/NextAuthProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "optional",
  variable: "--font-inter",
  weight: ["400", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "optional",
  variable: "--font-jetbrains",
  weight: ["400", "600", "700"],
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "optional",
  variable: "--font-cairo",
  weight: ["400", "600", "700", "800", "900"],
});

import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://exspeeds.com"),
  title: {
    default: "XSPEED — Express Logistics & Technology Platform",
    template: "%s | XSPEED",
  },
  description:
    "The fastest regional express delivery. Automated dispatching, real-time tracking, and full supply chain visibility across 250+ global branches.",
  keywords: [
    "express logistics",
    "freight forwarding",
    "courier dispatch",
    "customs clearance",
    "Egypt cargo",
    "GCC freight",
    "cargo tracking",
    "cross-docking",
    "supply chain technology",
  ],
  authors: [{ name: "XSPEED Logistics", url: "https://exspeeds.com" }],
  creator: "XSPEED Logistics",
  publisher: "XSPEED Logistics",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "XSPEED — Express Logistics & Technology Platform",
    description:
      "The fastest regional express delivery. Automated dispatching, real-time tracking, and full supply chain visibility across 250+ global branches.",
    url: "https://exspeeds.com",
    siteName: "XSPEED Logistics",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/assets/Home-pic1-C9kYJzAW.jpg",
        width: 1200,
        height: 630,
        alt: "XSPEED Express Logistics Fleet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "XSPEED — Express Logistics & Technology Platform",
    description:
      "The fastest regional express delivery. Automated dispatching, real-time tracking, and full supply chain visibility across 250+ global branches.",
    images: ["/assets/Home-pic1-C9kYJzAW.jpg"],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className="scroll-smooth">
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
                  "name": "XSPEED Logistics",
                  "url": "https://exspeeds.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://exspeeds.com/assets/Favlogo-DSIHncWK.png",
                  },
                  "description":
                    "The fastest regional express delivery and logistics technology platform across Egypt and GCC.",
                },
                {
                  "@type": "WebSite",
                  "@id": "https://exspeeds.com/#website",
                  "url": "https://exspeeds.com",
                  "name": "XSPEED Logistics",
                  "publisher": {
                    "@id": "https://exspeeds.com/#organization",
                  },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://exspeeds.com/blog?q={search_term_string}",
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
          <LanguageProvider>
            <AuthProvider>{children}</AuthProvider>
          </LanguageProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
