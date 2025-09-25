"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Member } from "@/types";
import { formatDate } from "@/lib/utils";
import { MemberStatusBadge } from "@/components/members/member-status-badge";
import { MemberActions } from "@/components/members/member-actions";

export const memberColumns: ColumnDef<Member>[] = [
  {
    accessorKey: "full_name",
    header: "Member",
    cell: ({ row }) => (
      <span className="font-semibold text-text">
        {row.original.full_name}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <MemberStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "plan_name",
    header: "Plan",
    cell: ({ row }) => row.original.plan_name ?? "Unassigned",
  },
  {
    accessorKey: "expires_at",
    header: "Expires",
    cell: ({ row }) => formatDate(row.original.expires_at),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <MemberActions 
        memberId={row.original.id} 
        memberName={row.original.full_name} 
      />
    ),
  },
];
