"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CheckIn } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { CheckoutButton } from "@/components/checkins/checkout-button";

interface CheckinsTableProps {
  data: CheckIn[];
}

export function CheckinsTable({ data }: CheckinsTableProps) {
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const columns = useMemo<ColumnDef<CheckIn>[]>(
    () => [
      {
        accessorKey: "member_name",
        header: "Member",
        cell: ({ row }) => row.original.member_name ?? "Walk-in",
      },
      {
        accessorKey: "checked_in_at",
        header: "Checked in",
        cell: ({ row }) => formatDateTime(row.original.checked_in_at),
      },
      {
        accessorKey: "checked_out_at",
        header: "Checked out",
        cell: ({ row }) => 
          row.original.checked_out_at 
            ? formatDateTime(row.original.checked_out_at)
            : "Still in gym",
      },
      {
        accessorKey: "duration_minutes",
        header: "Duration",
        cell: ({ row }) => {
          const minutes = row.original.duration_minutes;
          if (!minutes) return "—";
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        },
      },
      {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => row.original.method ?? "manual",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <CheckoutButton
            checkinId={row.original.id}
            memberName={row.original.member_name ?? "Walk-in"}
            isCheckedOut={!!row.original.checked_out_at}
          />
        ),
      },
    ],
    []
  );

  const filteredData = data.filter((checkIn) => {
    const matchesMethod = methodFilter ? checkIn.method === methodFilter : true;
    const matchesSearch = search
      ? (checkIn.member_name ?? "").toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesMethod && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-xs font-semibold uppercase text-muted">Search</label>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Member name"
          />
        </div>
        <div className="md:w-56">
          <label className="mb-2 block text-xs font-semibold uppercase text-muted">Method</label>
          <Select value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)}>
            <option value="" className="bg-surface text-text">
              All methods
            </option>
            <option value="qr" className="bg-surface text-text">
              QR scan
            </option>
            <option value="manual" className="bg-surface text-text">
              Manual
            </option>
          </Select>
        </div>
      </div>
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}
