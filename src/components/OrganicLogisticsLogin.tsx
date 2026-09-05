"use client";

import React, { useState } from "react";
import { Leaf, Lock, ArrowRight, Globe, Sprout, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function OrganicLogisticsLogin() {
  const [accountId, setAccountId] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessState(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-gradient-to-br from-[#e8f5e9] via-[#f1f8e9] to-[#d8e2dc] font-sans">
      {/* Subtle Floating Botanical & Leaf Vector Accents */}
      <div className="absolute top-10 left-10 text-emerald-700/10 animate-pulse pointer-events-none">
        <Leaf className="w-48 h-48 -rotate-45" />
      </div>
      <div className="absolute bottom-10 right-10 text-emerald-800/10 animate-pulse pointer-events-none delay-700">
        <Sprout className="w-56 h-56 rotate-12" />
      </div>
      <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-teal-300/20 blur-3xl pointer-events-none" />

      {/* Floating Card Container */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-emerald-950/10 border-t-4 border-[#2e7d32] border-x border-b border-emerald-100/80 p-8 sm:p-10 space-y-6 relative z-10 transition-all duration-300">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          {/* Top Emblem Logo */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2e7d32] to-[#4b7b3b] text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 mx-auto mb-4 group hover:scale-105 transition-transform">
            <Leaf className="w-7 h-7 fill-white/20 stroke-[2]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-black text-[#1b4332] tracking-tight">
            Premium Organic Logistics
          </h1>
          <p className="text-xs sm:text-sm text-emerald-800/60 font-medium">
            Secure your organic supply chain
          </p>
        </div>

        {successState ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-up">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1b4332]">Portal Access Granted</h3>
            <p className="text-xs text-emerald-700">Connecting to your eco-wellness logistics dashboard...</p>
            <button
              type="button"
              onClick={() => setSuccessState(false)}
              className="text-xs text-[#2e7d32] font-bold underline cursor-pointer pt-2 inline-block"
            >
              Sign in with another account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input 1: Fleet / Account ID */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-extrabold uppercase text-[#1b4332]/80 tracking-wider pl-2">
                Fleet / Account ID
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="e.g. ORG-8842-GREEN"
                  className="w-full h-12 rounded-full bg-[#f0f7f4] border border-emerald-200/80 focus:bg-white focus:border-[#2e7d32] text-[#1b4332] text-xs font-semibold pl-5 pr-11 shadow-inner/5 outline-none focus:ring-2 focus:ring-[#2e7d32]/20 transition-all placeholder:text-emerald-900/30"
                />
                <Leaf className="absolute right-4 w-4 h-4 text-[#2e7d32]/70 pointer-events-none" />
              </div>
            </div>

            {/* Input 2: Access Key */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-extrabold uppercase text-[#1b4332]/80 tracking-wider pl-2">
                Access Key
              </label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  required
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 rounded-full bg-[#f0f7f4] border border-emerald-200/80 focus:bg-white focus:border-[#2e7d32] text-[#1b4332] text-xs font-semibold pl-5 pr-11 shadow-inner/5 outline-none focus:ring-2 focus:ring-[#2e7d32]/20 transition-all placeholder:text-emerald-900/30"
                />
                <Lock className="absolute right-4 w-4 h-4 text-[#2e7d32]/70 pointer-events-none" />
              </div>
            </div>

            {/* Actions: Remember Me & Request Access Key */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#1b4332]/80 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#2e7d32] rounded-md w-4 h-4 cursor-pointer"
                />
                <span>Remember this portal access</span>
              </label>
              <a href="#" className="text-[#2e7d32] font-bold hover:underline text-[11px]">
                Request new access key
              </a>
            </div>

            {/* Primary Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#2e7d32] to-[#4b7b3b] hover:from-[#215c25] hover:to-[#385e2c] text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-70"
            >
              <span>{isSubmitting ? "Authenticating Eco-Portal..." : "Access Your Logistics Dashboard"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        )}

        {/* Social / Alternative Auth Section */}
        <div className="space-y-4 pt-2">
          {/* Subtle Organic Leaf Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-emerald-100 w-full" />
            <div className="bg-white px-3 text-[#2e7d32]/60 absolute flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest">
              <Leaf className="w-3 h-3 text-[#2e7d32]" />
              <span>ECO AUTH NETWORK</span>
              <Leaf className="w-3 h-3 text-[#2e7d32]" />
            </div>
          </div>

          {/* Two Side-by-Side Secondary Pill Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              className="w-full h-11 bg-[#f4f7f4] hover:bg-emerald-100/70 border border-emerald-200/60 text-[#1b4332] text-xs font-bold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
            >
              <Globe className="w-3.5 h-3.5 text-[#2e7d32]" />
              <span>Global Trade</span>
            </button>
            <button
              type="button"
              className="w-full h-11 bg-[#f4f7f4] hover:bg-emerald-100/70 border border-emerald-200/60 text-[#1b4332] text-xs font-bold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
            >
              <Sprout className="w-3.5 h-3.5 text-[#2e7d32]" />
              <span>Sustainable Network</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-emerald-100/60">
          <a
            href="#"
            className="text-xs text-emerald-800/70 hover:text-[#2e7d32] font-semibold transition-colors inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#2e7d32]" />
            <span>New to Organic Logistics? <strong>Learn More</strong></span>
          </a>
        </div>

      </div>
    </div>
  );
}
