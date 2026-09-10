"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Building,
  Building2,
  Mail,
  Phone,
  CreditCard,
  FileText,
  DollarSign,
  Package,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Edit2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Customer, Shipment, Invoice } from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

interface CustomersViewProps {
  customers: Customer[];
  shipments: Shipment[];
  invoices: Invoice[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  shipments,
  invoices,
  onAddCustomer,
  onUpdateCustomer,
}) => {
  const { t, isRTL, formatCurrency } = useLanguage();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");

  // Modals & Profile Drawer
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCountry, setFormCountry] = useState("Egypt");
  const [formCity, setFormCity] = useState("Cairo");
  const [formTier, setFormTier] = useState<Customer["tier"]>("Enterprise VIP");
  const [formCreditLimit, setFormCreditLimit] = useState("30000");
  const [formTaxNumber, setFormTaxNumber] = useState("");
  const [formManager, setFormManager] = useState("Amr Abdelaziz");

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCust: Customer = {
      id: `CUST-${Math.floor(400 + Math.random() * 500)}`,
      code: `ACC-${Math.floor(8800 + Math.random() * 99)}`,
      name: formName,
      company: formCompany,
      email: formEmail,
      phone: formPhone,
      country: formCountry,
      city: formCity,
      tier: formTier,
      creditLimit: parseFloat(formCreditLimit) || 10000,
      currentBalance: 0,
      totalShipments: 0,
      lifetimeSpend: 0,
      taxRegistrationNumber: formTaxNumber || `EG-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
      assignedManager: formManager,
      activeContracts: 1,
      joinedDate: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    onAddCustomer(newCust);
    setAddModalOpen(false);
    setSelectedCustomer(newCust);
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);
    const matchesTier = tierFilter === "all" || c.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const getTierBadgeVariant = (tier: Customer["tier"]) => {
    switch (tier) {
      case "Enterprise VIP":
        return "brand";
      case "Corporate Partner":
        return "purple";
      default:
        return "secondary";
    }
  };

  // Find customer-related shipments and invoices
  const customerShipments = selectedCustomer
    ? shipments.filter((s) => s.company.toLowerCase().includes(selectedCustomer.company.toLowerCase()))
    : [];

  const customerInvoices = selectedCustomer
    ? invoices.filter((i) => i.companyName.toLowerCase().includes(selectedCustomer.company.toLowerCase()))
    : [];

  return (
    <div className="space-y-6 text-start">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              {t("admin.customers.title")} ({customers.length})
            </h2>
            <p className="text-xs text-gray-500">
              {t("admin.customers.subtitle")}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="brand"
          onClick={() => setAddModalOpen(true)}
          className="text-xs font-bold shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.customers.addCustomer")}</span>
        </Button>
      </div>

      {/* CRM Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-1 text-start">
          <span className="text-gray-400 font-semibold uppercase text-[10px]">{isRTL ? "حسابات الشركات النشطة" : "Active Corporate Clients"}</span>
          <p className="text-2xl font-black font-display text-gray-900">{customers.length}</p>
          <p className="text-[11px] text-emerald-600 font-medium">{isRTL ? "عقود خدمة معتمدة 100%" : "100% active SLA contracts"}</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-1 text-start">
          <span className="text-gray-400 font-semibold uppercase text-[10px]">{isRTL ? "إجمالي الإنفاق التراكمي" : "Combined Lifetime Spend"}</span>
          <p className="text-2xl font-black font-display text-gray-900">
            ${customers.reduce((acc, c) => acc + c.lifetimeSpend, 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">+14.2% YoY</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-1 text-start">
          <span className="text-gray-400 font-semibold uppercase text-[10px]">{isRTL ? "الأرصدة المستحقة" : "Outstanding Balances"}</span>
          <p className="text-2xl font-black font-display text-[#C45B2A]">
            ${customers.reduce((acc, c) => acc + c.currentBalance, 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-500 font-medium">Net 30</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-1 text-start">
          <span className="text-gray-400 font-semibold uppercase text-[10px]">{isRTL ? "إجمالي البوالص المنفذة" : "Total Shipped Consignments"}</span>
          <p className="text-2xl font-black font-display text-gray-900">
            {customers.reduce((acc, c) => acc + c.totalShipments, 0)} AWB
          </p>
          <p className="text-[11px] text-sky-600 font-medium">{isRTL ? "عبر شبكة الشحن الإقليمية" : "Across regional network"}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-2.5 h-4 w-4 text-gray-400`} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.customers.searchPlaceholder")}
            className={`text-xs ${isRTL ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
            {t("admin.customers.table.tier")}:
          </span>
          {["all", "Enterprise VIP", "Corporate Partner", "Standard Shipper"].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                tierFilter === tier
                  ? "bg-[#251516] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tier === "all" ? t("common.all") : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Directory Table */}
      <Card className="shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">{t("admin.customers.table.code")}</TableHead>
              <TableHead className="text-start">{t("admin.customers.table.contactPerson")}</TableHead>
              <TableHead className="text-start">{t("admin.customers.table.cityCountry")}</TableHead>
              <TableHead className="text-start">{t("admin.customers.table.tier")}</TableHead>
              <TableHead className="text-start">{t("admin.customers.table.balance")}</TableHead>
              <TableHead className="text-start">{isRTL ? "إجمالي الإنفاق" : "Lifetime Spend"}</TableHead>
              <TableHead className="text-start">{isRTL ? "مدير الحساب" : "Account Manager"}</TableHead>
              <TableHead className="text-end">{t("admin.customers.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((cust) => (
              <TableRow
                key={cust.id}
                onClick={() => setSelectedCustomer(cust)}
                className="cursor-pointer hover:bg-gray-50/90"
              >
                <TableCell>
                  <div className="space-y-0.5 text-start">
                    <p className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-gray-400" />
                      {cust.company}
                    </p>
                    <span className="font-mono text-[10px] text-gray-400 ltr-preserve">{cust.code}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-0.5 text-start">
                    <p className="text-xs font-bold text-gray-800">{cust.name}</p>
                    <p className="text-[11px] text-gray-500">{cust.email}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <p className="text-xs text-gray-700 text-start">{cust.city}, {cust.country}</p>
                </TableCell>

                <TableCell>
                  <Badge variant={getTierBadgeVariant(cust.tier)} size="sm">
                    {cust.tier}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="space-y-0.5 font-mono text-xs text-start">
                    <span className="text-gray-900 font-semibold">${cust.creditLimit.toLocaleString()}</span>
                    <p className="text-[10px] text-[#C45B2A] font-bold">
                      ${cust.currentBalance.toLocaleString()}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-0.5 font-mono text-xs text-start">
                    <span className="font-bold text-emerald-700">${cust.lifetimeSpend.toLocaleString()}</span>
                    <p className="text-[10px] text-gray-400">{cust.totalShipments} AWB</p>
                  </div>
                </TableCell>

                <TableCell>
                  <p className="text-xs font-medium text-gray-700 text-start">{cust.assignedManager}</p>
                </TableCell>

                <TableCell className="text-end">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCustomer(cust);
                    }}
                    className="text-xs cursor-pointer"
                  >
                    {isRTL ? "عرض الملف" : "View Profile"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm space-y-2">
            <Building2 className="h-8 w-8 mx-auto text-gray-300" />
            <p className="font-bold text-gray-700">{isRTL ? "لم يتم العثور على حسابات عملاء" : "No customer accounts found"}</p>
          </div>
        )}
      </Card>

      {/* ── Customer 360° Profile Drawer (`Sheet`) ── */}
      {selectedCustomer && (
        <Sheet
          open={!!selectedCustomer}
          onOpenChange={(open) => !open && setSelectedCustomer(null)}
          className="max-w-xl text-start"
        >
          <SheetHeader onClose={() => setSelectedCustomer(null)}>
            <div className="flex items-center gap-2">
              <SheetTitle>{selectedCustomer.company}</SheetTitle>
              <Badge variant={getTierBadgeVariant(selectedCustomer.tier)}>
                {selectedCustomer.tier}
              </Badge>
            </div>
            <SheetDescription>
              {selectedCustomer.code} • {selectedCustomer.name}
            </SheetDescription>
          </SheetHeader>

          <SheetContent className="space-y-6">
            {/* Quick KPI Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">{isRTL ? "الإنفاق الكلي" : "Spend"}</span>
                <p className="font-bold text-sm text-gray-900">${selectedCustomer.lifetimeSpend.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">{isRTL ? "الشحنات" : "Shipments"}</span>
                <p className="font-bold text-sm text-gray-900">{selectedCustomer.totalShipments}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">{isRTL ? "الرصيد المستحق" : "Balance"}</span>
                <p className="font-bold text-sm text-[#C45B2A]">${selectedCustomer.currentBalance.toLocaleString()}</p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-2 text-start">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{t("admin.customers.modal.contactName")}</h4>
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 ltr-preserve">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>{selectedCustomer.city}, {selectedCustomer.country}</span>
                </div>
              </div>
            </div>
          </SheetContent>

          <SheetFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCustomer(null)}
              className="text-xs cursor-pointer"
            >
              {t("common.close")}
            </Button>
          </SheetFooter>
        </Sheet>
      )}

      {/* ── Add Customer Modal ── */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-xl text-start" onClose={() => setAddModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              <Users className="h-5 w-5 text-[#C45B2A]" />
              {t("admin.customers.modal.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.customers.modal.createSubtitle")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCustomer} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.modal.companyName")}
                </label>
                <Input
                  required
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder={isRTL ? "مثال: شركة النيل للتكنولوجيا" : "Apex Global Technologies"}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.modal.contactName")}
                </label>
                <Input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={isRTL ? "طارق منصور" : "Tarek Mansour"}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.modal.email")}
                </label>
                <Input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.modal.phone")}
                </label>
                <Input
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+20 122 000 0000"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.table.cityCountry")}
                </label>
                <div className="flex gap-2">
                  <Input
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder={isRTL ? "القاهرة" : "Cairo"}
                    className="text-xs"
                  />
                  <Input
                    required
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    placeholder={isRTL ? "مصر" : "Egypt"}
                    className="text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.modal.tier")}
                </label>
                <select
                  value={formTier}
                  onChange={(e) => setFormTier(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  <option value="Enterprise VIP">Enterprise VIP (High Volume)</option>
                  <option value="Corporate Partner">Corporate Partner</option>
                  <option value="Standard Shipper">Standard Shipper</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.modal.creditLimit")}
                </label>
                <Input
                  type="number"
                  required
                  value={formCreditLimit}
                  onChange={(e) => setFormCreditLimit(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "السجل الضريبي / التجاري" : "Tax Registration CR #"}
                </label>
                <Input
                  value={formTaxNumber}
                  onChange={(e) => setFormTaxNumber(e.target.value)}
                  placeholder="EG-904-219-550"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
                className="w-full sm:w-auto h-10 text-xs cursor-pointer justify-center"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="brand"
                className="w-full sm:w-auto h-10 text-xs font-bold cursor-pointer justify-center"
              >
                {t("admin.customers.modal.saveBtn")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
