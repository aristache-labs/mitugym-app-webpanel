"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useToast } from "@/components/ui/toast";
import { updateSessionBookingAction } from "@/app/(protected)/actions";
import { ServiceBooking } from "@/types";
import { Calendar, Clock, FileText, Briefcase, User, Mail, Timer, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

// Form schema for updating session bookings
const updateSessionBookingFormSchema = z.object({
  id: z.string().uuid(),
  booking_date: z.string().min(1, "Booking date is required"),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
});

type UpdateSessionBookingFormData = z.infer<typeof updateSessionBookingFormSchema>;

interface SessionBookingEditFormProps {
  booking: ServiceBooking;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function SessionBookingEditForm({ booking }: SessionBookingEditFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addToast } = useToast();

  const form = useForm<UpdateSessionBookingFormData>({
    resolver: zodResolver(updateSessionBookingFormSchema),
    defaultValues: {
      id: booking.id,
      booking_date: booking.booking_date ? format(new Date(booking.booking_date), "yyyy-MM-dd'T'HH:mm") : "",
      status: booking.status === "upcoming" ? "confirmed" : booking.status,
      notes: booking.notes || "",
    },
  });

  const onSubmit = async (data: UpdateSessionBookingFormData) => {
    startTransition(async () => {
      setError(null);
      
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert booking_date to ISO string for database
          if (key === "booking_date" && value) {
            const isoDate = new Date(value as string).toISOString();
            formData.append(key, isoDate);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      try {
        const result = await updateSessionBookingAction(formData);

        if (result.success) {
          addToast({
            type: "success",
            title: "Booking Updated",
            description: "Session booking has been updated successfully.",
          });
          router.push("/bookings");
        } else {
          setError(result.error);
          addToast({
            type: "error",
            title: "Update Failed",
            description: result.error || "Failed to update session booking.",
          });
        }
      } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        const errorMessage = "An unexpected error occurred";
        setError(errorMessage);
        addToast({
          type: "error",
          title: "Update Failed",
          description: errorMessage,
        });
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Hidden ID field */}
          <input type="hidden" {...form.register("id")} value={booking.id} />

          {/* Booking Details Card */}
          <div className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl">
            {/* Card Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            
            {/* Header */}
            <div className="relative p-4 sm:p-5 pb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">
                    Booking Details
                  </h4>
                  <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Current booking information</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="relative p-4 sm:p-5 pt-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
                
                {/* Service Details Group */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                    <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                      <Briefcase className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Service Details</h3>
                  </div>
                  
                  {/* Service Info Cards */}
                  <div className="space-y-2">
                    {/* Service Name */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                      <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                        <Briefcase className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Service Name</p>
                        <p className="text-xs text-text font-semibold truncate">{booking.service?.name || "Unknown Service"}</p>
                      </div>
                    </div>
                    
                    {/* Duration & Price Row */}
                    <div className="grid grid-cols-2 gap-2">
                      {booking.service?.duration_minutes && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Timer className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Duration</p>
                            <p className="text-xs text-text font-semibold">{booking.service.duration_minutes} min</p>
                          </div>
                        </div>
                      )}
                      
                      {booking.service?.price && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Banknote className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Price</p>
                            <p className="text-xs text-text font-semibold">{booking.service.price.toFixed(2)} RON</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Member Details Group */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                    <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Member Details</h3>
                  </div>
                  
                  {/* Member Info Cards */}
                  <div className="space-y-2">
                    {/* Member Name */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                      <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Member Name</p>
                        <p className="text-xs text-text font-semibold truncate">{booking.member?.full_name || "Unknown Member"}</p>
                      </div>
                    </div>
                    
                    {/* Email */}
                    {booking.member?.email && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                        <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                          <Mail className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Email Address</p>
                          <p className="text-xs text-text font-semibold truncate">{booking.member.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Booking Date & Time */}
          <div className="mb-3 sm:mb-0 mt-8 sm:mt-10">
            <FloatingLabelInput
              id="booking_date"
              label="Booking Date & Time"
              icon={<Calendar className="h-4 w-4" />}
              type="datetime-local"
              value={form.watch("booking_date")}
              onChange={(e) => form.setValue("booking_date", e.target.value)}
              error={form.formState.errors.booking_date?.message}
            />
          </div>

          {/* Status */}
          <div className="mb-3 sm:mb-0 mt-8 sm:mt-10">
            <FloatingLabelSelect
              label="Status"
              icon={<Clock className="h-4 w-4" />}
              value={form.watch("status") || ""}
              onChange={(value) => form.setValue("status", value as "pending" | "confirmed" | "completed" | "cancelled")}
              options={STATUS_OPTIONS}
              error={form.formState.errors.status?.message}
            />
          </div>

          {/* Notes */}
          <div className="relative flex flex-col pt-1.5 sm:pt-0 mb-3 sm:mb-0 mt-8">
            <textarea
              id="notes"
              value={form.watch("notes") || ""}
              onChange={(e) => form.setValue("notes", e.target.value)}
              placeholder="Notes (Optional)"
              className={cn(
                "peer w-full min-h-[80px] sm:min-h-[100px] px-4 py-3 text-sm font-medium outline-none rounded-[16px] bg-surface text-text caret-primary transition resize-none",
                "border border-surface/50 shadow-[0_0_0_1px_rgba(77,212,212,0.08)]",
                "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                "focus:border-primary focus:ring-2 focus:ring-primary/40",
                form.formState.errors.notes && "border-error focus:border-error focus-visible:border-error focus:ring-error/40"
              )}
              maxLength={1000}
              rows={4}
            />
            <label
              htmlFor="notes"
              className={cn(
                "absolute -top-[18px] sm:-top-[25px] left-[10px] text-sm font-normal text-text/80 opacity-0 overflow-hidden transition-all duration-200 pointer-events-none flex items-center gap-1.5",
                "peer-focus:translate-x-0 peer-focus:opacity-100",
                form.watch("notes") && "translate-x-0 opacity-100",
                form.formState.errors.notes && "text-error"
              )}
            >
              <div
                className={cn(
                  "w-3.5 h-3.5 flex items-center justify-center",
                  form.formState.errors.notes ? "text-error" : "text-primary"
                )}
              >
                <FileText className="h-3.5 w-3.5" />
              </div>
              <span>Notes (Optional)</span>
            </label>
            {form.formState.errors.notes && (
              <p className="text-xs text-error mt-1 ml-1">{form.formState.errors.notes.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-6 sm:pt-6 mt-4 sm:mt-0">
            <AnimatedButton
              type="submit"
              disabled={isPending}
              className="h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-slate-200 hover:text-white border-0 !ring-0 !outline-none transition-all duration-500 ease-out shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 backdrop-blur-sm font-medium"
            >
              {isPending ? "Updating..." : "Update Booking"}
            </AnimatedButton>
          </div>
    </form>
  );
}
