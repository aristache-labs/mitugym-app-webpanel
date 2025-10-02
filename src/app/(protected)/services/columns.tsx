"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Service } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ServiceActions } from "@/components/services/service-actions";
import { Banknote, Clock, Calendar } from "lucide-react";

export const serviceColumns: ColumnDef<Service>[] = [
  {
    accessorKey: "name",
    header: () => (
      <div className="text-center font-semibold">Service Name</div>
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <span className="font-semibold text-text line-clamp-2 leading-tight">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "service_type",
    header: () => (
      <div className="text-center font-semibold">Type</div>
    ),
    cell: ({ row }) => {
      const typeLabels = {
        'personal_trainer': 'Personal Training',
        'professional_massage': 'Professional Massage'
      };
      return (
        <div className="max-w-[140px]">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 whitespace-nowrap">
            {typeLabels[row.original.service_type as keyof typeof typeLabels] || row.original.service_type}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => (
      <div className="text-center font-semibold">Price</div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Banknote className="h-4 w-4 text-primary" />
        <span className="font-medium text-text">{formatCurrency(row.original.price)}</span>
      </div>
    ),
  },
  {
    accessorKey: "duration_minutes",
    header: () => (
      <div className="text-center font-semibold">Duration</div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-secondary" />
        <span className="text-text">{row.original.duration_minutes} min</span>
      </div>
    ),
  },
  {
    accessorKey: "max_sessions",
    header: () => (
      <div className="text-center font-semibold">Sessions</div>
    ),
    cell: ({ row }) => {
      const sessions = row.original.max_sessions || 1;
      return (
        <span className="text-text">
          {sessions} session{sessions > 1 ? 's' : ''}
        </span>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: () => (
      <div className="text-center font-semibold">Status</div>
    ),
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
    id: "actions",
    header: () => (
      <div className="text-center font-semibold">Actions</div>
    ),
    cell: ({ row }) => (
      <ServiceActions 
        serviceId={row.original.id} 
        serviceName={row.original.name}
      />
    ),
  },
];
