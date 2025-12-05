"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { downloadCsv, generateCsv } from "@/lib/csv";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { MembershipPlan } from "@/types";
import { planColumns } from "./columns";
import Link from "next/link";
import { Plus } from "lucide-react";

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
        <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          <Link href="/plans/new">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Create Plan</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExport} className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4">
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      }
    />
  );
}
