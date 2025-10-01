"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseServerClient } from "@/lib/auth";
import { requireStaff } from "@/lib/auth";
import { newsSchema } from "@/schemas/news";
import { scheduleSchema } from "@/schemas/schedule";
import { ActionResult, appendAuditLog, SYSTEM_ENTITY_IDS } from "../lib/action-utils";
import type { ScheduleDay } from "@/types";

// ===== AUTH ACTIONS =====

export async function signOutAction() {
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/login");
}

// ===== SCHEDULE ACTIONS =====

export async function saveScheduleAction(values: ScheduleDay[]): Promise<ActionResult> {
  const parsed = scheduleSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const issues: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(fieldErrors)) {
      issues[key] = value || [];
    }
    return { success: false, error: "Invalid schedule", issues };
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

// ===== NEWS ACTIONS =====

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

export async function toggleNewsActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  // Get news title for audit log
  const { data: newsItem, error: fetchError } = await admin
    .from("announcements")
    .select("title")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Failed to fetch news", fetchError);
    return { success: false, error: "Failed to fetch news data" };
  }

  const { error } = await admin
    .from("announcements")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("Failed to toggle news active status", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(
    staff.profile.id,
    isActive ? "news.activate" : "news.deactivate",
    "announcements",
    id,
    { id, is_active: isActive },
    newsItem.title,
    {
      status_changed: {
        before: isActive ? "inactive" : "active",
        after: isActive ? "active" : "inactive"
      }
    }
  );
  revalidatePath("/news");

  return { success: true, message: `Announcement ${isActive ? 'activated' : 'deactivated'}` };
}

// ===== CHECKIN ACTIONS =====

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

// ===== AUDIT LOG ACTIONS =====

export async function clearAuditLogsAction(): Promise<ActionResult<{ cleared_count: number }>> {
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
