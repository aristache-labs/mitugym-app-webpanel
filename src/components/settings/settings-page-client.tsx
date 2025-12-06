"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuditLogTable } from "@/components/settings/audit-log-table";
import { ApiLogTable } from "@/components/settings/api-log-table";
import { ClearAuditLogsButton } from "@/components/settings/clear-audit-logs-button";
import { ClearApiLogsButton } from "@/components/settings/clear-api-logs-button";
import { TimezoneSettings } from "@/components/settings/timezone-settings";
import { RateLimitSettings } from "@/components/settings/rate-limit-settings";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import type { TimeFormat } from "@/lib/settings";
import { getRateLimiterStats } from "@/lib/rate-limit";
import { Settings as SettingsIcon, Shield, Activity, Globe, FileText, Plug } from "lucide-react";
import type { AuditLogEntry, ApiLog } from "@/types";
import { PageHeader } from "@/components/ui/page-header";

interface SettingsPageClientProps {
  initialTab?: string;
  currentTimezone: string;
  currentTimeFormat: TimeFormat;
  rateLimitSettings: {
    window_ms: number;
    ip_max: number;
    api_key_max: number;
    member_max: number;
  };
  stats: ReturnType<typeof getRateLimiterStats>;
  logs: AuditLogEntry[];
  apiLogs: ApiLog[];
}

export function SettingsPageClient({
  initialTab = "general",
  currentTimezone,
  currentTimeFormat,
  rateLimitSettings,
  stats,
  logs,
  apiLogs,
}: SettingsPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync with URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["general", "security", "logs"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6 sm:space-y-8 overflow-hidden">
      {/* Page Header */}
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        subtitle="Configure your gym management system"
      />

      {/* Tabbed Interface */}
      <Tabs defaultValue="general" value={activeTab} onValueChange={handleTabChange}>
        <div className="flex justify-center sm:justify-start">
          <TabsList>
          <TabsTrigger value="general" icon={<Globe className="h-4 w-4" />}>
            <span className="hidden sm:inline">General Settings</span>
            <span className="sm:hidden">General</span>
          </TabsTrigger>
          <TabsTrigger value="security" icon={<Shield className="h-4 w-4" />}>
            <span className="hidden sm:inline">Security & API</span>
            <span className="sm:hidden">Security</span>
          </TabsTrigger>
          <TabsTrigger value="logs" icon={<Activity className="h-4 w-4" />}>
            <span className="hidden sm:inline">Activity Logs</span>
            <span className="sm:hidden">Logs</span>
          </TabsTrigger>
        </TabsList>
        </div>

        {/* Tab 1: General Settings */}
        <TabsContent value="general">
          <div className="space-y-4 sm:space-y-6">
            {/* Timezone Settings - Always Expanded */}
            <div className="rounded-xl sm:rounded-[16px] border border-surface/60 bg-card/80 backdrop-blur p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-text">Timezone Configuration</h2>
                  <p className="text-[10px] sm:text-xs text-muted/60 mt-0.5">Set your application timezone and time format</p>
                </div>
              </div>
              <TimezoneSettings currentTimezone={currentTimezone} currentTimeFormat={currentTimeFormat} />
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Security & API */}
        <TabsContent value="security">
          <div className="space-y-3 sm:space-y-4">
            {/* Rate Limiting - Collapsible */}
            <Collapsible
              title="Rate Limiting Configuration"
              icon={<Shield className="h-4 w-4 sm:h-5 sm:w-5" />}
              badge={
                <Badge variant="default" className="bg-primary/20 text-primary border-primary/30 text-[10px] sm:text-xs">
                  {stats.ip.activeIdentifiers + stats.apiKey.activeIdentifiers + stats.member.activeIdentifiers} Active
                </Badge>
              }
              defaultOpen={false}
            >
              <RateLimitSettings currentSettings={rateLimitSettings} stats={stats} />
            </Collapsible>

            {/* Integrations - Collapsible */}
            <Collapsible
              title="Integrations"
              icon={<Plug className="h-4 w-4 sm:h-5 sm:w-5" />}
              defaultOpen={false}
            >
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted">
                <p>
                  Supabase service role mutations already append to <code className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-surface/50 rounded text-primary text-[10px] sm:text-xs">audit_logs</code>. The mobile scanner will call the <code className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-surface/50 rounded text-primary text-[10px] sm:text-xs">/api/checkin</code> endpoint to validate QR codes against active memberships.
                </p>
                <p>
                  Update environment variables in the <code className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-surface/50 rounded text-primary text-[10px] sm:text-xs">.env</code> file or using your hosting provider&apos;s secrets dashboard. Values are loaded at build time.
                </p>
              </div>
            </Collapsible>
          </div>
        </TabsContent>

        {/* Tab 3: Activity Logs */}
        <TabsContent value="logs">
          <div className="space-y-3 sm:space-y-4">
            {/* API Logs - Collapsible */}
            <Collapsible
              title="API Logs"
              icon={<Activity className="h-4 w-4 sm:h-5 sm:w-5" />}
              badge={
                <Badge variant="default" className="bg-primary/20 text-primary border-primary/30 text-[10px] sm:text-xs">
                  {apiLogs.length} Requests
                </Badge>
              }
              defaultOpen={false}
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-2 sm:gap-0">
                  <p className="text-xs sm:text-sm text-muted/60 text-center sm:text-left">
                    Check-in API requests from barcode scanners and mobile devices
                  </p>
                  <ClearApiLogsButton />
                </div>
                <ApiLogTable logs={apiLogs} timeFormat={currentTimeFormat} />
              </div>
            </Collapsible>

            {/* Audit Log - Collapsible */}
            <Collapsible
              title="Audit Log"
              icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}
              badge={
                <Badge variant="default" className="bg-primary/20 text-primary border-primary/30 text-[10px] sm:text-xs">
                  {logs.length} Entries
                </Badge>
              }
              defaultOpen={false}
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-2 sm:gap-0">
                  <p className="text-xs sm:text-sm text-muted/60 text-center sm:text-left">
                    Complete history of system activities and changes
                  </p>
                  <ClearAuditLogsButton />
                </div>
                <AuditLogTable entries={logs} timeFormat={currentTimeFormat} />
              </div>
            </Collapsible>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

