import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/auth";

// GET /api/notifications - Fetch admin notifications
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 503 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is staff
    const { data: staffProfile } = await supabase
      .from("staff_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!staffProfile) {
      return NextResponse.json(
        { error: "Unauthorized - Staff access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unread") === "true";

    // Build query for admin-only notifications from member actions
    // Only show service_purchase, session_booking, session_updated, and session_cancelled notifications
    // Filter by is_admin_only to ensure mobile app doesn't receive these
    let query = supabase
      .from("notifications")
      .select("*")
      .is("member_id", null)
      .eq("is_global", true)
      .eq("is_admin_only", true)
      .in("type", ["service_purchase", "session_booking", "session_updated", "session_cancelled"])
      .order("created_at", { ascending: false })
      .limit(limit);

    // Filter by unread if requested
    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error("Failed to fetch notifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      notifications: notifications || [] 
    });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Mark notification as read
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 503 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is staff
    const { data: staffProfile } = await supabase
      .from("staff_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!staffProfile) {
      return NextResponse.json(
        { error: "Unauthorized - Staff access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all admin-only member action notifications as read
      const { error } = await supabase
        .from("notifications")
        .update({ 
          is_read: true
        })
        .is("member_id", null)
        .eq("is_global", true)
        .eq("is_admin_only", true)
        .in("type", ["service_purchase", "session_booking", "session_updated", "session_cancelled"])
        .eq("is_read", false);

      if (error) {
        console.error("Failed to mark all notifications as read:", error);
        return NextResponse.json(
          { error: "Failed to update notifications" },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: "All notifications marked as read" 
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Mark specific admin-only member action notification as read
    const { error } = await supabase
      .from("notifications")
      .update({ 
        is_read: true
      })
      .eq("id", notificationId)
      .is("member_id", null)
      .eq("is_global", true)
      .eq("is_admin_only", true)
      .in("type", ["service_purchase", "session_booking", "session_updated", "session_cancelled"]);

    if (error) {
      console.error("Failed to mark notification as read:", error);
      return NextResponse.json(
        { error: "Failed to update notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Notification marked as read" 
    });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete a notification
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 503 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is staff
    const { data: staffProfile } = await supabase
      .from("staff_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!staffProfile) {
      return NextResponse.json(
        { error: "Unauthorized - Staff access required" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Delete the admin-only member action notification
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .is("member_id", null)
      .eq("is_global", true)
      .eq("is_admin_only", true)
      .in("type", ["service_purchase", "session_booking", "session_updated", "session_cancelled"]);

    if (error) {
      console.error("Failed to delete notification:", error);
      return NextResponse.json(
        { error: "Failed to delete notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Notification deleted" 
    });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

