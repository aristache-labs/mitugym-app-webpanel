import { MembersPageWrapper } from "./members-page-wrapper";
import { fetchMembers } from "@/lib/data";
import { Users } from "lucide-react";

export const metadata = {
  title: "Members",
};

async function fetchExpiringMembersCount() {
  // Import getSupabaseAdmin here to avoid top-level imports
  const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
  const admin = getSupabaseAdmin();
  
  if (admin) {
    const { data: expiringCount, error } = await admin.rpc('get_expiring_members_count');
    if (!error) {
      return expiringCount ?? 0;
    }
  }
  
  // Fallback calculation if database query fails
  const { fetchMembers } = await import("@/lib/data");
  const members = await fetchMembers();
  return members.filter((member) => {
    if (!member.expires_at) return false;
    const expires = new Date(member.expires_at).getTime();
    const now = new Date().getTime();
    const week = 7 * 24 * 60 * 60 * 1000;
    return expires - now <= week && expires > now;
  }).length;
}

export default async function MembersPage() {
  const [members, expiringCount] = await Promise.all([
    fetchMembers(),
    fetchExpiringMembersCount(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">Members</h1>
          <p className="text-sm text-muted/80">
            Manage member profiles, plans, and membership status
          </p>
        </div>
      </div>

      <MembersPageWrapper members={members} expiringCount={expiringCount} />
    </div>
  );
}
