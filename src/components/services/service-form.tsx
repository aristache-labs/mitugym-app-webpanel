"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createServiceSchema, updateServiceSchema } from "@/schemas/services";
import { createServiceAction, updateServiceAction } from "@/app/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/ui/custom-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Service, ServiceType } from "@/types";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import type { z } from "zod";

type CreateServiceFormData = z.infer<typeof createServiceSchema>;
type UpdateServiceFormData = z.infer<typeof updateServiceSchema>;

interface ServiceFormProps {
  service?: Service;
  mode: "create" | "edit";
}

const SERVICE_TYPE_OPTIONS = [
  { value: "personal_trainer", label: "Personal Training" },
  { value: "professional_massage", label: "Professional Massage" },
];

const SESSION_TYPE_OPTIONS = [
  { value: "1_session", label: "1 Session Package" },
  { value: "8_sessions", label: "8 Sessions Package" },
  { value: "12_sessions", label: "12 Sessions Package" },
  { value: "16_sessions", label: "16 Sessions Package" },
  { value: "18_sessions", label: "18 Sessions Package" },
];

export function ServiceForm({ service, mode }: ServiceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const router = useRouter();

  const isEdit = mode === "edit";
  const schema = isEdit ? updateServiceSchema : createServiceSchema;

  const defaultValues = isEdit && service ? {
    id: service.id,
    name: service.name,
    service_type: service.service_type as ServiceType,
    session_type: service.session_type || "",
    duration_minutes: 60, // Always 60 minutes
    price: service.price,
    description: service.description || "",
    requires_advance_booking: service.requires_advance_booking,
    advance_booking_hours: service.advance_booking_hours,
    max_sessions: service.max_sessions || 1,
    is_active: service.is_active,
    display_order: service.display_order,
  } : {
    name: "",
    service_type: "personal_trainer" as ServiceType,
    session_type: "",
    duration_minutes: 60, // Always 60 minutes
    price: 0,
    description: "",
    requires_advance_booking: false,
    advance_booking_hours: 0,
    max_sessions: 1,
    is_active: true,
    display_order: 0,
  };

  const form = useForm<CreateServiceFormData | UpdateServiceFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = async (data: CreateServiceFormData | UpdateServiceFormData) => {
    startTransition(async () => {
      setError(null);
      
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      try {
        const result = isEdit 
          ? await updateServiceAction(formData)
          : await createServiceAction(formData);

        if (result.success) {
          addToast({
            type: "success",
            title: isEdit ? "Service Updated Successfully" : "Service Created Successfully",
            description: isEdit 
              ? `${service?.name} has been updated with the new information.`
              : "The new service has been created and is now available.",
          });
          router.push("/services");
        } else {
          setError(result.error);
          addToast({
            type: "error",
            title: isEdit ? "Failed to Update Service" : "Failed to Create Service",
            description: result.error || "An unexpected error occurred. Please try again.",
          });
        }
      } catch {
        setError("An unexpected error occurred");
        addToast({
          type: "error",
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    });
  };

  const watchRequiresAdvanceBooking = form.watch("requires_advance_booking");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="e.g., Personal Training Session"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type *</Label>
            <CustomSelect
              value={form.watch("service_type")}
              onChange={(value: string) => form.setValue("service_type", value as ServiceType)}
              options={SERVICE_TYPE_OPTIONS}
              placeholder="Select service type"
            />
            {form.formState.errors.service_type && (
              <p className="text-sm text-destructive">{form.formState.errors.service_type.message}</p>
            )}
          </div>

          {/* Session Type */}
          <div className="space-y-2">
            <Label htmlFor="session_type">Session Type</Label>
            <CustomSelect
              value={form.watch("session_type") || ""}
              onChange={(value: string) => form.setValue("session_type", value)}
              options={SESSION_TYPE_OPTIONS}
              placeholder="Select session type (optional)"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (RON) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              {...form.register("price", { valueAsNumber: true })}
            />
            {form.formState.errors.price && (
              <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
            )}
          </div>

          {/* Duration (hidden, always 60 minutes) */}
          <input type="hidden" {...form.register("duration_minutes")} value={60} />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe the service..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Max Sessions */}
            <div className="space-y-2">
              <Label htmlFor="max_sessions">Max Sessions</Label>
              <Input
                id="max_sessions"
                type="number"
                min="1"
                {...form.register("max_sessions", { valueAsNumber: true })}
              />
              {form.formState.errors.max_sessions && (
                <p className="text-sm text-destructive">{form.formState.errors.max_sessions.message}</p>
              )}
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                {...form.register("display_order", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Advance Booking */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  id="requires_advance_booking"
                  type="checkbox"
                  {...form.register("requires_advance_booking")}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-surface/50 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all duration-200 flex items-center justify-center">
                  <svg 
                    className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <Label htmlFor="requires_advance_booking" className="cursor-pointer">Requires advance booking</Label>
            </div>

            {watchRequiresAdvanceBooking && (
              <div className="space-y-2">
                <Label htmlFor="advance_booking_hours">Advance booking hours required</Label>
                <Input
                  id="advance_booking_hours"
                  type="number"
                  min="0"
                  {...form.register("advance_booking_hours", { valueAsNumber: true })}
                />
                {form.formState.errors.advance_booking_hours && (
                  <p className="text-sm text-destructive">{form.formState.errors.advance_booking_hours.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                id="is_active"
                type="checkbox"
                {...form.register("is_active")}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-surface/50 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all duration-200 flex items-center justify-center">
                <svg 
                  className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <Label htmlFor="is_active" className="cursor-pointer">Service is active</Label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/services")}
              disabled={isPending}
              className="px-6 hover:bg-surface/50 transition-all duration-200 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending} 
              className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-8"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4" />
                  {isEdit ? "Update Service" : "Create Service"}
                </>
              )}
            </Button>
          </div>
    </form>
  );
}
