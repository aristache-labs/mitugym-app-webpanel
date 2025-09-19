import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { requireStaff } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const staff = await requireStaff();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-10 lg:px-10">
        <Sidebar />
        <main className="flex-1 space-y-6">
          <Topbar staff={staff} />
          {children}
        </main>
      </div>
    </div>
  );
}
