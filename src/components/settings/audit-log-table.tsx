"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import type { AuditLogEntry } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";

interface AuditLogTableProps {
  entries: AuditLogEntry[];
}

function getActionBadgeVariant(action: string): "default" | "success" | "warning" | "destructive" {
  if (action.includes("create")) return "success";
  if (action.includes("update")) return "warning";
  if (action.includes("delete")) return "destructive";
  return "default";
}

function formatActionDescription(entry: AuditLogEntry): string {
  const { action, entity, resource_name } = entry;
  
  switch (action) {
    case "member.create":
      return `Created member ${resource_name || 'Unknown'}`;
    case "member.update":
      return `Updated member ${resource_name || 'Unknown'}`;
    case "member.delete":
      return `Deleted member ${resource_name || 'Unknown'}`;
    case "plan.create":
      return `Created plan "${resource_name || 'Unknown'}"`;
    case "plan.update":
      return `Updated plan "${resource_name || 'Unknown'}"`;
    case "plan.delete":
      return `Deleted plan "${resource_name || 'Unknown'}"`;
    case "schedule.save":
      return "Updated gym schedule";
    case "news.create":
      return `Created announcement "${resource_name || 'Unknown'}"`;
    case "news.update":
      return `Updated announcement "${resource_name || 'Unknown'}"`;
    case "news.delete":
      return `Deleted announcement "${resource_name || 'Unknown'}"`;
    case "checkin.manual_checkout":
      return "Manually checked out member";
    default:
      return `${action} on ${entity || 'unknown'}`;
  }
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'string') {
    // Check if it's a date string and format it nicely
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.*)?$/;
    if (dateRegex.test(value)) {
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch {
        return value;
      }
    }
    return value;
  }
  return String(value);
}

function formatFieldName(field: string): string {
  const fieldMappings: Record<string, string> = {
    'first_name': 'First Name',
    'last_name': 'Last Name', 
    'plan_start': 'Plan Start Date',
    'plan_expiry': 'Plan Expiry Date',
    'membership_status': 'Status',
    'membership_plan': 'Membership Plan',
    'phone': 'Phone Number',
    'email': 'Email Address',
    'gender': 'Gender',
    'status': 'Member Status'
  };
  
  return fieldMappings[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatChanges(changes: Record<string, { before: unknown; after: unknown }> | string | null): React.ReactNode {
  if (!changes) return "—";
  
  // Parse if it's a JSON string
  let parsedChanges: Record<string, { before: unknown; after: unknown }>;
  if (typeof changes === 'string') {
    try {
      parsedChanges = JSON.parse(changes);
    } catch (error) {
      console.error('Failed to parse changes JSON:', error);
      return (
        <span className="text-xs text-destructive">
          Invalid changes format
        </span>
      );
    }
  } else {
    parsedChanges = changes;
  }
  
  if (!parsedChanges || Object.keys(parsedChanges).length === 0) return "—";
  
  const changeEntries = Object.entries(parsedChanges);
  const maxDisplayed = 4;
  
  return (
    <div className="space-y-2 text-xs">
      {changeEntries.slice(0, maxDisplayed).map(([field, change]) => (
        <div key={field} className="bg-surface/30 rounded p-2">
          <div className="font-medium text-foreground mb-1">
            {formatFieldName(field)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground bg-surface/50 px-2 py-1 rounded text-xs">
              {formatValue(change.before)}
            </span>
            <span className="text-foreground">→</span>
            <span className="font-medium bg-primary/10 text-primary px-2 py-1 rounded text-xs">
              {formatValue(change.after)}
            </span>
          </div>
        </div>
      ))}
      {changeEntries.length > maxDisplayed && (
        <div className="text-muted-foreground font-medium">
          +{changeEntries.length - maxDisplayed} more changes
        </div>
      )}
    </div>
  );
}

export function AuditLogTable({ entries }: AuditLogTableProps) {
  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: "When",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">
              {formatDate(row.original.created_at)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDateTime(row.original.created_at)}
            </div>
          </div>
        ),
        size: 140,
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="space-y-2">
            <Badge variant={getActionBadgeVariant(row.original.action)}>
              {row.original.action}
            </Badge>
            <div className="text-sm">
              {formatActionDescription(row.original)}
            </div>
          </div>
        ),
        size: 240,
      },
      {
        accessorKey: "actor_name",
        header: "Who",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">
              {row.original.actor_name || "System"}
            </div>
            {row.original.actor_role && (
              <Badge variant="outline" className="text-xs">
                {row.original.actor_role}
              </Badge>
            )}
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "changes",
        header: "Changes",
        cell: ({ row }) => formatChanges(row.original.changes),
        size: 400,
      },
      {
        accessorKey: "entity_id",
        header: "ID",
        cell: ({ row }) => (
          row.original.entity_id ? (
            <code className="text-xs bg-surface/50 px-2 py-1 rounded">
              {row.original.entity_id.substring(0, 8)}...
            </code>
          ) : "—"
        ),
        size: 80,
      },
    ],
    []
  );

  return <DataTable columns={columns} data={entries} />;
}
