"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CheckIn, ScheduleDay } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

function buildTrend(checkIns: CheckIn[], schedule: ScheduleDay[]) {
  // Get today's date and day of week
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayWeekday = today.getDay(); // 0=Sunday, 1=Monday, etc.
  
  // Find today's schedule
  const todaySchedule = schedule.find(day => day.weekday === todayWeekday);
  
  // If gym is closed today or no schedule, return empty array
  if (!todaySchedule || todaySchedule.is_closed || !todaySchedule.opens_at || !todaySchedule.closes_at) {
    return [{ time: "Closed", total: 0 }];
  }
  
  // Parse opening and closing times
  const [openHour, openMinute] = todaySchedule.opens_at.split(':').map(Number);
  const [closeHour, closeMinute] = todaySchedule.closes_at.split(':').map(Number);
  
  // Filter check-ins for today only
  const todaysCheckIns = checkIns.filter(checkIn => {
    const checkInDate = new Date(checkIn.checked_in_at);
    return checkInDate >= todayStart;
  });

  // Create hourly buckets from opening hour to closing hour
  const hourlyOccupancy = [];
  
  for (let hour = openHour; hour <= closeHour; hour++) {
    const hourKey = hour.toString().padStart(2, '0') + ':00';
    const currentTime = new Date(todayStart.getTime() + hour * 60 * 60 * 1000);
    
    // Skip if this hour is before opening or after closing (accounting for minutes)
    if (hour === openHour && openMinute > 0) {
      // If gym opens later in the hour, use the actual opening time
      currentTime.setMinutes(openMinute);
    }
    if (hour === closeHour && closeMinute < 60) {
      // If gym closes earlier in the hour, use the actual closing time
      currentTime.setMinutes(closeMinute);
    }
    
    // Count people who are in the gym at this hour
    let occupancy = 0;
    
    todaysCheckIns.forEach(checkIn => {
      const checkInTime = new Date(checkIn.checked_in_at);
      const checkOutTime = checkIn.checked_out_at ? new Date(checkIn.checked_out_at) : null;
      
      // Person is in gym if they checked in before/at this hour AND haven't checked out yet OR checked out after this hour
      if (checkInTime <= currentTime) {
        if (!checkOutTime || checkOutTime > currentTime) {
          occupancy++;
        }
      }
    });
    
    hourlyOccupancy.push({ time: hourKey, total: occupancy });
  }
  
  return hourlyOccupancy;
}

export function OccupancyChart({ checkIns, schedule }: { checkIns: CheckIn[]; schedule: ScheduleDay[] }) {
  const data = buildTrend(checkIns, schedule);
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
              labelStyle={{ color: "#4dd4d4" }}
              formatter={(value: number) => [`${value} people`, "In Gym"]}
              labelFormatter={(label: string) => `Time: ${label}`}
            />
            <Area type="monotone" dataKey="total" stroke="#4dd4d4" fill="url(#occupancyGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
