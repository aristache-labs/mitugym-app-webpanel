"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const isMobile = () =>
  typeof window !== "undefined" &&
  !window.matchMedia("(min-width: 640px)").matches;

const isIOSChrome = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // CriOS = Chrome on iOS (WebKit under the hood)
  return /CriOS/i.test(ua);
};

const isPortrait = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(orientation: portrait)").matches;
};

export default function MobileScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isMobile()) return;

    // Prevent browser from re-applying previous scroll after navigation
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    const scrollEl = document.scrollingElement || document.documentElement;

    const forceTop = () => {
      // Window/document scroll
      scrollEl.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });

      // If you have a scroll container, reset it too (optional)
      const container =
        (document.querySelector("[data-app-scroll]") as HTMLElement | null) ||
        (document.querySelector("#app-scroll") as HTMLElement | null);
      if (container) container.scrollTop = 0;
    };

    // Base attempts (works for most browsers)
    requestAnimationFrame(() => {
      forceTop();
      setTimeout(forceTop, 0);
      setTimeout(forceTop, 50);
      setTimeout(forceTop, 150);
    });

    // Extra: iOS Chrome portrait can restore/resize late -> wait for visualViewport to settle
    if (isIOSChrome() && isPortrait() && window.visualViewport) {
      let lastH = window.visualViewport.height;
      let stableCount = 0;
      let rafId = 0;

      const checkStable = () => {
        const h = window.visualViewport!.height;
        if (Math.abs(h - lastH) < 0.5) stableCount += 1;
        else stableCount = 0;

        lastH = h;

        if (stableCount >= 3) {
          forceTop();
          return;
        }
        rafId = requestAnimationFrame(checkStable);
      };

      // Kick it off and also re-run once after a small delay
      rafId = requestAnimationFrame(checkStable);
      const t = setTimeout(() => {
        stableCount = 0;
        lastH = window.visualViewport!.height;
        requestAnimationFrame(checkStable);
      }, 250);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(t);
      };
    }
  }, [pathname, searchParams]);

  return null;
}
