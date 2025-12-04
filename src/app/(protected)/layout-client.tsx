"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useMobileNav } from "@/hooks/use-mobile-nav";
import type { StaffContext } from "@/lib/auth";
import type { TimeFormat } from "@/lib/settings";

type ProtectedLayoutClientProps = {
  staff: StaffContext;
  timezone: string;
  timeFormat: TimeFormat;
  children: ReactNode;
};

export function ProtectedLayoutClient({
  staff,
  timezone,
  timeFormat,
  children,
}: ProtectedLayoutClientProps) {
  const { isOpen, toggle, close } = useMobileNav();

  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <Topbar
        staff={staff}
        timezone={timezone}
        timeFormat={timeFormat}
        onMenuClick={toggle}
      />

      {/* Main Content with top padding to account for fixed header */}
      <div className="pt-16 lg:pt-20">
        <div className="mx-auto flex max-w-[1600px] gap-0 lg:gap-6 px-0 lg:px-4 py-4 lg:py-6 xl:px-10">
          <Sidebar isOpen={isOpen} onClose={close} />
          <main className="flex-1 space-y-6 px-4 lg:px-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

