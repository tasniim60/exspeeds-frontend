"use client";

import React, { useState } from "react";
import {
  Compass,
  Search,
  Truck,
  Plane,
  MapPin,
  Clock,
  CheckCircle2,
  Copy,
  ExternalLink,
  Navigation,
  Sparkles,
  Package,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shipment } from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";
import { TrackingRedirect } from "@/components/TrackingRedirect";

interface TrackingViewProps {
  shipments: Shipment[];
  initialSelectedAwb?: string;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  shipments,
  initialSelectedAwb,
}) => {
  const { t, isRTL } = useLanguage();
  const [searchAwb, setSearchAwb] = useState(initialSelectedAwb || "");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    initialSelectedAwb
      ? shipments.find((s) => s.awb === initialSelectedAwb) || null
      : shipments[0] || null
  );
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync with prop changes
  React.useEffect(() => {
    if (initialSelectedAwb) {
      const found = shipments.find((s) => s.awb === initialSelectedAwb);
      if (found) setSelectedShipment(found);
    } else if (!selectedShipment && shipments.length > 0) {
      setSelectedShipment(shipments[0]);
    }
  }, [initialSelectedAwb, shipments, selectedShipment]);

  const activeShipment = selectedShipment || (shipments.length > 0 ? shipments[0] : null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = shipments.find(
      (s) => s.awb.toLowerCase() === searchAwb.trim().toLowerCase()
    );
    if (found) {
      setSelectedShipment(found);
    } else {
      alert(`No shipment found with AWB ${searchAwb}`);
    }
  };

  const handleCopyPublicLink = () => {
    if (!activeShipment) return;
    const publicUrl = `https://exspeeds.com/track?awb=${activeShipment.awb}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filter in-transit real shipments from ledger
  const liveActiveShipments = shipments.filter(
    (s) => s.status === "In Transit" || s.status === "Out for Delivery" || s.status === "Delayed"
  ).slice(0, 6);

  return (
    <div className="space-y-6 text-start">
      {/* Top Search Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-600 shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              {t("admin.tracking.title")}
            </h2>
            <p className="text-xs text-gray-500">
              {t("admin.tracking.subtitle")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-2.5 h-4 w-4 text-gray-400`} />
            <Input
              value={searchAwb}
              onChange={(e) => setSearchAwb(e.target.value)}
              placeholder={t("admin.tracking.searchPlaceholder")}
              className={`font-mono text-xs uppercase font-bold ltr-preserve ${isRTL ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`}
            />
          </div>
          <Button type="submit" size="sm" variant="brand" className="text-xs font-bold cursor-pointer">
            {isRTL ? "تتبع الآن" : "Track Shipment"}
          </Button>
        </form>
      </div>

      {/* Main Grid: Active Consignment Telemetry Detail on Left, Active Ledger Shipments on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Selected AWB Deep Telemetry Card */}
        <div className="lg:col-span-2 space-y-6">
          {!activeShipment ? (
            <Card className="shadow-2xs p-12 text-center text-gray-500 space-y-3 bg-white border border-gray-200">
              <Compass className="h-10 w-10 mx-auto text-[#C45B2A]/40" />
              <h3 className="text-base font-bold text-gray-800">{isRTL ? "لم يتم تحديد شحنة للتتبع" : "No Shipment Selected"}</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {isRTL ? "أدخل رقم بوليصة شحن صالحة في شريط البحث أعلاه لمعاينة تفاصيل التتبع الحي." : "Enter an active AWB in the search bar above to inspect tracking telemetry."}
              </p>
            </Card>
          ) : (
            <Card className="shadow-2xs overflow-hidden border-gray-200 text-start">
              {/* Telemetry Header */}
              <div className="p-6 bg-gradient-to-r from-[#251516] to-[#3E2426] text-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#C45B2A] uppercase">
                      OFFICIAL CARRIER TELEMETRY
                    </span>
                    <h3 className="text-2xl font-black font-mono tracking-tight mt-0.5 ltr-preserve">
                      {activeShipment.awb}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-300">
                      <span>{activeShipment.account || activeShipment.company}</span>
                      <ArrowRight className={`w-3.5 h-3.5 text-[#C45B2A] shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                      <span>{activeShipment.receiverName} ({activeShipment.country})</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="brand" size="default" className="text-xs font-bold py-1 px-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1" />
                      {activeShipment.status}
                    </Badge>

                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={handleCopyPublicLink}
                      className="text-xs bg-white/10 hover:bg-white/20 text-white border-0 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
                    </Button>

                    {/* Direct Carrier Redirect Button */}
                    <TrackingRedirect carrier={activeShipment.carrier} awb={activeShipment.awb} variant="button" label={`Track on ${activeShipment.carrier}`} />
                  </div>
                </div>

                {/* Status Location Banner */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-4 w-4 text-[#C45B2A] shrink-0" />
                    <span>Current Status: <strong className="text-white">{activeShipment.currentLocation}</strong></span>
                  </span>
                  <span className="font-mono text-[#C45B2A] font-bold">{activeShipment.carrier}</span>
                </div>
              </div>

              {/* Package & Weight Specifications */}
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-1 text-start">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Main Carrier</span>
                    <p className="font-bold text-gray-900">{activeShipment.carrier}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-1 text-start">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Broker Partner</span>
                    <p className="font-bold text-indigo-600">{activeShipment.broker || "XSpeed"}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-1 text-start">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Chargeable Weight</span>
                    <p className="font-bold text-gray-900 font-mono">{activeShipment.weight} KG</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-1 text-start">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Registered By</span>
                    <p className="font-bold text-emerald-700">{activeShipment.agentName || "مصطفي"}</p>
                  </div>
                </div>
              </div>

              {/* Status Milestone Timeline */}
              <CardContent className="p-6 space-y-6 text-start">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Consignment Milestone Checklist
                </h4>

                <div className="space-y-4">
                  {(activeShipment.timeline || []).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4 text-xs text-start">
                      <div className="mt-1 flex flex-col items-center">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            step.completed
                              ? "bg-[#C45B2A] text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                        </div>
                        {idx < (activeShipment.timeline?.length || 0) - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                        )}
                      </div>

                      <div className="flex-1 space-y-0.5 text-start">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${step.completed ? "text-gray-900" : "text-gray-400"}`}>
                            {step.status}
                          </span>
                          <span className="font-mono text-[11px] text-gray-400 ltr-preserve">{step.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-gray-500">{step.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right 1 Col: Active Master Ledger Consignments */}
        <div className="space-y-4 text-start">
          <Card className="shadow-2xs">
            <CardHeader className="p-5 pb-3 text-start">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-4 w-4 text-[#C45B2A]" />
                Active Master Ledger AWBs
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Live consignments currently in transit across carriers
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2">
              {liveActiveShipments.map((shp) => (
                <div
                  key={shp.id}
                  onClick={() => setSelectedShipment(shp)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-start ${
                    activeShipment?.id === shp.id
                      ? "border-[#C45B2A] bg-orange-50/50 shadow-2xs"
                      : "border-gray-200 bg-gray-50/60 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-gray-900">{shp.awb}</span>
                    <Badge variant="outline" size="sm">{shp.carrier}</Badge>
                  </div>

                  <div className="text-xs font-semibold text-gray-700 mt-1 truncate flex items-center gap-1">
                    <span>{shp.account || shp.company}</span>
                    <ArrowRight className={`w-3 h-3 text-[#C45B2A] shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                    <span>{shp.receiverName} ({shp.country})</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1.5 mt-1.5 border-t border-gray-200/80 font-mono">
                    <span className="text-emerald-700 font-bold">{shp.status}</span>
                    <span>{shp.weight} KG</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shareable Link Box */}
          <Card className="p-5 bg-gradient-to-br from-amber-50/60 to-white border-amber-200 space-y-3 shadow-2xs text-start">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#C45B2A]" />
              <h4 className="text-xs font-bold text-amber-950 uppercase">Customer Shareable URL</h4>
            </div>
            <div className="flex gap-2">
              <Input
                readOnly
                value={
                  activeShipment
                    ? `https://exspeeds.com/track?awb=${activeShipment.awb}`
                    : "https://exspeeds.com/track"
                }
                className="bg-white font-mono text-[11px] text-gray-600 ltr-preserve"
              />
              <Button
                size="sm"
                variant="brand"
                onClick={handleCopyPublicLink}
                disabled={!activeShipment}
                className="text-xs font-bold shrink-0 cursor-pointer"
              >
                Copy
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
