import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceBooking } from "@/types";
import { Calendar, Clock, Briefcase } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface UpcomingServicesCardProps {
  bookings: ServiceBooking[];
}

export function UpcomingServicesCard({ bookings }: UpcomingServicesCardProps) {
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
    <Card className="bg-card/95 backdrop-blur-sm border-surface/30 shadow-2xl shadow-black/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-surface/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-text to-primary bg-clip-text text-transparent flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Today&apos;s Bookings
        </CardTitle>
        <Link 
          href="/bookings" 
          className="text-xs text-muted/80 hover:text-primary transition-colors font-medium bg-surface/60 px-3 py-1.5 rounded-full hover:bg-primary/10 border border-surface/40 hover:border-primary/30"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-primary/60" />
            </div>
            <p className="text-sm text-muted/90">No bookings scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-surface/80 to-surface/60 border border-surface/40 transition-all duration-200 hover:from-surface/90 hover:to-surface/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-xl border border-primary/20">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-primary">
                      {format(new Date(booking.booking_date), "HH:mm")}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-xs">
                        {(booking.member?.full_name || "U").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-base text-text group-hover:text-primary transition-colors">
                        {booking.member?.full_name || "Unknown Member"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-10">
                      <span className="text-sm text-muted/90">
                        {booking.service?.name || "Unknown Service"}
                      </span>
                      {booking.service?.service_type && getServiceTypeBadge(booking.service.service_type)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {booking.sessions_remaining && booking.sessions_remaining > 0 && (
                    <div className="bg-secondary/20 text-secondary px-2 py-1 rounded-lg text-xs font-medium border border-secondary/30">
                      {booking.sessions_remaining} left
                    </div>
                  )}
                </div>
              </div>
            ))}

            {bookings.length > 5 && (
              <div className="text-center pt-4">
                <Link
                  href="/bookings"
                  className="inline-flex items-center gap-2 text-sm text-muted/80 hover:text-primary transition-colors font-medium bg-surface/60 px-4 py-2 rounded-full hover:bg-primary/10 border border-surface/40 hover:border-primary/30"
                >
                  <span>+{bookings.length - 5} more bookings today</span>
                  <Calendar className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
