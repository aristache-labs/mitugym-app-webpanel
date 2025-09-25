"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireStaff } from "@/lib/auth";
import { createMemberSchema, updateMemberSchema } from "@/schemas/members";
import { ActionResult, appendAuditLog, generateRandomPassword } from "../lib/action-utils";

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
    // Generate password
    const password = parsed.data.password || generateRandomPassword();
    
    // Check if user already exists in profiles table
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, email")
      .eq("email", parsed.data.email)
      .maybeSingle();
    
    if (existingProfile) {
      return { success: false, error: `User with email ${parsed.data.email} already exists` };
    }
    
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
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
      status: parsed.data.status, // Send original status, let trigger calculate
      plan_id: parsed.data.plan_id,
      starts_at: parsed.data.starts_at,
      expires_at: parsed.data.expires_at,
    };

    const { error: profileError } = await admin
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileError) {
      // If profile creation fails, clean up the auth user
      await admin.auth.admin.deleteUser(authUser.user.id);
      return { success: false, error: `Failed to create profile: ${profileError.message}` };
    }

    // Member status will be automatically calculated by database triggers

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
    .select("first_name, last_name, gender, email, phone, status, plan_id, starts_at, expires_at")
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
    status: parsed.data.status, // Send original status, let trigger calculate
    plan_id: parsed.data.plan_id,
    starts_at: parsed.data.starts_at,
    expires_at: parsed.data.expires_at,
  };

  const { error } = await admin
    .from("profiles")
    .update(profilePayload)
    .eq("id", parsed.data.id);

  if (error) {
    console.error("Failed to update member", error);
    return { success: false, error: error.message };
  }

  // Member status will be automatically calculated by database triggers

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
  if (currentMember.status !== parsed.data.status) {
    changes.status = { before: currentMember.status, after: parsed.data.status };
  }
  if (currentMember.plan_id !== parsed.data.plan_id) {
    changes.plan = { before: currentMember.plan_id, after: parsed.data.plan_id };
  }
  if (currentMember.starts_at !== parsed.data.starts_at) {
    changes.plan_start = { before: currentMember.starts_at, after: parsed.data.starts_at };
  }
  if (currentMember.expires_at !== parsed.data.expires_at) {
    changes.plan_expiry = { before: currentMember.expires_at, after: parsed.data.expires_at };
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
