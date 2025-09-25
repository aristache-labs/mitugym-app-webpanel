import { MembersTable } from "@/app/(protected)/members/members-table";
import { Button } from "@/components/ui/button";
import { fetchMembers } from "@/lib/data";
import Link from "next/link";
import { Plus, Users } from "lucide-react";

export const metadata = {
  title: "Members",
};

export default async function MembersPage() {
  const members = await fetchMembers();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
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
        <Link href="/members/new">
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-white">
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <div className="bg-card/95 backdrop-blur-sm border border-surface/30 rounded-2xl p-4">
          <div className="text-sm text-muted/70 uppercase tracking-wider">Total Members</div>
          <div className="text-2xl font-bold text-text mt-1">{members.length}</div>
        </div>
        <div className="bg-card/95 backdrop-blur-sm border border-surface/30 rounded-2xl p-4">
          <div className="text-sm text-muted/70 uppercase tracking-wider">Active</div>
          <div className="text-2xl font-bold text-success mt-1">
            {members.filter(m => m.status === 'active').length}
          </div>
        </div>
        <div className="bg-card/95 backdrop-blur-sm border border-surface/30 rounded-2xl p-4">
          <div className="text-sm text-muted/70 uppercase tracking-wider">Expired</div>
          <div className="text-2xl font-bold text-warning mt-1">
            {members.filter(m => m.status === 'expired').length}
          </div>
        </div>
        <div className="bg-card/95 backdrop-blur-sm border border-surface/30 rounded-2xl p-4">
          <div className="text-sm text-muted/70 uppercase tracking-wider">Suspended</div>
          <div className="text-2xl font-bold text-error mt-1">
            {members.filter(m => m.status === 'suspended').length}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <section>
        <MembersTable members={members} />
      </section>
    </div>
  );
}
