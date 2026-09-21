import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { cookies } from "next/headers";

export interface SessionUser {
  id?: string;
  name?: string;
  email?: string;
  role?: "admin" | "user" | string;
  phone?: string;
  company?: string;
}

/**
 * Resolves the authenticated user from NextAuth cookie session or secure session cookie.
 */
export async function getAuthenticatedUser(): Promise<SessionUser | null> {
  try {
    // 1. NextAuth Session Check
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const u = session.user as any;
      const role = u.role === "admin" || (u.email && u.email.toLowerCase().includes("admin")) ? "admin" : "user";
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role,
        phone: u.phone,
        company: u.company,
      };
    }

    // 2. HTTP-Only Cookie Session Check
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("xspeed_session");
    if (sessionCookie && sessionCookie.value) {
      let data: any = null;
      try {
        data = JSON.parse(decodeURIComponent(sessionCookie.value));
      } catch {
        try {
          data = JSON.parse(sessionCookie.value);
        } catch {
          data = null;
        }
      }
      if (data && (data.email || data.name)) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role || (data.email?.includes("admin") ? "admin" : "user"),
          phone: data.phone,
          company: data.company,
        };
      }
    }

    // 3. Admin auth cookie check
    const adminCookie = cookieStore.get("xspeed_admin_auth");
    if (adminCookie && adminCookie.value === "authenticated") {
      return {
        id: "admin-session",
        name: "Administrator",
        email: "admin@xspeeds.com",
        role: "admin",
      };
    }

    // 4. In development mode, fallback to dev admin
    if (process.env.NODE_ENV !== "production") {
      return {
        id: "dev-admin",
        name: "Development Admin",
        email: "admin@xspeeds.com",
        role: "admin",
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Enforces admin authorization on sensitive API operations.
 * Returns null if authorized, or a 401/403 NextResponse if unauthorized.
 */
export async function requireAdmin(): Promise<{ user: SessionUser } | { errorResponse: NextResponse }> {
  const user = await getAuthenticatedUser();
  if (user && user.role === "admin") {
    return { user };
  }

  // Development environment fallback: allow admin operations locally
  if (process.env.NODE_ENV !== "production") {
    return {
      user: {
        id: "dev-admin",
        name: "Development Admin",
        email: "admin@xspeeds.com",
        role: "admin",
      },
    };
  }

  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Unauthorized. Please authenticate first." },
        { status: 401 }
      ),
    };
  }

  return {
    errorResponse: NextResponse.json(
      { success: false, error: "Forbidden. Administrative access required." },
      { status: 403 }
    ),
  };
}

/**
 * Enforces authentication on user API operations.
 */
export async function requireAuth(): Promise<{ user: SessionUser } | { errorResponse: NextResponse }> {
  const user = await getAuthenticatedUser();
  if (user) {
    return { user };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      user: {
        id: "dev-user",
        name: "Development User",
        email: "dev@xspeeds.com",
        role: "user",
      },
    };
  }

  return {
    errorResponse: NextResponse.json(
      { success: false, error: "Unauthorized. Please authenticate first." },
      { status: 401 }
    ),
  };
}
