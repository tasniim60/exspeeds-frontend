import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = ['ar', 'en'];
const DEFAULT_LOCALE = 'ar';
const STORAGE_KEY = 'xspeed_language';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, Next.js system routes, and public files
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

  // Check Authentication Session Cookies (NextAuth or Secure Session)
  const hasAuthSession = Boolean(
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value ||
    request.cookies.get('xspeed_session')?.value
  );

  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const currentLocale = pathname.split("/")[1];
    const subPath = pathname.replace(/^\/(ar|en)/, "") || "/";
    const cookieLocale = request.cookies.get(STORAGE_KEY)?.value;

    // Route Protection: Enforce Private Routes
    if (!hasAuthSession) {
      if (subPath === "/ship" || subPath.startsWith("/ship/")) {
        const loginUrl = new URL(`/${currentLocale}/login?redirect=/ship`, request.url);
        return NextResponse.redirect(loginUrl);
      }
      if (
        subPath === "/profile" ||
        subPath.startsWith("/profile/") ||
        subPath.startsWith("/client") ||
        subPath.startsWith("/admin") ||
        subPath.startsWith("/dashboard") ||
        subPath.startsWith("/wp-admin")
      ) {
        const loginUrl = new URL(`/${currentLocale}/login?redirect=${encodeURIComponent(subPath)}`, request.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    const response = NextResponse.next();
    response.headers.set("Vary", "Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch");

    if (/(login|register|forgot-password)/.test(pathname)) {
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      response.headers.set("Pragma", "no-cache");
    }

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

  // Private route check before redirect
  const targetPath = pathname === "/" ? "" : pathname;
  const isPrivatePath =
    targetPath === "/ship" ||
    targetPath.startsWith("/ship/") ||
    targetPath === "/profile" ||
    targetPath.startsWith("/profile/") ||
    targetPath.startsWith("/client") ||
    targetPath.startsWith("/admin") ||
    targetPath.startsWith("/dashboard") ||
    targetPath.startsWith("/wp-admin");

  if (!hasAuthSession && isPrivatePath) {
    const redirectParam = targetPath === "/ship" ? "/ship" : targetPath;
    const loginUrl = new URL(`/${detectedLocale}/login?redirect=${encodeURIComponent(redirectParam)}`, request.url);
    const response = NextResponse.redirect(loginUrl, 307);
    response.headers.set("Vary", "Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch");
    response.cookies.set(STORAGE_KEY, detectedLocale, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    return response;
  }

  // Redirect to localized path
  const redirectUrl = new URL(`/${detectedLocale}${targetPath}${request.nextUrl.search}`, request.url);

  const response = NextResponse.redirect(redirectUrl, 307);
  response.headers.set("Vary", "Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch");
  if (/(login|register|forgot-password)/.test(pathname)) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");
  }
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