import { notFound } from "next/navigation";
import { MemberForm } from "@/components/members/member-form";
import { DeleteMemberButton } from "@/components/members/delete-member-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMemberById, fetchPlans } from "@/lib/data";
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
    <div className="space-y-4 sm:space-y-6">
      {/* Premium Form Container */}
      <div className="relative">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl sm:rounded-3xl blur-2xl"></div>
        
        {/* Form Card */}
        <Card className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
          
          {/* Gradient Border */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl">
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" 
                 style={{ 
                   mask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                   maskComposite: 'exclude',
                   WebkitMask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                   WebkitMaskComposite: 'xor',
                   padding: '1px'
                 }}>
            </div>
          </div>
          
          <CardHeader className="relative p-4 sm:p-6 md:p-8 pb-3 sm:pb-4 md:pb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-text group-hover:text-primary transition-colors">
                      Edit Profile
                    </CardTitle>
                    {/* Back button on mobile - right side */}
                    <Link 
                      href="/members"
                      className="sm:hidden group/link relative h-7 px-3 flex items-center justify-center gap-1.5 bg-gradient-to-br from-slate-800/60 via-slate-800/50 to-slate-900/60 hover:from-slate-700/70 hover:via-slate-700/60 hover:to-slate-800/70 text-slate-300 hover:text-slate-100 font-medium text-xs rounded-xl backdrop-blur-sm shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 !no-underline flex-shrink-0"
                    >
                      <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/link:scale-125 group-hover/link:translate-x-[1em]">
                        <ArrowLeft className="h-3 w-3 transition-all duration-500 ease-in-out text-slate-400/70 group-hover/link:text-slate-200 group-hover/link:scale-110" />
                      </div>
                      <span className="transition-all duration-500 ease-in-out group-hover/link:opacity-0">
                        Back
                      </span>
                    </Link>
                  </div>
                  <p className="text-xs sm:text-sm text-muted/70 mt-0.5 sm:mt-1">Update member information and membership details</p>
                </div>
              </div>
              {/* Back button on desktop - top right */}
              <div className="hidden sm:flex items-start gap-2 flex-shrink-0">
                <Link 
                  href="/members"
                  className="group/link relative h-8 sm:h-9 px-3 sm:px-4 md:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-800/60 via-slate-800/50 to-slate-900/60 hover:from-slate-700/70 hover:via-slate-700/60 hover:to-slate-800/70 text-slate-300 hover:text-slate-100 font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 !no-underline"
                >
                  <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/link:scale-125 group-hover/link:translate-x-[1.3em]">
                    <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-all duration-500 ease-in-out text-slate-400/70 group-hover/link:text-slate-200 group-hover/link:scale-110" />
                  </div>
                  <span className="transition-all duration-500 ease-in-out group-hover/link:opacity-0">
                    Back to Members
                  </span>
                </Link>
              </div>
            </div>
          </CardHeader>
            
          <CardContent className="relative p-4 sm:p-6 md:p-8 pt-0">
            <MemberForm 
              member={member} 
              plans={plans}
              deleteButton={
                <DeleteMemberButton memberId={member.id} memberName={member.full_name} />
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
