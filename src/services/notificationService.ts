import { http } from "./apiClient";
import { NotificationItem, AdminStorage } from "@/lib/adminData";

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const data = await http.get<NotificationItem[]>("/api/notifications");
    if (data && Array.isArray(data)) {
      AdminStorage.saveNotifications(data);
      return data;
    }
    return AdminStorage.getNotifications();
  },

  async createNotification(notif: NotificationItem): Promise<NotificationItem> {
    const data = await http.post<NotificationItem>("/api/notifications", notif);
    const saved = data || notif;
    const current = AdminStorage.getNotifications();
    AdminStorage.saveNotifications([saved, ...current]);
    return saved;
  },

  async markRead(id: string): Promise<void> {
    await http.put("/api/notifications", { id });
    const current = AdminStorage.getNotifications();
    AdminStorage.saveNotifications(current.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  },

  async markAllRead(): Promise<void> {
    await http.put("/api/notifications", { markAll: true });
    const current = AdminStorage.getNotifications();
    AdminStorage.saveNotifications(current.map((n) => ({ ...n, isRead: true })));
  },

  async deleteNotification(id: string): Promise<boolean> {
    await http.delete(`/api/notifications?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getNotifications();
    AdminStorage.saveNotifications(current.filter((n) => n.id !== id));
    return true;
  },
};

// Backwards compatibility alias
export const NotificationService = notificationService;
