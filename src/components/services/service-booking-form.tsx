"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createServiceBookingSchema, updateServiceBookingSchema } from "@/schemas/services";
import { createServiceBookingAction, updateServiceBookingAction } from "@/app/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/ui/custom-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Service, ServiceBooking, Member } from "@/types";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { z } from "zod";

type CreateServiceBookingFormData = z.infer<typeof createServiceBookingSchema>;
type UpdateServiceBookingFormData = z.infer<typeof updateServiceBookingSchema>;

interface ServiceBookingFormProps {
  booking?: ServiceBooking;
  services: Service[];
  members: Member[];
  mode: "create" | "edit";
}

const BOOKING_STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function ServiceBookingForm({ booking, services, members, mode }: ServiceBookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isEdit = mode === "edit";
  const schema = isEdit ? updateServiceBookingSchema : createServiceBookingSchema;

  // Filter active services
  const activeServices = services.filter(service => service.is_active);
  const serviceOptions = activeServices.map(service => ({
    value: service.id,
    label: `${service.name} (${service.price.toFixed(2)} RON)`
  }));

  // Filter active members
  const activeMembers = members.filter(member => member.status === "active");
  const memberOptions = activeMembers.map(member => ({
    value: member.id,
    label: `${member.full_name} (${member.email})`
  }));

  const defaultValues = isEdit && booking ? {
    id: booking.id,
    service_id: booking.service_id || "",
    member_id: booking.member_id || "",
    booking_date: booking.booking_date ? format(new Date(booking.booking_date), "yyyy-MM-dd'T'HH:mm") : "",
    status: booking.status,
    sessions_remaining: booking.sessions_remaining || undefined,
    notes: booking.notes || "",
  } : {
    service_id: "",
    member_id: "",
    booking_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    status: "upcoming" as const,
    sessions_remaining: undefined,
    notes: "",
  };

  const form = useForm<CreateServiceBookingFormData | UpdateServiceBookingFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const selectedServiceId = form.watch("service_id");
  const selectedService = activeServices.find(s => s.id === selectedServiceId);

  const onSubmit = async (data: CreateServiceBookingFormData | UpdateServiceBookingFormData) => {
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
        const result = isEdit 
          ? await updateServiceBookingAction(formData)
          : await createServiceBookingAction(formData);

        if (result.success) {
          router.push("/services");
        } else {
          setError(result.error);
        }
      } catch (error) {
        setError("An unexpected error occurred");
      }
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEdit ? "Edit Service Booking" : "Create New Service Booking"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Hidden ID field for edit mode */}
          {isEdit && booking && (
            <input type="hidden" {...form.register("id")} value={booking.id} />
          )}

          {/* Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="service_id">Service *</Label>
            <CustomSelect
              value={form.watch("service_id")}
              onChange={(value: string) => {
                form.setValue("service_id", value);
                // Reset sessions remaining when service changes
                const service = activeServices.find(s => s.id === value);
                if (service?.max_sessions) {
                  form.setValue("sessions_remaining", service.max_sessions);
                }
              }}
              options={serviceOptions}
              placeholder="Select a service"
            />
            {form.formState.errors.service_id && (
              <p className="text-sm text-destructive">{form.formState.errors.service_id.message}</p>
            )}
          </div>

          {/* Member Selection */}
          <div className="space-y-2">
            <Label htmlFor="member_id">Member *</Label>
            <CustomSelect
              value={form.watch("member_id")}
              onChange={(value: string) => form.setValue("member_id", value)}
              options={memberOptions}
              placeholder="Select a member"
            />
            {form.formState.errors.member_id && (
              <p className="text-sm text-destructive">{form.formState.errors.member_id.message}</p>
            )}
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
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            />
            {form.formState.errors.booking_date && (
              <p className="text-sm text-destructive">{form.formState.errors.booking_date.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Select a future date and time for the booking
            </p>
          </div>

          {/* Service Info Display */}
          {selectedService && (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Service Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2">1 hour</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Price:</span>
                  <span className="ml-2">{selectedService.price.toFixed(2)} RON</span>
                </div>
                {selectedService.max_sessions && selectedService.max_sessions > 1 && (
                  <div>
                    <span className="text-muted-foreground">Package:</span>
                    <span className="ml-2">{selectedService.max_sessions} sessions</span>
                  </div>
                )}
                {selectedService.requires_advance_booking && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">⚠️ Requires {selectedService.advance_booking_hours}h advance booking</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <CustomSelect
                value={form.watch("status")}
                onChange={(value: string) => form.setValue("status", value as any)}
                options={BOOKING_STATUS_OPTIONS}
                placeholder="Select status"
              />
            </div>

            {/* Sessions Remaining */}
            {selectedService?.max_sessions && selectedService.max_sessions > 1 && (
              <div className="space-y-2">
                <Label htmlFor="sessions_remaining">Sessions Remaining</Label>
                <Input
                  id="sessions_remaining"
                  type="number"
                  min="0"
                  max={selectedService.max_sessions}
                  {...form.register("sessions_remaining", { valueAsNumber: true })}
                />
                {form.formState.errors.sessions_remaining && (
                  <p className="text-sm text-destructive">{form.formState.errors.sessions_remaining.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional notes for this booking..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/services")}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
            >
              {isPending 
                ? (isEdit ? "Updating..." : "Creating...") 
                : (isEdit ? "Update Booking" : "Create Booking")
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
