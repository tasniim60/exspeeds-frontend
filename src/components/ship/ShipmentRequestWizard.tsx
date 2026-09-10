"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  User,
  MapPin,
  Truck,
  Package,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Building,
  Phone,
  Calendar,
  AlertCircle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Globe,
  Layers,
  Copy,
  Check,
  ThermometerSnowflake,
  Maximize2,
  Edit3,
  Plus,
  Hash,
  Mail,
  Scale,
  Sparkles,
  Info,
  Ship,
  FileCheck,
  Building2,
  Plane,
  ChevronDown,
  Warehouse,
  ExternalLink,
} from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201208027171";

const POPULAR_DESTINATIONS = [
  { country: "United Arab Emirates", countryAr: "الإمارات العربية المتحدة", code: "AE" },
  { country: "Saudi Arabia", countryAr: "المملكة العربية السعودية", code: "SA" },
  { country: "Kuwait", countryAr: "الكويت", code: "KW" },
  { country: "Qatar", countryAr: "قطر", code: "QA" },
  { country: "United Kingdom", countryAr: "المملكة المتحدة", code: "GB" },
  { country: "United States", countryAr: "الولايات المتحدة", code: "US" },
];

const STORAGE_KEY_DRAFT = "xspeed_shipment_wizard_draft_v3";
const STORAGE_KEY_STEP = "xspeed_shipment_wizard_step_v3";
const STORAGE_KEY_SERVICE = "xspeed_shipment_wizard_service_v3";
const STORAGE_KEY_SUBMITTED = "xspeed_shipment_wizard_submitted_v3";

export default function ShipmentRequestWizard() {
  const { user } = useAuth();
  const { locale, isRTL } = useLanguage();

  // Selected Service Type from grid or initial step
  const [selectedService, setSelectedService] = useState<string>("express-parcel");

  // Services definitions with high-craft badges, icons, and descriptions
  const servicesList = useMemo(
    () => [
      {
        id: "express-parcel",
        title: isRTL ? "طلب شحن سريع (طرود وبضائع)" : "Express Courier & Parcel Booking",
        shortTitle: isRTL ? "شحن طرود سريع" : "Express Parcels",
        desc: isRTL
          ? "إدخال بيانات الشحنة والاستلام والتسليم من الباب للباب مع حساب الوزن الحجمي والتسعير الفوري."
          : "Door-to-door courier, express cargo, and commercial parcel booking with volumetric calculation.",
        icon: Package,
        isForm: true,
        tag: isRTL ? "نموذج شحن فوري" : "Instant Form",
        badgeBg: "bg-orange-100 text-orange-900 border-orange-200",
        actionText: isRTL ? "تسجيل بيانات الشحنة" : "Fill Shipment Details",
        whatsappMsg: isRTL
          ? "مرحباً XSPEED، أود الاستفسار وحساب تكلفة شحن طرود وبضائع دولية مستعجلة."
          : "Hello XSPEED, I would like to inquire about express international parcel shipping.",
      },
      {
        id: "ocean-freight",
        title: isRTL ? "شحن بحري وحاويات (FCL / LCL)" : "Ocean Container Freight (FCL / LCL)",
        shortTitle: isRTL ? "شحن بحري وحاويات" : "Ocean Freight",
        desc: isRTL
          ? "حجز مساحات الحاويات الكاملة والمجزأة عبر كبرى الخطوط الملاحية العالمية بأفضل أسعار النولون."
          : "Full container load (FCL) and consolidated (LCL) global freight booking with best ocean freight rates.",
        icon: Ship,
        isForm: false,
        tag: isRTL ? "واتساب فوري" : "Instant WhatsApp",
        badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
        actionText: isRTL ? "تنسيق عبر واتساب" : "WhatsApp Fast-Track",
        whatsappMsg: isRTL
          ? "مرحباً XSPEED، أود الاستفسار وحجز مساحة لشحن بحري (حاويات كاملة FCL أو مجمعة LCL)."
          : "Hello XSPEED, I would like to inquire and book ocean freight cargo space (FCL/LCL).",
      },
      {
        id: "air-freight",
        title: isRTL ? "شحن جوي تجاري ومستعجل (Priority NFO)" : "Priority Commercial Air Cargo (NFO)",
        shortTitle: isRTL ? "شحن جوي أول رحلة" : "Air Freight (NFO)",
        desc: isRTL
          ? "شحن بضائع تجارية وشحنات حساسة في أول رحلة طيران متاحة مع متابعة مسار الشحنة وسلسلة التبريد."
          : "Next-flight-out priority cargo space, commercial air freight, and temperature-controlled logistics.",
        icon: Plane,
        isForm: false,
        tag: isRTL ? "واتساب فوري" : "Instant WhatsApp",
        badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
        actionText: isRTL ? "تنسيق عبر واتساب" : "WhatsApp Fast-Track",
        whatsappMsg: isRTL
          ? "مرحباً XSPEED، أود الاستفسار عن الشحن الجوي التجاري السريع في أول رحلة طيران متاحة."
          : "Hello XSPEED, I would like to book priority commercial air cargo on the next available flight.",
      },
      {
        id: "customs-clearance",
        title: isRTL ? "تخليص جمركي واستشارات ACI ونظام نافذة" : "Customs Clearance & ACI Advisory",
        shortTitle: isRTL ? "تخليص جمركي وACI" : "Customs & Nafeza",
        desc: isRTL
          ? "إنهاء إجراءات الإفراج المسبق والتسجيل بنظام نافذة (ACI) وتصنيف البنود الجمركية بالموانئ والمطارات."
          : "Fast-track pre-clearance via Nafeza, ACI registration, and tariff classification at all Egyptian ports.",
        icon: FileCheck,
        isForm: false,
        tag: isRTL ? "واتساب فوري" : "Instant WhatsApp",
        badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
        actionText: isRTL ? "تنسيق عبر واتساب" : "WhatsApp Fast-Track",
        whatsappMsg: isRTL
          ? "مرحباً XSPEED، أود الاستفسار عن خدمات التخليص الجمركي للشحنات الدولية ونظام نافذة / ACI."
          : "Hello XSPEED, I would like to inquire about customs clearance services, Nafeza compliance, and ACI pre-clearance.",
      },
      {
        id: "warehousing",
        title: isRTL ? "تخزين وإدارة مستودعات ذكية (3PL Hub)" : "Smart Warehousing & 3PL Hub",
        shortTitle: isRTL ? "مستودعات وتخزين 3PL" : "Warehousing 3PL",
        desc: isRTL
          ? "مساحات تخزين آمنة، إدارة مخزون دقيقة بنظام WMS، وتجهيز وتغليف الطلبات لمتاجر التجارة الإلكترونية."
          : "Secure pallet storage, WMS inventory tracking, and rapid pick & pack fulfillment for eCommerce.",
        icon: Warehouse,
        isForm: false,
        tag: isRTL ? "واتساب فوري" : "Instant WhatsApp",
        badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
        actionText: isRTL ? "تنسيق عبر واتساب" : "WhatsApp Fast-Track",
        whatsappMsg: isRTL
          ? "مرحباً XSPEED، أود الاستفسار عن خدمات التخزين والمستودعات الذكية وحلول 3PL."
          : "Hello XSPEED, I would like to inquire about smart warehousing and 3PL fulfillment solutions.",
      },
      {
        id: "enterprise",
        title: isRTL ? "عقود الشركات وحلول سلاسل الإمداد" : "Corporate Accounts & Enterprise SLA",
        shortTitle: isRTL ? "حسابات شركات وعقود" : "Enterprise B2B",
        desc: isRTL
          ? "أسعار تفضيلية تعاقدية للشركات، فواتير دورية ائتمانية، ومدير حساب لوجستي مخصص لدعم عملياتك."
          : "Contracted enterprise freight rates, monthly invoicing, and dedicated account manager.",
        icon: Building2,
        isForm: false,
        tag: isRTL ? "واتساب فوري" : "Instant WhatsApp",
        badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
        actionText: isRTL ? "تنسيق عبر واتساب" : "WhatsApp Fast-Track",
        whatsappMsg: isRTL
          ? "مرحباً XSPEED، أود مناقشة فتح حساب شركات وعقد خدمات لوجستية دورية بأسعار مخصصة."
          : "Hello XSPEED, I would like to discuss opening a corporate B2B logistics account with custom rates.",
      },
    ],
    [isRTL]
  );

  const activeService = useMemo(
    () => servicesList.find((s) => s.id === selectedService) || servicesList[0],
    [servicesList, selectedService]
  );

  // Handle service change: express parcel stays in form; others trigger WhatsApp directly
  const handleServiceSelect = (serviceId: string, directOpen = true) => {
    setSelectedService(serviceId);
    try {
      sessionStorage.setItem(STORAGE_KEY_SERVICE, serviceId);
    } catch {}
    if (fieldErrors.selectedService) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated.selectedService;
        return updated;
      });
    }

    const target = servicesList.find((s) => s.id === serviceId);
    if (target && !target.isForm && directOpen) {
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(target.whatsappMsg || "")}`;
      if (typeof window !== "undefined") {
        window.open(waUrl, "_blank");
      }
    }
  };

  const defaultFormData = useMemo(
    () => ({
      customerName: user?.name || "",
      companyName: user?.company || "",
      phone: user?.phone || "",
      whatsapp: user?.phone || "",
      email: user?.email || "",

      pickupCountry: "Egypt",
      pickupCity: "Cairo",
      pickupAddress: "",
      pickupContactName: user?.name || "",
      pickupContactPhone: user?.phone || "",
      preferredPickupDate: new Date().toISOString().split("T")[0],
      pickupNotes: "",

      deliveryCountry: "United Arab Emirates",
      deliveryCity: "",
      deliveryShortAddress: "",
      deliveryAddress: "",
      consigneeName: "",
      consigneePhone: "",
      deliveryNotes: "",

      shipmentType: "Commercial Goods" as "Documents" | "Parcel" | "Commercial Goods" | "Other",
      customShipmentType: "",
      contents: "",
      packageCount: 1 as number | string,
      weight: 5.0 as number | string,
      length: "" as number | string,
      width: "" as number | string,
      height: "" as number | string,
      declaredValue: 500 as number | string,
      currency: "USD",
      isFragile: false,
      isTemperatureControlled: false,
      specialInstructions: "",
    }),
    [user]
  );

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmedCorrect, setConfirmedCorrect] = useState(false);
  const [copiedReqNumber, setCopiedReqNumber] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  // Restore draft state on mount
  useEffect(() => {
    try {
      const savedService = sessionStorage.getItem(STORAGE_KEY_SERVICE);
      if (savedService) {
        setSelectedService(savedService);
      }

      const savedSubmitted = sessionStorage.getItem(STORAGE_KEY_SUBMITTED);
      if (savedSubmitted) {
        setSubmittedData(JSON.parse(savedSubmitted));
      }

      const savedDraft = sessionStorage.getItem(STORAGE_KEY_DRAFT);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          customerName: parsed.customerName || user?.name || prev.customerName,
          email: parsed.email || user?.email || prev.email,
          companyName: parsed.companyName || user?.company || prev.companyName,
          phone: parsed.phone || user?.phone || prev.phone,
          whatsapp: parsed.whatsapp || user?.phone || prev.whatsapp,
          pickupContactName: parsed.pickupContactName || user?.name || prev.pickupContactName,
          pickupContactPhone: parsed.pickupContactPhone || user?.phone || prev.pickupContactPhone,
        }));
      } else if (user) {
        setFormData((prev) => ({
          ...prev,
          customerName: prev.customerName || user.name || "",
          email: prev.email || user.email || "",
          companyName: prev.companyName || user.company || "",
          phone: prev.phone || user.phone || "",
          whatsapp: prev.whatsapp || user.phone || "",
          pickupContactName: prev.pickupContactName || user.name || "",
          pickupContactPhone: prev.pickupContactPhone || user.phone || "",
        }));
      }

      const urlStep = new URLSearchParams(window.location.search).get("step");
      const savedStep = sessionStorage.getItem(STORAGE_KEY_STEP);
      const targetStep = urlStep ? parseInt(urlStep, 10) : savedStep ? parseInt(savedStep, 10) : 1;
      if (targetStep >= 1 && targetStep <= 5) {
        setStep(targetStep);
      }
    } catch (e) {
      console.error("Failed to restore wizard state:", e);
    }
  }, [user]);

  const updateStep = (newStep: number) => {
    setStep(newStep);
    setGeneralError(null);
    try {
      sessionStorage.setItem(STORAGE_KEY_STEP, String(newStep));
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("step", String(newStep));
        window.history.replaceState(null, "", url.toString());
      }
    } catch {}
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        sessionStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  // Volumetric Weight Calculation (IATA: L * W * H / 5000)
  const volumetricWeight = useMemo(() => {
    const l = formData.length !== "" ? Number(formData.length) : 0;
    const w = formData.width !== "" ? Number(formData.width) : 0;
    const h = formData.height !== "" ? Number(formData.height) : 0;
    if (l > 0 && w > 0 && h > 0 && !isNaN(l) && !isNaN(w) && !isNaN(h)) {
      return ((l * w * h) / 5000).toFixed(2);
    }
    return null;
  }, [formData.length, formData.width, formData.height]);

  const getShipmentTypeLabel = (type: string, custom?: string) => {
    if (type === "Other") {
      return custom?.trim() || (isRTL ? "أخرى (مخصص)" : "Other (Custom)");
    }
    if (type === "Documents") {
      return isRTL ? "مستندات ووثائق" : "Documents";
    }
    if (type === "Parcel") {
      return isRTL ? "طرد شخصي" : "Personal Parcel";
    }
    if (type === "Commercial Goods") {
      return isRTL ? "بضائع وشحن تجاري" : "Commercial Cargo";
    }
    return type;
  };

  // Validation Logic per step
  const validateStep = (currentStep: number): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!selectedService) {
        errors.selectedService = isRTL ? "يرجى اختيار نوع الخدمة المطلوبة" : "Please select a service type";
      }
    }

    if (currentStep === 2) {
      if (!formData.pickupCountry.trim()) {
        errors.pickupCountry = isRTL ? "يرجى إدخال دولة الاستلام" : "Pickup country is required";
      }
      if (!formData.pickupCity.trim()) {
        errors.pickupCity = isRTL ? "يرجى إدخال مدينة الاستلام" : "Pickup city is required";
      }
      if (!formData.pickupAddress.trim() || formData.pickupAddress.trim().length < 3) {
        errors.pickupAddress = isRTL ? "يرجى إدخال عنوان الاستلام بالتفصيل (3 أحرف على الأقل)" : "Detailed pickup address is required";
      }
      if (!formData.pickupContactName.trim()) {
        errors.pickupContactName = isRTL ? "يرجى إدخال اسم مسؤول الاستلام" : "Contact name is required";
      }
      if (!formData.pickupContactPhone.trim() || formData.pickupContactPhone.trim().length < 7) {
        errors.pickupContactPhone = isRTL ? "يرجى إدخال رقم هاتف صالح للاستلام" : "Valid contact phone is required";
      }
      if (!formData.preferredPickupDate) {
        errors.preferredPickupDate = isRTL ? "يرجى تحديد تاريخ الاستلام" : "Pickup date is required";
      }
    }

    if (currentStep === 3) {
      if (!formData.deliveryCountry.trim()) {
        errors.deliveryCountry = isRTL ? "يرجى تحديد دولة التسليم" : "Destination country is required";
      }
      if (!formData.deliveryCity.trim()) {
        errors.deliveryCity = isRTL ? "يرجى إدخال مدينة التسليم" : "Destination city is required";
      }
      if (!formData.deliveryAddress.trim() || formData.deliveryAddress.trim().length < 3) {
        errors.deliveryAddress = isRTL ? "يرجى إدخال عنوان التسليم بالتفصيل" : "Detailed delivery address is required";
      }
      if (!formData.consigneeName.trim()) {
        errors.consigneeName = isRTL ? "يرجى إدخال اسم المستلم" : "Consignee name is required";
      }
      if (!formData.consigneePhone.trim() || formData.consigneePhone.trim().length < 7) {
        errors.consigneePhone = isRTL ? "يرجى إدخال رقم هاتف المستلم" : "Valid consignee phone is required";
      }
    }

    if (currentStep === 4) {
      if (formData.shipmentType === "Other" && !formData.customShipmentType.trim()) {
        errors.customShipmentType = isRTL ? "يرجى تحديد نوع الشحنة الخاصة" : "Please specify custom shipment type";
      }
      if (!formData.contents.trim() || formData.contents.trim().length < 2) {
        errors.contents = isRTL ? "يرجى كتابة وصف محتويات الشحنة" : "Shipment contents description is required";
      }
      if (formData.packageCount === "" || Number(formData.packageCount) < 1) {
        errors.packageCount = isRTL ? "يجب أن يكون عدد الطرود 1 على الأقل" : "Package count must be at least 1";
      }
      if (formData.weight === "" || Number(formData.weight) <= 0) {
        errors.weight = isRTL ? "يرجى إدخال وزن صالح أكبر من الصفر" : "Weight must be greater than 0";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      setGeneralError(firstError);
      return false;
    }

    setFieldErrors({});
    setGeneralError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      updateStep(Math.min(step + 1, 5));
    }
  };

  const handleBack = () => {
    updateStep(Math.max(step - 1, 1));
  };

  const handleStartNewRequest = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY_DRAFT);
      sessionStorage.removeItem(STORAGE_KEY_STEP);
      sessionStorage.removeItem(STORAGE_KEY_SERVICE);
      sessionStorage.removeItem(STORAGE_KEY_SUBMITTED);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("step");
        window.history.replaceState(null, "", url.pathname);
      }
    } catch {}
    setSubmittedData(null);
    setSelectedService("express-parcel");
    setFormData(defaultFormData);
    setConfirmedCorrect(false);
    setFieldErrors({});
    setGeneralError(null);
    updateStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedCorrect) {
      setGeneralError(isRTL ? "يرجى الموافقة والتأكيد على صحة البيانات للمتابعة." : "Please check the confirmation box to proceed.");
      return;
    }

    setIsSubmitting(true);
    setGeneralError(null);

    const resolvedShipmentType =
      formData.shipmentType === "Other" && formData.customShipmentType.trim()
        ? formData.customShipmentType.trim()
        : formData.shipmentType;

    const payload = {
      ...formData,
      serviceId: selectedService,
      serviceTitle: activeService.title,
      shipmentType: resolvedShipmentType,
      shipment_type: resolvedShipmentType,
      customerName: user?.name || formData.customerName,
      customer_name: user?.name || formData.customerName,
      email: user?.email || formData.email,
      companyName: user?.company || formData.companyName,
      company_name: user?.company || formData.companyName,
      phone: user?.phone || formData.phone,
      whatsapp: formData.whatsapp || user?.phone || formData.phone,
      country: formData.pickupCountry,
      city: formData.pickupCity,
      address: formData.pickupAddress,
      pickupCountry: formData.pickupCountry,
      pickup_country: formData.pickupCountry,
      pickupCity: formData.pickupCity,
      pickup_city: formData.pickupCity,
      pickupAddress: formData.pickupAddress,
      pickup_address: formData.pickupAddress,
      pickupContactName: formData.pickupContactName,
      pickup_contact_name: formData.pickupContactName,
      pickupContactPhone: formData.pickupContactPhone,
      pickup_contact_phone: formData.pickupContactPhone,
      preferredPickupDate: formData.preferredPickupDate,
      preferred_pickup_date: formData.preferredPickupDate,
      pickupNotes: formData.pickupNotes,
      pickup_notes: formData.pickupNotes,
      deliveryCountry: formData.deliveryCountry,
      delivery_country: formData.deliveryCountry,
      deliveryCity: formData.deliveryCity,
      delivery_city: formData.deliveryCity,
      deliveryShortAddress: formData.deliveryShortAddress,
      delivery_short_address: formData.deliveryShortAddress,
      deliveryAddress: formData.deliveryAddress,
      delivery_address: formData.deliveryAddress,
      consigneeName: formData.consigneeName,
      consignee_name: formData.consigneeName,
      consigneePhone: formData.consigneePhone,
      consignee_phone: formData.consigneePhone,
      deliveryNotes: formData.deliveryNotes,
      delivery_notes: formData.deliveryNotes,
      packageCount: Number(formData.packageCount) || 1,
      package_count: Number(formData.packageCount) || 1,
      weight: Number(formData.weight) || 1,
      declaredValue: Number(formData.declaredValue) || 0,
      declared_value: Number(formData.declaredValue) || 0,
      isFragile: Boolean(formData.isFragile),
      is_fragile: Boolean(formData.isFragile),
      isTemperatureControlled: Boolean(formData.isTemperatureControlled),
      is_temperature_controlled: Boolean(formData.isTemperatureControlled),
      specialInstructions: formData.specialInstructions,
      special_instructions: formData.specialInstructions,
    };

    try {
      const res = await fetch("/api/shipment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSubmittedData(json.data);
          try {
            sessionStorage.setItem(STORAGE_KEY_SUBMITTED, JSON.stringify(json.data));
            sessionStorage.removeItem(STORAGE_KEY_DRAFT);
            sessionStorage.removeItem(STORAGE_KEY_STEP);
          } catch {}
          setIsSubmitting(false);
          return;
        }
      }

      const reqNumber = `REQ-${Math.floor(10000 + Math.random() * 90000)}`;
      const fallbackRequest = {
        ...payload,
        id: `req-${Date.now()}`,
        requestNumber: reqNumber,
        status: "New",
        createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      };

      setSubmittedData(fallbackRequest);
      try {
        sessionStorage.setItem(STORAGE_KEY_SUBMITTED, JSON.stringify(fallbackRequest));
        sessionStorage.removeItem(STORAGE_KEY_DRAFT);
        sessionStorage.removeItem(STORAGE_KEY_STEP);
      } catch {}
    } catch {
      const reqNumber = `REQ-${Math.floor(10000 + Math.random() * 90000)}`;
      const fallbackRequest = {
        ...payload,
        id: `req-${Date.now()}`,
        requestNumber: reqNumber,
        status: "New",
      };
      setSubmittedData(fallbackRequest);
      try {
        sessionStorage.setItem(STORAGE_KEY_SUBMITTED, JSON.stringify(fallbackRequest));
        sessionStorage.removeItem(STORAGE_KEY_DRAFT);
        sessionStorage.removeItem(STORAGE_KEY_STEP);
      } catch {}
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReqNumber(true);
    setTimeout(() => setCopiedReqNumber(false), 3000);
  };

  const generateWhatsAppUrl = (req: any) => {
    let text = "";
    const displayType = req.shipmentType || (formData.shipmentType === "Other" ? formData.customShipmentType : formData.shipmentType) || "-";
    const displayService = req.serviceTitle || activeService.title || "-";

    if (locale === "ar") {
      const rlm = "\u200F";
      const parts: string[] = [
        `${rlm}*طلب شحن دولي جديد - XSPEED Express*`,
        `${rlm}رقم الطلب: *${req.requestNumber}*`,
        `${rlm}نوع الخدمة: *${displayService}*`,
        `${rlm}────────────────────`,
        `${rlm}*بيانات العميل:*`,
        `${rlm}- الاسم: ${req.customerName || "-"}`,
        `${rlm}- البريد الإلكتروني: ${req.email || "-"}`,
        `${rlm}- الهاتف: ${req.phone || req.whatsapp || "-"}`,
      ];

      if (req.companyName) {
        parts.push(`${rlm}- الشركة: ${req.companyName}`);
      }

      parts.push(
        `${rlm}────────────────────`,
        `${rlm}*الاستلام (المنشأ):*`,
        `${rlm}- المدينة والدولة: ${req.pickupCity || "-"}، ${req.pickupCountry || "-"}`,
        `${rlm}- العنوان: ${req.pickupAddress || "-"}`,
        `${rlm}- مسؤول الاستلام: ${req.pickupContactName || "-"} (${req.pickupContactPhone || "-"})`
      );

      if (req.preferredPickupDate) {
        parts.push(`${rlm}- تاريخ الاستلام: ${req.preferredPickupDate}`);
      }

      parts.push(
        `${rlm}────────────────────`,
        `${rlm}*التسليم (الوجهة):*`,
        `${rlm}- الدولة والمدينة: ${req.deliveryCity || "-"}، ${req.deliveryCountry || "-"}`,
        `${rlm}- العنوان: ${req.deliveryAddress || "-"}`,
        `${rlm}- المستلم: ${req.consigneeName || "-"} (${req.consigneePhone || "-"})`
      );

      if (req.deliveryShortAddress) {
        parts.push(`${rlm}- العنوان المختصر: ${req.deliveryShortAddress}`);
      }
      if (req.deliveryNotes) {
        parts.push(`${rlm}- ملاحظات التسليم: ${req.deliveryNotes}`);
      }

      parts.push(
        `${rlm}────────────────────`,
        `${rlm}*تفاصيل ومواصفات الشحنة:*`,
        `${rlm}- الخدمة المطلوبة: ${displayService}`,
        `${rlm}- نوع الشحنة: ${displayType}`,
        `${rlm}- المحتويات: ${req.contents || "-"}`,
        `${rlm}- عدد الطرود: ${req.packageCount || "1"} طرد`,
        `${rlm}- الوزن الفعلي: ${req.weight || "-"} كجم`
      );

      if (req.length && req.width && req.height) {
        parts.push(`${rlm}- الأبعاد: ${req.length} × ${req.width} × ${req.height} سم`);
        const vol = ((Number(req.length) * Number(req.width) * Number(req.height)) / 5000).toFixed(2);
        parts.push(`${rlm}- الوزن الحجمي (IATA): ${vol} كجم`);
      }

      if (req.isFragile) parts.push(`${rlm}- شحنة قابلة للكسر (عناية خاصة)`);
      if (req.isTemperatureControlled) parts.push(`${rlm}- شحن مبرد (سلسلة تبريد)`);
      if (req.specialInstructions) parts.push(`${rlm}- تعليمات خاصة: ${req.specialInstructions}`);

      parts.push(
        `${rlm}────────────────────`,
        `${rlm}*يرجى تزويدي بأفضل عرض سعر شحن. شكراً لكم!*`
      );

      text = parts.join("\n");
    } else {
      const parts: string[] = [
        `*New International Shipment Request - XSPEED Express*`,
        `Request ID: *${req.requestNumber}*`,
        `Service Type: *${displayService}*`,
        `────────────────────`,
        `*Customer Details:*`,
        `- Name: ${req.customerName || "-"}`,
        `- Email: ${req.email || "-"}`,
        `- Phone: ${req.phone || req.whatsapp || "-"}`,
      ];

      if (req.companyName) {
        parts.push(`- Company: ${req.companyName}`);
      }

      parts.push(
        `────────────────────`,
        `*Pickup (Origin):*`,
        `- Location: ${req.pickupCity || "-"}, ${req.pickupCountry || "-"}`,
        `- Address: ${req.pickupAddress || "-"}`,
        `- Contact: ${req.pickupContactName || "-"} (${req.pickupContactPhone || "-"})`
      );

      if (req.preferredPickupDate) {
        parts.push(`- Date: ${req.preferredPickupDate}`);
      }

      parts.push(
        `────────────────────`,
        `*Delivery (Destination):*`,
        `- Location: ${req.deliveryCity || "-"}, ${req.deliveryCountry || "-"}`,
        `- Address: ${req.deliveryAddress || "-"}`,
        `- Consignee: ${req.consigneeName || "-"} (${req.consigneePhone || "-"})`
      );

      if (req.deliveryShortAddress) {
        parts.push(`- Short Address: ${req.deliveryShortAddress}`);
      }
      if (req.deliveryNotes) {
        parts.push(`- Delivery Notes: ${req.deliveryNotes}`);
      }

      parts.push(
        `────────────────────`,
        `*Cargo Specifications:*`,
        `- Service: ${displayService}`,
        `- Cargo Type: ${displayType}`,
        `- Contents: ${req.contents || "-"}`,
        `- Packages: ${req.packageCount || "1"}`,
        `- Actual Weight: ${req.weight || "-"} KG`
      );

      if (req.length && req.width && req.height) {
        parts.push(`- Dimensions: ${req.length} x ${req.width} x ${req.height} cm`);
        const vol = ((Number(req.length) * Number(req.width) * Number(req.height)) / 5000).toFixed(2);
        parts.push(`- Volumetric Weight: ${vol} KG`);
      }

      if (req.isFragile) parts.push(`- Fragile Goods`);
      if (req.isTemperatureControlled) parts.push(`- Cold Chain / Temperature Controlled`);
      if (req.specialInstructions) parts.push(`- Special Instructions: ${req.specialInstructions}`);

      parts.push(
        `────────────────────`,
        `*Please review and send the best quote. Thank you!*`
      );

      text = parts.join("\n");
    }

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  // SUCCESS SCREEN (Minimal & focused, no profile redirect button)
  if (submittedData) {
    const waUrl = generateWhatsAppUrl(submittedData);

    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto animate-fade-up">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase px-3 py-1 rounded-full tracking-wider inline-block">
            {isRTL ? "تم تسجيل الطلب بنجاح" : "Request Submitted"}
          </span>
          <h2 className="text-2xl font-display font-black text-[#251516] tracking-tight">
            {isRTL ? "طلبك قيد المعالجة والتسعير!" : "Your Request is Being Quoted!"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            {isRTL
              ? "يقوم فريق العمليات بحساب أفضل سعر تنافسي لشحنتك وإرساله مباشرة لك عبر واتساب."
              : "Our team is calculating the best express rate and sending your quote on WhatsApp."}
          </p>
        </div>

        <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-5 space-y-2 max-w-sm mx-auto text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            {isRTL ? "رقم الطلب المرجعي" : "Request Reference"}
          </span>
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl font-mono font-black text-[#251516] tracking-wider" dir="ltr">
              {submittedData.requestNumber}
            </p>
            <button
              type="button"
              onClick={() => copyToClipboard(submittedData.requestNumber)}
              className="p-1.5 rounded-lg bg-white hover:bg-orange-100 text-[#C45B2A] border border-orange-200 transition-colors cursor-pointer"
              title={isRTL ? "نسخ الرقم" : "Copy"}
            >
              {copiedReqNumber ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            {submittedData.pickupCity} → {submittedData.deliveryCity}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isRTL ? "متابعة الطلب واستلام السعر عبر واتساب" : "Chat & Receive Quote on WhatsApp"}</span>
          </a>

          <button
            type="button"
            onClick={handleStartNewRequest}
            className="h-11 px-5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isRTL ? "طلب جديد" : "New Request"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden w-full mx-auto ${isRTL ? "text-right" : "text-left"}`}>
      {/* Stepper Header with 5-Step Progress */}
      <div className="bg-[#211112] text-white p-5 sm:p-6 border-b border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C45B2A]/20 text-[#E07A48] border border-[#C45B2A]/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                {isRTL ? "طلب شحن سريع وتحديد الأسعار" : "Direct Shipment Request"}
              </h2>
              <p className="text-xs text-gray-300">
                {isRTL ? "منظومة XSPEED المتكاملة للشحن والخدمات اللوجستية" : "XSPEED Integrated Freight & Logistics System"}
              </p>
            </div>
          </div>

          <div className="self-start sm:self-auto flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-white/10 border border-white/15 text-orange-200">
              {isRTL ? `الخطوة ${step} من 5` : `Step ${step} of 5`}
            </span>
          </div>
        </div>

        {/* Stepper Navigation Indicator (5 Steps) */}
        <div className="pt-2 border-t border-white/10">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center text-xs font-bold w-full">
            {/* Step 1: Service Type */}
            <button
              type="button"
              onClick={() => updateStep(1)}
              className={`py-2 px-1 sm:px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                step === 1
                  ? "bg-[#C45B2A] text-white shadow-md"
                  : step > 1
                  ? "bg-white/20 text-emerald-200 hover:bg-white/30"
                  : "bg-white/5 text-gray-400"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRTL ? "1. نوع الخدمة" : "1. Service"}</span>
              <span className="sm:hidden">1</span>
            </button>

            {/* Step 2: Pickup */}
            <button
              type="button"
              onClick={() => step > 2 && updateStep(2)}
              disabled={step < 2}
              className={`py-2 px-1 sm:px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                step === 2
                  ? "bg-[#C45B2A] text-white shadow-md cursor-pointer"
                  : step > 2
                  ? "bg-white/20 text-emerald-200 hover:bg-white/30 cursor-pointer"
                  : "bg-white/5 text-gray-400 cursor-not-allowed"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRTL ? "2. الاستلام" : "2. Pickup"}</span>
              <span className="sm:hidden">2</span>
            </button>

            {/* Step 3: Delivery */}
            <button
              type="button"
              onClick={() => step > 3 && updateStep(3)}
              disabled={step < 3}
              className={`py-2 px-1 sm:px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                step === 3
                  ? "bg-[#C45B2A] text-white shadow-md cursor-pointer"
                  : step > 3
                  ? "bg-white/20 text-emerald-200 hover:bg-white/30 cursor-pointer"
                  : "bg-white/5 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRTL ? "3. التسليم" : "3. Delivery"}</span>
              <span className="sm:hidden">3</span>
            </button>

            {/* Step 4: Cargo */}
            <button
              type="button"
              onClick={() => step > 4 && updateStep(4)}
              disabled={step < 4}
              className={`py-2 px-1 sm:px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                step === 4
                  ? "bg-[#C45B2A] text-white shadow-md cursor-pointer"
                  : step > 4
                  ? "bg-white/20 text-emerald-200 hover:bg-white/30 cursor-pointer"
                  : "bg-white/5 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRTL ? "4. الشحنة" : "4. Cargo"}</span>
              <span className="sm:hidden">4</span>
            </button>

            {/* Step 5: Confirm */}
            <div
              className={`py-2 px-1 sm:px-2 rounded-xl flex items-center justify-center gap-1.5 ${
                step === 5 ? "bg-[#C45B2A] text-white shadow-md" : "bg-white/5 text-gray-400"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRTL ? "5. التأكيد" : "5. Confirm"}</span>
              <span className="sm:hidden">5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Validation Alert */}
      {generalError && (
        <div className="m-5 mb-0 p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fade-up">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <div className="p-5 sm:p-7 md:p-8 space-y-6">
        {/* Shipper Status */}
        {user && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center gap-3 text-xs text-emerald-950">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-bold text-emerald-900">
                {isRTL ? "العميل:" : "Shipper:"} <strong className="font-black">{user.name}</strong>
              </span>
              <span className="font-mono text-emerald-700 text-[11px]" dir="ltr">({user.email})</span>
              {user.company && (
                <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                  • <Building className="w-3 h-3 inline" /> {user.company}
                </span>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: SELECT SERVICE TYPE (GRID SYSTEM) */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-up">
            <div className="border-b border-gray-100 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#251516] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#C45B2A]" />
                    <span>{isRTL ? "الخطوة الابتدائية: حدد نوع الخدمة اللوجستية المطلوبة" : "Initial Step: Select Logistics Service"}</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {isRTL
                      ? "اختر الخدمة المناسبة من الشبكة أدناه للمتابعة إلى إدخال بيانات الشحنة والاستلام والتسليم وحساب التسعير."
                      : "Select the logistics solution tailored to your freight needs to configure your shipment and get an instant quote."}
                  </p>
                </div>
                <span className="self-start sm:self-auto text-[11px] font-bold px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-[#C45B2A]">
                  {isRTL ? "الخطوة 1 من 5" : "Step 1 of 5"}
                </span>
              </div>
            </div>

            {/* Interactive Grid System */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4"
              role="radiogroup"
              aria-label={isRTL ? "قائمة الخدمات اللوجستية" : "Logistics Services List"}
            >
              {servicesList.map((svc) => {
                const isSelected = selectedService === svc.id;
                const IconComponent = svc.icon;

                return (
                  <div
                    key={svc.id}
                    onClick={() => handleServiceSelect(svc.id, !svc.isForm)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleServiceSelect(svc.id, !svc.isForm);
                      }
                    }}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    className={`relative group rounded-2xl p-4 sm:p-5 text-start transition-all duration-200 cursor-pointer border-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C45B2A]/20 flex flex-col justify-between select-none min-h-[160px] ${
                      isSelected
                        ? svc.isForm
                          ? "bg-gradient-to-br from-orange-50/90 via-orange-50/40 to-white border-[#C45B2A] shadow-md ring-2 ring-[#C45B2A]/20 transform -translate-y-0.5"
                          : "bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20 transform -translate-y-0.5"
                        : "bg-white border-gray-200/90 hover:border-orange-300 hover:bg-orange-50/20 hover:shadow-xs hover:-translate-y-0.5"
                    }`}
                  >
                    <div>
                      {/* Card Top Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                            isSelected
                              ? svc.isForm
                                ? "bg-[#C45B2A] text-white shadow-xs"
                                : "bg-emerald-600 text-white shadow-xs"
                              : "bg-orange-50 text-[#C45B2A] group-hover:bg-[#C45B2A] group-hover:text-white"
                          }`}
                        >
                          <IconComponent className="w-5 h-5 stroke-[2.2]" />
                        </div>

                        {isSelected ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs ${
                              svc.isForm
                                ? "text-[#C45B2A] bg-orange-100/90 border border-orange-300"
                                : "text-emerald-800 bg-emerald-100/90 border border-emerald-300"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{isRTL ? "محدد" : "Selected"}</span>
                          </span>
                        ) : (
                          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${svc.badgeBg}`}>
                            {svc.tag}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="mt-3.5 space-y-1.5">
                        <h4
                          className={`font-extrabold text-sm sm:text-base leading-snug transition-colors ${
                            isSelected
                              ? svc.isForm
                                ? "text-[#C45B2A]"
                                : "text-emerald-800"
                              : "text-gray-900 group-hover:text-[#C45B2A]"
                          }`}
                        >
                          {svc.title}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {svc.desc}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Hint */}
                    <div className="pt-3 mt-3 border-t border-gray-100/80 flex items-center justify-between text-[11px] font-bold">
                      <span className={isSelected ? (svc.isForm ? "text-[#C45B2A]" : "text-emerald-700") : "text-gray-400 group-hover:text-gray-600"}>
                        {svc.shortTitle}
                      </span>
                      <span className={`flex items-center gap-1 ${isSelected ? (svc.isForm ? "text-[#C45B2A]" : "text-emerald-700") : "text-gray-400 group-hover:text-[#C45B2A]"}`}>
                        <span>
                          {isSelected
                            ? svc.isForm
                              ? (isRTL ? "تسجيل بيانات الشحنة" : "Fill Shipment Data")
                              : (isRTL ? "تنسيق فوري عبر واتساب" : "Direct WhatsApp Chat")
                            : svc.isForm
                            ? (isRTL ? "انقر لتسجيل البيانات" : "Click to fill data")
                            : (isRTL ? "انقر للمتابعة عبر واتساب" : "Click for WhatsApp")}
                        </span>
                        {svc.isForm ? (
                          <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
                        ) : (
                          <ExternalLink className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Service Summary Bar (Clean & Focused, Single Action at Footer) */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 shadow-2xs transition-all ${
                activeService.isForm
                  ? "bg-gradient-to-r from-orange-50/90 via-white to-orange-50/50 border-orange-200"
                  : "bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/50 border-emerald-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl text-white shrink-0 shadow-2xs ${
                    activeService.isForm ? "bg-[#C45B2A]" : "bg-emerald-600"
                  }`}
                >
                  <activeService.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      {isRTL ? "الخدمة المحددة حالياً:" : "Current Selection:"}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeService.badgeBg}`}>
                      {activeService.tag}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-gray-900 mt-0.5">
                    {activeService.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {activeService.isForm
                      ? (isRTL ? "متابعة إدخال بيانات الاستلام والتسليم ومواصفات الشحنة." : "Proceed to fill cargo, pickup and delivery specifications.")
                      : (isRTL ? "خدمة استشارية وتنسيق مباشر — اضغط على زر واتساب أدناه للتواصل الفوري مع مسؤولي العمليات." : "Direct consultation service — Click WhatsApp button below for instant support.")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PICKUP DETAILS */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-up">
            <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#251516] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C45B2A]" />
                <span>{isRTL ? "بيانات وموقع الاستلام (المنشأ)" : "Pickup Location & Contact"}</span>
              </h3>
              <span className="text-[11px] font-bold text-gray-500">{isRTL ? "الخطوة 2 من 5" : "Step 2 of 5"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "دولة الاستلام" : "Pickup Country"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Globe className={`absolute ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-gray-400 pointer-events-none`} />
                  <input
                    type="text"
                    value={formData.pickupCountry}
                    onChange={(e) => handleChange("pickupCountry", e.target.value)}
                    placeholder="Egypt"
                    className={`w-full h-10 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border outline-none transition-all ${
                      fieldErrors.pickupCountry ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                    } ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    required
                  />
                </div>
                {fieldErrors.pickupCountry && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.pickupCountry}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "مدينة الاستلام" : "Pickup City"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <MapPin className={`absolute ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-gray-400 pointer-events-none`} />
                  <input
                    type="text"
                    value={formData.pickupCity}
                    onChange={(e) => handleChange("pickupCity", e.target.value)}
                    placeholder="Cairo"
                    className={`w-full h-10 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border outline-none transition-all ${
                      fieldErrors.pickupCity ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                    } ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    required
                  />
                </div>
                {fieldErrors.pickupCity && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.pickupCity}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "عنوان الاستلام بالتفصيل" : "Detailed Pickup Address"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.pickupAddress}
                  onChange={(e) => handleChange("pickupAddress", e.target.value)}
                  placeholder={isRTL ? "الشارع، رقم المبنى، اسم الشركة أو المخزن" : "Street name, building number, warehouse..."}
                  className={`w-full h-10 px-3.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border outline-none transition-all ${
                    fieldErrors.pickupAddress ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                  }`}
                  required
                />
                {fieldErrors.pickupAddress && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.pickupAddress}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "اسم مسؤول الاستلام" : "Contact Person Name"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className={`absolute ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-gray-400 pointer-events-none`} />
                  <input
                    type="text"
                    value={formData.pickupContactName}
                    onChange={(e) => handleChange("pickupContactName", e.target.value)}
                    placeholder="Ahmed"
                    className={`w-full h-10 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border outline-none transition-all ${
                      fieldErrors.pickupContactName ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                    } ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    required
                  />
                </div>
                {fieldErrors.pickupContactName && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.pickupContactName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "رقم هاتف مسؤول الاستلام" : "Contact Phone"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone className={`absolute ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-gray-400 pointer-events-none`} />
                  <input
                    type="tel"
                    value={formData.pickupContactPhone}
                    onChange={(e) => handleChange("pickupContactPhone", e.target.value)}
                    placeholder="+20 120 802 7171"
                    dir="ltr"
                    className={`w-full h-10 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border outline-none transition-all ${
                      fieldErrors.pickupContactPhone ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                    } ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    required
                  />
                </div>
                {fieldErrors.pickupContactPhone && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.pickupContactPhone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "تاريخ الاستلام المفضل" : "Preferred Pickup Date"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Calendar className={`absolute ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-gray-400 pointer-events-none`} />
                  <input
                    type="date"
                    value={formData.preferredPickupDate}
                    onChange={(e) => handleChange("preferredPickupDate", e.target.value)}
                    className={`w-full h-10 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border outline-none transition-all ${
                      fieldErrors.preferredPickupDate ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                    } ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    required
                  />
                </div>
                {fieldErrors.preferredPickupDate && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.preferredPickupDate}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "ملاحظات الاستلام (اختياري)" : "Pickup Notes (Optional)"}
                </label>
                <input
                  type="text"
                  value={formData.pickupNotes}
                  onChange={(e) => handleChange("pickupNotes", e.target.value)}
                  placeholder={isRTL ? "مواعيد التحميل، تفاصيل البوابة..." : "Dock hours, gate instructions..."}
                  className="w-full h-10 px-3.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DELIVERY DETAILS */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-up">
            <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#251516] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C45B2A]" />
                <span>{isRTL ? "بيانات وموقع التسليم (الوجهة)" : "Delivery Destination & Consignee"}</span>
              </h3>
              <span className="text-[11px] font-bold text-gray-500">{isRTL ? "الخطوة 3 من 5" : "Step 3 of 5"}</span>
            </div>

            {/* Popular Destination Chips */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                {isRTL ? "الوجهات الدولية الشائعة:" : "Popular Destinations:"}
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.code}
                    type="button"
                    onClick={() => handleChange("deliveryCountry", dest.country)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.deliveryCountry.toLowerCase() === dest.country.toLowerCase()
                        ? "bg-[#C45B2A] text-white border-[#C45B2A] shadow-xs"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <span>{isRTL ? dest.countryAr : dest.country}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "دولة التسليم (الوجهة)" : "Destination Country"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Globe className={`absolute ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-gray-400 pointer-events-none`} />
                  <input
                    type="text"
                    value={formData.deliveryCountry}
                    onChange={(e) => handleChange("deliveryCountry", e.target.value)}
                    placeholder="United Arab Emirates"
                    className={`w-full h-10 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border outline-none transition-all ${
                      fieldErrors.deliveryCountry ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                    } ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    required
                  />
                </div>
                {fieldErrors.deliveryCountry && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.deliveryCountry}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "مدينة التسليم" : "Destination City"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <MapPin className={`absolute ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-gray-400 pointer-events-none`} />
                  <input
                    type="text"
                    value={formData.deliveryCity}
                    onChange={(e) => handleChange("deliveryCity", e.target.value)}
                    placeholder={isRTL ? "دبي، الرياض، لندن..." : "Dubai, Riyadh, London..."}
                    className={`w-full h-10 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border outline-none transition-all ${
                      fieldErrors.deliveryCity ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                    } ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    required
                  />
                </div>
                {fieldErrors.deliveryCity && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.deliveryCity}</p>}
              </div>

              {/* Short Address / Postal Code */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>{isRTL ? "العنوان الوطني المختصر / الرمز البريدي" : "Short National Address / Postal Code"}</span>
                  <span className="text-[11px] text-[#C45B2A] font-bold">{isRTL ? "هام للشحنات للخليج والسعودية" : "Recommended for GCC"}</span>
                </label>
                <div className="relative flex items-center">
                  <Hash className={`absolute ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-gray-400 pointer-events-none`} />
                  <input
                    type="text"
                    value={formData.deliveryShortAddress}
                    onChange={(e) => handleChange("deliveryShortAddress", e.target.value)}
                    placeholder={isRTL ? "مثال: RRRD2929 أو 12345" : "e.g. RRRD2929 or 12345"}
                    dir="ltr"
                    className={`w-full h-10 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                      isRTL ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
                    }`}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "عنوان التسليم بالتفصيل" : "Detailed Delivery Address"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.deliveryAddress}
                  onChange={(e) => handleChange("deliveryAddress", e.target.value)}
                  placeholder={isRTL ? "اسم الشارع، الحي، رقم المبنى، الشقة أو المكتب" : "Street name, district, building, apt/suite..."}
                  className={`w-full h-10 px-3.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border outline-none transition-all ${
                    fieldErrors.deliveryAddress ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                  }`}
                  required
                />
                {fieldErrors.deliveryAddress && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.deliveryAddress}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "اسم المستلم" : "Consignee Name"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className={`absolute ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-gray-400 pointer-events-none`} />
                  <input
                    type="text"
                    value={formData.consigneeName}
                    onChange={(e) => handleChange("consigneeName", e.target.value)}
                    placeholder="Mohammed Ali"
                    className={`w-full h-10 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border outline-none transition-all ${
                      fieldErrors.consigneeName ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                    } ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    required
                  />
                </div>
                {fieldErrors.consigneeName && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.consigneeName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "رقم هاتف المستلم" : "Consignee Phone"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone className={`absolute ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-gray-400 pointer-events-none`} />
                  <input
                    type="tel"
                    value={formData.consigneePhone}
                    onChange={(e) => handleChange("consigneePhone", e.target.value)}
                    placeholder="+971 50 123 4567"
                    dir="ltr"
                    className={`w-full h-10 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border outline-none transition-all ${
                      fieldErrors.consigneePhone ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                    } ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    required
                  />
                </div>
                {fieldErrors.consigneePhone && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.consigneePhone}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "تعليمات التوصيل والتسليم (اختياري)" : "Delivery Instructions (Optional)"}
                </label>
                <input
                  type="text"
                  value={formData.deliveryNotes}
                  onChange={(e) => handleChange("deliveryNotes", e.target.value)}
                  placeholder={isRTL ? "الاتصال قبل التوصيل بنصف ساعة..." : "Call before arrival, leave with reception..."}
                  className="w-full h-10 px-3.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CARGO & SPECIFICATIONS */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-up">
            <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#251516] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#C45B2A]" />
                <span>{isRTL ? "مواصفات ومحتويات الشحنة" : "Cargo Specifications & Dimensions"}</span>
              </h3>
              <span className="text-[11px] font-bold text-gray-500">{isRTL ? "الخطوة 4 من 5" : "Step 4 of 5"}</span>
            </div>

            {/* Shipment Category Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                {isRTL ? "نوع وطبيعة الشحنة" : "Shipment Nature"} <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "Documents", title: isRTL ? "مستندات ووثائق" : "Documents" },
                  { id: "Parcel", title: isRTL ? "طرد شخصي" : "Personal Parcel" },
                  { id: "Commercial Goods", title: isRTL ? "بضائع وشحن تجاري" : "Commercial Goods" },
                  { id: "Other", title: isRTL ? "أخرى (مخصص)" : "Other (Custom)" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleChange("shipmentType", type.id)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      formData.shipmentType === type.id
                        ? "bg-[#251516] text-white border-[#251516] shadow-xs"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200"
                    }`}
                  >
                    <span className="text-xs font-bold">{type.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Type Input if 'Other' */}
            {formData.shipmentType === "Other" && (
              <div className="animate-fade-up">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "حدد نوع الشحنة الخاصة" : "Specify Custom Shipment Type"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customShipmentType}
                  onChange={(e) => handleChange("customShipmentType", e.target.value)}
                  placeholder={isRTL ? "مثال: عينات مخبرية، قطع غيار خاصة..." : "e.g. Lab samples, spare parts..."}
                  className={`w-full h-10 px-3.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border outline-none transition-all ${
                    fieldErrors.customShipmentType ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                  }`}
                  required
                />
                {fieldErrors.customShipmentType && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.customShipmentType}</p>}
              </div>
            )}

            {/* Contents Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isRTL ? "وصف محتويات الشحنة بالتفصيل" : "Detailed Description of Contents"} <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={formData.contents}
                onChange={(e) => handleChange("contents", e.target.value)}
                placeholder={isRTL ? "مثال: ملابس جاهزة، أجهزة إلكترونية، مستندات قانونية، عينات تجارية..." : "e.g. Garments, electronics, legal contracts, spare parts..."}
                className={`w-full p-3 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border outline-none transition-all resize-none ${
                  fieldErrors.contents ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                }`}
                required
              />
              {fieldErrors.contents && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.contents}</p>}
            </div>

            {/* Weight, Packages & Declared Value */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "عدد الطرود" : "Number of Packages"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.packageCount}
                  onChange={(e) => handleChange("packageCount", e.target.value)}
                  className={`w-full h-10 px-3.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border outline-none transition-all ${
                    fieldErrors.packageCount ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                  }`}
                  required
                />
                {fieldErrors.packageCount && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.packageCount}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "الوزن الفعلي الإجمالي (كجم)" : "Actual Total Weight (KG)"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  className={`w-full h-10 px-3.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border outline-none transition-all ${
                    fieldErrors.weight ? "border-rose-400 ring-2 ring-rose-100" : "border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20"
                  }`}
                  required
                />
                {fieldErrors.weight && <p className="text-[11px] font-bold text-rose-600 mt-1">{fieldErrors.weight}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "القيمة المصرح بها ($ USD)" : "Declared Value ($ USD)"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.declaredValue}
                  onChange={(e) => handleChange("declaredValue", e.target.value)}
                  className="w-full h-10 px-3.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Package Dimensions & Volumetric Weight (IATA) */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#C45B2A]" />
                  <span>{isRTL ? "أبعاد الطرد (سم) - لحساب الوزن الحجمي:" : "Package Dimensions (cm) - For Volumetric Weight:"}</span>
                </label>
                {volumetricWeight && (
                  <span className="font-mono text-xs font-bold text-[#C45B2A] bg-orange-100 px-2.5 py-0.5 rounded-lg border border-orange-200">
                    {isRTL ? `الوزن الحجمي (IATA): ${volumetricWeight} كجم` : `IATA Volumetric Wt: ${volumetricWeight} KG`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="number"
                    min="1"
                    placeholder={isRTL ? "الطول L" : "Length (L)"}
                    value={formData.length}
                    onChange={(e) => handleChange("length", e.target.value)}
                    className="w-full h-10 px-3 bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    placeholder={isRTL ? "العرض W" : "Width (W)"}
                    value={formData.width}
                    onChange={(e) => handleChange("width", e.target.value)}
                    className="w-full h-10 px-3 bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    placeholder={isRTL ? "الارتفاع H" : "Height (H)"}
                    value={formData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    className="w-full h-10 px-3 bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Special Handling Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all select-none">
                <input
                  type="checkbox"
                  checked={formData.isFragile}
                  onChange={(e) => handleChange("isFragile", e.target.checked)}
                  className="w-4 h-4 text-[#C45B2A] rounded border-gray-300 focus:ring-[#C45B2A]"
                />
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-gray-800">
                    {isRTL ? "شحنة قابلة للكسر (عناية فائقة)" : "Fragile Goods (Handle with Care)"}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all select-none">
                <input
                  type="checkbox"
                  checked={formData.isTemperatureControlled}
                  onChange={(e) => handleChange("isTemperatureControlled", e.target.checked)}
                  className="w-4 h-4 text-[#C45B2A] rounded border-gray-300 focus:ring-[#C45B2A]"
                />
                <div className="flex items-center gap-2">
                  <ThermometerSnowflake className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-gray-800">
                    {isRTL ? "شحن مبرد / سلسلة تبريد" : "Cold Chain / Refrig."}
                  </span>
                </div>
              </label>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isRTL ? "تعليمات خاصة أو متطلبات جمركية إضافية (اختياري)" : "Special Instructions / Customs Notes (Optional)"}
              </label>
              <input
                type="text"
                value={formData.specialInstructions}
                onChange={(e) => handleChange("specialInstructions", e.target.value)}
                placeholder={isRTL ? "مثال: عدم قلب الصندوق، تجهيز شهادة منشأ..." : "e.g. Keep upright, certificate of origin required..."}
                className="w-full h-10 px-3.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & CONFIRM */}
        {step === 5 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up">
            <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-[#251516] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#C45B2A]" />
                  <span>{isRTL ? "مراجعة وتأكيد طلب الشحن" : "Review & Confirm Request"}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isRTL
                    ? "يرجى مراجعة كافة التفاصيل بدقة قبل إرسال الطلب لفريق العمليات والتسعير."
                    : "Please review all consignment details carefully before submitting for pricing."}
                </p>
              </div>

              <span className="self-start sm:self-auto text-[11px] font-bold px-3 py-1 rounded-full bg-orange-100/70 border border-orange-200 text-[#C45B2A]">
                {isRTL ? "الخطوة الأخيرة 5 من 5" : "Final Step 5 of 5"}
              </span>
            </div>

            {/* Visual Route Journey Banner */}
            <div className="bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-orange-50/90 border border-orange-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 font-black text-sm sm:text-base text-[#251516]">
                    <div className="p-1.5 rounded-lg bg-white text-[#C45B2A] border border-orange-200 shadow-2xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>{formData.pickupCity || "Cairo"}, {formData.pickupCountry || "Egypt"}</span>
                  </div>

                  <div className="flex items-center text-[#C45B2A] px-1 font-bold">
                    <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                  </div>

                  <div className="flex items-center gap-1.5 font-black text-sm sm:text-base text-[#251516]">
                    <div className="p-1.5 rounded-lg bg-white text-[#C45B2A] border border-orange-200 shadow-2xs">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span>{formData.deliveryCity || "-"}, {formData.deliveryCountry || "-"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white border border-orange-200 text-[#C45B2A] shadow-2xs">
                    {getShipmentTypeLabel(formData.shipmentType, formData.customShipmentType)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-[#251516] text-white shadow-2xs" dir="ltr">
                    {formData.weight} KG • {formData.packageCount} {isRTL ? "طرد" : "pkgs"}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Service Type */}
              <div className="bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 transition-colors md:col-span-2">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-100/80 text-[#C45B2A]">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#251516]">
                        {isRTL ? "1. نوع الخدمة اللوجستية المطلوبة" : "1. Selected Logistics Service"}
                      </h4>
                      <p className="text-[11px] text-gray-500">{activeService.title}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateStep(1)}
                    className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 text-[#C45B2A] border border-gray-200 hover:border-orange-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    title={isRTL ? "تعديل نوع الخدمة" : "Edit Service Type"}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isRTL ? "تعديل" : "Edit"}</span>
                  </button>
                </div>
                <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-200/80 leading-relaxed">
                  {activeService.desc}
                </p>
              </div>

              {/* Card 2: Pickup */}
              <div className="bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 transition-colors">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-100/80 text-[#C45B2A]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#251516]">
                        {isRTL ? "2. بيانات وموقع الاستلام (المنشأ)" : "2. Pickup Location & Origin"}
                      </h4>
                      <p className="text-[11px] text-gray-500">{formData.pickupCity}، {formData.pickupCountry}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateStep(2)}
                    className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 text-[#C45B2A] border border-gray-200 hover:border-orange-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    title={isRTL ? "تعديل بيانات الاستلام" : "Edit Pickup Details"}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isRTL ? "تعديل" : "Edit"}</span>
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                      {isRTL ? "عنوان الاستلام بالتفصيل:" : "Detailed Pickup Address:"}
                    </span>
                    <p className="font-semibold text-gray-900 bg-white p-3 rounded-xl border border-gray-200/80 leading-relaxed break-words">
                      {formData.pickupAddress || "—"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/70">
                      <span className="text-[11px] font-bold uppercase text-gray-400 block mb-0.5">
                        {isRTL ? "مسؤول الاستلام:" : "Contact Person:"}
                      </span>
                      <p className="font-bold text-gray-900">{formData.pickupContactName || "—"}</p>
                      <p className="font-mono font-bold text-[#C45B2A] text-xs mt-1" dir="ltr">
                        {formData.pickupContactPhone || "—"}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/70">
                      <span className="text-[11px] font-bold uppercase text-gray-400 block mb-0.5">
                        {isRTL ? "تاريخ الاستلام المفضل:" : "Pickup Date:"}
                      </span>
                      <div className="inline-flex items-center gap-1.5 font-bold text-gray-900 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-[#C45B2A]" />
                        <span dir="ltr" className="font-mono">{formData.preferredPickupDate || "—"}</span>
                      </div>
                    </div>
                  </div>

                  {formData.pickupNotes && (
                    <div className="pt-1">
                      <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                        {isRTL ? "ملاحظات الاستلام:" : "Pickup Notes:"}
                      </span>
                      <p className="text-gray-800 bg-amber-50/80 border border-amber-200 p-2.5 rounded-xl text-xs leading-relaxed break-words font-medium">
                        {formData.pickupNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Delivery */}
              <div className="bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 transition-colors">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-100/80 text-[#C45B2A]">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#251516]">
                        {isRTL ? "3. بيانات وموقع التسليم (الوجهة)" : "3. Delivery Destination & Consignee"}
                      </h4>
                      <p className="text-[11px] text-gray-500">{formData.deliveryCity}، {formData.deliveryCountry}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateStep(3)}
                    className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 text-[#C45B2A] border border-gray-200 hover:border-orange-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    title={isRTL ? "تعديل بيانات التسليم" : "Edit Delivery Details"}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isRTL ? "تعديل" : "Edit"}</span>
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                      {isRTL ? "عنوان التسليم بالتفصيل:" : "Detailed Delivery Address:"}
                    </span>
                    <p className="font-semibold text-gray-900 bg-white p-3 rounded-xl border border-gray-200/80 leading-relaxed break-words">
                      {formData.deliveryAddress || "—"}
                    </p>
                  </div>

                  {formData.deliveryShortAddress ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-4 h-4 text-[#C45B2A] shrink-0" />
                        <span className="text-xs font-extrabold text-gray-800">
                          {isRTL ? "العنوان الوطني المختصر / الرمز البريدي:" : "Short Address / Postal Code:"}
                        </span>
                      </div>
                      <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-white border border-orange-300 text-[#C45B2A] tracking-wider shadow-2xs" dir="ltr">
                        {formData.deliveryShortAddress}
                      </span>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/70">
                      <span className="text-[11px] font-bold uppercase text-gray-400 block mb-0.5">
                        {isRTL ? "اسم المستلم:" : "Consignee Name:"}
                      </span>
                      <p className="font-bold text-gray-900">{formData.consigneeName || "—"}</p>
                      <p className="font-mono font-bold text-[#C45B2A] text-xs mt-1" dir="ltr">
                        {formData.consigneePhone || "—"}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/70">
                      <span className="text-[11px] font-bold uppercase text-gray-400 block mb-0.5">
                        {isRTL ? "وجهة الوصول والدولة:" : "Destination & Country:"}
                      </span>
                      <p className="font-bold text-gray-900">{formData.deliveryCity}</p>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">{formData.deliveryCountry}</p>
                    </div>
                  </div>

                  {formData.deliveryNotes && (
                    <div className="pt-1">
                      <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                        {isRTL ? "ملاحظات التسليم:" : "Delivery Instructions:"}
                      </span>
                      <p className="text-gray-800 bg-amber-50/80 border border-amber-200 p-2.5 rounded-xl text-xs leading-relaxed break-words font-medium">
                        {formData.deliveryNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 4: Cargo */}
              <div className="bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 transition-colors">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-100/80 text-[#C45B2A]">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#251516]">
                        {isRTL ? "4. مواصفات ومحتويات الشحنة" : "4. Cargo & Specifications"}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {getShipmentTypeLabel(formData.shipmentType, formData.customShipmentType)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateStep(4)}
                    className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 text-[#C45B2A] border border-gray-200 hover:border-orange-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    title={isRTL ? "تعديل تفاصيل الشحنة" : "Edit Cargo Details"}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isRTL ? "تعديل" : "Edit"}</span>
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                      {isRTL ? "محتويات الشحنة بالتفصيل:" : "Cargo Contents Description:"}
                    </span>
                    <p className="font-semibold text-gray-900 bg-white p-3 rounded-xl border border-gray-200/80 leading-relaxed break-words">
                      {formData.contents || "—"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/70 text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        {isRTL ? "الوزن الفعلي" : "Actual Weight"}
                      </span>
                      <span className="font-mono font-black text-sm text-gray-900" dir="ltr">
                        {formData.weight} KG
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/70 text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        {isRTL ? "عدد الطرود" : "Packages"}
                      </span>
                      <span className="font-mono font-black text-sm text-gray-900" dir="ltr">
                        {formData.packageCount} {isRTL ? "طرد" : "pkgs"}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/70 text-center col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        {isRTL ? "القيمة المعلنة" : "Declared Value"}
                      </span>
                      <span className="font-mono font-black text-sm text-emerald-700" dir="ltr">
                        ${formData.declaredValue || 0} USD
                      </span>
                    </div>
                  </div>

                  {formData.length && formData.width && formData.height ? (
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <Layers className="w-3.5 h-3.5 text-[#C45B2A]" />
                        <span>{isRTL ? "الأبعاد:" : "Dimensions:"}</span>
                        <span className="font-mono font-bold text-gray-900" dir="ltr">
                          {formData.length} × {formData.width} × {formData.height} cm
                        </span>
                      </div>
                      {volumetricWeight && (
                        <span className="font-mono text-[11px] font-bold text-[#C45B2A] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          {volumetricWeight} KG Vol.
                        </span>
                      )}
                    </div>
                  ) : null}

                  {(formData.isFragile || formData.isTemperatureControlled || formData.specialInstructions) && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {formData.isFragile && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>{isRTL ? "شحنة قابلة للكسر (عناية خاصة)" : "Fragile Goods"}</span>
                          </span>
                        )}
                        {formData.isTemperatureControlled && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-300 text-sky-900 text-[11px] font-bold">
                            <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-600" />
                            <span>{isRTL ? "شحن مبرد / سلسلة تبريد" : "Cold Chain / Refrig."}</span>
                          </span>
                        )}
                      </div>

                      {formData.specialInstructions && (
                        <p className="text-gray-700 bg-white p-2 rounded-lg border border-gray-200/70 text-[11px] leading-relaxed break-words">
                          <strong className="text-gray-900">{isRTL ? "تعليمات خاصة: " : "Special Notes: "}</strong>
                          {formData.specialInstructions}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card 5: Shipper Account */}
              <div className="bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 transition-colors">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-800">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#251516]">
                        {isRTL ? "5. بيانات العميل مقدم الطلب" : "5. Shipper Account & Contact"}
                      </h4>
                      <p className="text-[11px] text-gray-500">{isRTL ? "الحساب المعتمد لتلقي عرض السعر" : "Account authorized for rate quote"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/70">
                      <span className="text-[11px] font-bold uppercase text-gray-400 block mb-0.5">
                        {isRTL ? "اسم العميل:" : "Customer Name:"}
                      </span>
                      <p className="font-bold text-gray-900">{formData.customerName || user?.name || "—"}</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/70">
                      <span className="text-[11px] font-bold uppercase text-gray-400 block mb-0.5">
                        {isRTL ? "اسم الشركة:" : "Company Name:"}
                      </span>
                      <p className="font-bold text-gray-900">
                        {formData.companyName || user?.company || (isRTL ? "فردي / شخصي" : "Individual / Personal")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/70">
                      <span className="text-[11px] font-bold uppercase text-gray-400 block mb-0.5">
                        {isRTL ? "رقم الهاتف / واتساب:" : "Phone / WhatsApp:"}
                      </span>
                      <p className="font-mono font-bold text-gray-900" dir="ltr">
                        {formData.phone || formData.whatsapp || user?.phone || "—"}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/70">
                      <span className="text-[11px] font-bold uppercase text-gray-400 block mb-0.5">
                        {isRTL ? "البريد الإلكتروني:" : "Email Address:"}
                      </span>
                      <p className="font-mono text-gray-900 text-[11px] truncate" dir="ltr" title={formData.email || user?.email}>
                        {formData.email || user?.email || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                confirmedCorrect
                  ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-200/50 shadow-xs"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <label className="flex items-start sm:items-center gap-3.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={confirmedCorrect}
                  onChange={(e) => setConfirmedCorrect(e.target.checked)}
                  className="w-5 h-5 mt-0.5 sm:mt-0 text-[#C45B2A] rounded-md border-gray-300 focus:ring-[#C45B2A] cursor-pointer shrink-0 transition-all"
                />
                <div className="space-y-1">
                  <span className="block text-xs sm:text-sm font-extrabold text-gray-900 leading-snug">
                    {isRTL
                      ? "أؤكد صحة ودقة كافة بيانات الشحنة المدخلة أعلاه ومطابقتها للوائح وأنظمة الشحن الدولي."
                      : "I confirm the accuracy of all provided shipment details and compliance with international freight regulations."}
                  </span>
                  <p className="text-[11px] text-gray-600 leading-normal">
                    {isRTL
                      ? "بمجرد الضغط على إرسال، سيقوم فريق العمليات والتسعير بحساب أفضل تكلفة شحن وتأكيدها معك مباشرة عبر واتساب."
                      : "Upon clicking submit, our operations team will calculate the lowest rate and send your quote directly on WhatsApp."}
                  </p>
                </div>
              </label>
            </div>

            {/* Step 5 Navigation Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-100/80 text-gray-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                <span>{isRTL ? "الرجوع لتعديل الشحنة" : "Back to Cargo"}</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  id="wizard-submit-btn"
                  type="submit"
                  disabled={isSubmitting || !confirmedCorrect}
                  className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-98"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isRTL ? "جاري تسجيل الطلب وإرساله..." : "Submitting Request..."}</span>
                    </div>
                  ) : (
                    <>
                      <span>{isRTL ? "تأكيد وإرسال طلب الشحن" : "Confirm & Submit Request"}</span>
                      <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Stepper Navigation Footer Buttons (Steps 1 to 4) */}
        {step < 5 && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="h-10 px-5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
                <span>{isRTL ? "رجوع" : "Back"}</span>
              </button>
            ) : (
              <div />
            )}

            {step === 1 ? (
              <div className="flex items-center justify-end w-full">
                {activeService.isForm ? (
                  <button
                    id="wizard-next-btn"
                    type="button"
                    onClick={handleNext}
                    className="h-11 px-7 rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                  >
                    <span>{isRTL ? "المتابعة إلى بيانات الاستلام والتسليم" : "Continue to Pickup"}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(activeService.whatsappMsg || "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 px-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{isRTL ? "تواصل فوري عبر واتساب" : "Chat on WhatsApp"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ) : (
              <button
                id="wizard-next-btn"
                type="button"
                onClick={handleNext}
                className="h-10 px-6 rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>{isRTL ? "التالي" : "Next"}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
