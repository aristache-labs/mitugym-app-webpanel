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
    <Card className="group relative bg-card/95 backdrop-blur-sm border-surface/30 shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/15 hover:border-primary/50 overflow-hidden w-full">
      {/* Full card hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />
      
      <CardHeader className="relative pb-4 px-4 sm:px-6">
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
      <CardContent className="relative p-3 sm:p-4 md:p-6">
        {bookings.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-primary/60" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text">No bookings scheduled</p>
              <p className="text-xs text-muted/80 mt-1">Today&apos;s schedule is clear</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="group/item relative rounded-xl bg-gradient-to-r from-surface/80 to-surface/60 border border-surface/40 transition-all duration-200 hover:from-surface/90 hover:to-surface/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 p-3"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <AvatarWithPreview
                    avatarUrl={booking.member?.avatar_url}
                    memberName={booking.member?.full_name || "Unknown Member"}
                    size="small"
                    className="border-primary/20 flex-shrink-0"
                  />

                  {/* Member Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Member Name */}
                    <Link href="/bookings" className="group/member">
                      <h4 className="font-semibold text-base text-text group-hover/item:text-primary group-hover/member:text-primary transition-colors cursor-pointer hover:underline truncate leading-tight">
                        {booking.member?.full_name || "Unknown Member"}
                      </h4>
                    </Link>

                    {/* Row 1: Service & Sessions */}
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                      <span className="text-xs text-muted/80">
                        {booking.service?.name || "Unknown Service"}
                      </span>
                      {booking.service?.service_type && (
                        <>
                          <span className="text-muted/40">•</span>
                          {getServiceTypeBadge(booking.service.service_type)}
                        </>
                      )}
                      {booking.sessions_remaining && booking.sessions_remaining > 0 && (
                        <>
                          <span className="text-muted/40">•</span>
                          <span className="text-xs font-medium text-secondary">
                            {booking.sessions_remaining} sessions left
                          </span>
                        </>
                      )}
                      
                      {/* Time & Status - Desktop Only */}
                      <span className="hidden sm:inline text-muted/40">•</span>
                      <div className="hidden sm:flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted/60" />
                        <span className="text-xs text-muted/70">Time:</span>
                        <span className="text-xs font-bold text-primary">
                          {timeFormat === '12h' 
                            ? format(new Date(booking.booking_date), "h:mm a")
                            : format(new Date(booking.booking_date), "HH:mm")
                          }
                        </span>
                      </div>

                      <span className="hidden sm:inline text-muted/40">•</span>
                      <div className="hidden sm:flex items-center gap-1.5">
                        <span className="text-xs text-muted/70">Status:</span>
                        <Badge 
                          variant={booking.status === "confirmed" ? "success" : booking.status === "pending" ? "warning" : "default"}
                          className="text-xs capitalize"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Row 2: Time & Status - Mobile Only */}
                    <div className="flex sm:hidden items-center flex-wrap gap-x-2 gap-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted/60" />
                        <span className="text-xs text-muted/70">Time:</span>
                        <span className="text-xs font-bold text-primary">
                          {timeFormat === '12h' 
                            ? format(new Date(booking.booking_date), "h:mm a")
                            : format(new Date(booking.booking_date), "HH:mm")
                          }
                        </span>
                      </div>

                      <span className="text-muted/40">•</span>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted/70">Status:</span>
                        <Badge 
                          variant={booking.status === "confirmed" ? "success" : booking.status === "pending" ? "warning" : "default"}
                          className="text-xs capitalize"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
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
