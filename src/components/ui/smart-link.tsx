"use client";

import Link from "next/link";
import { useMemo } from "react";
import { isIOSChromePortrait } from "@/lib/ios-chrome-navigation";

interface SmartLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Smart Link Component
 * 
 * Automatically uses hard navigation (<a href>) for iOS Chrome portrait
 * to avoid scroll restoration bugs, otherwise uses Next.js Link for SPA navigation.
 * 
 * Use this component instead of Next.js Link when navigating from pages
 * that might be scrolled down (e.g., dashboard, long lists).
 */
export function SmartLink({ href, className, children }: SmartLinkProps) {
  const useHardNav = useMemo(() => isIOSChromePortrait(), []);

  if (useHardNav) {
    // Full navigation = no inherited scroll
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

