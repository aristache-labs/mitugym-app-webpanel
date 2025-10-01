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
        <div className="flex items-center gap-2">
          <Link href="/plans/new">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      }
    />
  );
}
