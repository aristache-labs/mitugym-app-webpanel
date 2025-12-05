"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Member } from "@/types";
import { formatDate } from "@/lib/utils";
import { MemberStatusBadge } from "@/components/members/member-status-badge";
import { MemberActions } from "@/components/members/member-actions";
import { AvatarWithPreview } from "@/components/members/avatar-preview-modal";

export const memberColumns: ColumnDef<Member>[] = [
  {
    accessorKey: "full_name",
    header: () => <div className="text-left">Member</div>,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <AvatarWithPreview
            avatarUrl={row.original.avatar_url}
            memberName={row.original.full_name}
            size="small"
          />
          <span className="font-semibold text-text whitespace-nowrap">
            {row.original.full_name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.email}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <MemberStatusBadge status={row.original.status} />
      </div>
    ),
  },
  {
    accessorKey: "plan_name",
    header: "Plan",
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.plan_name ?? "Unassigned"}
      </div>
    ),
  },
  {
    accessorKey: "expires_at",
    header: "Expires",
    cell: ({ row }) => (
      <div className="text-center">
        {formatDate(row.original.expires_at)}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <MemberActions 
          memberId={row.original.id} 
          memberName={row.original.full_name} 
        />
      </div>
    ),
  },
];
