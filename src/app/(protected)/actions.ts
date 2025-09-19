"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseServerClient, requireStaff } from "@/lib/auth";
import { createMemberSchema, updateMemberSchema } from "@/schemas/members";
import { planSchema } from "@/schemas/plans";
import { newsSchema } from "@/schemas/news";
import { scheduleSchema } from "@/schemas/schedule";
import type { ScheduleDay } from "@/types";

export type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; issues?: Record<string, string[]> };

async function appendAuditLog(actorId: string, action: string, entity: string, metadata?: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity,
    metadata: metadata ?? null,
  });
}

export async function signOutAction() {
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/login");
}

export async function createMemberAction(values: unknown): Promise<ActionResult> {
  const parsed = createMemberSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid data", issues: parsed.error.flatten().fieldErrors };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();
  const payload = {
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    status: parsed.data.status,
    plan_id: parsed.data.plan_id,
    expires_at: parsed.data.expires_at,
    notes: parsed.data.notes,
  };

  const { error } = await admin.from("members").insert(payload);

  if (error) {
    console.error("Failed to create member", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(staff.profile.id, "member.create", "members", { email: parsed.data.email });
  revalidatePath("/members");

  return { success: true, message: "Member created" };
}

export async function updateMemberAction(values: unknown): Promise<ActionResult> {
  const parsed = updateMemberSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid data", issues: parsed.error.flatten().fieldErrors };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const { id, ...rest } = parsed.data;
  const { error } = await admin.from("members").update(rest).eq("id", id);

  if (error) {
    console.error("Failed to update member", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(staff.profile.id, "member.update", "members", { id });
  revalidatePath(`/members/${id}`);
  revalidatePath("/members");

  return { success: true, message: "Member updated" };
}

export async function createPlanAction(values: unknown): Promise<ActionResult> {
  const parsed = planSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid data", issues: parsed.error.flatten().fieldErrors };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const { error } = await admin.from("membership_plans").insert(parsed.data);

  if (error) {
    console.error("Failed to create plan", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(staff.profile.id, "plan.create", "membership_plans", { name: parsed.data.name });
  revalidatePath("/plans");

  return { success: true, message: "Plan created" };
}

export async function updatePlanAction(values: unknown): Promise<ActionResult> {
  const parsed = planSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid data", issues: parsed.error.flatten().fieldErrors };
  }

  if (!parsed.data.id) {
    return { success: false, error: "Plan id is required" };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const { id, ...rest } = parsed.data;
  const { error } = await admin.from("membership_plans").update(rest).eq("id", id);

  if (error) {
    console.error("Failed to update plan", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(staff.profile.id, "plan.update", "membership_plans", { id });
  revalidatePath("/plans");

  return { success: true, message: "Plan updated" };
}

export async function deletePlanAction(id: string): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }
  const staff = await requireStaff();

  const { error } = await admin.from("membership_plans").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete plan", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(staff.profile.id, "plan.delete", "membership_plans", { id });
  revalidatePath("/plans");

  return { success: true, message: "Plan deleted" };
}

export async function saveScheduleAction(values: ScheduleDay[]): Promise<ActionResult> {
  const parsed = scheduleSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid schedule", issues: parsed.error.flatten().fieldErrors };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  // Convert ScheduleDay format to database schema
  const dbScheduleData = parsed.data.map((day) => ({
    // Convert from JS Date format (0=Sunday, 1=Monday) to database format (0=Monday, 6=Sunday)
    // JS: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
    // DB: 0=Mon,1=Tue,2=Wed,3=Thu,4=Fri,5=Sat,6=Sun
    day_of_week: day.weekday === 0 ? 6 : day.weekday - 1, // JS Sun(0)→DB Sun(6), JS Mon(1)→DB Mon(0)
    // Database requires non-null times, use defaults for closed days
    open_time: day.is_closed ? "00:00" : (day.opens_at || "06:00"),
    close_time: day.is_closed ? "00:00" : (day.closes_at || "22:00"),
    is_active: !day.is_closed, // Convert is_closed to is_active (inverse)
  }));

  console.log("Saving schedule data:", dbScheduleData);

  // Get existing records to update by ID
  const { data: existingRecords, error: fetchError } = await admin
    .from("gym_schedule")
    .select("id, day_of_week");

  if (fetchError) {
    console.error("Failed to fetch existing schedule", fetchError);
    return { success: false, error: fetchError.message };
  }

  // Update each day individually
  for (const dayData of dbScheduleData) {
    const existingRecord = existingRecords?.find(record => record.day_of_week === dayData.day_of_week);
    
    if (existingRecord) {
      // Update existing record
      const { error: updateError } = await admin
        .from("gym_schedule")
        .update({
          open_time: dayData.open_time,
          close_time: dayData.close_time,
          is_active: dayData.is_active
        })
        .eq("id", existingRecord.id);
        
      if (updateError) {
        console.error(`Failed to update day ${dayData.day_of_week}`, updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      // Insert new record
      const { error: insertError } = await admin
        .from("gym_schedule")
        .insert(dayData);
        
      if (insertError) {
        console.error(`Failed to insert day ${dayData.day_of_week}`, insertError);
        return { success: false, error: insertError.message };
      }
    }
  }

  await appendAuditLog(staff.profile.id, "schedule.save", "gym_schedule", {});
  revalidatePath("/schedule");

  return { success: true, message: "Schedule updated" };
}

export async function createNewsAction(values: unknown): Promise<ActionResult> {
  const parsed = newsSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid data", issues: parsed.error.flatten().fieldErrors };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const payload = {
    title: parsed.data.title,
    content: parsed.data.content,
    priority: parsed.data.priority === 'low' ? 1 : parsed.data.priority === 'medium' ? 2 : 3, // Convert to numeric
    end_date: parsed.data.expires_at,
    created_by: staff.user.id,
    is_active: true,
  };

  const { error } = await admin.from("announcements").insert(payload);

  if (error) {
    console.error("Failed to create news", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(staff.profile.id, "news.create", "announcements", { title: parsed.data.title });
  revalidatePath("/news");

  return { success: true, message: "News item created" };
}

export async function updateNewsAction(values: unknown): Promise<ActionResult> {
  const parsed = newsSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Invalid data", issues: parsed.error.flatten().fieldErrors };
  }

  if (!parsed.data.id) {
    return { success: false, error: "News id is required" };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const { id, ...rest } = parsed.data;
  const updatePayload = {
    title: rest.title,
    content: rest.content,
    priority: rest.priority === 'low' ? 1 : rest.priority === 'medium' ? 2 : 3, // Convert to numeric
    end_date: rest.expires_at,
  };
  const { error } = await admin.from("announcements").update(updatePayload).eq("id", id);

  if (error) {
    console.error("Failed to update news", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(staff.profile.id, "news.update", "announcements", { id });
  revalidatePath("/news");

  return { success: true, message: "News item updated" };
}

export async function deleteNewsAction(id: string): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const { error } = await admin.from("announcements").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete news", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(staff.profile.id, "news.delete", "announcements", { id });
  revalidatePath("/news");

  return { success: true, message: "News item deleted" };
}

export async function manualCheckoutAction(checkinId: string): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  // Get the checkin record to calculate duration
  const { data: checkin, error: getError } = await admin
    .from("checkins")
    .select("id, check_in_time, check_out_time")
    .eq("id", checkinId)
    .single();

  if (getError || !checkin) {
    console.error("Failed to get checkin", getError);
    return { success: false, error: "Check-in record not found" };
  }

  // Check if already checked out
  if (checkin.check_out_time) {
    return { success: false, error: "Member has already checked out" };
  }

  const now = new Date();
  const checkInTime = new Date(checkin.check_in_time);
  const durationMinutes = Math.floor((now.getTime() - checkInTime.getTime()) / (1000 * 60));

  // Update the checkin record with checkout time and duration
  const { error } = await admin
    .from("checkins")
    .update({
      check_out_time: now.toISOString(),
      duration_minutes: durationMinutes,
      updated_at: now.toISOString()
    })
    .eq("id", checkinId);

  if (error) {
    console.error("Failed to checkout member", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(staff.profile.id, "checkin.manual_checkout", "checkins", { 
    checkin_id: checkinId,
    duration_minutes: durationMinutes 
  });
  revalidatePath("/checkins");

  return { success: true, message: "Member checked out successfully" };
}
