import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceBooking } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { AvatarWithPreview } from "@/components/members/avatar-preview-modal";
import { Calendar, Clock, Briefcase } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface UpcomingServicesCardProps {
  bookings: ServiceBooking[];
  timeFormat?: TimeFormat;
}

export function UpcomingServicesCard({ bookings, timeFormat = '24h' }: UpcomingServicesCardProps) {
  const getServiceTypeBadge = (type: string) => {
    switch (type) {
      case "personal_trainer":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">PT</Badge>;
      case "professional_massage":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Massage</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{type}</Badge>;
    }
  };

  return (
    <Card className="group relative bg-card/95 backdrop-blur-sm border-surface/30 shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/15 hover:border-primary/50 overflow-hidden">
      {/* Full card hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />
      
      <CardHeader className="relative pb-4">
        {/* Gradient border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Calendar className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Link href="/bookings" className="md:pointer-events-none">
                  <CardTitle className="text-lg font-semibold text-text group-hover:text-primary transition-colors md:cursor-default">
                    Today&apos;s Bookings
                  </CardTitle>
                </Link>
                <Link 
                  href="/bookings" 
                  className="hidden md:inline-flex text-xs text-muted/80 hover:text-primary transition-colors font-medium bg-surface/60 px-3 py-1.5 rounded-full hover:bg-primary/10 border border-surface/40 hover:border-primary/30"
                >
                  View all →
                </Link>
              </div>
              <p className="text-xs text-muted/70 mt-0.5">Scheduled sessions and appointments</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-text">
              {bookings.length} scheduled
            </div>
            <div className="text-xs text-muted/70">sessions</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative p-6">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-primary/60" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text">No bookings scheduled</p>
              <p className="text-xs text-muted/80 mt-1">Today&apos;s schedule is clear</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="group/item flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-surface/80 to-surface/60 border border-surface/40 transition-all duration-200 hover:from-surface/90 hover:to-surface/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-xl border border-primary/20 group-hover/item:bg-primary/20 transition-colors">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-primary">
                      {timeFormat === '12h' 
                        ? format(new Date(booking.booking_date), "h:mm a")
                        : format(new Date(booking.booking_date), "HH:mm")
                      }
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AvatarWithPreview
                        avatarUrl={booking.member?.avatar_url}
                        memberName={booking.member?.full_name || "Unknown Member"}
                        size="small"
                        className="border-primary/20"
                      />
                      <div className="flex-1">
                        <Link href="/bookings" className="group/member">
                          <span className="font-semibold text-base text-text group-hover/item:text-primary group-hover/member:text-primary transition-colors block cursor-pointer hover:underline">
                            {booking.member?.full_name || "Unknown Member"}
                          </span>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted/90">
                            {booking.service?.name || "Unknown Service"}
                          </span>
                          {booking.service?.service_type && getServiceTypeBadge(booking.service.service_type)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={booking.status === "confirmed" ? "success" : booking.status === "pending" ? "warning" : "default"}
                      className="text-xs capitalize"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  {booking.sessions_remaining && booking.sessions_remaining > 0 && (
                    <div className="bg-secondary/20 text-secondary px-2 py-1 rounded-lg text-xs font-medium border border-secondary/30">
                      {booking.sessions_remaining} left
                    </div>
                  )}
                </div>
              </div>
            ))}

            {bookings.length > 5 && (
              <div className="text-center pt-6">
                <div className="relative">
                  {/* Gradient border */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                  <div className="pt-4">
                    <Link
                      href="/bookings"
                      className="inline-flex items-center gap-2 text-sm text-muted/80 hover:text-primary transition-colors font-medium bg-surface/60 px-4 py-2 rounded-full hover:bg-primary/10 border border-surface/40 hover:border-primary/30"
                    >
                      <span>+{bookings.length - 5} more bookings today</span>
                      <Calendar className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
