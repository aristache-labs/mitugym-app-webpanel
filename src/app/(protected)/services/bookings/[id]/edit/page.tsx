import { fetchServices, fetchMembers, fetchSessionBookings } from "@/lib/data";
import { ServiceBookingForm } from "@/components/services/service-booking-form";
import { notFound } from "next/navigation";

interface EditServiceBookingPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Service Booking",
};

export default async function EditServiceBookingPage({ params }: EditServiceBookingPageProps) {
  const { id } = await params;
  
  const [services, members, bookings] = await Promise.all([
    fetchServices(),
    fetchMembers(),
    fetchSessionBookings(),
  ]);

  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Service Booking</h1>
        <p className="text-muted-foreground">
          Modify booking details and settings
        </p>
      </div>
      
      <ServiceBookingForm 
        booking={booking}
        services={services} 
        members={members} 
        mode="edit" 
      />
    </div>
  );
}
