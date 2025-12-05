import { PlansTable } from "./plans-table";
import { fetchPlans } from "@/lib/data";
import { Package } from "lucide-react";

export const metadata = {
  title: "Membership Plans",
};

export default async function PlansPage() {
  const plans = await fetchPlans();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="relative">
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-surface/60 overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
          
          <div className="relative flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 md:p-3 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex-shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-text truncate">Membership Plans</h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted/70 mt-0.5 truncate">Manage your gym's membership plans and pricing</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{plans.length}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted/70 whitespace-nowrap">Total Plans</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Table */}
      <div className="relative">
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-surface/60 overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <div className="relative">
            <PlansTable plans={plans} />
          </div>
        </div>
      </div>
    </div>
  );
}

