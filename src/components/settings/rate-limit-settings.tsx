"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Activity, Users, Key, Clock, Info } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface RateLimitSettingsProps {
  currentSettings: {
    window_ms: number;
    ip_max: number;
    api_key_max: number;
    member_max: number;
  };
  stats?: {
    ip: { activeIdentifiers: number; limit: number };
    apiKey: { activeIdentifiers: number; limit: number };
    member: { activeIdentifiers: number; limit: number };
  };
}

export function RateLimitSettings({ currentSettings, stats }: RateLimitSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  
  const [windowMs, setWindowMs] = useState(currentSettings.window_ms);
  const [ipMax, setIpMax] = useState(currentSettings.ip_max);
  const [apiKeyMax, setApiKeyMax] = useState(currentSettings.api_key_max);
  const [memberMax, setMemberMax] = useState(currentSettings.member_max);

  const hasChanges = 
    windowMs !== currentSettings.window_ms ||
    ipMax !== currentSettings.ip_max ||
    apiKeyMax !== currentSettings.api_key_max ||
    memberMax !== currentSettings.member_max;

  const handleSave = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/settings/rate-limits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            window_ms: windowMs,
            ip_max: ipMax,
            api_key_max: apiKeyMax,
            member_max: memberMax,
          }),
        });

        const result = await response.json();

        if (result.success) {
          addToast({
            type: 'success',
            title: 'Settings Updated',
            description: 'Rate limit settings have been saved and applied.',
            duration: 3000,
          });
          setTimeout(() => window.location.reload(), 1000);
        } else {
          addToast({
            type: 'error',
            title: 'Update Failed',
            description: result.error || 'Failed to update rate limit settings',
          duration: 5000,
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Update Failed',
        description: 'An error occurred while updating settings',
        duration: 5000,
      });
    }
    });
  };

  const handleReset = () => {
    setWindowMs(currentSettings.window_ms);
    setIpMax(currentSettings.ip_max);
    setApiKeyMax(currentSettings.api_key_max);
    setMemberMax(currentSettings.member_max);
  };

  const windowSeconds = Math.floor(windowMs / 1000);
  const windowMinutes = Math.floor(windowSeconds / 60);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Compact Statistics */}
      {stats && (
        <div className="p-2.5 sm:p-3 bg-surface/30 rounded-lg border border-surface/40">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* IP Addresses */}
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-1.5 sm:gap-2">
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <div>
                <p className="text-[10px] sm:text-xs text-muted/60">IP Addresses</p>
                <p className="text-base sm:text-lg font-bold text-text">{stats.ip.activeIdentifiers}</p>
              </div>
            </div>
            
            {/* API Keys */}
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-1.5 sm:gap-2">
              <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-warning flex-shrink-0" />
              <div>
                <p className="text-[10px] sm:text-xs text-muted/60">API Keys</p>
                <p className="text-base sm:text-lg font-bold text-text">{stats.apiKey.activeIdentifiers}</p>
          </div>
            </div>
            
            {/* Members */}
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-1.5 sm:gap-2">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success flex-shrink-0" />
              <div>
                <p className="text-[10px] sm:text-xs text-muted/60">Members</p>
                <p className="text-base sm:text-lg font-bold text-text">{stats.member.activeIdentifiers}</p>
          </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout for Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Rate Window Configuration */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="window_ms" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <Clock className="h-3 w-3 text-primary" />
            Rate Limit Window
          </Label>
          <Input
            id="window_ms"
            type="number"
            value={windowMs}
            onChange={(e) => setWindowMs(parseInt(e.target.value) || 60000)}
            min={1000}
            step={1000}
            className="w-full text-sm sm:text-base h-9 sm:h-10"
          />
          <p className="text-[10px] sm:text-xs text-muted/60">
            {windowMinutes}m {windowSeconds % 60}s (milliseconds)
          </p>
        </div>

        {/* IP Rate Limit */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="ip_max" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <Activity className="h-3 w-3 text-primary" />
            IP Address Limit
          </Label>
          <Input
            id="ip_max"
            type="number"
            value={ipMax}
            onChange={(e) => setIpMax(parseInt(e.target.value) || 100)}
            min={1}
            className="w-full text-sm sm:text-base h-9 sm:h-10"
          />
          <p className="text-[10px] sm:text-xs text-muted/60">
            Requests per window
          </p>
        </div>

        {/* API Key Rate Limit */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="api_key_max" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <Key className="h-3 w-3 text-warning" />
            API Key Limit
          </Label>
          <Input
            id="api_key_max"
            type="number"
            value={apiKeyMax}
            onChange={(e) => setApiKeyMax(parseInt(e.target.value) || 60)}
            min={1}
            className="w-full text-sm sm:text-base h-9 sm:h-10"
          />
          <p className="text-[10px] sm:text-xs text-muted/60">
            Requests per window
          </p>
        </div>

        {/* Member Rate Limit */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="member_max" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <Users className="h-3 w-3 text-success" />
            Member Limit
          </Label>
          <Input
            id="member_max"
            type="number"
            value={memberMax}
            onChange={(e) => setMemberMax(parseInt(e.target.value) || 20)}
            min={1}
            className="w-full text-sm sm:text-base h-9 sm:h-10"
          />
          <p className="text-[10px] sm:text-xs text-muted/60">
            Check-in attempts per window
          </p>
        </div>
      </div>

      {/* Compact Information */}
      <div className="p-2.5 sm:p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex gap-2">
          <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[10px] sm:text-xs text-muted/80">
            <strong className="text-primary">Note:</strong> Changes take effect immediately. Active counters continue their current window, but new requests use updated limits.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10 px-4 sm:px-6 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 hover:from-slate-700 hover:via-slate-700/95 hover:to-slate-800 text-slate-100 hover:text-white border border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
        
        {hasChanges && (
          <Button
            onClick={handleReset}
            disabled={isPending}
            className="text-xs sm:text-sm h-9 sm:h-10 px-4 sm:px-6 bg-gradient-to-br from-slate-800/50 via-slate-800/40 to-slate-900/50 hover:from-slate-800/70 hover:via-slate-800/60 hover:to-slate-900/70 text-slate-300 hover:text-slate-100 border border-slate-700/50 hover:border-slate-600/70 transition-all duration-300 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 backdrop-blur-sm font-medium"
          >
            Reset
          </Button>
        )}
        
        {!hasChanges && (
          <span className="text-xs sm:text-sm text-muted/60 text-center sm:text-left">No changes to save</span>
        )}
      </div>
    </div>
  );
}
