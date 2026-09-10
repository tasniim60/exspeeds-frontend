"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowRight, FileCode2, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function WpAdminBridgePage() {
  const router = useRouter();
  const { user, isAdmin, isLoading, loginWithBackend } = useAuth();
  const [email, setEmail] = useState("admin@exspeeds.com");
  const [password, setPassword] = useState("admin");

  useEffect(() => {
    if (!isLoading && isAdmin) {
      router.push("/admin");
    }
  }, [isAdmin, isLoading, router]);

  const handleDirectAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await loginWithBackend(email.trim(), password.trim());
    if (ok) {
      router.push("/admin");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500/20 border-t-[#C45B2A] rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-bold">Verifying Administrator Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-[calc(100vh-72px)] flex items-center justify-center py-16 px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/bg-home-BYMxMBP3.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-[#251516]/95 via-[#251516]/85 to-[#0A0E1A]/90 backdrop-blur-sm" />

      <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-2xl p-8 md:p-10 border border-gray-100 shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#C45B2A] flex items-center justify-center mx-auto mb-2">
            <FileCode2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-display font-black text-[#251516] tracking-[-0.02em]">
            WordPress & Admin Access
          </h1>
          <p className="text-xs text-gray-500 font-body">
            Log in to manage Rank Math SEO, Blog Posts, and Operations
          </p>
        </div>

        <form onSubmit={handleDirectAdminLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1.5 tracking-wider">
              Admin Email / Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@exspeeds.com"
                className="input-field pl-9 bg-gray-50 text-[#251516] border-gray-200 focus:bg-white text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1.5 tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-9 bg-gray-50 text-[#251516] border-gray-200 focus:bg-white text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Open Admin Command Center</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
          <a
            href="http://localhost:8080/wp-admin"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
          >
            <span>Launch Native WordPress Engine (Port 8080)</span>
            <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
          </a>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#C45B2A] hover:underline pt-1"
          >
            <span>Direct link to /admin Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
