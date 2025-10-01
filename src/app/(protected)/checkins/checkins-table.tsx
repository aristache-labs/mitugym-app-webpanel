"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CheckIn } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { formatDateTime } from "@/lib/utils";
import { CheckoutButton } from "@/components/checkins/checkout-button";

interface CheckinsTableProps {
  data: CheckIn[];
  timeFormat?: TimeFormat;
}

export function CheckinsTable({ data, timeFormat = '24h' }: CheckinsTableProps) {
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const columns = useMemo<ColumnDef<CheckIn>[]>(
    () => [
      {
        accessorKey: "member_name",
        header: "Member",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
              <span className="text-xs font-bold text-primary">
                {(row.original.member_name ?? "W")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-text">
                {row.original.member_name ?? "Walk-in"}
              </p>
              {!row.original.member_name && (
                <p className="text-xs text-muted/60">Guest visitor</p>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "checked_in_at",
        header: "Checked In",
        cell: ({ row }) => {
          const date = new Date(row.original.checked_in_at);
          return (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-xs text-muted/60">
                {timeFormat === '12h'
                  ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                }
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "checked_out_at",
        header: "Checked Out",
        cell: ({ row }) => {
          if (row.original.checked_out_at) {
            const date = new Date(row.original.checked_out_at);
            return (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xs text-muted/60">
                  {timeFormat === '12h'
                    ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                  }
                </p>
              </div>
            );
          }
          return (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-success">Still in gym</span>
            </div>
          );
        },
      },
      {
        accessorKey: "duration_minutes",
        header: "Duration",
        cell: ({ row }) => {
          const minutes = row.original.duration_minutes;
          if (!minutes) {
            return (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm text-muted">Active session</span>
              </div>
            );
          }
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
          
          return (
            <div className="space-y-1">
              <p className="text-sm font-bold text-text">{duration}</p>
              <p className="text-xs text-muted/60">
                {minutes < 60 ? "Short session" : minutes > 180 ? "Extended session" : "Regular session"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => {
          const method = row.original.method ?? "manual";
          const isQR = method === "qr";
          
          return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isQR 
                ? "bg-primary/10 text-primary border-primary/30" 
                : "bg-accent/10 text-accent border-accent/30"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isQR ? "bg-primary" : "bg-accent"
              }`}></div>
              {isQR ? "QR Scan" : "Manual"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <CheckoutButton
              checkinId={row.original.id}
              memberName={row.original.member_name ?? "Walk-in"}
              isCheckedOut={!!row.original.checked_out_at}
            />
          </div>
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
    <div className="space-y-6">
      {/* Premium Filters Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl blur-lg"></div>
        <div className="relative bg-surface/40 backdrop-blur-sm rounded-xl border border-surface/50 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary">
                  Search Members
                </label>
              </div>
              <div className="relative group">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Type member name..."
                  className="bg-card/60 border-surface/60 focus:border-primary/50 focus:bg-card/80 transition-all duration-300 pl-4 pr-4 py-3 rounded-lg text-text placeholder:text-muted/60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
            
            <div className="lg:w-64 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-accent to-secondary rounded-full"></div>
                <label className="text-xs font-bold uppercase tracking-wider text-accent">
                  Filter Method
                </label>
              </div>
              <div className="relative group">
                <Select 
                  value={methodFilter} 
                  onChange={(event) => setMethodFilter(event.target.value)}
                  className="bg-card/60 border-surface/60 focus:border-accent/50 focus:bg-card/80 transition-all duration-300 rounded-lg text-text"
                >
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
                <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-surface/30">
            <p className="text-xs text-muted/80 font-medium">
              Showing <span className="text-primary font-bold">{filteredData.length}</span> of{" "}
              <span className="text-accent font-bold">{data.length}</span> check-ins
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Data Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-card/20 to-surface/20 rounded-xl blur-lg"></div>
        <div className="relative">
          <DataTable columns={columns} data={filteredData} />
        </div>
      </div>
    </div>
  );
}
