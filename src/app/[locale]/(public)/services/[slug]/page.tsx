import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Plane,
  Ship,
  Truck,
  Warehouse,
  FileCheck,
  ShoppingCart,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Globe2,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Search,
  Phone,
  Package,
} from "lucide-react";

interface ServiceData {
  slug: string;
  icon: string;
  image: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descAr: string;
  descEn: string;
  featuresAr: string[];
  featuresEn: string[];
  specsAr: { label: string; value: string }[];
  specsEn: { label: string; value: string }[];
  timelineAr: string;
  timelineEn: string;
  whatsappMessageAr: string;
  whatsappMessageEn: string;
}

const servicesCatalog: Record<string, ServiceData> = {
  "air-freight": {
    slug: "air-freight",
    icon: "plane",
    image: "/assets/xspeed_plane.jpg",
    titleAr: "خدمات الشحن الجوي السريع الدولي",
    titleEn: "International Express Air Freight",
    subtitleAr: "أسرع حلول الشحن الجوي المباشر مع أولوية الحجز في أول رحلة طيران متاحة (NFO)",
    subtitleEn: "Next-Flight-Out priority cargo dispatch covering 220+ airports worldwide",
    descAr:
      "توفر إكس سبيد منظومة شحن جوي متقدمة ترتبط مباشرة بكبرى خطوط الطيران العالمية عبر مركز عملياتنا بمطار القاهرة الدولي. نضمن وصول شحناتكم الحساسة والعاجلة والطرود التجارية بأقصى سرعة ممكنة مع تتبع حي عبر الأقمار الصناعية ودرجات حرارة مضبوطة للمواد الطبية والصيدلانية.",
    descEn:
      "XSPEED operates a high-frequency air cargo network directly integrated with major global airlines from our Cairo International Airport hub. We guarantee priority space allocation, next-flight-out routing, and full temperature-controlled capabilities for pharmaceutical and high-value commercial consignments.",
    featuresAr: [
      "شحن فوري بأولوية النقل في أول رحلة طيران متاحة (Next-Flight-Out)",
      "شحن طرود الباب للباب (Door-to-Door) والباب للمطار (Door-to-Airport)",
      "تغطية مباشرة لأكثر من 220 مطاراً دولياً في الشرق الأوسط وأوروبا والأمريكتين وآسيا",
      "خدمات الشحن المبرد والحراري المعتمدة لمنتجات الأدوية والأغذية",
      "إصدار بوالص الشحن الجوي الرقمية (e-AWB) خلال دقائق",
    ],
    featuresEn: [
      "Next-Flight-Out (NFO) priority boarding and space guarantees",
      "Full Door-to-Door and Door-to-Airport consignment handling",
      "Direct coverage across 220+ international airports in MENA, Europe, Americas, and Asia",
      "Certified cold-chain and temperature-controlled capabilities for sensitive cargo",
      "Instant electronic Air Waybill (e-AWB) issuance and live milestone alerts",
    ],
    specsAr: [
      { label: "مدة العبور المعتادة", value: "24 إلى 72 ساعة عالمياً" },
      { label: "الوزن الأقصى المسموح", value: "من 0.5 كجم حتى الشحنات الثقيلة المفتوحة" },
      { label: "نوع التغطية", value: "شامل التتبع الحي وتأمين البضائع" },
      { label: "المستندات المطلوبة", value: "فاتورة تجارية، قائمة تعبئة، بوليصة AWB" },
    ],
    specsEn: [
      { label: "Standard Transit SLA", value: "24 to 72 hours globally" },
      { label: "Weight Capacity", value: "From 0.5 kg to chartered heavy cargo" },
      { label: "Coverage Scope", value: "Real-time telemetry & cargo insurance" },
      { label: "Required Documents", value: "Commercial invoice, packing list, e-AWB" },
    ],
    timelineAr: "استلام في نفس اليوم • إقلاع سريع • تسليم خلال 24-48 ساعة",
    timelineEn: "Same-Day Pickup • Priority Departure • 24-48h Destination Delivery",
    whatsappMessageAr: "مرحباً XSPEED، أود طلب عرض سعر وتفاصيل خدمة الشحن الجوي السريع.",
    whatsappMessageEn: "Hello XSPEED Logistics, I would like to request a quote for International Air Freight.",
  },
  "ocean-freight": {
    slug: "ocean-freight",
    icon: "ship",
    image: "/assets/xspeed_ship_truck.jpg",
    titleAr: "خدمات الشحن البحري ونقل الحاويات",
    titleEn: "Ocean Freight & Container Shipping",
    subtitleAr: "حلول شحن بحري متكاملة للحاويات الكاملة والمجمعة (FCL / LCL) بأفضل الأسعار التنافسية",
    subtitleEn: "Reliable Full Container Load (FCL) & Less-than-Container Load (LCL) global sea freight",
    descAr:
      "نقدم حلول الشحن البحري الشاملة لنقل البضائع والمعدات والمواد الخام عبر كافة الموانئ البحرية في مصر والشرق الأوسط والعالم. تشمل خدماتنا إدارة الحاويات الكاملة (FCL)، تجميع الشحنات الصغيرة (LCL)، التخزين في المستودعات الجمركية بالموانئ، والمتابعة الدقيقة لخطوط الملاحة البحرية.",
    descEn:
      "Comprehensive maritime freight services connecting Egyptian and Middle Eastern ports with premier trade lanes worldwide. We provide dedicated Full Container Load (FCL) management, consolidated LCL shipping, port-side bonded warehousing, and robust maritime tracking.",
    featuresAr: [
      "شحن الحاويات الكاملة بجميع المقاسات (20ft, 40ft, 40ft High Cube, Reefer)",
      "خدمات التجميع البحري (LCL Consolidation) للشحنات الجزئية بتكلفة اقتصادية",
      "عقود تفضيلية مع أكبر خطوط الملاحة العالمية (Maersk, MSC, CMA CGM, Hapag-Lloyd)",
      "إدارة مستندات الشحن البحري وإصدار بوالص B/L وسندات الشحن البحرية",
      "تنسيق إجراءات الإفراج الجمركي المسبق بموانئ الإسكندرية ودمياط وبورسعيد والسخنة",
    ],
    featuresEn: [
      "Complete container fleet support (20ft, 40ft, 40ft HC, Open Top, Reefer containers)",
      "Economical LCL consolidation services for smaller commercial freight",
      "Direct volume contracts with leading global carriers (MSC, Maersk, CMA CGM)",
      "End-to-end maritime documentation and original Bill of Lading management",
      "Integrated port pre-clearance at Alexandria, Damietta, Port Said, and Sokhna",
    ],
    specsAr: [
      { label: "نوع الحاويات", value: "20 قدم، 40 قدم، مبردة، حاويات مفتوحة" },
      { label: "الموانئ المصرية المدعومة", value: "الإسكندرية، الدخيلة، دمياط، بورسعيد، السخنة" },
      { label: "نظام التسعير", value: "أسعار تنافسية حسب المتر المكعب أو الحاوية" },
      { label: "التأمين البحري", value: "تأمين شامل ضد مخاطر الملاحة والبحر" },
    ],
    specsEn: [
      { label: "Container Types", value: "20ft, 40ft, HQ, Reefer, Flat Rack" },
      { label: "Egyptian Port Gateways", value: "Alexandria, Dekheila, Damietta, Port Said, Sokhna" },
      { label: "Pricing Structure", value: "Competitive per-CBM or flat container rates" },
      { label: "Marine Insurance", value: "Comprehensive Institute Cargo Clauses coverage" },
    ],
    timelineAr: "حجز حاويات أسبوعي • رحلات بحرية منتظمة • تخليص مسبق",
    timelineEn: "Weekly Container Allocations • Scheduled Sailings • Port Pre-Clearance",
    whatsappMessageAr: "مرحباً XSPEED، أود طلب عرض سعر وتفاصيل خدمة الشحن البحري والحاويات.",
    whatsappMessageEn: "Hello XSPEED Logistics, I would like to request a quote for Ocean Container Freight.",
  },
  "customs-clearance": {
    slug: "customs-clearance",
    icon: "file-check",
    image: "/assets/xspeed_customs_clearance.jpg",
    titleAr: "خدمات التخليص الجمركي والاستشارات الاستيرادية",
    titleEn: "Customs Clearance & Brokerage Services",
    subtitleAr: "إجراءات تخليص جمركي معتمدة وسريعة عبر منظومة نافذة ونظام التسجيل المسبق ACI",
    subtitleEn: "Certified express customs brokerage via Nafeza single-window and ACI pre-clearance",
    descAr:
      "يمتلك فريق التخليص الجمركي في إكس سبيد خبرة تزيد عن 15 عاماً في التعامل مع القوانين الجمركية والاتفاقيات التجارية وتصنيف البنود الجمركية (HS Codes). نتولى إنهاء كافة إجراءات الإفراج الجمركي عن الشحنات الواردة والصادرة بالمطارات والموانئ المصرية في زمن قياسي مع الالتزام الكامل بالقوانين لتفادي أي غرامات أو تأخير.",
    descEn:
      "Backed by 15+ years of customs expertise, XSPEED's certified brokers streamline import and export clearance across Egyptian ports and airports. We manage Nafeza single-window filings, ACI registration, tariff classifications, and regulatory exemptions with zero delay.",
    featuresAr: [
      "إصدار ومتابعة أرقام التسجيل المسبق للشحنات (ACI Acid Number) قبل الإبحار",
      "تسجيل وفحص المستندات عبر منصة نافذة (Nafeza) المصرية الموحدة",
      "تصنيف دقيق لبنود التعريفة الجمركية (HS Code) لحساب الرسوم بأعلى دقة",
      "استخراج الموافقات الرقابية وهيئة الرقابة على الصادرات والواردات (GOEIC)",
      "إنهاء إجراءات الإفراج المؤقت والسماح المؤقت وخدمات الترانزيت الجمركي",
    ],
    featuresEn: [
      "Immediate ACI Advance Cargo Information registration prior to origin shipment",
      "Direct processing and electronic document lodging via Egyptian Nafeza platform",
      "Precise HS Code tariff classification minimizing tax and regulatory liabilities",
      "Management of regulatory approvals (GOEIC, Ministry of Health, NTRA)",
      "Temporary admission, transit warehousing, and bonded customs clearance",
    ],
    specsAr: [
      { label: "المنافذ الجمركية", value: "مطار القاهرة، ميناء الإسكندرية، السخنة، بورسعيد" },
      { label: "زمن التخليص", value: "24 إلى 48 ساعة من اكتمال المستندات" },
      { label: "المنظومات الرقمية", value: "منظومة نافذة، نظام ACI، الربط الإلكتروني" },
      { label: "الدعم الفني", value: "مستشار جمركي مخصص لكل شحنة" },
    ],
    specsEn: [
      { label: "Customs Stations", value: "Cairo Cargo Airport, Alexandria, Sokhna, Port Said" },
      { label: "Clearance SLA", value: "24 to 48 hours upon document validation" },
      { label: "Digital Portals", value: "Nafeza Single Window, CargoX, ACI Portal" },
      { label: "Consultation", value: "Dedicated customs consultant for every consignment" },
    ],
    timelineAr: "تسجيل ACI مسبق • فحص رقمي فوري • إفراج جمركي سريع",
    timelineEn: "Pre-Arrival ACI Filing • Digital Validation • Fast-Track Cargo Release",
    whatsappMessageAr: "مرحباً XSPEED، لدي استفسار بخصوص التخليص الجمركي ونظام نافذة ACI لشحنتي.",
    whatsappMessageEn: "Hello XSPEED Logistics, I need customs clearance assistance and Nafeza/ACI consultation.",
  },
  "warehousing": {
    slug: "warehousing",
    icon: "warehouse",
    image: "/assets/xspeed_boxes.jpg",
    titleAr: "خدمات التخزين وإدارة المستودعات الذكية",
    titleEn: "Smart Warehousing & Storage Logistics",
    subtitleAr: "مستودعات مكيفة ومؤمنة بأحدث أنظمة إدارة المخزون الرقمية (WMS) والتوزيع السريع",
    subtitleEn: "Modern climate-controlled facilities powered by smart WMS and rapid dispatch",
    descAr:
      "توفر مرافق التخزين المتقدمة لدى إكس سبيد بيئة مثالية لحفظ المنتجات والمواد الخام وتجهيز الطلبات التجارية. تشمل مستودعاتنا مساحات تخزين مبردة وعادية، أنظمة أمان ومراقبة على مدار 24/7، وأنظمة إدارة مخزون رقمية تتيح للعملاء معرفة حركة المخزون لحظة بلحظة.",
    descEn:
      "XSPEED's state-of-the-art warehousing facilities deliver reliable, scalable storage and order processing. Featuring ambient and climate-controlled storage, 24/7 high-security surveillance, and cloud-connected WMS platforms for real-time inventory visibility.",
    featuresAr: [
      "مستودعات مؤمنة بأحدث أنظمة الإطفاء والرقابة بالكاميرات على مدار 24 ساعة",
      "نظام إدارة مستودعات رقمي (WMS) مع باركود وتتبع دقيق للمنتجات",
      "خدمات الفرز، التغليف، وتجهيز الطلبيات (Pick & Pack) في نفس اليوم",
      "مساحات تخزين مرنة (قصيرة وطويلة الأجل) تناسب حجم أعمالك المتغير",
      "مستودعات قريبة استراتيجياً من مطار القاهرة والمحاور اللوجستية الرئيسية",
    ],
    featuresEn: [
      "24/7 high-security facilities equipped with intelligent fire suppression and CCTV",
      "Advanced cloud WMS with barcode scanning and serial-level SKU tracking",
      "Same-day Pick, Pack, and Dispatch fulfillment workflows",
      "Flexible short-term and long-term storage footprints tailored to business volume",
      "Strategically situated adjacent to Cairo Airport and primary freight arterial highways",
    ],
    specsAr: [
      { label: "المساحات المتاحة", value: "مساحات طبالي (Pallets) ورفوف ومساحات مخصصة" },
      { label: "التحكم الحراري", value: "تخزين جاف ومكيف ودرجات حرارة مضبوطة" },
      { label: "التتبع الرقمي", value: "بوابة سحابية لمعاينة المخزون الحي" },
      { label: "الأمان والتأمين", value: "تأمين شامل ضد الحريق والسرقة والمخاطر" },
    ],
    specsEn: [
      { label: "Storage Units", value: "Standard pallet racking, bin shelving, bulk floor space" },
      { label: "Climate Control", value: "Ambient, temperature-monitored, and cool zones" },
      { label: "Digital Tracking", value: "Client portal with real-time stock telemetry" },
      { label: "Security & Insurance", value: "Comprehensive risk and facility insurance coverage" },
    ],
    timelineAr: "استلام وجرد فوري • تخزين آمن • تجهيز وشحن عند الطلب",
    timelineEn: "Instant Inbound Ingestion • Secure Storage • On-Demand Pick & Dispatch",
    whatsappMessageAr: "مرحباً XSPEED، أود الاستفسار عن خطط وأسعار التخزين والمستودعات.",
    whatsappMessageEn: "Hello XSPEED Logistics, I would like to inquire about warehousing and storage plans.",
  },
  "land-freight": {
    slug: "land-freight",
    icon: "truck",
    image: "/assets/bg-home-BYMxMBP3.jpg",
    titleAr: "خدمات الشحن والنقل البري للشاحنات",
    titleEn: "Road Freight & Commercial Trucking",
    subtitleAr: "أسطول شاحنات حديث مجهز بنظام GPS لتغطية كافة المحافظات وخطوط النقل الدولية",
    subtitleEn: "Modern GPS-monitored commercial trucking fleet covering nationwide and regional routes",
    descAr:
      "تعتمد شبكة النقل البري في إكس سبيد على أسطول متنوع من الشاحنات الحديثة (تريلات، جامبو، سيارات مغلقة ومبردة) لتوصيل البضائع والمهمات بين الموانئ والمصانع والمستودعات في جميع أنحاء مصر والدول المجاورة، مع تتبع رقمي دقيق لمسار الشاحنة والتزام صارم بمواعيد التسليم.",
    descEn:
      "XSPEED road freight network operates an extensive fleet of modern commercial trucks (Trailers, Flatbeds, Box Trucks, Reefers) connecting Egyptian industrial zones, seaports, and cross-border destinations with GPS vehicle tracking and strict on-time delivery metrics.",
    featuresAr: [
      "شاحنات حمولة كاملة (FTL) وشحن جزئي مجمع (LTL) لكافة المحافظات",
      "أسطول سيارات مجهز بأجهزة تتبع GPS لمراقبة خط السير الحي",
      "سيارات شحن مغلقة ومؤمنة لنقل الأجهزة والمواد ذات القيمة العالية",
      "شاحنات مبردة مخصصة للمنتجات الغذائية والدوائية",
      "خدمات نقل الحاويات من الموانئ البحرية إلى المصانع والمخازن",
    ],
    featuresEn: [
      "Full Truckload (FTL) and Less-than-Truckload (LTL) distribution nationwide",
      "100% GPS-tracked vehicle telemetry and geofenced milestone alerts",
      "Enclosed high-security box trucks for sensitive and electronics freight",
      "Refrigerated linehaul transport for perishable commodities and pharmaceuticals",
      "Container drayage connecting seaports directly with industrial compounds",
    ],
    specsAr: [
      { label: "أنواع السيارات", value: "تريلات 40 طن، جامبو 5 طن، سيارات فان سريعة" },
      { label: "نطاق التغطية", value: "جميع محافظات مصر والمناطق الحرة والصناعية" },
      { label: "التتبع الحي", value: "تتبع مسار الشاحنة عبر الأقمار الصناعية GPS" },
      { label: "السرعة", value: "توصيل خلال نفس اليوم أو 24 ساعة داخلياً" },
    ],
    specsEn: [
      { label: "Fleet Profiles", value: "40-ton articulated trailers, 5-ton medium trucks, express vans" },
      { label: "Geographic Reach", value: "All 27 Egyptian governorates and free industrial zones" },
      { label: "Live Telemetry", value: "Satellite GPS tracking with driver communications" },
      { label: "Speed SLA", value: "Same-day or next-day scheduled transit" },
    ],
    timelineAr: "تحميل فوري من الموقع • مسارات سريعة • تسليم موقع وموثق",
    timelineEn: "On-Site Loading • Optimized Routing • Verified Proof of Delivery",
    whatsappMessageAr: "مرحباً XSPEED، أود طلب شاحنة ونقل بري للبضائع.",
    whatsappMessageEn: "Hello XSPEED Logistics, I would like to book commercial road freight trucking.",
  },
  "ecommerce-fulfillment": {
    slug: "ecommerce-fulfillment",
    icon: "shopping-cart",
    image: "/assets/xspeed_ecom_fulfillment.jpg",
    titleAr: "حلول التجارة الإلكترونية والتوصيل السريع",
    titleEn: "eCommerce Fulfillment & Last-Mile Delivery",
    subtitleAr: "منظومة متكاملة لربط المتاجر الإلكترونية، التخزين، الدفع عند الاستلام (COD)، وإدارة المرتجعات",
    subtitleEn: "End-to-end fulfillment for digital stores, rapid COD remittance, and seamless returns",
    descAr:
      "صُممت حلول التجارة الإلكترونية من إكس سبيد لتمكين المتاجر والمنصات الرقمية من تقديم تجربة تسليم استثنائية لعملائهم. نوفر تخزين المنتجات، التغليف الفاخر، التوصيل السريع للميل الأخير، تحصيل الأموال عند الاستلام (COD) مع دورات تحويل مالية منتظمة وسريعة، وبوابة لإدارة المرتجعات بكفاءة.",
    descEn:
      "Engineered specifically for online retailers and enterprise brands, XSPEED's eCommerce solutions accelerate growth with seamless store integrations, automated order picking, last-mile express delivery, rapid cash-on-delivery (COD) disbursements, and hassle-free returns handling.",
    featuresAr: [
      "تحصيل الدفع عند الاستلام (COD) مع تحويل المستحقات في مواعيد دورية منتظمة",
      "ربط برمجي مباشر عبر API مع منصات ووكومرس، شوبيفاي، زِد، وسلة",
      "إدارة ذكية للمرتجعات والاستبدال السريع مع فحص حالة المنتجات",
      "تغليف آمن ومميز يعكس هوية علامتك التجارية",
      "لوحة تحكم إلكترونية لمتابعة نسب التسليم وحركة الأموال لحظة بلحظة",
    ],
    featuresEn: [
      "Reliable Cash-on-Delivery (COD) collection with expedited payout schedules",
      "Direct API and webhook integrations for WooCommerce, Shopify, and custom stores",
      "Automated reverse logistics, exchange workflows, and return quality audits",
      "Branded custom packaging and premium unboxing presentation options",
      "Real-time client analytics dashboard monitoring delivery rates and cash flow",
    ],
    specsAr: [
      { label: "دورات تحويل COD", value: "تحويل أسبوعي أو نصف شهري لحسابك البنكي" },
      { label: "سرعة التوصيل", value: "نفس اليوم بالقاهرة والجيزة، 24-48 ساعة للمحافظات" },
      { label: "الربط البرمجي", value: "REST API متكامل مع إضافة ووكومرس وشوبيفاي" },
      { label: "خدمة العملاء", value: "تأكيد هاتفي للطلبيات لتقليل نسبة المرتجع" },
    ],
    specsEn: [
      { label: "COD Payout Schedule", value: "Weekly or bi-weekly direct bank remittances" },
      { label: "Delivery Speeds", value: "Same-day in Cairo/Giza, 24-48h all Egyptian governorates" },
      { label: "Ecosystem Integration", value: "Direct REST APIs for Shopify, WooCommerce, custom apps" },
      { label: "Customer Service", value: "Pre-delivery customer phone confirmations to reduce returns" },
    ],
    timelineAr: "استلام الطلب إلكترونياً • تجهيز وتغليف فوري • تسليم وتحصيل COD",
    timelineEn: "Automated API Ingest • Same-Day Packing • Last-Mile Delivery & Cash Collection",
    whatsappMessageAr: "مرحباً XSPEED، أود الاستفسار عن خدمات التجارة الإلكترونية والدفع عند الاستلام COD.",
    whatsappMessageEn: "Hello XSPEED Logistics, I want to inquire about eCommerce fulfillment and COD services.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const service = servicesCatalog[params.slug];
  if (!service) return {};

  const isAr = params.locale !== "en";
  const title = isAr
    ? `${service.titleAr} | خدمات إكس سبيد للشحن`
    : `${service.titleEn} | XSPEED Logistics`;
  const description = isAr ? service.subtitleAr : service.subtitleEn;

  return {
    title,
    description,
    alternates: {
      canonical: `https://exspeeds.com/${params.locale || "ar"}/services/${params.slug}`,
      languages: {
        ar: `https://exspeeds.com/ar/services/${params.slug}`,
        en: `https://exspeeds.com/en/services/${params.slug}`,
        "x-default": `https://exspeeds.com/en/services/${params.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      images: [service.image],
    },
  };
}

export function generateStaticParams() {
  const slugs = Object.keys(servicesCatalog);
  const locales = ["ar", "en"];
  const params: { locale: string; slug: string }[] = [];
  locales.forEach((locale) => {
    slugs.forEach((slug) => {
      params.push({ locale, slug });
    });
  });
  return params;
}

export default function SingleServicePage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const service = servicesCatalog[params.slug];
  if (!service) {
    notFound();
  }

  const isAr = params.locale !== "en";
  const title = isAr ? service.titleAr : service.titleEn;
  const subtitle = isAr ? service.subtitleAr : service.subtitleEn;
  const desc = isAr ? service.descAr : service.descEn;
  const features = isAr ? service.featuresAr : service.featuresEn;
  const specs = isAr ? service.specsAr : service.specsEn;
  const timeline = isAr ? service.timelineAr : service.timelineEn;
  const whatsappMsg = isAr ? service.whatsappMessageAr : service.whatsappMessageEn;
  const whatsappUrl = `https://wa.me/201208027171?text=${encodeURIComponent(whatsappMsg)}`;

  // JSON-LD Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    description: subtitle,
    provider: {
      "@type": "LocalBusiness",
      name: "XSPEED Express Logistics",
      url: "https://exspeeds.com",
      telephone: "+201208027171",
      email: "sales@exspeeds.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "7 Rokn El Safa, Off Khaled Amin, El Arish, Al Haram",
        addressLocality: "Giza",
        addressCountry: "EG",
      },
    },
    serviceType: "Freight & Logistics Services",
    areaServed: ["EG", "SA", "AE", "KW", "QA", "OM", "BH", "US", "GB", "EU", "CN"],
    url: `https://exspeeds.com/${params.locale}/services/${params.slug}`,
    image: `https://exspeeds.com${service.image}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      availability: "https://schema.org/InStock",
      url: `https://exspeeds.com/${params.locale}/ship`,
    },
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "plane":
        return <Plane className="w-6 h-6 text-[#C45B2A]" />;
      case "ship":
        return <Ship className="w-6 h-6 text-[#C45B2A]" />;
      case "file-check":
        return <FileCheck className="w-6 h-6 text-[#C45B2A]" />;
      case "warehouse":
        return <Warehouse className="w-6 h-6 text-[#C45B2A]" />;
      case "truck":
        return <Truck className="w-6 h-6 text-[#C45B2A]" />;
      case "shopping-cart":
        return <ShoppingCart className="w-6 h-6 text-[#C45B2A]" />;
      default:
        return <Package className="w-6 h-6 text-[#C45B2A]" />;
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen font-sans" dir={isAr ? "rtl" : "ltr"}>
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* 1. Hero Banner */}
      <section className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#ECE2D5] overflow-hidden">
        {/* Background Image with Warm Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url('${service.image}')` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAF8F5]/90 via-[#FAF8F5]/85 to-[#FAF8F5]/95 backdrop-blur-[2px] pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-6 relative z-10 text-start">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <Link
              href={isAr ? "/ar" : "/en"}
              className="hover:text-[#C45B2A] transition-colors"
            >
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <span>/</span>
            <Link
              href={isAr ? "/ar/services" : "/en/services"}
              className="hover:text-[#C45B2A] transition-colors"
            >
              {isAr ? "الخدمات اللوجستية" : "Services"}
            </Link>
            <span>/</span>
            <span className="text-[#C45B2A]">{title}</span>
          </div>

          {/* Service Tag & Icon */}
          <div className="inline-flex items-center gap-2.5 bg-white/90 border border-orange-200/80 px-4 py-1.5 rounded-full shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
              {renderIcon(service.icon)}
            </div>
            <span className="text-[#C45B2A] text-xs font-black uppercase tracking-wider">
              {isAr ? "خدمة لوجستية معتمدة" : "Verified Logistics Solution"}
            </span>
          </div>

          {/* Heading & Subtitle */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-gray-950 tracking-tight leading-[1.2]">
            {title}
          </h1>
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg max-w-3xl leading-relaxed font-medium">
            {subtitle}
          </p>

          {/* Direct CTAs */}
          <div className="pt-4 flex flex-wrap items-center gap-3.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-md shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-h-[44px]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isAr ? "طلب عرض سعر فوري عبر واتساب" : "Get Instant Quote on WhatsApp"}</span>
            </a>

            <Link
              href={isAr ? "/ar/track" : "/en/track"}
              className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-gray-900 border border-gray-200/90 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-2xs hover:border-[#C45B2A] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-h-[44px]"
            >
              <Search className="w-4 h-4 text-[#C45B2A]" />
              <span>{isAr ? "تتبع شحنة جارية" : "Track Existing Consignment"}</span>
            </Link>

            <a
              href="tel:+201208027171"
              className="inline-flex items-center gap-2 bg-[#FAF8F5] hover:bg-white text-gray-800 border border-gray-200 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-full transition-all min-h-[44px]"
              dir="ltr"
            >
              <Phone className="w-4 h-4 text-[#C45B2A]" />
              <span>+20 120 802 7171</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left / Main Details (8 Cols) */}
          <div className="lg:col-span-8 space-y-8 text-start">
            {/* Detailed Description */}
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-black/5 shadow-xl shadow-black/5 space-y-5">
              <h2 className="text-2xl font-bold text-gray-950 flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#C45B2A]"></span>
                <span>{isAr ? "نظرة عامة على الخدمة وإمكانيات التنفيذ" : "Service Capabilities & Execution Scope"}</span>
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base font-medium">
                {desc}
              </p>

              {/* Transit Timeline Banner */}
              <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
                <Clock className="w-6 h-6 text-[#C45B2A] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#C45B2A] uppercase tracking-wider">
                    {isAr ? "الجدول الزمني للخدمة" : "Operational Transit Timeline"}
                  </h4>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{timeline}</p>
                </div>
              </div>
            </div>

            {/* Key Advantages / Features */}
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-black/5 shadow-xl shadow-black/5 space-y-6">
              <h2 className="text-2xl font-bold text-gray-950 flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <span>{isAr ? "مميزات وضمانات الخدمة لدى إكس سبيد" : "Key Advantages & SLAs"}</span>
              </h2>

              <div className="grid grid-cols-1 gap-3.5">
                {features.map((f, fIdx) => (
                  <div
                    key={fIdx}
                    className="flex items-start gap-3 bg-[#FAF8F5] p-4 rounded-2xl border border-gray-100/90"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-bold text-gray-800 leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specifications Table */}
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-black/5 shadow-xl shadow-black/5 space-y-6">
              <h2 className="text-2xl font-bold text-gray-950 flex items-center gap-2.5">
                <Globe2 className="w-6 h-6 text-[#C45B2A]" />
                <span>{isAr ? "المواصفات والضوابط التشغيلية" : "Operational Specifications & Constraints"}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {specs.map((sp, sIdx) => (
                  <div key={sIdx} className="bg-[#FAF8F5] p-4 rounded-2xl border border-orange-100/80">
                    <span className="text-xs text-gray-500 font-bold block">{sp.label}</span>
                    <span className="text-sm font-bold text-gray-950 mt-1 block">{sp.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Action Widget */}
            <div className="bg-gradient-to-b from-[#1C1415] to-[#2A1D1E] rounded-3xl p-7 text-white space-y-6 shadow-2xl border border-orange-500/20 text-start">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                  {isAr ? "تواصل مع مدير العمليات" : "Connect with Operations Desk"}
                </span>
                <h3 className="text-xl font-bold tracking-tight">
                  {isAr ? "جاهز لحجز شحنتك؟" : "Ready to Dispatch Your Consignment?"}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {isAr
                    ? "يقوم فريق العمليات بمطار القاهرة بالرد المباشر وتقديم أفضل عرض سعر يناسب احتياجاتك."
                    : "Our airport logistics team provides immediate quote calculations and priority space booking."}
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isAr ? "محادثة فورية عبر واتساب" : "Chat on WhatsApp"}</span>
                </a>

                <Link
                  href={isAr ? "/ar/ship" : "/en/ship"}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#C45B2A] hover:bg-[#A34920] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20"
                >
                  <Package className="w-4 h-4" />
                  <span>{isAr ? "طلب شحن عبر النموذج الموحد" : "Online Shipment Request"}</span>
                </Link>

                <a
                  href="tel:+201208027171"
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-white/15"
                  dir="ltr"
                >
                  <Phone className="w-4 h-4 text-orange-400" />
                  <span>+20 120 802 7171</span>
                </a>
              </div>
            </div>

            {/* Other Services Navigation List */}
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-xl shadow-black/5 space-y-4 text-start">
              <h4 className="text-sm font-bold text-gray-950 border-b border-gray-100 pb-3">
                {isAr ? "خدمات لوجستية أخرى" : "Explore Other Services"}
              </h4>

              <div className="space-y-2">
                {Object.values(servicesCatalog)
                  .filter((s) => s.slug !== service.slug)
                  .map((otherS, oIdx) => (
                    <Link
                      key={oIdx}
                      href={isAr ? `/ar/services/${otherS.slug}` : `/en/services/${otherS.slug}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] hover:bg-orange-50/70 border border-gray-100/90 hover:border-orange-200 transition-all text-xs font-bold text-gray-800 group"
                    >
                      <div className="flex items-center gap-2.5">
                        {renderIcon(otherS.icon)}
                        <span>{isAr ? otherS.titleAr : otherS.titleEn}</span>
                      </div>
                      <ArrowRight
                        className={`w-3.5 h-3.5 text-gray-400 group-hover:text-[#C45B2A] transition-colors ${
                          isAr ? "rotate-180" : ""
                        }`}
                      />
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
