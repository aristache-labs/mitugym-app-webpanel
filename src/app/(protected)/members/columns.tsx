"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Member } from "@/types";
import { formatDate } from "@/lib/utils";
import { MemberStatusBadge } from "@/components/members/member-status-badge";
import { MemberActions } from "@/components/members/member-actions";
import Image from "next/image";
import { User } from "lucide-react";

export const memberColumns: ColumnDef<Member>[] = [
  {
    accessorKey: "full_name",
    header: "Member",
    cell: ({ row }) => {
      const initials = row.original.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
            {row.original.avatar_url ? (
              <Image
                src={row.original.avatar_url}
                alt={row.original.full_name}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                <span className="text-sm font-bold text-primary">
                  {initials}
                </span>
              </div>
            )}
          </div>
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
