import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Check NextAuth server session via NextAuth cookie
    const session = await getServerSession(authOptions);
    if (session && session.user) {
      const u = session.user as any;
      return NextResponse.json({
        authenticated: true,
        user: {
          id: u.id,
          name: u.name || "Customer",
          email: u.email || "",
          role: u.role || (u.email?.includes("admin") ? "admin" : "user"),
          phone: u.phone || "",
          company: u.company || "",
        },
      });
    }

    // 2. Fallback check for session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("xspeed_session");

    if (sessionCookie && sessionCookie.value) {
      let sessionData: any = null;
      try {
        sessionData = JSON.parse(decodeURIComponent(sessionCookie.value));
      } catch {
        try {
          sessionData = JSON.parse(sessionCookie.value);
        } catch {
          sessionData = null;
        }
      }

      if (sessionData && (sessionData.email || sessionData.name)) {
        return NextResponse.json({
          authenticated: true,
          user: {
            name: sessionData.name,
            email: sessionData.email,
            role: sessionData.role || "user",
            phone: sessionData.phone || "",
            company: sessionData.company || "",
          },
        });
      }
    }

    return NextResponse.json({ authenticated: false, user: null });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
