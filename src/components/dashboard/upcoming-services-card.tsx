import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceBooking } from "@/types";
import { Calendar, Clock, User, Briefcase } from "lucide-react";
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Today's Services
        </CardTitle>
        <Link href="/services" className="text-xs text-muted-foreground hover:text-foreground">
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-6">
            <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No services scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">
                      {format(new Date(booking.booking_date), "HH:mm")}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {booking.service?.name || "Unknown Service"}
                      </span>
                      {booking.service?.service_type && getServiceTypeBadge(booking.service.service_type)}
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {booking.member?.full_name || "Unknown Member"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {booking.sessions_remaining && booking.sessions_remaining > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {booking.sessions_remaining} left
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {bookings.length > 5 && (
              <div className="text-center pt-2">
                <Link 
                  href="/services" 
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  +{bookings.length - 5} more services today
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
