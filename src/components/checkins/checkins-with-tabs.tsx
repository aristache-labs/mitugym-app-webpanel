"use client";

import { useState, useMemo } from "react";
import { CheckinsTable } from "@/app/(protected)/checkins/checkins-table";
import type { CheckIn } from "@/types";

interface CheckinsWithTabsProps {
  data: CheckIn[];
}

type TabType = "today" | "month" | "all";

export function CheckinsWithTabs({ data }: CheckinsWithTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("today");

  const filteredData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (activeTab) {
      case "today":
        return data.filter(checkIn => {
          const checkInDate = new Date(checkIn.checked_in_at);
          return checkInDate >= today;
        });
      
      case "month":
        return data.filter(checkIn => {
          const checkInDate = new Date(checkIn.checked_in_at);
          return checkInDate >= startOfMonth;
        });
      
      case "all":
      default:
        return data;
    }
  }, [data, activeTab]);

  const counts = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayCount = data.filter(checkIn => {
      const checkInDate = new Date(checkIn.checked_in_at);
      return checkInDate >= today;
    }).length;

    const monthCount = data.filter(checkIn => {
      const checkInDate = new Date(checkIn.checked_in_at);
      return checkInDate >= startOfMonth;
    }).length;

    return {
      today: todayCount,
      month: monthCount,
      all: data.length
    };
  }, [data]);

  const tabs = [
    { id: "today" as TabType, label: "Today", count: counts.today },
    { id: "month" as TabType, label: "This Month", count: counts.month },
    { id: "all" as TabType, label: "All", count: counts.all }
  ];

  return (
    <div className="space-y-8">
      {/* Premium Tabs */}
      <div className="relative animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl blur-xl"></div>
        <div className="relative bg-card/60 backdrop-blur-sm rounded-2xl border border-surface/30 p-2 hover:border-surface/50 transition-all duration-300">
          <nav className="flex gap-2">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 group animate-fade-in-up ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30 shadow-lg transform scale-105"
                    : "text-muted hover:text-text hover:bg-surface/40 border border-transparent hover:scale-102"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="relative z-10 transition-all duration-300">{tab.label}</span>
                  <div className={`relative ${
                    activeTab === tab.id 
                      ? "bg-gradient-to-r from-primary/30 to-accent/30 border-primary/40 animate-pulse" 
                      : "bg-surface/60 border-surface/80 group-hover:bg-surface/80"
                  } px-3 py-1.5 text-xs font-bold rounded-full border transition-all duration-300`}>
                    {tab.count}
                  </div>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur-sm animate-glow"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Enhanced Table Container */}
      <div className="relative animate-fade-in-up animate-stagger-1">
        <div className="absolute inset-0 bg-gradient-to-br from-card/40 to-surface/40 rounded-2xl blur-xl"></div>
        <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-surface/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-500">
          <CheckinsTable data={filteredData} />
        </div>
      </div>
    </div>
  );
}
