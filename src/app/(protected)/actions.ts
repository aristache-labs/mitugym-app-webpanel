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

  const { error } = await admin.from("gym_schedule").upsert(parsed.data, { onConflict: "weekday" });

  if (error) {
    console.error("Failed to save schedule", error);
    return { success: false, error: error.message };
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
    priority: parsed.data.priority,
    expires_at: parsed.data.expires_at,
  };

  const { error } = await admin.from("news").insert(payload);

  if (error) {
    console.error("Failed to create news", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(staff.profile.id, "news.create", "news", { title: parsed.data.title });
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
  const { error } = await admin.from("news").update(rest).eq("id", id);

  if (error) {
    console.error("Failed to update news", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(staff.profile.id, "news.update", "news", { id });
  revalidatePath("/news");

  return { success: true, message: "News item updated" };
}

export async function deleteNewsAction(id: string): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, error: "Supabase credentials are missing" };
  }

  const staff = await requireStaff();

  const { error } = await admin.from("news").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete news", error);
    return { success: false, error: error.message };
  }

  await appendAuditLog(staff.profile.id, "news.delete", "news", { id });
  revalidatePath("/news");

  return { success: true, message: "News item deleted" };
}
