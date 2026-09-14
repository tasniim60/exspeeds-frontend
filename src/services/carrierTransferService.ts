import { http } from "./apiClient";
import { CarrierTransfer, AdminStorage } from "@/lib/adminData";

export const carrierTransferService = {
  async getTransfers(): Promise<CarrierTransfer[]> {
    const data = await http.get<CarrierTransfer[]>("/api/carrier-transfers");
    if (data && Array.isArray(data)) {
      AdminStorage.saveCarrierTransfers(data);
      return data;
    }
    return AdminStorage.getCarrierTransfers();
  },

  async createTransfer(transfer: CarrierTransfer): Promise<CarrierTransfer> {
    const data = await http.post<CarrierTransfer>("/api/carrier-transfers", transfer);
    const saved = data || transfer;
    const current = AdminStorage.getCarrierTransfers();
    AdminStorage.saveCarrierTransfers([saved, ...current.filter((t) => t.id !== saved.id)]);
    return saved;
  },

  async deleteTransfer(id: string): Promise<boolean> {
    await http.delete(`/api/carrier-transfers?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getCarrierTransfers();
    AdminStorage.saveCarrierTransfers(current.filter((t) => t.id !== id));
    return true;
  },
};

export const CarrierTransferService = carrierTransferService;

