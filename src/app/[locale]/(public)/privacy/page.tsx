import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, FileText, ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params?.locale !== "en";
  const title = isAr
    ? "سياسة الخصوصية وحماية البيانات | إكس سبيد"
    : "Privacy & Data Protection Policy | XSPEED";
  const description = isAr
    ? "تعرف على سياسة الخصوصية وحماية بيانات الشحن والعملاء لدى شركة إكس سبيد لخدمات الشحن السريع واللوجستيات."
    : "Learn about how XSPEED Logistics protects your personal data, consignment details, and financial transactions.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://exspeeds.com/${params?.locale || "ar"}/privacy`,
      languages: {
        ar: "https://exspeeds.com/ar/privacy",
        en: "https://exspeeds.com/en/privacy",
        "x-default": "https://exspeeds.com/en/privacy",
      },
    },
  };
}

export default function PrivacyPage({
  params,
}: {
  params: { locale: string };
}) {
  const isAr = params?.locale !== "en";

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 text-start" dir={isAr ? "rtl" : "ltr"}>
        {/* Header Breadcrumb & Tag */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-orange-100/70 border border-orange-200 text-[#C45B2A] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? "الامتثال القانوني وحماية البيانات" : "Legal Compliance & Privacy"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-gray-950 tracking-tight">
            {isAr ? "سياسة الخصوصية وسرية بيانات الشحن" : "Privacy & Data Security Policy"}
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            {isAr
              ? "آخر تحديث: سبتمبر 2026 • منصة إكس سبيد للخدمات اللوجستية (exspeeds.com)"
              : "Last Updated: September 2026 • XSPEED Logistics Platform (exspeeds.com)"}
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-orange-100/90 p-6 sm:p-10 shadow-sm space-y-8 text-gray-800 text-xs sm:text-sm leading-relaxed font-normal">
          {isAr ? (
            <>
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C45B2A]" />
                  <span>1. مقدمة والتزام بالخصوصية</span>
                </h2>
                <p>
                  تلتزم شركة إكس سبيد لخدمات الشحن السريع واللوجستيات (المشار إليها بـ "XSPEED" أو "نحن" عبر منصتنا الرقمية exspeeds.com) بحماية خصوصية وأمان بيانات عملائها الكرام، سواء كانوا شركات تجارية (B2B) أو أفراداً (B2C). توضح هذه السياسة كيفية جمع واستخدام وتخزين وتأمين المعلومات عند استخدام خدمات الشحن والتتبع أو تقديم طلبات عروض الأسعار.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-950">2. البيانات التي نقوم بجمعها</h2>
                <ul className="list-disc pr-5 space-y-1.5 text-gray-700">
                  <li><strong>بيانات الهوية والاتصال:</strong> الاسم الكامل، اسم الشركة، رقم الهاتف، رقم الواتساب، والبريد الإلكتروني.</li>
                  <li><strong>بيانات الشحنات ومسارات التوصيل:</strong> عناوين الاستلام والتسليم بالتفصيل، بيانات الراسل والمستلم، وزن وأبعاد ومحتويات الطرود.</li>
                  <li><strong>المستندات الجمركية:</strong> الفواتير التجارية، قوائم التعبئة، وأرقام التسجيل المسبق للشحنات (ACI) الخاصة بعمليات التخليص الجمركي.</li>
                  <li><strong>البيانات التقنية:</strong> سجلات التتبع الرقمي، ملفات تعريف الارتباط الأساسية، وعناوين بروتوكول الإنترنت لأغراض الأمان وتحسين تجربة التصفح.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-950">3. أغراض معالجة واستخدام البيانات</h2>
                <p>
                  نستخدم البيانات المجمعة حصرياً من أجل:
                </p>
                <ul className="list-disc pr-5 space-y-1.5 text-gray-700">
                  <li>تنفيذ عمليات الشحن الدولي والمحلي واستخراج بوالص الشحن (Air Waybills).</li>
                  <li>تقديم التحديثات اللحظية ومتابعة التتبع عبر الرسائل النصية والواتساب والبريد الإلكتروني.</li>
                  <li>إتمام إجراءات التخليص الجمركي الفوري عبر منظومة نافذة والسلطات المختصة.</li>
                  <li>إصدار الفواتير الضريبية والمستندات المحاسبية المعتمدة.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-950">4. سرية البيانات ومشاركتها مع أطراف ثالثة</h2>
                <p>
                  لا نقوم ببيع أو تأجير أي بيانات شخصية أو تجارية لأي أطراف تسويقية. تتم مشاركة البيانات فقط بالقدر الضروري مع الشركاء اللوجستيين المعتمدين (خطوط الطيران، خطوط الملاحة البحرية، مكاتب التخليص بالموانئ، وهيئات الجمارك) لغرض تنفيذ الشحنة قانونياً.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-950">5. تواصل معنا</h2>
                <p>
                  إذا كانت لديك أي استفسارات أو طلبات تتعلق ببياناتك وخصوصيتك، يمكنك التواصل مباشرة مع مسؤول حماية البيانات عبر البريد: <a href="mailto:sales@exspeeds.com" className="text-[#C45B2A] font-bold hover:underline">sales@exspeeds.com</a> أو عبر مكتب العمليات بقرية البضائع بمطار القاهرة الدولي.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C45B2A]" />
                  <span>1. Introduction & Privacy Commitment</span>
                </h2>
                <p>
                  XSPEED Express Logistics & Technology Platform ("XSPEED", "we", "our", operating via exspeeds.com) is committed to safeguarding the privacy, confidentiality, and integrity of our corporate (B2B) and retail (B2C) clients. This Privacy Policy details how we collect, process, and secure information during freight booking, real-time consignment tracking, and customs clearance.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-950">2. Information We Collect</h2>
                <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                  <li><strong>Identity & Contact Info:</strong> Full name, company name, phone/WhatsApp number, and verified email address.</li>
                  <li><strong>Consignment & Routing Data:</strong> Pickup/delivery addresses, shipper/consignee contact details, cargo dimensions, weight, and content descriptions.</li>
                  <li><strong>Customs Documents:</strong> Commercial invoices, packing lists, and ACI pre-clearance registration identifiers.</li>
                  <li><strong>Technical & Telemetry Data:</strong> IP addresses, waybill tracking queries, and essential operational cookies.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-950">3. Purpose of Processing</h2>
                <p>
                  We utilize your data strictly to execute international freight forwarding, generate official Air Waybills, coordinate with airport/seaport customs authorities via Nafeza, and provide live dispatch notifications via WhatsApp and email.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-950">4. Third-Party Sharing & Security</h2>
                <p>
                  We never sell or distribute your data for marketing purposes. Disclosures are limited solely to authorized logistics partners (airlines, maritime shipping lines, customs officials) necessary to fulfill transportation agreements under industry-standard SSL/TLS encryption.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-950">5. Contact Information</h2>
                <p>
                  For privacy inquiries or data rights requests, please contact our legal desk at <a href="mailto:sales@exspeeds.com" className="text-[#C45B2A] font-bold hover:underline">sales@exspeeds.com</a> or visit our operations headquarters at Cairo International Airport Cargo Village, Egypt.
                </p>
              </section>
            </>
          )}

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <Link
              href={`/${params?.locale || "ar"}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#C45B2A] hover:underline"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
              <span>{isAr ? "العودة للرئيسية" : "Back to Home"}</span>
            </Link>

            <Link
              href={`/${params?.locale || "ar"}/terms`}
              className="text-xs font-bold text-gray-600 hover:text-[#C45B2A]"
            >
              {isAr ? "الشروط والأحكام اللوجستية ←" : "Terms of Service →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
