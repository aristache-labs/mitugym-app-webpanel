"use client";

import { StaffContext } from "@/lib/auth";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, Menu } from "lucide-react";
import type { TimeFormat } from "@/lib/settings";

type TopbarProps = {
  staff: StaffContext;
  timezone: string;
  timeFormat: TimeFormat;
  onMenuClick?: () => void;
};

export function Topbar({ staff, timezone, timeFormat, onMenuClick }: TopbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // Update time every minute
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Convert current time to the configured timezone
  const zonedTime = toZonedTime(currentTime, timezone);
  const dateString = format(zonedTime, "EEEE, MMMM d, yyyy");
  const timeString = timeFormat === '12h' 
    ? format(zonedTime, "h:mm a")
    : format(zonedTime, "HH:mm");
  
  // Get timezone abbreviation (e.g., "EET", "PST", "UTC")
  const timezoneAbbr = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short'
  }).formatToParts(currentTime).find(part => part.type === 'timeZoneName')?.value || timezone.split('/')[1];

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-b border-surface/40 shadow-lg shadow-black/10"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        top: 0,
      }}
    >
      {/* Subtle gradient overlay for visual depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="relative mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 lg:px-10 lg:py-4">
        {/* Left: Hamburger Menu (Mobile) + MITUGYM Branding */}
        <div className="flex items-center gap-3 lg:gap-6 lg:ml-12">
          {/* Hamburger Button - Only visible on mobile/tablet */}
          <button
            onClick={onMenuClick}
            className="rounded-xl p-2 text-primary transition-all duration-200 hover:bg-primary/10 active:scale-95 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/dashboard" className="group transition-all duration-200 hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-primary group-hover:text-accent transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(77,212,212,0.6)] leading-none lg:text-2xl">
                MITUGYM
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted/70 font-medium group-hover:text-muted transition-all duration-200 leading-none mt-1 lg:text-[12px] lg:mt-1.5">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Welcome Message (Hidden on mobile) */}
        <div className="hidden flex-1 justify-center lg:flex">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted/70 font-medium">Welcome back</p>
            <p className="text-lg font-semibold bg-gradient-to-r from-text via-primary to-secondary bg-clip-text text-transparent">
              {staff.profile.full_name ?? staff.user.email}
            </p>
          </div>
        </div>

        {/* Right: Date and Time with Timezone */}
        <div className="text-right">
          {/* Full date - hidden on mobile */}
          <div className="hidden text-xs text-muted/70 font-medium lg:block">{dateString}</div>
          
          <div className="flex items-center justify-end gap-2">
            <div className="text-base font-semibold text-text tabular-nums lg:text-lg">
              {mounted ? timeString : '--:--'}
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
              <Globe className="w-3 h-3 text-primary/70" />
              <span className="text-[10px] font-medium text-primary/70 uppercase tracking-wider">{timezoneAbbr}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
