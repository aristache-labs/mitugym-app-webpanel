"use client";

import { DataTable } from "@/components/data-table/data-table";
import { AnimatedCreateButton } from "@/components/ui/animated-create-button";
import { AnimatedExportButton } from "@/components/ui/animated-export-button";
import { downloadCsv, generateCsv } from "@/lib/csv";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { MembershipPlan } from "@/types";
import { planColumns } from "./columns";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleCreatePlan = () => {
    router.push("/plans/new");
  };

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
          <AnimatedCreateButton onClick={handleCreatePlan} label="Create Plan" shortLabel="Create" />
          <AnimatedExportButton onClick={handleExport} />
        </div>
      }
    />
  );
}
