import fs from "fs";
import path from "path";
import {
  Shipment,
  Order,
  Customer,
  Invoice,
  WarehouseItem,
  NotificationItem,
  ShipmentRequest,
  BlogPost,
  initialBlogPosts,
} from "./adminData";

const DATA_DIR = path.join(process.cwd(), ".data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFilePath(key: string): string {
  ensureDataDir();
  return path.join(DATA_DIR, `${key}.json`);
}

function readStore<T>(key: string, fallback: T): T {
  try {
    const filePath = getFilePath(key);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // Return fallback on read error
  }
  return fallback;
}

function writeStore<T>(key: string, data: T): void {
  try {
    const filePath = getFilePath(key);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Failed to write to store [${key}]:`, err);
  }
}

export const ServerStore = {
  // Shipments
  getShipments(): Shipment[] {
    return readStore<Shipment[]>("shipments", []);
  },
  saveShipments(data: Shipment[]): void {
    writeStore("shipments", data);
  },
  addShipment(item: Shipment): Shipment {
    const current = this.getShipments();
    const updated = [item, ...current];
    this.saveShipments(updated);
    return item;
  },
  updateShipment(id: string, patch: Partial<Shipment>): Shipment | null {
    const current = this.getShipments();
    let updatedItem: Shipment | null = null;
    const updated = current.map((s) => {
      if (s.id === id) {
        updatedItem = { ...s, ...patch };
        return updatedItem;
      }
      return s;
    });
    this.saveShipments(updated);
    return updatedItem;
  },
  deleteShipment(id: string): boolean {
    const current = this.getShipments();
    const filtered = current.filter((s) => s.id !== id);
    this.saveShipments(filtered);
    return true;
  },

  // Shipment Requests
  getShipmentRequests(): ShipmentRequest[] {
    return readStore<ShipmentRequest[]>("shipment_requests", []);
  },
  saveShipmentRequests(data: ShipmentRequest[]): void {
    writeStore("shipment_requests", data);
  },
  addShipmentRequest(item: ShipmentRequest): ShipmentRequest {
    const current = this.getShipmentRequests();
    const updated = [item, ...current];
    this.saveShipmentRequests(updated);
    return item;
  },
  updateShipmentRequest(id: string, patch: Partial<ShipmentRequest>): ShipmentRequest | null {
    const current = this.getShipmentRequests();
    let updatedItem: ShipmentRequest | null = null;
    const updated = current.map((r) => {
      if (r.id === id) {
        updatedItem = { ...r, ...patch, updatedAt: new Date().toISOString() };
        return updatedItem;
      }
      return r;
    });
    this.saveShipmentRequests(updated);
    return updatedItem;
  },
  deleteShipmentRequest(id: string): boolean {
    const current = this.getShipmentRequests();
    const filtered = current.filter((r) => r.id !== id);
    this.saveShipmentRequests(filtered);
    return true;
  },

  // Orders
  getOrders(): Order[] {
    return readStore<Order[]>("orders", []);
  },
  saveOrders(data: Order[]): void {
    writeStore("orders", data);
  },
  addOrder(item: Order): Order {
    const current = this.getOrders();
    const updated = [item, ...current];
    this.saveOrders(updated);
    return item;
  },
  updateOrder(id: string, patch: Partial<Order>): Order | null {
    const current = this.getOrders();
    let updatedItem: Order | null = null;
    const updated = current.map((o) => {
      if (o.id === id) {
        updatedItem = { ...o, ...patch };
        return updatedItem;
      }
      return o;
    });
    this.saveOrders(updated);
    return updatedItem;
  },
  deleteOrder(id: string): boolean {
    const current = this.getOrders();
    const filtered = current.filter((o) => o.id !== id);
    this.saveOrders(filtered);
    return true;
  },

  // Customers
  getCustomers(): Customer[] {
    return readStore<Customer[]>("customers", []);
  },
  saveCustomers(data: Customer[]): void {
    writeStore("customers", data);
  },
  addCustomer(item: Customer): Customer {
    const current = this.getCustomers();
    const updated = [item, ...current];
    this.saveCustomers(updated);
    return item;
  },
  updateCustomer(id: string, patch: Partial<Customer>): Customer | null {
    const current = this.getCustomers();
    let updatedItem: Customer | null = null;
    const updated = current.map((c) => {
      if (c.id === id) {
        updatedItem = { ...c, ...patch };
        return updatedItem;
      }
      return c;
    });
    this.saveCustomers(updated);
    return updatedItem;
  },
  deleteCustomer(id: string): boolean {
    const current = this.getCustomers();
    const filtered = current.filter((c) => c.id !== id);
    this.saveCustomers(filtered);
    return true;
  },

  // Invoices
  getInvoices(): Invoice[] {
    return readStore<Invoice[]>("invoices", []);
  },
  saveInvoices(data: Invoice[]): void {
    writeStore("invoices", data);
  },
  addInvoice(item: Invoice): Invoice {
    const current = this.getInvoices();
    const updated = [item, ...current];
    this.saveInvoices(updated);
    return item;
  },
  updateInvoice(id: string, patch: Partial<Invoice>): Invoice | null {
    const current = this.getInvoices();
    let updatedItem: Invoice | null = null;
    const updated = current.map((inv) => {
      if (inv.id === id) {
        updatedItem = { ...inv, ...patch };
        return updatedItem;
      }
      return inv;
    });
    this.saveInvoices(updated);
    return updatedItem;
  },
  deleteInvoice(id: string): boolean {
    const current = this.getInvoices();
    const filtered = current.filter((inv) => inv.id !== id);
    this.saveInvoices(filtered);
    return true;
  },

  // Warehouse Items
  getWarehouseItems(): WarehouseItem[] {
    return readStore<WarehouseItem[]>("warehouse", []);
  },
  saveWarehouseItems(data: WarehouseItem[]): void {
    writeStore("warehouse", data);
  },
  addWarehouseItem(item: WarehouseItem): WarehouseItem {
    const current = this.getWarehouseItems();
    const updated = [item, ...current];
    this.saveWarehouseItems(updated);
    return item;
  },
  updateWarehouseItem(id: string, patch: Partial<WarehouseItem>): WarehouseItem | null {
    const current = this.getWarehouseItems();
    let updatedItem: WarehouseItem | null = null;
    const updated = current.map((w) => {
      if (w.id === id) {
        updatedItem = { ...w, ...patch };
        return updatedItem;
      }
      return w;
    });
    this.saveWarehouseItems(updated);
    return updatedItem;
  },
  deleteWarehouseItem(id: string): boolean {
    const current = this.getWarehouseItems();
    const filtered = current.filter((w) => w.id !== id);
    this.saveWarehouseItems(filtered);
    return true;
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    return readStore<NotificationItem[]>("notifications", []);
  },
  saveNotifications(data: NotificationItem[]): void {
    writeStore("notifications", data);
  },
  addNotification(item: NotificationItem): NotificationItem {
    const current = this.getNotifications();
    const updated = [item, ...current];
    this.saveNotifications(updated);
    return item;
  },
  markNotificationRead(id: string): void {
    const current = this.getNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    this.saveNotifications(updated);
  },
  markAllNotificationsRead(): void {
    const current = this.getNotifications();
    const updated = current.map((n) => ({ ...n, isRead: true }));
    this.saveNotifications(updated);
  },
  deleteNotification(id: string): void {
    const current = this.getNotifications();
    const filtered = current.filter((n) => n.id !== id);
    this.saveNotifications(filtered);
  },

  // Blog Posts
  getBlogPosts(): BlogPost[] {
    return readStore<BlogPost[]>("posts", initialBlogPosts);
  },
  saveBlogPosts(data: BlogPost[]): void {
    writeStore("posts", data);
  },
};
