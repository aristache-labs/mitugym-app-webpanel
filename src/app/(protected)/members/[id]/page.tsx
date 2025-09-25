import { notFound } from "next/navigation";
import { MemberForm } from "@/components/members/member-form";
import { DeleteMemberButton } from "@/components/members/delete-member-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchMemberById, fetchPlans } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { id } = await params;
  const member = await fetchMemberById(id);

  if (!member) {
    notFound();
  }

  const plans = await fetchPlans();

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

      {/* Premium Edit Form */}
      <section className="max-w-4xl mx-auto">
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
      </section>
    </div>
  );
}
