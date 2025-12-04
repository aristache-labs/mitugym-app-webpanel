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
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex-shrink-0">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text">Membership Plans</h1>
                <p className="text-xs sm:text-sm text-muted/70 mt-0.5 sm:mt-1 truncate">Manage your gym's membership plans and pricing</p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right">
                <p className="text-xl sm:text-2xl font-bold text-primary">{plans.length}</p>
                <p className="text-xs sm:text-sm text-muted/70">Total Plans</p>
              </div>
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
