"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireStaff } from "@/lib/auth";
import { 
  approvePurchasedServiceSchema, 
  cancelPurchasedServiceSchema, 
  deletePurchasedServiceSchema, 
  createPurchasedServiceSchema 
} from "@/schemas/services";
import { ActionResult, appendAuditLog } from "../lib/action-utils";

// ===== PURCHASED SERVICE ACTIONS =====

export async function approvePurchasedServiceAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = approvePurchasedServiceSchema.safeParse({
    id: formData.get("id"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, notes } = parsed.data;

  // Get the purchased service details before approval
  const { data: purchasedService, error: fetchError } = await admin
    .from("purchased_services")
    .select(`
      *,
      services (name)
    `)
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch purchased service", fetchError);
    return { success: false, error: "Purchased service not found" };
  }

  if (purchasedService.status !== "pending") {
    return { success: false, error: "Only pending services can be approved" };
  }

  // Update the purchased service status to approved
  const updateData: {
    status: string;
    approved_date: string;
    updated_at: string;
    notes?: string;
  } = {
    status: "approved",
    approved_date: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (notes) {
    updateData.notes = notes;
  }

  const { error } = await admin
    .from("purchased_services")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Failed to approve purchased service", error);
    return { success: false, error: error.message };
  }

  // Get member profile separately
  const { data: memberProfile } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", purchasedService.member_id)
    .single();

  const memberName = memberProfile 
    ? `${memberProfile.first_name || ''} ${memberProfile.last_name || ''}`.trim()
    : 'Unknown Member';

  // Log the approval
  await appendAuditLog(
    staff.profile.id,
    "purchased_service.approve",
    "purchased_services",
    id,
    { 
      service_name: purchasedService.services?.name,
      sessions_total: purchasedService.sessions_total,
      notes: notes 
    },
    `${purchasedService.services?.name} for ${memberName}`,
    {
      service_approved: {
        before: "Status: pending",
        after: "Status: approved"
      }
    }
  );

  revalidatePath("/services");
  return { success: true, message: "Purchased service approved successfully" };
}

export async function cancelPurchasedServiceAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = cancelPurchasedServiceSchema.safeParse({
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

  // Get the purchased service details before cancellation
  const { data: purchasedService, error: fetchError } = await admin
    .from("purchased_services")
    .select(`
      *,
      services (name)
    `)
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch purchased service", fetchError);
    return { success: false, error: "Purchased service not found" };
  }

  if (purchasedService.status === "cancelled") {
    return { success: false, error: "Service is already cancelled" };
  }

  // Check if there are active session bookings
  const { count, error: bookingError } = await admin
    .from("session_bookings")
    .select("*", { count: "exact", head: true })
    .eq("purchased_service_id", id)
    .in("status", ["pending", "upcoming"]);

  if (bookingError) {
    console.error("Failed to check session bookings", bookingError);
    return { success: false, error: "Failed to check active bookings" };
  }

  if (count && count > 0) {
    return { success: false, error: `Cannot cancel service with ${count} active booking(s). Please cancel the bookings first.` };
  }

  // Update the purchased service status to cancelled
  const { error } = await admin
    .from("purchased_services")
    .update({
      status: "cancelled",
      cancelled_date: new Date().toISOString(),
      notes: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to cancel purchased service", error);
    return { success: false, error: error.message };
  }

  // Get member profile separately
  const { data: memberProfile2 } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", purchasedService.member_id)
    .single();

  const memberName = memberProfile2 
    ? `${memberProfile2.first_name || ''} ${memberProfile2.last_name || ''}`.trim()
    : 'Unknown Member';

  // Log the cancellation
  await appendAuditLog(
    staff.profile.id,
    "purchased_service.cancel",
    "purchased_services",
    id,
    { 
      service_name: purchasedService.services?.name,
      sessions_remaining: purchasedService.sessions_remaining,
      reason: reason 
    },
    `${purchasedService.services?.name} for ${memberName}`,
    {
      service_cancelled: {
        before: `Status: ${purchasedService.status}`,
        after: "Status: cancelled"
      }
    }
  );

  revalidatePath("/services");
  return { success: true, message: "Purchased service cancelled successfully" };
}

export async function deletePurchasedServiceAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = deletePurchasedServiceSchema.safeParse({
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

  // Get the purchased service details before deletion
  const { data: purchasedService, error: fetchError } = await admin
    .from("purchased_services")
    .select(`
      *,
      services (name)
    `)
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch purchased service", fetchError);
    return { success: false, error: "Purchased service not found" };
  }

  if (purchasedService.status !== "cancelled") {
    return { success: false, error: "Only cancelled services can be deleted" };
  }

  // Check if there are any session bookings (even cancelled ones should be preserved for history)
  const { count, error: bookingError } = await admin
    .from("session_bookings")
    .select("*", { count: "exact", head: true })
    .eq("purchased_service_id", id);

  if (bookingError) {
    console.error("Failed to check session bookings", bookingError);
    return { success: false, error: "Failed to check session bookings" };
  }

  if (count && count > 0) {
    return { success: false, error: `Cannot delete service with ${count} session booking(s) in history. Please contact system administrator if deletion is necessary.` };
  }

  // Get member profile for audit log
  const { data: memberProfile } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", purchasedService.member_id)
    .single();

  const memberName = memberProfile 
    ? `${memberProfile.first_name || ''} ${memberProfile.last_name || ''}`.trim()
    : 'Unknown Member';

  // Delete the purchased service
  const { error } = await admin
    .from("purchased_services")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete purchased service", error);
    return { success: false, error: error.message };
  }

  // Log the deletion
  await appendAuditLog(
    staff.profile.id,
    "purchased_service.delete",
    "purchased_services",
    id,
    { 
      service_name: purchasedService.services?.name,
      sessions_total: purchasedService.sessions_total,
      sessions_remaining: purchasedService.sessions_remaining,
      original_status: purchasedService.status,
      purchase_date: purchasedService.purchase_date
    },
    `${purchasedService.services?.name} for ${memberName}`,
    {
      service_deleted: {
        before: `Cancelled service (${purchasedService.sessions_remaining}/${purchasedService.sessions_total} sessions remaining)`,
        after: "Service permanently deleted"
      }
    }
  );

  revalidatePath("/services");
  return { success: true, message: "Purchased service deleted successfully" };
}

export async function createPurchasedServiceAction(formData: FormData): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const parsed = createPurchasedServiceSchema.safeParse({
    member_id: formData.get("member_id"),
    service_id: formData.get("service_id"),
    sessions_total: formData.get("sessions_total"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { member_id, service_id, sessions_total, notes } = parsed.data;

  // Verify service exists and is active
  const { data: service, error: serviceError } = await admin
    .from("services")
    .select("name, is_active, max_sessions")
    .eq("id", service_id)
    .single();

  if (serviceError || !service) {
    return { success: false, error: "Service not found" };
  }

  if (!service.is_active) {
    return { success: false, error: "Cannot purchase inactive service" };
  }

  if (service.max_sessions && sessions_total > service.max_sessions) {
    return { success: false, error: `Maximum ${service.max_sessions} sessions allowed for this service` };
  }

  // Verify member exists
  const { data: member, error: memberError } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", member_id)
    .single();

  if (memberError || !member) {
    return { success: false, error: "Member not found" };
  }

  // Create the purchased service
  const purchaseData = {
    member_id,
    service_id,
    status: "pending" as const,
    sessions_total,
    sessions_remaining: sessions_total,
    purchase_date: new Date().toISOString(),
    notes: notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: newPurchase, error } = await admin
    .from("purchased_services")
    .insert(purchaseData)
    .select()
    .single();

  if (error) {
    console.error("Failed to create purchased service", error);
    return { success: false, error: error.message };
  }

  const memberName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown Member';

  // Log the purchase creation
  await appendAuditLog(
    staff.profile.id,
    "purchased_service.create",
    "purchased_services",
    newPurchase.id,
    {
      service_name: service.name,
      member_id,
      sessions_total,
      notes: notes || null,
    },
    `${service.name} for ${memberName}`,
    {
      purchase_created: {
        before: "No purchase",
        after: `${sessions_total} sessions (pending approval)`
      }
    }
  );

  revalidatePath("/services");
  return { success: true, message: "Purchase created successfully and pending approval" };
}
