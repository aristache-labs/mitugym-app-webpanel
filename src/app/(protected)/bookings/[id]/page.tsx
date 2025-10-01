import { notFound } from "next/navigation";
import { fetchSessionBookings } from "@/lib/data";
import { SessionBookingView } from "@/components/services/session-booking-view";
import { getTimeFormat } from "@/lib/timezone";

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

  const [bookings, timeFormat] = await Promise.all([
    fetchSessionBookings(),
    getTimeFormat(),
  ]);
  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    notFound();
  }

  return <SessionBookingView booking={booking} timeFormat={timeFormat} />;
}
