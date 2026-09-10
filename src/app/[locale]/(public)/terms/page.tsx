import { Metadata } from "next";
import Link from "next/link";
import { Scale, FileText, ArrowLeft, ShieldAlert, CheckCircle2 } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params?.locale !== "en";
  const title = isAr
    ? "الشروط والأحكام واتفاقية الخدمة | إكس سبيد"
    : "Terms of Service & Shipping Agreement | XSPEED";
  const description = isAr
    ? "تعرف على الشروط والأحكام المنظمة لخدمات الشحن الدولي والمحلي والتخليص الجمركي والتخزين لدى إكس سبيد."
    : "Review the terms and conditions governing international & domestic freight, customs clearance, and warehousing services provided by XSPEED Logistics.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://exspeeds.com/${params?.locale || "ar"}/terms`,
      languages: {
        ar: "https://exspeeds.com/ar/terms",
        en: "https://exspeeds.com/en/terms",
        "x-default": "https://exspeeds.com/en/terms",
      },
    },
  };
}

export default function TermsPage({
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
          <div className="inline-flex items-center gap-2 bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-2xs">
            <Scale className="w-3.5 h-3.5" />
            <span>{isAr ? "الاتفاقية التعاقدية والشروط القانونية" : "Contractual Agreement & Terms"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-gray-950 tracking-tight">
            {isAr ? "الشروط والأحكام واتفاقية النقل" : "Terms & Conditions of Carriage"}
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            {isAr
              ? "سارية المفعول من: سبتمبر 2026 • منصة إكس سبيد (exspeeds.com) - شركة إكس سبيد للخدمات اللوجستية"
              : "Effective Date: September 2026 • XSPEED Logistics Platform (exspeeds.com)"}
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-black/5 shadow-xl shadow-black/5 space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
          {isAr ? (
            <>
              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C45B2A]"></span>
                  1. تمهيد والتعريفات الأساسية
                </h2>
                <p>
                  تحكم هذه الاتفاقية ("الشروط والأحكام") كافة الخدمات والعمليات اللوجستية، بما في ذلك الشحن الجوي والبحري والبري، التخليص الجمركي، التخزين، وحلول التجارة الإلكترونية المقدمة من شركة <strong>إكس سبيد للخدمات اللوجستية والنقل الدولي (XSPEED Express Logistics)</strong> عبر بوابتها الإلكترونية الرسمية <code>exspeeds.com</code>.
                </p>
                <p>
                  بمجرد حجز أي شحنة، أو إصدار بوليصة شحن (Air Waybill / Bill of Lading)، أو استخدام البوابة الإلكترونية، يُعتبر العميل (المرسل أو المستلم أو وكيله) موافقاً بصورة كاملة وغير مشروطة على الالتزام بجميع بنود هذه الاتفاقية.
                </p>
              </section>

              <hr className="border-gray-100" />

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C45B2A]"></span>
                  2. مسؤوليات العميل وتجهيز الشحنات
                </h2>
                <ul className="list-disc list-inside space-y-2 pr-2 text-gray-600">
                  <li>
                    <strong>دقة البيانات:</strong> يلتزم العميل بتقديم بيانات كاملة ودقيقة حول طبيعة البضائع، القيمة الفعلية، الأوزان، الأبعاد، وتفاصيل المرسل والمستلم كاملة شاملاً أرقام التواصل والعناوين الوطنية.
                  </li>
                  <li>
                    <strong>التغليف الآمن:</strong> يقع التزام تغليف المواد بما يتناسب مع طبيعة النقل الدولي وتفريغ وتحميل الحاويات على عاتق العميل بالكامل، مالم يتم التعاقد مسبقاً على خدمة التغليف اللوجستي المعتمد من إكس سبيد.
                  </li>
                  <li>
                    <strong>الفواتير والمستندات:</strong> تقديم كافة الفواتير التجارية الأصلية وشهادات المنشأ وقوائم التعبئة المطلوبة للتخليص الجمركي وإجراءات الإفراج.
                  </li>
                </ul>
              </section>

              <hr className="border-gray-100" />

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  3. المواد المحظورة والمقيدة
                </h2>
                <p>
                  يُحظر تماماً شحن المواد التالية عبر شبكة إكس سبيد، ويتحمل العميل المسؤولية الجنائية والمدنية والمالية الكاملة عن أي تضليل أو مخالفة:
                </p>
                <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 text-xs sm:text-sm text-red-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-red-800">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    <span>قائمة المحظورات غير القابلة للتفاوض:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-red-800/90 pr-2">
                    <li>المتفجرات والأسلحة والذخائر والمواد المشعة والمشتعلة (وفق تصنيف IATA / IMO للبضائع الخطرة إلا بتصريح معتمد مسبق).</li>
                    <li>المخدرات والمؤثرات العقلية والنباتات أو الحيوانات المهددة بالانقراض وفق اتفاقية CITES.</li>
                    <li>العملات النقدية والسبائك الذهبية والمجوهرات غير المؤمن عليها بتأمين خاص، وسندات الدفع لحاملها.</li>
                    <li>المطبوعات أو الوسائط التي تخالف قوانين ولوائح جمهورية مصر العربية والدول المستقبلة.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C45B2A]"></span>
                  4. حدود المسؤولية والتعويضات
                </h2>
                <p>
                  تخضع مسؤولية إكس سبيد لأحكام المعاهدات والاتفاقيات الدولية المنظمة للنقل، بما في ذلك اتفاقية وارسو ومونتريال للشحن الجوي وقواعد لاهاي-فيسبي للنقل البحري، والتشريعات التجارية المصرية النافذة:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-2 text-gray-600">
                  <li>
                    تقتصر مسؤولية الشركة في حال الفقد أو التلف المثبت نتيجة خطأ مباشر غير متعمد على الحد الأقصى المنصوص عليه في الاتفاقيات الدولية أو التعويض المباشر للشحنات المؤمنة ذات القيمة المصرح بها مسبقاً.
                  </li>
                  <li>
                    لا تتحمل الشركة مسؤولية الأضرار غير المباشرة أو التبعية مثل خسارة الأرباح أو الفرص التجارية أو التأخير الناتج عن إجراءات الفحص الجمركي أو الظروف القاهرة (Force Majeure).
                  </li>
                  <li>
                    <strong>تقديم المطالبات:</strong> يجب إخطار الشركة كتابياً بأي ضرر ظاهر خلال 48 ساعة من استلام الشحنة، وبحد أقصى 14 يوماً للأضرار غير الظاهرة مرفقاً بها تقرير المعاينة وصور الشحنة الأصلية.
                  </li>
                </ul>
              </section>

              <hr className="border-gray-100" />

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C45B2A]"></span>
                  5. الرسوم، الضرائب، والتخليص الجمركي
                </h2>
                <p>
                  الأسعار المعلنة على الموقع أو عروض الأسعار الصادرة لا تشمل الضرائب الجمركية، وضريبة القيمة المضافة (VAT 14%)، أو رسوم التخزين في المستودعات الجمركية (Demurrage/Storage) مالم يُنص على ذلك صراحة بخطاب رسمي مسبق (DDP).
                </p>
                <p>
                  يلتزم العميل بسداد كافة الرسوم الجمركية والمصروفات الحكومية المنفقة نيابة عنه فور إشعار التخليص.
                </p>
              </section>

              <hr className="border-gray-100" />

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C45B2A]"></span>
                  6. القانون الواجب التطبيق والاختصاص القضائي
                </h2>
                <p>
                  تخضع هذه الاتفاقية وتُفسر وفقاً للقوانين واللوائح السارية في <strong>جمهورية مصر العربية</strong>. وتختص المحاكم الاقتصادية والتجارية بالقاهرة بالنظر في أي نزاع ينشأ عن تنفيذ أو تفسير هذه الاتفاقية.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C45B2A]"></span>
                  1. Preamble & Definitions
                </h2>
                <p>
                  These Terms and Conditions govern all logistics, freight forwarding (Air, Ocean, Land), customs clearance, warehousing, and e-commerce fulfillment services provided by <strong>XSPEED Express Logistics</strong> through its official web platform <code>exspeeds.com</code>.
                </p>
                <p>
                  By booking a shipment, generating an Air Waybill (AWB) or Bill of Lading (B/L), or utilizing our portal, the shipper, consignee, and holder of the airway bill unconditionally agree to comply with these terms.
                </p>
              </section>

              <hr className="border-gray-100" />

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C45B2A]"></span>
                  2. Shipper Obligations & Consignment Preparation
                </h2>
                <ul className="list-disc list-inside space-y-2 pl-2 text-gray-600">
                  <li>
                    <strong>Accuracy of Information:</strong> The shipper certifies the accuracy of package declarations, declared customs values, weights, dimensions, and full recipient contact information.
                  </li>
                  <li>
                    <strong>Packaging:</strong> Proper export and cargo packaging suitable for international transit is the sole responsibility of the shipper unless XSPEED professional packing service is expressly booked.
                  </li>
                  <li>
                    <strong>Documentation:</strong> Timely provision of genuine commercial invoices, certificates of origin, and compliance documentation.
                  </li>
                </ul>
              </section>

              <hr className="border-gray-100" />

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  3. Prohibited & Restricted Items
                </h2>
                <p>
                  The following items are strictly prohibited across all XSPEED transportation networks:
                </p>
                <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 text-xs sm:text-sm text-red-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-red-800">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Non-Negotiable Prohibitions:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-red-800/90 pl-2">
                    <li>Explosives, weapons, ammunition, hazardous chemicals, and flammable goods under IATA/IMO DGR without prior written clearance.</li>
                    <li>Narcotics, psychotropic substances, and endangered flora/fauna governed by CITES.</li>
                    <li>Cash currency, unverified gold bullion, loose precious gems, and bearer financial securities.</li>
                    <li>Counterfeit goods or items violating intellectual property rights and Egyptian import laws.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C45B2A]"></span>
                  4. Limitation of Liability & Cargo Claims
                </h2>
                <p>
                  Liability of XSPEED is governed by applicable international conventions (Warsaw / Montreal Conventions for Air Carriage, Hague-Visby rules for Sea Freight, and Egyptian Commercial Maritime & Land Transport Laws):
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 text-gray-600">
                  <li>Direct liability for lost or damaged goods is limited according to convention limits per kilogram unless higher value declared insurance is purchased.</li>
                  <li>XSPEED is not liable for indirect, consequential losses, loss of profit, customs inspections delays, or Force Majeure events.</li>
                  <li><strong>Notice of Claim:</strong> Visible damage claims must be lodged in writing within 48 hours of cargo delivery; concealed damage claims within 14 calendar days with inspection photos and cargo surveys.</li>
                </ul>
              </section>

              <hr className="border-gray-100" />

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C45B2A]"></span>
                  5. Rates, Customs Duties & 14% VAT
                </h2>
                <p>
                  Quotes exclude governmental customs tariffs, regulatory clearance fees, and 14% Value Added Tax (VAT) unless a formalized Delivered Duty Paid (DDP) agreement is in effect. All out-of-pocket port storage (demurrage) and customs expenses must be reimbursed upon notification.
                </p>
              </section>

              <hr className="border-gray-100" />

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C45B2A]"></span>
                  6. Governing Law & Jurisdiction
                </h2>
                <p>
                  These Terms and any contractual disputes shall be governed exclusively by the laws and regulations of the <strong>Arab Republic of Egypt</strong>. The Economic and Commercial Courts in Cairo shall maintain sole jurisdiction.
                </p>
              </section>
            </>
          )}

          {/* Quick CTA back */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href={isAr ? "/ar/privacy" : "/en/privacy"}
              className="text-[#C45B2A] hover:underline font-bold text-sm inline-flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>{isAr ? "الاطلاع على سياسة الخصوصية" : "View Privacy Policy"}</span>
            </Link>

            <Link
              href={isAr ? "/ar" : "/en"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              <span>{isAr ? "العودة للرئيسية" : "Return to Homepage"}</span>
              <ArrowLeft className={`w-4 h-4 ${isAr ? "rotate-0" : "rotate-180"}`} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
