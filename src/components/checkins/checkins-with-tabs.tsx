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
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-surface/50">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-text hover:border-surface"
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-1 text-xs bg-surface/60 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Table */}
      <CheckinsTable data={filteredData} />
    </div>
  );
}
