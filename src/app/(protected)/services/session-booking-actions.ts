"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireStaff } from "@/lib/auth";
import { 
  createServiceBookingSchema,
  confirmSessionBookingSchema, 
  completeSessionBookingSchema, 
  cancelSessionBookingSchema,
  updateSessionBookingSchema,
  deleteSessionBookingSchema 
} from "@/schemas/services";
import { ActionResult, appendAuditLog } from "../lib/action-utils";

// ===== SESSION BOOKING ACTIONS =====

export async function createSessionBookingAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = createServiceBookingSchema.safeParse({
    purchased_service_id: formData.get("purchased_service_id"),
    member_id: formData.get("member_id"),
    booking_date: formData.get("booking_date"),
    status: formData.get("status") || "pending",
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { purchased_service_id, member_id, booking_date, status, notes } = parsed.data;

  // Convert datetime-local format to ISO string if needed
  let isoBookingDate = booking_date;
  if (booking_date.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
    isoBookingDate = new Date(booking_date).toISOString();
  }

  // Get purchased service and member details for validation and audit log
  const [purchasedServiceResult, memberResult] = await Promise.all([
    admin.from("purchased_services").select(`
      *,
      services (name, is_active)
    `).eq("id", purchased_service_id).single(),
    admin.from("profiles").select("first_name, last_name").eq("id", member_id).single()
  ]);

  if (purchasedServiceResult.error) {
    return { success: false, error: "Purchased service not found" };
  }

  if (memberResult.error) {
    return { success: false, error: "Member not found" };
  }

  if (!purchasedServiceResult.data.services?.is_active) {
    return { success: false, error: "Service is not active" };
  }

  if (purchasedServiceResult.data.status !== 'approved') {
    return { success: false, error: "Purchased service is not approved" };
  }

  if (purchasedServiceResult.data.sessions_remaining <= 0) {
    return { success: false, error: "No sessions remaining for this service" };
  }

  // Create the session booking
  const { data: booking, error } = await admin
    .from("session_bookings")
    .insert({
      purchased_service_id,
      member_id,
      booking_date: isoBookingDate,
      status,
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create session booking", error);
    return { success: false, error: error.message };
  }

  // Note: Session management is handled automatically by database trigger
  // No manual session decrementing needed

  const memberName = `${memberResult.data.first_name || ''} ${memberResult.data.last_name || ''}`.trim() || 'Unknown Member';
  const serviceName = purchasedServiceResult.data.services?.name || 'Unknown Service';

  // Log the creation
  await appendAuditLog(
    staff.profile.id,
    "session_booking.create",
    "session_bookings",
    booking.id,
    { 
      service_name: serviceName,
      booking_date: isoBookingDate,
      status,
      notes: notes || null,
    },
    `${serviceName} for ${memberName}`,
    {
      booking_created: {
        before: null,
        after: `Status: ${status}, Date: ${isoBookingDate}`
      }
    }
  );

  revalidatePath("/bookings");
  return { success: true, message: "Session booking created successfully" };
}

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

  // Update the booking status to upcoming
  const updateData = {
    status: "upcoming",
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

  // Note: Session management is handled automatically by database trigger
  // Trigger decrements sessions when status changes from pending to upcoming

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
        after: "Status: upcoming"
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
    completed_date: new Date().toISOString(),
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

  // Note: Session was already decremented when booking was confirmed
  // Completing a booking doesn't consume additional sessions

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
    cancelled_date: new Date().toISOString(),
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

  // Note: Session management is handled automatically by database trigger
  // Trigger increments sessions when status changes from upcoming to cancelled

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

export async function updateSessionBookingAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = updateSessionBookingSchema.safeParse({
    id: formData.get("id"),
    booking_date: formData.get("booking_date"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, booking_date, status, notes } = parsed.data;

  // Get the booking details before update
  const { data: existingBooking, error: fetchError } = await admin
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
    console.error("Failed to fetch session booking:", fetchError);
    return { success: false, error: "Failed to fetch booking details" };
  }

  if (!existingBooking) {
    return { success: false, error: "Session booking not found" };
  }

  // Get member details for audit log
  const { data: memberData } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", existingBooking.member_id)
    .single();

  const memberName = memberData 
    ? `${memberData.first_name || ''} ${memberData.last_name || ''}`.trim() || 'Unknown Member'
    : 'Unknown Member';

  const serviceName = existingBooking.purchased_services?.services?.name || 'Unknown Service';

  // Build update object with only changed fields
  const updateData: Record<string, unknown> = {};
  const changes: Record<string, { before: unknown, after: unknown }> = {};

  if (booking_date && booking_date !== existingBooking.booking_date) {
    updateData.booking_date = booking_date;
    changes.booking_date = {
      before: existingBooking.booking_date,
      after: booking_date
    };
  }

  if (status && status !== existingBooking.status) {
    updateData.status = status;
    changes.status = {
      before: existingBooking.status,
      after: status
    };
  }

  if (notes !== undefined && notes !== existingBooking.notes) {
    updateData.notes = notes || null;
    changes.notes = {
      before: existingBooking.notes,
      after: notes || null
    };
  }

  // If no changes, return success
  if (Object.keys(updateData).length === 0) {
    return { success: true, message: "No changes to update" };
  }

  updateData.updated_at = new Date().toISOString();

  // Update the session booking
  const { error: updateError } = await admin
    .from("session_bookings")
    .update(updateData)
    .eq("id", id);

  if (updateError) {
    console.error("Failed to update session booking:", updateError);
    return { success: false, error: "Failed to update session booking" };
  }

  // Log the audit trail
  await appendAuditLog(
    staff.profile.id,
    "session_booking.update",
    "session_booking",
    id,
    {
      booking_date: booking_date,
      member_id: existingBooking.member_id,
      service_id: existingBooking.purchased_services?.services?.id,
    },
    `${serviceName} for ${memberName}`,
    changes
  );

  revalidatePath("/bookings");
  return { success: true, message: "Session booking updated successfully" };
}

export async function deleteSessionBookingAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = deleteSessionBookingSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { id } = parsed.data;

  // Get booking details for audit log before deletion
  const { data: existingBooking, error: fetchError } = await admin
    .from("session_bookings")
    .select(`
      *,
      purchased_services (
        services (name)
      )
    `)
    .eq("id", id)
    .single();

  if (fetchError || !existingBooking) {
    return { success: false, error: "Session booking not found" };
  }

  // Only allow deletion of cancelled bookings
  if (existingBooking.status !== "cancelled") {
    return { success: false, error: "Only cancelled bookings can be deleted" };
  }

  // Get member details for audit log
  const { data: memberData } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", existingBooking.member_id)
    .single();

  // Delete the session booking
  const { error: deleteError } = await admin
    .from("session_bookings")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Failed to delete session booking", deleteError);
    return { success: false, error: deleteError.message };
  }

  const memberName = memberData 
    ? `${memberData.first_name || ''} ${memberData.last_name || ''}`.trim() || 'Unknown Member'
    : 'Unknown Member';
  const serviceName = existingBooking.purchased_services?.services?.name || 'Unknown Service';

  // Log the deletion
  await appendAuditLog(
    staff.profile.id,
    "session_booking.delete",
    "session_bookings",
    id,
    { 
      service_name: serviceName,
      booking_date: existingBooking.booking_date,
      status: existingBooking.status,
      notes: existingBooking.notes,
    },
    `${serviceName} for ${memberName}`,
    {
      booking_deleted: {
        before: `Status: ${existingBooking.status}, Date: ${existingBooking.booking_date}`,
        after: "DELETED"
      }
    }
  );

  revalidatePath("/bookings");
  return { success: true, message: "Session booking deleted successfully" };
}
