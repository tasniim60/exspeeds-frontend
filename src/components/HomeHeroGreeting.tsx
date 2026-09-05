"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { User, ShieldCheck, Sparkles, ArrowRight, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HomeHeroGreeting() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) {
    return (
      <div className="inline-flex items-center gap-2.5 self-start bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg group hover:bg-white/15 transition-all">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C45B2A] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C45B2A]"></span>
        </span>
        <span className="text-gray-200">{t("home.hero.badge")}</span>
        <Leaf className="h-3.5 w-3.5 text-emerald-400" />
      </div>
    );
  }

  if (user.role === "admin") {
    return (
      <div className="inline-flex items-center gap-2.5 self-start bg-[#C45B2A]/15 backdrop-blur-md border border-[#C45B2A]/30 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C45B2A] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C45B2A]"></span>
        </span>
        <ShieldCheck className="h-4 w-4 text-[#C45B2A]" />
        <span>
          {isRTL ? `مرحبًا بمسؤول النظام (${user.email})` : `Welcome Administrator (${user.email})`}
        </span>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 bg-[#C45B2A] text-white hover:bg-[#A34920] px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ml-1"
        >
          <span>{isRTL ? "لوحة التحكم" : "Dashboard"}</span>
          <ArrowRight className={`w-3 h-3 ${isRTL ? "rotate-180" : ""}`} />
        </Link>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2.5 self-start bg-emerald-500/15 backdrop-blur-md border border-emerald-500/30 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <User className="h-4 w-4 text-emerald-400" />
      <span>
        {isRTL
          ? `مرحبًا بك، ${user.name}! (الحساب نشط)`
          : `Welcome back, ${user.name}! (Account Active)`}
      </span>
    </div>
  );
}

