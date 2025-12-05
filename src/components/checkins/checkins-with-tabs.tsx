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
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 gap-2 sm:gap-3 rounded-full bg-surface/70 p-1 border border-white/5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "group flex-1 inline-flex items-center justify-center gap-2 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all",
                  isActive
                    ? "bg-gradient-to-r from-emerald-400/90 to-cyan-400/90 text-slate-950 shadow-md"
                    : "bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-text hover:bg-slate-700/70 hover:border-slate-600/60",
                ].join(" ")}
              >
                <span className="truncate">{tab.label}</span>
                <span
                  className={[
                    "inline-flex items-center justify-center rounded-full min-w-[28px] px-2 py-0.5 text-xs font-bold transition-all",
                    isActive
                      ? "bg-slate-950/30 backdrop-blur-sm text-white shadow-sm"
                      : "bg-slate-700/50 text-slate-300 group-hover:bg-slate-600/60 group-hover:text-slate-200",
                  ].join(" ")}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Table Container */}
      <div className="relative animate-fade-in-up animate-stagger-1">
        <div className="absolute inset-0 bg-gradient-to-br from-card/40 to-surface/40 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-surface/30 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500">
          <CheckinsTable data={filteredData} timeFormat={timeFormat} />
        </div>
      </div>
    </div>
  );
}
