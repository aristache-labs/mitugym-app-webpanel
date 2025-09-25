"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireStaff } from "@/lib/auth";
import { planSchema } from "@/schemas/plans";
import { ActionResult, appendAuditLog } from "../lib/action-utils";

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
