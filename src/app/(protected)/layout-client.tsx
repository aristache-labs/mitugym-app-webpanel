"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
  const [hasHydrated, setHasHydrated] = useState(false);
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

  // Ensure we start at the top of the page on initial load and route changes (helps iOS Safari).
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Create or get debug element - make sure it persists
    const getOrCreateDebugElement = () => {
      let debug = document.getElementById('scroll-debug');
      if (!debug) {
        debug = document.createElement('div');
        debug.id = 'scroll-debug';
        // Position at bottom to not block menu button
        debug.style.cssText = 'position: fixed; bottom: 80px; left: 5px; right: 5px; background: rgba(255,0,0,0.95); color: white; padding: 8px; font-size: 9px; z-index: 99999; max-height: 30vh; overflow-y: auto; font-family: monospace; pointer-events: none; line-height: 1.2;';
        document.body.appendChild(debug);
      }
      return debug;
    };

    const logDebug = (msg: string) => {
      console.log('[REACT LAYOUT]', msg, 'pathname:', pathname, 'scrollY:', window.scrollY);
      const debug = getOrCreateDebugElement();
      const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
      debug.innerHTML += '<span style="color: yellow;">' + timestamp + ' REACT: ' + msg + ' path:' + pathname.substring(0, 20) + '</span><br>';
      // Auto-scroll to bottom
      debug.scrollTop = debug.scrollHeight;
    };

    // Force manual scroll restoration to avoid Safari auto-scrolling offset on first load
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
      logDebug('Set scrollRestoration=manual');
    }

    const scrollToTop = () => {
      const before = window.scrollY;
      // Multiple aggressive scroll attempts for iOS
      window.scrollTo(0, 0);
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Force layout recalculation
      if (document.body) {
        document.body.style.overflow = 'hidden';
        void document.body.offsetHeight; // Force reflow
        document.body.style.overflow = '';
      }
      
      forceViewport();
      const after = window.scrollY;
      if (before !== after) {
        logDebug('scrollToTop: ' + before + '->' + after);
      }
    };

    // First hydration - be extra aggressive on iOS
    if (!hasHydrated) {
      logDebug('🔵 FIRST HYDRATION scrollY=' + window.scrollY);
      setHasHydrated(true);
      // Multiple attempts with different timings for iOS
      scrollToTop();
      requestAnimationFrame(() => { logDebug('RAF'); scrollToTop(); });
      setTimeout(() => { logDebug('t+10ms'); scrollToTop(); }, 10);
      setTimeout(() => { logDebug('t+50ms'); scrollToTop(); }, 50);
      setTimeout(() => { logDebug('t+100ms'); scrollToTop(); }, 100);
      setTimeout(() => { logDebug('t+200ms'); scrollToTop(); }, 200);
      setTimeout(() => { 
        logDebug('✅ DONE scrollY=' + window.scrollY);
        // Hide debug after 8 seconds
        setTimeout(() => {
          const debug = document.getElementById('scroll-debug');
          if (debug) debug.style.display = 'none';
        }, 8000);
      }, 500);
      return;
    }

    // Subsequent route changes
    logDebug('🔄 ROUTE CHANGE scrollY=' + window.scrollY);
    scrollToTop();
    requestAnimationFrame(() => { logDebug('RAF route'); scrollToTop(); });
    setTimeout(() => { logDebug('t+30ms route'); scrollToTop(); }, 30);
    setTimeout(() => { 
      logDebug('t+100ms route'); 
      scrollToTop();
      logDebug('✅ ROUTE DONE scrollY=' + window.scrollY);
    }, 100);
  }, [pathname, hasHydrated]);

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

