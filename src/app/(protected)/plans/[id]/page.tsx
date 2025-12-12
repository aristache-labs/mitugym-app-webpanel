import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanForm } from "@/components/plans/plan-form";
import { fetchPlans } from "@/lib/data";
import Link from "next/link";
import { ArrowLeft, Package, Eye } from "lucide-react";

interface PlanDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
  const { id } = await params;
  const allPlans = await fetchPlans();
  const plan = allPlans.find(plan => plan.id === id) || null;

  if (!plan) {
    notFound();
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
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
          
          <CardHeader className="relative p-4 sm:p-6 md:p-8 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-semibold text-text group-hover:text-primary transition-colors">
                    Edit Plan: {plan.name}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted/70 mt-0.5 sm:mt-1">Update plan information and settings</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* View Details Button */}
                <Link href={`/plans/${plan.id}/view`} className="flex-1 sm:flex-none">
                  <button
                    className="group/btn relative h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-6 w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
                  >
                    {/* Eye Icon */}
                    <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/btn:scale-125 group-hover/btn:translate-x-[3.2em]">
                      <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/btn:text-cyan-100 group-hover/btn:scale-110" />
                    </div>
                    {/* Text */}
                    <span className="hidden sm:inline transition-all duration-500 ease-in-out group-hover/btn:opacity-0">
                      View Details
                    </span>
                    {/* Mobile text */}
                    <span className="sm:hidden transition-all duration-500 ease-in-out group-hover/btn:opacity-0">
                      View
                    </span>
                  </button>
                </Link>
                {/* Back Button */}
                <Link 
                  href="/plans"
                  className="group/link relative h-8 sm:h-9 w-full sm:w-auto px-3 sm:px-4 md:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 !no-underline flex-1 sm:flex-none"
                >
                  {/* Arrow Icon */}
                  <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/link:scale-125 group-hover/link:translate-x-[1.3em]">
                    <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/link:text-cyan-100 group-hover/link:scale-110" />
                  </div>
                  
                  {/* Text */}
                  <span className="transition-all duration-500 ease-in-out group-hover/link:opacity-0">
                    Back
                  </span>
                </Link>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative p-4 sm:p-6 md:p-8 pt-0">
            <PlanForm plan={plan} existingPlans={allPlans} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

