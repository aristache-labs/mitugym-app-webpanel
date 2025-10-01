"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Activity, Users, Key, Clock } from "lucide-react";
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
          // Reload page to apply new settings
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
    <Card className="bg-card/90">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Rate Limiting Configuration</CardTitle>
            <p className="text-sm text-muted/60 mt-1">
              Control API request limits to prevent abuse and ensure service availability
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-surface/30 rounded-lg border border-surface/40">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted/60">IP Addresses</p>
                <p className="text-lg font-bold text-text">{stats.ip.activeIdentifiers}</p>
                <p className="text-xs text-muted/50">currently tracked</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-warning" />
              <div>
                <p className="text-xs text-muted/60">API Keys</p>
                <p className="text-lg font-bold text-text">{stats.apiKey.activeIdentifiers}</p>
                <p className="text-xs text-muted/50">currently tracked</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-success" />
              <div>
                <p className="text-xs text-muted/60">Members</p>
                <p className="text-lg font-bold text-text">{stats.member.activeIdentifiers}</p>
                <p className="text-xs text-muted/50">currently tracked</p>
              </div>
            </div>
          </div>
        )}

        {/* Rate Window Configuration */}
        <div className="space-y-2">
          <Label htmlFor="window_ms" className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Rate Limit Window
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              id="window_ms"
              type="number"
              value={windowMs}
              onChange={(e) => setWindowMs(parseInt(e.target.value) || 60000)}
              min={1000}
              step={1000}
              className="max-w-xs"
            />
            <span className="text-sm text-muted/60">
              milliseconds ({windowMinutes} minute{windowMinutes !== 1 ? 's' : ''}, {windowSeconds % 60} sec)
            </span>
          </div>
          <p className="text-xs text-muted/60">
            Time window for rate limit calculations. Default: 60000ms (1 minute)
          </p>
        </div>

        {/* IP Rate Limit */}
        <div className="space-y-2">
          <Label htmlFor="ip_max" className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            IP Address Limit
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              id="ip_max"
              type="number"
              value={ipMax}
              onChange={(e) => setIpMax(parseInt(e.target.value) || 100)}
              min={1}
              className="max-w-xs"
            />
            <span className="text-sm text-muted/60">requests per window</span>
          </div>
          <p className="text-xs text-muted/60">
            Maximum requests per IP address. Prevents DDoS attacks. Default: 100
          </p>
        </div>

        {/* API Key Rate Limit */}
        <div className="space-y-2">
          <Label htmlFor="api_key_max" className="flex items-center gap-2">
            <Key className="h-4 w-4 text-warning" />
            API Key Limit
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              id="api_key_max"
              type="number"
              value={apiKeyMax}
              onChange={(e) => setApiKeyMax(parseInt(e.target.value) || 60)}
              min={1}
              className="max-w-xs"
            />
            <span className="text-sm text-muted/60">requests per window</span>
          </div>
          <p className="text-xs text-muted/60">
            Maximum requests per API key. Prevents API abuse. Default: 60
          </p>
        </div>

        {/* Member Rate Limit */}
        <div className="space-y-2">
          <Label htmlFor="member_max" className="flex items-center gap-2">
            <Users className="h-4 w-4 text-success" />
            Member Limit
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              id="member_max"
              type="number"
              value={memberMax}
              onChange={(e) => setMemberMax(parseInt(e.target.value) || 20)}
              min={1}
              className="max-w-xs"
            />
            <span className="text-sm text-muted/60">requests per window</span>
          </div>
          <p className="text-xs text-muted/60">
            Maximum check-in attempts per member. Prevents spam. Default: 20
          </p>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex gap-3 pt-4 border-t border-surface/20">
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="gap-2 bg-primary hover:bg-primary/90 text-white"
            >
              <Shield className="h-4 w-4" />
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isPending}
            >
              Reset
            </Button>
          </div>
        )}

        {/* Information */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted/80">
            <strong className="text-primary">Note:</strong> Changes take effect immediately after saving. 
            Active rate limit counters will continue using their current window but new requests will use the updated limits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

