"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { AnimatedExportButton } from "@/components/ui/animated-export-button";
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
        <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-auto">
          <Link href="/members/new">
            <Button variant="ghost" className="gap-2 h-9 sm:h-10 text-xs sm:text-sm px-4 sm:px-6 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 hover:from-slate-700 hover:via-slate-700/95 hover:to-slate-800 text-slate-100 hover:text-white transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 backdrop-blur-sm font-medium !border-none hover:!border-none focus:!border-none focus-visible:!border-none !ring-0 hover:!ring-0 focus:!ring-0 focus-visible:!ring-0 !ring-offset-0 !outline-none hover:!scale-100">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
          <AnimatedExportButton onClick={handleExport} />
        </div>
      }
    />
  );
}
