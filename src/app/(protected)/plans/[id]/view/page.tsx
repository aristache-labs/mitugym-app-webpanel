import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Package, Edit, Banknote, Calendar, CheckCircle, XCircle, List } from "lucide-react";
import { formatCurrency, formatDuration, formatDate } from "@/lib/utils";

interface PlanViewPageProps {
  params: Promise<{ id: string }>;
}

async function fetchPlanById(id: string) {
  const { fetchPlans } = await import("@/lib/data");
  const plans = await fetchPlans();
  return plans.find(plan => plan.id === id) || null;
}

export default async function PlanViewPage({ params }: PlanViewPageProps) {
  const { id } = await params;
  const plan = await fetchPlanById(id);

  if (!plan) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Modern Header with Status */}
      <div className="relative">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl blur-2xl"></div>
        
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-3xl hover:shadow-primary/10 hover:border-primary/50 overflow-hidden rounded-3xl">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
          
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-text">{plan.name}</h1>
                  <p className="text-muted/70 mt-1">Membership Plan Details</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge 
                      variant={plan.is_active ? 'default' : 'secondary'} 
                      className={`${
                        plan.is_active 
                          ? 'bg-green-500/20 text-green-600 border-green-500/30' 
                          : 'bg-red-500/20 text-red-600 border-red-500/30'
                      }`}
                    >
                      {plan.is_active ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/plans/${plan.id}`}>
                  <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
                    <Edit className="h-4 w-4" />
                    Edit Plan
                  </Button>
                </Link>
                <Link href="/plans">
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Plans
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted/70">Price</p>
                    <p className="text-2xl font-bold text-text">{formatCurrency(plan.price)}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted/70">Duration</p>
                    <p className="text-2xl font-bold text-text">{formatDuration(plan.duration_months)}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <List className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted/70">Features</p>
                    <p className="text-2xl font-bold text-text">{(plan.features || []).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Details Card */}
      <div className="grid lg:grid-cols-1 gap-8">
        <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-xl shadow-black/15 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50 overflow-hidden rounded-3xl">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
          
          <CardHeader className="relative p-8 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Package className="h-6 w-6 text-primary/60 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-text group-hover:text-primary transition-colors">
                  Plan Information
                </CardTitle>
                <p className="text-sm text-muted/70 mt-1">Detailed plan configuration and features</p>
              </div>
            </div>
          </CardHeader>
            
          <CardContent className="relative p-8 pt-0">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-text uppercase tracking-wider">Basic Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Package className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted/70">Plan Name</p>
                      <p className="text-text font-semibold">{plan.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Package className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted/70">Plan Type</p>
                      <p className="text-text font-semibold">
                        {plan.plan_type === 'day_entry' ? 'Day Entry' : 
                         plan.plan_type === 'full' ? 'Full Membership' : 
                         plan.plan_type === 'student' ? 'Student Discount' : 
                         plan.plan_type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Banknote className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted/70">Price</p>
                      <p className="text-text font-semibold">{formatCurrency(plan.price)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted/70">Duration</p>
                      <p className="text-text font-semibold">{formatDuration(plan.duration_months)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-muted/70">Status</p>
                      <Badge 
                        variant={plan.is_active ? 'default' : 'secondary'} 
                        className={`w-fit ${
                          plan.is_active 
                            ? 'bg-green-500/20 text-green-600 border-green-500/30' 
                            : 'bg-red-500/20 text-red-600 border-red-500/30'
                        }`}
                      >
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-text uppercase tracking-wider">Plan Features</h3>
                
                {plan.features && plan.features.length > 0 ? (
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <p className="text-text font-medium">{feature}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-surface/20 to-surface/10 border border-surface/30 mb-4">
                      <List className="h-8 w-8 text-muted/50" />
                    </div>
                    <h4 className="font-medium text-text mb-1">No Features Listed</h4>
                    <p className="text-sm text-muted/60">This plan doesn't have any specific features listed</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
