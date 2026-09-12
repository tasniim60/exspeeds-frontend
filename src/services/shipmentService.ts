import { http } from "./apiClient";
import { Shipment, AdminStorage } from "@/lib/adminData";

export const shipmentService = {
  async getShipments(): Promise<Shipment[]> {
    const data = await http.get<Shipment[]>("/api/shipments");
    if (data && Array.isArray(data)) {
      AdminStorage.saveShipments(data);
      return data;
    }
    return AdminStorage.getShipments();
  },

  async createShipment(shipment: Shipment): Promise<Shipment> {
    const data = await http.post<Shipment>("/api/shipments", shipment);
    const saved = data || shipment;
    const current = AdminStorage.getShipments();
    AdminStorage.saveShipments([saved, ...current.filter((s) => s.id !== saved.id)]);
    return saved;
  },

  async updateShipment(shipment: Shipment): Promise<Shipment> {
    const data = await http.put<Shipment>("/api/shipments", shipment);
    const saved = data || shipment;
    const current = AdminStorage.getShipments();
    AdminStorage.saveShipments(current.map((s) => (s.id === saved.id ? saved : s)));
    return saved;
  },

  async deleteShipment(id: string): Promise<boolean> {
    await http.delete(`/api/shipments?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getShipments();
    AdminStorage.saveShipments(current.filter((s) => s.id !== id));
    return true;
  },
};

// Backwards compatibility alias
export const ShipmentService = shipmentService;
