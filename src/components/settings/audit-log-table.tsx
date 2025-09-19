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
      },
    ],
    []
  );

  return <DataTable columns={columns} data={entries} />;
}
