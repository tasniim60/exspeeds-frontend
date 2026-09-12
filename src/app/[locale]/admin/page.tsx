"use client";

import React, { useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { CommandPalette } from "@/components/admin/CommandPalette";
import dynamic from "next/dynamic";
import { useLanguage } from "@/context/LanguageContext";
import { useAdminStore } from "@/stores/useAdminStore";

const StatisticsView = dynamic(() => import("@/components/admin/StatisticsView").then((m) => m.StatisticsView), {
  loading: () => <ViewSkeleton />,
});
const ShipmentsView = dynamic(() => import("@/components/admin/ShipmentsView").then((m) => m.ShipmentsView), {
  loading: () => <ViewSkeleton />,
});
const ReportsView = dynamic(() => import("@/components/admin/ReportsView").then((m) => m.ReportsView), {
  loading: () => <ViewSkeleton />,
});
const PostsView = dynamic(() => import("@/components/admin/PostsView").then((m) => m.PostsView), {
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

  // Zustand Store Selectors
  const activeTab = useAdminStore((s) => s.activeTab);
  const sidebarCollapsed = useAdminStore((s) => s.sidebarCollapsed);
  const mobileSidebarOpen = useAdminStore((s) => s.mobileSidebarOpen);
  const selectedHub = useAdminStore((s) => s.selectedHub);
  const commandPaletteOpen = useAdminStore((s) => s.commandPaletteOpen);
  const initialSelectedAwb = useAdminStore((s) => s.initialSelectedAwb);

  const shipments = useAdminStore((s) => s.shipments);
  const orders = useAdminStore((s) => s.orders);
  const customers = useAdminStore((s) => s.customers);
  const invoices = useAdminStore((s) => s.invoices);
  const notifications = useAdminStore((s) => s.notifications);
  const posts = useAdminStore((s) => s.posts);

  // Store Actions
  const setActiveTab = useAdminStore((s) => s.setActiveTab);
  const setSidebarCollapsed = useAdminStore((s) => s.setSidebarCollapsed);
  const setMobileSidebarOpen = useAdminStore((s) => s.setMobileSidebarOpen);
  const setSelectedHub = useAdminStore((s) => s.setSelectedHub);
  const setCommandPaletteOpen = useAdminStore((s) => s.setCommandPaletteOpen);
  const setInitialSelectedAwb = useAdminStore((s) => s.setInitialSelectedAwb);
  const navigateTab = useAdminStore((s) => s.navigateTab);
  const handleQuickAction = useAdminStore((s) => s.handleQuickAction);

  const loadRealData = useAdminStore((s) => s.loadRealData);
  const triggerNotification = useAdminStore((s) => s.triggerNotification);
  const addShipment = useAdminStore((s) => s.addShipment);
  const updateShipment = useAdminStore((s) => s.updateShipment);
  const deleteShipment = useAdminStore((s) => s.deleteShipment);
  const addPost = useAdminStore((s) => s.addPost);
  const updatePost = useAdminStore((s) => s.updatePost);
  const deletePost = useAdminStore((s) => s.deletePost);
  const markNotificationRead = useAdminStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAdminStore((s) => s.markAllNotificationsRead);

  // Synchronize Tab with URL query param on mount/navigation
  useEffect(() => {
    const tabParam = searchParams.get("tab") as AdminTab;
    const saved = typeof window !== "undefined" ? (sessionStorage.getItem("xspeed_admin_active_tab") as AdminTab) : null;
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (saved) {
      setActiveTab(saved);
    }
  }, [searchParams, setActiveTab]);

  // Load Real Data once on mount
  useEffect(() => {
    loadRealData();
  }, [loadRealData]);

  // Computed Badge Counts
  const badgeCounts = useMemo(
    () => ({
      shipments: shipments.filter((s) => s.status === "In Transit").length,
      orders: orders.filter((o) => o.status === "New Bookings" || o.status === "Ready for Dispatch").length,
      notifications: notifications.filter((n) => !n.isRead).length,
    }),
    [shipments, orders, notifications]
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
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
                setActiveTab(tab);
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

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onSelectTab={setActiveTab}
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
          onMarkAllNotificationsRead={markAllNotificationsRead}
          onSelectNotification={(notif) => {
            markNotificationRead(notif.id);
            navigateTab(notif.targetTab as AdminTab, notif.referenceId);
          }}
          onNavigateTab={navigateTab}
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
              onNavigateTab={navigateTab}
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
              onAddShipment={addShipment}
              onUpdateShipment={updateShipment}
              onDeleteShipment={deleteShipment}
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
              onAddPost={addPost}
              onUpdatePost={updatePost}
              onDeletePost={deletePost}
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
