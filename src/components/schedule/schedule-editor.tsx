"use client";

import { useState, useTransition } from "react";
import { saveScheduleAction, type ActionResult } from "@/app/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { ScheduleDay } from "@/types";
import { weekdayLabel } from "@/lib/utils";

interface ScheduleEditorProps {
  schedule: ScheduleDay[];
}

export function ScheduleEditor({ schedule }: ScheduleEditorProps) {
  const [state, setState] = useState<ScheduleDay[]>(schedule);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateDay = (index: number, patch: Partial<ScheduleDay>) => {
    setState((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
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

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {state.map((day, index) => {
          const label = weekdayLabel(day.weekday);
          return (
            <div key={day.weekday} className="rounded-[16px] border border-surface/50 bg-surface/60 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text">{label}</h3>
                <label className="flex items-center gap-2 text-xs text-muted">
                  <Checkbox
                    checked={day.is_closed}
                    onChange={(event) => updateDay(index, { is_closed: event.currentTarget.checked })}
                  />
                  Closed
                </label>
              </div>
              {!day.is_closed ? (
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="mb-1 block uppercase tracking-wide text-muted">Opens</label>
                    <Input
                      type="time"
                      value={day.opens_at ?? ""}
                      onChange={(event) => updateDay(index, { opens_at: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block uppercase tracking-wide text-muted">Closes</label>
                    <Input
                      type="time"
                      value={day.closes_at ?? ""}
                      onChange={(event) => updateDay(index, { closes_at: event.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted">Gym floor closed. Mobile booking will be disabled.</p>
              )}
            </div>
          );
        })}
      </div>
      {serverError ? <p className="text-sm text-error">{serverError}</p> : null}
      <Button onClick={onSubmit} disabled={isPending}>
        Save schedule
      </Button>
    </div>
  );
}
