import { AuditLogTable } from "@/components/settings/audit-log-table";
import { ApiLogTable } from "@/components/settings/api-log-table";
import { ClearAuditLogsButton } from "@/components/settings/clear-audit-logs-button";
import { TimezoneSettings } from "@/components/settings/timezone-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAuditLogs, fetchApiLogs } from "@/lib/data";
import { getSetting } from "@/lib/settings";
import type { TimeFormat } from "@/lib/settings";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const [logs, apiLogs, currentTimezone, currentTimeFormat] = await Promise.all([
    fetchAuditLogs(),
    fetchApiLogs(100),
    getSetting<string>('timezone').then(tz => tz || 'Europe/Bucharest'),
    getSetting<TimeFormat>('time_format').then(fmt => fmt || '24h'),
  ]);

  return (
    <div className="space-y-6">
      {/* Timezone Settings */}
      <TimezoneSettings currentTimezone={currentTimezone} currentTimeFormat={currentTimeFormat} />

      {/* API Logs */}
      <Card className="bg-card/90">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>API Logs</CardTitle>
            <p className="text-sm text-muted/60 mt-1">
              Check-in API requests from barcode scanners
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ApiLogTable logs={apiLogs} timeFormat={currentTimeFormat} />
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card className="bg-card/90">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Audit log</CardTitle>
          <ClearAuditLogsButton />
        </CardHeader>
        <CardContent>
          <AuditLogTable entries={logs} timeFormat={currentTimeFormat} />
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted">
          <p>
            Supabase service role mutations already append to <code>audit_logs</code>. The mobile scanner will call the `/api/checkin`
            endpoint (to be implemented) to validate QR codes against active memberships.
          </p>
          <p>
            Update environment variables in the `.env` file or using your hosting provider&apos;s secrets dashboard. Values are loaded
            at build time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
