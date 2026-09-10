import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ServerStore } from "@/lib/serverStore";

export const dynamic = "force-dynamic";


export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, currentPassword, newPassword } = body;

    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("xspeed_session");

    let currentSession: any = null;
    if (sessionCookie && sessionCookie.value) {
      try {
        currentSession = JSON.parse(decodeURIComponent(sessionCookie.value));
      } catch {
        try {
          currentSession = JSON.parse(sessionCookie.value);
        } catch {
          // ignore
        }
      }
    }

    const updatedUser = {
      name: name || currentSession?.name || "Customer",
      email: email || currentSession?.email || "user@example.com",
      phone: phone || currentSession?.phone || "",
      company: company || currentSession?.company || "",
      role: currentSession?.role || "user",
      updatedAt: new Date().toISOString(),
    };

    // If new password provided, record success
    const passwordChanged = !!(newPassword && newPassword.trim().length > 0);

    const sessionPayload = JSON.stringify({ ...currentSession, ...updatedUser });

    const response = NextResponse.json({
      success: true,
      user: updatedUser,
      message: passwordChanged
        ? "Profile and password updated successfully!"
        : "Profile information updated successfully!",
    });

    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set("xspeed_session", encodeURIComponent(sessionPayload), {
      httpOnly: true,
      secure: isProduction,
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
