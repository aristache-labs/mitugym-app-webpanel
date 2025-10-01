import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Supabase credentials are missing" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("member_id");

  if (!memberId) {
    return NextResponse.json({ error: "member_id is required" }, { status: 400 });
  }

  try {
    // Fetch purchased services for the member with service details
    const { data: purchasedServices, error } = await admin
      .from("purchased_services")
      .select(`
        *,
        services (*)
      `)
      .eq("member_id", memberId)
      .eq("status", "approved")
      .gt("sessions_remaining", 0)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch purchased services:", error);
      return NextResponse.json({ error: "Failed to fetch purchased services" }, { status: 500 });
    }

    // Transform the data to match our types
    const transformedData = purchasedServices?.map((ps) => ({
      id: ps.id,
      member_id: ps.member_id,
      service_id: ps.service_id,
      status: ps.status,
      sessions_total: ps.sessions_total,
      sessions_remaining: ps.sessions_remaining,
      purchase_date: ps.purchase_date,
      approved_date: ps.approved_date,
      cancelled_date: ps.cancelled_date,
      notes: ps.notes,
      created_at: ps.created_at,
      updated_at: ps.updated_at,
      service: ps.services ? {
        id: ps.services.id,
        name: ps.services.name,
        service_type: ps.services.service_type,
        session_type: ps.services.session_type,
        duration_minutes: ps.services.duration_minutes,
        price: parseFloat(ps.services.price),
        description: ps.services.description,
        requires_advance_booking: ps.services.requires_advance_booking,
        advance_booking_hours: ps.services.advance_booking_hours,
        max_sessions: ps.services.max_sessions,
        is_active: ps.services.is_active,
        display_order: ps.services.display_order,
        created_at: ps.services.created_at,
        updated_at: ps.services.updated_at,
      } : undefined,
    })) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
