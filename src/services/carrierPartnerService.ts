import { http } from "./apiClient";
import { CarrierPartner, AdminStorage } from "@/lib/adminData";

export const carrierPartnerService = {
  async getPartners(): Promise<CarrierPartner[]> {
    const data = await http.get<CarrierPartner[]>("/api/carrier-partners");
    if (data && Array.isArray(data)) {
      AdminStorage.saveCarrierPartners(data);
      return data;
    }
    return AdminStorage.getCarrierPartners();
  },

  async createPartner(partner: CarrierPartner): Promise<CarrierPartner> {
    const data = await http.post<CarrierPartner>("/api/carrier-partners", partner);
    const saved = data || partner;
    const current = AdminStorage.getCarrierPartners();
    AdminStorage.saveCarrierPartners([saved, ...current.filter((p) => p.id !== saved.id)]);
    return saved;
  },

  async deletePartner(id: string): Promise<boolean> {
    await http.delete(`/api/carrier-partners?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getCarrierPartners();
    AdminStorage.saveCarrierPartners(current.filter((p) => p.id !== id));
    AdminStorage.saveCarrierPartners(
      current.filter((p) => p.id !== id && p.name.toLowerCase().trim() !== id.toLowerCase().trim())
    );
    return true;
  },
};

export const CarrierPartnerService = carrierPartnerService;

