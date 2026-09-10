import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = ['ar', 'en'];
const DEFAULT_LOCALE = 'ar';
const STORAGE_KEY = 'xspeed_language';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/wordpress') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\.(png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|woff|woff2|ttf|eot|pdf|txt|xml)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const currentLocale = pathname.split("/")[1];
    const cookieLocale = request.cookies.get(STORAGE_KEY)?.value;

    const response = NextResponse.next();
    if (cookieLocale !== currentLocale && LOCALES.includes(currentLocale)) {
      response.cookies.set(STORAGE_KEY, currentLocale, {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      });
    }
    return response;
  }

  // Detect preferred locale: Cookie > Accept-Language > Default (ar)
  let detectedLocale = DEFAULT_LOCALE;
  const cookieLocale = request.cookies.get(STORAGE_KEY)?.value;

  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    detectedLocale = cookieLocale;
  } else {
    const acceptLanguage = request.headers.get("accept-language") || "";
    if (acceptLanguage.toLowerCase().includes("en") && !acceptLanguage.toLowerCase().startsWith("ar")) {
      detectedLocale = "en";
    }
  }

  // Redirect to localized path
  const targetPath = pathname === "/" ? "" : pathname;
  const redirectUrl = new URL(`/${detectedLocale}${targetPath}${request.nextUrl.search}`, request.url);

  const response = NextResponse.redirect(redirectUrl, 307);
  response.cookies.set(STORAGE_KEY, detectedLocale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};