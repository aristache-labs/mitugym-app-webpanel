import { fetchServices, fetchMembers } from "@/lib/data";
import { ServiceBookingForm } from "@/components/services/service-booking-form";

export const metadata = {
  title: "New Service Booking",
};

export default async function NewServiceBookingPage() {
  const [services, members] = await Promise.all([
    fetchServices(),
    fetchMembers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Service Booking</h1>
        <p className="text-muted-foreground">
          Schedule a service appointment for a member
        </p>
      </div>
      
      <ServiceBookingForm 
        services={services} 
        members={members} 
        mode="create" 
      />
    </div>
  );
}
