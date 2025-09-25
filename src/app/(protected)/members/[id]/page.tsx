import { notFound } from "next/navigation";
import { MemberForm } from "@/components/members/member-form";
import { DeleteMemberButton } from "@/components/members/delete-member-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchCheckIns, fetchMemberById, fetchPlans } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, User, Activity, Clock } from "lucide-react";

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
    <div className="space-y-8">
      {/* Premium Header Section */}
      <div className="relative">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl blur-xl"></div>
        
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg shadow-black/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <User className="h-6 w-6 text-primary/60" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-text">{member.full_name}</h1>
                <p className="text-sm text-muted/70">Member since {formatDate(member.created_at)}</p>
              </div>
            </div>
            <Link href="/members">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl">
                <ArrowLeft className="h-4 w-4" />
                Back to Members
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Premium Content Grid */}
      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Premium Edit Form */}
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl blur-2xl"></div>
          
          {/* Form Card */}
          <Card className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-3xl hover:shadow-primary/10 hover:border-primary/50 overflow-hidden rounded-3xl">
            {/* Card Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
            
            {/* Gradient Border */}
            <div className="absolute inset-0 rounded-3xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" 
                   style={{ 
                     mask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                     maskComposite: 'exclude',
                     WebkitMask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                     WebkitMaskComposite: 'xor',
                     padding: '1px'
                   }}>
              </div>
            </div>
            
            <CardHeader className="relative p-8 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <User className="h-6 w-6 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-text group-hover:text-primary transition-colors">
                      Edit Member Profile
                    </CardTitle>
                    <p className="text-sm text-muted/70 mt-1">Update member information and membership details</p>
                  </div>
                </div>
                <DeleteMemberButton memberId={member.id} memberName={member.full_name} />
              </div>
            </CardHeader>
              
            <CardContent className="relative p-8 pt-0">
              <MemberForm member={member} plans={plans} />
            </CardContent>
          </Card>
        </div>

        {/* Premium Check-ins Card */}
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 rounded-3xl blur-xl"></div>
          
          <Card className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-xl shadow-black/15 transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/10 hover:border-secondary/50 overflow-hidden rounded-3xl">
            {/* Card Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/2 via-secondary/1 to-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
            
            <CardHeader className="relative p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <Activity className="h-5 w-5 text-secondary/60 group-hover:text-secondary transition-colors" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-text group-hover:text-secondary transition-colors">
                    Recent Check-ins
                  </CardTitle>
                  <p className="text-xs text-muted/70 mt-0.5">Latest gym activity</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative p-6 pt-0">
              {memberCheckIns.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-secondary/60" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-text">No check-ins yet</p>
                    <p className="text-xs text-muted/80 mt-1">Gym visits will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberCheckIns.map((checkIn, index) => (
                    <div 
                      key={checkIn.id} 
                      className={`group/item relative rounded-2xl bg-gradient-to-r from-surface/80 to-surface/60 border border-surface/40 p-4 transition-all duration-200 hover:from-surface/90 hover:to-surface/80 hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/10 ${
                        index === 0 ? 'ring-1 ring-secondary/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-secondary/60 group-hover/item:bg-secondary"></div>
                          <span className="text-sm font-medium text-text group-hover/item:text-secondary transition-colors">
                            {formatDate(checkIn.checked_in_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-secondary/20 text-secondary rounded-full text-xs font-medium border border-secondary/30">
                              Latest
                            </span>
                          )}
                          <Badge variant="default" className="capitalize bg-secondary/20 text-secondary border-secondary/30 hover:bg-secondary/30 transition-colors">
                            {checkIn.method ?? "manual"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
