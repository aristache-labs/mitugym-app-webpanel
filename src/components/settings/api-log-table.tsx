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
  statsOnly?: boolean;
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

export function ApiLogTable({ logs, timeFormat = '24h', statsOnly = false }: ApiLogTableProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const successful = logs.filter(l => l.success).length;
    const failed = logs.filter(l => !l.success).length;
    const rateLimited = logs.filter(l => l.status_code === 429).length;
    const avgDuration = logs.length > 0
      ? Math.round(logs.reduce((acc, l) => acc + (l.duration_ms || 0), 0) / logs.length)
      : 0;

    return { total, successful, failed, rateLimited, avgDuration };
  }, [logs]);

  const columns = useMemo<ColumnDef<ApiLog>[]>(() => [
    {
      accessorKey: "created_at",
      header: () => <div className="text-center md:text-left">Timestamp</div>,
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        const dateStr = date.toLocaleDateString();
        const timeStr = timeFormat === '12h' 
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
          : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        return (
          <div className="flex flex-col min-w-[120px] px-2 text-center md:text-left">
            <span className="text-xs sm:text-sm text-text">{dateStr}</span>
            <span className="text-[10px] sm:text-xs text-muted/60">{timeStr}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "api_action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 min-w-[120px] px-2">
          <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
          {getActionBadge(row.original.api_action)}
        </div>
      ),
    },
    {
      accessorKey: "member_name",
      header: () => <div className="text-center">Member</div>,
      cell: ({ row }) => (
        <div className="flex flex-col min-w-[140px] px-2 text-center">
          <span className="text-xs sm:text-sm text-text font-semibold">
            {row.original.member_name || 'Unknown'}
          </span>
          {row.original.member_id && (
            <span className="text-[10px] sm:text-xs text-muted/60 font-mono">
              {row.original.member_id.slice(0, 8)}...
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "endpoint",
      header: () => <div className="text-center">Endpoint</div>,
      cell: ({ row }) => (
        <div className="min-w-[180px] px-2 flex justify-center">
          <code className="text-[10px] sm:text-xs bg-surface/40 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-surface/60 text-primary break-all">
            {row.original.method} {row.original.endpoint}
          </code>
        </div>
      ),
    },
    {
      accessorKey: "status_code",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const statusCode = row.original.status_code;
        const variant = getStatusBadgeVariant(statusCode);
        const Icon = row.original.success ? CheckCircle2 : AlertCircle;
        
        return (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 min-w-[100px] px-2">
            <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${
              row.original.success ? 'text-success' : 'text-error'
            }`} />
            <Badge variant={variant} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
              {statusCode}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "duration_ms",
      header: () => <div className="text-center">Duration</div>,
      cell: ({ row }) => {
        const duration = row.original.duration_ms;
        if (duration === null || duration === undefined) return (
          <div className="text-center min-w-[80px] px-2">
            <span className="text-muted/40">-</span>
          </div>
        );
        
        const color = duration < 100 ? 'text-success' : duration < 500 ? 'text-warning' : 'text-error';
        
        return (
          <div className="text-center min-w-[80px] px-2">
            <span className={`text-xs sm:text-sm font-mono ${color}`}>
              {duration}ms
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "error_message",
      header: () => <div className="text-center">Error</div>,
      cell: ({ row }) => {
        const error = row.original.error_message;
        if (!error) return (
          <div className="text-center min-w-[100px] px-2">
            <span className="text-muted/40">-</span>
          </div>
        );
        
        return (
          <div className="min-w-[140px] px-2">
            <span className="text-[10px] sm:text-xs text-error line-clamp-2 text-center" title={error}>
              {error}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "ip_address",
      header: () => <div className="text-center">IP Address</div>,
      cell: ({ row }) => (
        <div className="text-center min-w-[120px] px-2">
          <code className="text-[10px] sm:text-xs font-mono text-muted/70">
            {row.original.ip_address || '-'}
          </code>
        </div>
      ),
    },
  ], [timeFormat]);

  // Statistics component
  const statsComponent = (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 p-2.5 sm:p-3 bg-surface/30 rounded-lg border border-surface/40">
      {/* Total Requests */}
      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <p className="text-[10px] sm:text-xs text-muted/60 mb-0.5">Total Requests</p>
        <p className="text-base sm:text-xl font-bold text-text">{stats.total}</p>
      </div>
      
      {/* Successful */}
      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <p className="text-[10px] sm:text-xs text-muted/60 mb-0.5">Successful</p>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-success animate-pulse" />
          <p className="text-base sm:text-xl font-bold text-success">{stats.successful}</p>
        </div>
      </div>
      
      {/* Failed */}
      <div className="flex flex-col items-center text-center md:items-start md:text-left col-span-2 sm:col-span-1">
        <p className="text-[10px] sm:text-xs text-muted/60 mb-0.5">Failed</p>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-error" />
          <p className="text-base sm:text-xl font-bold text-error">{stats.failed}</p>
        </div>
      </div>
      
      {/* Rate Limited - Second row on mobile, same row on tablet/desktop */}
      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <p className="text-[10px] sm:text-xs text-muted/60 mb-0.5">Rate Limited</p>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-warning" />
          <p className="text-base sm:text-xl font-bold text-warning">{stats.rateLimited}</p>
        </div>
      </div>
      
      {/* Avg Response */}
      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <p className="text-[10px] sm:text-xs text-muted/60 mb-0.5">Avg Response</p>
        <p className="text-base sm:text-xl font-bold text-primary">{stats.avgDuration}ms</p>
      </div>
    </div>
  );

  if (logs.length === 0) {
    return (
      <div>
        {statsComponent}
        <div className="text-center py-6 sm:py-8 mt-3 sm:mt-4">
          <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-muted/40 mx-auto mb-2 sm:mb-3" />
          <p className="text-xs sm:text-sm text-muted/60">No API logs yet</p>
          <p className="text-[10px] sm:text-xs text-muted/40 mt-1">
            Logs will appear here when the check-in API is used
          </p>
        </div>
      </div>
    );
  }

  // If statsOnly mode, just return statistics
  if (statsOnly) {
    return statsComponent;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {statsComponent}
      <DataTable columns={columns} data={logs} />
    </div>
  );
}


