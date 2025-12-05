"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { downloadCsv, generateCsv } from "@/lib/csv";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { MembershipPlan } from "@/types";
import { planColumns } from "./columns";
import Link from "next/link";
import { Plus, Download } from "lucide-react";

const csvColumns = [
  { header: "Name", accessor: (plan: MembershipPlan) => plan.name },
  { header: "Type", accessor: (plan: MembershipPlan) => {
    const labels = { 'day_entry': 'Day Entry', 'full': 'Full Membership', 'student': 'Student Discount' };
    return labels[plan.plan_type as keyof typeof labels] || plan.plan_type;
  }},
  { header: "Price", accessor: (plan: MembershipPlan) => formatCurrency(plan.price) },
  { header: "Duration", accessor: (plan: MembershipPlan) => formatDuration(plan.duration_months) },
  { header: "Status", accessor: (plan: MembershipPlan) => (plan.is_active ? "Active" : "Inactive") },
  { header: "Features", accessor: (plan: MembershipPlan) => (plan.features || []).join(", ") },
];

export function PlansTable({ plans }: { plans: MembershipPlan[] }) {
  const handleExport = () => {
    const csv = generateCsv(plans, csvColumns);
    downloadCsv(csv, `mitugym-plans-${new Date().toISOString()}.csv`);
  };

  return (
    <DataTable
      columns={planColumns}
      data={plans}
      filterKey="name"
      toolbarSlot={
        <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-auto">
          <Link href="/plans/new">
            <Button className="gap-2 h-9 sm:h-10 text-xs sm:text-sm px-4 sm:px-6 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 hover:from-slate-700 hover:via-slate-700/95 hover:to-slate-800 text-slate-100 hover:text-white border border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 backdrop-blur-sm font-medium">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Create Plan</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </Link>
          <Button 
            onClick={handleExport} 
            className="h-9 sm:h-10 text-xs sm:text-sm px-4 sm:px-6 bg-gradient-to-br from-slate-800/50 via-slate-800/40 to-slate-900/50 hover:from-slate-800/70 hover:via-slate-800/60 hover:to-slate-900/70 text-slate-300 hover:text-slate-100 border border-slate-700/50 hover:border-slate-600/70 transition-all duration-300 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 backdrop-blur-sm font-medium"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      }
    />
  );
}
