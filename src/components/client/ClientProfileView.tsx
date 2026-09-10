"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { AdminStorage, ShipmentRequest, Shipment } from "@/lib/adminData";
import { ShipmentRequestService, ShipmentService } from "@/lib/backendApi";
import { TrackingRedirect } from "@/components/TrackingRedirect";
import {
  LayoutDashboard,
  User,
  Lock,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Save,
  KeyRound,
  Building,
  Phone,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  MapPin,
  Search,
  ExternalLink,
  HelpCircle,
  Check,
  CheckCheck,
  X,
  Clock,
  ShieldAlert,
  DollarSign,
  MessageSquare,
  FileText,
  Sparkles,
} from "lucide-react";

interface UnifiedShipmentItem {
  id: string;
  kind: "shipment" | "request";
  rawDate: string;
  displayDate: string;
  refNumber: string;
  carrierOrType: string;
  routeTitle: string;
  origin?: string;
  destination: string;
  isRoutePath: boolean;
  contents: string;
  weight: string | number;
  priceDisplay: string;
  hasPrice: boolean;
  status: string;
  localizedStatus: string;
  statusColorClass: string;
  rawRequest?: ShipmentRequest;
  rawShipment?: Shipment;
}

function ClientProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { user, updateProfile, logout } = useAuth();
  const { t, isRTL, formatDate } = useLanguage();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "settings" | "security">("settings");
  const [tableFilter, setTableFilter] = useState<"all" | "shipments" | "requests">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dashboard Data
  const [requests, setRequests] = useState<ShipmentRequest[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  // Profile Form Data
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [company, setCompany] = useState(user?.company || "");

  // Password Form Data
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Eye toggle state for password fields
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    const savedTab = typeof window !== "undefined" ? sessionStorage.getItem("xspeed_profile_active_tab") : null;
    if (tabParam === "settings" || tabParam === "security") {
      setActiveTab(tabParam);
    } else if (tabParam === "dashboard" && user?.role !== "admin") {
      setActiveTab("dashboard");
    } else if (savedTab === "settings" || savedTab === "security" || (savedTab === "dashboard" && user?.role !== "admin")) {
      setActiveTab(savedTab as any);
    } else {
      setActiveTab("settings");
    }
  }, [tabParam, user]);

  const handleTabChange = (tab: "dashboard" | "settings" | "security") => {
    setActiveTab(tab);
    try {
      sessionStorage.setItem("xspeed_profile_active_tab", tab);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab);
        window.history.replaceState(null, "", url.toString());
      }
    } catch {}
  };

  const loadClientData = useCallback(async () => {
    if (!user) return;

    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setCompany(user.company || "");

    let allRequests = AdminStorage.getShipmentRequests();
    let allShipments = AdminStorage.getShipments();

    try {
      const fetchedReqs = await ShipmentRequestService.getRequests();
      if (fetchedReqs && Array.isArray(fetchedReqs) && fetchedReqs.length > 0) {
        allRequests = fetchedReqs;
      }
    } catch {}

    try {
      const fetchedShps = await ShipmentService.getShipments();
      if (fetchedShps && Array.isArray(fetchedShps) && fetchedShps.length > 0) {
        allShipments = fetchedShps;
      }
    } catch {}

    const userEmail = (user.email || "").toLowerCase().trim();
    const userName = (user.name || "").toLowerCase().trim();
    const userCompany = (user.company || "").toLowerCase().trim();
    const userPhone = (user.phone || "").replace(/[^0-9]/g, "");

    // Match requests belonging to this customer
    const userRequests = allRequests.filter((r) => {
      const reqEmail = (r.email || "").toLowerCase().trim();
      const reqCustId = (r.customerId || "").toLowerCase().trim();
      const reqName = (r.customerName || "").toLowerCase().trim();
      const reqPhone = (r.phone || r.whatsapp || "").replace(/[^0-9]/g, "");

      const matchesEmail = userEmail && (reqEmail === userEmail || reqCustId === userEmail);
      const matchesName = userName && reqName && (reqName === userName || reqName.includes(userName) || userName.includes(reqName));
      const matchesPhone = userPhone && reqPhone && (reqPhone.includes(userPhone) || userPhone.includes(reqPhone));

      return matchesEmail || matchesName || matchesPhone;
    });

    // Match shipments registered to this customer's account or linked to their requests
    const userShipments = allShipments.filter((s) => {
      const account = (s.account || "").toLowerCase();
      const comp = (s.company || "").toLowerCase();
      const sender = (s.senderName || "").toLowerCase();
      const receiver = (s.receiverName || "").toLowerCase();

      const matchesAccount = userName && account.includes(userName);
      const matchesCompany = userCompany && (account.includes(userCompany) || comp.includes(userCompany));
      const matchesEmail = userEmail && (account.includes(userEmail) || comp.includes(userEmail));
      const matchesSenderReceiver = userName && (sender.includes(userName) || receiver.includes(userName));
      const matchesLinkedReq = userRequests.some(
        (r) => r.linkedAwb && (r.linkedAwb === s.awb || r.requestNumber === s.awb)
      );

      return matchesAccount || matchesCompany || matchesEmail || matchesSenderReceiver || matchesLinkedReq;
    });

    setRequests(userRequests);
    setShipments(userShipments);
  }, [user]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  // WhatsApp Deal / Discussion URL for client
  const getClientWhatsAppUrl = (req: ShipmentRequest) => {
    const WHATSAPP_NUMBER = "201208027171";
    const agreedVal = req.agreedPrice || req.quotedPrice;
    const curr = req.currency || "EGP";
    const priceSnippet = agreedVal
      ? isRTL
        ? `\n- السعر المتفق عليه: ${agreedVal} ${curr}`
        : `\n- Agreed Price: ${agreedVal} ${curr}`
      : "";

    const text = isRTL
      ? `مرحباً فريق عمليات XSPEED Express، أود المتابعة بخصوص طلب الشحن رقم *${req.requestNumber}*:\n- من: ${req.pickupCity} (${req.pickupCountry})\n- إلى: ${req.deliveryCity} (${req.deliveryCountry})${priceSnippet}\nأرجو إفادتي بخصوص التفاصيل وإجراءات الاستلام.`
      : `Hello XSPEED Express team, I would like to follow up regarding my shipment request *${req.requestNumber}*:\n- From: ${req.pickupCity} (${req.pickupCountry})\n- To: ${req.deliveryCity} (${req.deliveryCountry})${priceSnippet}\nPlease update me on the pickup and delivery arrangements.`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const getLocalizedRequestStatus = (status: ShipmentRequest["status"] | string, isRTL: boolean) => {
    if (!isRTL) {
      if (status === "Approved" || status === "Customer Confirmed" || status === "Price Sent") return "Approved";
      if (status === "Awaiting Customer Response") return "Pending WhatsApp Agreement";
      return status;
    }
    switch (status) {
      case "New":
        return "طلب جديد";
      case "Contacted":
        return "تم التواصل عبر واتساب";
      case "Approved":
      case "Customer Confirmed":
      case "Price Sent":
        return "معتمد (تم الاتفاق على السعر)";
      case "Awaiting Customer Response":
        return "قيد الاتفاق عبر واتساب";
      case "Converted to Shipment":
        return "تم إصدار بوليصة الشحن (AWB)";
      case "Cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const getLocalizedShipmentType = (type: string, isRTL: boolean) => {
    if (!isRTL) return type;
    switch (type) {
      case "Documents":
        return "مستندات ووثائق";
      case "Parcel":
        return "طرد / شحنة شخصية";
      case "Commercial Goods":
        return "بضائع تجارية";
      case "Pallet":
        return "طبلية / بالتة";
      case "Heavy Cargo":
        return "شحن ثقيل";
      default:
        return type;
    }
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 8) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword) || /[A-Z]/.test(newPassword)) score += 1;
    return score; // 0 to 4
  }, [newPassword]);

  const passwordStrengthLabel = useMemo(() => {
    if (!newPassword) return "";
    switch (passwordStrength) {
      case 1:
        return isRTL ? "ضعيفة جداً" : "Very Weak";
      case 2:
        return isRTL ? "متوسطة" : "Fair";
      case 3:
        return isRTL ? "جيدة وقوية" : "Good";
      case 4:
        return isRTL ? "ممتازة وآمنة للغاية" : "Strong";
      default:
        return isRTL ? "ضعيفة" : "Weak";
    }
  }, [passwordStrength, newPassword, isRTL]);

  const isDelivered = (status: string) => {
    const s = (status || "").toLowerCase();
    return s.includes("deliver") || s.includes("تسليم") || s === "completed";
  };

  const isDeliveredOrCancelled = (status: string) => {
    const s = (status || "").toLowerCase();
    return isDelivered(status) || s.includes("cancel") || s.includes("ملغاة");
  };

  const deliveredShipmentsCount = shipments.filter((s) => isDelivered(s.status)).length;
  const activeShipmentsCount = shipments.filter((s) => !isDeliveredOrCancelled(s.status)).length;

  const getLocalizedStatus = (status: string) => {
    if (!status) return "-";
    const s = status.toLowerCase();
    if (!isRTL) return status;
    if (s.includes("deliver")) return "تم التسليم";
    if (s.includes("information recived") || s.includes("information received") || s.includes("created")) return "تم استلام البيانات";
    if (s.includes("transit") || s.includes("way")) return "في الطريق";
    if (s.includes("hub") || s.includes("facility")) return "في مركز الفرز";
    if (s.includes("destination")) return "وصل دولة الوصول";
    if (s.includes("cairo airport")) return "مطار القاهرة";
    if (s.includes("delayed")) return "متأخرة";
    if (s.includes("cancel")) return "ملغاة";
    if (s.includes("exception")) return "مسترجعة / مرتجع";
    if (s.includes("pending")) return "قيد المعالجة";
    return status;
  };

  // Unified items combining shipments & requests into a single dataset
  const unifiedItems = useMemo(() => {
    const list: UnifiedShipmentItem[] = [];

    shipments.forEach((s) => {
      list.push({
        id: `shp-${s.id}`,
        kind: "shipment",
        rawDate: s.date || "",
        displayDate: s.date ? (formatDate(s.date) || s.date.split("T")[0].split(" ")[0]) : "—",
        refNumber: s.awb,
        carrierOrType: s.carrier || (isRTL ? "شحن سريع" : "Express"),
        routeTitle: s.receiverName || (isRTL ? "مستلم محدد" : "Consignee"),
        origin: s.senderCity || undefined,
        destination: s.country || s.receiverCity || "—",
        isRoutePath: false,
        contents: s.contents || (isRTL ? "طرد بضائع عامة" : "Parcel Goods"),
        weight: s.weight || "—",
        priceDisplay: `${s.sellingPrice || s.priceEgp || "—"} ${isRTL ? "ج.م" : "EGP"}`,
        hasPrice: Boolean(s.sellingPrice || s.priceEgp),
        status: s.status,
        localizedStatus: getLocalizedStatus(s.status),
        statusColorClass: isDelivered(s.status)
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : s.status?.toLowerCase().includes("exception")
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : s.status?.toLowerCase().includes("delay")
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-orange-50 text-[#C45B2A] border-orange-200",
        rawShipment: s,
      });
    });

    requests.forEach((r) => {
      list.push({
        id: `req-${r.id}`,
        kind: "request",
        rawDate: r.createdAt || "",
        displayDate: r.createdAt ? (formatDate(r.createdAt) || r.createdAt.split("T")[0].split(" ")[0]) : "—",
        refNumber: r.requestNumber,
        carrierOrType: getLocalizedShipmentType(r.shipmentType, isRTL),
        routeTitle: `${r.deliveryCity}, ${r.deliveryCountry}`,
        origin: `${r.pickupCity}, ${r.pickupCountry}`,
        destination: `${r.deliveryCity}, ${r.deliveryCountry}`,
        isRoutePath: true,
        contents: r.contents || (isRTL ? "طرد بضائع عامة" : "General goods"),
        weight: r.weight || "—",
        priceDisplay: (r.agreedPrice || r.quotedPrice) ? `${r.agreedPrice || r.quotedPrice} ${r.currency || "EGP"}` : "",
        hasPrice: Boolean(r.agreedPrice || r.quotedPrice),
        status: r.status,
        localizedStatus: getLocalizedRequestStatus(r.status, isRTL),
        statusColorClass:
          r.status === "Converted to Shipment"
            ? "bg-purple-50 text-purple-800 border-purple-200"
            : r.status === "Approved" || r.status === "Customer Confirmed"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : r.status === "Contacted"
            ? "bg-cyan-50 text-cyan-800 border-cyan-200"
            : r.status === "Cancelled"
            ? "bg-rose-50 text-rose-800 border-rose-200"
            : "bg-amber-50 text-amber-800 border-amber-200",
        rawRequest: r,
      });
    });

    return list.sort((a, b) => {
      const timeA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
      const timeB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
      return timeB - timeA;
    });
  }, [shipments, requests, isRTL]);

  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      if (tableFilter === "shipments" && item.kind !== "shipment") return false;
      if (tableFilter === "requests" && item.kind !== "request") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchRef = item.refNumber.toLowerCase().includes(q);
        const matchCarrier = item.carrierOrType.toLowerCase().includes(q);
        const matchRoute =
          item.routeTitle.toLowerCase().includes(q) ||
          item.destination.toLowerCase().includes(q) ||
          Boolean(item.origin && item.origin.toLowerCase().includes(q));
        const matchContents = item.contents.toLowerCase().includes(q);
        const matchStatus =
          item.status.toLowerCase().includes(q) || item.localizedStatus.toLowerCase().includes(q);
        return matchRef || matchCarrier || matchRoute || matchContents || matchStatus;
      }
      return true;
    });
  }, [unifiedItems, tableFilter, searchQuery]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    setIsSubmitting(true);
    try {
      const res = await updateProfile({
        name: name.trim() || user?.name || "Customer",
        email: email.trim() || user?.email || "customer@exspeeds.com",
        phone,
        company,
      });

      if (res.success) {
        setSuccessMessage(t("client.profile.successAlert") || (isRTL ? "تم حفظ وتحديث بيانات الملف الشخصي بنجاح!" : "Profile information updated successfully!"));
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(res.message || (isRTL ? "فشل تحديث بيانات الملف الشخصي." : "Failed to update profile."));
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isRTL ? "فشل تحديث بيانات الملف الشخصي." : "Failed to update profile."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!currentPassword) {
      setErrorMessage(t("client.profile.currentPasswordRequired") || (isRTL ? "يرجى إدخال كلمة المرور الحالية أولاً." : "Current password is required."));
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage(t("client.profile.passwordShortError") || (isRTL ? "يجب ألا تقل كلمة المرور الجديدة عن 6 خانات." : "Password must be at least 6 characters long."));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage(t("client.profile.passwordMismatchError") || (isRTL ? "كلمات المرور الجديدة غير متطابقة، يرجى التأكد وإعادة المحاولة." : "New passwords do not match."));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateProfile({
        name: name.trim() || user?.name || "Customer",
        email: email.trim() || user?.email || "customer@exspeeds.com",
        phone,
        company,
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setSuccessMessage(t("client.profile.passwordSuccessAlert") || (isRTL ? "تم تغيير وتحديث كلمة المرور بنجاح تام!" : "Password changed successfully!"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(res.message || (isRTL ? "فشل تغيير كلمة المرور." : "Failed to change password."));
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isRTL ? "فشل تغيير كلمة المرور." : "Failed to change password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fallbackCustomerName = t("client.dashboard.customerDefault") || (isRTL ? "العميل" : "Customer");
  const displayName = mounted ? (name || user?.name || fallbackCustomerName) : fallbackCustomerName;
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className={`min-h-screen bg-[#FDFBF9] py-6 sm:py-8 md:py-10 px-3 sm:px-4 md:px-6 space-y-6 ${isRTL ? "text-right" : "text-left"}`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ─── 1. TOP IDENTITY & STATUS BANNER ─── */}
        <div className="bg-gradient-to-r from-[#211112] via-[#2A1718] to-[#1E0D0E] text-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/10 relative overflow-hidden">
          {/* Background Ambient Lights */}
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-[#C45B2A]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/4 bottom-0 translate-y-12 w-72 h-72 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className={`relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 ${isRTL ? "lg:text-right" : "lg:text-left"} text-center`}>
            {/* User Meta */}
            <div className={`flex flex-col sm:flex-row items-center gap-5 sm:gap-6 ${isRTL ? "sm:text-right" : "sm:text-left"}`}>
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#C45B2A] via-[#D8632E] to-[#E06E3B] text-white font-display font-black text-3xl sm:text-4xl flex items-center justify-center shadow-xl border-2 border-white/20">
                  {userInitial}
                </div>
                <span
                  className={`absolute -bottom-1 ${isRTL ? "-left-1" : "-right-1"} w-5 h-5 rounded-full bg-emerald-500 border-3 border-[#211112] shadow-sm animate-pulse`}
                  title={t("client.dashboard.activeAccount") || (isRTL ? "حساب نشط ومفعّل" : "Active Account")}
                />
              </div>

              <div className="space-y-2">
                <div className={`flex flex-wrap items-center justify-center ${isRTL ? "sm:justify-start" : "sm:justify-start"} gap-2.5`}>
                  <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
                    {t("client.dashboard.welcomeBack")}, {displayName}
                  </h1>
                  <span className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border shadow-2xs ${
                    mounted && user?.role === "admin"
                      ? "bg-purple-500/25 text-purple-200 border-purple-400/40"
                      : "bg-orange-500/25 text-orange-200 border-orange-400/40"
                  }`}>
                    {mounted && user?.role === "admin"
                      ? (t("client.dashboard.adminRole") || (isRTL ? "مسؤول النظام الفائق" : "System Administrator"))
                      : (t("client.dashboard.customerRole") || (isRTL ? "حساب عميل معتمد" : "Verified Customer"))}
                  </span>
                </div>

                <p className="text-gray-300 text-xs sm:text-sm max-w-xl">
                  {t("client.dashboard.subtitle") || (isRTL ? "متابعة شحناتك المسجلة، طلب عروض الأسعار، وإدارة وتحديث إعدادات الأمان." : "Manage your consignments, shipment requests, and account security.")}
                </p>

                {/* Quick Info Tags */}
                <div className={`flex flex-wrap items-center justify-center ${isRTL ? "sm:justify-start" : "sm:justify-start"} gap-2.5 pt-1 text-xs text-gray-300`}>
                  {mounted && (email || user?.email) && (
                    <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg font-mono text-orange-200" dir="ltr">
                      <Mail className="w-3.5 h-3.5 opacity-80" />
                      <span>{email || user?.email}</span>
                    </span>
                  )}
                  {mounted && (phone || user?.phone) && (
                    <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg font-mono text-emerald-200" dir="ltr">
                      <Phone className="w-3.5 h-3.5 opacity-80" />
                      <span>{phone || user?.phone}</span>
                    </span>
                  )}
                  {mounted && (company || user?.company) && (
                    <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg font-medium text-amber-200">
                      <Building className="w-3.5 h-3.5 opacity-80" />
                      <span>{company || user?.company}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
              {mounted && user?.role === "admin" ? (
                <Link
                  href="/admin"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isRTL ? "لوحة الإدارة والعمليات" : "Admin Operations Portal"}</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/ship"
                    className="px-4 py-2.5 rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRTL ? "طلب شحن جديد" : "New Shipment"}</span>
                  </Link>
                  <Link
                    href="/track"
                    className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-sm transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isRTL ? "تتبع شحنة" : "Track Consignment"}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── 2. TAB NAVIGATION SWITCHER ─── */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-white rounded-2xl border border-gray-200/90 shadow-sm">
          {mounted && user?.role !== "admin" && (
            <button
              type="button"
              onClick={() => handleTabChange("dashboard")}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-[#C45B2A] to-[#D8632E] text-white shadow-md font-extrabold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t("client.profile.tabs.dashboard") || (isRTL ? "لوحة الشحنات" : "Shipments Ledger")}</span>
              <span className="sm:hidden">{isRTL ? "الشحنات" : "Shipments"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleTabChange("settings")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-[#C45B2A] to-[#D8632E] text-white shadow-md font-extrabold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t("client.profile.tabs.settings") || (isRTL ? "إعدادات الملف الشخصي" : "Profile Settings")}</span>
            <span className="sm:hidden">{isRTL ? "الملف الشخصي" : "Profile"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("security")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-gradient-to-r from-[#C45B2A] to-[#D8632E] text-white shadow-md font-extrabold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t("client.profile.tabs.security") || (isRTL ? "الأمان وكلمة المرور" : "Security & Password")}</span>
            <span className="sm:hidden">{isRTL ? "الأمان" : "Security"}</span>
          </button>
        </div>

        {/* Global Feedback Banners */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-xs animate-fade-up">
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-xs animate-fade-up">
            <div className="p-1 rounded-full bg-rose-100 text-rose-700 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: CLIENT DASHBOARD (MY CONSIGNMENTS & SHIPMENT REQUESTS) */}
        {/* ========================================================= */}
        {activeTab === "dashboard" && mounted && user?.role !== "admin" && (
          <div className="space-y-6 animate-fade-up">
            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-sm flex items-center justify-between">
                <div className="space-y-1 text-start">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("client.dashboard.requestsTable.title") || (isRTL ? "طلبات الشحن" : "Shipment Requests")}
                  </span>
                  <p className="text-3xl font-display font-black text-[#251516]" dir="ltr">{requests.length}</p>
                  <p className="text-xs text-emerald-700 font-semibold">
                    {requests.filter((r) => r.status === "Approved" || r.agreedPrice || r.quotedPrice).length}{" "}
                    {isRTL ? "تم الاتفاق على السعر واعتمادها" : "Approved & Priced"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#C45B2A] flex items-center justify-center shrink-0 border border-orange-100 shadow-2xs">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-sm flex items-center justify-between">
                <div className="space-y-1 text-start">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("client.dashboard.totalShipments")}
                  </span>
                  <p className="text-3xl font-display font-black text-[#251516]" dir="ltr">{shipments.length}</p>
                  <p className="text-xs text-sky-700 font-semibold">
                    {activeShipmentsCount} {isRTL ? "قيد الشحن والتوصيل" : "In Transit"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 shadow-2xs">
                  <Truck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-sm flex items-center justify-between">
                <div className="space-y-1 text-start">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("client.dashboard.deliveredShipments")}
                  </span>
                  <p className="text-3xl font-display font-black text-[#251516]" dir="ltr">{deliveredShipmentsCount}</p>
                  <p className="text-xs text-emerald-700 font-semibold">
                    {t("client.dashboard.deliveredShipmentsSub")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* ─── UNIFIED SHIPMENTS & REQUESTS MASTER LEDGER ─── */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-3.5 sm:p-5 md:p-6 space-y-5 animate-fade-up">
              {/* Header & Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="text-start space-y-1">
                  <h2 className="text-base sm:text-lg font-bold text-[#251516] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#C45B2A]" />
                    <span>{isRTL ? "سجل الشحنات والطلبات الموحد" : "Shipments & Requests Master Ledger"}</span>
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isRTL
                      ? "متابعة شاملة لجميع بوالص الشحن المسجلة، طلبات وعروض الأسعار، وحالات التوصيل في مكان واحد."
                      : "Comprehensive overview of all consignments, price quotations, and transit statuses."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search Input */}
                  <div className="relative flex items-center min-w-[220px] sm:min-w-[260px]">
                    <Search className={`absolute ${isRTL ? "right-3" : "left-3"} w-3.5 h-3.5 text-gray-400 pointer-events-none`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isRTL ? "بحث برقم البوليصة، الطلب، المستلم..." : "Search AWB, request no, consignee..."}
                      className={`w-full h-9 bg-gray-50 hover:bg-white focus:bg-white text-xs rounded-xl border border-gray-200 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                        isRTL ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
                      }`}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className={`absolute ${isRTL ? "left-2.5" : "right-2.5"} text-gray-400 hover:text-gray-600 p-0.5`}
                        title={isRTL ? "مسح البحث" : "Clear search"}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* New Shipment Request Link */}
                  <Link
                    href="/ship"
                    className="h-9 px-3.5 rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{t("client.dashboard.requestsTable.newRequestBtn") || (isRTL ? "طلب شحن جديد" : "New Request")}</span>
                  </Link>
                </div>
              </div>

              {/* Filter Chips Toolbar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setTableFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    tableFilter === "all"
                      ? "bg-[#251516] text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{isRTL ? "الكل" : "All"}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    tableFilter === "all" ? "bg-white/20 text-white" : "bg-white text-gray-700"
                  }`}>
                    {unifiedItems.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTableFilter("shipments")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    tableFilter === "shipments"
                      ? "bg-[#C45B2A] text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{isRTL ? "بوالص الشحن (AWB)" : "Shipments (AWB)"}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    tableFilter === "shipments" ? "bg-white/20 text-white" : "bg-white text-gray-700"
                  }`}>
                    {shipments.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTableFilter("requests")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    tableFilter === "requests"
                      ? "bg-[#C45B2A] text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isRTL ? "طلبات الشحن" : "Shipment Requests"}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    tableFilter === "requests" ? "bg-white/20 text-white" : "bg-white text-gray-700"
                  }`}>
                    {requests.length}
                  </span>
                </button>
              </div>

              {/* Table Data Content or Empty States */}
              {unifiedItems.length === 0 ? (
                <div className="text-center py-12 space-y-4 text-gray-500">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#C45B2A] flex items-center justify-center mx-auto border border-orange-100 shadow-2xs">
                    <Package className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm md:text-base font-bold text-[#251516]">
                      {isRTL ? "لا توجد شحنات أو طلبات مسجلة بعد" : "No Shipments or Requests Yet"}
                    </h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                      {isRTL
                        ? "لم تقم بتسجيل أي طلبات شحن بعد. يمكنك إنشاء طلب شحن جديد وسيقوم فريق العمليات بالتواصل معك عبر واتساب لتحديد السعر وتأكيد الشحنة."
                        : "No consignments or requests registered under your account yet. Submit a new shipment request to get started."}
                    </p>
                  </div>
                  <Link
                    href="/ship"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C45B2A] hover:bg-[#D9531E] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>{isRTL ? "طلب شحن جديد الآن" : "Request New Shipment"}</span>
                  </Link>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 space-y-3 text-gray-500">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">
                    {isRTL ? "لا توجد نتائج مطابقة لبحثك" : "No Matching Records Found"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isRTL
                      ? "جرب البحث برقم بوليصة الشحن (AWB) أو رقم الطلب أو اسم المدينة أو الدولة."
                      : "Try searching by waybill (AWB), request number, or destination city."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTableFilter("all");
                      setSearchQuery("");
                    }}
                    className="text-xs font-bold text-[#C45B2A] hover:underline cursor-pointer"
                  >
                    {isRTL ? "إعادة ضبط جميع الفلاتر" : "Reset all filters"}
                  </button>
                </div>
              ) : (
                <>
                  {/* 1. Desktop & Tablet Responsive Table (hidden on mobile < 640px) */}
                  <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-xs text-start border-collapse min-w-[760px]">
                      <thead>
                        <tr className="bg-gray-50/95 text-gray-700 uppercase font-extrabold border-b border-gray-200 text-start text-[11px] select-none">
                          <th className="py-3 px-3 text-start w-[19%]">{isRTL ? "المرجع والتاريخ" : "Reference & Date"}</th>
                          <th className="py-3 px-3 text-start w-[22%]">{isRTL ? "المسار والمستلم" : "Route & Consignee"}</th>
                          <th className="py-3 px-3 text-start w-[23%]">{isRTL ? "المحتويات والوزن" : "Cargo & Weight"}</th>
                          <th className="py-3 px-3 text-start w-[16%]">{isRTL ? "القيمة والتسعير" : "Charges / Quote"}</th>
                          <th className="py-3 px-2 text-center w-[10%]">{isRTL ? "الحالة" : "Status"}</th>
                          <th className="py-3 px-2 text-center w-[10%]">{isRTL ? "الإجراءات" : "Actions"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-700 bg-white">
                        {filteredItems.map((item) => (
                          <tr key={item.id} className="hover:bg-orange-50/20 transition-colors text-xs">
                            {/* 1. Reference & Date */}
                            <td className="py-3.5 px-3 text-start align-top">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`font-mono font-black text-xs px-2 py-0.5 rounded border inline-block ${
                                      item.kind === "shipment"
                                        ? "text-gray-900 bg-gray-100 border-gray-200"
                                        : "text-[#C45B2A] bg-orange-50 border-orange-200"
                                    }`}
                                    dir="ltr"
                                  >
                                    {item.refNumber}
                                  </span>
                                  <span
                                    className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                      item.kind === "shipment"
                                        ? "bg-sky-100 text-sky-800"
                                        : "bg-orange-100 text-[#C45B2A]"
                                    }`}
                                  >
                                    {item.kind === "shipment" ? "AWB" : isRTL ? "طلب تسعير" : "Quote"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                                  <span className="font-mono">{item.displayDate}</span>
                                  <span>•</span>
                                  <span className="font-bold text-gray-700">{item.carrierOrType}</span>
                                </div>
                              </div>
                            </td>

                            {/* 2. Route & Consignee */}
                            <td className="py-3.5 px-3 text-start align-top">
                              {item.isRoutePath ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{isRTL ? "من:" : "From:"}</span>
                                    <span>{item.origin}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[11px] text-[#C45B2A] font-bold">
                                    <ArrowRight className={`w-3 h-3 shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                                    <span className="text-gray-900 font-extrabold">{item.destination}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <p className="font-bold text-gray-900 text-xs leading-snug break-words whitespace-normal">
                                    {item.routeTitle}
                                  </p>
                                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
                                    <span>{item.destination}</span>
                                  </p>
                                </div>
                              )}
                            </td>

                            {/* 3. Cargo & Weight */}
                            <td className="py-3.5 px-3 text-start align-top">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="font-bold text-gray-900 text-xs">
                                    {item.kind === "request" ? item.carrierOrType : (isRTL ? "طرد مسجل" : "Express Parcel")}
                                  </span>
                                  <span>•</span>
                                  <span className="inline-block px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 font-mono font-bold text-[10px]" dir="ltr">
                                    {item.weight} {isRTL ? "كجم" : "KG"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-600 leading-snug break-words whitespace-normal">
                                  {item.contents}
                                </p>
                              </div>
                            </td>

                            {/* 4. Charges / Quoted Rate */}
                            <td className="py-3.5 px-3 text-start align-top">
                              {item.kind === "shipment" ? (
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-mono font-bold text-xs" dir="ltr">
                                  {item.priceDisplay}
                                </span>
                              ) : item.hasPrice ? (
                                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-900 px-2.5 py-1 rounded-lg shadow-2xs font-mono font-black text-xs" dir="ltr">
                                  <span>{item.priceDisplay}</span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-2xs">
                                  <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>{isRTL ? "قيد الاتفاق عبر واتساب" : "Agreement Pending (WhatsApp)"}</span>
                                </span>
                              )}
                            </td>

                            {/* 5. Status Badge */}
                            <td className="py-3.5 px-2 text-center align-top whitespace-nowrap">
                              <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-2xs ${item.statusColorClass}`}>
                                {item.localizedStatus}
                              </span>
                            </td>

                            {/* 6. Action Buttons */}
                            <td className="py-3.5 px-2 text-center align-top whitespace-nowrap">
                              {item.kind === "shipment" ? (
                                <TrackingRedirect
                                  carrier={item.rawShipment!.carrier}
                                  awb={item.rawShipment!.awb}
                                  variant="button"
                                  label={isRTL ? "تتبع" : "Track"}
                                  className="px-3 py-1 text-[11px] font-bold shadow-xs"
                                />
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <a
                                    href={getClientWhatsAppUrl(item.rawRequest!)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-6 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] flex items-center gap-1 shadow-2xs transition-colors"
                                    title={isRTL ? "محادثة عبر واتساب" : "Chat on WhatsApp"}
                                  >
                                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                                    <span>{isRTL ? "واتساب" : "WhatsApp"}</span>
                                  </a>

                                  {item.rawRequest?.status === "Converted to Shipment" && item.rawRequest.linkedAwb && (
                                    <Link
                                      href={`/track?awb=${encodeURIComponent(item.rawRequest.linkedAwb)}`}
                                      className="h-6 px-2 rounded-lg bg-[#C45B2A] hover:bg-[#A8481B] text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs transition-colors"
                                      title={isRTL ? "تتبع بوليصة الشحن" : "Track Shipment"}
                                    >
                                      <Truck className="w-3 h-3" />
                                      <span>{isRTL ? "تتبع" : "Track"}</span>
                                    </Link>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 2. Mobile Responsive Card List (visible on sm:hidden) */}
                  <div className="sm:hidden space-y-3">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="bg-gray-50/90 border border-gray-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
                        {/* Header: Reference #, Type & Status */}
                        <div className="flex items-center justify-between gap-2 border-b border-gray-200/70 pb-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-mono font-black text-xs px-2 py-0.5 rounded border inline-block ${
                                  item.kind === "shipment"
                                    ? "text-gray-900 bg-white border-gray-200"
                                    : "text-[#C45B2A] bg-orange-50 border-orange-200"
                                }`}
                                dir="ltr"
                              >
                                {item.refNumber}
                              </span>
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                  item.kind === "shipment"
                                    ? "bg-sky-100 text-sky-800"
                                    : "bg-orange-100 text-[#C45B2A]"
                                }`}
                              >
                                {item.kind === "shipment" ? "AWB" : isRTL ? "طلب" : "Quote"}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono">
                              {item.displayDate} • {item.carrierOrType}
                            </p>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-2xs ${item.statusColorClass}`}>
                            {item.localizedStatus}
                          </span>
                        </div>

                        {/* Route / Consignee */}
                        <div className="bg-white p-2.5 rounded-xl border border-gray-200/80 space-y-1 text-xs">
                          {item.isRoutePath ? (
                            <>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">{isRTL ? "من:" : "From:"}</span>
                                <span>{item.origin}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[#C45B2A] font-bold">
                                <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                                <span className="text-gray-900 font-extrabold">{item.destination}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="font-bold text-gray-900 leading-snug break-words">
                                {item.routeTitle}
                              </p>
                              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
                                <span>{item.destination}</span>
                              </p>
                            </>
                          )}
                        </div>

                        {/* Cargo Details with Full Wrapping */}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-gray-800">
                              {item.kind === "request" ? item.carrierOrType : (isRTL ? "طرد مسجل" : "Express Parcel")}
                            </span>
                            <span className="font-mono font-bold text-[#C45B2A]" dir="ltr">
                              {item.weight} {isRTL ? "كجم" : "KG"}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-snug break-words bg-white/70 p-2 rounded-lg border border-gray-100">
                            {item.contents}
                          </p>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/70">
                          <div>
                            {item.kind === "shipment" ? (
                              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs" dir="ltr">
                                {item.priceDisplay}
                              </span>
                            ) : item.hasPrice ? (
                              <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-300 text-emerald-900 px-2.5 py-0.5 rounded-lg font-mono font-black text-xs" dir="ltr">
                                <DollarSign className="w-3 h-3 text-emerald-700" />
                                <span>{item.priceDisplay}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {isRTL ? "قيد الاتفاق عبر واتساب" : "Pending via WhatsApp"}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.kind === "shipment" ? (
                              <TrackingRedirect
                                carrier={item.rawShipment!.carrier}
                                awb={item.rawShipment!.awb}
                                variant="button"
                                label={isRTL ? "تتبع الشحنة" : "Track"}
                                className="px-3.5 py-1.5 text-xs font-bold shadow-xs"
                              />
                            ) : (
                              <>
                                <a
                                  href={getClientWhatsAppUrl(item.rawRequest!)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-8 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1 shadow-2xs"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{isRTL ? "واتساب" : "WhatsApp"}</span>
                                </a>

                                {item.rawRequest?.status === "Converted to Shipment" && item.rawRequest.linkedAwb && (
                                  <Link
                                    href={`/track?awb=${encodeURIComponent(item.rawRequest.linkedAwb)}`}
                                    className="h-8 px-3 rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] text-white font-bold text-xs flex items-center gap-1 shadow-2xs"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>{isRTL ? "تتبع" : "Track"}</span>
                                  </Link>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PROFILE SETTINGS */}
        {/* ========================================================= */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
            {/* Form Column (2/3 width) */}
            <form onSubmit={handleProfileSubmit} className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-orange-100 text-[#C45B2A]">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {t("client.profile.personalInfoTitle") || (isRTL ? "البيانات الشخصية وبيانات العمل" : "Personal & Business Details")}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t("client.profile.personalInfoSubtitle") || (isRTL ? "تحديث وتعديل بيانات التواصل المسجلة لطلب واستلام الشحنات." : "Update your primary contact information for shipment inquiries.")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      {t("client.profile.fullNameLabel") || (isRTL ? "الاسم بالكامل" : "Full Name")}
                    </label>
                    <div className="relative flex items-center">
                      <User className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} h-4 w-4 text-gray-400 pointer-events-none`} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ahmed Mansour"
                        className={`w-full h-11 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                          isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      {t("client.profile.companyLabel") || (isRTL ? "اسم الشركة / المؤسسة" : "Company / Enterprise")}
                    </label>
                    <div className="relative flex items-center">
                      <Building className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} h-4 w-4 text-gray-400 pointer-events-none`} />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder={t("client.profile.companyPlaceholder") || (isRTL ? "اسم الشركة (اختياري)" : "Company Name (Optional)")}
                        className={`w-full h-11 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                          isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      {t("client.profile.emailLabel") || (isRTL ? "البريد الإلكتروني" : "Email Address")}
                    </label>
                    <div className="relative flex items-center">
                      <Mail className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} h-4 w-4 text-gray-400 pointer-events-none`} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className={`w-full h-11 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                          isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                        }`}
                        dir="ltr"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      {t("client.profile.phoneLabel") || (isRTL ? "رقم الهاتف / الواتساب" : "Phone / WhatsApp")}
                    </label>
                    <div className="relative flex items-center">
                      <Phone className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} h-4 w-4 text-gray-400 pointer-events-none`} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t("client.profile.phonePlaceholder") || "+20 120 802 7171"}
                        className={`w-full h-11 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                          isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                        }`}
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-5 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 px-7 rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? (t("client.profile.savingBtn") || (isRTL ? "جاري الحفظ..." : "Saving...")) : (t("client.profile.saveBtn") || (isRTL ? "حفظ تعديلات الملف الشخصي" : "Save Profile Changes"))}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Sidebar Column (1/3 width) */}
            <div className="space-y-5">
              {/* Account Status Card */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#C45B2A]" />
                  <span>{isRTL ? "حالة وتوثيق الحساب" : "Account Verification"}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-500">{isRTL ? "الحالة التشغيلية:" : "Account Status:"}</span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{isRTL ? "نشط ومفعّل" : "Active & Verified"}</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-500">{isRTL ? "نوع الصلاحية:" : "Membership Role:"}</span>
                    <span className="font-bold text-gray-900">
                      {mounted && user?.role === "admin"
                        ? (isRTL ? "مدير النظام / Admin" : "System Admin")
                        : (isRTL ? "عميل شحن معتمد" : "Standard Client")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRTL ? "الأمان والتشفير:" : "Encryption:"}</span>
                    <span className="font-mono font-semibold text-gray-700" dir="ltr">TLS 1.3 / SHA-256</span>
                  </div>
                </div>
              </div>

              {/* Quick Customer Support Box */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200/80 p-5 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#C45B2A]">
                  <HelpCircle className="w-4 h-4" />
                  <span>{isRTL ? "مساعدة ودعم العملاء" : "Customer Care & Support"}</span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  {isRTL
                    ? "هل تحتاج لمساعدة في تعديل بيانات حسابك أو إضافة عناوين استلام متعددة؟ تواصل مباشرة مع فريق العمليات."
                    : "Need assistance updating multiple business addresses or invoice billing profiles? Contact support directly."}
                </p>
                <a
                  href="https://wa.me/201208027171"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>{isRTL ? "محادثة الدعم عبر واتساب" : "Chat on WhatsApp"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SECURITY & PASSWORD */}
        {/* ========================================================= */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
            {/* Form Column (2/3 width) */}
            <form onSubmit={handleSecuritySubmit} className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-orange-100 text-[#C45B2A]">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {t("client.profile.securityTitle") || (isRTL ? "الأمان وتغيير كلمة المرور" : "Security & Password Management")}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t("client.profile.securitySubtitle") || (isRTL ? "قم بتحديث كلمة المرور الخاصة بحسابك لحماية إضافية للبيانات والطلبات." : "Update your password periodically to ensure high security.")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      {t("client.profile.currentPasswordLabel") || (isRTL ? "كلمة المرور الحالية" : "Current Password")}
                    </label>
                    <div className="relative flex items-center">
                      <Lock className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} h-4 w-4 text-gray-400 pointer-events-none`} />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full h-11 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                          isRTL ? "pr-10 pl-11" : "pl-10 pr-11"
                        }`}
                        dir="ltr"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        className={`absolute ${isRTL ? "left-3" : "right-3"} text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-gray-100`}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      {t("client.profile.newPasswordLabel") || (isRTL ? "كلمة المرور الجديدة" : "New Password")}
                    </label>
                    <div className="relative flex items-center">
                      <KeyRound className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} h-4 w-4 text-gray-400 pointer-events-none`} />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full h-11 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                          isRTL ? "pr-10 pl-11" : "pl-10 pr-11"
                        }`}
                        dir="ltr"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                        className={`absolute ${isRTL ? "left-3" : "right-3"} text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-gray-100`}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="mt-2.5 space-y-1.5 animate-fade-up">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-500">{isRTL ? "قوة كلمة المرور:" : "Password Strength:"}</span>
                          <span className={`font-bold ${
                            passwordStrength <= 1
                              ? "text-rose-600"
                              : passwordStrength === 2
                              ? "text-amber-600"
                              : passwordStrength === 3
                              ? "text-blue-600"
                              : "text-emerald-600"
                          }`}>
                            {passwordStrengthLabel}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          <div className={`rounded-full transition-all ${passwordStrength >= 1 ? (passwordStrength === 1 ? "bg-rose-500" : "bg-amber-500") : "bg-gray-200"}`} />
                          <div className={`rounded-full transition-all ${passwordStrength >= 2 ? (passwordStrength === 2 ? "bg-amber-500" : "bg-blue-500") : "bg-gray-200"}`} />
                          <div className={`rounded-full transition-all ${passwordStrength >= 3 ? "bg-blue-500" : "bg-gray-200"}`} />
                          <div className={`rounded-full transition-all ${passwordStrength >= 4 ? "bg-emerald-500" : "bg-gray-200"}`} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      {t("client.profile.confirmPasswordLabel") || (isRTL ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password")}
                    </label>
                    <div className="relative flex items-center">
                      <Lock className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} h-4 w-4 text-gray-400 pointer-events-none`} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full h-11 bg-gray-50 hover:bg-gray-50/80 focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                          isRTL ? "pr-10 pl-11" : "pl-10 pr-11"
                        }`}
                        dir="ltr"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        className={`absolute ${isRTL ? "left-3" : "right-3"} text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-gray-100`}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {confirmPassword && newPassword && (
                      <div className="mt-2 text-[11px] font-bold flex items-center gap-1.5">
                        {newPassword === confirmPassword ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>{isRTL ? "كلمات المرور متطابقة تماماً" : "Passwords match"}</span>
                          </span>
                        ) : (
                          <span className="text-rose-600 flex items-center gap-1">
                            <X className="w-3.5 h-3.5" />
                            <span>{isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match"}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-5 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 px-7 rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isSubmitting ? (t("client.profile.savingBtn") || (isRTL ? "جاري التحديث..." : "Updating...")) : (t("client.profile.changePasswordBtn") || (isRTL ? "تحديث كلمة المرور" : "Update Password"))}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Security Best Practices Sidebar (1/3 width) */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-[#C45B2A]" />
                  <span>{isRTL ? "إرشادات الأمان وكلمة المرور" : "Password Guidelines"}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-2.5 h-2.5" /></span>
                    <span>{isRTL ? "يجب ألا تقل عن 6 أحرف (يفضل 8 فأكثر)." : "Minimum 6 characters (8+ recommended)."}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-2.5 h-2.5" /></span>
                    <span>{isRTL ? "مزيج من الحروف الإنجليزية والأرقام والرموز الخاصة." : "Combine letters, numbers, and symbols."}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-2.5 h-2.5" /></span>
                    <span>{isRTL ? "لا تشارك كلمة المرور مع أي شخص لضمان أمان البوالص." : "Never share your credentials with third parties."}</span>
                  </li>
                </ul>

                <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isRTL ? "يتم تشفير كلمات المرور باستخدام تقنية Hashing آمنة." : "All credentials are encrypted and hashed securely."}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientProfileView() {
  const { t, isRTL } = useLanguage();
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-gray-500">{t("client.dashboard.loadingPortal") || (isRTL ? "جاري تحميل بوابة العميل..." : "Loading Client Portal...")}</div>}>
      <ClientProfileContent />
    </Suspense>
  );
}


