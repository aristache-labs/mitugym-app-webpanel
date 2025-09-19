"use client";

import { useState, useTransition } from "react";
import { saveScheduleAction, type ActionResult } from "@/app/(protected)/actions";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ScheduleDay } from "@/types";
import { weekdayLabel, sortScheduleByWeekday } from "@/lib/utils";
import { Clock, Calendar, CheckCircle2, XCircle } from "lucide-react";

interface PremiumScheduleEditorProps {
  schedule: ScheduleDay[];
}

export function PremiumScheduleEditor({ schedule }: PremiumScheduleEditorProps) {
  const [state, setState] = useState<ScheduleDay[]>(sortScheduleByWeekday(schedule));
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
      return;
    }
    setServerError(null);
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
      label: `${openTime} - ${closeTime}`, 
      color: 'bg-success/20 text-success border-success/30',
      icon: CheckCircle2 
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border border-primary/30">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Gym Schedule</h2>
          <p className="text-sm text-muted">Set operating hours for each day of the week</p>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {state.map((day) => {
          const label = weekdayLabel(day.weekday);
          const dayStatus = getDayStatus(day);
          const StatusIcon = dayStatus.icon;
          const isToday = new Date().getDay() === day.weekday;

          return (
            <Card key={day.weekday} className={`bg-card/90 border-surface/50 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 ${isToday ? 'ring-2 ring-primary/20' : ''}`}>
              <CardContent className="p-6">
                {/* Day Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-text">{label}</h3>
                    {isToday && (
                      <Badge variant="default" className="text-xs px-2 py-1">
                        Today
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => toggleDayStatus(day.weekday)}
                    className="p-2 rounded-full hover:bg-surface/60 transition-colors"
                    title={day.is_closed ? "Mark as open" : "Mark as closed"}
                  >
                    <StatusIcon className="w-5 h-5 text-muted hover:text-text transition-colors" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-4 ${dayStatus.color}`}>
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{dayStatus.label}</span>
                </div>

                {/* Time Inputs */}
                {!day.is_closed && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                        Opening Time
                      </label>
                      <Input
                        type="time"
                        value={day.opens_at ?? ""}
                        onChange={(event) => updateDay(day.weekday, { opens_at: event.target.value })}
                        className="bg-surface/40 border-surface/60 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                        Closing Time
                      </label>
                      <Input
                        type="time"
                        value={day.closes_at ?? ""}
                        onChange={(event) => updateDay(day.weekday, { closes_at: event.target.value })}
                        className="bg-surface/40 border-surface/60 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {day.is_closed && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted">
                      Gym is closed on {label}s
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Mobile booking disabled
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Error Display */}
      {serverError && (
        <div className="p-4 rounded-lg bg-error/10 border border-error/20">
          <p className="text-sm text-error font-medium">{serverError}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-center pt-4">
        <AnimatedButton
          onClick={onSubmit}
          disabled={isPending}
          size="lg"
          className="px-8"
        >
          {isPending ? "Saving..." : "Save Schedule"}
        </AnimatedButton>
      </div>

      {/* Info Footer */}
      <div className="text-center space-y-2">
        <p className="text-xs text-muted">
          Changes sync instantly to the member booking system and digital signage
        </p>
        <p className="text-xs text-muted">
          Access control systems will reference these operating hours
        </p>
      </div>
    </div>
  );
}
