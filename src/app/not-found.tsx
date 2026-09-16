import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex items-center justify-center bg-[#FAFBFC] font-sans text-brand-dark">
        <div className="text-center p-8 max-w-md space-y-4">
          <h1 className="text-6xl font-black text-brand-dark">404</h1>
          <p className="text-gray-600">الصفحة المطلوبة غير موجودة / Page Not Found</p>
          <Link
            href="/"
            className="inline-block bg-brand-orange text-white font-bold px-6 py-2.5 rounded-full hover:bg-brand-orange-deep transition-colors"
          >
            الرئيسية / Home
          </Link>
        </div>
      </body>
    </html>
  );
}

