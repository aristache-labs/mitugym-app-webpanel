"use client";

import { useState, useMemo } from "react";
import { CheckinsTable } from "@/app/(protected)/checkins/checkins-table";
import type { CheckIn } from "@/types";
import type { TimeFormat } from "@/lib/settings";

interface CheckinsWithTabsProps {
  data: CheckIn[];
  timeFormat?: TimeFormat;
}

type TabType = "all" | "active" | "denied";

export function CheckinsWithTabs({ data, timeFormat = '24h' }: CheckinsWithTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const filteredData = useMemo(() => {
    switch (activeTab) {
      case "active":
        // Currently in gym (checked in but not checked out)
        return data.filter(checkIn => checkIn.status !== 'denied' && !checkIn.checked_out_at);
      
      case "denied":
        // Denied access attempts
        return data.filter(checkIn => checkIn.status === 'denied');
      
      case "all":
      default:
        return data;
    }
  }, [data, activeTab]);

  const counts = useMemo(() => {
    const activeCount = data.filter(checkIn => checkIn.status !== 'denied' && !checkIn.checked_out_at).length;
    const deniedCount = data.filter(checkIn => checkIn.status === 'denied').length;

    return {
      all: data.length,
      active: activeCount,
      denied: deniedCount
    };
  }, [data]);

  const tabs = [
    { id: "all" as TabType, label: "All Check-ins", count: counts.all },
    { id: "active" as TabType, label: "Currently In Gym", count: counts.active },
    { id: "denied" as TabType, label: "Denied", count: counts.denied }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tabs bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "group relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-2",
                "bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75",
                "text-slate-200 font-medium text-xs sm:text-sm",
                "rounded-2xl backdrop-blur-sm",
                "shadow-md shadow-black/20",
                "transition-all duration-500 ease-out",
                "overflow-hidden",
                "active:scale-95",
                isActive
                  ? "hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 hover:shadow-lg hover:shadow-cyan-950/25"
                  : "opacity-60 hover:opacity-100 hover:from-slate-700/85 hover:via-cyan-900/55 hover:to-slate-700/85",
              ].join(" ")}
            >
              <span className="truncate">{tab.label}</span>
              <span
                className={[
                  "inline-flex items-center justify-center rounded-full min-w-[28px] px-2 py-0.5 text-xs font-bold transition-all",
                  isActive
                    ? "bg-slate-950/40 backdrop-blur-sm text-white shadow-sm"
                    : "bg-slate-950/30 text-slate-300 group-hover:bg-slate-950/40 group-hover:text-slate-200",
                ].join(" ")}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Enhanced Table Container */}
      <div className="relative animate-fade-in-up animate-stagger-1">
        <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-surface/30 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500">
          <CheckinsTable data={filteredData} timeFormat={timeFormat} />
        </div>
      </div>
    </div>
  );
}
