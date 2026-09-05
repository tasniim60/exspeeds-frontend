import {
  Shipment,
  Order,
  Customer,
  Invoice,
  WarehouseItem,
  NotificationItem,
  ShipmentRequest,
  BlogPost,
  AdminStorage,
} from "./adminData";

/**
 * Generic API Fetcher for Next.js internal /api routes
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    });
    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    }
  } catch (err) {
    console.error(`API Fetch Error [${endpoint}]:`, err);
  }
  return null;
}

// ─── 1. SHIPMENTS SERVICE ─────────────────────────────────────────────
export const ShipmentService = {
  async getShipments(): Promise<Shipment[]> {
    const data = await apiFetch<Shipment[]>("/api/shipments");
    if (data && Array.isArray(data)) {
      AdminStorage.saveShipments(data);
      return data;
    }
    return AdminStorage.getShipments();
  },

  async createShipment(shipment: Shipment): Promise<Shipment> {
    const data = await apiFetch<Shipment>("/api/shipments", {
      method: "POST",
      body: JSON.stringify(shipment),
    });
    const saved = data || shipment;
    const current = AdminStorage.getShipments();
    AdminStorage.saveShipments([saved, ...current.filter((s) => s.id !== saved.id)]);
    return saved;
  },

  async updateShipment(shipment: Shipment): Promise<Shipment> {
    const data = await apiFetch<Shipment>("/api/shipments", {
      method: "PUT",
      body: JSON.stringify(shipment),
    });
    const saved = data || shipment;
    const current = AdminStorage.getShipments();
    AdminStorage.saveShipments(current.map((s) => (s.id === saved.id ? saved : s)));
    return saved;
  },

  async deleteShipment(id: string): Promise<boolean> {
    await apiFetch(`/api/shipments?id=${id}`, { method: "DELETE" });
    const current = AdminStorage.getShipments();
    AdminStorage.saveShipments(current.filter((s) => s.id !== id));
    return true;
  },
};

// ─── 2. SHIPMENT REQUESTS SERVICE ─────────────────────────────────────
export const ShipmentRequestService = {
  async getRequests(): Promise<ShipmentRequest[]> {
    const data = await apiFetch<ShipmentRequest[]>("/api/shipment-requests");
    if (data && Array.isArray(data)) {
      AdminStorage.saveShipmentRequests(data);
      return data;
    }
    return AdminStorage.getShipmentRequests();
  },

  async createRequest(req: ShipmentRequest): Promise<ShipmentRequest> {
    const data = await apiFetch<ShipmentRequest>("/api/shipment-requests", {
      method: "POST",
      body: JSON.stringify(req),
    });
    const saved = data || req;
    AdminStorage.addShipmentRequest(saved);
    return saved;
  },

  async updateRequest(id: string, patch: Partial<ShipmentRequest>): Promise<ShipmentRequest | null> {
    const data = await apiFetch<ShipmentRequest>("/api/shipment-requests", {
      method: "PUT",
      body: JSON.stringify({ id, ...patch }),
    });
    AdminStorage.updateShipmentRequest(id, patch);
    return data;
  },

  async deleteRequest(id: string): Promise<boolean> {
    await apiFetch(`/api/shipment-requests?id=${id}`, { method: "DELETE" });
    const current = AdminStorage.getShipmentRequests();
    AdminStorage.saveShipmentRequests(current.filter((r) => r.id !== id));
    return true;
  },
};

// ─── 3. ORDERS SERVICE ────────────────────────────────────────────────
export const OrderService = {
  async getOrders(): Promise<Order[]> {
    const data = await apiFetch<Order[]>("/api/orders");
    if (data && Array.isArray(data)) {
      AdminStorage.saveOrders(data);
      return data;
    }
    return AdminStorage.getOrders();
  },

  async createOrder(order: Order): Promise<Order> {
    const data = await apiFetch<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
    const saved = data || order;
    const current = AdminStorage.getOrders();
    AdminStorage.saveOrders([saved, ...current]);
    return saved;
  },

  async updateOrder(order: Order): Promise<Order> {
    const data = await apiFetch<Order>("/api/orders", {
      method: "PUT",
      body: JSON.stringify(order),
    });
    const saved = data || order;
    const current = AdminStorage.getOrders();
    AdminStorage.saveOrders(current.map((o) => (o.id === saved.id ? saved : o)));
    return saved;
  },

  async deleteOrder(id: string): Promise<boolean> {
    await apiFetch(`/api/orders?id=${id}`, { method: "DELETE" });
    const current = AdminStorage.getOrders();
    AdminStorage.saveOrders(current.filter((o) => o.id !== id));
    return true;
  },
};

// ─── 4. CUSTOMERS CRM SERVICE ─────────────────────────────────────────
export const CustomerService = {
  async getCustomers(): Promise<Customer[]> {
    const data = await apiFetch<Customer[]>("/api/customers");
    if (data && Array.isArray(data)) {
      AdminStorage.saveCustomers(data);
      return data;
    }
    return AdminStorage.getCustomers();
  },

  async createCustomer(customer: Customer): Promise<Customer> {
    const data = await apiFetch<Customer>("/api/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    });
    const saved = data || customer;
    const current = AdminStorage.getCustomers();
    AdminStorage.saveCustomers([saved, ...current]);
    return saved;
  },

  async updateCustomer(customer: Customer): Promise<Customer> {
    const data = await apiFetch<Customer>("/api/customers", {
      method: "PUT",
      body: JSON.stringify(customer),
    });
    const saved = data || customer;
    const current = AdminStorage.getCustomers();
    AdminStorage.saveCustomers(current.map((c) => (c.id === saved.id ? saved : c)));
    return saved;
  },

  async deleteCustomer(id: string): Promise<boolean> {
    await apiFetch(`/api/customers?id=${id}`, { method: "DELETE" });
    const current = AdminStorage.getCustomers();
    AdminStorage.saveCustomers(current.filter((c) => c.id !== id));
    return true;
  },
};

// ─── 5. INVOICES & BILLING SERVICE ────────────────────────────────────
export const InvoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    const data = await apiFetch<Invoice[]>("/api/invoices");
    if (data && Array.isArray(data)) {
      AdminStorage.saveInvoices(data);
      return data;
    }
    return AdminStorage.getInvoices();
  },

  async createInvoice(invoice: Invoice): Promise<Invoice> {
    const data = await apiFetch<Invoice>("/api/invoices", {
      method: "POST",
      body: JSON.stringify(invoice),
    });
    const saved = data || invoice;
    const current = AdminStorage.getInvoices();
    AdminStorage.saveInvoices([saved, ...current]);
    return saved;
  },

  async updateInvoice(invoice: Invoice): Promise<Invoice> {
    const data = await apiFetch<Invoice>("/api/invoices", {
      method: "PUT",
      body: JSON.stringify(invoice),
    });
    const saved = data || invoice;
    const current = AdminStorage.getInvoices();
    AdminStorage.saveInvoices(current.map((i) => (i.id === saved.id ? saved : i)));
    return saved;
  },

  async deleteInvoice(id: string): Promise<boolean> {
    await apiFetch(`/api/invoices?id=${id}`, { method: "DELETE" });
    const current = AdminStorage.getInvoices();
    AdminStorage.saveInvoices(current.filter((i) => i.id !== id));
    return true;
  },
};

// ─── 6. WAREHOUSE SERVICE ─────────────────────────────────────────────
export const WarehouseService = {
  async getItems(): Promise<WarehouseItem[]> {
    const data = await apiFetch<WarehouseItem[]>("/api/warehouse");
    if (data && Array.isArray(data)) {
      AdminStorage.saveWarehouseItems(data);
      return data;
    }
    return AdminStorage.getWarehouseItems();
  },

  async createItem(item: WarehouseItem): Promise<WarehouseItem> {
    const data = await apiFetch<WarehouseItem>("/api/warehouse", {
      method: "POST",
      body: JSON.stringify(item),
    });
    const saved = data || item;
    const current = AdminStorage.getWarehouseItems();
    AdminStorage.saveWarehouseItems([saved, ...current]);
    return saved;
  },

  async updateItem(item: WarehouseItem): Promise<WarehouseItem> {
    const data = await apiFetch<WarehouseItem>("/api/warehouse", {
      method: "PUT",
      body: JSON.stringify(item),
    });
    const saved = data || item;
    const current = AdminStorage.getWarehouseItems();
    AdminStorage.saveWarehouseItems(current.map((w) => (w.id === saved.id ? saved : w)));
    return saved;
  },

  async deleteItem(id: string): Promise<boolean> {
    await apiFetch(`/api/warehouse?id=${id}`, { method: "DELETE" });
    const current = AdminStorage.getWarehouseItems();
    AdminStorage.saveWarehouseItems(current.filter((w) => w.id !== id));
    return true;
  },
};

// ─── 7. NOTIFICATIONS SERVICE ─────────────────────────────────────────
export const NotificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const data = await apiFetch<NotificationItem[]>("/api/notifications");
    if (data && Array.isArray(data)) {
      AdminStorage.saveNotifications(data);
      return data;
    }
    return AdminStorage.getNotifications();
  },

  async createNotification(notif: NotificationItem): Promise<NotificationItem> {
    const data = await apiFetch<NotificationItem>("/api/notifications", {
      method: "POST",
      body: JSON.stringify(notif),
    });
    const saved = data || notif;
    const current = AdminStorage.getNotifications();
    AdminStorage.saveNotifications([saved, ...current]);
    return saved;
  },

  async markRead(id: string): Promise<void> {
    await apiFetch("/api/notifications", {
      method: "PUT",
      body: JSON.stringify({ id }),
    });
    const current = AdminStorage.getNotifications();
    AdminStorage.saveNotifications(current.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  },

  async markAllRead(): Promise<void> {
    await apiFetch("/api/notifications", {
      method: "PUT",
      body: JSON.stringify({ markAll: true }),
    });
    const current = AdminStorage.getNotifications();
    AdminStorage.saveNotifications(current.map((n) => ({ ...n, isRead: true })));
  },

  async deleteNotification(id: string): Promise<boolean> {
    await apiFetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    const current = AdminStorage.getNotifications();
    AdminStorage.saveNotifications(current.filter((n) => n.id !== id));
    return true;
  },
};
