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
    header: "Member",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <AvatarWithPreview
            avatarUrl={row.original.avatar_url}
            memberName={row.original.full_name}
            size="small"
          />
          <span className="font-semibold text-text">
            {row.original.full_name}
          </span>
        </div>
      );
    },
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
