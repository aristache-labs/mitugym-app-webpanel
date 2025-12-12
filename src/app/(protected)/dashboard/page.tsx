import { fetchCheckIns, fetchDashboardMetrics, fetchNews, fetchTodaysSessionBookings, fetchSchedule } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { MetricCard } from "@/components/dashboard/metric-card";
import { OccupancyChart } from "@/components/dashboard/occupancy-chart";
import { UpcomingServicesCard } from "@/components/dashboard/upcoming-services-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarWithPreview } from "@/components/members/avatar-preview-modal";
import { AnnouncementsTitleLink, CheckInsTitleLink } from "@/components/dashboard/dashboard-card-links";
import { Users, UserCheck, AlertTriangle, Clock, Settings } from "lucide-react";
import Link from "next/link";
import { getTimeFormat, getAppTimezone } from "@/lib/timezone";

export default async function DashboardPage() {
  const [metrics, checkIns, news, todaysServices, schedule, timeFormat, appTimezone] = await Promise.all([
    fetchDashboardMetrics(),
    fetchCheckIns(),
    fetchNews(),
    fetchTodaysSessionBookings(),
    fetchSchedule(),
    getTimeFormat(),
    getAppTimezone(),
  ]);

  const latestCheckIns = checkIns.slice(0, 5);
  const spotlightNews = news.slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8 overflow-hidden">
      {/* Premium Metrics Section - Responsive Grid */}
      <section className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 animate-fade-in-up">
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
        <div className="col-span-2 flex justify-center md:col-span-1 md:block">
          <div className="w-1/2 md:w-full">
        <MetricCard 
          title="Pending Services" 
          value={metrics.pendingServices} 
          description="Awaiting approval" 
          icon={Settings}
          href="/services"
        />
          </div>
        </div>
      </section>

      {/* Main Content Grid - Stacks on mobile */}
      <section className="grid gap-6 sm:gap-8 lg:grid-cols-[2fr_1fr] animate-fade-in-up">
        <div className="space-y-6 sm:space-y-8">
          <div className="animate-scale-in">
          <OccupancyChart checkIns={checkIns} schedule={schedule} timeFormat={timeFormat} timezone={appTimezone} />
          </div>
          <div className="animate-scale-in">
          <UpcomingServicesCard bookings={todaysServices} timeFormat={timeFormat} />
          </div>
        </div>
        
        {/* Enhanced Check-ins Card */}
        <div className="animate-scale-in">
        <Card className="group relative bg-card/95 backdrop-blur-sm border-surface/30 shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/15 hover:border-primary/50 overflow-hidden">
          {/* Full card hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />
          
          <CardHeader className="relative pb-4 px-4 sm:px-6">
            {/* Gradient border */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            <CheckInsTitleLink recentCount={latestCheckIns.length} />
          </CardHeader>
          
          <CardContent className="relative p-2 sm:p-3">
            {latestCheckIns.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-medium text-text">No check-ins yet</p>
                  <p className="text-xs text-muted/80 mt-1">Member check-ins will appear here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {latestCheckIns.map((checkIn, index) => {
                  const status = checkIn.status || 'success';
                  const isDenied = status === 'denied';
                  
                  return (
                    <div 
                      key={checkIn.id} 
                      className={`group/item flex items-center justify-between rounded-xl sm:rounded-2xl bg-gradient-to-r border px-2 sm:px-3 py-2.5 sm:py-3 transition-all duration-200 ${
                        isDenied
                          ? 'from-destructive/10 to-destructive/5 border-destructive/30 hover:from-destructive/15 hover:to-destructive/10 hover:border-destructive/40'
                          : 'from-surface/80 to-surface/60 border-surface/40 hover:from-surface/90 hover:to-surface/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                         <AvatarWithPreview
                           avatarUrl={checkIn.avatar_url}
                           memberName={checkIn.member_name || "Walk-in"}
                           size="small"
                           className="border-primary/20 flex-shrink-0"
                         />
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-1.5 sm:gap-2">
                             {checkIn.member_name && checkIn.member_name !== "Walk-in" ? (
                               <Link href={`/members/${checkIn.member_id}`} className="group/member">
                                 <p className="text-sm sm:text-base font-semibold text-text group-hover/item:text-primary group-hover/member:text-primary transition-colors cursor-pointer hover:underline truncate">
                                   {checkIn.member_name}
                                 </p>
                               </Link>
                             ) : (
                               <p className="text-sm sm:text-base font-semibold text-text group-hover/item:text-primary transition-colors">
                                 Walk-in
                               </p>
                             )}
                             {isDenied && (
                               <Badge 
                                 variant="destructive" 
                                 className="text-xs flex-shrink-0"
                                 title={checkIn.denial_reason || 'Access denied'}
                               >
                                 Denied
                               </Badge>
                             )}
                           </div>
                           <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                             <svg className="h-3 w-3 text-muted/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             <p className="text-xs text-muted/80 truncate">{formatDate(checkIn.checked_in_at)}</p>
                           </div>
                         </div>
                       </div>
                       <div className="flex flex-col items-end gap-1.5 sm:gap-2 flex-shrink-0">
                         <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
                           {index === 0 && !isDenied && (
                             <span className="px-1.5 sm:px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] sm:text-xs font-medium border border-green-500/30 hidden sm:inline">
                               Latest
                             </span>
                           )}
                           {!isDenied && (
                             <Badge 
                               variant="default" 
                               className="capitalize bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-colors text-[10px] sm:text-xs"
                             >
                               {checkIn.method ?? "manual"}
                             </Badge>
                           )}
                         </div>
                         <div className="text-[10px] sm:text-xs text-muted/60 hidden sm:block">
                           Check-in #{latestCheckIns.length - index}
                         </div>
                       </div>
                    </div>
                  );
                })}
              </div>
             )}
           </CardContent>
         </Card>
         </div>
      </section>

      {/* Enhanced Announcements Section */}
      <section className="animate-fade-in-up">
        <Card className="group relative bg-card/95 backdrop-blur-sm border-surface/30 shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/15 hover:border-primary/50 overflow-hidden">
          {/* Full card hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />
          
          <CardHeader className="relative pb-4 px-4 sm:px-6">
            {/* Gradient border */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            <AnnouncementsTitleLink activeCount={spotlightNews.length} />
          </CardHeader>
          <CardContent className="relative p-4 sm:p-6">
            {spotlightNews.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="h-6 w-6 sm:h-8 sm:w-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-medium text-text">No announcements</p>
                  <p className="text-xs text-muted/80 mt-1">All caught up with notifications</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {spotlightNews.map((item, index) => (
                  <article 
                    key={item.id} 
                    className="group/item relative rounded-xl sm:rounded-2xl border border-surface/40 bg-gradient-to-r from-surface/80 to-surface/60 p-4 sm:p-6 transition-all duration-200 hover:from-surface/90 hover:to-surface/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 hidden sm:block">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary group-hover/item:bg-primary/25 transition-colors">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-text group-hover/item:text-primary transition-colors">
                              {item.title}
                            </h3>
                            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted/90 leading-relaxed">{item.content}</p>
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
                              className="shadow-sm text-xs"
                            >
                              {item.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-0">
                          <p className="text-xs text-muted/70">
                            Expires {item.expires_at ? formatDate(item.expires_at) : "No expiry"}
                          </p>
                          <div className="text-xs text-muted/60 hidden sm:block">
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
