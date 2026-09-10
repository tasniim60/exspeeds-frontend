import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { Customer } from "@/lib/adminData";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, company, country, city, address } = body;

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || "").trim();
    const cleanPhone = (phone || "").trim();
    const cleanCompany = (company || "").trim();
    const cleanCountry = (country || "Egypt").trim();
    const cleanCity = (city || "Cairo").trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!cleanName) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400 }
      );
    }

    // Check / Add Customer in ServerStore
    const existingCustomers = ServerStore.getCustomers();
    let customer = existingCustomers.find((c) => c.email.toLowerCase() === cleanEmail);

    if (!customer) {
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        code: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: cleanName,
        company: cleanCompany || cleanName,
        email: cleanEmail,
        phone: cleanPhone || "+20 100 000 0000",
        country: cleanCountry,
        city: cleanCity,
        tier: "Standard Shipper",
        creditLimit: 2500,
        currentBalance: 0,
        totalShipments: 0,
        lifetimeSpend: 0,
        taxRegistrationNumber: `TRN-${Math.floor(100000000 + Math.random() * 900000000)}`,
        assignedManager: "Operations Desk",
        activeContracts: 1,
        joinedDate: new Date().toISOString().split("T")[0],
        status: "Active",
      };
      customer = ServerStore.addCustomer(newCustomer);
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const role: "admin" | "user" = cleanEmail.includes("admin") ? "admin" : "user";

    const sessionPayload = {
      name: cleanName,
      email: cleanEmail,
      role,
      phone: cleanPhone,
      company: cleanCompany,
      token,
      loggedInAt: new Date().toISOString(),
    };

    const sessionString = JSON.stringify(sessionPayload);
    const response = NextResponse.json({
      success: true,
      user: {
        name: cleanName,
        email: cleanEmail,
        role,
        phone: cleanPhone,
        company: cleanCompany,
      },
      token,
    });

    // Set secure session HTTP-only cookies
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set("xspeed_session", sessionString, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 86400 * 7, // 7 days
    });

    response.cookies.set("xspeed_user", "authenticated", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 86400 * 7,
    });

    if (role === "admin") {
      response.cookies.set("xspeed_admin_auth", "authenticated", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 86400 * 7,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
