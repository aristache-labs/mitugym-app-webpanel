"use client";

import { useState, useTransition, useEffect } from "react";
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
import { createSessionBookingAction } from "@/app/(protected)/actions";
import { Member, Service, PurchasedService } from "@/types";
import { Calendar, User, Package, Clock, FileText } from "lucide-react";

// Form schema for creating session bookings
const createSessionBookingFormSchema = z.object({
  purchased_service_id: z.string().uuid("Please select a service"),
  member_id: z.string().uuid("Please select a member"),
  booking_date: z.string().min(1, "Booking date is required"),
  status: z.enum(["pending", "confirmed", "upcoming"]).default("pending"),
  notes: z.string().max(1000, "Notes too long").optional(),
});

type CreateSessionBookingFormData = z.infer<typeof createSessionBookingFormSchema>;

interface SessionBookingFormProps {
  members: Member[];
  services: Service[];
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "upcoming", label: "Upcoming" },
];

export function SessionBookingForm({ members, services }: SessionBookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [purchasedServices, setPurchasedServices] = useState<PurchasedService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const form = useForm<CreateSessionBookingFormData>({
    resolver: zodResolver(createSessionBookingFormSchema),
    defaultValues: {
      purchased_service_id: "",
      member_id: "",
      booking_date: "",
      status: "pending",
      notes: "",
    },
  });

  const memberOptions = members.map(member => ({
    value: member.id,
    label: `${member.full_name} (${member.email})`,
  }));

  // Fetch purchased services for the selected member
  const fetchPurchasedServices = async (memberId: string) => {
    if (!memberId) {
      setPurchasedServices([]);
      return;
    }

    setLoadingServices(true);
    try {
      const response = await fetch(`/api/purchased-services?member_id=${memberId}`);
      if (response.ok) {
        const data = await response.json();
        // Filter only approved services with remaining sessions
        const availableServices = data.filter((ps: PurchasedService) => 
          ps.status === 'approved' && ps.sessions_remaining > 0
        );
        setPurchasedServices(availableServices);
      } else {
        setPurchasedServices([]);
      }
    } catch (error) {
      console.error('Failed to fetch purchased services:', error);
      setPurchasedServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  // Watch for member selection changes
  const selectedMemberId = form.watch("member_id");
  useEffect(() => {
    if (selectedMemberId) {
      fetchPurchasedServices(selectedMemberId);
      // Reset service selection when member changes
      form.setValue("purchased_service_id", "");
    } else {
      setPurchasedServices([]);
    }
  }, [selectedMemberId, form]);

  // Create service options from purchased services
  const serviceOptions = purchasedServices.map(purchasedService => {
    const service = purchasedService.service;
    if (!service) return null;
    
    return {
      value: purchasedService.id, // Use purchased service ID, not service ID
      label: `${service.name} - ${service.duration_minutes}min - ${service.price} RON (${purchasedService.sessions_remaining} sessions left)`,
    };
  }).filter(Boolean) as { value: string; label: string }[];


  const onSubmit = (data: CreateSessionBookingFormData) => {
    setError(null);
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append("purchased_service_id", data.purchased_service_id);
      formData.append("member_id", data.member_id);
      formData.append("booking_date", data.booking_date);
      formData.append("status", data.status);
      if (data.notes) {
        formData.append("notes", data.notes);
      }

      const result = await createSessionBookingAction(formData);
      
      if (result.success) {
        addToast({
          type: "success",
          title: "Success",
          description: result.message || "Session booking created successfully",
        });
        router.push("/bookings");
        router.refresh();
      } else {
        // Handle validation errors specifically
        if (result.issues) {
          const validationErrors = Object.entries(result.issues)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          setError(`Validation failed:\n${validationErrors}`);
          addToast({
            type: "error",
            title: "Validation Error",
            description: `Please check the form fields: ${Object.keys(result.issues).join(', ')}`,
          });
        } else {
          setError(result.error || "Failed to create session booking");
          addToast({
            type: "error",
            title: "Error",
            description: result.error || "Failed to create session booking",
          });
        }
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Member Selection */}
        <div className="space-y-2">
          <Label htmlFor="member_id" className="flex items-center gap-2 text-sm font-medium text-text">
            <User className="h-4 w-4 text-primary" />
            Member
          </Label>
          <CustomSelect
            value={form.watch("member_id")}
            onChange={(value) => form.setValue("member_id", value)}
            options={memberOptions}
            placeholder="Select a member..."
            className="w-full"
          />
          {form.formState.errors.member_id && (
            <p className="text-sm text-red-600">{form.formState.errors.member_id.message}</p>
          )}
        </div>

        {/* Service Selection */}
        <div className="space-y-2">
          <Label htmlFor="service_id" className="flex items-center gap-2 text-sm font-medium text-text">
            <Package className="h-4 w-4 text-primary" />
            Service
          </Label>
          <CustomSelect
            value={form.watch("purchased_service_id")}
            onChange={(value) => form.setValue("purchased_service_id", value)}
            options={serviceOptions}
            placeholder={
              !selectedMemberId 
                ? "Select a member first..." 
                : loadingServices 
                  ? "Loading services..." 
                  : serviceOptions.length === 0 
                    ? "No available services" 
                    : "Select a service..."
            }
            disabled={!selectedMemberId || loadingServices || serviceOptions.length === 0}
            className="w-full"
          />
          {!selectedMemberId && (
            <p className="text-sm text-muted-foreground">Please select a member to see their available services</p>
          )}
          {selectedMemberId && !loadingServices && serviceOptions.length === 0 && (
            <p className="text-sm text-orange-600">This member has no approved services with remaining sessions</p>
          )}
          {form.formState.errors.service_id && (
            <p className="text-sm text-red-600">{form.formState.errors.service_id.message}</p>
          )}
        </div>

        {/* Booking Date */}
        <div className="space-y-2">
          <Label htmlFor="booking_date" className="flex items-center gap-2 text-sm font-medium text-text">
            <Calendar className="h-4 w-4 text-primary" />
            Booking Date & Time
          </Label>
          <Input
            id="booking_date"
            type="datetime-local"
            {...form.register("booking_date")}
            className="w-full rounded-xl border-surface/40 bg-card/50 backdrop-blur-sm focus:border-primary/50 focus:ring-primary/20"
            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
          />
          {form.formState.errors.booking_date && (
            <p className="text-sm text-red-600">{form.formState.errors.booking_date.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="flex items-center gap-2 text-sm font-medium text-text">
            <Clock className="h-4 w-4 text-primary" />
            Status
          </Label>
          <CustomSelect
            value={form.watch("status")}
            onChange={(value) => form.setValue("status", value as "pending" | "confirmed" | "upcoming")}
            options={STATUS_OPTIONS}
            placeholder="Select status..."
            className="w-full"
          />
          {form.formState.errors.status && (
            <p className="text-sm text-red-600">{form.formState.errors.status.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-text">
          <FileText className="h-4 w-4 text-primary" />
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          {...form.register("notes")}
          placeholder="Add any additional notes about this booking..."
          className="w-full rounded-xl border-surface/40 bg-card/50 backdrop-blur-sm focus:border-primary/50 focus:ring-primary/20 min-h-[100px]"
          maxLength={1000}
        />
        {form.formState.errors.notes && (
          <p className="text-sm text-red-600">{form.formState.errors.notes.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/bookings")}
          className="gap-2 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/50 transition-all duration-200 rounded-xl"
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl min-w-[140px]"
        >
          {isPending ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creating...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              Create Booking
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
