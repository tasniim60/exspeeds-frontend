/**
 * Unified Backend API Facade
 * Decoupled into individual domain services in `@/services`
 * This file is retained for complete backwards compatibility.
 */

export {
  apiClient,
  http,
  shipmentService,
  ShipmentService,
  shipmentRequestService,
  ShipmentRequestService,
  orderService,
  OrderService,
  customerService,
  CustomerService,
  invoiceService,
  InvoiceService,
  warehouseService,
  WarehouseService,
  notificationService,
  NotificationService,
  postService,
  PostService,
} from "@/services";
