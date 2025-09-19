import { fetchCheckIns, fetchDashboardMetrics, fetchNews } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { MetricCard } from "@/components/dashboard/metric-card";
import { OccupancyChart } from "@/components/dashboard/occupancy-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const [metrics, checkIns, news] = await Promise.all([
    fetchDashboardMetrics(),
    fetchCheckIns(),
    fetchNews(),
  ]);

  const latestCheckIns = checkIns.slice(0, 5);
  const spotlightNews = news.slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="In Gym Now" value={metrics.occupancy} description="Live floor traffic" />
        <MetricCard title="Active members" value={metrics.activeMembers} description="Members in good standing" />
        <MetricCard title="Expiring this week" value={metrics.expiringSoon} description="Memberships to renew" />
      </section>
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <OccupancyChart checkIns={checkIns} />
        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Latest check-ins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {latestCheckIns.map((checkIn) => (
              <div key={checkIn.id} className="flex items-center justify-between rounded-[16px] bg-surface/60 px-4 py-3">
                <div>
                  <p className="font-medium text-text/90">{checkIn.member_name ?? "Walk-in"}</p>
                  <p className="text-xs text-muted">{formatDate(checkIn.checked_in_at)}</p>
                </div>
                <Badge variant="default" className="capitalize">
                  {checkIn.method ?? "manual"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <section>
        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {spotlightNews.length === 0 ? (
              <p className="text-sm text-muted">No announcements scheduled.</p>
            ) : (
              spotlightNews.map((item) => (
                <article key={item.id} className="rounded-[16px] border border-surface/50 bg-surface/60 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-text">{item.title}</h3>
                    <Badge
                      variant={
                        item.priority === "high"
                          ? "destructive"
                          : item.priority === "medium"
                            ? "warning"
                            : "default"
                      }
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">{item.content}</p>
                  <p className="mt-3 text-xs text-muted">
                    Expires {item.expires_at ? formatDate(item.expires_at) : "No expiry"}
                  </p>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
