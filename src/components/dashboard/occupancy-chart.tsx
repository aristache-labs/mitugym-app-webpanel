"use client";

import { useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CheckIn, ScheduleDay } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function buildTrend(checkIns: CheckIn[], schedule: ScheduleDay[], timeFormat: TimeFormat = '24h', timezone: string = 'Europe/Bucharest') {
  // Get current time
  const now = new Date();
  
  // Helper function to get date/time parts in the application's timezone
  const getTimezoneParts = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    const parts = formatter.formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value || '0';
    
    return {
      year: parseInt(get('year')),
      month: parseInt(get('month')) - 1, // JS months are 0-based
      day: parseInt(get('day')),
      hour: parseInt(get('hour')),
      minute: parseInt(get('minute')),
    };
  };
  
  // Get today's date parts in the application's timezone
  const todayParts = getTimezoneParts(now);
  const todayWeekday = new Date(Date.UTC(todayParts.year, todayParts.month, todayParts.day)).getDay();
  const todayDateString = `${todayParts.year}-${String(todayParts.month + 1).padStart(2, '0')}-${String(todayParts.day).padStart(2, '0')}`;
  
  // Find today's schedule
  const todaySchedule = schedule.find(day => day.weekday === todayWeekday);
  
  // If gym is closed today or no schedule, return empty array
  if (!todaySchedule || todaySchedule.is_closed || !todaySchedule.opens_at || !todaySchedule.closes_at) {
    return [{ time: "Closed", total: 0 }];
  }
  
  // Parse opening and closing times
  const [openHour] = todaySchedule.opens_at.split(':').map(Number);
  const [closeHour] = todaySchedule.closes_at.split(':').map(Number);
  
  // Filter check-ins for today only, excluding denied check-ins
  const todaysCheckIns = checkIns.filter(checkIn => {
    const checkInDate = new Date(checkIn.checked_in_at);
    const checkInParts = getTimezoneParts(checkInDate);
    const checkInDateString = `${checkInParts.year}-${String(checkInParts.month + 1).padStart(2, '0')}-${String(checkInParts.day).padStart(2, '0')}`;
    const status = checkIn.status || 'success';
    return checkInDateString === todayDateString && status !== 'denied';
  });

  // Get current hour in the application's timezone
  const currentHour = todayParts.hour;
  
  // Create hourly buckets from opening hour to closing hour
  const hourlyOccupancy = [];
  
  for (let hour = openHour; hour <= closeHour; hour++) {
    const hourKey = timeFormat === '12h' 
      ? (hour === 0 ? '12 am' : hour < 12 ? `${hour} am` : hour === 12 ? '12 pm' : `${hour - 12} pm`)
      : hour.toString().padStart(2, '0') + ':00';
    
    // Only show data up to current hour if viewing today
    let occupancy: number | null = null;
    if (hour <= currentHour) {
      // Count people who are in the gym at this hour
      occupancy = 0;
      
      todaysCheckIns.forEach(checkIn => {
        const checkInParts = getTimezoneParts(new Date(checkIn.checked_in_at));
        const checkOutParts = checkIn.checked_out_at ? getTimezoneParts(new Date(checkIn.checked_out_at)) : null;
        
        // Person is in gym at this hour if:
        // - They checked in at or before this hour
        // - AND they either haven't checked out OR checked out after this hour
        const checkedInByThisHour = checkInParts.hour < hour || (checkInParts.hour === hour);
        const stillInGym = !checkOutParts || checkOutParts.hour > hour || (checkOutParts.hour === hour && checkOutParts.minute > 0);
        
        if (checkedInByThisHour && stillInGym && occupancy !== null) {
          occupancy++;
        }
      });
    }
    
    hourlyOccupancy.push({ time: hourKey, total: occupancy });
  }
  
  return hourlyOccupancy;
}

export function OccupancyChart({ checkIns, schedule, timeFormat = '24h', timezone = 'Europe/Bucharest' }: { checkIns: CheckIn[]; schedule: ScheduleDay[]; timeFormat?: TimeFormat; timezone?: string }) {
  const data = buildTrend(checkIns, schedule, timeFormat, timezone);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate peak value
  const peakValue = data.filter(d => d.total !== null).length > 0 
    ? Math.max(...data.filter(d => d.total !== null).map(d => d.total as number))
    : null;
  
  // Smart interval based on data length (number of hours)
  // The interval property in Recharts means: 0=every tick, 1=every 2nd tick, 2=every 3rd tick, etc.
  const getXAxisInterval = () => {
    const hours = data.length;
    if (hours >= 10 && hours <= 18) return 0;  // 10-16 hours: show every hour (e.g., 5 AM - 11 PM is 18 hours)
    return 1;                                    // Above 16 hours: show every 2 hours
  };
  
  return (
    <Card className="group relative bg-card/95 backdrop-blur-sm border-surface/30 shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/15 hover:border-primary/50 overflow-hidden">
      {/* Full card hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />
      
      <CardHeader className="relative pb-4">
        {/* Gradient border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
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
              {!mounted ? "Loading..." : peakValue !== null ? `Peak: ${peakValue}` : "No data"}
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
                interval={getXAxisInterval()}
                includeHidden
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
                domain={[0, 'dataMax']}
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
        <div className="relative mt-4 pt-4">
          {/* Gradient border */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
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