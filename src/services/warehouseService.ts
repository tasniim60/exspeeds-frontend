import { http } from "./apiClient";
import { WarehouseItem, AdminStorage } from "@/lib/adminData";

export const warehouseService = {
  async getItems(): Promise<WarehouseItem[]> {
    const data = await http.get<WarehouseItem[]>("/api/warehouse");
    if (data && Array.isArray(data)) {
      AdminStorage.saveWarehouseItems(data);
      return data;
    }
    return AdminStorage.getWarehouseItems();
  },

  async createItem(item: WarehouseItem): Promise<WarehouseItem> {
    const data = await http.post<WarehouseItem>("/api/warehouse", item);
    const saved = data || item;
    const current = AdminStorage.getWarehouseItems();
    AdminStorage.saveWarehouseItems([saved, ...current]);
    return saved;
  },

  async updateItem(item: WarehouseItem): Promise<WarehouseItem> {
    const data = await http.put<WarehouseItem>("/api/warehouse", item);
    const saved = data || item;
    const current = AdminStorage.getWarehouseItems();
    AdminStorage.saveWarehouseItems(current.map((w) => (w.id === saved.id ? saved : w)));
    return saved;
  },

  async deleteItem(id: string): Promise<boolean> {
    await http.delete(`/api/warehouse?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getWarehouseItems();
    AdminStorage.saveWarehouseItems(current.filter((w) => w.id !== id));
    return true;
  },
};

// Backwards compatibility alias
export const WarehouseService = warehouseService;
