"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { downloadCsv, generateCsv } from "@/lib/csv";
import type { Member } from "@/types";
import { memberColumns } from "./columns";
import Link from "next/link";
import { Plus } from "lucide-react";

const csvColumns = [
  { header: "Name", accessor: (member: Member) => member.full_name },
  { header: "Email", accessor: (member: Member) => member.email },
  { header: "Status", accessor: (member: Member) => member.status },
  { header: "Plan", accessor: (member: Member) => member.plan_name ?? "" },
  { header: "Expires", accessor: (member: Member) => member.expires_at ?? "" },
];

export function MembersTable({ members }: { members: Member[] }) {
  const handleExport = () => {
    const csv = generateCsv(members, csvColumns);
    downloadCsv(csv, `mitugym-members-${new Date().toISOString()}.csv`);
  };

  return (
    <DataTable
      columns={memberColumns}
      data={members}
      filterKey="full_name"
      toolbarSlot={
        <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          <Link href="/members/new">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExport} className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4">
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      }
    />
  );
}
