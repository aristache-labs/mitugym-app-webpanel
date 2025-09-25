import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchCheckIns, fetchMemberById } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, User, Activity, Clock, Edit, Mail, Phone, Calendar, CreditCard } from "lucide-react";

interface ViewMemberPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewMemberPage({ params }: ViewMemberPageProps) {
  const { id } = await params;

  const [member, checkIns] = await Promise.all([
    fetchMemberById(id),
    fetchCheckIns({ member_id: id, limit: 10 }),
  ]);

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl" />
        <div className="relative bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl border border-surface/40 shadow-2xl rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-text">{member.full_name}</h1>
                  <p className="text-muted/70 mt-1">Member since {formatDate(member.created_at)}</p>
                  <Badge 
                    variant={member.status === 'active' ? 'default' : 'secondary'} 
                    className="mt-2"
                  >
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/members/${member.id}`}>
                  <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
                    <Edit className="h-4 w-4" />
                    Edit Member
                  </Button>
                </Link>
                <Link href="/members">
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Members
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Member Information Card */}
        <Card className="group relative bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl border border-surface/40 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute inset-0 rounded-3xl"
               style={{
                 background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)',
                 padding: '1px'
               }}>
          </div>
          
          <CardHeader className="relative p-8 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <User className="h-6 w-6 text-primary/60 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-text group-hover:text-primary transition-colors">
                  Member Information
                </CardTitle>
                <p className="text-sm text-muted/70 mt-1">Personal and contact details</p>
              </div>
            </div>
          </CardHeader>
            
          <CardContent className="relative p-8 pt-0 space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted/70">Email</p>
                  <p className="text-text font-semibold">{member.email}</p>
                </div>
              </div>
              
              {member.phone && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted/70">Phone</p>
                    <p className="text-text font-semibold">{member.phone}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted/70">Date of Birth</p>
                  <p className="text-text font-semibold">
                    {member.date_of_birth ? formatDate(member.date_of_birth) : 'Not provided'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted/70">Membership Plan</p>
                  <p className="text-text font-semibold">
                    {member.plan_name || 'No plan assigned'}
                  </p>
                  {member.expires_at && (
                    <p className="text-sm text-muted/60 mt-1">
                      Expires: {formatDate(member.expires_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Check-ins Card */}
        <Card className="group relative bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl border border-surface/40 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute inset-0 rounded-3xl"
               style={{
                 background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%, rgba(59, 130, 246, 0.05) 100%)',
                 padding: '1px'
               }}>
          </div>
          
          <CardHeader className="relative p-8 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Activity className="h-6 w-6 text-blue-500/60 group-hover:text-blue-500 transition-colors" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-text group-hover:text-blue-600 transition-colors">
                  Recent Check-ins
                </CardTitle>
                <p className="text-sm text-muted/70 mt-1">Latest gym visits and activity</p>
              </div>
            </div>
          </CardHeader>
            
          <CardContent className="relative p-8 pt-0">
            {checkIns.length > 0 ? (
              <div className="space-y-3">
                {checkIns.map((checkIn, index) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Clock className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-text">
                          {formatDate(checkIn.created_at)}
                        </p>
                        <p className="text-sm text-muted/70">
                          Check-in #{checkIns.length - index}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-blue-500/20 text-blue-600">
                      Visited
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 mb-4">
                  <Activity className="h-8 w-8 text-blue-500/50" />
                </div>
                <p className="text-muted/70 font-medium">No check-ins yet</p>
                <p className="text-sm text-muted/50 mt-1">
                  Check-ins will appear here once the member visits the gym
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
