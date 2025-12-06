import { PlansTable } from "./plans-table";
import { fetchPlans } from "@/lib/data";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "Membership Plans",
};

export default async function PlansPage() {
  const plans = await fetchPlans();

  return (
    <div className="space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Header Section */}
      <PageHeader
        icon={Package}
        title="Membership Plans"
        subtitle="Manage your gym's membership plans and pricing"
      >
        <div className="text-right flex-shrink-0">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{plans.length}</p>
          <p className="text-[10px] sm:text-xs text-muted/70 whitespace-nowrap">Total Plans</p>
        </div>
      </PageHeader>

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

