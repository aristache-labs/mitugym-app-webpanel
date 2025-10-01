import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchSessionBookings } from "@/lib/data";
import { SessionBookingsTable } from "./session-bookings-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Plus, Calendar, Clock, CheckCircle, AlertCircle, Package } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Session Bookings",
};

// Disable caching to ensure fresh data
export const revalidate = 0;

export default async function BookingsPage() {
  const bookings = await fetchSessionBookings();

  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const confirmedBookings = bookings.filter((booking) => booking.status === "upcoming");
  const completedBookings = bookings.filter((booking) => booking.status === "completed");

  return (
    <div className="space-y-8">

      {/* Metrics Section */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <MetricCard 
          title="Total Bookings" 
          value={bookings.length} 
          description="All time bookings" 
          icon={Package}
        />
        <MetricCard 
          title="Pending" 
          value={pendingBookings.length} 
          description="Awaiting confirmation" 
          icon={AlertCircle}
        />
        <MetricCard 
          title="Confirmed" 
          value={confirmedBookings.length} 
          description="Upcoming sessions" 
          icon={Clock}
        />
        <MetricCard 
          title="Completed" 
          value={completedBookings.length} 
          description="Finished sessions" 
          icon={CheckCircle}
        />
      </section>

      {/* Premium Bookings Table */}
      <div className="relative">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 rounded-3xl blur-2xl"></div>
        
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-3xl hover:shadow-secondary/10 hover:border-secondary/50 overflow-hidden rounded-3xl">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/2 via-secondary/1 to-primary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
          
          {/* Gradient Border */}
          <div className="absolute inset-0 rounded-3xl">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-secondary/30 to-transparent" 
                 style={{ 
                   mask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                   maskComposite: 'exclude',
                   WebkitMask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                   WebkitMaskComposite: 'xor',
                   padding: '1px'
                 }}>
            </div>
          </div>
          
          <CardHeader className="relative p-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-colors">
                  <Calendar className="h-6 w-6 text-secondary/60 hover:text-secondary transition-colors" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-text hover:text-secondary transition-colors">
                    All Session Bookings
                  </CardTitle>
                  <p className="text-sm text-muted/70 mt-1">Manage and track all booking sessions</p>
                </div>
              </div>
              <Link href="/bookings/new">
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
                  <Plus className="h-4 w-4" />
                  New Booking
                </Button>
              </Link>
            </div>
          </CardHeader>
          
          <CardContent className="relative p-8 pt-0">
          <SessionBookingsTable bookings={bookings} />
        </CardContent>
        </div>
      </div>
    </div>
  );
}
