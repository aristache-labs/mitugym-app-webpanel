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
        <div className="flex items-center gap-2">
          <Link href="/members/new">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      }
    />
  );
}
