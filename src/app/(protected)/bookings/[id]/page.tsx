import { notFound } from "next/navigation";
import { fetchSessionBookings } from "@/lib/data";
// Session booking view component
import { SessionBookingView } from "@/components/services/session-booking-view";

interface ViewSessionBookingPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "View Session Booking",
};

export default async function ViewSessionBookingPage({ params }: ViewSessionBookingPageProps) {
  const { id } = await params;

  const bookings = await fetchSessionBookings();
  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Session Booking Details</h1>
        <p className="text-muted-foreground">
          View complete booking information
        </p>
      </div>

      <SessionBookingView booking={booking} />
    </div>
  );
}
