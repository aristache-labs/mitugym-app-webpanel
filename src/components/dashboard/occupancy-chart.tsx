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
    <Card className="group relative bg-card/95 backdrop-blur-sm border-surface/30 shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/15 hover:border-primary/50 overflow-hidden">
      {/* Full card hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />
      
      <CardHeader className="relative border-b border-surface/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <svg className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-text group-hover:text-primary transition-colors">
                Today&apos;s Traffic
              </CardTitle>
              <p className="text-xs text-muted/70 mt-0.5">Live gym occupancy throughout the day</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-text">
              {data.filter(d => d.total !== null).length > 0 
                ? `Peak: ${Math.max(...data.filter(d => d.total !== null).map(d => d.total as number))}`
                : "No data"
              }
            </div>
            <div className="text-xs text-muted/70">people</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative p-6">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 25, right: 25, left: 15, bottom: 25 }}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4dd4d4" stopOpacity={0.8} />
                  <stop offset="30%" stopColor="#4dd4d4" stopOpacity={0.4} />
                  <stop offset="70%" stopColor="#4dd4d4" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#4dd4d4" stopOpacity={0.02} />
                </linearGradient>
                <filter id="chartGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="shadowFilter" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4dd4d4" floodOpacity="0.3"/>
                </filter>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="rgba(77,212,212,0.6)" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: 'rgba(77,212,212,0.7)', fontSize: 11 }}
                interval="preserveStartEnd"
                tickMargin={8}
              />
              <YAxis 
                stroke="rgba(77,212,212,0.6)" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false}
                tick={{ fill: 'rgba(77,212,212,0.7)', fontSize: 11 }}
                tickMargin={8}
                width={35}
              />
              <Tooltip
                contentStyle={{ 
                  background: "rgba(15, 20, 20, 0.95)", 
                  borderRadius: 12, 
                  border: "1px solid rgba(77,212,212,0.3)",
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                  fontSize: "13px"
                }}
                labelStyle={{ color: "#4dd4d4", fontWeight: "600", marginBottom: "4px" }}
                formatter={(value: unknown) => {
                  if (value === null) return ["No data available", "Future hours"];
                  return [`${value} people`, "Currently in gym"];
                }}
                labelFormatter={(label: string) => `${label}`}
                cursor={{ stroke: 'rgba(77,212,212,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#4dd4d4" 
                fill="url(#occupancyGradient)" 
                strokeWidth={2.5}
                connectNulls={false}
                filter="url(#chartGlow)"
                dot={{ fill: "#4dd4d4", strokeWidth: 2, r: 3, filter: "url(#shadowFilter)" }}
                activeDot={{ 
                  r: 5, 
                  fill: "#4dd4d4", 
                  stroke: "#ffffff", 
                  strokeWidth: 2,
                  filter: "url(#shadowFilter)" 
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart footer with additional info */}
        <div className="mt-4 pt-4 border-t border-surface/20">
          <div className="flex items-center justify-between text-xs text-muted/70">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Live occupancy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-muted/40"></div>
                <span>Future hours</span>
              </div>
            </div>
            <div>
              Updates every hour
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
