import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; issues?: Record<string, string[]> };

// Type for booking data with relations
export type BookingWithRelations = {
  id: string;
  status: string;
  booking_date: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
  services?: {
    name?: string;
  };
};

// Special entity IDs for system-wide operations
export const SYSTEM_ENTITY_IDS = {
  GYM_SCHEDULE: "00000000-0000-0000-0000-000000000001",
  SYSTEM_SETTINGS: "00000000-0000-0000-0000-000000000002",
  BULK_OPERATIONS: "00000000-0000-0000-0000-000000000003",
} as const;

export async function appendAuditLog(
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

// Helper function to generate a random password
export function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
