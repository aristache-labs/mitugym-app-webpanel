"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createServiceSchema, updateServiceSchema } from "@/schemas/services";
import { createServiceAction, updateServiceAction } from "@/app/(protected)/actions";
import { AnimatedButton } from "@/components/ui/animated-button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useToast } from "@/components/ui/toast";
import { Service, ServiceType } from "@/types";
import { useRouter } from "next/navigation";
import { Briefcase, DollarSign, Package, Hash, FileText, Clock, ToggleLeft } from "lucide-react";
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
    max_sessions: service.max_sessions || "" as unknown as number,
    is_active: service.is_active,
    display_order: service.display_order || "" as unknown as number,
  } : {
    name: "",
    service_type: "" as ServiceType,
    session_type: "",
    duration_minutes: 60, // Always 60 minutes
    price: "" as unknown as number,
    description: "",
    requires_advance_booking: false,
    advance_booking_hours: "" as unknown as number,
    max_sessions: "" as unknown as number,
    is_active: true,
    display_order: "" as unknown as number,
  };

  const form = useForm<CreateServiceFormData | UpdateServiceFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = async (data: CreateServiceFormData | UpdateServiceFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    
    startTransition(async () => {
      setError(null);
      
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      console.log("FormData prepared:", Array.from(formData.entries()));

      try {
        const result = isEdit 
          ? await updateServiceAction(formData)
          : await createServiceAction(formData);

        console.log("Server result:", result);

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
      } catch (error) {
        console.error("Form submission error:", error);
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

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    addToast({
      type: "error",
      title: "Validation Error",
      description: "Please fill in all required fields correctly.",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-semibold mb-2">Please fix the following errors:</p>
              <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                {Object.entries(form.formState.errors).map(([field, error]: [string, any]) => (
                  <li key={field}>{field}: {error?.message || "Invalid value"}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Row 1: Service Name | Service Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Service Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingLabelInput
                      label="Service name"
                      placeholder="Service name"
                      icon={<Briefcase className="w-full h-full" />}
                      error={form.formState.errors.name?.message}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Type */}
            <FormField
              control={form.control}
              name="service_type"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingLabelSelect
                      value={field.value ?? ""}
                      onChange={(value) => field.onChange(value || "")}
                      label="Service type"
                      icon={<Package className="w-full h-full" />}
                      error={form.formState.errors.service_type?.message}
                      options={[
                        { value: "", label: "Service type", disabled: true },
                        ...SERVICE_TYPE_OPTIONS
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 2: Session Type | Price */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Session Type */}
            <FormField
              control={form.control}
              name="session_type"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingLabelSelect
                      value={field.value ?? ""}
                      onChange={(value) => field.onChange(value || "")}
                      label="Session type (optional)"
                      icon={<Clock className="w-full h-full" />}
                      options={[
                        { value: "", label: "Session type (optional)", disabled: true },
                        ...SESSION_TYPE_OPTIONS
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingLabelInput
                      label="Price (RON)"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Price (RON)"
                      icon={<DollarSign className="w-full h-full" />}
                      error={form.formState.errors.price?.message}
                      value={!field.value && field.value !== 0 ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? "" : parseFloat(value));
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Max Sessions | Display Order */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Max Sessions */}
            <FormField
              control={form.control}
              name="max_sessions"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingLabelInput
                      label="Max sessions"
                      type="number"
                      min={1}
                      step="1"
                      placeholder="Max sessions"
                      icon={<Hash className="w-full h-full" />}
                      error={form.formState.errors.max_sessions?.message}
                      value={!field.value && field.value !== 0 ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? "" : parseInt(value, 10));
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Order */}
            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingLabelInput
                      label="Display order"
                      type="number"
                      min={0}
                      step="1"
                      placeholder="Display order"
                      icon={<Hash className="w-full h-full" />}
                      value={!field.value && field.value !== 0 ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? "" : parseInt(value, 10));
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Duration (hidden, always 60 minutes) */}
          <input type="hidden" {...form.register("duration_minutes")} value={60} />

          {/* Row 4: Description (full width) */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => {
              const hasContent = field.value && field.value.length > 0;
              return (
                <FormItem>
                  <FormControl>
                    <div className="relative pt-1.5">
                      <label 
                        htmlFor="description-textarea"
                        className={`absolute -top-[18px] sm:-top-[18px] left-[5px] text-sm font-normal transition-all duration-200 translate-x-3 ${
                          hasContent ? 'opacity-100 text-text/80' : 'opacity-0'
                        } ${form.formState.errors.description ? 'text-error' : ''}`}
                      >
                        Description
                      </label>
                      <div 
                        className={`absolute -top-[16px] sm:-top-[16px] -left-[12px] w-3.5 h-3.5 transition-all duration-200 translate-x-3 ${
                          hasContent ? 'opacity-100' : 'opacity-0'
                        } ${form.formState.errors.description ? 'text-error' : 'text-primary'}`}
                      >
                        <FileText className="w-full h-full" />
                      </div>
                      <textarea
                        id="description-textarea"
                        rows={3}
                        placeholder="Description"
                        className={`w-full rounded-2xl border-2 ${
                          form.formState.errors.description ? 'border-error' : 'border-surface/50 focus:border-primary'
                        } bg-surface/30 px-4 py-3 text-sm text-text placeholder:text-muted/40 outline-none transition-all duration-200 focus:bg-surface/50 resize-none`}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Row 5: Toggle Switches and Inputs */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-8">
            {/* Requires Advance Booking Section */}
            <div className="flex-1 space-y-6 lg:space-y-8">
              <ToggleSwitch
                id="requires_advance_booking"
                checked={watchRequiresAdvanceBooking ?? false}
                onChange={(checked) => {
                  form.setValue("requires_advance_booking", checked);
                  // Set advance_booking_hours to 0 when toggle is turned off
                  if (!checked) {
                    form.setValue("advance_booking_hours", 0);
                  }
                }}
                label="Requires advance booking"
              />

              {/* Advance Booking Hours (conditionally shown) */}
              {watchRequiresAdvanceBooking && (
                <div className="pt-2">
                  <FormField
                    control={form.control}
                    name="advance_booking_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label="Advance booking hours"
                            type="number"
                            min={0}
                            step="1"
                            placeholder="Advance booking hours"
                            icon={<Clock className="w-full h-full" />}
                            error={form.formState.errors.advance_booking_hours?.message}
                            value={!field.value && field.value !== 0 ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? "" : parseInt(value, 10));
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Service is Active Section */}
            <div className="flex-1">
              <ToggleSwitch
                id="is_active"
                checked={form.watch("is_active") ?? true}
                onChange={(checked) => form.setValue("is_active", checked)}
                label="Service is active"
              />
            </div>
          </div>

          {error ? <p className="text-xs sm:text-sm text-error">{error}</p> : null}
          
          {/* Form Actions */}
          <div className="flex justify-end pt-2 sm:pt-0">
            <AnimatedButton
              type="submit" 
              disabled={isPending} 
              className="h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-slate-200 hover:text-white border-0 !ring-0 !outline-none transition-all duration-500 ease-out shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 backdrop-blur-sm font-medium"
            >
              {isPending ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Service" : "Create Service")}
            </AnimatedButton>
          </div>
      </form>
    </Form>
  );
}
