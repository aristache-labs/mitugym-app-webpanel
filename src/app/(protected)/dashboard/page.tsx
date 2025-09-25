import { fetchCheckIns, fetchDashboardMetrics, fetchNews, fetchTodaysSessionBookings, fetchSchedule } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { MetricCard } from "@/components/dashboard/metric-card";
import { OccupancyChart } from "@/components/dashboard/occupancy-chart";
import { UpcomingServicesCard } from "@/components/dashboard/upcoming-services-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const [metrics, checkIns, news, todaysServices, schedule] = await Promise.all([
    fetchDashboardMetrics(),
    fetchCheckIns(),
    fetchNews(),
    fetchTodaysSessionBookings(),
    fetchSchedule(),
  ]);

  const latestCheckIns = checkIns.slice(0, 5);
  const spotlightNews = news.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Premium Metrics Section */}
      <section className="grid gap-6 md:grid-cols-3">
        <MetricCard title="In Gym Now" value={metrics.occupancy} description="Live floor traffic" />
        <MetricCard title="Active members" value={metrics.activeMembers} description="Members in good standing" />
        <MetricCard title="Expiring this week" value={metrics.expiringSoon} description="Memberships to renew" />
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <OccupancyChart checkIns={checkIns} schedule={schedule} />
          <UpcomingServicesCard bookings={todaysServices} />
        </div>
        
        {/* Enhanced Check-ins Card */}
        <Card className="bg-card/95 backdrop-blur-sm border-surface/30 shadow-2xl shadow-black/20">
          <CardHeader className="border-b border-surface/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
              Latest Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            {latestCheckIns.map((checkIn) => (
              <div 
                key={checkIn.id} 
                className="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-surface/80 to-surface/60 border border-surface/40 px-5 py-4 transition-all duration-200 hover:from-surface/90 hover:to-surface/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                    {(checkIn.member_name ?? "W").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-text group-hover:text-primary transition-colors">
                      {checkIn.member_name ?? "Walk-in"}
                    </p>
                    <p className="text-xs text-muted/80">{formatDate(checkIn.checked_in_at)}</p>
                  </div>
                </div>
                <Badge 
                  variant="default" 
                  className="capitalize bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                >
                  {checkIn.method ?? "manual"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Enhanced Announcements Section */}
      <section>
        <Card className="bg-card/95 backdrop-blur-sm border-surface/30 shadow-2xl shadow-black/20">
          <CardHeader className="border-b border-surface/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {spotlightNews.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">📢</span>
                </div>
                <p className="text-sm text-muted">No announcements scheduled.</p>
              </div>
            ) : (
              spotlightNews.map((item) => (
                <article 
                  key={item.id} 
                  className="group rounded-2xl border border-surface/40 bg-gradient-to-r from-surface/80 to-surface/60 p-6 transition-all duration-200 hover:from-surface/90 hover:to-surface/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-text group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm text-muted/90 leading-relaxed">{item.content}</p>
                      <p className="mt-4 text-xs text-muted/70">
                        Expires {item.expires_at ? formatDate(item.expires_at) : "No expiry"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.priority === "high"
                          ? "destructive"
                          : item.priority === "medium"
                            ? "warning"
                            : "default"
                      }
                      className="ml-4 shadow-sm"
                    >
                      {item.priority}
                    </Badge>
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
