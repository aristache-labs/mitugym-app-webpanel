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
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl sm:rounded-2xl blur-xl"></div>
        <div className="relative bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-surface/30 p-1.5 sm:p-2 hover:border-surface/50 transition-all duration-300">
          <nav className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 group animate-fade-in-up ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30 shadow-lg transform scale-[1.02] sm:scale-105"
                    : "text-muted hover:text-text hover:bg-surface/40 border border-transparent hover:scale-[1.01] sm:hover:scale-102"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="relative z-10 transition-all duration-300">{tab.label}</span>
                  <div className={`relative ${
                    activeTab === tab.id 
                      ? "bg-gradient-to-r from-primary/30 to-accent/30 border-primary/40 animate-pulse" 
                      : "bg-surface/60 border-surface/80 group-hover:bg-surface/80"
                  } px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-full border transition-all duration-300`}>
                    {tab.count}
                  </div>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg sm:rounded-xl blur-sm animate-glow"></div>
                )}
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
