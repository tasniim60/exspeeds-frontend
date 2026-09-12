import { http } from "./apiClient";
import { Invoice, AdminStorage } from "@/lib/adminData";

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
};

// Backwards compatibility alias
export const InvoiceService = invoiceService;
