"use client";

import { useState, useTransition } from "react";
import { saveScheduleAction, type ActionResult } from "@/app/(protected)/actions";
import { AnimatedButton } from "@/components/ui/animated-button";
import { TimePicker } from "@/components/ui/time-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ScheduleDay } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { weekdayLabel, sortScheduleByWeekday } from "@/lib/utils";
import { Clock, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";

interface PremiumScheduleEditorProps {
  schedule: ScheduleDay[];
  timeFormat?: TimeFormat;
}

export function PremiumScheduleEditor({ schedule, timeFormat = '24h' }: PremiumScheduleEditorProps) {
  const [state, setState] = useState<ScheduleDay[]>(sortScheduleByWeekday(schedule));
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const updateDay = (weekday: number, patch: Partial<ScheduleDay>) => {
    setState((prev) => {
      return prev.map(day => 
        day.weekday === weekday ? { ...day, ...patch } : day
      );
    });
  };

  const toggleDayStatus = (weekday: number) => {
    const day = state.find(d => d.weekday === weekday);
    if (!day) return;
    
    updateDay(weekday, { 
      is_closed: !day.is_closed,
      // If closing the day, set times to null; if opening, set default times
      opens_at: day.is_closed ? "06:00" : null,
      closes_at: day.is_closed ? "22:00" : null
    });
  };

  const onSubmit = () => {
    startTransition(async () => {
      const result = await saveScheduleAction(state);
      handleResult(result);
    });
  };

  const handleResult = (result: ActionResult) => {
    if (!result.success) {
      setServerError(result.error);
      addToast({
        type: "error",
        title: "Failed to Save Schedule",
        description: result.error || "An unexpected error occurred. Please try again.",
      });
      return;
    }
    setServerError(null);
    addToast({
      type: "success",
      title: "Schedule Saved",
      description: "Your gym schedule has been successfully updated.",
    });
  };

  const formatTimeDisplay = (time24: string): string => {
    if (timeFormat === '12h') {
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    return time24;
  };

  const getDayStatus = (day: ScheduleDay) => {
    if (day.is_closed) {
      return { 
        status: 'closed', 
        label: 'Closed', 
        color: 'bg-error/20 text-error border-error/30',
        icon: XCircle 
      };
    }
    
    // Handle case where times might be null or empty
    const openTime = day.opens_at || '06:00';
    const closeTime = day.closes_at || '22:00';
    
    return { 
      status: 'open', 
      label: `${formatTimeDisplay(openTime)} - ${formatTimeDisplay(closeTime)}`, 
      color: 'bg-success/20 text-success border-success/30',
      icon: CheckCircle2 
    };
  };

  return (
    <div className="space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Header */}
      <PageHeader
        icon={Calendar}
        title="Gym Schedule"
        subtitle="Set operating hours for each day of the week"
      />

      {/* Days Grid */}
      <div className="space-y-3 sm:space-y-4">
        {/* First 4 days */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-1 sm:px-2">
          {state.filter(day => [1, 2, 3, 4].includes(day.weekday)).map((day) => {
          const label = weekdayLabel(day.weekday);
          const dayStatus = getDayStatus(day);
          const StatusIcon = dayStatus.icon;
          const isToday = new Date().getDay() === day.weekday;

          return (
            <Card key={day.weekday} className={`bg-card/90 border-surface/50 shadow-none transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 ${isToday ? 'ring-2 ring-primary/20' : ''}`}>
              <CardContent className="p-4 sm:p-6">
                {/* Day Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h3 className="font-bold text-base sm:text-lg text-text">{label}</h3>
                    {isToday && (
                      <Badge variant="default" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                        Today
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => toggleDayStatus(day.weekday)}
                    className="group/toggle relative flex items-center gap-2"
                    title={day.is_closed ? "Mark as open" : "Mark as closed"}
                  >
                    <div className={`relative w-10 h-5 rounded-full transition-all duration-500 ease-out ${
                      day.is_closed 
                        ? 'bg-gradient-to-r from-error/30 via-error/20 to-error/30 border border-error/40' 
                        : 'bg-gradient-to-r from-success/30 via-success/20 to-success/30 border border-success/40'
                    } shadow-inner`}>
                      {/* Sliding toggle */}
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-500 ease-out transform ${
                        day.is_closed 
                          ? 'translate-x-0.5 bg-gradient-to-br from-error/90 to-error shadow-md shadow-error/40' 
                          : 'translate-x-5 bg-gradient-to-br from-success/90 to-success shadow-md shadow-success/40'
                      } group-hover/toggle:scale-110`}>
                        {/* Inner glow */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                      </div>
                      
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/toggle:translate-x-full transition-transform duration-1000 ease-out"></div>
                    </div>
                  </button>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border mb-3 sm:mb-4 ${dayStatus.color}`}>
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{dayStatus.label}</span>
                </div>

                {/* Time Inputs */}
                {!day.is_closed && (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted mb-1.5 sm:mb-2">
                        Opening Time
                      </label>
                      <TimePicker
                        value={day.opens_at ?? ""}
                        onChange={(value) => updateDay(day.weekday, { opens_at: value })}
                        placeholder="Select opening time"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted mb-1.5 sm:mb-2">
                        Closing Time
                      </label>
                      <TimePicker
                        value={day.closes_at ?? ""}
                        onChange={(value) => updateDay(day.weekday, { closes_at: value })}
                        placeholder="Select closing time"
                      />
                    </div>
                  </div>
                )}

                {day.is_closed && (
                  <div className="text-center py-3 sm:py-4">
                    <p className="text-xs sm:text-sm text-muted">
                      Gym is closed on {label}s
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted mt-1">
                      Mobile booking disabled
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        </div>

        {/* Last 3 days - centered on desktop */}
        <div className="flex justify-center px-1 sm:px-2">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full lg:max-w-5xl">
            {state.filter(day => [5, 6, 0].includes(day.weekday)).map((day) => {
          const label = weekdayLabel(day.weekday);
          const dayStatus = getDayStatus(day);
          const StatusIcon = dayStatus.icon;
          const isToday = new Date().getDay() === day.weekday;

          return (
            <Card key={day.weekday} className={`bg-card/90 border-surface/50 shadow-none transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 ${isToday ? 'ring-2 ring-primary/20' : ''}`}>
              <CardContent className="p-4 sm:p-6">
                {/* Day Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h3 className="font-bold text-base sm:text-lg text-text">{label}</h3>
                    {isToday && (
                      <Badge variant="default" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                        Today
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => toggleDayStatus(day.weekday)}
                    className="group/toggle relative flex items-center gap-2"
                    title={day.is_closed ? "Mark as open" : "Mark as closed"}
                  >
                    <div className={`relative w-10 h-5 rounded-full transition-all duration-500 ease-out ${
                      day.is_closed 
                        ? 'bg-gradient-to-r from-error/30 via-error/20 to-error/30 border border-error/40' 
                        : 'bg-gradient-to-r from-success/30 via-success/20 to-success/30 border border-success/40'
                    } shadow-inner`}>
                      {/* Sliding toggle */}
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-500 ease-out transform ${
                        day.is_closed 
                          ? 'translate-x-0.5 bg-gradient-to-br from-error/90 to-error shadow-md shadow-error/40' 
                          : 'translate-x-5 bg-gradient-to-br from-success/90 to-success shadow-md shadow-success/40'
                      } group-hover/toggle:scale-110`}>
                        {/* Inner glow */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                      </div>
                      
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/toggle:translate-x-full transition-transform duration-1000 ease-out"></div>
                    </div>
                  </button>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border mb-3 sm:mb-4 ${dayStatus.color}`}>
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{dayStatus.label}</span>
                </div>

                {/* Time Inputs */}
                {!day.is_closed && (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted mb-1.5 sm:mb-2">
                        Opening Time
                      </label>
                      <TimePicker
                        value={day.opens_at ?? ""}
                        onChange={(value) => updateDay(day.weekday, { opens_at: value })}
                        placeholder="Select opening time"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted mb-1.5 sm:mb-2">
                        Closing Time
                      </label>
                      <TimePicker
                        value={day.closes_at ?? ""}
                        onChange={(value) => updateDay(day.weekday, { closes_at: value })}
                        placeholder="Select closing time"
                      />
                    </div>
                  </div>
                )}

                {day.is_closed && (
                  <div className="text-center py-3 sm:py-4">
                    <p className="text-xs sm:text-sm text-muted">
                      Gym is closed on {label}s
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted mt-1">
                      Mobile booking disabled
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {serverError && (
        <div className="p-3 sm:p-4 rounded-lg bg-error/10 border border-error/20">
          <p className="text-xs sm:text-sm text-error font-medium">{serverError}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-center pt-2 sm:pt-4">
        <AnimatedButton
          onClick={onSubmit}
          disabled={isPending}
          size="lg"
          className="px-6 sm:px-8 text-sm sm:text-base bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-slate-200 hover:text-white !border-none hover:!border-none focus:!border-none focus-visible:!border-none !ring-0 hover:!ring-0 focus:!ring-0 focus-visible:!ring-0 !ring-offset-0 !outline-none transition-all duration-500 ease-out shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 backdrop-blur-sm font-medium"
        >
          {isPending ? "Saving..." : "Save Schedule"}
        </AnimatedButton>
      </div>

      {/* Info Footer */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <p className="text-[10px] sm:text-xs text-muted px-2">
          Changes sync instantly to the member booking system and digital signage
        </p>
        <p className="text-[10px] sm:text-xs text-muted px-2">
          Access control systems will reference these operating hours
        </p>
      </div>
    </div>
  );
}
