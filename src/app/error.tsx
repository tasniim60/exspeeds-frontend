"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("Next.js Error Boundary caught:", error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch {}
    window.location.reload();
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 text-center bg-gray-50/50">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200 shadow-xs">
          <AlertCircle className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase text-red-600 bg-red-100 px-3 py-1 rounded-full tracking-wider">
            Application Exception
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black text-[#251516]">
            Something went wrong
          </h1>
          <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
            An unexpected error occurred while rendering this view. You can try refreshing, resetting application cache, or returning home.
          </p>
        </div>

        {error?.message && (
          <div className="text-left bg-gray-50 rounded-xl border border-gray-200 p-3.5 space-y-2">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:text-gray-900"
            >
              <span>Error Details</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showDetails && (
              <div className="pt-2 border-t border-gray-200 font-mono text-[11px] text-red-700 break-words whitespace-pre-wrap">
                {error.message}
                {error.digest && <p className="text-gray-400 mt-1 text-[10px]">Digest: {error.digest}</p>}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="btn-primary !bg-[#251516] hover:!bg-[#3D2527] text-white font-bold py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={handleClearCacheAndReload}
            className="py-3 px-5 rounded-xl border border-orange-200 bg-orange-50/60 text-[#C45B2A] font-bold text-xs hover:bg-orange-100 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Cache & Reload</span>
          </button>

          <Link
            href="/"
            className="py-3 px-5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
