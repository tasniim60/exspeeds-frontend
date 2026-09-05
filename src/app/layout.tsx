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

export const metadata = {
  title: "XSPEED — Express Logistics & Technology Platform",
  description:
    "The fastest regional express delivery. Automated dispatching, real-time tracking, and full supply chain visibility across 250+ global branches.",
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
