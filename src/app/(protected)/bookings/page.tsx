import { fetchSessionBookings } from "@/lib/data";
import { SessionBookingsTable } from "./session-bookings-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Clock, CheckCircle, AlertCircle, Package } from "lucide-react";
import { getTimeFormat } from "@/lib/timezone";

export const metadata = {
  title: "Session Bookings",
};

// Disable caching to ensure fresh data
export const revalidate = 0;

export default async function BookingsPage() {
  const [bookings, timeFormat] = await Promise.all([
    fetchSessionBookings(),
    getTimeFormat(),
  ]);

  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const confirmedBookings = bookings.filter((booking) => booking.status === "upcoming");
  const completedBookings = bookings.filter((booking) => booking.status === "completed");

  return (
    <div className="space-y-6 sm:space-y-8 overflow-x-hidden">

      {/* Metrics Section */}
      <section className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-4 px-1 sm:px-2">
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

      {/* Bookings Table */}
      <section className="relative">
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-xl shadow-black/15 transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 hover:border-surface/60 overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <div className="relative">
            <SessionBookingsTable bookings={bookings} timeFormat={timeFormat} />
          </div>
        </div>
      </section>
    </div>
  );
}
