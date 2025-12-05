"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import type { AuditLogEntry } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { formatDate, formatDateTime } from "@/lib/utils";

// Special entity IDs for system-wide operations (must match backend)
const SYSTEM_ENTITY_IDS = {
  GYM_SCHEDULE: "00000000-0000-0000-0000-000000000001",
  SYSTEM_SETTINGS: "00000000-0000-0000-0000-000000000002",
  BULK_OPERATIONS: "00000000-0000-0000-0000-000000000003",
} as const;

interface AuditLogTableProps {
  entries: AuditLogEntry[];
  timeFormat?: TimeFormat;
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
    'status': 'Member Status',
    'plan': 'Membership Plan',
    'phone': 'Phone Number',
    'email': 'Email Address',
    'gender': 'Gender',
    
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

function formatChanges(changes: Record<string, { before: unknown; after: unknown }> | string | null | undefined): React.ReactNode {
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
    <div className="space-y-1.5 sm:space-y-2 text-xs">
      {changeEntries.slice(0, maxDisplayed).map(([field, change]) => (
        <div key={field} className="bg-surface/30 rounded p-1.5 sm:p-2">
          <div className="text-[10px] sm:text-xs font-medium text-foreground mb-0.5 sm:mb-1">
            {formatFieldName(field)}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-muted-foreground bg-surface/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">
              {formatValue(change.before)}
            </span>
            <span className="text-foreground text-xs">→</span>
            <span className="font-medium bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">
              {formatValue(change.after)}
            </span>
          </div>
        </div>
      ))}
      {changeEntries.length > maxDisplayed && (
        <div className="text-muted-foreground font-medium text-[10px] sm:text-xs">
          +{changeEntries.length - maxDisplayed} more changes
        </div>
      )}
    </div>
  );
}

export function AuditLogTable({ entries, timeFormat = '24h' }: AuditLogTableProps) {
  const formatDateTimeWithFormat = (value: string | null | undefined): string => {
    if (!value) return "—";
    
    try {
      const date = new Date(value);
      const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (timeFormat === '12h') {
        const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `${datePart}, ${timePart}`;
      } else {
        const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `${datePart}, ${timePart}`;
      }
    } catch (error) {
      console.warn("Failed to format datetime", error);
      return "—";
    }
  };

  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: "When",
        cell: ({ row }) => (
          <div className="space-y-0.5 sm:space-y-1 min-w-[120px] px-2">
            <div className="text-xs sm:text-sm font-medium">
              {formatDate(row.original.created_at)}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              {formatDateTimeWithFormat(row.original.created_at)}
            </div>
          </div>
        ),
        size: 140,
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="space-y-1.5 sm:space-y-2 min-w-[180px] px-2 flex flex-col items-center">
            <Badge variant={getActionBadgeVariant(row.original.action)} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
              {row.original.action}
            </Badge>
            <div className="text-xs sm:text-sm text-center">
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
          <div className="space-y-0.5 sm:space-y-1 min-w-[120px] px-2 flex flex-col items-center">
            <div className="text-xs sm:text-sm font-medium">
              {row.original.actor_name || "System"}
            </div>
            {row.original.actor_role && (
              <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
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
        cell: ({ row }) => (
          <div className="min-w-[200px] px-2 flex justify-center">
            <div className="w-full">
              {formatChanges(row.original.changes)}
            </div>
          </div>
        ),
        size: 400,
      },
      {
        accessorKey: "entity_id",
        header: "ID",
        cell: ({ row }) => {
          const { entity_id } = row.original;
          
          if (!entity_id) {
            return <div className="text-center min-w-[80px] px-2">—</div>;
          }
          
          // Handle special system identifiers
          if (entity_id === SYSTEM_ENTITY_IDS.GYM_SCHEDULE) {
            return (
              <div className="flex justify-center min-w-[80px] px-2">
                <code className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  SCHEDULE
                </code>
              </div>
            );
          }
          
          if (entity_id === SYSTEM_ENTITY_IDS.SYSTEM_SETTINGS) {
            return (
              <div className="flex justify-center min-w-[80px] px-2">
                <code className="text-[10px] sm:text-xs bg-warning/10 text-warning px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  SETTINGS
                </code>
              </div>
            );
          }
          
          if (entity_id === SYSTEM_ENTITY_IDS.BULK_OPERATIONS) {
            return (
              <div className="flex justify-center min-w-[80px] px-2">
                <code className="text-[10px] sm:text-xs bg-info/10 text-info px-1.5 sm:h-4 sm:w-4 rounded">
                  BULK
                </code>
              </div>
            );
          }
          
          return (
            <div className="flex justify-center min-w-[80px] px-2">
              <code className="text-[10px] sm:text-xs bg-surface/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                {entity_id.substring(0, 8)}...
              </code>
            </div>
          );
        },
        size: 80,
      },
    ],
    [timeFormat]
  );

  return <DataTable columns={columns} data={entries} />;
}
