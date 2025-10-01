"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
          // Refresh the page after a short delay to ensure all components use the new timezone
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
    <Card className="bg-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Timezone Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Message */}
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-200'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text mb-2 block">
              Application Timezone
            </label>
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

          <div>
            <label className="text-sm font-medium text-text mb-2 block">
              Time Format
            </label>
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

          {selectedTimezone && (
            <div className="bg-surface/60 rounded-lg p-4 border border-surface/40">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-text">Current time in selected timezone:</span>
              </div>
              <p className="text-sm text-muted font-mono">{currentTime}</p>
            </div>
          )}

          {/* Information Panels Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                About Timezone Settings
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>• This timezone is used for all date/time calculations throughout the application</p>
                <p>• Member expiration dates, check-in times, and reports will use this timezone</p>
                <p>• Changes take effect immediately and will refresh the page</p>
                <p>• The timezone automatically handles daylight saving time (DST) transitions</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Database & Cron Jobs
              </h4>
              <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <p>• The database timezone should match your application timezone for consistency</p>
                <p>• Supabase cron jobs and scheduled functions run according to the database timezone</p>
                <p>• Cron schedules execute at local time (e.g., midnight runs at database midnight)</p>
                <p>• Ensure both are aligned to avoid scheduling discrepancies</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-surface/20">
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || isPending}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
          
          {hasChanges && (
            <Button 
              variant="outline"
              onClick={handleReset}
              disabled={isPending}
            >
              Reset
            </Button>
          )}
          
          {!hasChanges && (
            <span className="text-sm text-muted">No changes to save</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
