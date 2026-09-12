import { http } from "./apiClient";
import { Order, AdminStorage } from "@/lib/adminData";

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const data = await http.get<Order[]>("/api/orders");
    if (data && Array.isArray(data)) {
      AdminStorage.saveOrders(data);
      return data;
    }
    return AdminStorage.getOrders();
  },

  async createOrder(order: Order): Promise<Order> {
    const data = await http.post<Order>("/api/orders", order);
    const saved = data || order;
    const current = AdminStorage.getOrders();
    AdminStorage.saveOrders([saved, ...current]);
    return saved;
  },

  async updateOrder(order: Order): Promise<Order> {
    const data = await http.put<Order>("/api/orders", order);
    const saved = data || order;
    const current = AdminStorage.getOrders();
    AdminStorage.saveOrders(current.map((o) => (o.id === saved.id ? saved : o)));
    return saved;
  },

  async deleteOrder(id: string): Promise<boolean> {
    await http.delete(`/api/orders?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getOrders();
    AdminStorage.saveOrders(current.filter((o) => o.id !== id));
    return true;
  },
};

// Backwards compatibility alias
export const OrderService = orderService;
