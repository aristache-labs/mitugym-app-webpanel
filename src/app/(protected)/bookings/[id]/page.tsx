import { notFound } from "next/navigation";
import { fetchSessionBookings } from "@/lib/data";
import { SessionBookingView } from "@/components/services/session-booking-view";

interface ViewSessionBookingPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Session Booking Details",
};

// Disable caching to ensure fresh data
export const revalidate = 0;

export default async function ViewSessionBookingPage({ params }: ViewSessionBookingPageProps) {
  const { id } = await params;

  const bookings = await fetchSessionBookings();
  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    notFound();
  }

  return <SessionBookingView booking={booking} />;
}
