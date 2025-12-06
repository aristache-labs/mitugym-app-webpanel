import { PlansTable } from "./plans-table";
import { fetchPlans } from "@/lib/data";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Membership Plans",
};

export default async function PlansPage() {
  const plans = await fetchPlans();

  return (
    <div className="space-y-6 sm:space-y-8 overflow-clip">
      {/* Header Section */}
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 flex-shrink-0">
          <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-text">
              Membership Plans
            </h1>
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-xs">
              {plans.length} {plans.length === 1 ? 'Plan' : 'Plans'}
            </Badge>
          </div>
          <p className="text-[10px] leading-tight sm:text-sm text-muted/80 line-clamp-2 sm:truncate">
            Manage your gym's membership plans and pricing
          </p>
        </div>
      </div>

      {/* Plans Table */}
      <div className="relative">
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 transition-all duration-300 hover:border-surface/60 overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <div className="relative">
            <PlansTable plans={plans} />
          </div>
        </div>
      </div>
    </div>
  );
}

