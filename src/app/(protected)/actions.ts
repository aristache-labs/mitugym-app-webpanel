"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseServerClient, requireStaff } from "@/lib/auth";
import { createMemberSchema, updateMemberSchema } from "@/schemas/members";
import { planSchema } from "@/schemas/plans";
import { newsSchema } from "@/schemas/news";
import { scheduleSchema } from "@/schemas/schedule";
import { createServiceSchema, updateServiceSchema, createServiceBookingSchema, updateServiceBookingSchema } from "@/schemas/services";
import type { ScheduleDay } from "@/types";
import { format } from "date-fns";

export type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; issues?: Record<string, string[]> };

// Special entity IDs for system-wide operations
const SYSTEM_ENTITY_IDS = {
  GYM_SCHEDULE: "00000000-0000-0000-0000-000000000001",
  SYSTEM_SETTINGS: "00000000-0000-0000-0000-000000000002",
  BULK_OPERATIONS: "00000000-0000-0000-0000-000000000003",
} as const;

async function appendAuditLog(
  actorId: string, 
  action: string, 
  entity: string, 
  entityId?: string, 
  meta?: Record<string, unknown>,
  resourceName?: string,
  changes?: Record<string, { before: unknown, after: unknown }>
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  
  await supabase.rpc('log_detailed_audit', {
    p_actor_id: actorId,
    p_action: action,
    p_entity: entity,
    p_entity_id: entityId ?? null,
    p_resource_name: resourceName ?? null,
    p_changes: changes ? changes : null, // Send as object, not JSON string
    p_meta: meta ? meta : null, // Send as object, not JSON string
    p_ip_address: null, // We can add this later with request headers
    p_user_agent: null  // We can add this later with request headers
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

  // Combine first_name and last_name for display purposes
  const full_name = `${parsed.data.first_name} ${parsed.data.last_name}`.trim();

  try {
    // 1. Create Supabase auth user
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password || generateRandomPassword(),
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        display_name: full_name,
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
      }
    });

    if (authError) {
      console.error("Failed to create auth user", authError);
      return { success: false, error: `Failed to create user account: ${authError.message}` };
    }

    if (!authUser.user) {
      return { success: false, error: "Failed to create user account" };
    }

    // 2. Create/update profile record with correct field mapping
    // Let the database trigger handle status calculation automatically
    const profilePayload = {
      id: authUser.user.id, // Use the auth user ID
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      gender: parsed.data.gender,
      email: parsed.data.email,
      phone: parsed.data.phone,
      membership_status: parsed.data.status, // Send original status, let trigger calculate
      membership_plan: parsed.data.plan_id,
      plan_start_date: parsed.data.starts_at,
      expiry_date: parsed.data.expires_at,
    };

    const { error: profileError } = await admin
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileError) {
      console.error("Failed to create profile", profileError);
      // If profile creation fails, clean up the auth user
      await admin.auth.admin.deleteUser(authUser.user.id);
      return { success: false, error: `Failed to create profile: ${profileError.message}` };
    }

    // After successful creation, refresh the member's status based on plan timing
    const { error: statusError } = await admin.rpc('refresh_member_status', {
      member_id: authUser.user.id
    });

    if (statusError) {
      console.warn("Failed to refresh member status", statusError);
      // Don't fail the whole operation, just log the warning
    }

    await appendAuditLog(
      staff.profile.id, 
      "member.create", 
      "profiles", 
      authUser.user.id, 
      { 
        email: parsed.data.email,
        plan_id: parsed.data.plan_id,
        status: parsed.data.status
      },
      full_name, // resource name
      {
        member_created: {
          before: null,
          after: {
            name: full_name,
            email: parsed.data.email,
            status: parsed.data.status,
            plan_start: parsed.data.starts_at
          }
        }
      }
    );
    revalidatePath("/members");

    return { success: true, message: "Member created successfully" };

  } catch (error) {
    console.error("Unexpected error creating member", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Helper function to generate a random password
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
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

  // Get current member data for comparison
  const { data: currentMember, error: fetchError } = await admin
    .from("profiles")
    .select("first_name, last_name, gender, email, phone, membership_status, membership_plan, plan_start_date, expiry_date")
    .eq("id", parsed.data.id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch current member data", fetchError);
    return { success: false, error: "Failed to fetch current member data" };
  }

  // Combine first_name and last_name for audit logs
  const full_name = `${parsed.data.first_name} ${parsed.data.last_name}`.trim();

  // Map fields to profiles table structure
  // Let the database trigger handle status calculation automatically
  const profilePayload = {
    first_name: parsed.data.first_name,
    last_name: parsed.data.last_name,
    gender: parsed.data.gender,
    email: parsed.data.email,
    phone: parsed.data.phone,
    membership_status: parsed.data.status, // Send original status, let trigger calculate
    membership_plan: parsed.data.plan_id,
    plan_start_date: parsed.data.starts_at,
    expiry_date: parsed.data.expires_at,
  };

  const { error } = await admin
    .from("profiles")
    .update(profilePayload)
    .eq("id", parsed.data.id);

  if (error) {
    console.error("Failed to update member", error);
    return { success: false, error: error.message };
  }

  // After successful update, refresh the member's status based on plan timing
  const { error: statusError } = await admin.rpc('refresh_member_status', {
    member_id: parsed.data.id
  });

  if (statusError) {
    console.warn("Failed to refresh member status", statusError);
    // Don't fail the whole operation, just log the warning
  }

  // Create detailed change tracking
  const changes: Record<string, { before: unknown, after: unknown }> = {};
  
  if (currentMember.first_name !== parsed.data.first_name) {
    changes.first_name = { before: currentMember.first_name, after: parsed.data.first_name };
  }
  if (currentMember.last_name !== parsed.data.last_name) {
    changes.last_name = { before: currentMember.last_name, after: parsed.data.last_name };
  }
  if (currentMember.email !== parsed.data.email) {
    changes.email = { before: currentMember.email, after: parsed.data.email };
  }
  if (currentMember.phone !== parsed.data.phone) {
    changes.phone = { before: currentMember.phone, after: parsed.data.phone };
  }
  if (currentMember.gender !== parsed.data.gender) {
    changes.gender = { before: currentMember.gender, after: parsed.data.gender };
  }
  if (currentMember.membership_status !== parsed.data.status) {
    changes.status = { before: currentMember.membership_status, after: parsed.data.status };
  }
  if (currentMember.membership_plan !== parsed.data.plan_id) {
    changes.plan = { before: currentMember.membership_plan, after: parsed.data.plan_id };
  }
  if (currentMember.plan_start_date !== parsed.data.starts_at) {
    changes.plan_start = { before: currentMember.plan_start_date, after: parsed.data.starts_at };
  }
  if (currentMember.expiry_date !== parsed.data.expires_at) {
    changes.plan_expiry = { before: currentMember.expiry_date, after: parsed.data.expires_at };
  }

  await appendAuditLog(
    staff.profile.id, 
    "member.update", 
    "profiles", 
    parsed.data.id, 
    { 
      id: parsed.data.id,
      changes_count: Object.keys(changes).length
    },
    full_name, // resource name
    changes // detailed changes
  );
  
  revalidatePath(`/members/${parsed.data.id}`);
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

  await appendAuditLog(
    staff.profile.id, 
    "plan.create", 
    "membership_plans", 
    undefined, 
    { 
      name: parsed.data.name,
      price: parsed.data.price,
      duration_months: parsed.data.duration_months
    },
    parsed.data.name, // resource name
    {
      plan_created: {
        before: null,
        after: {
          name: parsed.data.name,
          price: parsed.data.price,
          duration_months: parsed.data.duration_months,
          features: parsed.data.features
        }
      }
    }
  );
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

  // Get current plan data for comparison
  const { data: currentPlan, error: fetchError } = await admin
    .from("membership_plans")
    .select("name, price, duration_months, features, is_active, display_order")
    .eq("id", parsed.data.id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch current plan data", fetchError);
    return { success: false, error: "Failed to fetch current plan data" };
  }

  const { id, ...rest } = parsed.data;
  const { error } = await admin.from("membership_plans").update(rest).eq("id", id);

  if (error) {
    console.error("Failed to update plan", error);
    return { success: false, error: error.message };
  }

  // Create detailed change tracking
  const changes: Record<string, { before: unknown, after: unknown }> = {};
  
  if (currentPlan.name !== rest.name) {
    changes.name = { before: currentPlan.name, after: rest.name };
  }
  if (currentPlan.price !== rest.price) {
    changes.price = { before: `${currentPlan.price} RON`, after: `${rest.price} RON` };
  }
  if (currentPlan.duration_months !== rest.duration_months) {
    changes.duration = { 
      before: currentPlan.duration_months === 0 ? "1 day" : `${currentPlan.duration_months} month(s)`,
      after: rest.duration_months === 0 ? "1 day" : `${rest.duration_months} month(s)`
    };
  }
  if (JSON.stringify(currentPlan.features) !== JSON.stringify(rest.features)) {
    const beforeFeatures = currentPlan.features || [];
    const afterFeatures = rest.features || [];
    
    // Show actual feature lists (truncated if too long)
    const formatFeatures = (features: string[]) => {
      if (features.length === 0) return "No features";
      if (features.length <= 3) return features.join(", ");
      return `${features.slice(0, 3).join(", ")} (+${features.length - 3} more)`;
    };
    
    changes.features = { 
      before: formatFeatures(beforeFeatures),
      after: formatFeatures(afterFeatures)
    };
  }
  if (currentPlan.is_active !== rest.is_active) {
    changes.status = { 
      before: currentPlan.is_active ? "Active" : "Inactive",
      after: rest.is_active ? "Active" : "Inactive"
    };
  }
  if (currentPlan.display_order !== rest.display_order) {
    changes.display_order = { before: currentPlan.display_order, after: rest.display_order };
  }

  await appendAuditLog(
    staff.profile.id, 
    "plan.update", 
    "membership_plans", 
    id, 
    { 
      id,
      changes_count: Object.keys(changes).length
    },
    rest.name, // resource name
    changes // detailed changes
  );
  revalidatePath("/plans");

  return { success: true, message: "Plan updated" };
}

export async function deletePlanAction(id: string): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }
  const staff = await requireStaff();

  // Get plan details before deletion for audit log
  const { data: planToDelete, error: fetchError } = await admin
    .from("membership_plans")
    .select("name, price, duration_months")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch plan for deletion", fetchError);
    return { success: false, error: "Failed to fetch plan data" };
  }

  const { error } = await admin.from("membership_plans").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete plan", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(
    staff.profile.id, 
    "plan.delete", 
    "membership_plans", 
    id, 
    { id },
    planToDelete.name, // resource name
    {
      plan_deleted: {
        before: {
          name: planToDelete.name,
          price: `${planToDelete.price} RON`,
          duration: planToDelete.duration_months === 0 ? "1 day" : `${planToDelete.duration_months} month(s)`,
          status: "active"
        },
        after: null
      }
    }
  );
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

  // Get current schedule for change tracking
  const { data: currentSchedule, error: currentFetchError } = await admin
    .from("gym_schedule")
    .select("day_of_week, open_time, close_time, is_active")
    .order("day_of_week");

  if (currentFetchError) {
    console.error("Failed to fetch current schedule", currentFetchError);
    return { success: false, error: currentFetchError.message };
  }

  // Helper function to get day name
  const getDayName = (dbDayOfWeek: number): string => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days[dbDayOfWeek] || `Day ${dbDayOfWeek}`;
  };

  // Helper function to format time for display
  const formatTime = (time: string, isActive: boolean): string => {
    if (!isActive) return "Closed";
    return time === "00:00" ? "Closed" : time.substring(0, 5);
  };

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

  // Track changes for audit log
  const changes: Record<string, { before: unknown, after: unknown }> = {};
  let changedDaysCount = 0;

  // Get existing records to update by ID
  const { data: existingRecords, error: fetchError } = await admin
    .from("gym_schedule")
    .select("id, day_of_week");

  if (fetchError) {
    console.error("Failed to fetch existing schedule", fetchError);
    return { success: false, error: fetchError.message };
  }

  // Update each day individually and track changes
  for (const dayData of dbScheduleData) {
    const existingRecord = existingRecords?.find(record => record.day_of_week === dayData.day_of_week);
    const currentDaySchedule = currentSchedule?.find(record => record.day_of_week === dayData.day_of_week);
    
    // Check if this day has changes
    if (currentDaySchedule) {
      const dayName = getDayName(dayData.day_of_week);
      let dayChanged = false;

      // Check if opening time changed
      if (currentDaySchedule.open_time !== dayData.open_time || currentDaySchedule.is_active !== dayData.is_active) {
        const beforeTime = formatTime(currentDaySchedule.open_time, currentDaySchedule.is_active);
        const afterTime = formatTime(dayData.open_time, dayData.is_active);
        if (beforeTime !== afterTime) {
          changes[`${dayName.toLowerCase()}_open`] = {
            before: beforeTime,
            after: afterTime
          };
          dayChanged = true;
        }
      }

      // Check if closing time changed
      if (currentDaySchedule.close_time !== dayData.close_time || currentDaySchedule.is_active !== dayData.is_active) {
        const beforeTime = formatTime(currentDaySchedule.close_time, currentDaySchedule.is_active);
        const afterTime = formatTime(dayData.close_time, dayData.is_active);
        if (beforeTime !== afterTime) {
          changes[`${dayName.toLowerCase()}_close`] = {
            before: beforeTime,
            after: afterTime
          };
          dayChanged = true;
        }
      }

      // Check if status changed (open/closed)
      if (currentDaySchedule.is_active !== dayData.is_active) {
        changes[`${dayName.toLowerCase()}_status`] = {
          before: currentDaySchedule.is_active ? "Open" : "Closed",
          after: dayData.is_active ? "Open" : "Closed"
        };
        dayChanged = true;
      }

      if (dayChanged) {
        changedDaysCount++;
      }
    }
    
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

      // Track new day creation
      const dayName = getDayName(dayData.day_of_week);
      changes[`${dayName.toLowerCase()}_created`] = {
        before: null,
        after: `${formatTime(dayData.open_time, dayData.is_active)} - ${formatTime(dayData.close_time, dayData.is_active)}`
      };
      changedDaysCount++;
    }
  }

  await appendAuditLog(
    staff.profile.id, 
    "schedule.save", 
    "gym_schedule", 
    SYSTEM_ENTITY_IDS.GYM_SCHEDULE, // Special UUID for gym schedule
    { 
      days_changed: changedDaysCount,
      total_changes: Object.keys(changes).length
    },
    "Weekly Schedule", // resource name
    changes // detailed changes
  );
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

  await appendAuditLog(
    staff.profile.id, 
    "news.create", 
    "announcements", 
    undefined, 
    { 
      title: parsed.data.title,
      priority: parsed.data.priority
    },
    parsed.data.title, // resource name
    {
      announcement_created: {
        before: null,
        after: {
          title: parsed.data.title,
          priority: parsed.data.priority,
          expires_at: parsed.data.expires_at
        }
      }
    }
  );
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

  // Get current announcement data for comparison
  const { data: currentNews, error: fetchError } = await admin
    .from("announcements")
    .select("title, content, priority, end_date")
    .eq("id", parsed.data.id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch current news data", fetchError);
    return { success: false, error: "Failed to fetch current news data" };
  }

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

  // Create detailed change tracking
  const changes: Record<string, { before: unknown, after: unknown }> = {};
  
  if (currentNews.title !== rest.title) {
    changes.title = { before: currentNews.title, after: rest.title };
  }
  if (currentNews.content !== rest.content) {
    changes.content = { 
      before: currentNews.content?.substring(0, 100) + (currentNews.content?.length > 100 ? "..." : ""), 
      after: rest.content?.substring(0, 100) + (rest.content?.length > 100 ? "..." : "")
    };
  }
  
  // Convert numeric priority back to string for comparison
  const currentPriorityText = currentNews.priority === 1 ? 'low' : currentNews.priority === 2 ? 'medium' : 'high';
  if (currentPriorityText !== rest.priority) {
    changes.priority = { before: currentPriorityText, after: rest.priority };
  }
  
  if (currentNews.end_date !== rest.expires_at) {
    changes.expires_at = { before: currentNews.end_date, after: rest.expires_at };
  }

  await appendAuditLog(
    staff.profile.id, 
    "news.update", 
    "announcements", 
    id, 
    { 
      id,
      changes_count: Object.keys(changes).length
    },
    rest.title, // resource name
    changes // detailed changes
  );
  revalidatePath("/news");

  return { success: true, message: "News item updated" };
}

export async function deleteNewsAction(id: string): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  // Get news title before deletion for audit log
  const { data: newsToDelete, error: fetchError } = await admin
    .from("announcements")
    .select("title")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch news for deletion", fetchError);
    return { success: false, error: "Failed to fetch news data" };
  }

  const { error } = await admin.from("announcements").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete news", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(
    staff.profile.id, 
    "news.delete", 
    "announcements", 
    id, 
    { id },
    newsToDelete.title, // resource name
    {
      announcement_deleted: {
        before: {
          title: newsToDelete.title,
          status: "active"
        },
        after: null
      }
    }
  );
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

  await appendAuditLog(staff.profile.id, "checkin.manual_checkout", "checkins", checkinId, { 
    checkin_id: checkinId,
    duration_minutes: durationMinutes 
  });
  revalidatePath("/checkins");

  return { success: true, message: "Member checked out successfully" };
}

export async function clearAuditLogsAction(): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  // Only allow admin/owner to clear audit logs
  if (staff.profile.role_id !== 'admin' && staff.profile.role_id !== 'owner') {
    return { success: false, error: "Insufficient permissions. Only admins can clear audit logs." };
  }

  // Get count of logs before deletion for reporting
  const { count: totalLogs, error: countError } = await admin
    .from("audit_logs")
    .select("*", { count: 'exact', head: true });

  if (countError) {
    console.error("Failed to count audit logs", countError);
    return { success: false, error: "Failed to count audit logs" };
  }

  // Clear all audit logs
  const { error } = await admin.from("audit_logs").delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (error) {
    console.error("Failed to clear audit logs", error);
    return { success: false, error: error.message };
  }

  // Log the clearing action itself (meta operation)
  await appendAuditLog(
    staff.profile.id,
    "system.clear_audit_logs",
    "audit_logs",
    SYSTEM_ENTITY_IDS.SYSTEM_SETTINGS,
    {
      logs_cleared: totalLogs || 0,
      action_type: "maintenance"
    },
    "Audit Logs",
    {
      system_maintenance: {
        before: `${totalLogs || 0} audit log entries`,
        after: "0 audit log entries"
      }
    }
  );

  return { 
    success: true, 
    message: `Successfully cleared ${totalLogs || 0} audit log entries`,
    data: { cleared_count: totalLogs || 0 }
  };
}

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
  const memberName = (bookingToDelete as any).profiles ? 
    `${(bookingToDelete as any).profiles.first_name || ""} ${(bookingToDelete as any).profiles.last_name || ""}`.trim() :
    "Unknown Member";

  // Log the booking deletion
  await appendAuditLog(
    staff.profile.id,
    "booking.delete",
    "service_bookings",
    id,
    { status: bookingToDelete.status },
    `Service Booking - ${(bookingToDelete as any).services?.name} for ${memberName}`,
    {
      booking_deleted: {
        before: `${(bookingToDelete as any).services?.name} booking for ${memberName} on ${format(new Date(bookingToDelete.booking_date), "PPp")}`,
        after: "Deleted"
      }
    }
  );

  revalidatePath("/services");
  return { success: true, message: "Service booking deleted successfully" };
}
