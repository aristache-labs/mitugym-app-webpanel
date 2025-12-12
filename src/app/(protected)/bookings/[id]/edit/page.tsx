import { notFound } from "next/navigation";
import { fetchSessionBookings } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { SessionBookingEditForm } from "@/components/services/session-booking-edit-form";

interface EditSessionBookingPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Session Booking",
};

// Disable caching to ensure fresh data
export const revalidate = 0;

export default async function EditSessionBookingPage({ params }: EditSessionBookingPageProps) {
  const { id } = await params;

  const bookings = await fetchSessionBookings();
  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Premium Form Container */}
      <div className="relative">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl sm:rounded-3xl blur-2xl"></div>
        
        {/* Form Card */}
        <Card className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
          
          {/* Gradient Border */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl">
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" 
                 style={{ 
                   mask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                   maskComposite: 'exclude',
                   WebkitMask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                   WebkitMaskComposite: 'xor',
                   padding: '1px'
                 }}>
            </div>
          </div>
          
          <CardHeader className="relative p-3 sm:p-6 md:p-8 pb-2 sm:pb-4 md:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-4 w-full sm:w-auto">
                <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base sm:text-xl font-semibold text-text group-hover:text-primary transition-colors">
                      Edit Booking Details
                  </CardTitle>
                    {/* Back button on mobile - right side */}
                    <Link 
                      href="/bookings"
                      className="sm:hidden group/link relative h-7 px-3 flex items-center justify-center gap-1.5 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs rounded-xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 !no-underline flex-shrink-0"
                    >
                      {/* Arrow Icon */}
                      <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/link:scale-125 group-hover/link:translate-x-[1em]">
                        <ArrowLeft className="h-3 w-3 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/link:text-cyan-100 group-hover/link:scale-110" />
                      </div>
                      
                      {/* Text */}
                      <span className="transition-all duration-500 ease-in-out group-hover/link:opacity-0">
                        Back
                      </span>
                    </Link>
                  </div>
                  <p className="text-[10px] sm:text-sm text-muted/70 mt-0.5 sm:mt-1 pr-1">Modify booking information and settings</p>
                </div>
              </div>
              {/* Back button on desktop - separate */}
              <Link 
                href="/bookings"
                className="hidden sm:flex group/link relative h-8 sm:h-9 w-full sm:w-auto px-3 sm:px-4 md:px-6 items-center justify-center gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 !no-underline"
              >
                {/* Arrow Icon */}
                <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/link:scale-125 group-hover/link:translate-x-[1.3em]">
                  <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/link:text-cyan-100 group-hover/link:scale-110" />
                </div>
                
                {/* Text */}
                <span className="transition-all duration-500 ease-in-out group-hover/link:opacity-0">
                  Back
                </span>
              </Link>
            </div>
          </CardHeader>
            
          <CardContent className="relative p-4 sm:p-6 md:p-8 pt-0">
            <SessionBookingEditForm booking={booking} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
