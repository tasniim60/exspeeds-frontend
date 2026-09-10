"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t, getLocalizedPath } = useLanguage();

  return (
    <footer className="bg-[#251516] text-white border-t border-gray-800">
      <div className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Link href={getLocalizedPath("/")} className="inline-block py-1 shrink-0">
              <img
                src="/assets/xspeed_logo_earth_dark.jpg"
                alt="XSPEED Express Logistics"
                width={280}
                height={164}
                className="h-20 w-auto object-cover rounded-md"
                />
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
              {t("footer.companySummary")}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-4">
            {/* Facebook */}
            <a
              href="https://web.facebook.com/profile.php?id=61561241436901"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook - XSPEED Logistics"
              className="p-2 rounded-lg bg-white/[0.08] hover:bg-xspeed-orange transition-colors group"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-300 group-hover:text-white transition-colors" aria-hidden="true">
                <path d="M13.5 22v-8h2.7l.4-3h-3.1V7.5c0-.9.3-1.5 1.6-1.5H16V3.2c-.3 0-1.3-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2V11H7v3h2.5v8h4Z" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/201208027171"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp - XSPEED Logistics Support"
              className="p-2 rounded-lg bg-white/[0.08] hover:bg-[#25D366] transition-colors group"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-300 group-hover:text-white transition-colors" aria-hidden="true">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>

            {/* Email */}
            <a href="mailto:sales@exspeeds.com" aria-label="Email - sales@exspeeds.com" className="p-2 rounded-lg bg-white/[0.08] hover:bg-xspeed-orange transition-colors group">
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
                  href={getLocalizedPath(link.href)}
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
                  href={getLocalizedPath(link.href)}
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
              <a href="tel:+201208027171" className="hover:text-xspeed-orange transition-colors" dir="ltr">
                +20 120 802 7171
              </a>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-xspeed-orange">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <a href="mailto:sales@exspeeds.com" className="hover:text-xspeed-orange transition-colors">
                sales@exspeeds.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} XSPEED Express Logistics & Technology (exspeeds.com). {t("footer.allRightsReserved")}</p>
          <div className="flex gap-6">
            <Link href={getLocalizedPath("/privacy")} className="hover:text-xspeed-orange transition-colors">{t("footer.privacyPolicy")}</Link>
            <Link href={getLocalizedPath("/terms")} className="hover:text-xspeed-orange transition-colors">{t("footer.termsOfService")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
