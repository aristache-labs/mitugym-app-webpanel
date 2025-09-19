import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type StaffProfile = {
  id: string;
  role_id: string;
  full_name: string | null;
};

export type StaffContext = {
  user: User;
  profile: StaffProfile;
};

export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn("Supabase server client is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set() {
        /* cookies cannot be set in a server component */
      },
      remove() {
        /* cookies cannot be removed in a server component */
      },
    },
  });
}

export async function requireStaff(): Promise<StaffContext> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("staff_profiles")
    .select("id, role_id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load staff profile", error);
  }

  if (!profile || !["staff", "admin"].includes(profile.role_id)) {
    redirect("/login");
  }

  return { user, profile };
}
