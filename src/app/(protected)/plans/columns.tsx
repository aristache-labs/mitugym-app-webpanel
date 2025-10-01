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
    header: "Plan Name",
    cell: ({ row }) => (
      <span className="font-semibold text-text">
        {row.original.name}
      </span>
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
        <span className="text-text">
          {labels[row.original.plan_type as keyof typeof labels] || row.original.plan_type}
        </span>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Banknote className="h-4 w-4 text-primary" />
        <span className="font-medium text-text">{formatCurrency(row.original.price)}</span>
      </div>
    ),
  },
  {
    accessorKey: "duration_months",
    header: "Duration",
    cell: ({ row }) => (
      <span className="text-text">{formatDuration(row.original.duration_months)}</span>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge 
        variant={row.original.is_active ? "default" : "secondary"}
        className={
          row.original.is_active 
            ? "bg-green-500/20 text-green-600 border-green-500/30" 
            : "bg-red-500/20 text-red-600 border-red-500/30"
        }
      >
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "features",
    header: "Features",
    cell: ({ row }) => {
      const features = row.original.features || [];
      return (
        <span className="text-sm text-muted">
          {features.length > 0 ? `${features.length} feature${features.length > 1 ? 's' : ''}` : "No features"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <PlanActions 
        planId={row.original.id} 
        planName={row.original.name}
      />
    ),
  },
];
