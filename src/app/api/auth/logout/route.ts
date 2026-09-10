import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  
  response.cookies.set("xspeed_session", "", { path: "/", maxAge: 0 });
  response.cookies.set("xspeed_user", "", { path: "/", maxAge: 0 });
  response.cookies.set("xspeed_admin_auth", "", { path: "/", maxAge: 0 });
  response.cookies.set("next-auth.session-token", "", { path: "/", maxAge: 0 });
  response.cookies.set("__Secure-next-auth.session-token", "", { path: "/", maxAge: 0 });

  return response;
}
