"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CheckIn } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { CheckoutButton } from "@/components/checkins/checkout-button";
import { AvatarWithPreview } from "@/components/members/avatar-preview-modal";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
        header: () => <div className="text-center md:text-left font-semibold">Member</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center md:justify-start gap-3 px-2">
            <AvatarWithPreview
              avatarUrl={row.original.avatar_url}
              memberName={row.original.member_name ?? "Walk-in"}
              size="small"
              className="w-8 h-8 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              {row.original.member_name && row.original.member_id ? (
                <Link href={`/members/${row.original.member_id}/view`} className="group block">
                  <p className="font-semibold text-text group-hover:text-primary transition-colors cursor-pointer hover:underline truncate">
                    {row.original.member_name}
                  </p>
                </Link>
              ) : (
                <>
                  <p className="font-semibold text-text">
                    Walk-in
                  </p>
                  <p className="text-xs text-muted/60">Guest visitor</p>
                </>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: () => <div className="text-center font-semibold">Status</div>,
        cell: ({ row }) => {
          const status = row.original.status || 'success';
          const denialReason = row.original.denial_reason;
          
          if (status === 'denied') {
            return (
              <div className="flex justify-center px-2">
                <Badge variant="destructive" title={denialReason || 'Access denied'} className="cursor-help">
                  Denied
                </Badge>
              </div>
            );
          }
          
          return (
            <div className="flex justify-center px-2">
              {row.original.checked_out_at ? (
                <Badge variant="secondary">Completed</Badge>
              ) : (
                <Badge variant="default" className="bg-success/20 text-success border-success/30">Active</Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "checked_in_at",
        header: () => <div className="text-center font-semibold">Checked In</div>,
        cell: ({ row }) => {
          const date = new Date(row.original.checked_in_at);
          return (
            <div className="space-y-1.5 text-center px-2">
              <p className="text-sm font-semibold text-text whitespace-nowrap">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-xs text-muted/60 whitespace-nowrap">
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
        header: () => <div className="text-center font-semibold">Checked Out</div>,
        cell: ({ row }) => {
          const status = row.original.status || 'success';
          
          // If denied, show N/A
          if (status === 'denied') {
            return (
              <div className="text-center px-2">
                <span className="text-sm text-muted/60">N/A</span>
              </div>
            );
          }
          
          if (row.original.checked_out_at) {
            const date = new Date(row.original.checked_out_at);
            return (
              <div className="space-y-1.5 text-center px-2">
                <p className="text-sm font-semibold text-text whitespace-nowrap">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xs text-muted/60 whitespace-nowrap">
                  {timeFormat === '12h'
                    ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                  }
                </p>
              </div>
            );
          }
          return (
            <div className="flex items-center justify-center gap-2 px-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse flex-shrink-0"></div>
              <span className="text-sm font-medium text-success whitespace-nowrap">Still in gym</span>
            </div>
          );
        },
      },
      {
        accessorKey: "duration_minutes",
        header: () => <div className="text-center font-semibold">Duration</div>,
        cell: ({ row }) => {
          const status = row.original.status || 'success';
          const minutes = row.original.duration_minutes;
          
          // If denied, show N/A
          if (status === 'denied') {
            return (
              <div className="text-center px-2">
                <span className="text-sm text-muted/60">N/A</span>
              </div>
            );
          }
          
          if (!minutes) {
            return (
              <div className="flex items-center justify-center gap-2 px-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
                <span className="text-sm text-muted whitespace-nowrap">Active session</span>
              </div>
            );
          }
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
          
          return (
            <div className="space-y-1.5 text-center px-2">
              <p className="text-sm font-bold text-text whitespace-nowrap">{duration}</p>
              <p className="text-xs text-muted/60 whitespace-nowrap">
                {minutes < 60 ? "Short session" : minutes > 180 ? "Extended session" : "Regular session"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "method",
        header: () => <div className="text-center font-semibold">Method</div>,
        cell: ({ row }) => {
          const method = row.original.method ?? "manual";
          const isQR = method === "qr";
          
          return (
            <div className="flex justify-center px-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap ${
                isQR 
                  ? "bg-primary/10 text-primary border-primary/30" 
                  : "bg-accent/10 text-accent border-accent/30"
              }`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isQR ? "bg-primary" : "bg-accent"
                }`}></div>
                {isQR ? "QR Scan" : "Manual"}
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-center font-semibold">Actions</div>,
        cell: ({ row }) => {
          const status = row.original.status || 'success';
          
          // If denied, no actions available
          if (status === 'denied') {
            return (
              <div className="flex justify-center px-2">
                <span className="text-sm text-muted/60 whitespace-nowrap">No actions</span>
              </div>
            );
          }
          
          return (
            <div className="flex justify-center px-2">
              <CheckoutButton
                checkinId={row.original.id}
                memberName={row.original.member_name ?? "Walk-in"}
                isCheckedOut={!!row.original.checked_out_at}
              />
            </div>
          );
        },
      },
    ],
    [timeFormat]
  );

  const filteredData = data.filter((checkIn) => {
    const matchesMethod = methodFilter ? checkIn.method === methodFilter : true;
    const matchesSearch = search
      ? (checkIn.member_name ?? "").toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesMethod && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Premium Filters Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg sm:rounded-xl blur-lg"></div>
        <div className="relative bg-surface/40 backdrop-blur-sm rounded-lg sm:rounded-xl border border-surface/50 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 sm:h-4 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary">
                  Search Members
                </label>
              </div>
              <div className="relative group">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Type member name..."
                  className="bg-card/60 border-surface/60 focus:border-primary/50 focus:bg-card/80 transition-all duration-300 pl-3 sm:pl-4 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base text-text placeholder:text-muted/60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
            
            <div className="lg:w-64 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 sm:h-4 bg-gradient-to-b from-accent to-secondary rounded-full"></div>
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-accent">
                  Filter Method
                </label>
              </div>
              <div className="relative group">
                <Select 
                  value={methodFilter} 
                  onChange={(event) => setMethodFilter(event.target.value)}
                  className="bg-card/60 border-surface/60 focus:border-accent/50 focus:bg-card/80 transition-all duration-300 rounded-lg text-sm sm:text-base text-text"
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
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-surface/30">
            <p className="text-[10px] sm:text-xs text-muted/80 font-medium">
              Showing <span className="text-primary font-bold">{filteredData.length}</span> of{" "}
              <span className="text-accent font-bold">{data.length}</span> check-ins
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Data Table */}
      <div className="relative">
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
}
