import { http } from "./apiClient";
import { Invoice, AdminStorage, CarrierInvoiceItem } from "@/lib/adminData";

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    const data = await http.get<Invoice[]>("/api/invoices");
    if (data && Array.isArray(data)) {
      AdminStorage.saveInvoices(data);
      return data;
    }
    return AdminStorage.getInvoices();
  },

  async createInvoice(invoice: Invoice): Promise<Invoice> {
    const data = await http.post<Invoice>("/api/invoices", invoice);
    const saved = data || invoice;
    const current = AdminStorage.getInvoices();
    AdminStorage.saveInvoices([saved, ...current]);
    return saved;
  },

  async updateInvoice(invoice: Invoice): Promise<Invoice> {
    const data = await http.put<Invoice>("/api/invoices", invoice);
    const saved = data || invoice;
    const current = AdminStorage.getInvoices();
    AdminStorage.saveInvoices(current.map((i) => (i.id === saved.id ? saved : i)));
    return saved;
  },

  async deleteInvoice(id: string): Promise<boolean> {
    await http.delete(`/api/invoices?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getInvoices();
    AdminStorage.saveInvoices(current.filter((i) => i.id !== id));
    return true;
  },

  // Carrier Invoices (مراجعة وتدقيق فواتير شركات الشحن)
  async getCarrierInvoices(): Promise<CarrierInvoiceItem[]> {
    const data = await http.get<CarrierInvoiceItem[]>("/api/carrier-invoices");
    if (data && Array.isArray(data)) {
      AdminStorage.saveCarrierInvoices(data);
      return data;
    }
    return AdminStorage.getCarrierInvoices();
  },

  async createCarrierInvoice(item: CarrierInvoiceItem): Promise<CarrierInvoiceItem> {
    const data = await http.post<CarrierInvoiceItem>("/api/carrier-invoices", item);
    const saved = data || item;
    AdminStorage.addCarrierInvoice(saved);
    return saved;
  },

  async bulkCreateCarrierInvoices(items: CarrierInvoiceItem[]): Promise<CarrierInvoiceItem[]> {
    const data = await http.post<CarrierInvoiceItem[]>("/api/carrier-invoices", items);
    const saved = data || items;
    AdminStorage.addCarrierInvoices(saved);
    return saved;
  },

  async updateCarrierInvoice(id: string, patch: Partial<CarrierInvoiceItem>): Promise<void> {
    await http.put("/api/carrier-invoices", { id, ...patch });
    AdminStorage.updateCarrierInvoice(id, patch);
  },

  async deleteCarrierInvoice(id: string): Promise<boolean> {
    await http.delete(`/api/carrier-invoices?id=${encodeURIComponent(id)}`);
    AdminStorage.deleteCarrierInvoice(id);
    return true;
  },
};

// Backwards compatibility alias
export const InvoiceService = invoiceService;
