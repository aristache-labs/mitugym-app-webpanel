"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { MembershipPlan } from "@/types";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PlanActions } from "@/components/plans/plan-actions";
import { Banknote } from "lucide-react";

export const planColumns: ColumnDef<MembershipPlan>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-center md:text-left">Plan Name</div>,
    cell: ({ row }) => (
      <div className="text-center md:text-left">
        <span className="font-semibold text-text">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "plan_type",
    header: "Type",
    cell: ({ row }) => {
      const labels = {
        'day_entry': 'Day Entry',
        'full': 'Full Membership',
        'student': 'Student Discount'
      };
      return (
        <div className="text-center">
          <span className="text-text">
            {labels[row.original.plan_type as keyof typeof labels] || row.original.plan_type}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Banknote className="h-4 w-4 text-primary" />
        <span className="font-medium text-text">{formatCurrency(row.original.price)}</span>
      </div>
    ),
  },
  {
    accessorKey: "duration_months",
    header: "Duration",
    cell: ({ row }) => (
      <div className="text-center">
        <span className="text-text">{formatDuration(row.original.duration_months)}</span>
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge 
          variant={row.original.is_active ? "success" : "destructive"}
        >
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "features",
    header: "Features",
    cell: ({ row }) => {
      const features = row.original.features || [];
      return (
        <div className="text-center">
          <span className="text-sm text-muted">
            {features.length > 0 ? `${features.length} feature${features.length > 1 ? 's' : ''}` : "No features"}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <PlanActions 
          planId={row.original.id} 
          planName={row.original.name}
        />
      </div>
    ),
  },
];
