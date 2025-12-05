"use client";

import { useState, useMemo } from "react";
import { CheckinsTable } from "@/app/(protected)/checkins/checkins-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, XCircle } from "lucide-react";
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} defaultValue="all">
        <div className="flex justify-center sm:justify-start">
          <TabsList>
          <TabsTrigger value="all" icon={<Users className="h-4 w-4" />}>
            <span className="hidden sm:inline">All Check-ins</span>
            <span className="sm:hidden">All</span>
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5">
              {counts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active" icon={<CheckCircle className="h-4 w-4" />}>
            <span className="hidden sm:inline">Currently In Gym</span>
            <span className="sm:hidden">In Gym</span>
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5">
              {counts.active}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="denied" icon={<XCircle className="h-4 w-4" />}>
            Denied
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5">
              {counts.denied}
            </Badge>
          </TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="all">
          <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-surface/30 p-4 sm:p-6 transition-all duration-500">
            <CheckinsTable data={filteredData} timeFormat={timeFormat} />
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-surface/30 p-4 sm:p-6 transition-all duration-500">
            <CheckinsTable data={filteredData} timeFormat={timeFormat} />
          </div>
        </TabsContent>

        <TabsContent value="denied">
          <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-surface/30 p-4 sm:p-6 transition-all duration-500">
            <CheckinsTable data={filteredData} timeFormat={timeFormat} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
