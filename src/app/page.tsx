import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/auth";

export default async function RootPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = (await supabase?.auth.getSession()) ?? { data: { session: null } };

  if (session) {
    redirect("/dashboard");
  }

  redirect("/login");
}
