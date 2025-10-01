"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/ui/custom-select";
import { useToast } from "@/components/ui/toast";
import { updateSessionBookingAction } from "@/app/(protected)/actions";
import { ServiceBooking } from "@/types";

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
            message: "Session booking has been updated successfully.",
          });
          router.push("/bookings");
        } else {
          setError(result.error);
          addToast({
            type: "error",
            title: "Update Failed",
            message: result.error || "Failed to update session booking.",
          });
        }
      } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        const errorMessage = "An unexpected error occurred";
        setError(errorMessage);
        addToast({
          type: "error",
          title: "Update Failed",
          message: errorMessage,
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

          {/* Booking Details Display */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <h4 className="font-medium text-sm mb-3">Booking Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Service:</span>
                <span className="ml-2 font-medium">{booking.service?.name || "Unknown Service"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Member:</span>
                <span className="ml-2 font-medium">{booking.member?.full_name || "Unknown Member"}</span>
              </div>
              {booking.member?.email && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2">{booking.member.email}</span>
                </div>
              )}
              {booking.service?.duration_minutes && (
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2">{booking.service.duration_minutes} minutes</span>
                </div>
              )}
              {booking.service?.price && (
                <div>
                  <span className="text-muted-foreground">Price:</span>
                  <span className="ml-2">{booking.service.price.toFixed(2)} RON</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Date & Time */}
          <div className="space-y-2">
            <Label htmlFor="booking_date">Booking Date & Time *</Label>
            <Input
              id="booking_date"
              type="datetime-local"
              {...form.register("booking_date", { 
                required: "Booking date and time is required" 
              })}
              className={form.formState.errors.booking_date ? "border-destructive" : ""}
            />
            {form.formState.errors.booking_date && (
              <p className="text-sm text-destructive">{form.formState.errors.booking_date.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Select the date and time for the booking
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <CustomSelect
              value={form.watch("status") || ""}
              onChange={(value: string) => form.setValue("status", value as "pending" | "confirmed" | "completed" | "cancelled")}
              options={STATUS_OPTIONS}
              placeholder="Select status"
            />
            {form.formState.errors.status && (
              <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              className={form.formState.errors.notes ? "border-destructive" : ""}
              placeholder="Add any notes about this booking..."
              rows={3}
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive">{form.formState.errors.notes.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional notes about the booking
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/bookings")}
              disabled={isPending}
              className="gap-2 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/50 transition-all duration-200 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 rounded-xl min-w-[140px]"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Updating...
                </>
              ) : (
                "Update Booking"
              )}
            </Button>
          </div>
    </form>
  );
}
