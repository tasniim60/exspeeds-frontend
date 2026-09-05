"use client";

import React, { useState } from "react";
import {
  Warehouse,
  Plus,
  Search,
  Building2,
  Box,
  Thermometer,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Barcode,
  Calendar,
  CheckCircle2,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { WarehouseFacility, WarehouseItem, initialWarehouses } from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

interface WarehouseViewProps {
  warehouseItems: WarehouseItem[];
  onAddWarehouseItem: (item: WarehouseItem) => void;
  selectedHub: string;
}

export const WarehouseView: React.FC<WarehouseViewProps> = ({
  warehouseItems,
  onAddWarehouseItem,
  selectedHub,
}) => {
  const { t, isRTL } = useLanguage();
  const [activeFacilityId, setActiveFacilityId] = useState<string>(
    selectedHub && selectedHub !== "all" ? selectedHub : "cairo"
  );
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [inboundModalOpen, setInboundModalOpen] = useState(false);

  // Form State
  const [sku, setSku] = useState(`SKU-LOG-${Math.floor(1000 + Math.random() * 9000)}`);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState<WarehouseItem["category"]>("Electronics");
  const [qty, setQty] = useState("20");
  const [unitWeight, setUnitWeight] = useState("5.0");
  const [zone, setZone] = useState("Zone A (High-Rack Fast Movers)");
  const [bayLocation, setBayLocation] = useState("Aisle 03 - Bay C-08");
  const [tempZone, setTempZone] = useState<WarehouseItem["temperatureZone"]>("Ambient");

  const currentFacility =
    initialWarehouses.find((w) => w.id === activeFacilityId) || initialWarehouses[0];

  const handleInboundItem = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseInt(qty) || 1;
    const uw = parseFloat(unitWeight) || 1;

    const newItem: WarehouseItem = {
      id: `wh-item-${Date.now()}`,
      sku: sku,
      name: itemName || "Inbound Pallet Consignment",
      category: category,
      quantity: q,
      unitWeight: uw,
      totalWeight: q * uw,
      warehouseId: activeFacilityId as any,
      zone: zone,
      bayLocation: bayLocation,
      inboundDate: new Date().toISOString().split("T")[0],
      dwellDays: 0,
      status: "Stored",
      temperatureZone: tempZone,
    };

    onAddWarehouseItem(newItem);
    setInboundModalOpen(false);
    setSku(`SKU-LOG-${Math.floor(1000 + Math.random() * 9000)}`);
    setItemName("");
  };

  const filteredItems = warehouseItems.filter((item) => {
    const matchesFacility = item.warehouseId === activeFacilityId;
    const q = search.toLowerCase();
    const matchesSearch =
      item.sku.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.bayLocation.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    const matchesCat = categoryFilter === "all" || item.category === categoryFilter;

    return matchesFacility && matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 text-start">
      {/* Facility Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {initialWarehouses.map((fac) => {
          const isActive = activeFacilityId === fac.id;
          return (
            <button
              key={fac.id}
              onClick={() => setActiveFacilityId(fac.id)}
              className={`p-4 rounded-xl border text-start transition-all cursor-pointer space-y-2 ${
                isActive
                  ? "bg-[#251516] text-white border-[#C45B2A] shadow-md ring-2 ring-[#C45B2A]/20"
                  : "bg-white text-gray-900 border-gray-200 hover:border-gray-300 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isActive ? "text-[#C45B2A]" : "text-gray-500"}`}>
                  {fac.city.toUpperCase()}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isActive ? "bg-[#C45B2A] text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {fac.capacityUtilizationPct}% {isRTL ? "إشغال" : "Cap"}
                </span>
              </div>
              <p className={`text-sm font-bold truncate ${isActive ? "text-white" : "text-gray-900"}`}>
                {fac.name}
              </p>
              <div className={`flex items-center justify-between text-[11px] ${isActive ? "text-gray-300" : "text-gray-500"}`}>
                <span>{fac.activePallets.toLocaleString()} {isRTL ? "طبلية" : "Pallets"}</span>
                <span>{fac.dockDoors} {isRTL ? "أبواب تفريغ" : "Dock Doors"}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Facility Live Metrics Bar */}
      <div className="p-5 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-4 text-start">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">{currentFacility.name}</h3>
              <Badge variant="brand" size="sm">
                {isRTL ? "عمليات نشطة" : "Active Operations"}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              {currentFacility.totalCapacitySqM.toLocaleString()} m² • {currentFacility.country}
            </p>
          </div>

          <Button
            size="sm"
            variant="brand"
            onClick={() => setInboundModalOpen(true)}
            className="text-xs font-bold shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <ArrowDownToLine className="h-4 w-4" />
            <span>{t("admin.warehouse.inboundReceiving")}</span>
          </Button>
        </div>

        {/* 4 Sensor & Capacity Metric Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Capacity */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1 text-start">
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase">
              <span>{isRTL ? "نسبة الإشغال" : "Bay Utilization"}</span>
              <span>{currentFacility.capacityUtilizationPct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                style={{ width: `${currentFacility.capacityUtilizationPct}%` }}
                className={`h-full rounded-full ${
                  currentFacility.capacityUtilizationPct > 80 ? "bg-amber-500" : "bg-[#C45B2A]"
                }`}
              />
            </div>
            <p className="text-[11px] font-mono font-bold text-gray-800">
              {currentFacility.occupiedBays} / {currentFacility.totalBays} {isRTL ? "مساحة" : "Bays"}
            </p>
          </div>

          {/* Temperature */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1 text-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
              <Thermometer className="h-3 w-3 text-sky-600" />
              {isRTL ? "درجة الحرارة" : "Ambient Temp"}
            </span>
            <p className="text-lg font-black font-mono text-gray-900 ltr-preserve">
              {currentFacility.temperatureCelsius}°C
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold">{isRTL ? "الغرف المبردة: 4.2°C" : "Cold Vault: 4.2°C Active"}</p>
          </div>

          {/* Staff */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1 text-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase">{isRTL ? "فريق العمليات" : "Active Staff"}</span>
            <p className="text-lg font-black font-mono text-gray-900">
              {currentFacility.activeStaff} {isRTL ? "مشغلين" : "Operators"}
            </p>
            <p className="text-[10px] text-gray-500">{isRTL ? "ماسحات RF ورافعات شوكية" : "Forklifts & RF active"}</p>
          </div>

          {/* Staging Bays */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1 text-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase">{isRTL ? "بوابات التوزيع" : "Dock Doors"}</span>
            <p className="text-lg font-black font-mono text-gray-900">
              {currentFacility.dockDoors} {isRTL ? "بوابة" : "Doors"}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold">{isRTL ? "انسيابية حركة بدون تأخير" : "Zero congestion"}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-2.5 h-4 w-4 text-gray-400`} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.warehouse.searchPlaceholder")}
            className={`text-xs ${isRTL ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
            {isRTL ? "التصنيف:" : "Category:"}
          </span>
          {["all", "Electronics", "Pharmaceuticals", "Apparel", "Automotive Parts"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                categoryFilter === cat
                  ? "bg-[#251516] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat === "all" ? t("common.all") : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Warehouse Items Table */}
      <Card className="shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">{t("admin.warehouse.table.skuItem")}</TableHead>
              <TableHead className="text-start">{t("admin.warehouse.table.category")}</TableHead>
              <TableHead className="text-start">{t("admin.warehouse.table.quantity")}</TableHead>
              <TableHead className="text-start">{t("admin.warehouse.table.bayAisle")}</TableHead>
              <TableHead className="text-start">{isRTL ? "مدة التخزين" : "Dwell Time"}</TableHead>
              <TableHead className="text-start">{isRTL ? "بيئة التخزين" : "Climate Zone"}</TableHead>
              <TableHead className="text-end">{t("admin.warehouse.table.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50/90">
                <TableCell>
                  <div className="space-y-0.5 text-start">
                    <span className="font-mono font-bold text-xs text-[#251516] flex items-center gap-1.5 ltr-preserve">
                      <Barcode className="h-3.5 w-3.5 text-gray-400" />
                      {item.sku}
                    </span>
                    <p className="text-xs font-bold text-gray-900">{item.name}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="outline" size="sm">
                    {item.category}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="space-y-0.5 font-mono text-xs text-start">
                    <span className="font-bold text-gray-900">{item.quantity} {isRTL ? "وحدة" : "units"}</span>
                    <p className="text-[10px] text-gray-400">({item.totalWeight} {t("common.kg")})</p>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-0.5 text-start">
                    <span className="font-mono text-xs font-bold text-gray-900">{item.bayLocation}</span>
                    <p className="text-[10px] text-gray-500">{item.zone}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-mono text-xs text-gray-700 text-start">{item.dwellDays} {isRTL ? "يوم" : "Days"}</span>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-gray-600 text-start">{item.temperatureZone}</span>
                </TableCell>

                <TableCell className="text-end">
                  <Badge variant={item.status === "Stored" ? "success" : item.status === "In Staging" ? "brand" : "warning"} size="sm">
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm space-y-1">
            <Warehouse className="h-8 w-8 mx-auto text-gray-300" />
            <p className="font-bold text-gray-700">{isRTL ? "لا توجد بضائع مخزنة مطابقة" : "No inventory in this hub matching criteria"}</p>
          </div>
        )}
      </Card>

      {/* ── Inbound Receiving Modal ── */}
      <Dialog open={inboundModalOpen} onOpenChange={setInboundModalOpen}>
        <DialogContent className="max-w-xl text-start" onClose={() => setInboundModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              <Warehouse className="h-5 w-5 text-[#C45B2A]" />
              {t("admin.warehouse.modal.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.warehouse.modal.createSubtitle")} ({currentFacility.name})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInboundItem} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.warehouse.modal.sku")}
                </label>
                <Input
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="font-mono text-xs uppercase font-bold ltr-preserve"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.warehouse.table.category")}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Pharmaceuticals">Pharmaceuticals</option>
                  <option value="Automotive Parts">Automotive Parts</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Documents">Documents</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                {t("admin.warehouse.modal.name")}
              </label>
              <Input
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder={isRTL ? "أجهزة ومعدات خوادم" : "High-Density Server Switches"}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.warehouse.modal.quantity")}
                </label>
                <Input
                  type="number"
                  required
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.warehouse.modal.weight")} ({t("common.kg")})
                </label>
                <Input
                  type="number"
                  step="0.1"
                  required
                  value={unitWeight}
                  onChange={(e) => setUnitWeight(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.warehouse.modal.location")}
                </label>
                <Input
                  required
                  value={bayLocation}
                  onChange={(e) => setBayLocation(e.target.value)}
                  placeholder="Aisle 02 - Bay B-14 / Shelf 3"
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "نطاق المناخ والتخزين" : "Storage Zone & Climate"}
                </label>
                <select
                  value={tempZone}
                  onChange={(e) => setTempZone(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700"
                >
                  <option value="Ambient">{isRTL ? "مستودع جاف قياسي (Ambient)" : "Ambient Warehouse (Standard)"}</option>
                  <option value="Cold Chain (2-8°C)">{isRTL ? "سلسلة تبريد (2-8°C)" : "Cold Chain Chamber (2-8°C)"}</option>
                  <option value="Frozen (-20°C)">{isRTL ? "تجميد فائق (-20°C)" : "Frozen Vault (-20°C)"}</option>
                  <option value="Secure Vault">{isRTL ? "خزينة فائقة الأمان" : "High-Security Vault"}</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInboundModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="brand"
                className="text-xs font-bold cursor-pointer"
              >
                {t("admin.warehouse.modal.saveBtn")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
