"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { CustomSelect } from "@/components/ui/custom-select";
import { AVAILABLE_TIMEZONES, TIME_FORMAT_OPTIONS, type TimeFormat } from "@/lib/settings";
import { updateTimezoneAction } from "@/app/(protected)/settings/actions";
import { Globe, Clock, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface TimezoneSettingsProps {
  currentTimezone: string;
  currentTimeFormat: TimeFormat;
}

export function TimezoneSettings({ currentTimezone, currentTimeFormat }: TimezoneSettingsProps) {
  const [selectedTimezone, setSelectedTimezone] = useState(currentTimezone);
  const [selectedTimeFormat, setSelectedTimeFormat] = useState<TimeFormat>(currentTimeFormat);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { addToast } = useToast();
  
  const hasChanges = selectedTimezone !== currentTimezone || selectedTimeFormat !== currentTimeFormat;

  const handleSave = () => {
    if (!hasChanges) return;

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await updateTimezoneAction(selectedTimezone, selectedTimeFormat);
        
        if (result.success) {
          setMessage({
            type: 'success',
            text: 'Timezone updated successfully! The page will refresh to apply changes.'
          });
          addToast({
            type: 'success',
            title: 'Timezone Updated',
            description: 'The page will refresh to apply changes.',
          });
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setMessage({
            type: 'error',
            text: result.error || 'An unexpected error occurred'
          });
          addToast({
            type: 'error',
            title: 'Failed to Update Timezone',
            description: result.error || 'An unexpected error occurred',
          });
        }
      } catch {
        setMessage({
          type: 'error',
          text: 'An unexpected error occurred'
        });
        addToast({
          type: 'error',
          title: 'Failed to Update Timezone',
          description: 'An unexpected error occurred',
        });
      }
    });
  };

  const handleReset = () => {
    setSelectedTimezone(currentTimezone);
    setSelectedTimeFormat(currentTimeFormat);
    setMessage(null);
  };

  const currentTime = new Date().toLocaleString('en-US', { 
    timeZone: selectedTimezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Status Message */}
      {message && (
        <div className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-200'
            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
          <span className="text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Organized Containers Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Application Timezone Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative bg-surface/60 backdrop-blur-sm rounded-xl border border-surface/50 p-3 sm:p-4 transition-all duration-300 hover:border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
              <label className="text-xs sm:text-sm font-semibold text-text">
                Application Timezone
              </label>
            </div>
            <CustomSelect
              value={selectedTimezone}
              onChange={setSelectedTimezone}
              options={AVAILABLE_TIMEZONES.map(tz => ({
                value: tz.value,
                label: `${tz.country} ${tz.label}`
              }))}
              placeholder="Select timezone..."
              className="w-full"
            />
          </div>
        </div>

        {/* Time Format Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative bg-surface/60 backdrop-blur-sm rounded-xl border border-surface/50 p-3 sm:p-4 transition-all duration-300 hover:border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
              <label className="text-xs sm:text-sm font-semibold text-text">
                Time Format
              </label>
            </div>
            <CustomSelect
              value={selectedTimeFormat}
              onChange={(value) => setSelectedTimeFormat(value as TimeFormat)}
              options={TIME_FORMAT_OPTIONS.map(format => ({
                value: format.value,
                label: format.label
              }))}
              placeholder="Select time format..."
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Current Time Preview - Compact */}
      {selectedTimezone && (
        <div className="bg-surface/60 rounded-lg p-2.5 sm:p-3 border border-surface/40">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] sm:text-xs text-muted/70">Current time:</span>
              <p className="text-xs sm:text-sm text-text font-mono mt-0.5 break-words">{currentTime}</p>
            </div>
          </div>
        </div>
      )}

      {/* Compact Info Notice */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 sm:p-3">
        <div className="flex gap-2">
          <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-[10px] sm:text-xs text-muted/80 space-y-1">
            <p><strong className="text-primary">Note:</strong> This timezone is used for all date/time calculations. Changes apply immediately after saving and the page will refresh.</p>
            <p className="text-muted/70">Ensure your database timezone matches to avoid scheduling discrepancies.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
        <AnimatedButton 
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className="h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-slate-200 hover:text-white !border-none hover:!border-none focus:!border-none focus-visible:!border-none !ring-0 hover:!ring-0 focus:!ring-0 focus-visible:!ring-0 !ring-offset-0 !outline-none transition-all duration-500 ease-out shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 backdrop-blur-sm font-medium"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </AnimatedButton>
        
        {hasChanges && (
          <AnimatedButton 
            onClick={handleReset}
            disabled={isPending}
            className="h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm bg-gradient-to-br from-slate-700/60 via-slate-800/50 to-slate-700/60 hover:from-slate-600/70 hover:via-slate-700/60 hover:to-slate-600/70 text-slate-300 hover:text-slate-100 !border-none hover:!border-none focus:!border-none focus-visible:!border-none !ring-0 hover:!ring-0 focus:!ring-0 focus-visible:!ring-0 !ring-offset-0 !outline-none transition-all duration-500 ease-out shadow-md shadow-black/15 hover:shadow-lg hover:shadow-black/25 backdrop-blur-sm font-medium"
          >
            Reset
          </AnimatedButton>
        )}
        
        {!hasChanges && (
          <span className="text-xs sm:text-sm text-muted/60 text-center sm:text-left">No changes to save</span>
        )}
      </div>
    </div>
  );
}
