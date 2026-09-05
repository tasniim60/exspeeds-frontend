"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Trash2,
  ArrowRight,
  Package,
  ShoppingCart,
  Warehouse,
  FileText,
  Sliders,
  Send,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { NotificationItem } from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
  onNavigateTab: (tab: any, refId?: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification,
  onNavigateTab,
}) => {
  const { t, isRTL } = useLanguage();
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Notification Preferences
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [webhookActive, setWebhookActive] = useState(true);
  const [telegramActive, setTelegramActive] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://api.exspeeds.com/webhooks/dispatch");

  const filteredNotifications = notifications.filter((n) => {
    const matchesSeverity = severityFilter === "all" || n.severity === severityFilter;
    const matchesCategory = categoryFilter === "all" || n.category === categoryFilter;
    return matchesSeverity && matchesCategory;
  });

  const getSeverityIcon = (sev: NotificationItem["severity"]) => {
    switch (sev) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      default:
        return <Info className="h-4 w-4 text-sky-600" />;
    }
  };

  const getSeverityBg = (sev: NotificationItem["severity"], isRead: boolean) => {
    if (isRead) return "bg-white border-gray-200";
    switch (sev) {
      case "critical":
        return "bg-red-50/70 border-red-200";
      case "warning":
        return "bg-amber-50/70 border-amber-200";
      case "success":
        return "bg-emerald-50/70 border-emerald-200";
      default:
        return "bg-sky-50/70 border-sky-200";
    }
  };

  return (
    <div className="space-y-6 text-start">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50 text-red-600 shrink-0">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              {t("admin.notifications.title")} ({notifications.length})
            </h2>
            <p className="text-xs text-gray-500">
              {t("admin.notifications.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onMarkAllRead}
            className="text-xs font-semibold cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>{t("admin.notifications.markAllRead")}</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Stream on Left, Settings on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200/90 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                {isRTL ? "مستوى الأهمية:" : "Severity:"}
              </span>
              {[
                { id: "all", label: t("common.all") },
                { id: "critical", label: isRTL ? "حرجة" : "Critical", icon: AlertCircle },
                { id: "warning", label: isRTL ? "تحذيرات" : "Warnings", icon: AlertTriangle },
                { id: "success", label: isRTL ? "مكتملة" : "Success", icon: CheckCircle2 },
                { id: "info", label: isRTL ? "معلومات" : "Info", icon: Info },
              ].map((pill) => {
                const IconComponent = pill.icon;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setSeverityFilter(pill.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      severityFilter === pill.id
                        ? "bg-[#251516] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {IconComponent && <IconComponent className="w-3 h-3" />}
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{isRTL ? "غير مقروءة:" : "Unread:"} {notifications.filter((n) => !n.isRead).length}</span>
            </div>
          </div>

          {/* List of Alerts */}
          <div className="space-y-2.5">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border shadow-2xs transition-all flex items-start justify-between gap-4 ${getSeverityBg(
                  notif.severity,
                  notif.isRead
                )}`}
              >
                <div className="flex items-start gap-3 flex-1 text-start">
                  <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-white shadow-2xs border border-gray-100">
                    {getSeverityIcon(notif.severity)}
                  </div>
                  <div className="space-y-1 text-start">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-gray-900">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C45B2A]" />
                      )}
                      <span className="font-mono text-[10px] text-gray-400 ml-auto sm:ml-2 ltr-preserve">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="xs"
                    variant={notif.severity === "critical" ? "destructive" : "brand"}
                    onClick={() => {
                      onMarkRead(notif.id);
                      onNavigateTab(notif.targetTab, notif.referenceId);
                    }}
                    className="text-xs font-bold cursor-pointer"
                  >
                    <span>{isRTL ? "معالجة" : "Resolve"}</span>
                    <ArrowRight className={`h-3 w-3 ${isRTL ? "rotate-180" : ""}`} />
                  </Button>
                  <button
                    onClick={() => onDeleteNotification(notif.id)}
                    className="p-1.5 rounded text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                    title={t("common.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500 text-sm">
                {isRTL ? "لا توجد إشعارات أو تنبيهات مطابقة لهذا الفلتر." : "No active notifications matching this filter."}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Alert Channel Preferences */}
        <div className="space-y-4 text-start">
          <Card className="shadow-2xs">
            <CardHeader className="p-5 pb-3 text-start">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#C45B2A]" />
                {isRTL ? "قنوات توجيه التنبيهات" : "Alert Channel Routing"}
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                {isRTL ? "تخصيص تنبيهات الواتساب، الرسائل النصية، والـ Webhooks التلقائية" : "Configure automated dispatch alerts and webhook targets"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4 text-xs">
              {/* Toggle 1: SMS */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900">{isRTL ? "رسائل SMS للسائقين والعمليات" : "SMS Driver & Ops Alerts"}</p>
                  <p className="text-[11px] text-gray-500">{isRTL ? "إشعارات فورية عند توقف الجمارك أو التأخير" : "Instant SMS on customs hold / delay"}</p>
                </div>
                <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
              </div>

              {/* Toggle 2: Email Digest */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900">{isRTL ? "تقرير البريد الإلكتروني اليومي" : "Daily Executive Email Digest"}</p>
                  <p className="text-[11px] text-gray-500">{isRTL ? "يُرسل في الساعة 08:00 صباحاً مع ملخص الأرباح" : "Sent at 08:00 AM with P&L summary"}</p>
                </div>
                <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
              </div>

              {/* Toggle 3: Webhook API */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900">{isRTL ? "إرسال Webhook فوري" : "Real-Time Webhook Dispatch"}</p>
                  <p className="text-[11px] text-gray-500">{isRTL ? "إرسال JSON فوري عند مسح الباركود" : "JSON push payload on AWB scan"}</p>
                </div>
                <Switch checked={webhookActive} onCheckedChange={setWebhookActive} />
              </div>

              {/* Toggle 4: Telegram */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900">{isRTL ? "إشعارات بوت تليجرام" : "Telegram Bot Notifications"}</p>
                  <p className="text-[11px] text-gray-500">{isRTL ? "إرسال إلى @XSPEED_Ops_Bot" : "Push to @XSPEED_Ops_Bot"}</p>
                </div>
                <Switch checked={telegramActive} onCheckedChange={setTelegramActive} />
              </div>

              {/* Webhook URL Input */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <label className="block text-[11px] font-bold uppercase text-gray-600">
                  {isRTL ? "رابط نقطة نهاية Webhook المسجلة" : "Registered Webhook Endpoint URL"}
                </label>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="font-mono text-xs ltr-preserve"
                />
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => alert(isRTL ? "تم إرسال اختبار تجريبي بنجاح: 200 OK" : "Test ping sent to webhook endpoint: 200 OK")}
                  className="w-full text-xs font-semibold mt-1 cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                  <span>{isRTL ? "إرسال حزمة تجريبية للـ Webhook" : "Send Test Webhook Payload"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
