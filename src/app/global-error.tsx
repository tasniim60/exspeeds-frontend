"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex items-center justify-center bg-[#FAFBFC] font-sans text-brand-dark">
        <div className="text-center p-8 max-w-md space-y-4">
          <h1 className="text-4xl font-black text-brand-dark">حدث خطأ غير متوقع</h1>
          <p className="text-gray-600 text-sm">نعتذر عن هذا الخطأ المؤقت. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="bg-brand-orange text-white font-bold px-6 py-2.5 rounded-full hover:bg-brand-orange-deep transition-colors text-sm"
            >
              إعادة المحاولة / Retry
            </button>
            <Link
              href="/"
              className="bg-gray-100 text-brand-dark font-bold px-6 py-2.5 rounded-full hover:bg-gray-200 transition-colors text-sm"
            >
              الرئيسية / Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

