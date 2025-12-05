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
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl sm:rounded-3xl blur-2xl"></div>
        
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-3xl hover:shadow-primary/10 hover:border-primary/50 overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
          
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
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 rounded-2xl sm:rounded-3xl blur-2xl"></div>
        
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-xl shadow-black/15 transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/10 hover:border-secondary/50 overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/2 via-secondary/1 to-primary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
          
          <div className="relative">
            <PlansTable plans={plans} />
          </div>
        </div>
      </div>
    </div>
  );
}

