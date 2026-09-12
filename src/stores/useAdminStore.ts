import { create } from "zustand";
import {
  Shipment,
  Order,
  Customer,
  Invoice,
  WarehouseItem,
  NotificationItem,
  BlogPost,
  AdminStorage,
} from "@/lib/adminData";
import {
  shipmentService,
  orderService,
  customerService,
  invoiceService,
  warehouseService,
  notificationService,
  postService,
} from "@/services";

export type AdminTab = "statistics" | "requests" | "shipments" | "reports" | "posts";

export type QuickActionType =
  | "new-shipment"
  | "new-order"
  | "new-customer"
  | "new-invoice"
  | "new-post";

export interface BadgeCounts {
  shipments: number;
  orders: number;
  notifications: number;
  requests?: number;
}

interface AdminState {
  // Navigation & UI State
  activeTab: AdminTab;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  selectedHub: string;
  commandPaletteOpen: boolean;
  initialSelectedAwb?: string;

  // Domain Datasets
  shipments: Shipment[];
  orders: Order[];
  customers: Customer[];
  invoices: Invoice[];
  warehouseItems: WarehouseItem[];
  notifications: NotificationItem[];
  posts: BlogPost[];

  // Operational Flags
  isLoadingData: boolean;
  isInitialized: boolean;

  // Actions: UI & Navigation
  setActiveTab: (tab: AdminTab) => void;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setSelectedHub: (hub: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setInitialSelectedAwb: (awb?: string) => void;
  navigateTab: (tab: AdminTab | string, refId?: string) => void;
  handleQuickAction: (action: QuickActionType) => void;

  // Actions: Data Operations & Optimistic Updates
  loadRealData: () => Promise<void>;
  triggerNotification: (
    title: string,
    message: string,
    severity: "critical" | "warning" | "success" | "info",
    category: "shipment" | "order" | "warehouse" | "invoice" | "system",
    targetTab: string,
    referenceId?: string
  ) => Promise<void>;

  addShipment: (newShipment: Shipment) => Promise<void>;
  updateShipment: (updatedShipment: Shipment) => Promise<void>;
  deleteShipment: (id: string) => Promise<void>;

  addOrder: (newOrder: Order) => Promise<void>;
  updateOrder: (updatedOrder: Order) => Promise<void>;
  dispatchOrder: (order: Order) => Promise<void>;

  addCustomer: (newCustomer: Customer) => Promise<void>;
  updateCustomer: (updatedCustomer: Customer) => Promise<void>;

  addInvoice: (newInvoice: Invoice) => Promise<void>;
  updateInvoice: (updatedInvoice: Invoice) => Promise<void>;

  addWarehouseItem: (newItem: WarehouseItem) => Promise<void>;

  addPost: (newPost: BlogPost) => void;
  updatePost: (updatedPost: BlogPost) => void;
  deletePost: (id: string) => void;

  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Computed
  getBadgeCounts: () => BadgeCounts;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial state
  activeTab: "statistics",
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  selectedHub: "all",
  commandPaletteOpen: false,
  initialSelectedAwb: undefined,

  shipments: [],
  orders: [],
  customers: [],
  invoices: [],
  warehouseItems: [],
  notifications: [],
  posts: [],

  isLoadingData: true,
  isInitialized: false,

  // Navigation Setters
  setActiveTab: (tab: AdminTab) => {
    set({ activeTab: tab });
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("xspeed_admin_active_tab", tab);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab);
        window.history.replaceState(null, "", url.toString());
      }
    } catch {}
  },

  setSidebarCollapsed: (arg) => {
    set((state) => ({
      sidebarCollapsed: typeof arg === "function" ? arg(state.sidebarCollapsed) : arg,
    }));
  },

  setMobileSidebarOpen: (open: boolean) => set({ mobileSidebarOpen: open }),

  setSelectedHub: (hub: string) => set({ selectedHub: hub }),

  setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),

  setInitialSelectedAwb: (awb?: string) => set({ initialSelectedAwb: awb }),

  navigateTab: (tab: AdminTab | string, refId?: string) => {
    const validTabs: Record<string, AdminTab> = {
      shipments: "shipments",
      requests: "requests",
      reports: "reports",
      statistics: "statistics",
      posts: "posts",
    };
    const target = validTabs[tab] || "shipments";
    get().setActiveTab(target);
    if (target === "shipments" && refId) {
      set({ initialSelectedAwb: refId });
    }
  },

  handleQuickAction: (action: QuickActionType) => {
    switch (action) {
      case "new-shipment":
        get().setActiveTab("shipments");
        break;
      case "new-order":
        get().setActiveTab("requests");
        break;
      case "new-customer":
        get().setActiveTab("shipments");
        break;
      case "new-invoice":
        get().setActiveTab("reports");
        break;
      case "new-post":
        get().setActiveTab("posts");
        break;
    }
  },

  // Asynchronous Domain Operations
  loadRealData: async () => {
    set({ isLoadingData: true });
    try {
      const [shpList, ordList, custList, invList, whList, notifList] = await Promise.all([
        shipmentService.getShipments(),
        orderService.getOrders(),
        customerService.getCustomers(),
        invoiceService.getInvoices(),
        warehouseService.getItems(),
        notificationService.getNotifications(),
      ]);

      set({
        shipments: shpList || [],
        orders: ordList || [],
        customers: custList || [],
        invoices: invList || [],
        warehouseItems: whList || [],
        notifications: notifList || [],
        posts: AdminStorage.getBlogPosts(),
        isLoadingData: false,
        isInitialized: true,
      });
    } catch (err) {
      console.error("[useAdminStore] Failed to load admin data:", err);
      set({ isLoadingData: false, isInitialized: true });
    }
  },

  triggerNotification: async (title, message, severity, category, targetTab, referenceId) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      severity,
      category,
      timestamp: "Just now",
      isRead: false,
      targetTab,
      referenceId,
    };
    // Optimistic insert
    set((state) => ({ notifications: [newNotif, ...state.notifications] }));
    await notificationService.createNotification(newNotif);
  },

  addShipment: async (newShipment: Shipment) => {
    // Optimistic insert
    set((state) => ({ shipments: [newShipment, ...state.shipments] }));
    await shipmentService.createShipment(newShipment);

    get().triggerNotification(
      "New AWB Booked",
      `Shipment ${newShipment.awb} (${newShipment.serviceType}) created for ${newShipment.company} to ${newShipment.country}.`,
      "info",
      "shipment",
      "shipments",
      newShipment.awb
    );
  },

  updateShipment: async (updatedShipment: Shipment) => {
    // Optimistic update
    set((state) => ({
      shipments: state.shipments.map((s) => (s.id === updatedShipment.id ? updatedShipment : s)),
    }));
    await shipmentService.updateShipment(updatedShipment);

    if (updatedShipment.status === "Delivered") {
      get().triggerNotification(
        "Shipment Delivered",
        `AWB ${updatedShipment.awb} successfully delivered to ${updatedShipment.receiverName} in ${updatedShipment.receiverCity}.`,
        "success",
        "shipment",
        "shipments",
        updatedShipment.awb
      );
    } else if (updatedShipment.status === "Exception" || updatedShipment.status === "Delayed") {
      get().triggerNotification(
        "Shipment Exception Alert",
        `AWB ${updatedShipment.awb} flagged with status '${updatedShipment.status}': ${
          updatedShipment.notes || "Check customs paperwork"
        }.`,
        "critical",
        "shipment",
        "shipments",
        updatedShipment.awb
      );
    }
  },

  deleteShipment: async (id: string) => {
    set((state) => ({ shipments: state.shipments.filter((s) => s.id !== id) }));
    await shipmentService.deleteShipment(id);
  },

  addOrder: async (newOrder: Order) => {
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    await orderService.createOrder(newOrder);

    get().triggerNotification(
      "New Order Booked",
      `Order #${newOrder.orderNumber} received from ${newOrder.companyName} (${newOrder.priority}). Ready for dispatch.`,
      "info",
      "order",
      "orders",
      newOrder.orderNumber
    );
  },

  updateOrder: async (updatedOrder: Order) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
    }));
    await orderService.updateOrder(updatedOrder);
  },

  dispatchOrder: async (order: Order) => {
    const generatedAwb = `XS-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newShipment: Shipment = {
      id: `shp-${Date.now()}`,
      awb: generatedAwb,
      date: new Date().toISOString().split("T")[0],
      account: order.customerId,
      company: order.companyName,
      senderName: order.customerName,
      senderCity: order.pickupAddress.split(",")[0] || "Cairo",
      receiverName: "Consignee Client",
      receiverCity: order.deliveryAddress.split(",")[0] || "Dubai",
      country: order.deliveryAddress.includes("UAE") ? "United Arab Emirates" : "Saudi Arabia",
      carrier: "XSPEED Express",
      weight: order.totalWeight,
      length: 40,
      width: 30,
      height: 25,
      volumetricWeight: 6.0,
      dim: "40x30x25 cm",
      priceEgp: order.currency === "EGP" ? order.totalAmount : order.totalAmount * 31,
      priceUsd: order.currency === "USD" ? order.totalAmount : Math.round(order.totalAmount / 31),
      status: "In Transit",
      originHub: "Cairo Central Gateway",
      destinationHub: "Destination Gateway",
      currentLocation: "Order converted to AWB and queued for courier pickup",
      serviceType: "Next-Day Air",
      notes: order.notes,
      timeline: [
        {
          status: "Order Dispatched & AWB Generated",
          location: "Cairo Dispatch Gateway",
          timestamp: "Just now",
          completed: true,
          current: true,
        },
        {
          status: "Out for Courier Pickup",
          location: order.pickupAddress,
          timestamp: "Scheduled Today",
          completed: false,
        },
      ],
    };

    // Optimistic state updates
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === order.id
          ? { ...o, status: "In-Transit" as Order["status"], linkedAwb: generatedAwb }
          : o
      ),
      shipments: [newShipment, ...state.shipments],
      activeTab: "shipments",
      initialSelectedAwb: generatedAwb,
    }));

    await Promise.all([
      orderService.updateOrder({ ...order, status: "In-Transit", linkedAwb: generatedAwb }),
      shipmentService.createShipment(newShipment),
    ]);

    get().triggerNotification(
      "1-Click Dispatch Successful",
      `Order #${order.orderNumber} dispatched! Generated AWB ${generatedAwb} and scheduled courier collection.`,
      "success",
      "order",
      "shipments",
      generatedAwb
    );
  },

  addCustomer: async (newCustomer: Customer) => {
    set((state) => ({ customers: [newCustomer, ...state.customers] }));
    await customerService.createCustomer(newCustomer);

    get().triggerNotification(
      "New Customer Onboarded",
      `Account ${newCustomer.code} (${newCustomer.company}) enrolled in tier '${newCustomer.tier}'.`,
      "info",
      "system",
      "customers",
      newCustomer.id
    );
  },

  updateCustomer: async (updatedCustomer: Customer) => {
    set((state) => ({
      customers: state.customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)),
    }));
    await customerService.updateCustomer(updatedCustomer);
  },

  addInvoice: async (newInvoice: Invoice) => {
    set((state) => ({ invoices: [newInvoice, ...state.invoices] }));
    await invoiceService.createInvoice(newInvoice);

    get().triggerNotification(
      "Invoice Generated",
      `Invoice #${newInvoice.invoiceNumber} issued to ${
        newInvoice.companyName
      } for ${newInvoice.totalAmount.toLocaleString()} ${newInvoice.currency}.`,
      "info",
      "invoice",
      "invoices",
      newInvoice.invoiceNumber
    );
  },

  updateInvoice: async (updatedInvoice: Invoice) => {
    set((state) => ({
      invoices: state.invoices.map((i) => (i.id === updatedInvoice.id ? updatedInvoice : i)),
    }));
    await invoiceService.updateInvoice(updatedInvoice);

    if (updatedInvoice.status === "Paid") {
      get().triggerNotification(
        "Payment Confirmed",
        `Invoice #${updatedInvoice.invoiceNumber} paid (${updatedInvoice.totalAmount.toLocaleString()} ${
          updatedInvoice.currency
        }) via ${updatedInvoice.paymentMethod || "Bank Wire"}.`,
        "success",
        "invoice",
        "invoices",
        updatedInvoice.invoiceNumber
      );
    }
  },

  addWarehouseItem: async (newItem: WarehouseItem) => {
    set((state) => ({ warehouseItems: [newItem, ...state.warehouseItems] }));
    await warehouseService.createItem(newItem);

    get().triggerNotification(
      "Inbound Cargo Received",
      `SKU ${newItem.sku} (${newItem.name}) stored in ${newItem.warehouseId.toUpperCase()} Hub at ${
        newItem.bayLocation
      }.`,
      "info",
      "warehouse",
      "warehouse",
      newItem.warehouseId
    );
  },

  addPost: (newPost: BlogPost) => {
    set((state) => {
      const updated = [newPost, ...state.posts];
      postService.createPost(newPost);
      return { posts: updated };
    });

    get().triggerNotification(
      "Blog Article Published",
      `Post "${newPost.title}" published with Rank Math SEO score of ${newPost.seoScore}/100 and synced with frontend.`,
      "success",
      "system",
      "posts",
      newPost.slug
    );
  },

  updatePost: (updatedPost: BlogPost) => {
    set((state) => {
      const updated = state.posts.map((p) => (p.id === updatedPost.id ? updatedPost : p));
      postService.updatePost(updatedPost);
      return { posts: updated };
    });

    get().triggerNotification(
      "Blog Article Updated",
      `Post "${updatedPost.title}" updated with Rank Math SEO score of ${updatedPost.seoScore}/100.`,
      "info",
      "system",
      "posts",
      updatedPost.slug
    );
  },

  deletePost: (id: string) => {
    set((state) => {
      const updated = state.posts.filter((p) => p.id !== id);
      postService.deletePost(id);
      return { posts: updated };
    });
  },

  markNotificationRead: async (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    }));
    await notificationService.markRead(id);
  },

  markAllNotificationsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
    await notificationService.markAllRead();
  },

  deleteNotification: async (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
    await notificationService.deleteNotification(id);
  },

  // Computed Badge Counts
  getBadgeCounts: () => {
    const state = get();
    return {
      shipments: state.shipments.filter((s) => s.status === "In Transit").length,
      orders: state.orders.filter(
        (o) => o.status === "New Bookings" || o.status === "Ready for Dispatch"
      ).length,
      notifications: state.notifications.filter((n) => !n.isRead).length,
    };
  },
}));
