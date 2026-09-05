import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("xspeed_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false, user: null });
    }

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

    if (!sessionData) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        name: sessionData.name,
        email: sessionData.email,
        role: sessionData.role,
        phone: sessionData.phone || "",
        company: sessionData.company || "",
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
