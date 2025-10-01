import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { fetchAuditLogs, fetchApiLogs } from "@/lib/data";
import { getSetting } from "@/lib/settings";
import type { TimeFormat } from "@/lib/settings";
import { getRateLimiterStats } from "@/lib/rate-limit";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const [logs, apiLogs, currentTimezone, currentTimeFormat, rateLimitSettings] = await Promise.all([
    fetchAuditLogs(),
    fetchApiLogs(100),
    getSetting<string>('timezone').then(tz => tz || 'Europe/Bucharest'),
    getSetting<TimeFormat>('time_format').then(fmt => fmt || '24h'),
    Promise.all([
      getSetting<string>('rate_limit_window_ms').then(v => parseInt(v || '60000')),
      getSetting<string>('rate_limit_ip_max').then(v => parseInt(v || '100')),
      getSetting<string>('rate_limit_api_key_max').then(v => parseInt(v || '60')),
      getSetting<string>('rate_limit_member_max').then(v => parseInt(v || '20')),
    ]).then(([window_ms, ip_max, api_key_max, member_max]) => ({
      window_ms,
      ip_max,
      api_key_max,
      member_max,
    })),
  ]);

  const stats = getRateLimiterStats();

  return (
    <SettingsPageClient
      initialTab={params.tab}
      currentTimezone={currentTimezone}
      currentTimeFormat={currentTimeFormat}
      rateLimitSettings={rateLimitSettings}
      stats={stats}
      logs={logs}
      apiLogs={apiLogs}
    />
  );
}
