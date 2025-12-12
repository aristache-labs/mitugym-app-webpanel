"use client";

import { useEffect } from "react";

interface MobilePageTransitionProps {
  children: React.ReactNode;
}

export function MobilePageTransition({ children }: MobilePageTransitionProps) {
  useEffect(() => {
    // Force scroll to top on mount for mobile only
    if (window.innerWidth < 640) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

  return (
    <div className="sm:contents">
      <div className="animate-mobileSlideIn sm:animate-none">
        {children}
      </div>
    </div>
  );
}
