import { MembersPageWrapper } from "./members-page-wrapper";
import { fetchMembers } from "@/lib/data";
import { getExpiringMembers } from "@/lib/expiring-helpers";
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
  return getExpiringMembers(members, 7).length;
}

export default async function MembersPage() {
  const [members, expiringCount] = await Promise.all([
    fetchMembers(),
    fetchExpiringMembersCount(),
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 flex-shrink-0">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-text">Members</h1>
          <p className="text-xs sm:text-sm text-muted/80 truncate">
            Manage member profiles, plans, and membership status
          </p>
        </div>
      </div>

      <MembersPageWrapper members={members} expiringCount={expiringCount} />
    </div>
  );
}
