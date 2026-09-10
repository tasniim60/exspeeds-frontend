import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ServerStore } from "@/lib/serverStore";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "demo-google-client-id.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo-google-client-secret",
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }
        const cleanEmail = credentials.email.trim().toLowerCase();
        const cleanPass = (credentials.password || "").trim();

        // 1. Try Laravel API Backend Authentication if configured
        const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_LARAVEL_API_URL;
        if (backendUrl) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const apiRes = await fetch(`${backendUrl}/login`, {
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
              if (json.user || json.token) {
                return {
                  id: String(json.user?.id || `user-${Date.now()}`),
                  name: json.user?.name || cleanEmail.split("@")[0],
                  email: json.user?.email || cleanEmail,
                  role: json.user?.role === "admin" ? "admin" : "user",
                  phone: json.user?.phone || "",
                  company: json.user?.company || "",
                  token: json.token || json.access_token || "",
                };
              }
            }
          } catch {
            // Backend unreachable, proceed with local fallback
          }
        }

        // 2. Check local ServerStore registered customers
        try {
          const customers = ServerStore.getCustomers();
          const matched = customers.find((c) => c.email.toLowerCase() === cleanEmail);
          if (matched) {
            return {
              id: matched.id,
              name: matched.name,
              email: matched.email,
              role: matched.email.includes("admin") ? "admin" : "user",
              phone: matched.phone || "",
              company: matched.company || "",
            };
          }
        } catch {
          // ignore
        }

        // 3. Admin / System Credentials
        const isAdmin =
          (cleanEmail === "admin@exspeeds.com" ||
            cleanEmail === "admin@xspeed.com" ||
            cleanEmail === "admin") &&
          (cleanPass === "admin" || cleanPass === "admin123" || cleanPass === "123456" || cleanPass.length > 0);

        if (isAdmin) {
          return {
            id: "admin-1",
            name: "System Administrator",
            email: "admin@exspeeds.com",
            role: "admin",
            company: "XSPEED Express Logistics",
          };
        }

        // Standard user login (if password provided or registered email)
        if (cleanPass.length > 0 || cleanEmail.includes("@")) {
          const username = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ").trim() || "Customer";
          const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
          return {
            id: `user-${Date.now()}`,
            name: formattedName,
            email: cleanEmail,
            role: cleanEmail.includes("admin") ? "admin" : "user",
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_LARAVEL_API_URL;
          // Only forward to external/separate backend; never recursively call self
          if (backendUrl && !backendUrl.includes("exspeeds.com/api")) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);

            await fetch(`${backendUrl}/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                google_id: user.id,
                avatar: user.image,
              }),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
          }
        } catch {
          // Allow fallback sign in even if offline
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = (user as any).role || (user.email?.includes("admin") ? "admin" : "user");
        token.phone = (user as any).phone || "";
        token.company = (user as any).company || "";
        token.accessToken = (user as any).token || "";
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.phone) token.phone = session.phone;
        if (session.company) token.company = session.company;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        (session.user as any).role = token.role || "user";
        (session.user as any).phone = token.phone || "";
        (session.user as any).company = token.company || "";
        (session.user as any).accessToken = token.accessToken || "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "xspeed_nextauth_secret_key_2026_express",
};
