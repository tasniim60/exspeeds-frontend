import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { NotificationItem } from "@/lib/adminData";
import { requireAdmin, getAuthenticatedUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const notifs = ServerStore.getNotifications();
    return NextResponse.json({ success: true, data: notifs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const body: NotificationItem = await request.json();
    if (!body.id) {
      body.id = `notif-${Date.now()}`;
    }
    if (!body.timestamp) {
      body.timestamp = "Just now";
    }
    const saved = ServerStore.addNotification(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (body.markAll) {
      ServerStore.markAllNotificationsRead();
      return NextResponse.json({ success: true, message: "All marked as read" });
    }
    if (body.id) {
      ServerStore.markNotificationRead(body.id);
      return NextResponse.json({ success: true, message: "Marked as read" });
    }
    return NextResponse.json({ success: false, error: "Missing notification id or markAll" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing notification ID" }, { status: 400 });
    }
    ServerStore.deleteNotification(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete notification" },
      { status: 500 }
    );
  }
}
