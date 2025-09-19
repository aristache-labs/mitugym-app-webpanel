import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSupabaseServerClient } from "@/lib/auth";

export const metadata: Metadata = {
  title: "MITUGYM Staff Login",
};

export default async function LoginPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = (await supabase?.auth.getSession()) ?? { data: { session: null } };

  if (session) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
