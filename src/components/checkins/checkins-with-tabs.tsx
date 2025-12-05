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
    <div className="space-y-6 sm:space-y-8">
      {/* Premium Tabs */}
      <div className="relative animate-scale-in">
        <div className="relative bg-card/40 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5">
          <nav className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 py-2.5 sm:py-3 px-3 sm:px-5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-500 ease-out group animate-fade-in-up ${
                  activeTab === tab.id
                    ? "bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 text-slate-200 shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25"
                    : "bg-gradient-to-br from-slate-700/40 via-slate-800/30 to-slate-700/40 text-slate-400 hover:text-slate-200 hover:from-slate-700/60 hover:via-slate-800/50 hover:to-slate-700/60 shadow-sm shadow-black/10"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  <span className="relative z-10 transition-all duration-300">{tab.label}</span>
                  <div className={`relative ${
                    activeTab === tab.id 
                      ? "bg-cyan-500/20 text-cyan-300" 
                      : "bg-slate-700/60 text-slate-400 group-hover:bg-slate-600/60 group-hover:text-slate-300"
                  } px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-md transition-all duration-300`}>
                    {tab.count}
                  </div>
                </div>
              </button>
            ))}
          </nav>
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
