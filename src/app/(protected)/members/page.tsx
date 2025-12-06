import { MembersPageWrapper } from "./members-page-wrapper";
import { fetchMembers } from "@/lib/data";
import { getExpiringMembers } from "@/lib/expiring-helpers";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

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
    <div className="space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Header Section */}
      <PageHeader
        icon={Users}
        title="Members"
        subtitle="Manage member profiles, plans, and membership status"
      />

      <MembersPageWrapper members={members} expiringCount={expiringCount} />
    </div>
  );
}
