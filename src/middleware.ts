import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Permanent 301 Redirect for Legacy E-commerce Routes (SEO preservation)
  const lowerPath = pathname.toLowerCase();
  const legacyShopPrefixes = [
    "/shop",
    "/product",
    "/products",
    "/product-category",
    "/store",
    "/cart",
    "/checkout",
    "/my-account",
  ];

  if (
    legacyShopPrefixes.some(
      (prefix) => lowerPath === prefix || lowerPath.startsWith(`${prefix}/`)
    )
  ) {
    const rootUrl = new URL("/", request.url);
    return NextResponse.redirect(rootUrl, { status: 301 });
  }

  // 1. Guard Administrative Pages (/admin and subpaths)
  if (pathname.startsWith("/admin")) {
    const adminCookie = request.cookies.get("xspeed_admin_auth")?.value;
    const sessionCookie = request.cookies.get("xspeed_session")?.value;

    let isAdmin = adminCookie === "authenticated";

    if (!isAdmin && sessionCookie) {
      try {
        const decoded = decodeURIComponent(sessionCookie);
        const parsed = JSON.parse(decoded);
        if (parsed?.role === "admin") {
          isAdmin = true;
        }
      } catch {
        // Corrupt or invalid session cookie
      }
    }

    if (!isAdmin) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect Internal Next.js Data Mutation API Endpoints
  const isProtectedApiMutation =
    ["POST", "PUT", "DELETE"].includes(request.method) &&
    (pathname.startsWith("/api/customers") ||
      pathname.startsWith("/api/invoices") ||
      pathname.startsWith("/api/orders") ||
      pathname.startsWith("/api/warehouse"));

  if (isProtectedApiMutation) {
    const userCookie = request.cookies.get("xspeed_user")?.value;
    const adminCookie = request.cookies.get("xspeed_admin_auth")?.value;
    const sessionCookie = request.cookies.get("xspeed_session")?.value;

    const hasValidSession = userCookie === "authenticated" || adminCookie === "authenticated" || !!sessionCookie;

    if (!hasValidSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Authentication session required to perform this action." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/customers/:path*",
    "/api/invoices/:path*",
    "/api/orders/:path*",
    "/api/warehouse/:path*",
    "/shop",
    "/shop/:path*",
    "/product/:path*",
    "/products/:path*",
    "/product-category/:path*",
    "/store",
    "/store/:path*",
    "/cart",
    "/cart/:path*",
    "/checkout",
    "/checkout/:path*",
    "/my-account",
    "/my-account/:path*",
  ],
};
