"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  AdminSidebar,
  AdminTab,
} from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { CommandPalette } from "@/components/admin/CommandPalette";
import dynamic from "next/dynamic";
import { useLanguage } from "@/context/LanguageContext";
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
  ShipmentService,
  OrderService,
  CustomerService,
  InvoiceService,
  WarehouseService,
  NotificationService,
} from "@/lib/backendApi";

const StatisticsView = dynamic(() => import("@/components/admin/StatisticsView").then((m) => m.StatisticsView), {
  loading: () => <ViewSkeleton />,
});
const ShipmentsView = dynamic(() => import("@/components/admin/ShipmentsView").then((m) => m.ShipmentsView), {
  loading: () => <ViewSkeleton />,
});
const OrdersView = dynamic(() => import("@/components/admin/OrdersView").then((m) => m.OrdersView), {
  loading: () => <ViewSkeleton />,
});
const CustomersView = dynamic(() => import("@/components/admin/CustomersView").then((m) => m.CustomersView), {
  loading: () => <ViewSkeleton />,
});
const ReportsView = dynamic(() => import("@/components/admin/ReportsView").then((m) => m.ReportsView), {
  loading: () => <ViewSkeleton />,
});
const NotificationsView = dynamic(() => import("@/components/admin/NotificationsView").then((m) => m.NotificationsView), {
  loading: () => <ViewSkeleton />,
});
const WarehouseView = dynamic(() => import("@/components/admin/WarehouseView").then((m) => m.WarehouseView), {
  loading: () => <ViewSkeleton />,
});
const TrackingView = dynamic(() => import("@/components/admin/TrackingView").then((m) => m.TrackingView), {
  loading: () => <ViewSkeleton />,
});
const InvoicesView = dynamic(() => import("@/components/admin/InvoicesView").then((m) => m.InvoicesView), {
  loading: () => <ViewSkeleton />,
});
const PostsView = dynamic(() => import("@/components/admin/PostsView").then((m) => m.PostsView), {
  loading: () => <ViewSkeleton />,
});
const ShipmentHistoryView = dynamic(() => import("@/components/admin/ShipmentHistoryView").then((m) => m.ShipmentHistoryView), {
  loading: () => <ViewSkeleton />,
});
const ShipmentRequestsView = dynamic(() => import("@/components/admin/ShipmentRequestsView"), {
  loading: () => <ViewSkeleton />,
});

function ViewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl border border-gray-200" />
        ))}
      </div>
      <div className="h-64 bg-gray-100 rounded-xl border border-gray-200" />
    </div>
  );
}

function AdminPageContent() {
  const { isRTL } = useLanguage();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as AdminTab) || "statistics";
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedHub, setSelectedHub] = useState<string>("all");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Sync tab with URL search params and storage
  useEffect(() => {
    const tabParam = searchParams.get("tab") as AdminTab;
    const saved = typeof window !== "undefined" ? (sessionStorage.getItem("xspeed_admin_active_tab") as AdminTab) : null;
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (saved) {
      setActiveTab(saved);
    }
  }, [searchParams]);

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    try {
      sessionStorage.setItem("xspeed_admin_active_tab", tab);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab);
        window.history.replaceState(null, "", url.toString());
      }
    } catch {}
  };

  // Core Datasets
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [initialSelectedAwb, setInitialSelectedAwb] = useState<string | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load real data asynchronously from API
  useEffect(() => {
    let isMounted = true;
    async function loadRealData() {
      setIsLoadingData(true);
      try {
        const [shpList, ordList, custList, invList, whList, notifList] = await Promise.all([
          ShipmentService.getShipments(),
          OrderService.getOrders(),
          CustomerService.getCustomers(),
          InvoiceService.getInvoices(),
          WarehouseService.getItems(),
          NotificationService.getNotifications(),
        ]);

        if (isMounted) {
          setShipments(shpList || []);
          setOrders(ordList || []);
          setCustomers(custList || []);
          setInvoices(invList || []);
          setWarehouseItems(whList || []);
          setNotifications(notifList || []);
          setPosts(AdminStorage.getBlogPosts());
        }
      } catch (err) {
        console.error("Failed to load admin data from API:", err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    loadRealData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Reactive System Notification Dispatcher
  const triggerNotification = async (
    title: string,
    message: string,
    severity: "critical" | "warning" | "success" | "info",
    category: "shipment" | "order" | "warehouse" | "invoice" | "system",
    targetTab: string,
    referenceId?: string
  ) => {
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
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    await NotificationService.createNotification(newNotif);
  };

  // Shipment Actions
  const handleAddShipment = async (newShipment: Shipment) => {
    const updated = [newShipment, ...shipments];
    setShipments(updated);
    await ShipmentService.createShipment(newShipment);

    triggerNotification(
      "New AWB Booked",
      `Shipment ${newShipment.awb} (${newShipment.serviceType}) created for ${newShipment.company} to ${newShipment.country}.`,
      "info",
      "shipment",
      "shipments",
      newShipment.awb
    );
  };

  const handleUpdateShipment = async (updatedShipment: Shipment) => {
    const updated = shipments.map((s) => (s.id === updatedShipment.id ? updatedShipment : s));
    setShipments(updated);
    await ShipmentService.updateShipment(updatedShipment);

    if (updatedShipment.status === "Delivered") {
      triggerNotification(
        "Shipment Delivered",
        `AWB ${updatedShipment.awb} successfully delivered to ${updatedShipment.receiverName} in ${updatedShipment.receiverCity}.`,
        "success",
        "shipment",
        "shipments",
        updatedShipment.awb
      );
    } else if (updatedShipment.status === "Exception" || updatedShipment.status === "Delayed") {
      triggerNotification(
        "Shipment Exception Alert",
        `AWB ${updatedShipment.awb} flagged with status '${updatedShipment.status}': ${updatedShipment.notes || "Check customs paperwork"}.`,
        "critical",
        "shipment",
        "shipments",
        updatedShipment.awb
      );
    }
  };

  const handleDeleteShipment = async (id: string) => {
    const updated = shipments.filter((s) => s.id !== id);
    setShipments(updated);
    await ShipmentService.deleteShipment(id);
  };

  // Order Actions
  const handleAddOrder = async (newOrder: Order) => {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    await OrderService.createOrder(newOrder);

    triggerNotification(
      "New Order Booked",
      `Order #${newOrder.orderNumber} received from ${newOrder.companyName} (${newOrder.priority}). Ready for dispatch.`,
      "info",
      "order",
      "orders",
      newOrder.orderNumber
    );
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    const updated = orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
    setOrders(updated);
    await OrderService.updateOrder(updatedOrder);
  };

  const handleDispatchOrder = async (order: Order) => {
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
        { status: "Order Dispatched & AWB Generated", location: "Cairo Dispatch Gateway", timestamp: "Just now", completed: true, current: true },
        { status: "Out for Courier Pickup", location: order.pickupAddress, timestamp: "Scheduled Today", completed: false },
      ],
    };

    const updatedOrders = orders.map((o) =>
      o.id === order.id
        ? { ...o, status: "In-Transit" as Order["status"], linkedAwb: generatedAwb }
        : o
    );
    const updatedShipments = [newShipment, ...shipments];

    setOrders(updatedOrders);
    setShipments(updatedShipments);
    await Promise.all([
      OrderService.updateOrder({ ...order, status: "In-Transit", linkedAwb: generatedAwb }),
      ShipmentService.createShipment(newShipment),
    ]);

    triggerNotification(
      "1-Click Dispatch Successful",
      `Order #${order.orderNumber} dispatched! Generated AWB ${generatedAwb} and scheduled courier collection.`,
      "success",
      "order",
      "shipments",
      generatedAwb
    );

    setActiveTab("shipments");
    setInitialSelectedAwb(generatedAwb);
  };

  // Customer Actions
  const handleAddCustomer = async (newCustomer: Customer) => {
    const updated = [newCustomer, ...customers];
    setCustomers(updated);
    await CustomerService.createCustomer(newCustomer);

    triggerNotification(
      "New Customer Onboarded",
      `Account ${newCustomer.code} (${newCustomer.company}) enrolled in tier '${newCustomer.tier}'.`,
      "info",
      "system",
      "customers",
      newCustomer.id
    );
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    const updated = customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c));
    setCustomers(updated);
    await CustomerService.updateCustomer(updatedCustomer);
  };

  // Invoice Actions
  const handleAddInvoice = async (newInvoice: Invoice) => {
    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    await InvoiceService.createInvoice(newInvoice);

    triggerNotification(
      "Invoice Generated",
      `Invoice #${newInvoice.invoiceNumber} issued to ${newInvoice.companyName} for ${newInvoice.totalAmount.toLocaleString()} ${newInvoice.currency}.`,
      "info",
      "invoice",
      "invoices",
      newInvoice.invoiceNumber
    );
  };

  const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
    const updated = invoices.map((i) => (i.id === updatedInvoice.id ? updatedInvoice : i));
    setInvoices(updated);
    await InvoiceService.updateInvoice(updatedInvoice);

    if (updatedInvoice.status === "Paid") {
      triggerNotification(
        "Payment Confirmed",
        `Invoice #${updatedInvoice.invoiceNumber} paid (${updatedInvoice.totalAmount.toLocaleString()} ${updatedInvoice.currency}) via ${updatedInvoice.paymentMethod || "Bank Wire"}.`,
        "success",
        "invoice",
        "invoices",
        updatedInvoice.invoiceNumber
      );
    }
  };

  // Warehouse Actions
  const handleAddWarehouseItem = async (newItem: WarehouseItem) => {
    const updated = [newItem, ...warehouseItems];
    setWarehouseItems(updated);
    await WarehouseService.createItem(newItem);

    triggerNotification(
      "Inbound Cargo Received",
      `SKU ${newItem.sku} (${newItem.name}) stored in ${newItem.warehouseId.toUpperCase()} Hub at ${newItem.bayLocation}.`,
      "info",
      "warehouse",
      "warehouse",
      newItem.warehouseId
    );
  };

  // Post Actions
  const handleAddPost = (newPost: BlogPost) => {
    const updated = [newPost, ...posts];
    setPosts(updated);
    AdminStorage.saveBlogPosts(updated);

    triggerNotification(
      "Blog Article Published",
      `Post "${newPost.title}" published with Rank Math SEO score of ${newPost.seoScore}/100 and synced with frontend.`,
      "success",
      "system",
      "posts",
      newPost.slug
    );
  };

  const handleUpdatePost = (updatedPost: BlogPost) => {
    const updated = posts.map((p) => (p.id === updatedPost.id ? updatedPost : p));
    setPosts(updated);
    AdminStorage.saveBlogPosts(updated);

    triggerNotification(
      "Blog Article Updated",
      `Post "${updatedPost.title}" updated with Rank Math SEO score of ${updatedPost.seoScore}/100.`,
      "info",
      "system",
      "posts",
      updatedPost.slug
    );
  };

  const handleDeletePost = (id: string) => {
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    AdminStorage.saveBlogPosts(updated);
  };

  // Notification Actions
  const handleMarkNotificationRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(updated);
    await NotificationService.markRead(id);
  };

  const handleMarkAllNotificationsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    await NotificationService.markAllRead();
  };

  const handleDeleteNotification = async (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    await NotificationService.deleteNotification(id);
  };

  // Quick Action Handler
  const handleQuickAction = (action: "new-shipment" | "new-order" | "new-customer" | "new-invoice" | "new-post") => {
    switch (action) {
      case "new-shipment":
        handleSelectTab("shipments");
        break;
      case "new-order":
        handleSelectTab("requests");
        break;
      case "new-customer":
        handleSelectTab("shipments");
        break;
      case "new-invoice":
        handleSelectTab("reports");
        break;
      case "new-post":
        handleSelectTab("posts");
        break;
    }
  };

  const handleNavigateTab = (tab: AdminTab | string, refId?: string) => {
    const validTabs: Record<string, AdminTab> = {
      shipments: "shipments",
      requests: "requests",
      reports: "reports",
      statistics: "statistics",
      posts: "posts",
    };
    const target = validTabs[tab] || "shipments";
    handleSelectTab(target);
    if (target === "shipments" && refId) {
      setInitialSelectedAwb(refId);
    }
  };

  const badgeCounts = useMemo(() => ({
    shipments: shipments.filter((s) => s.status === "In Transit").length,
    orders: orders.filter((o) => o.status === "New Bookings" || o.status === "Ready for Dispatch").length,
    notifications: notifications.filter((n) => !n.isRead).length,
  }), [shipments, orders, notifications]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          selectedHub={selectedHub}
          setSelectedHub={setSelectedHub}
          badgeCounts={badgeCounts}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full">
            <AdminSidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                handleSelectTab(tab);
                setMobileSidebarOpen(false);
              }}
              collapsed={false}
              setCollapsed={() => {}}
              selectedHub={selectedHub}
              setSelectedHub={setSelectedHub}
              badgeCounts={badgeCounts}
            />
          </div>
        </div>
      )}

      {/* Command Palette Modal (`Ctrl+K`) */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onSelectTab={handleSelectTab}
        onQuickAction={handleQuickAction}
        shipments={shipments}
        orders={orders}
        customers={customers}
        invoices={invoices}
        onSelectAwb={(awb) => {
          setActiveTab("shipments");
          setInitialSelectedAwb(awb);
        }}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isRTL
            ? sidebarCollapsed
              ? "lg:pr-20 lg:pl-0"
              : "lg:pr-64 lg:pl-0"
            : sidebarCollapsed
            ? "lg:pl-20 lg:pr-0"
            : "lg:pl-64 lg:pr-0"
        }`}
      >
        {/* Topbar */}
        <AdminTopbar
          activeTab={activeTab}
          onOpenCommand={() => setCommandPaletteOpen(true)}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onQuickAction={handleQuickAction}
          notifications={notifications}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onSelectNotification={(notif) => {
            handleMarkNotificationRead(notif.id);
            handleNavigateTab(notif.targetTab as AdminTab, notif.referenceId);
          }}
          onNavigateTab={handleNavigateTab}
          selectedHub={selectedHub}
        />

        {/* View Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full animate-fade-up">
          {activeTab === "statistics" && (
            <StatisticsView
              shipments={shipments}
              orders={orders}
              customers={customers}
              invoices={invoices}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {activeTab === "requests" && (
            <ShipmentRequestsView
              onTriggerNotification={(title, message, severity) =>
                triggerNotification(title, message, severity, "shipment", "requests")
              }
            />
          )}

          {activeTab === "shipments" && (
            <ShipmentsView
              shipments={shipments}
              onAddShipment={handleAddShipment}
              onUpdateShipment={handleUpdateShipment}
              onDeleteShipment={handleDeleteShipment}
              initialSelectedAwb={initialSelectedAwb}
            />
          )}

          {activeTab === "reports" && (
            <ReportsView
              shipments={shipments}
              invoices={invoices}
              customers={customers}
            />
          )}

          {activeTab === "posts" && (
            <PostsView
              posts={posts}
              onAddPost={handleAddPost}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeletePost}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <AdminPageContent />
    </Suspense>
  );
}

