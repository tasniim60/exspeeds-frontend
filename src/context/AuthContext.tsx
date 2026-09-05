"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import { useSession, signOut } from "next-auth/react";

export interface UserProfile {
  name: string;
  email: string;
  role: "admin" | "user";
  phone?: string;
  company?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (userData: UserProfile) => void;
  loginWithBackend: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: (data: { name: string; email: string; googleId?: string; avatar?: string }) => Promise<boolean>;
  registerWithBackend: (data: { name: string; email: string; password?: string; phone?: string; company?: string; city?: string; country?: string }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updatedData: Partial<UserProfile> & { currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; devCode?: string; token?: string }>;
  resetPassword: (data: { email: string; token: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: nextAuthSession } = useSession();
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("xspeed_user");
        if (stored) return JSON.parse(stored);
        const match = document.cookie.match(/xspeed_session=([^;]+)/);
        if (match && match[1]) {
          return JSON.parse(decodeURIComponent(match[1]));
        }
      } catch {
        // ignore
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (nextAuthSession?.user?.email && (!user || user.email !== nextAuthSession.user.email)) {
      loginWithGoogle({
        name: nextAuthSession.user.name || "Google User",
        email: nextAuthSession.user.email,
        googleId: (nextAuthSession.user as any).id || "google-id",
        avatar: nextAuthSession.user.image || undefined,
      });
    }
  }, [nextAuthSession, user]);

  useEffect(() => {
    const checkSession = async () => {
      // 1. Immediately read from document.cookie or localStorage
      try {
        const match = document.cookie.match(/xspeed_session=([^;]+)/);
        if (match && match[1]) {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          if (parsed && (parsed.name || parsed.email)) {
            setUser(parsed);
          }
        } else {
          const stored = localStorage.getItem("xspeed_user");
          if (stored) {
            setUser(JSON.parse(stored));
          }
        }
      } catch {
        // ignore
      }

      try {
        // 2. Refresh / verify with server API
        const res = await fetch("/api/auth/me", { method: "GET" });
        if (res.ok) {
          const json = await res.json();
          if (json.authenticated && json.user) {
            setUser(json.user);
            localStorage.setItem("xspeed_user", JSON.stringify(json.user));
          }
        }
      } catch {
        // Ignore API fetch errors
      }

      setIsLoading(false);
    };

    checkSession();
    window.addEventListener("storage", checkSession);
    return () => window.removeEventListener("storage", checkSession);
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem("xspeed_user", JSON.stringify(userData));

    const sessionPayload = JSON.stringify({ ...userData, loggedInAt: new Date().toISOString() });
    document.cookie = `xspeed_session=${encodeURIComponent(sessionPayload)}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `xspeed_user=authenticated; path=/; max-age=604800; SameSite=Lax`;

    if (userData.role === "admin") {
      document.cookie = "xspeed_admin_auth=authenticated; path=/; max-age=604800; SameSite=Lax";
    } else {
      document.cookie = "xspeed_admin_auth=; path=/; max-age=0; SameSite=Lax";
    }
  };

  const loginWithBackend = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          setUser(json.user);
          localStorage.setItem("xspeed_user", JSON.stringify(json.user));
          const sessionPayload = JSON.stringify({ ...json.user, loggedInAt: new Date().toISOString() });
          document.cookie = `xspeed_session=${encodeURIComponent(sessionPayload)}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `xspeed_user=authenticated; path=/; max-age=604800; SameSite=Lax`;
          if (json.user.role === "admin") {
            document.cookie = "xspeed_admin_auth=authenticated; path=/; max-age=604800; SameSite=Lax";
          }
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  };

  const registerWithBackend = async (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    company?: string;
    city?: string;
    country?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (res.ok && json.success && json.user) {
        setUser(json.user);
        localStorage.setItem("xspeed_user", JSON.stringify(json.user));
        const sessionPayload = JSON.stringify({ ...json.user, loggedInAt: new Date().toISOString() });
        document.cookie = `xspeed_session=${encodeURIComponent(sessionPayload)}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `xspeed_user=authenticated; path=/; max-age=604800; SameSite=Lax`;
        return { success: true };
      }
      return { success: false, error: json.error || "Registration failed" };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const updateProfile = async (
    updatedData: Partial<UserProfile> & { currentPassword?: string; newPassword?: string }
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const newUser: UserProfile = {
          name: updatedData.name || user?.name || "Customer",
          email: updatedData.email || user?.email || "user@example.com",
          role: user?.role || "user",
          phone: updatedData.phone !== undefined ? updatedData.phone : user?.phone,
          company: updatedData.company !== undefined ? updatedData.company : user?.company,
        };
        setUser(newUser);
        localStorage.setItem("xspeed_user", JSON.stringify(newUser));

        const sessionPayload = JSON.stringify({ ...newUser, loggedInAt: new Date().toISOString() });
        document.cookie = `xspeed_session=${encodeURIComponent(sessionPayload)}; path=/; max-age=604800; SameSite=Lax`;

        return { success: true, message: json.message || "Profile updated successfully!" };
      }
      return { success: false, message: json.error || "Failed to update profile" };
    } catch (err: any) {
      // Local fallback
      if (user) {
        const newUser: UserProfile = {
          ...user,
          name: updatedData.name || user.name,
          email: updatedData.email || user.email,
          phone: updatedData.phone !== undefined ? updatedData.phone : user.phone,
          company: updatedData.company !== undefined ? updatedData.company : user.company,
        };
        setUser(newUser);
        localStorage.setItem("xspeed_user", JSON.stringify(newUser));
        const sessionPayload = JSON.stringify({ ...newUser, loggedInAt: new Date().toISOString() });
        document.cookie = `xspeed_session=${encodeURIComponent(sessionPayload)}; path=/; max-age=604800; SameSite=Lax`;
        return { success: true, message: "Profile updated successfully!" };
      }
      return { success: false, message: err.message || "Network error" };
    }
  };

  const loginWithGoogle = async (data: { name: string; email: string; googleId?: string; avatar?: string }): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          setUser(json.user);
          if (typeof window !== "undefined") {
            localStorage.setItem("xspeed_user", JSON.stringify(json.user));
            const sessionPayload = JSON.stringify({ ...json.user, loggedInAt: new Date().toISOString() });
            document.cookie = `xspeed_session=${encodeURIComponent(sessionPayload)}; path=/; max-age=604800; SameSite=Lax`;
            document.cookie = `xspeed_user=authenticated; path=/; max-age=604800; SameSite=Lax`;
            if (json.user.role === "admin") {
              document.cookie = "xspeed_admin_auth=authenticated; path=/; max-age=604800; SameSite=Lax";
            }
          }
          return true;
        }
      }
    } catch {
      // ignore
    }

    const fallbackUser: UserProfile = {
      name: data.name || "Google Shipper User",
      email: data.email || "google.user@exspeeds.com",
      role: "user",
    };
    setUser(fallbackUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("xspeed_user", JSON.stringify(fallbackUser));
      const sessionPayload = JSON.stringify({ ...fallbackUser, loggedInAt: new Date().toISOString() });
      document.cookie = `xspeed_session=${encodeURIComponent(sessionPayload)}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `xspeed_user=authenticated; path=/; max-age=604800; SameSite=Lax`;
    }
    return true;
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message?: string; devCode?: string; token?: string }> => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, message: json.message, devCode: json.devCode, token: json.token };
      }
      return { success: false, message: json.error || "Failed to process forgot password request" };
    } catch (err: any) {
      return { success: false, message: err.message || "Network error" };
    }
  };

  const resetPassword = async (data: { email: string; token: string; password: string }): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, message: json.message };
      }
      return { success: false, message: json.error || "Failed to reset password" };
    } catch (err: any) {
      return { success: false, message: err.message || "Network error" };
    }
  };

  const logout = async () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("xspeed_user");
      document.cookie = "xspeed_session=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "xspeed_user=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "xspeed_admin_auth=; path=/; max-age=0; SameSite=Lax";
    }

    try {
      await signOut({ redirect: false });
    } catch {
      // ignore NextAuth signout errors
    }

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore API logout errors
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    loginWithBackend,
    loginWithGoogle,
    registerWithBackend,
    updateProfile,
    forgotPassword,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
