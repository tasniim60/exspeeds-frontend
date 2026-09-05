"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Truck, ShoppingBag, ArrowRight, CheckCircle2, MessageSquare, Search, Sparkles, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CARRIERS } from "@/lib/tracking";

export default function HomeTrackWidget() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  // SHIP is the primary default action
  const [activeTab, setActiveTab] = useState<"ship" | "track">("ship");
  const [carrier, setCarrier] = useState("DHL");
  const [awb, setAwb] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awb.trim()) return;
    router.push(`/track?awb=${encodeURIComponent(awb.trim())}&carrier=${encodeURIComponent(carrier)}`);
  };

  const handleSampleClick = (sampleAwb: string, carrierName: string) => {
    setAwb(sampleAwb);
    setCarrier(carrierName);
  };

  return (
    <section className="bg-[#F9FAFB] py-14 border-b border-gray-200/80 relative">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-8">
        
        {/* Section Header */}
        <div className="space-y-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold uppercase tracking-wider px-3.5 py-1 rounded-full text-xs inline-flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isRTL ? "منصة الخدمات اللوجستية البيئية" : "Eco-Logistics Operating Hub"}</span>
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-[#251516] tracking-tight">
            {t("home.trackWidget.title")}
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
            {t("home.trackWidget.subtitle")}
          </p>
        </div>

        {/* Biophilic Segmented Action Tabs: SHIP & TRACK */}
        <div className="bg-[#F2F4F0] p-2 rounded-full border border-gray-200/80 shadow-inner max-w-lg mx-auto grid grid-cols-2 gap-2">
          {/* SHIP Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("ship")}
            className={`py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 transition-all font-bold text-sm cursor-pointer select-none ${
              activeTab === "ship"
                ? "bg-[#C45B2A] text-white shadow-md scale-[1.01]"
                : "text-gray-700 hover:bg-white hover:text-gray-900"
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <div className="text-start">
              <span className="block leading-tight font-extrabold">{t("home.trackWidget.tabShip")}</span>
              <span className="block text-[10px] opacity-80 uppercase tracking-wider font-semibold">{t("home.hero.requestShipment")}</span>
            </div>
          </button>

          {/* TRACK Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 transition-all font-bold text-sm cursor-pointer select-none ${
              activeTab === "track"
                ? "bg-[#251516] text-white shadow-md scale-[1.01]"
                : "text-gray-700 hover:bg-white hover:text-gray-900"
            }`}
          >
            <Truck className="w-5 h-5" />
            <div className="text-start">
              <span className="block leading-tight font-extrabold">{t("home.trackWidget.tabTrack")}</span>
              <span className="block text-[10px] opacity-80 uppercase tracking-wider font-semibold">{t("track.tag")}</span>
            </div>
          </button>
        </div>

        {/* Action Panel Content */}
        {activeTab === "ship" ? (
          /* SHIP PANEL */
          <Card className="max-w-2xl mx-auto p-6 md:p-8 bg-white border border-gray-200/90 shadow-xl rounded-[28px] text-start space-y-6 animate-fade-up">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="bg-[#C45B2A]/10 text-[#C45B2A] border border-[#C45B2A]/20 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md inline-block">
                  {isRTL ? "بدون دفع إلكتروني مسبق" : "No Online Payment Needed"}
                </span>
                <h3 className="text-xl font-bold text-[#251516]">{t("home.trackWidget.shipCardTitle")}</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  {t("home.trackWidget.shipCardDesc")}
                </p>
              </div>
            </div>

            {/* Step Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-2.5 text-gray-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="leading-snug">{isRTL ? "1. أدخل بيانات الاستلام والوجهة" : "1. Enter Pickup & Destination"}</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-2.5 text-gray-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="leading-snug">{isRTL ? "2. استلم رقم الطلب (REQ)" : "2. Receive REQ Number"}</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-2.5 text-gray-800 font-semibold">
                <MessageSquare className="w-4 h-4 text-[#C45B2A] shrink-0" />
                <span className="leading-snug">{isRTL ? "3. استلام السعر عبر واتساب" : "3. Price Sent via WhatsApp"}</span>
              </div>
            </div>

            <div className="pt-2 text-start flex items-center justify-between">
              <Link href="/ship">
                <Button
                  variant="brand"
                  size="lg"
                  className="bg-[#C45B2A] hover:bg-[#A34920] text-white font-bold py-3.5 px-8 text-sm rounded-xl inline-flex items-center gap-2 shadow-lg hover:scale-[1.01]"
                >
                  <span>{t("home.trackWidget.shipCardBtn")}</span>
                  <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                </Button>
              </Link>

              <span className="text-xs text-gray-500 font-semibold hidden sm:inline-block">
                {isRTL ? "تتبع فوري بعد إرسال الطلب" : "Instant tracking active post submit"}
              </span>
            </div>
          </Card>
        ) : (
          /* TRACK PANEL */
          <Card className="max-w-2xl mx-auto p-6 md:p-8 bg-white border border-gray-200/90 shadow-xl rounded-[28px] text-start space-y-5 animate-fade-up">
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-grow w-full">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 rtl:right-4 rtl:left-auto" />
                <Input
                  type="text"
                  value={awb}
                  onChange={(e) => setAwb(e.target.value)}
                  placeholder={t("home.trackWidget.awbPlaceholder")}
                  className="w-full pl-12 pr-5 rtl:pr-12 rtl:pl-5 py-3.5 rounded-full border border-gray-300 bg-white text-[#251516] font-mono text-base font-bold focus:border-[#C45B2A] shadow-sm text-start"
                  required
                />
              </div>

              {/* Carrier Selector */}
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-full border border-gray-300 bg-white text-[#251516] text-sm font-bold focus:border-[#C45B2A] focus:outline-none shadow-sm cursor-pointer text-start"
              >
                {CARRIERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full sm:w-auto bg-[#251516] hover:bg-[#382122] text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md whitespace-nowrap cursor-pointer"
              >
                <span>{t("home.trackWidget.trackBtn")}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
              </Button>
            </form>
          </Card>
        )}
      </div>
    </section>
  );
}

