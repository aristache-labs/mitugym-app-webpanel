"use client";

import { StaffContext } from "@/lib/auth";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import Link from "next/link";

export function Topbar({ staff }: { staff: StaffContext }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const dateString = format(currentTime, "EEEE, MMMM d, yyyy");
  const timeString = format(currentTime, "h:mm a");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-b border-surface/40 shadow-lg shadow-black/10">
      {/* Subtle gradient overlay for visual depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="relative mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 lg:px-10">
        {/* Left: MITUGYM Branding */}
        <div className="flex items-center gap-6 ml-8 lg:ml-12">
          <Link href="/dashboard" className="group transition-all duration-200 hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-primary group-hover:text-accent transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(77,212,212,0.6)] leading-none">
                MITUGYM
              </div>
              <span className="text-[12px] uppercase tracking-[0.2em] text-muted/70 font-medium group-hover:text-muted transition-all duration-200 leading-none mt-1.5">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Welcome Message */}
        <div className="flex-1 flex justify-center">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted/70 font-medium">Welcome back</p>
            <p className="text-lg font-semibold bg-gradient-to-r from-text via-primary to-secondary bg-clip-text text-transparent">
              {staff.profile.full_name ?? staff.user.email}
            </p>
          </div>
        </div>

        {/* Right: Date and Time */}
        <div className="text-right">
          <div className="text-xs text-muted/70 font-medium">{dateString}</div>
          <div className="text-lg font-semibold text-text tabular-nums">{timeString}</div>
        </div>
      </div>
    </header>
  );
}
