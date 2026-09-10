import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, googleId, avatar } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const userPayload: {
      name: string;
      email: string;
      role: "admin" | "user";
      avatar: string | null;
      googleId: string | null;
      provider: string;
    } = {
      name: name || cleanEmail.split("@")[0],
      email: cleanEmail,
      role: "user",
      avatar: avatar || null,
      googleId: googleId || null,
      provider: "google",
    };

    // Forward to backend Laravel API if configured and external
    try {
      const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000/api";
      if (backendUrl && !backendUrl.includes("exspeeds.com/api")) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(`${backendUrl}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: userPayload.name,
            email: userPayload.email,
            google_id: googleId,
            avatar,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json.data?.user) {
            userPayload.name = json.data.user.name;
            userPayload.email = json.data.user.email;
            userPayload.role = json.data.user.role === "admin" ? "admin" : "user";
          }
        }
      }
    } catch {
      // Offline fallback succeeds with local Google user payload
    }

    const response = NextResponse.json({
      success: true,
      user: userPayload,
    });

    // Set authorization session cookies
    const sessionPayload = JSON.stringify({
      ...userPayload,
      loggedInAt: new Date().toISOString(),
    });

    response.cookies.set("xspeed_session", encodeURIComponent(sessionPayload), {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });

    response.cookies.set("xspeed_user", "authenticated", {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });

    if (userPayload.role === "admin") {
      response.cookies.set("xspeed_admin_auth", "authenticated", {
        path: "/",
        maxAge: 604800,
        sameSite: "lax",
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to authenticate with Google" }, { status: 500 });
  }
}
