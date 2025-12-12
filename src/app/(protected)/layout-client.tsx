"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const viewportContent =
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

  const forceViewport = () => {
    if (typeof document === "undefined") return;
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    meta.setAttribute("content", viewportContent);
    // Run a second time shortly after to help Safari apply it during transitions
    setTimeout(() => meta.setAttribute("content", viewportContent), 50);
  };

  // Force viewport reset on route changes (helps iOS Safari viewport issues)
  useEffect(() => {
    forceViewport();
  }, [pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Fixed Header */}
      <Topbar
        staff={staff}
        timezone={timezone}
        timeFormat={timeFormat}
        onMenuClick={toggle}
      />

      {/* Main Content with top padding to account for fixed header + safe area */}
      <div className="safe-area-content">
        <div className="mx-auto flex max-w-[1600px] gap-0 lg:gap-6 px-0 lg:px-4 py-4 lg:py-6 xl:px-10">
          <Sidebar isOpen={isOpen} onClose={close} />
          <main className="flex-1 space-y-6 px-4 lg:px-0 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

