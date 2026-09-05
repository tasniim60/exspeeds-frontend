"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#251516] text-white border-t border-gray-800">
      <div className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-5">
          <Link href="/" className="inline-block py-1">
            <img
              src="/assets/xspeed_logo_earth_dark.jpg"
              alt="XSPEED Express Logistics"
              width={180}
              height={64}
              style={{ aspectRatio: "180 / 64" }}
              className="h-16 w-auto object-contain rounded-md"
            />
          </Link>
          <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
            {t("footer.companySummary")}
          </p>
          <div className="flex items-center gap-3 pt-1">
            {/* LinkedIn */}
            <a href="#" aria-label="LinkedIn" className="p-2 rounded-lg bg-white/[0.08] hover:bg-xspeed-orange transition-colors group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-white transition-colors">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            {/* Twitter/X */}
            <a href="#" aria-label="Twitter" className="p-2 rounded-lg bg-white/[0.08] hover:bg-xspeed-orange transition-colors group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-white transition-colors">
                <path d="M4 4l11.733 16h4.267l-11.733-16z" />
                <path d="M4 20l6.768-6.768" />
                <path d="M20 4l-6.768 6.768" />
              </svg>
            </a>
            {/* Email */}
            <a href="mailto:info@exspeeds.com" aria-label="Email" className="p-2 rounded-lg bg-white/[0.08] hover:bg-xspeed-orange transition-colors group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-white transition-colors">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-bold text-white mb-5 tracking-wide border-b border-xspeed-orange/40 pb-2 inline-block">
            {t("footer.quickLinks")}
          </h3>
          <ul className="space-y-3 text-sm">
            {[
              { name: t("nav.home"), href: "/" },
              { name: t("nav.about"), href: "/about" },
              { name: t("nav.services"), href: "/services" },
              { name: t("nav.blog"), href: "/blog" },
              { name: t("nav.contact"), href: "/contact" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-gray-300 hover:text-xspeed-orange transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Portal Links */}
        <div>
          <h3 className="text-sm font-bold text-white mb-5 tracking-wide border-b border-xspeed-orange/40 pb-2 inline-block">
            {t("client.dashboard.title")}
          </h3>
          <ul className="space-y-3 text-sm">
            {[
              { name: t("nav.track"), href: "/track" },
              { name: t("nav.requestShipment"), href: "/ship" },
              { name: t("nav.signIn"), href: "/login" },
              { name: t("nav.register"), href: "/register" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-gray-300 hover:text-xspeed-orange transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Operations Desk */}
        <div>
          <h3 className="text-sm font-bold text-white mb-5 tracking-wide border-b border-xspeed-orange/40 pb-2 inline-block">
            {t("footer.supportTitle")}
          </h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3 text-gray-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0 text-xspeed-orange">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{t("footer.cairoAirportHub")}</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-xspeed-orange">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span dir="ltr">+20 120 802 7171</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-xspeed-orange">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>info@exspeeds.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} XSPEED Logistics & Technology Solutions. {t("footer.allRightsReserved")}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-200 transition-colors">{t("footer.privacyPolicy")}</a>
            <a href="#" className="hover:text-gray-200 transition-colors">{t("footer.termsOfService")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
