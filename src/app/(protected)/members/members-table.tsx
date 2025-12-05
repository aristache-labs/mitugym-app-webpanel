"use client";

import { DataTable } from "@/components/data-table/data-table";
import { AnimatedAddButton } from "@/components/ui/animated-add-button";
import { AnimatedExportButton } from "@/components/ui/animated-export-button";
import { downloadCsv, generateCsv } from "@/lib/csv";
import type { Member } from "@/types";
import { memberColumns } from "./columns";
import { useRouter } from "next/navigation";

const csvColumns = [
  { header: "Name", accessor: (member: Member) => member.full_name },
  { header: "Email", accessor: (member: Member) => member.email },
  { header: "Status", accessor: (member: Member) => member.status },
  { header: "Plan", accessor: (member: Member) => member.plan_name ?? "" },
  { header: "Expires", accessor: (member: Member) => member.expires_at ?? "" },
];

export function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter();

  const handleAddMember = () => {
    router.push("/members/new");
  };

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
          <AnimatedAddButton onClick={handleAddMember} />
          <AnimatedExportButton onClick={handleExport} />
        </div>
      }
    />
  );
}
