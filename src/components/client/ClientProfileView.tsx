"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { AdminStorage, Shipment } from "@/lib/adminData";
import { ShipmentService } from "@/lib/backendApi";
import { TrackingRedirect } from "@/components/TrackingRedirect";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BorderBeam } from "@/components/magicui/border-beam";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
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
  Copy,
  Navigation,
  RefreshCw,
  Share2,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  Send,
  Plane,
  AlertTriangle,
} from "lucide-react";

interface ConsignmentItem {
  id: string;
  rawDate: string;
  displayDate: string;
  awb: string;
  carrier: string;
  consignee: string;
  origin?: string;
  destination: string;
  contents: string;
  weight: string | number;
  priceDisplay: string;
  hasPrice: boolean;
  status: string;
  currentLocation?: string;
  opNote?: string;
  localizedStatus: string;
  statusColorClass: string;
  rawShipment: Shipment;
}

interface MilestoneStep {
  id: number;
  stageNumber: number;
  title: string;
  location: string;
  timeDisplay: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isAlert?: boolean;
  note?: string;
}

interface StepperStage {
  id: number;
  label: string;
  sublabel: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isAlert: boolean;
}

function computeConsignmentFlow(item: ConsignmentItem, isRTL: boolean) {
  const s = (item.status || "").toLowerCase().trim();
  const isDeliveredStatus = s.includes("deliver") || s.includes("تسليم") || s === "completed";
  const isOutForDelivery = s.includes("out for deliver") || s.includes("خرج للتسليم") || s.includes("مع المندوب");
  const isClearanceOrHub = s.includes("clearance") || s.includes("clerance") || s.includes("تخليص") || s.includes("destination") || s.includes("وصلت") || s.includes("sorting") || s.includes("hub");
  const isExceptionStatus = s.includes("exception") || s === "rto" || s.includes("refused") || s.includes("destroy") || s.includes("cancel") || s.includes("delayed") || s.includes("delay") || s.includes("مسترجعة") || s.includes("استثناء");
  const isInTransit = s.includes("transit") || s.includes("way") || s.includes("cairo") || s.includes("departed") || s.includes("طريق") || s.includes("شحن");

  // Determine active stage (0: Pickup/Created, 1: Air Transit, 2: Customs/Hub, 3: Delivery/Exception)
  let stageIndex = 1;
  if (isDeliveredStatus) {
    stageIndex = 3;
  } else if (isExceptionStatus || isOutForDelivery) {
    stageIndex = 3;
  } else if (isClearanceOrHub) {
    stageIndex = 2;
  } else if (isInTransit) {
    stageIndex = 1;
  } else {
    stageIndex = 0;
  }

  const origin = item.origin || (isRTL ? "مصر - القاهرة" : "Cairo, Egypt");
  const dest = item.destination || (isRTL ? "دولة الوجهة" : "Destination Country");
  const curLoc = item.currentLocation || (stageIndex >= 2 ? dest : origin);
  const baseDate = item.displayDate || (isRTL ? "اليوم" : "Today");

  // 1. Four Master Stepper Stages
  const stages: StepperStage[] = [
    {
      id: 0,
      label: isRTL ? "استلام وتجهيز" : "Pickup & Prep",
      sublabel: isRTL ? "مركز العمليات" : "Origin Gateway",
      isCompleted: stageIndex > 0 || isDeliveredStatus,
      isCurrent: stageIndex === 0 && !isDeliveredStatus,
      isAlert: false,
    },
    {
      id: 1,
      label: isRTL ? "الشحن الدولي" : "Air Freight",
      sublabel: isRTL ? "في مسار الطيران" : "In Flight Transit",
      isCompleted: stageIndex > 1 || isDeliveredStatus,
      isCurrent: stageIndex === 1 && !isDeliveredStatus && !isExceptionStatus,
      isAlert: false,
    },
    {
      id: 2,
      label: isRTL ? "التخليص والوصول" : "Customs & Hub",
      sublabel: isRTL ? "محطة الوصول" : "Inbound Terminal",
      isCompleted: stageIndex > 2 || isDeliveredStatus,
      isCurrent: stageIndex === 2 && !isDeliveredStatus && !isExceptionStatus,
      isAlert: false,
    },
    {
      id: 3,
      label: isExceptionStatus
        ? (isRTL ? "استثناء تسليم" : "Exception / Hold")
        : (isRTL ? "التسليم للمستلم" : "Final Delivery"),
      sublabel: isDeliveredStatus
        ? (isRTL ? "تم التسليم بنجاح" : "Delivered")
        : isExceptionStatus
        ? (isRTL ? "إجراء مطلوب" : "Action Required")
        : isOutForDelivery
        ? (isRTL ? "مع المندوب" : "Out for Delivery")
        : (isRTL ? "قيد الجدولة" : "Scheduled"),
      isCompleted: isDeliveredStatus,
      isCurrent: stageIndex === 3 && !isDeliveredStatus,
      isAlert: isExceptionStatus,
    },
  ];

  // 2. Sequential Chronological Milestones
  const milestones: MilestoneStep[] = [];

  // Milestone 1: Pickup & Booking
  milestones.push({
    id: 1,
    stageNumber: 1,
    title: isRTL ? "تم استلام الشحنة وتأكيد الحجز وتجهيز الطرد" : "Shipment Received & Booking Confirmed",
    location: `${origin} • ${isRTL ? "مركز العمليات والفرز" : "Central Dispatch Gateway"}`,
    timeDisplay: baseDate,
    isCompleted: stageIndex >= 1 || isDeliveredStatus,
    isCurrent: stageIndex === 0 && !isDeliveredStatus,
  });

  // Milestone 2: International Air Transit
  if (stageIndex >= 1 || isDeliveredStatus) {
    milestones.push({
      id: 2,
      stageNumber: 2,
      title: isRTL ? "انطلاق الشحنة في مسار النقل والشحن الجوي السريع" : "Dispatched on International Express Air Route",
      location: isRTL ? "مطار القاهرة الدولي (محطة الشحن الجوي)" : "Cairo International Airport Air Cargo Terminal",
      timeDisplay: isRTL ? "قيد النقل الجوي" : "In Flight Transit",
      isCompleted: stageIndex >= 2 || isDeliveredStatus,
      isCurrent: stageIndex === 1 && !isDeliveredStatus && !isExceptionStatus,
    });
  }

  // Milestone 3: Inbound Terminal & Customs
  if (stageIndex >= 2 || isDeliveredStatus || (isExceptionStatus && curLoc !== origin)) {
    milestones.push({
      id: 3,
      stageNumber: 3,
      title: isRTL ? "وصول الشحنة للمركز الإقليمي وبدء إجراءات التخليص الجمركي" : "Arrived at Inbound Hub & Customs Clearance Processed",
      location: `${dest} • ${isRTL ? "المنفذ الجمركي ومركز الفرز" : "Regional Customs & Sorting Facility"}`,
      timeDisplay: isRTL ? "محطة الوصول" : "Inbound Terminal",
      isCompleted: stageIndex >= 3 || isDeliveredStatus,
      isCurrent: stageIndex === 2 && !isDeliveredStatus && !isExceptionStatus,
    });
  }

  // Milestone 4: Final Outcome / Delivery / Exception
  if (isDeliveredStatus) {
    milestones.push({
      id: 4,
      stageNumber: 4,
      title: isRTL ? "تم تسليم الشحنة بنجاح للمستلم واستلام التوقيع" : "Shipment Successfully Delivered to Consignee",
      location: `${dest} • ${isRTL ? "عنوان المستلم النهائي" : "Consignee Address"}`,
      timeDisplay: isRTL ? "تم التسليم بنجاح" : "Delivered Successfully",
      isCompleted: true,
      isCurrent: true,
      note: item.opNote,
    });
  } else if (isExceptionStatus) {
    milestones.push({
      id: 4,
      stageNumber: 4,
      title: isRTL ? "استثناء تسليم / قيد المتابعة والمعالجة التشغيلية" : "Delivery Exception / Operational Hold",
      location: curLoc,
      timeDisplay: isRTL ? "تحديث العمليات" : "Operations Update",
      isCompleted: false,
      isCurrent: true,
      isAlert: true,
      note: item.opNote || (isRTL ? "يرجى التنسيق مع فريق خدمة العملاء لمتابعة الإجراء المطلوب." : "Please coordinate with operations team for necessary follow-up."),
    });
  } else if (isOutForDelivery) {
    milestones.push({
      id: 4,
      stageNumber: 4,
      title: isRTL ? "خرجت الشحنة مع مندوب التوزيع للتسليم النهائي" : "Out for Final Delivery with Courier",
      location: curLoc,
      timeDisplay: isRTL ? "اليوم" : "Today",
      isCompleted: false,
      isCurrent: true,
      note: item.opNote,
    });
  } else {
    milestones.push({
      id: 4,
      stageNumber: 4,
      title: isRTL ? "التسليم النهائي للمستلم" : "Final Delivery to Consignee",
      location: dest,
      timeDisplay: isRTL ? "متوقع خلال 2-3 أيام عمل" : "Est. in 2-3 business days",
      isCompleted: false,
      isCurrent: false,
    });
  }

  return { stages, milestones, stageIndex, isExceptionStatus, isDeliveredStatus };
}

type TabType = "dashboard" | "settings" | "security";
type FilterType = "all" | "in_transit" | "delivered";

function ClientProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;

  const { user, updateProfile, logout } = useAuth();
  const { t, isRTL, formatDate, getLocalizedPath } = useLanguage();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("settings");
  const [tableFilter, setTableFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dashboard Consignments Data
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedTrackItem, setSelectedTrackItem] = useState<ConsignmentItem | null>(null);
  const [copiedAwb, setCopiedAwb] = useState(false);

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
      setActiveTab(savedTab as TabType);
    } else {
      setActiveTab("settings");
    }
  }, [tabParam, user]);

  const handleTabChange = (tab: TabType) => {
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

    let allShipments = AdminStorage.getShipments();

    try {
      const fetchedShps = await ShipmentService.getShipments();
      if (fetchedShps && Array.isArray(fetchedShps) && fetchedShps.length > 0) {
        allShipments = fetchedShps;
      }
    } catch {}

    const userEmail = (user.email || "").toLowerCase().trim();
    const userName = (user.name || "").toLowerCase().trim();
    const userCompany = (user.company || "").toLowerCase().trim();

    // Match shipments registered to this customer's account, email, company, or sender/receiver
    const userShipments = allShipments.filter((s) => {
      const account = (s.account || "").toLowerCase();
      const comp = (s.company || "").toLowerCase();
      const sender = (s.senderName || "").toLowerCase();
      const receiver = (s.receiverName || "").toLowerCase();

      const matchesAccount = userName && account.includes(userName);
      const matchesCompany = userCompany && (account.includes(userCompany) || comp.includes(userCompany));
      const matchesEmail = userEmail && (account.includes(userEmail) || comp.includes(userEmail));
      const matchesSenderReceiver = userName && (sender.includes(userName) || receiver.includes(userName));

      return matchesAccount || matchesCompany || matchesEmail || matchesSenderReceiver;
    });

    setShipments(userShipments);
  }, [user]);

  // Real-time synchronization: listen to storage, custom events, and poll
  useEffect(() => {
    loadClientData();

    const handleDataUpdate = () => {
      loadClientData();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("shipments_updated", handleDataUpdate);
      window.addEventListener("storage", handleDataUpdate);
      window.addEventListener("focus", handleDataUpdate);
    }

    const interval = setInterval(() => {
      loadClientData();
    }, 6000);

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("shipments_updated", handleDataUpdate);
        window.removeEventListener("storage", handleDataUpdate);
        window.removeEventListener("focus", handleDataUpdate);
      }
      clearInterval(interval);
    };
  }, [loadClientData]);

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
    const s = status.toLowerCase().trim();
    if (!isRTL) {
      if (s === "deliverd") return "Delivered";
      if (s === "in transit" || s === "in the way") return "In Transit";
      if (s === "clerance") return "Clearance";
      if (s === "destroied") return "Destroyed";
      if (s === "refused to recive") return "Refused by Consignee";
      return status;
    }
    if (s.includes("deliver")) return "تم التسليم بنجاح";
    if (s === "out for delivery" || s.includes("out for deliver")) return "خرج للتسليم مع المندوب";
    if (s.includes("information recived") || s.includes("information received") || s.includes("created") || s === "not picked" || s.includes("pending pickup") || s === "pending") return "تم استلام البيانات وجاري التجهيز";
    if (s === "in transit" || s === "in the way" || s === "departed" || s.includes("transit") || s.includes("way")) return "في الطريق / قيد النقل";
    if (s.includes("cairo airport") || s === "cairo airport") return "مطار القاهرة الدولي (الشحن الجوي)";
    if (s.includes("destination") || s === "destination") return "وصلت محطة الوصول المركزية";
    if (s.includes("hub") || s.includes("facility")) return "في مركز الفرز والتوزيع";
    if (s.includes("clearance") || s.includes("clerance")) return "قيد التخليص الجمركي";
    if (s.includes("delayed") || s.includes("delay")) return "تأخير في مسار الشحنة";
    if (s.includes("cancel") || s.includes("ملغاة")) return "ملغاة";
    if (s.includes("exception") || s === "rto" || s.includes("return") || s.includes("refused") || s.includes("re export")) return "مسترجعة / استثناء تسليم";
    if (s.includes("destroied") || s.includes("destroy")) return "شحنة متلفة";
    return status;
  };

  const getStatusColorClass = (status: string) => {
    const s = (status || "").toLowerCase().trim();
    if (s.includes("deliver")) {
      return "bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold";
    }
    if (s.includes("out for deliver")) {
      return "bg-purple-50 text-purple-800 border-purple-300 font-extrabold";
    }
    if (s.includes("exception") || s === "rto" || s.includes("refused") || s.includes("destroy") || s.includes("cancel")) {
      return "bg-rose-50 text-rose-800 border-rose-300 font-extrabold";
    }
    if (s.includes("delay") || s.includes("clearance") || s.includes("clerance")) {
      return "bg-amber-50 text-amber-900 border-amber-300 font-extrabold";
    }
    if (s.includes("transit") || s.includes("way") || s.includes("cairo") || s.includes("destination") || s.includes("departed")) {
      return "bg-sky-50 text-sky-800 border-sky-300 font-extrabold";
    }
    return "bg-slate-100 text-slate-800 border-slate-300 font-extrabold";
  };

  // Real Waybill Consignments dataset
  const consignmentItems = useMemo(() => {
    const list: ConsignmentItem[] = [];

    shipments.forEach((s) => {
      list.push({
        id: `shp-${s.id || s.awb}`,
        rawDate: s.date || "",
        displayDate: s.date ? (formatDate(s.date) || s.date.split("T")[0].split(" ")[0]) : "—",
        awb: s.awb,
        carrier: s.carrier || (isRTL ? "شحن سريع" : "Express"),
        consignee: s.receiverName || (isRTL ? "مستلم محدد" : "Consignee"),
        origin: s.senderCity || (isRTL ? "مصر" : "Egypt"),
        destination: s.country || s.receiverCity || "—",
        contents: s.contents || (isRTL ? "طرد بضائع عامة" : "Parcel Goods"),
        weight: s.weight || "—",
        priceDisplay: s.sellingPrice || s.priceEgp ? `${s.sellingPrice || s.priceEgp} ${isRTL ? "ج.م" : "EGP"}` : "—",
        hasPrice: Boolean(s.sellingPrice || s.priceEgp),
        status: s.status,
        currentLocation: s.currentLocation || undefined,
        opNote: s.opNote || undefined,
        localizedStatus: getLocalizedStatus(s.status),
        statusColorClass: getStatusColorClass(s.status),
        rawShipment: s,
      });
    });

    return list.sort((a, b) => {
      const timeA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
      const timeB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
      return timeB - timeA;
    });
  }, [shipments, isRTL, formatDate]);

  const filteredItems = useMemo(() => {
    return consignmentItems.filter((item) => {
      if (tableFilter === "in_transit" && isDeliveredOrCancelled(item.status)) return false;
      if (tableFilter === "delivered" && !isDelivered(item.status)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAwb = item.awb.toLowerCase().includes(q);
        const matchCarrier = item.carrier.toLowerCase().includes(q);
        const matchConsignee = item.consignee.toLowerCase().includes(q);
        const matchDest = item.destination.toLowerCase().includes(q);
        const matchOrigin = Boolean(item.origin && item.origin.toLowerCase().includes(q));
        const matchContents = item.contents.toLowerCase().includes(q);
        const matchStatus =
          item.status.toLowerCase().includes(q) || item.localizedStatus.toLowerCase().includes(q);
        return matchAwb || matchCarrier || matchConsignee || matchDest || matchOrigin || matchContents || matchStatus;
      }
      return true;
    });
  }, [consignmentItems, tableFilter, searchQuery]);

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (isRTL ? "فشل تحديث بيانات الملف الشخصي." : "Failed to update profile.");
      setErrorMessage(message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (isRTL ? "فشل تغيير كلمة المرور." : "Failed to change password.");
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fallbackCustomerName = t("client.dashboard.customerDefault") || (isRTL ? "العميل" : "Customer");
  const displayName = mounted ? (name || user?.name || fallbackCustomerName) : fallbackCustomerName;
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className={`min-h-screen bg-[#FAF8F5] py-6 sm:py-8 md:py-10 px-3 sm:px-4 md:px-6 space-y-6 ${isRTL ? "text-right" : "text-left"}`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ─── 1. TOP IDENTITY & COMMAND BANNER ─── */}
        <div className="bg-[#180D0E] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-[#301B1D] relative overflow-hidden">
          {/* Subtle Ambient Accent & Border Beam */}
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-[#C45B2A]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/4 bottom-0 translate-y-12 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
          <BorderBeam size={260} duration={14} colorFrom="#C45B2A" colorTo="#E65100" />

          <div className={`relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 ${isRTL ? "lg:text-right" : "lg:text-left"} text-center`}>
            {/* User Meta Identity */}
            <div className={`flex flex-col sm:flex-row items-center gap-5 sm:gap-6 ${isRTL ? "sm:text-right" : "sm:text-left"}`}>
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-[#C45B2A] via-[#D8632E] to-[#A8481B] text-white font-display font-black text-3xl sm:text-4xl flex items-center justify-center shadow-lg border border-white/20">
                  {userInitial}
                </div>
                <span
                  className={`absolute -bottom-1 ${isRTL ? "-left-1" : "-right-1"} w-5 h-5 rounded-full bg-emerald-500 border-3 border-[#180D0E] shadow-sm animate-pulse`}
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
                      ? "bg-purple-500/20 text-purple-200 border-purple-400/30"
                      : "bg-[#C45B2A]/20 text-orange-200 border-[#C45B2A]/40"
                  }`}>
                    {mounted && user?.role === "admin"
                      ? (t("client.dashboard.adminRole") || (isRTL ? "مسؤول النظام" : "Administrator"))
                      : (t("client.dashboard.customerRole") || (isRTL ? "عميل معتمد" : "Verified Customer"))}
                  </span>
                </div>

                <p className="text-gray-300 text-xs sm:text-sm max-w-xl">
                  {t("client.dashboard.subtitle") || (isRTL ? "متابعة مسار بوالص الشحن المسجلة (AWB)، حالات التوصيل الحية، وتحديث إعدادات الحساب والأمان." : "Track your waybill consignments (AWB), live transit updates, and account security.")}
                </p>

                {/* Quick Info Tags */}
                <div className={`flex flex-wrap items-center justify-center ${isRTL ? "sm:justify-start" : "sm:justify-start"} gap-2.5 pt-1 text-xs text-gray-300`}>
                  {mounted && (email || user?.email) && (
                    <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-mono text-orange-200" dir="ltr">
                      <Mail className="w-3.5 h-3.5 opacity-80" />
                      <span>{email || user?.email}</span>
                    </span>
                  )}
                  {mounted && (phone || user?.phone) && (
                    <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-mono text-emerald-200" dir="ltr">
                      <Phone className="w-3.5 h-3.5 opacity-80" />
                      <span>{phone || user?.phone}</span>
                    </span>
                  )}
                  {mounted && (company || user?.company) && (
                    <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-medium text-amber-200">
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
                  href={getLocalizedPath("/admin")}
                  className="h-11 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{isRTL ? "لوحة الإدارة والعمليات" : "Admin Operations Portal"}</span>
                </Link>
              ) : (
                <>
                  <Link href={getLocalizedPath("/ship")}>
                    <ShimmerButton className="h-11 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md">
                      <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                      <span>{isRTL ? "طلب شحن جديد" : "New Shipment"}</span>
                    </ShimmerButton>
                  </Link>
                  <Link
                    href={getLocalizedPath("/track")}
                    className="h-11 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/15 backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Search className="w-4 h-4 shrink-0" />
                    <span>{isRTL ? "تتبع شحنة" : "Track Consignment"}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── 2. TAB NAVIGATION SWITCHER ─── */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-gray-200 shadow-xs">
          {mounted && user?.role !== "admin" && (
            <button
              type="button"
              onClick={() => handleTabChange("dashboard")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-[#211112] text-white shadow-sm font-extrabold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-[#C45B2A]" />
              <span className="hidden sm:inline">{t("client.profile.tabs.dashboard") || (isRTL ? "سجل بوالص الشحن (AWB)" : "Shipments Ledger")}</span>
              <span className="sm:hidden">{isRTL ? "الشحنات" : "Shipments"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleTabChange("settings")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#211112] text-white shadow-sm font-extrabold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <User className="w-4 h-4 shrink-0 text-[#C45B2A]" />
            <span className="hidden sm:inline">{t("client.profile.tabs.settings") || (isRTL ? "إعدادات الملف الشخصي" : "Profile Settings")}</span>
            <span className="sm:hidden">{isRTL ? "الملف الشخصي" : "Profile"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("security")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-[#211112] text-white shadow-sm font-extrabold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Lock className="w-4 h-4 shrink-0 text-[#C45B2A]" />
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
        {/* TAB 1: CLIENT DASHBOARD (MY CONSIGNMENTS - AWB) */}
        {/* ========================================================= */}
        {activeTab === "dashboard" && mounted && user?.role !== "admin" && (
          <div className="space-y-6 animate-fade-up">
            {/* KPI Stat Cards with NumberTicker */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Total Waybills */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs flex items-center justify-between transition-all hover:border-[#C45B2A]/40">
                <div className="space-y-1 text-start">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("client.dashboard.totalShipments") || (isRTL ? "إجمالي بوالص الشحن (AWB)" : "Registered Consignments")}
                  </span>
                  <div className="text-3xl font-display font-black text-[#251516]" dir="ltr">
                    <NumberTicker value={shipments.length} />
                  </div>
                  <p className="text-xs text-[#C45B2A] font-bold">
                    {activeShipmentsCount} {isRTL ? "قيد المتابعة والشحن" : "Active in transit"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#C45B2A] flex items-center justify-center shrink-0 border border-orange-100 shadow-2xs">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Active In Transit */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs flex items-center justify-between transition-all hover:border-[#C45B2A]/40">
                <div className="space-y-1 text-start">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("client.dashboard.activeShipments") || (isRTL ? "قيد الشحن والتوصيل" : "In Active Transit")}
                  </span>
                  <div className="text-3xl font-display font-black text-[#251516]" dir="ltr">
                    <NumberTicker value={activeShipmentsCount} />
                  </div>
                  <p className="text-xs text-sky-700 font-semibold">
                    {isRTL ? "شحنات جارية في المسار الحي" : "Consignments on the move"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 shadow-2xs">
                  <Truck className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Delivered Successfully */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs flex items-center justify-between transition-all hover:border-[#C45B2A]/40">
                <div className="space-y-1 text-start">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("client.dashboard.deliveredShipments") || (isRTL ? "الشحنات المسلمة بنجاح" : "Delivered Consignments")}
                  </span>
                  <div className="text-3xl font-display font-black text-[#251516]" dir="ltr">
                    <NumberTicker value={deliveredShipmentsCount} />
                  </div>
                  <p className="text-xs text-emerald-700 font-semibold">
                    {t("client.dashboard.deliveredShipmentsSub") || (isRTL ? "تم التسليم للعميل النهائي" : "Delivered to Final Consignee")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* ─── REGISTERED CONSIGNMENTS MASTER LEDGER ─── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-5 animate-fade-up">
              {/* Header & Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="text-start space-y-1">
                  <h2 className="text-base sm:text-lg font-bold text-[#251516] flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#C45B2A]" />
                    <span>{isRTL ? "سجل بوالص الشحن المعتمدة (AWB)" : "Registered Consignments Ledger"}</span>
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isRTL
                      ? "متابعة شاملة لجميع بوالص الشحن المسجلة، مسارات التتبع الحية، وتحديثات إدارة العمليات."
                      : "Comprehensive overview of your registered waybills, live tracking routes, and dispatch notes."}
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
                      placeholder={isRTL ? "بحث برقم البوليصة (AWB)، المستلم، المحتويات..." : "Search by AWB, consignee, contents..."}
                      className={`w-full h-10 bg-gray-50 hover:bg-white focus:bg-white text-xs rounded-xl border border-gray-200 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
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

                  {/* New Shipment Link */}
                  <Link
                    href={getLocalizedPath("/ship")}
                    className="h-10 px-4 rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                    <span>{t("client.dashboard.requestsTable.newRequestBtn") || (isRTL ? "طلب شحن جديد" : "New Shipment")}</span>
                  </Link>
                </div>
              </div>

              {/* Filter Chips Toolbar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setTableFilter("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    tableFilter === "all"
                      ? "bg-[#211112] text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{isRTL ? "جميع الشحنات" : "All Shipments"}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    tableFilter === "all" ? "bg-white/20 text-white" : "bg-white text-gray-700"
                  }`}>
                    {consignmentItems.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTableFilter("in_transit")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    tableFilter === "in_transit"
                      ? "bg-sky-700 text-white shadow-xs"
                      : "bg-sky-50 text-sky-800 hover:bg-sky-100"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{isRTL ? "قيد الشحن والنقل" : "In Transit"}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    tableFilter === "in_transit" ? "bg-white/20 text-white" : "bg-white text-sky-800"
                  }`}>
                    {activeShipmentsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTableFilter("delivered")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    tableFilter === "delivered"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isRTL ? "تم التسليم بنجاح" : "Delivered"}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    tableFilter === "delivered" ? "bg-white/20 text-white" : "bg-white text-emerald-800"
                  }`}>
                    {deliveredShipmentsCount}
                  </span>
                </button>
              </div>

              {/* Table Data Content or Empty States */}
              {consignmentItems.length === 0 ? (
                <div className="text-center py-12 space-y-4 text-gray-500">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#C45B2A] flex items-center justify-center mx-auto border border-orange-100 shadow-2xs">
                    <Package className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm md:text-base font-bold text-[#251516]">
                      {isRTL ? "لا توجد بوالص شحن مسجلة بعد" : "No Registered Shipments Yet"}
                    </h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                      {isRTL
                        ? "لم يتم تسجيل أي بوالص شحن مرتبطة بحسابك بعد. يمكنك إنشاء طلب شحن جديد أو التواصل مع إدارة العمليات لتسجيل شحنتك."
                        : "No waybills registered under your account yet. Submit a new shipment request to get started."}
                    </p>
                  </div>
                  <Link
                    href="/ship"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
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
                      ? "جرب البحث برقم بوليصة الشحن (AWB) أو اسم المستلم أو المحتويات."
                      : "Try searching by waybill (AWB), consignee name, or destination city."}
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
                    <table className="w-full text-xs text-start border-collapse min-w-[880px]">
                      <thead>
                        <tr className="bg-gray-50/95 text-gray-700 uppercase font-extrabold border-b border-gray-200 text-start text-[11px] select-none">
                          <th className="py-3.5 px-3 text-start w-[17%]">{isRTL ? "رقم البوليصة والتاريخ" : "Waybill (AWB) & Date"}</th>
                          <th className="py-3.5 px-3 text-start w-[18%]">{isRTL ? "المسار والمستلم" : "Route & Consignee"}</th>
                          <th className="py-3.5 px-3 text-start w-[17%]">{isRTL ? "المحتويات والوزن" : "Cargo & Weight"}</th>
                          <th className="py-3.5 px-3 text-start w-[12%]">{isRTL ? "رسوم الشحن" : "Shipping Charges"}</th>
                          <th className="py-3.5 px-2 text-center w-[12%]">{isRTL ? "الحالة" : "Status"}</th>
                          <th className="py-3.5 px-3 text-start w-[15%]">{isRTL ? "الموقع الحي والتحديث" : "Live Location & Updates"}</th>
                          <th className="py-3.5 px-2 text-center w-[9%]">{isRTL ? "الإجراءات" : "Actions"}</th>
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
                                    className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-900 border border-gray-200 inline-block shadow-2xs"
                                    dir="ltr"
                                  >
                                    {item.awb}
                                  </span>
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase bg-sky-100 text-sky-800">
                                    AWB
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                                  <span className="font-mono">{item.displayDate}</span>
                                  <span>•</span>
                                  <span className="font-bold text-gray-700">{item.carrier}</span>
                                </div>
                              </div>
                            </td>

                            {/* 2. Route & Consignee */}
                            <td className="py-3.5 px-3 text-start align-top">
                              <div className="space-y-1">
                                <p className="font-bold text-gray-900 text-xs leading-snug break-words whitespace-normal">
                                  {item.consignee}
                                </p>
                                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                  <MapPin className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
                                  <span className="font-medium text-gray-700">{item.destination}</span>
                                  {item.origin && (
                                    <span className="text-[10px] text-gray-400">({isRTL ? "من:" : "From:"} {item.origin})</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* 3. Cargo & Weight */}
                            <td className="py-3.5 px-3 text-start align-top">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="inline-block px-1.5 py-0.2 rounded bg-orange-50 border border-orange-200/60 text-[#C45B2A] font-mono font-bold text-[10px]" dir="ltr">
                                    {item.weight} {isRTL ? "كجم" : "KG"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-600 leading-snug break-words whitespace-normal">
                                  {item.contents}
                                </p>
                              </div>
                            </td>

                            {/* 4. Charges */}
                            <td className="py-3.5 px-3 text-start align-top">
                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800 font-mono font-black text-xs shadow-2xs" dir="ltr">
                                {item.priceDisplay}
                              </span>
                            </td>

                            {/* 5. Status Badge */}
                            <td className="py-3.5 px-2 text-center align-top whitespace-nowrap">
                              <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-extrabold border shadow-2xs ${item.statusColorClass}`}>
                                {item.localizedStatus}
                              </span>
                            </td>

                            {/* 6. Live Location & Updates */}
                            <td className="py-3.5 px-3 text-start align-top whitespace-normal">
                              <div className="space-y-1 max-w-[210px]">
                                {item.currentLocation ? (
                                  <div className="flex items-center gap-1.5 text-[11px] text-gray-800 font-semibold" title={item.currentLocation}>
                                    <MapPin className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
                                    <span className="truncate">{item.currentLocation}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 font-mono text-[11px]">—</span>
                                )}
                                {item.opNote && (
                                  <div className="flex items-start gap-1.5 text-[10px] text-amber-900 bg-amber-50/90 border border-amber-200/90 px-2 py-1 rounded-lg shadow-2xs font-semibold" title={item.opNote}>
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                    <span className="leading-tight break-words">{item.opNote}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* 7. Action Buttons */}
                            <td className="py-3.5 px-2 text-center align-top whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => setSelectedTrackItem(item)}
                                  className="h-7 px-2.5 rounded-lg bg-[#211112] hover:bg-[#C45B2A] text-white font-bold text-[10px] sm:text-[11px] inline-flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                  title={isRTL ? "عرض خط السير ومحطات التتبع" : "View tracking milestones"}
                                >
                                  <Eye className="w-3.5 h-3.5 shrink-0" />
                                  <span>{isRTL ? "المسار" : "Milestones"}</span>
                                </button>
                                <TrackingRedirect
                                  carrier={item.rawShipment.carrier}
                                  awb={item.rawShipment.awb}
                                  variant="button"
                                  label={isRTL ? "تتبع" : "Track"}
                                  className="px-2.5 py-1 text-[10px] sm:text-[11px] font-bold shadow-xs"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 2. Mobile Responsive Card List (visible on sm:hidden) */}
                  <div className="sm:hidden space-y-3">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-3.5 space-y-3 shadow-xs">
                        {/* Header: Reference #, Type & Status */}
                        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="font-mono font-black text-xs px-2 py-0.5 rounded border inline-block text-gray-900 bg-gray-50 border-gray-200"
                                dir="ltr"
                              >
                                {item.awb}
                              </span>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase bg-sky-100 text-sky-800">
                                AWB
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono">
                              {item.displayDate} • {item.carrier}
                            </p>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-2xs ${item.statusColorClass}`}>
                            {item.localizedStatus}
                          </span>
                        </div>

                        {/* Live Location / Operational Note Pills if available */}
                        {(item.currentLocation || item.opNote) && (
                          <div className="flex flex-col gap-1 text-xs">
                            {item.currentLocation && (
                              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
                                <MapPin className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
                                <span>{isRTL ? "الموقع الحالي:" : "Current Location:"}</span>
                                <span className="font-bold text-slate-900">{item.currentLocation}</span>
                              </div>
                            )}
                            {item.opNote && (
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{item.opNote}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Route / Consignee */}
                        <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-200/80 space-y-1 text-xs">
                          <p className="font-bold text-gray-900 leading-snug break-words">
                            {item.consignee}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-gray-500">
                            <MapPin className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
                            <span>{item.destination}</span>
                            {item.origin && (
                              <span className="text-[10px] text-gray-400">({isRTL ? "من:" : "From:"} {item.origin})</span>
                            )}
                          </div>
                        </div>

                        {/* Cargo Details */}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-gray-800">
                              {isRTL ? "طرد مسجل" : "Express Parcel"}
                            </span>
                            <span className="font-mono font-bold text-[#C45B2A]" dir="ltr">
                              {item.weight} {isRTL ? "كجم" : "KG"}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-snug break-words bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                            {item.contents}
                          </p>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                          <div>
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs" dir="ltr">
                              {item.priceDisplay}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedTrackItem(item)}
                              className="h-8 px-2.5 rounded-xl bg-[#211112] hover:bg-[#C45B2A] text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              title={isRTL ? "عرض خط السير ومحطات التتبع" : "View Milestones"}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isRTL ? "المسار" : "Milestones"}</span>
                            </button>
                            <TrackingRedirect
                              carrier={item.rawShipment.carrier}
                              awb={item.rawShipment.awb}
                              variant="button"
                              label={isRTL ? "تتبع" : "Track"}
                              className="px-3 py-1.5 text-xs font-bold shadow-xs"
                            />
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
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-orange-50 text-[#C45B2A] border border-orange-100">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {t("client.profile.personalInfoTitle") || (isRTL ? "البيانات الشخصية وبيانات التواصل" : "Personal & Contact Details")}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t("client.profile.personalInfoSubtitle") || (isRTL ? "تحديث وتعديل بيانات الحساب والشركة المسجلة." : "Update your primary contact and company information.")}
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
                        className={`w-full h-11 bg-gray-50 hover:bg-white focus:bg-white text-[#251516] text-xs font-bold rounded-xl border border-gray-200 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                          isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                        }`}
                        required
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
                        className={`w-full h-11 bg-gray-50 hover:bg-white focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-200 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                          isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                        }`}
                        dir="ltr"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone / WhatsApp */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      {t("client.profile.phoneLabel") || (isRTL ? "رقم الهاتف / الواتساب" : "Phone / WhatsApp Number")}
                    </label>
                    <div className="relative flex items-center">
                      <Phone className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} h-4 w-4 text-gray-400 pointer-events-none`} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={isRTL ? "01012345678 أو +20..." : "+20 101 234 5678"}
                        className={`w-full h-11 bg-gray-50 hover:bg-white focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-200 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                          isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                        }`}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      {t("client.profile.companyLabel") || (isRTL ? "اسم الشركة / النشاط التجاري" : "Company / Business Name")}
                    </label>
                    <div className="relative flex items-center">
                      <Building className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} h-4 w-4 text-gray-400 pointer-events-none`} />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder={isRTL ? "اسم الشركة أو المؤسسة" : "Company Name"}
                        className={`w-full h-11 bg-gray-50 hover:bg-white focus:bg-white text-[#251516] text-xs font-bold rounded-xl border border-gray-200 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                          isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-5 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 px-7 rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? (t("client.profile.savingBtn") || (isRTL ? "جاري الحفظ..." : "Saving...")) : (t("client.profile.saveBtn") || (isRTL ? "حفظ التغييرات" : "Save Changes"))}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Account Overview Sidebar (1/3 width) */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#C45B2A]" />
                  <span>{isRTL ? "حالة الحساب والتوثيق" : "Account Verification"}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-extrabold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isRTL ? "حساب عميل نشط وموثق" : "Active Verified Account"}</span>
                  </div>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    {isRTL
                      ? "حسابك مفعّل بالكامل في شبكة XSPEED Express اللوجستية وتستفيد من أسرع معدلات التخليص والتوصيل."
                      : "Your account is active on the XSPEED logistics network with priority dispatch."}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">{isRTL ? "نوع الحساب:" : "Account Type:"}</span>
                    <span className="font-bold text-gray-800">{user?.role === "admin" ? "Admin" : "Verified Customer"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">{isRTL ? "تاريخ التفعيل:" : "Registered:"}</span>
                    <span className="font-mono text-gray-800">2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SECURITY & PASSWORD */}
        {/* ========================================================= */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
            {/* Password Form Column (2/3 width) */}
            <form onSubmit={handleSecuritySubmit} className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-orange-50 text-[#C45B2A] border border-orange-100">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {t("client.profile.securityTitle") || (isRTL ? "تغيير كلمة المرور وإعدادات الأمان" : "Change Password & Security")}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t("client.profile.securitySubtitle") || (isRTL ? "تحديث كلمة المرور لحماية حسابك وبوالص الشحن." : "Update your password to keep your account safe.")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      {t("client.profile.currentPasswordLabel") || (isRTL ? "كلمة المرور الحالية" : "Current Password")}
                    </label>
                    <div className="relative flex items-center">
                      <KeyRound className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} h-4 w-4 text-gray-400 pointer-events-none`} />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full h-11 bg-gray-50 hover:bg-white focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-200 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
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
                        className={`w-full h-11 bg-gray-50 hover:bg-white focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-200 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
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
                        className={`w-full h-11 bg-gray-50 hover:bg-white focus:bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-200 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
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
                    className="h-11 px-7 rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isSubmitting ? (t("client.profile.savingBtn") || (isRTL ? "جاري التحديث..." : "Updating...")) : (t("client.profile.changePasswordBtn") || (isRTL ? "تحديث كلمة المرور" : "Update Password"))}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Security Best Practices Sidebar (1/3 width) */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-[#C45B2A]" />
                  <span>{isRTL ? "إرشادات الأمان والحماية" : "Security Guidelines"}</span>
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

        {/* ─── 4. LIVE CONSIGNMENT TRACKING & MILESTONES MODAL ─── */}
        <Dialog open={!!selectedTrackItem} onOpenChange={(open) => !open && setSelectedTrackItem(null)}>
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl border-0 shadow-2xl bg-[#FAF8F5]">
            {selectedTrackItem && (() => {
              const { stages, milestones, isExceptionStatus, isDeliveredStatus } = computeConsignmentFlow(selectedTrackItem, isRTL);

              return (
                <div className="space-y-0 text-start">
                  {/* Modal Top Header Banner */}
                  <div className="bg-[#180D0E] text-white p-5 sm:p-6 rounded-t-3xl relative overflow-hidden border-b border-[#301B1D]">
                    <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-[#C45B2A]/25 rounded-full blur-2xl pointer-events-none" />
                    <BorderBeam size={180} duration={10} colorFrom="#C45B2A" colorTo="#E65100" />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-white/10 text-orange-200 border border-white/10">
                            AWB Consignment
                          </span>
                          <span className="text-[11px] font-bold text-gray-300">
                            {selectedTrackItem.carrier}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight" dir="ltr">
                            {selectedTrackItem.awb}
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedTrackItem.awb);
                              setCopiedAwb(true);
                              setTimeout(() => setCopiedAwb(false), 2000);
                            }}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors cursor-pointer"
                            title={isRTL ? "نسخ رقم البوليصة" : "Copy AWB number"}
                          >
                            {copiedAwb ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-black border shadow-xs ${selectedTrackItem.statusColorClass}`}>
                          {selectedTrackItem.localizedStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Modal Body Content */}
                  <div className="p-5 sm:p-6 space-y-5">

                    {/* 1. VISUAL 4-STAGE PROGRESS STEPPER (مخطط سير ومراحل الشحنة) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                        <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#C45B2A]" />
                          <span>{isRTL ? "مخطط مسار ومراحل الشحنة" : "Consignment Transit Stepper"}</span>
                        </span>
                        <span className="text-[11px] font-bold text-gray-500">
                          {isDeliveredStatus
                            ? (isRTL ? "اكتمل التسليم 100%" : "Completed 100%")
                            : isExceptionStatus
                            ? (isRTL ? "تنبيه تشغيلي مطلوب" : "Action Required")
                            : (isRTL ? "متابعة مباشرة ومحدثة" : "Realtime Active")}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-2 relative">
                        {stages.map((stg, idx) => {
                          let iconNode = <Package className="w-4 h-4" />;
                          if (stg.id === 1) iconNode = <Plane className="w-4 h-4" />;
                          if (stg.id === 2) iconNode = <Building className="w-4 h-4" />;
                          if (stg.id === 3) {
                            iconNode = stg.isAlert ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />;
                          }

                          return (
                            <div
                              key={stg.id}
                              className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                                stg.isCompleted
                                  ? "bg-emerald-50/70 border-emerald-200/90 text-emerald-950"
                                  : stg.isAlert
                                  ? "bg-rose-50/80 border-rose-200/90 text-rose-950 ring-2 ring-rose-300/50"
                                  : stg.isCurrent
                                  ? "bg-orange-50/90 border-[#C45B2A]/60 text-gray-900 ring-2 ring-[#C45B2A]/20"
                                  : "bg-gray-50/60 border-gray-200/80 text-gray-400"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs ${
                                    stg.isCompleted
                                      ? "bg-emerald-600 text-white"
                                      : stg.isAlert
                                      ? "bg-rose-600 text-white animate-pulse"
                                      : stg.isCurrent
                                      ? "bg-[#C45B2A] text-white shadow-xs animate-pulse"
                                      : "bg-gray-200 text-gray-500"
                                  }`}
                                >
                                  {stg.isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : iconNode}
                                </div>
                                <span className="text-[10px] font-mono font-bold text-gray-400">
                                  0{idx + 1}
                                </span>
                              </div>

                              <div>
                                <p className={`text-xs font-black leading-tight ${stg.isCompleted || stg.isCurrent || stg.isAlert ? "text-gray-900" : "text-gray-500"}`}>
                                  {stg.label}
                                </p>
                                <p className={`text-[10px] font-medium mt-0.5 ${stg.isAlert ? "text-rose-700 font-bold" : "text-gray-500"}`}>
                                  {stg.sublabel}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. REALTIME TELEMETRY & LOCATION CARD (الموقع الحي والملاحظات) */}
                    <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-xs space-y-3">
                      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isExceptionStatus ? "bg-rose-400" : "bg-emerald-400"}`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isExceptionStatus ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                          </span>
                          <span className="text-xs font-bold text-gray-700">
                            {isRTL ? "الحالة الحالية للشحنة:" : "Current Status:"}
                          </span>
                          <span className="text-xs font-black text-[#251516]">
                            {selectedTrackItem.localizedStatus}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-gray-400">
                          {selectedTrackItem.displayDate}
                        </span>
                      </div>

                      {/* Current Location */}
                      <div className="flex items-center gap-2 text-xs text-gray-700">
                        <MapPin className="w-4 h-4 text-[#C45B2A] shrink-0" />
                        <span className="font-semibold text-gray-500">{isRTL ? "الموقع الحالي المسجل:" : "Current Recorded Location:"}</span>
                        <span className="font-extrabold text-gray-900">
                          {selectedTrackItem.currentLocation || (isRTL ? "مستودع الفرز والعبور المركزي" : "Central Sorting Facility")}
                        </span>
                      </div>

                      {/* Operational Note Alert if any */}
                      {selectedTrackItem.opNote && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs font-bold flex items-start gap-2.5 shadow-2xs">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="font-extrabold text-amber-900">{isRTL ? "ملاحظة وتنبيه فريق العمليات:" : "Operations Team Notice:"}</p>
                            <p className="text-amber-800 font-medium leading-relaxed">{selectedTrackItem.opNote}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. SIMPLIFIED SEQUENTIAL MILESTONES (محطات المسار المعتمدة زمنياً) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-[#C45B2A]" />
                          <span>{isRTL ? "محطات التتبع ومسار الشحنة التفصيلي" : "Sequential Route Milestones"}</span>
                        </h4>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {milestones.length} {isRTL ? "محطات مسجلة" : "Milestones"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {milestones.map((m) => (
                          <div
                            key={m.id}
                            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                              m.isAlert
                                ? "bg-rose-50/70 border-rose-200/90 text-rose-950"
                                : m.isCurrent
                                ? "bg-orange-50/50 border-orange-200/90 text-gray-900 shadow-2xs"
                                : m.isCompleted
                                ? "bg-gray-50/70 border-gray-200/80 text-gray-800"
                                : "bg-gray-50/30 border-gray-200/60 text-gray-400 opacity-70"
                            }`}
                          >
                            {/* Step Badge */}
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs ${
                                m.isCompleted
                                  ? "bg-emerald-600 text-white"
                                  : m.isAlert
                                  ? "bg-rose-600 text-white animate-pulse"
                                  : m.isCurrent
                                  ? "bg-[#C45B2A] text-white shadow-xs ring-4 ring-orange-100"
                                  : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {m.isCompleted ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : m.isAlert ? (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              ) : m.isCurrent ? (
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </div>

                            {/* Step Text Details */}
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <p className={`text-xs font-extrabold ${m.isAlert ? "text-rose-900" : m.isCurrent ? "text-[#C45B2A]" : "text-gray-900"}`}>
                                  {m.title}
                                </p>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/90 border border-gray-200 text-gray-600 font-bold">
                                  {m.timeDisplay}
                                </span>
                              </div>

                              <p className="text-[11px] text-gray-600 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#C45B2A] shrink-0" />
                                <span className="truncate">{m.location}</span>
                              </p>

                              {m.note && (
                                <div className="mt-1.5 p-2 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-start gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                  <span>{m.note}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. ROUTE & CONSIGNMENT SPECS SUMMARY */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Origin & Destination */}
                      <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-xs space-y-2">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                          {isRTL ? "مسار الشحنة والتسليم" : "Route & Delivery"}
                        </span>
                        <div className="space-y-1.5 text-xs">
                          {selectedTrackItem.origin && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">{isRTL ? "من:" : "From:"}</span>
                              <span className="font-medium text-gray-800">{selectedTrackItem.origin}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-[#C45B2A] font-bold">
                            <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                            <span className="font-extrabold text-gray-900">{selectedTrackItem.destination}</span>
                          </div>
                          {selectedTrackItem.consignee && selectedTrackItem.consignee !== selectedTrackItem.destination && (
                            <p className="text-[11px] text-gray-500 pt-0.5">
                              {isRTL ? "المستلم:" : "Consignee:"} <span className="font-bold text-gray-800">{selectedTrackItem.consignee}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Cargo Specs & Charges */}
                      <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-xs space-y-2">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                          {isRTL ? "مواصفات الطرد والرسوم" : "Cargo Specs & Rate"}
                        </span>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-gray-600">
                            <span className="text-gray-500">{isRTL ? "الوزن الإجمالي:" : "Total Weight:"}</span>
                            <span className="font-mono font-bold text-gray-900" dir="ltr">{selectedTrackItem.weight} {isRTL ? "كجم" : "KG"}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-600">
                            <span className="text-gray-500">{isRTL ? "المحتويات:" : "Contents:"}</span>
                            <span className="font-medium text-gray-900 truncate max-w-[140px]">{selectedTrackItem.contents}</span>
                          </div>
                          {selectedTrackItem.hasPrice && (
                            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                              <span className="text-gray-500 font-bold">{isRTL ? "القيمة / السعر:" : "Charge:"}</span>
                              <span className="font-mono font-black text-emerald-700 text-xs" dir="ltr">{selectedTrackItem.priceDisplay}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 5. CUSTOMER WHATSAPP QUICK HELP BANNER */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="space-y-0.5 text-xs">
                        <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{isRTL ? "هل لديك أي استفسار أو طلب بخصوص هذه الشحنة؟" : "Have questions about this consignment?"}</span>
                        </p>
                        <p className="text-emerald-800 text-[11px]">
                          {isRTL ? "تواصل مباشرة مع فريق العمليات والتوصيل عبر واتساب برقم البوليصة." : "Chat with our operations dispatch team directly on WhatsApp."}
                        </p>
                      </div>

                      <a
                        href={`https://wa.me/201208027171?text=${encodeURIComponent(
                          isRTL
                            ? `مرحباً فريق عمليات XSPEED، أود الاستفسار بخصوص الشحنة رقم *${selectedTrackItem.awb}* (${selectedTrackItem.carrier}):\n- الحالة الحالية: ${selectedTrackItem.localizedStatus}\n- الوجهة: ${selectedTrackItem.destination}\nأرجو إفادتي بآخر التحديثات.`
                            : `Hello XSPEED Operations Team, I would like to inquire about shipment *${selectedTrackItem.awb}* (${selectedTrackItem.carrier}):\n- Current Status: ${selectedTrackItem.localizedStatus}\n- Destination: ${selectedTrackItem.destination}\nPlease advise on latest update.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isRTL ? "محادثة العمليات واتساب" : "WhatsApp Support"}</span>
                      </a>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 rounded-b-3xl flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      {selectedTrackItem.rawShipment && (
                        <TrackingRedirect
                          carrier={selectedTrackItem.rawShipment.carrier}
                          awb={selectedTrackItem.rawShipment.awb}
                          variant="button"
                          label={isRTL ? "تتبع مباشر من شركة الشحن" : "Carrier Live Tracking"}
                          className="px-4 py-2 text-xs font-bold shadow-xs"
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTrackItem(null)}
                      className="h-9 px-5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs border border-gray-300 shadow-2xs transition-colors cursor-pointer"
                    >
                      {isRTL ? "إغلاق" : "Close"}
                    </button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
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

