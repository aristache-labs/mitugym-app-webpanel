"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import type { ApiLog } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";

interface ApiLogTableProps {
  logs: ApiLog[];
  timeFormat?: TimeFormat;
}

function getStatusBadgeVariant(statusCode: number): "default" | "success" | "warning" | "destructive" {
  if (statusCode >= 200 && statusCode < 300) return "success";
  if (statusCode >= 400 && statusCode < 500) return "warning";
  if (statusCode >= 500) return "destructive";
  return "default";
}

function getActionBadge(action: string | null | undefined) {
  if (!action) return null;
  
  const colors: Record<string, string> = {
    checkin: "bg-success/20 text-success border-success/30",
    checkout: "bg-warning/20 text-warning border-warning/30",
    verify: "bg-primary/20 text-primary border-primary/30",
  };

  return (
    <Badge className={colors[action] || "bg-muted/20 text-muted border-muted/30"}>
      {action.charAt(0).toUpperCase() + action.slice(1)}
    </Badge>
  );
}

export function ApiLogTable({ logs, timeFormat = '24h' }: ApiLogTableProps) {
  const columns = useMemo<ColumnDef<ApiLog>[]>(() => [
    {
      accessorKey: "created_at",
      header: "Timestamp",
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        const dateStr = date.toLocaleDateString();
        const timeStr = timeFormat === '12h' 
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
          : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        return (
          <div className="flex flex-col">
            <span className="text-sm text-text">{dateStr}</span>
            <span className="text-xs text-muted/60">{timeStr}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "api_action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          {getActionBadge(row.original.api_action)}
        </div>
      ),
    },
    {
      accessorKey: "member_name",
      header: "Member",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-text font-semibold">
            {row.original.member_name || 'Unknown'}
          </span>
          {row.original.member_id && (
            <span className="text-xs text-muted/60 font-mono">
              {row.original.member_id.slice(0, 8)}...
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "endpoint",
      header: "Endpoint",
      cell: ({ row }) => (
        <code className="text-xs bg-surface/40 px-2 py-1 rounded border border-surface/60 text-primary">
          {row.original.method} {row.original.endpoint}
        </code>
      ),
    },
    {
      accessorKey: "status_code",
      header: "Status",
      cell: ({ row }) => {
        const statusCode = row.original.status_code;
        const variant = getStatusBadgeVariant(statusCode);
        const Icon = row.original.success ? CheckCircle2 : AlertCircle;
        
        return (
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${
              row.original.success ? 'text-success' : 'text-error'
            }`} />
            <Badge variant={variant}>
              {statusCode}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "duration_ms",
      header: "Duration",
      cell: ({ row }) => {
        const duration = row.original.duration_ms;
        if (duration === null || duration === undefined) return (
          <span className="text-muted/40">-</span>
        );
        
        const color = duration < 100 ? 'text-success' : duration < 500 ? 'text-warning' : 'text-error';
        
        return (
          <span className={`text-sm font-mono ${color}`}>
            {duration}ms
          </span>
        );
      },
    },
    {
      accessorKey: "error_message",
      header: "Error",
      cell: ({ row }) => {
        const error = row.original.error_message;
        if (!error) return <span className="text-muted/40">-</span>;
        
        return (
          <div className="max-w-xs">
            <span className="text-xs text-error line-clamp-2" title={error}>
              {error}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "ip_address",
      header: "IP Address",
      cell: ({ row }) => (
        <code className="text-xs font-mono text-muted/70">
          {row.original.ip_address || '-'}
        </code>
      ),
    },
  ], [timeFormat]);

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-muted/40 mx-auto mb-4" />
        <p className="text-muted/60">No API logs yet</p>
        <p className="text-sm text-muted/40 mt-1">
          Logs will appear here when the check-in API is used
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted/70">
              {logs.filter(l => l.success).length} successful
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-error" />
            <span className="text-sm text-muted/70">
              {logs.filter(l => !l.success).length} failed
            </span>
          </div>
        </div>
        <span className="text-sm text-muted/60">
          Showing {logs.length} most recent logs
        </span>
      </div>
      <DataTable columns={columns} data={logs} />
    </div>
  );
}

