"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import type { AuditLogEntry } from "@/types";
import { formatDate } from "@/lib/utils";

interface AuditLogTableProps {
  entries: AuditLogEntry[];
}

export function AuditLogTable({ entries }: AuditLogTableProps) {
  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: "Timestamp",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        accessorKey: "action",
        header: "Action",
      },
      {
        accessorKey: "entity",
        header: "Entity",
      },
      {
        accessorKey: "actor_id", 
        header: "Actor",
        cell: ({ row }) => row.original.actor_id ? row.original.actor_id.substring(0, 8) + "..." : "System",
      },
      {
        accessorKey: "entity_id",
        header: "Entity ID",
        cell: ({ row }) => row.original.entity_id ? row.original.entity_id.substring(0, 8) + "..." : "—",
      },
      {
        accessorKey: "meta",
        header: "Details",
        cell: ({ row }) => {
          const meta = row.original.meta;
          if (!meta || Object.keys(meta).length === 0) return "—";
          return (
            <code className="text-xs bg-surface/50 px-2 py-1 rounded">
              {JSON.stringify(meta, null, 0)}
            </code>
          );
        },
      },
    ],
    []
  );

  return <DataTable columns={columns} data={entries} />;
}
