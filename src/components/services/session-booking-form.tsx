"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { FloatingLabelDateInput } from "@/components/ui/floating-label-date-input";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useToast } from "@/components/ui/toast";
import { createSessionBookingAction } from "@/app/(protected)/actions";
import { Member, Service, PurchasedService } from "@/types";
import { Calendar, User, Package, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Form schema for creating session bookings
const createSessionBookingFormSchema = z.object({
  purchased_service_id: z.string().uuid("Please select a service"),
  member_id: z.string().uuid("Please select a member"),
  booking_date: z.string().min(1, "Booking date is required"),
  status: z.enum(["pending", "confirmed"]).default("pending"),
  notes: z.string().max(1000, "Notes too long").optional(),
});

type CreateSessionBookingFormData = z.infer<typeof createSessionBookingFormSchema>;

interface SessionBookingFormProps {
  members: Member[];
  services: Service[];
}

const STATUS_OPTIONS = [
  { value: "", label: "Status", disabled: true },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
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
      status: "" as "pending" | "confirmed",
      notes: "",
    },
  });

  const memberOptions = [
    { value: "", label: "Member", disabled: true },
    ...members.map(member => ({
      value: member.id,
      label: `${member.full_name} (${member.email})`,
    }))
  ];

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
  const serviceOptions = [
    { value: "", label: "Service", disabled: true },
    ...purchasedServices.map(purchasedService => {
      const service = purchasedService.service;
      if (!service) return null;
      
      return {
        value: purchasedService.id, // Use purchased service ID, not service ID
        label: `${service.name} - ${service.duration_minutes}min - ${service.price} RON (${purchasedService.sessions_remaining} sessions left)`,
      };
    }).filter(Boolean) as { value: string; label: string }[]
  ];


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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      {error && (
        <div className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Member Selection */}
        <div className="mb-3 sm:mb-0">
          <FloatingLabelSelect
            label="Member"
            icon={<User className="h-4 w-4" />}
            value={form.watch("member_id")}
            onChange={(value) => form.setValue("member_id", value)}
            options={memberOptions}
            error={form.formState.errors.member_id?.message}
          />
        </div>

        {/* Service Selection */}
        <div className="space-y-1 mb-3 sm:mb-0">
          <FloatingLabelSelect
            label="Service"
            icon={<Package className="h-4 w-4" />}
            value={form.watch("purchased_service_id")}
            onChange={(value) => form.setValue("purchased_service_id", value)}
            options={serviceOptions}
            disabled={!selectedMemberId || loadingServices || serviceOptions.length === 0}
            error={form.formState.errors.purchased_service_id?.message}
          />
          {!selectedMemberId && (
            <p className="text-xs text-muted/70 mt-1">Please select a member to see their available services</p>
          )}
          {selectedMemberId && !loadingServices && serviceOptions.length === 0 && (
            <p className="text-xs text-orange-600 mt-1">This member has no approved services with remaining sessions</p>
          )}
        </div>

        {/* Booking Date */}
        <div className="mb-3 sm:mb-0 mt-6">
          <FloatingLabelInput
            id="booking_date"
            label="Booking Date & Time"
            icon={<Calendar className="h-4 w-4" />}
            type="datetime-local"
            value={form.watch("booking_date")}
            onChange={(e) => form.setValue("booking_date", e.target.value)}
            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            error={form.formState.errors.booking_date?.message}
          />
        </div>

        {/* Status */}
        <div className="mb-3 sm:mb-0 mt-6">
          <FloatingLabelSelect
            label="Status"
            icon={<Clock className="h-4 w-4" />}
            value={form.watch("status")}
            onChange={(value) => form.setValue("status", value as "pending" | "confirmed")}
            options={STATUS_OPTIONS}
            error={form.formState.errors.status?.message}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="relative flex flex-col pt-1.5 sm:pt-0 mb-3 sm:mb-0 mt-6">
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
            "absolute -top-[18px] sm:-top-[25px] left-[5px] text-sm font-normal text-text/80 opacity-0 overflow-hidden transition-all duration-200 pointer-events-none flex items-center gap-1.5",
            "peer-focus:translate-x-3 peer-focus:opacity-100",
            form.watch("notes") && "translate-x-3 opacity-100",
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
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-4 pt-4 sm:pt-6">
        <AnimatedButton
          type="button"
          variant="outline"
          onClick={() => router.push("/bookings")}
          disabled={isPending}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl"
        >
          Cancel
        </AnimatedButton>
        <AnimatedButton
          type="submit"
          variant="default"
          disabled={isPending}
          className="w-full sm:w-auto min-w-[140px] px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl"
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Creating...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Create Booking</span>
            </div>
          )}
        </AnimatedButton>
      </div>
    </form>
  );
}
