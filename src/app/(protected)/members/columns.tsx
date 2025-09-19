"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { Member } from "@/types";
import { formatDate } from "@/lib/utils";
import { MemberStatusBadge } from "@/components/members/member-status-badge";

export const memberColumns: ColumnDef<Member>[] = [
  {
    accessorKey: "full_name",
    header: "Member",
    cell: ({ row }) => (
      <Link href={`/members/${row.original.id}`} className="font-semibold text-primary hover:text-accent">
        {row.original.full_name}
      </Link>
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
];
