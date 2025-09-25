"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireStaff } from "@/lib/auth";
import { 
  createServiceSchema, 
  updateServiceSchema, 
  createServiceBookingSchema, 
  updateServiceBookingSchema
} from "@/schemas/services";
import { ActionResult, appendAuditLog, BookingWithRelations } from "../lib/action-utils";
import { format } from "date-fns";

// ===== SERVICE ACTIONS =====

export async function createServiceAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = createServiceSchema.safeParse({
    name: formData.get("name"),
    service_type: formData.get("service_type"),
    session_type: formData.get("session_type") || undefined,
    duration_minutes: 60, // Always 60 minutes
    price: parseFloat(formData.get("price") as string) || 0,
    description: formData.get("description") || undefined,
    requires_advance_booking: formData.get("requires_advance_booking") === "true",
    advance_booking_hours: parseInt(formData.get("advance_booking_hours") as string) || 0,
    max_sessions: formData.get("max_sessions") ? parseInt(formData.get("max_sessions") as string) : undefined,
    is_active: formData.get("is_active") !== "false",
    display_order: parseInt(formData.get("display_order") as string) || 0,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { error, data } = await admin.from("services").insert([parsed.data]).select().single();

  if (error) {
    console.error("Failed to create service", error);
    return { success: false, error: error.message };
  }

  // Log the service creation
  await appendAuditLog(
    staff.profile.id,
    "service.create",
    "services",
    data.id,
    { service_type: parsed.data.service_type, price: parsed.data.price },
    parsed.data.name,
    {
      service_created: {
        before: "No service",
        after: `${parsed.data.name} (${parsed.data.service_type})`
      }
    }
  );

  revalidatePath("/services");
  return { success: true, message: "Service created successfully", data };
}

export async function updateServiceAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = updateServiceSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    service_type: formData.get("service_type"),
    session_type: formData.get("session_type") || undefined,
    duration_minutes: 60, // Always 60 minutes
    price: formData.get("price") ? parseFloat(formData.get("price") as string) : undefined,
    description: formData.get("description") || undefined,
    requires_advance_booking: formData.get("requires_advance_booking") === "true",
    advance_booking_hours: formData.get("advance_booking_hours") ? parseInt(formData.get("advance_booking_hours") as string) : undefined,
    max_sessions: formData.get("max_sessions") ? parseInt(formData.get("max_sessions") as string) : undefined,
    is_active: formData.get("is_active") !== "false",
    display_order: formData.get("display_order") ? parseInt(formData.get("display_order") as string) : undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, ...rest } = parsed.data;

  // Get current service for comparison
  const { data: currentService, error: fetchError } = await admin
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch current service", fetchError);
    return { success: false, error: "Failed to fetch current service" };
  }

  // Update the service
  const { error, data } = await admin
    .from("services")
    .update({ ...rest, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update service", error);
    return { success: false, error: error.message };
  }

  // Track changes for audit log
  const changes: Record<string, { before: unknown; after: unknown }> = {};

  if (currentService.name !== rest.name && rest.name !== undefined) {
    changes.name = { before: currentService.name, after: rest.name };
  }
  if (currentService.service_type !== rest.service_type && rest.service_type !== undefined) {
    changes.service_type = { before: currentService.service_type, after: rest.service_type };
  }
  if (currentService.price !== rest.price && rest.price !== undefined) {
    changes.price = { 
      before: `${currentService.price} RON`, 
      after: `${rest.price} RON` 
    };
  }
  if (currentService.duration_minutes !== rest.duration_minutes && rest.duration_minutes !== undefined) {
    changes.duration = { 
      before: `${currentService.duration_minutes} minutes`, 
      after: `${rest.duration_minutes} minutes` 
    };
  }
  if (currentService.is_active !== rest.is_active && rest.is_active !== undefined) {
    changes.status = { 
      before: currentService.is_active ? "Active" : "Inactive",
      after: rest.is_active ? "Active" : "Inactive"
    };
  }

  // Log the service update if there are changes
  if (Object.keys(changes).length > 0) {
    await appendAuditLog(
      staff.profile.id,
      "service.update",
      "services",
      data.id,
      { changes_count: Object.keys(changes).length },
      data.name,
      changes
    );
  }

  revalidatePath("/services");
  return { success: true, message: "Service updated successfully", data };
}

export async function deleteServiceAction(serviceId: string): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  // Get service details before deletion
  const { data: serviceToDelete, error: fetchError } = await admin
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .single();

  if (fetchError) {
    console.error("Failed to fetch service", fetchError);
    return { success: false, error: "Service not found" };
  }

  // Check if service has active bookings
  const { count, error: bookingError } = await admin
    .from("service_bookings")
    .select("*", { count: "exact", head: true })
    .eq("service_id", serviceId)
    .eq("status", "upcoming");

  if (bookingError) {
    console.error("Failed to check service bookings", bookingError);
    return { success: false, error: "Failed to check service bookings" };
  }

  if (count && count > 0) {
    return { success: false, error: `Cannot delete service with ${count} upcoming booking(s)` };
  }

  // Delete the service
  const { error } = await admin.from("services").delete().eq("id", serviceId);

  if (error) {
    console.error("Failed to delete service", error);
    return { success: false, error: error.message };
  }

  // Log the service deletion
  await appendAuditLog(
    staff.profile.id,
    "service.delete",
    "services",
    serviceId,
    { service_type: serviceToDelete.service_type, price: serviceToDelete.price },
    serviceToDelete.name,
    {
      service_deleted: {
        before: `${serviceToDelete.name} (${serviceToDelete.service_type})`,
        after: "Service deleted"
      }
    }
  );

  revalidatePath("/services");
  return { success: true, message: "Service deleted successfully" };
}

// ===== SERVICE BOOKING ACTIONS =====

export async function createServiceBookingAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = createServiceBookingSchema.safeParse({
    service_id: formData.get("service_id"),
    member_id: formData.get("member_id"),
    booking_date: formData.get("booking_date"),
    status: formData.get("status") || "upcoming",
    sessions_remaining: formData.get("sessions_remaining") ? parseInt(formData.get("sessions_remaining") as string) : undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { error, data } = await admin.from("service_bookings").insert([parsed.data]).select().single();

  if (error) {
    console.error("Failed to create service booking", error);
    return { success: false, error: error.message };
  }

  // Log the booking creation
  await appendAuditLog(
    staff.profile.id,
    "booking.create",
    "service_bookings",
    data.id,
    { service_id: parsed.data.service_id, member_id: parsed.data.member_id, booking_date: parsed.data.booking_date },
    `Service Booking ${data.id}`,
    {
      booking_created: {
        before: "No booking",
        after: `Booking for ${parsed.data.booking_date}`
      }
    }
  );

  revalidatePath("/services");
  return { success: true, message: "Service booking created successfully", data };
}

export async function updateServiceBookingAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = updateServiceBookingSchema.safeParse({
    id: formData.get("id"),
    service_id: formData.get("service_id"),
    member_id: formData.get("member_id"),
    booking_date: formData.get("booking_date"),
    status: formData.get("status"),
    sessions_remaining: formData.get("sessions_remaining") ? parseInt(formData.get("sessions_remaining") as string) : undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, ...rest } = parsed.data;

  const { error, data } = await admin
    .from("service_bookings")
    .update({ ...rest, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update service booking", error);
    return { success: false, error: error.message };
  }

  // Log the booking update
  await appendAuditLog(
    staff.profile.id,
    "booking.update",
    "service_bookings",
    data.id,
    { status: rest.status },
    `Service Booking ${data.id}`,
    {
      booking_updated: {
        before: "Previous booking details",
        after: "Updated booking details"
      }
    }
  );

  revalidatePath("/services");
  return { success: true, message: "Service booking updated successfully", data };
}

export async function deleteServiceBookingAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();
  const id = formData.get("id") as string;

  if (!id) {
    return { success: false, error: "Booking ID is required" };
  }

  // Fetch booking details before deletion for audit log
  const { data: bookingToDelete, error: fetchError } = await admin
    .from("service_bookings")
    .select(`
      *,
      services (name),
      profiles (first_name, last_name, email)
    `)
    .eq("id", id)
    .single();

  if (fetchError || !bookingToDelete) {
    return { success: false, error: "Booking not found" };
  }

  // Only allow deletion of cancelled bookings
  if (bookingToDelete.status !== "cancelled") {
    return { success: false, error: "Only cancelled bookings can be deleted" };
  }

  const { error } = await admin
    .from("service_bookings")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete service booking", error);
    return { success: false, error: error.message };
  }

  // Construct member full name
  const bookingData = bookingToDelete as BookingWithRelations;
  const memberName = bookingData.profiles ? 
    `${bookingData.profiles.first_name || ""} ${bookingData.profiles.last_name || ""}`.trim() :
    "Unknown Member";

  // Log the booking deletion
  await appendAuditLog(
    staff.profile.id,
    "booking.delete",
    "service_bookings",
    id,
    { status: bookingToDelete.status },
    `Service Booking - ${bookingData.services?.name} for ${memberName}`,
    {
      booking_deleted: {
        before: `${bookingData.services?.name} booking for ${memberName} on ${format(new Date(bookingToDelete.booking_date), "PPp")}`,
        after: "Deleted"
      }
    }
  );

  revalidatePath("/services");
  return { success: true, message: "Service booking deleted successfully" };
}

export async function cancelServiceBookingAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();
  const id = formData.get("id") as string;

  if (!id) {
    return { success: false, error: "Booking ID is required" };
  }

  // Fetch booking details before cancellation for audit log
  const { data: bookingToCancel, error: fetchError } = await admin
    .from("service_bookings")
    .select(`
      *,
      services (name),
      profiles (first_name, last_name, email)
    `)
    .eq("id", id)
    .single();

  if (fetchError || !bookingToCancel) {
    return { success: false, error: "Booking not found" };
  }

  // Only allow cancellation of upcoming bookings
  if (bookingToCancel.status !== "upcoming") {
    return { success: false, error: "Only upcoming bookings can be cancelled" };
  }

  const { error } = await admin
    .from("service_bookings")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Failed to cancel service booking", error);
    return { success: false, error: error.message };
  }

  // Construct member full name
  const cancelBookingData = bookingToCancel as BookingWithRelations;
  const memberName = cancelBookingData.profiles ? 
    `${cancelBookingData.profiles.first_name || ""} ${cancelBookingData.profiles.last_name || ""}`.trim() :
    "Unknown Member";

  // Log the booking cancellation
  await appendAuditLog(
    staff.profile.id,
    "booking.cancel",
    "service_bookings",
    id,
    { status: bookingToCancel.status },
    `Service Booking - ${cancelBookingData.services?.name} for ${memberName}`,
    {
      booking_cancelled: {
        before: `Status: upcoming`,
        after: `Status: cancelled`
      }
    }
  );

  revalidatePath("/services");
  return { success: true, message: "Service booking cancelled successfully" };
}
