"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

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
  login: (userData: UserProfile) => Promise<boolean>;
  loginWithBackend: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: (data?: { name?: string; email?: string; googleId?: string; avatar?: string }) => Promise<boolean>;
  registerWithBackend: (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    company?: string;
    city?: string;
    country?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    updatedData: Partial<UserProfile> & { currentPassword?: string; newPassword?: string }
  ) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; devCode?: string; token?: string }>;
  resetPassword: (data: { email: string; token: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status, update } = useSession();
  const isLoading = status === "loading";

  const user = useMemo<UserProfile | null>(() => {
    if (!session?.user) return null;
    const sessionUser = session.user as any;
    const role: "admin" | "user" =
      sessionUser.role === "admin" || (sessionUser.email && sessionUser.email.includes("admin"))
        ? "admin"
        : "user";

    return {
      name: sessionUser.name || "Customer",
      email: sessionUser.email || "",
      role,
      phone: sessionUser.phone || "",
      company: sessionUser.company || "",
    };
  }, [session]);

  const login = useCallback(async (userData: UserProfile): Promise<boolean> => {
    const res = await signIn("credentials", {
      email: userData.email,
      password: "admin",
      redirect: false,
    });
    return !!res?.ok;
  }, []);

  const loginWithBackend = useCallback(async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: pass.trim(),
        redirect: false,
      });
      return !!res?.ok;
    } catch {
      return false;
    }
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      await signIn("google", { callbackUrl: "/ship" });
      return true;
    } catch {
      return false;
    }
  }, []);

  const registerWithBackend = useCallback(
    async (data: {
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
        if (res.ok && json.success) {
          // Establish NextAuth secure cookie session immediately
          await signIn("credentials", {
            email: data.email.trim().toLowerCase(),
            password: data.password || "xspeed123",
            redirect: false,
          });
          return { success: true };
        }
        return { success: false, error: json.error || "Registration failed" };
      } catch (err: any) {
        return { success: false, error: err.message || "Network error" };
      }
    },
    []
  );

  const updateProfile = useCallback(
    async (
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
          // Trigger NextAuth session cookie update
          if (update) {
            await update({
              name: updatedData.name,
              phone: updatedData.phone,
              company: updatedData.company,
            });
          }
          return { success: true, message: json.message || "Profile updated successfully!" };
        }
        return { success: false, message: json.error || "Failed to update profile" };
      } catch (err: any) {
        return { success: false, message: err.message || "Network error" };
      }
    },
    [update]
  );

  const forgotPassword = useCallback(
    async (email: string): Promise<{ success: boolean; message?: string; devCode?: string; token?: string }> => {
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
    },
    []
  );

  const resetPassword = useCallback(
    async (data: { email: string; token: string; password: string }): Promise<{ success: boolean; message?: string }> => {
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
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
    } catch {
      // ignore NextAuth signout error
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore API logout error
    }
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
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
    }),
    [
      user,
      isLoading,
      login,
      loginWithBackend,
      loginWithGoogle,
      registerWithBackend,
      updateProfile,
      forgotPassword,
      resetPassword,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
