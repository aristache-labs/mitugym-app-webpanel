import { notFound } from "next/navigation";
import { fetchSessionBookings } from "@/lib/data";
// Session booking edit form component
import { SessionBookingEditForm } from "@/components/services/session-booking-edit-form";

interface EditSessionBookingPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Session Booking",
};

export default async function EditSessionBookingPage({ params }: EditSessionBookingPageProps) {
  const { id } = await params;

  const bookings = await fetchSessionBookings();
  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Session Booking</h1>
        <p className="text-muted-foreground">
          Modify booking details and settings
        </p>
      </div>

      <SessionBookingEditForm booking={booking} />
    </div>
  );
}
