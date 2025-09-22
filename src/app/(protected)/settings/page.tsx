import { AuditLogTable } from "@/components/settings/audit-log-table";
import { ClearAuditLogsButton } from "@/components/settings/clear-audit-logs-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAuditLogs } from "@/lib/data";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const logs = await fetchAuditLogs();
  return (
    <div className="space-y-6">
      <Card className="bg-card/90">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Audit log</CardTitle>
          <ClearAuditLogsButton />
        </CardHeader>
        <CardContent>
          <AuditLogTable entries={logs} />
        </CardContent>
      </Card>
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
