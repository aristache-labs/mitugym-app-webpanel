import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSupabaseServerClient } from "@/lib/auth";

export const metadata: Metadata = {
  title: "MITUGYM Staff Login",
};

export default async function LoginPage() {
  const supabase = await getSupabaseServerClient();
  
  if (!supabase) {
    return (
      <div className="h-screen overflow-hidden sm:h-auto sm:overflow-visible">
        <LoginForm />
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Check if user is staff before redirecting to dashboard
    const { data: staffProfile } = await supabase
      .from("staff_profiles")
      .select("id, role_id")
      .eq("id", user.id)
      .maybeSingle();
    
    // Only redirect to dashboard if user is staff
    if (staffProfile && ["staff", "admin"].includes(staffProfile.role_id)) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="h-screen overflow-hidden sm:h-auto sm:overflow-visible">
      <LoginForm />
    </div>
  );
}
