import { http } from "./apiClient";
import { ShipmentRequest, AdminStorage } from "@/lib/adminData";

export const shipmentRequestService = {
  async getRequests(): Promise<ShipmentRequest[]> {
    const data = await http.get<ShipmentRequest[]>("/api/shipment-requests");
    if (data && Array.isArray(data)) {
      AdminStorage.saveShipmentRequests(data);
      return data;
    }
    return AdminStorage.getShipmentRequests();
  },

  async createRequest(req: ShipmentRequest): Promise<ShipmentRequest> {
    const data = await http.post<ShipmentRequest>("/api/shipment-requests", req);
    const saved = data || req;
    AdminStorage.addShipmentRequest(saved);
    return saved;
  },

  async updateRequest(id: string, patch: Partial<ShipmentRequest>): Promise<ShipmentRequest | null> {
    const data = await http.put<ShipmentRequest>("/api/shipment-requests", { id, ...patch });
    AdminStorage.updateShipmentRequest(id, patch);
    return data;
  },

  async deleteRequest(id: string): Promise<boolean> {
    await http.delete(`/api/shipment-requests?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getShipmentRequests();
    AdminStorage.saveShipmentRequests(current.filter((r) => r.id !== id));
    return true;
  },
};

// Backwards compatibility alias
export const ShipmentRequestService = shipmentRequestService;
