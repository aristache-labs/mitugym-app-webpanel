"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CheckIn, ScheduleDay } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  // Get current hour to limit data display
  const currentHour = today.getHours();
  const isToday = today.toDateString() === todayStart.toDateString();
  
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
    
    // Only show data up to current hour if viewing today
    let occupancy: number | null = null;
    if (!isToday || hour <= currentHour) {
      // Count people who are in the gym at this hour
      occupancy = 0;
      
      todaysCheckIns.forEach(checkIn => {
        const checkInTime = new Date(checkIn.checked_in_at);
        const checkOutTime = checkIn.checked_out_at ? new Date(checkIn.checked_out_at) : null;
        
        // Person is in gym if they checked in before/at this hour AND haven't checked out yet OR checked out after this hour
        if (checkInTime <= currentTime) {
          if (!checkOutTime || checkOutTime > currentTime) {
            occupancy!++;
          }
        }
      });
    }
    
    hourlyOccupancy.push({ time: hourKey, total: occupancy });
  }
  
  return hourlyOccupancy;
}

export function OccupancyChart({ checkIns, schedule }: { checkIns: CheckIn[]; schedule: ScheduleDay[] }) {
  const data = buildTrend(checkIns, schedule);
  
  return (
    <Card className="bg-card/95 backdrop-blur-sm border-surface/30 shadow-2xl shadow-black/20">
      <CardHeader className="border-b border-surface/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
          Today&apos;s Traffic
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[280px] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4dd4d4" stopOpacity={0.9} />
                <stop offset="50%" stopColor="#4dd4d4" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#4dd4d4" stopOpacity={0.05} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="rgba(77,212,212,0.7)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'rgba(77,212,212,0.8)' }}
            />
            <YAxis 
              stroke="rgba(77,212,212,0.7)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              allowDecimals={false}
              tick={{ fill: 'rgba(77,212,212,0.8)' }}
            />
            <Tooltip
              contentStyle={{ 
                background: "rgba(20, 26, 26, 0.95)", 
                borderRadius: 16, 
                border: "1px solid rgba(77,212,212,0.4)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
              }}
              labelStyle={{ color: "#4dd4d4", fontWeight: "600" }}
              formatter={(value: unknown) => {
                if (value === null) return ["No data yet", "Future"];
                return [`${value} people`, "In Gym"];
              }}
              labelFormatter={(label: string) => `Time: ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#4dd4d4" 
              fill="url(#occupancyGradient)" 
              strokeWidth={3}
              connectNulls={false}
              filter="url(#glow)"
              dot={{ fill: "#4dd4d4", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#4dd4d4", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
