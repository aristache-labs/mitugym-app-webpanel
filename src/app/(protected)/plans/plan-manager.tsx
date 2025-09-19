"use client";

import { useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { downloadCsv, generateCsv } from "@/lib/csv";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { MembershipPlan } from "@/types";
import { deletePlanAction } from "@/app/(protected)/actions";
import { PlanForm } from "@/components/plans/plan-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlanManagerProps {
  plans: MembershipPlan[];
}

const csvColumns = [
  { header: "Name", accessor: (plan: MembershipPlan) => plan.name },
  { header: "Price", accessor: (plan: MembershipPlan) => plan.price },
  { header: "Duration", accessor: (plan: MembershipPlan) => formatDuration(plan.duration_months) },
  { header: "Status", accessor: (plan: MembershipPlan) => (plan.is_active ? "active" : "inactive") },
];

export function PlanManager({ plans }: PlanManagerProps) {
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [isDeleting, startTransition] = useTransition();

  const columns = useMemo<ColumnDef<MembershipPlan>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Plan",
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => formatCurrency(row.original.price),
      },
      {
        accessorKey: "duration_months",
        header: "Duration",
        cell: ({ row }) => formatDuration(row.original.duration_months),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (row.original.is_active ? "Active" : "Inactive"),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedPlan(row.original)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-error hover:text-error"
              disabled={isDeleting}
              onClick={() =>
                startTransition(async () => {
                  const confirmed = window.confirm(
                    `Delete ${row.original.name}? This action cannot be undone.`
                  );
                  if (!confirmed) return;
                  const result = await deletePlanAction(row.original.id);
                  if (!result.success) {
                    alert(result.error);
                  }
                })
              }
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [isDeleting]
  );

  const handleExport = () => {
    const csv = generateCsv(plans, csvColumns);
    downloadCsv(csv, `membership-plans-${new Date().toISOString()}.csv`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-text">Membership plans</h1>
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
        <DataTable columns={columns} data={plans} />
      </div>
      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>{selectedPlan ? `Edit ${selectedPlan.name}` : "Create plan"}</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanForm
            plan={selectedPlan}
            onCompleted={() => {
              setSelectedPlan(null);
            }}
          />
          {selectedPlan ? (
            <Button variant="ghost" className="mt-4 w-full" onClick={() => setSelectedPlan(null)}>
              Create new instead
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
