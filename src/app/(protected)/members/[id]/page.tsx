import { notFound } from "next/navigation";
import { MemberForm } from "@/components/members/member-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchCheckIns, fetchMemberById, fetchPlans } from "@/lib/data";
import { formatDate } from "@/lib/utils";

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { id } = await params;
  const member = await fetchMemberById(id);

  if (!member) {
    notFound();
  }

  const [plans, checkIns] = await Promise.all([fetchPlans(), fetchCheckIns()]);
  const memberCheckIns = checkIns.filter((checkIn) => checkIn.member_id === member.id).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">{member.full_name}</h1>
        <p className="text-sm text-muted">Member since {formatDate(member.created_at)}</p>
      </div>
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle>Edit member</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberForm member={member} plans={plans} />
          </CardContent>
        </Card>
        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle>Recent check-ins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {memberCheckIns.length === 0 ? (
              <p className="text-muted">No visits yet. Mobile scanner events will appear here.</p>
            ) : (
              memberCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="flex items-center justify-between rounded-[16px] bg-surface/60 px-4 py-3">
                  <span>{formatDate(checkIn.checked_in_at)}</span>
                  <Badge variant="default" className="capitalize">
                    {checkIn.method ?? "manual"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
