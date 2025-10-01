import { fetchCheckIns, fetchDashboardMetrics, fetchNews, fetchTodaysSessionBookings, fetchSchedule } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { MetricCard } from "@/components/dashboard/metric-card";
import { OccupancyChart } from "@/components/dashboard/occupancy-chart";
import { UpcomingServicesCard } from "@/components/dashboard/upcoming-services-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarWithPreview } from "@/components/members/avatar-preview-modal";
import { Users, UserCheck, AlertTriangle, Clock, Settings } from "lucide-react";
import Link from "next/link";
import { getTimeFormat } from "@/lib/timezone";

export default async function DashboardPage() {
  const [metrics, checkIns, news, todaysServices, schedule, timeFormat] = await Promise.all([
    fetchDashboardMetrics(),
    fetchCheckIns(),
    fetchNews(),
    fetchTodaysSessionBookings(),
    fetchSchedule(),
    getTimeFormat(),
  ]);

  const latestCheckIns = checkIns.slice(0, 5);
  const spotlightNews = news.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Premium Metrics Section - Compact Single Row */}
      <section className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <MetricCard 
          title="In Gym Now" 
          value={metrics.occupancy} 
          description="Live floor traffic" 
          icon={Users}
          href="/checkins"
        />
        <MetricCard 
          title="Active Members" 
          value={metrics.activeMembers} 
          description="Members in good standing" 
          icon={UserCheck}
          href="/members"
        />
        <MetricCard 
          title="Expiring This Week" 
          value={metrics.expiringSoon} 
          description="Memberships to renew" 
          icon={AlertTriangle}
          href="/members"
        />
        <MetricCard 
          title="Pending Bookings" 
          value={metrics.pendingBookings} 
          description="Awaiting confirmation" 
          icon={Clock}
          href="/bookings"
        />
        <MetricCard 
          title="Pending Services" 
          value={metrics.pendingServices} 
          description="Awaiting approval" 
          icon={Settings}
          href="/services"
        />
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <OccupancyChart checkIns={checkIns} schedule={schedule} timeFormat={timeFormat} />
          <UpcomingServicesCard bookings={todaysServices} timeFormat={timeFormat} />
        </div>
        
        {/* Enhanced Check-ins Card */}
        <Card className="group relative bg-card/95 backdrop-blur-sm border-surface/30 shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/15 hover:border-primary/50 overflow-hidden">
          {/* Full card hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />
          
           <CardHeader className="relative pb-4">
             {/* Gradient border */}
             <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <svg className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <Link href="/checkins" className="group/title">
                    <CardTitle className="text-lg font-semibold text-text group-hover:text-primary group-hover/title:text-primary transition-colors cursor-pointer">
                      Latest Check-ins
                    </CardTitle>
                  </Link>
                  <p className="text-xs text-muted/70 mt-0.5">Recent gym entries and activity</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-text">
                  {latestCheckIns.length} today
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative p-2">
            {latestCheckIns.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-text">No check-ins yet</p>
                  <p className="text-xs text-muted/80 mt-1">Member check-ins will appear here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {latestCheckIns.map((checkIn, index) => (
                  <div 
                    key={checkIn.id} 
                    className="group/item flex items-center justify-between rounded-2xl bg-gradient-to-r from-surface/80 to-surface/60 border border-surface/40 px-3 py-3 transition-all duration-200 hover:from-surface/90 hover:to-surface/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <div className="flex items-center gap-3">
                       <AvatarWithPreview
                         avatarUrl={checkIn.avatar_url}
                         memberName={checkIn.member_name || "Walk-in"}
                         size="small"
                         className="border-primary/20"
                       />
                       <div className="flex-1">
                         <div className="flex items-center gap-2">
                           {checkIn.member_name && checkIn.member_name !== "Walk-in" ? (
                             <Link href={`/members/${checkIn.member_id}`} className="group/member">
                               <p className="font-semibold text-text group-hover/item:text-primary group-hover/member:text-primary transition-colors cursor-pointer hover:underline">
                                 {checkIn.member_name}
                               </p>
                             </Link>
                           ) : (
                             <p className="font-semibold text-text group-hover/item:text-primary transition-colors">
                               Walk-in
                             </p>
                           )}
                         </div>
                         <div className="flex items-center gap-2 mt-1">
                           <svg className="h-3 w-3 text-muted/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           <p className="text-xs text-muted/80">{formatDate(checkIn.checked_in_at)}</p>
                         </div>
                       </div>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                       <div className="flex items-center gap-2">
                         {index === 0 && (
                           <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                             Latest
                           </span>
                         )}
                         <Badge 
                           variant="default" 
                           className="capitalize bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-colors"
                         >
                           {checkIn.method ?? "manual"}
                         </Badge>
                       </div>
                       <div className="text-xs text-muted/60">
                         Check-in #{latestCheckIns.length - index}
                       </div>
                     </div>
                  </div>
                ))}
              </div>
             )}
           </CardContent>
         </Card>
      </section>

      {/* Enhanced Announcements Section */}
      <section>
        <Card className="group relative bg-card/95 backdrop-blur-sm border-surface/30 shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/15 hover:border-primary/50 overflow-hidden">
          {/* Full card hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />
          
          <CardHeader className="relative pb-4">
            {/* Gradient border */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <svg className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div>
                  <Link href="/news" className="group/title">
                    <CardTitle className="text-lg font-semibold text-text group-hover:text-primary group-hover/title:text-primary transition-colors cursor-pointer">
                      Announcements
                    </CardTitle>
                  </Link>
                  <p className="text-xs text-muted/70 mt-0.5">Important updates and notifications</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-text">
                  {spotlightNews.length} active
                </div>
                <div className="text-xs text-muted/70">notices</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative p-6">
            {spotlightNews.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="h-8 w-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-text">No announcements</p>
                  <p className="text-xs text-muted/80 mt-1">All caught up with notifications</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {spotlightNews.map((item, index) => (
                  <article 
                    key={item.id} 
                    className="group/item relative rounded-2xl border border-surface/40 bg-gradient-to-r from-surface/80 to-surface/60 p-6 transition-all duration-200 hover:from-surface/90 hover:to-surface/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary group-hover/item:bg-primary/25 transition-colors">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-text group-hover/item:text-primary transition-colors">
                              {item.title}
                            </h3>
                            <p className="mt-2 text-sm text-muted/90 leading-relaxed">{item.content}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <Badge
                              variant={
                                item.priority === "high"
                                  ? "destructive"
                                  : item.priority === "medium"
                                    ? "warning"
                                    : "default"
                              }
                              className="shadow-sm"
                            >
                              {item.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-xs text-muted/70">
                            Expires {item.expires_at ? formatDate(item.expires_at) : "No expiry"}
                          </p>
                          <div className="text-xs text-muted/60">
                            Notice #{spotlightNews.length - index}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
