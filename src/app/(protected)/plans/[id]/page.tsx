import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanForm } from "@/components/plans/plan-form";
import { fetchPlans } from "@/lib/data";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

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
    <div className="space-y-6">
      {/* Premium Form Container */}
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
                  <Package className="h-6 w-6 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-text group-hover:text-primary transition-colors">
                    Edit Plan: {plan.name}
                  </CardTitle>
                  <p className="text-sm text-muted/70 mt-1">Update plan information and settings</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/plans/${plan.id}/view`}>
                  <Button className="gap-2 h-9 text-sm px-4 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 hover:from-slate-700 hover:via-slate-700/95 hover:to-slate-800 text-slate-100 hover:text-white border border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 backdrop-blur-sm font-medium">
                    View Details
                  </Button>
                </Link>
                <Link href="/plans">
                  <Button className="gap-2 h-9 text-sm px-4 bg-gradient-to-br from-slate-800/50 via-slate-800/40 to-slate-900/50 hover:from-slate-800/70 hover:via-slate-800/60 hover:to-slate-900/70 text-slate-300 hover:text-slate-100 border border-slate-700/50 hover:border-slate-600/70 transition-all duration-300 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 backdrop-blur-sm font-medium">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Plans
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative p-8 pt-0">
            <PlanForm plan={plan} existingPlans={allPlans} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
