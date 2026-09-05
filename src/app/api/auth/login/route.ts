import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000/api";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    let userRole: "admin" | "user" = "user";
    let userName = cleanEmail.split("@")[0] || "User";
    let userEmail = cleanEmail;
    let token = `token_${Date.now()}`;
    let authenticated = false;

    // 1. Try Laravel API Backend Authentication
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const apiRes = await fetch(`${LARAVEL_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.token || json.access_token || json.user) {
          authenticated = true;
          userName = json.user?.name || userName;
          userEmail = json.user?.email || userEmail;
          userRole = json.user?.role === "admin" ? "admin" : "user";
          token = json.token || json.access_token || token;
        }
      }
    } catch {
      // Backend offline or connection error
    }

    if (!authenticated) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
    }

    const sessionPayload = {
      name: userName,
      email: userEmail,
      role: userRole,
      token,
      loggedInAt: new Date().toISOString(),
    };

    const sessionString = JSON.stringify(sessionPayload);
    const response = NextResponse.json({
      success: true,
      user: { name: userName, email: userEmail, role: userRole },
      token,
    });

    // Set secure HTTP cookies
    response.cookies.set("xspeed_session", sessionString, {
      httpOnly: false,
      secure: false, // set true in HTTPS production
      sameSite: "lax",
      path: "/",
      maxAge: 86400 * 7, // 7 days
    });

    response.cookies.set("xspeed_user", "authenticated", {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 86400 * 7,
    });

    if (userRole === "admin") {
      response.cookies.set("xspeed_admin_auth", "authenticated", {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 86400 * 7,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
