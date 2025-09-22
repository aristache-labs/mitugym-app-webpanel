"use client";

import { StaffContext } from "@/lib/auth";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export function Topbar({ staff }: { staff: StaffContext }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const dateString = format(currentTime, "EEEE, MMM d");
  const timeString = format(currentTime, "HH:mm");

  return (
    <header className="flex items-center justify-between rounded-[20px] border border-surface/40 bg-surface/40 px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-muted">Welcome back</p>
        <p className="text-lg font-semibold text-text">{staff.profile.full_name ?? staff.user.email}</p>
      </div>
      <div className="text-right">
        <div className="text-xs text-muted">{dateString}</div>
        <div className="text-lg font-semibold text-text">{timeString}</div>
      </div>
    </header>
  );
}
