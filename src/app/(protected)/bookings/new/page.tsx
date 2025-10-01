import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SessionBookingForm } from "@/components/services/session-booking-form";
import { fetchMembers, fetchServices } from "@/lib/data";

export const metadata = {
  title: "New Session Booking",
};

// Disable caching to ensure fresh data
export const revalidate = 0;

export default async function NewBookingPage() {
  const [members, services] = await Promise.all([
    fetchMembers(),
    fetchServices()
  ]);

  // Filter only active services
  const activeServices = services.filter(service => service.is_active);

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 rounded-3xl blur-2xl"></div>
        
        <Card className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-3xl hover:shadow-secondary/10 hover:border-secondary/50 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/2 via-secondary/1 to-primary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
          
          <CardHeader className="relative p-8 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-text">
                  Booking Details
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fill in the details to create a new session booking
                </p>
              </div>
              
              <Link href="/bookings">
                <Button variant="outline" className="gap-2 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/50 transition-all duration-200 rounded-xl">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Bookings
                </Button>
              </Link>
            </div>
          </CardHeader>
          
          <CardContent className="relative p-8 pt-0">
            <SessionBookingForm 
              members={members}
              services={activeServices}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
