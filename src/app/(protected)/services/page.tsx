import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchServices, fetchServiceBookings } from "@/lib/data";
import { ServicesTable } from "./services-table";
import { BookingsTable } from "./bookings-table";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Services Management",
};

export default async function ServicesPage() {
  const [services, bookings] = await Promise.all([
    fetchServices(),
    fetchServiceBookings(),
  ]);

  const activeServices = services.filter((service) => service.is_active);
  const upcomingBookings = bookings.filter((booking) => booking.status === "upcoming");

  return (
    <div className="space-y-6">
      {/* Services Management */}
      <Card className="bg-card/90">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Services ({activeServices.length} active)</CardTitle>
          <Link href="/services/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <ServicesTable services={services} />
        </CardContent>
      </Card>

      {/* Bookings Management */}
      <Card className="bg-card/90">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Service Bookings ({upcomingBookings.length} upcoming)</CardTitle>
          <Link href="/services/bookings/new">
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Booking
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={bookings} services={services} />
        </CardContent>
      </Card>
    </div>
  );
}
