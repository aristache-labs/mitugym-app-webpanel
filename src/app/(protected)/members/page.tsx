import { MembersTable } from "@/app/(protected)/members/members-table";
import { MemberForm } from "@/components/members/member-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMembers, fetchPlans } from "@/lib/data";

export const metadata = {
  title: "Members",
};

export default async function MembersPage() {
  const [members, plans] = await Promise.all([fetchMembers(), fetchPlans()]);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-text">Members</h1>
          <p className="text-sm text-muted">
            Search, filter, and export member records. Scan events from the mobile app will update this list in real time.
          </p>
          <MembersTable members={members} />
        </div>
        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Create new member</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberForm plans={plans} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
