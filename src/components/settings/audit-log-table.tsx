"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import type { AuditLogEntry } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";

// Special entity IDs for system-wide operations (must match backend)
const SYSTEM_ENTITY_IDS = {
  GYM_SCHEDULE: "00000000-0000-0000-0000-000000000001",
  SYSTEM_SETTINGS: "00000000-0000-0000-0000-000000000002",
  BULK_OPERATIONS: "00000000-0000-0000-0000-000000000003",
} as const;

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
  
  // Handle objects (like deletion records)
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    
    // Handle deletion/creation objects
    if ('name' in obj || 'title' in obj) {
      const name = obj.name || obj.title;
      const price = obj.price ? ` (${obj.price})` : '';
      const duration = obj.duration ? ` - ${obj.duration}` : '';
      return `${name}${price}${duration}`;
    }
    
    // For other objects, show a summary
    return `{${Object.keys(obj).length} properties}`;
  }
  
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
    // Member fields
    'first_name': 'First Name',
    'last_name': 'Last Name', 
    'plan_start': 'Plan Start Date',
    'plan_expiry': 'Plan Expiry Date',
    'membership_status': 'Status',
    'membership_plan': 'Membership Plan',
    'phone': 'Phone Number',
    'email': 'Email Address',
    'gender': 'Gender',
    'status': 'Member Status',
    
    // Schedule fields
    'monday_open': 'Monday Opening',
    'monday_close': 'Monday Closing',
    'monday_status': 'Monday Status',
    'tuesday_open': 'Tuesday Opening',
    'tuesday_close': 'Tuesday Closing',
    'tuesday_status': 'Tuesday Status',
    'wednesday_open': 'Wednesday Opening',
    'wednesday_close': 'Wednesday Closing',
    'wednesday_status': 'Wednesday Status',
    'thursday_open': 'Thursday Opening',
    'thursday_close': 'Thursday Closing',
    'thursday_status': 'Thursday Status',
    'friday_open': 'Friday Opening',
    'friday_close': 'Friday Closing',
    'friday_status': 'Friday Status',
    'saturday_open': 'Saturday Opening',
    'saturday_close': 'Saturday Closing',
    'saturday_status': 'Saturday Status',
    'sunday_open': 'Sunday Opening',
    'sunday_close': 'Sunday Closing',
    'sunday_status': 'Sunday Status',
    'monday_created': 'Monday Schedule',
    'tuesday_created': 'Tuesday Schedule',
    'wednesday_created': 'Wednesday Schedule',
    'thursday_created': 'Thursday Schedule',
    'friday_created': 'Friday Schedule',
    'saturday_created': 'Saturday Schedule',
    'sunday_created': 'Sunday Schedule',
    
    // Plan fields
    'name': 'Plan Name',
    'price': 'Price',
    'duration': 'Duration',
    'features': 'Features',
    'display_order': 'Display Order',
    'plan_deleted': 'Plan Deletion',
    
    // News/Announcement fields
    'title': 'Title',
    'content': 'Content',
    'priority': 'Priority Level',
    'expires_at': 'Expiry Date',
    'announcement_deleted': 'Announcement Deletion',
    
    // System/Common fields
    'member_created': 'Member Creation',
    'member_deleted': 'Member Deletion',
    'plan_created': 'Plan Creation',
    'announcement_created': 'Announcement Creation',
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
        cell: ({ row }) => {
          const { entity_id, action, entity } = row.original;
          
          if (!entity_id) {
            return "—";
          }
          
          // Handle special system identifiers
          if (entity_id === SYSTEM_ENTITY_IDS.GYM_SCHEDULE) {
            return (
              <code className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                SCHEDULE
              </code>
            );
          }
          
          if (entity_id === SYSTEM_ENTITY_IDS.SYSTEM_SETTINGS) {
            return (
              <code className="text-xs bg-warning/10 text-warning px-2 py-1 rounded">
                SETTINGS
              </code>
            );
          }
          
          if (entity_id === SYSTEM_ENTITY_IDS.BULK_OPERATIONS) {
            return (
              <code className="text-xs bg-info/10 text-info px-2 py-1 rounded">
                BULK
              </code>
            );
          }
          
          return (
            <code className="text-xs bg-surface/50 px-2 py-1 rounded">
              {entity_id.substring(0, 8)}...
            </code>
          );
        },
        size: 80,
      },
    ],
    []
  );

  return <DataTable columns={columns} data={entries} />;
}
