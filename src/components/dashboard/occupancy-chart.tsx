"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CheckIn } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

function buildTrend(checkIns: CheckIn[]) {
  const buckets = new Map<string, number>();
  checkIns.forEach((checkIn) => {
    const key = format(new Date(checkIn.checked_in_at), "HH:00");
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  });
  return Array.from(buckets.entries()).map(([time, total]) => ({ time, total }));
}

export function OccupancyChart({ checkIns }: { checkIns: CheckIn[] }) {
  const data = buildTrend(checkIns);
  return (
    <Card className="bg-card/90">
      <CardHeader>
        <CardTitle className="text-lg">Today&apos;s traffic</CardTitle>
      </CardHeader>
      <CardContent className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4dd4d4" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4dd4d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#b3d9d9" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#b3d9d9" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#141A1A", borderRadius: 12, border: "1px solid rgba(77,212,212,0.3)" }}
            />
            <Area type="monotone" dataKey="total" stroke="#4dd4d4" fill="url(#occupancyGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
