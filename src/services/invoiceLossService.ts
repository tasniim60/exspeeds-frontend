import { http } from "./apiClient";
import { InvoiceLoss, AdminStorage } from "@/lib/adminData";

export const invoiceLossService = {
  async getLosses(): Promise<InvoiceLoss[]> {
    const data = await http.get<InvoiceLoss[]>("/api/invoice-losses");
    if (data && Array.isArray(data)) {
      AdminStorage.saveInvoiceLosses(data);
      return data;
    }
    return AdminStorage.getInvoiceLosses();
  },

  async createLoss(loss: InvoiceLoss): Promise<InvoiceLoss> {
    const data = await http.post<InvoiceLoss>("/api/invoice-losses", loss);
    const saved = data || loss;
    const current = AdminStorage.getInvoiceLosses();
    AdminStorage.saveInvoiceLosses([saved, ...current.filter((l) => l.id !== saved.id)]);
    return saved;
  },

  async deleteLoss(id: string): Promise<boolean> {
    await http.delete(`/api/invoice-losses?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getInvoiceLosses();
    AdminStorage.saveInvoiceLosses(current.filter((l) => l.id !== id));
    return true;
  },
};

export const InvoiceLossService = invoiceLossService;

