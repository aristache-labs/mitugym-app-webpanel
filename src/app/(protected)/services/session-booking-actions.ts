"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireStaff } from "@/lib/auth";
import { 
  confirmSessionBookingSchema, 
  completeSessionBookingSchema, 
  cancelSessionBookingSchema 
} from "@/schemas/services";
import { ActionResult, appendAuditLog } from "../lib/action-utils";

// ===== SESSION BOOKING ACTIONS =====

export async function confirmSessionBookingAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = confirmSessionBookingSchema.safeParse({
    id: formData.get("id"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, notes } = parsed.data;

  // Get the booking details before confirmation
  const { data: booking, error: fetchError } = await admin
    .from("session_bookings")
    .select(`
      *,
      purchased_services (
        services (name)
      )
    `)
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch session booking", fetchError);
    return { success: false, error: "Session booking not found" };
  }

  if (booking.status !== "pending") {
    return { success: false, error: "Only pending bookings can be confirmed" };
  }

  // Update the booking status to confirmed
  const updateData = {
    status: "confirmed",
    notes: notes || booking.notes,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("session_bookings")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Failed to confirm session booking", error);
    return { success: false, error: error.message };
  }

  // Get member profile separately
  const { data: memberProfile } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", booking.member_id)
    .single();

  const memberName = memberProfile 
    ? `${memberProfile.first_name || ''} ${memberProfile.last_name || ''}`.trim()
    : 'Unknown Member';

  const serviceName = booking.purchased_services?.services?.name || 'Unknown Service';

  // Log the confirmation
  await appendAuditLog(
    staff.profile.id,
    "session_booking.confirm",
    "session_bookings",
    id,
    { 
      service_name: serviceName,
      booking_date: booking.booking_date,
      original_status: booking.status,
      notes: notes || null,
    },
    `${serviceName} for ${memberName}`,
    {
      booking_confirmed: {
        before: "Status: pending",
        after: "Status: confirmed"
      }
    }
  );

  revalidatePath("/bookings");
  return { success: true, message: "Session booking confirmed successfully" };
}

export async function completeSessionBookingAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = completeSessionBookingSchema.safeParse({
    id: formData.get("id"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, notes } = parsed.data;

  // Get the booking details before completion
  const { data: booking, error: fetchError } = await admin
    .from("session_bookings")
    .select(`
      *,
      purchased_services (
        services (name)
      )
    `)
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch session booking", fetchError);
    return { success: false, error: "Session booking not found" };
  }

  if (!["confirmed", "upcoming"].includes(booking.status)) {
    return { success: false, error: "Only confirmed or upcoming bookings can be completed" };
  }

  // Update the booking status to completed
  const updateData = {
    status: "completed",
    notes: notes || booking.notes,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("session_bookings")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Failed to complete session booking", error);
    return { success: false, error: error.message };
  }

  // Get member profile separately
  const { data: memberProfile } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", booking.member_id)
    .single();

  const memberName = memberProfile 
    ? `${memberProfile.first_name || ''} ${memberProfile.last_name || ''}`.trim()
    : 'Unknown Member';

  const serviceName = booking.purchased_services?.services?.name || 'Unknown Service';

  // Log the completion
  await appendAuditLog(
    staff.profile.id,
    "session_booking.complete",
    "session_bookings",
    id,
    { 
      service_name: serviceName,
      booking_date: booking.booking_date,
      original_status: booking.status,
      notes: notes || null,
    },
    `${serviceName} for ${memberName}`,
    {
      booking_completed: {
        before: `Status: ${booking.status}`,
        after: "Status: completed"
      }
    }
  );

  revalidatePath("/bookings");
  return { success: true, message: "Session booking completed successfully" };
}

export async function cancelSessionBookingAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = cancelSessionBookingSchema.safeParse({
    id: formData.get("id"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, reason } = parsed.data;

  // Get the booking details before cancellation
  const { data: booking, error: fetchError } = await admin
    .from("session_bookings")
    .select(`
      *,
      purchased_services (
        services (name)
      )
    `)
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch session booking", fetchError);
    return { success: false, error: "Session booking not found" };
  }

  if (booking.status === "completed") {
    return { success: false, error: "Completed bookings cannot be cancelled" };
  }

  if (booking.status === "cancelled") {
    return { success: false, error: "Booking is already cancelled" };
  }

  // Update the booking status to cancelled
  const updateData = {
    status: "cancelled",
    notes: reason,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("session_bookings")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Failed to cancel session booking", error);
    return { success: false, error: error.message };
  }

  // Get member profile separately
  const { data: memberProfile } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", booking.member_id)
    .single();

  const memberName = memberProfile 
    ? `${memberProfile.first_name || ''} ${memberProfile.last_name || ''}`.trim()
    : 'Unknown Member';

  const serviceName = booking.purchased_services?.services?.name || 'Unknown Service';

  // Log the cancellation
  await appendAuditLog(
    staff.profile.id,
    "session_booking.cancel",
    "session_bookings",
    id,
    { 
      service_name: serviceName,
      booking_date: booking.booking_date,
      original_status: booking.status,
      cancellation_reason: reason,
    },
    `${serviceName} for ${memberName}`,
    {
      booking_cancelled: {
        before: `Status: ${booking.status}`,
        after: "Status: cancelled"
      }
    }
  );

  revalidatePath("/bookings");
  return { success: true, message: "Session booking cancelled successfully" };
}
