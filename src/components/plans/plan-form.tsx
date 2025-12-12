"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createPlanAction, updatePlanAction, type ActionResult } from "@/app/(protected)/actions";
import { planSchema, type PlanInput } from "@/schemas/plans";
import type { MembershipPlan } from "@/types";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useToast } from "@/components/ui/toast";
import { Package, DollarSign, Calendar, ListChecks, ToggleLeft } from "lucide-react";

interface PlanFormProps {
  plan?: MembershipPlan | null;
  existingPlans?: MembershipPlan[];
  onCompleted?: () => void;
}

export function PlanForm({ plan, existingPlans = [], onCompleted }: PlanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { addToast } = useToast();

  const form = useForm<PlanInput>({
    resolver: zodResolver(planSchema),
    defaultValues: plan ?? {
      name: "",
      plan_type: "full",
      price: 0,
      duration_months: 0,
      features: [],
      is_active: true,
    },
  });

  // Reset form when plan changes
  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        plan_type: plan.plan_type,
        price: plan.price,
        duration_months: plan.duration_months,
        features: plan.features || [],
        is_active: plan.is_active,
      });
    } else {
      form.reset({
        name: "",
        plan_type: "full",
        price: 0,
        duration_months: 0,
        features: [],
        is_active: true,
      });
    }
  }, [plan, form]);

  const handleResult = (result: ActionResult) => {
    if (!result.success) {
      setServerError(result.error);
      addToast({
        type: "error",
        title: plan ? "Failed to Update Plan" : "Failed to Create Plan",
        description: result.error || "An unexpected error occurred. Please try again.",
      });
      return;
    }
    
    setServerError(null);
    
    // Show success toast
    addToast({
      type: "success",
      title: plan ? "Plan Updated Successfully" : "Plan Created Successfully",
      description: plan 
        ? `${plan.name} has been updated with the new information.`
        : "The new membership plan has been created and is now available.",
    });
    
    // Navigate back to plans page after successful creation/update
    if (plan) {
      // If editing, stay on the same page but refresh
      router.refresh();
    } else {
      // If creating, navigate back to plans page
      router.push("/plans");
    }
    onCompleted?.();
  };

  const validateUniqueness = (values: PlanInput): string | null => {
    // Business rule: Full membership and student plans cannot have 0 duration (day pass)
    if ((values.plan_type === 'full' || values.plan_type === 'student') && values.duration_months === 0) {
      const typeText = values.plan_type === 'full' ? 'Full Membership' : 'Student Discount';
      return `${typeText} plans cannot have 0 duration. Use "Day Entry" plan type for day passes.`;
    }

    // Business rule: Day entry plans should have 0 duration
    if (values.plan_type === 'day_entry' && values.duration_months !== 0) {
      return `Day Entry plans must have 0 duration (representing a single day pass).`;
    }

    // Check for day_entry uniqueness (only one day_entry plan allowed regardless of duration)
    if (values.plan_type === 'day_entry') {
      const existingDayEntry = existingPlans.find(p => 
        p.plan_type === 'day_entry' && 
        p.id !== plan?.id // Exclude current plan if editing
      );
      if (existingDayEntry) {
        return `A day entry plan already exists: "${existingDayEntry.name}". Only one day entry plan is allowed.`;
      }
    }

    // For non-day_entry plans, check for plan_type + duration_months uniqueness
    if (values.plan_type !== 'day_entry') {
      const existingCombo = existingPlans.find(p => 
        p.plan_type === values.plan_type && 
        p.duration_months === values.duration_months &&
        p.id !== plan?.id // Exclude current plan if editing
      );
      
      if (existingCombo) {
        const durationText = values.duration_months === 1 ? '1 month' : `${values.duration_months} months`;
        const typeText = values.plan_type === 'full' ? 'Full Membership' : 'Student Discount';
        return `A ${typeText} plan for ${durationText} already exists: "${existingCombo.name}".`;
      }
    }

    return null;
  };

  const onSubmit = form.handleSubmit((values) => {
    // Validate uniqueness constraints
    const validationError = validateUniqueness(values);
    if (validationError) {
      setServerError(validationError);
      addToast({
        type: "error",
        title: "Plan Already Exists",
        description: validationError,
      });
      return;
    }

    startTransition(async () => {
      const action = plan ? updatePlanAction : createPlanAction;
      const payload = plan ? { ...values, id: plan.id } : values;
      const result = await action(payload);
      handleResult(result);
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label="Name"
                  placeholder="Unlimited"
                  icon={<Package className="w-full h-full" />}
                  error={form.formState.errors.name?.message}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="plan_type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelSelect
                  label="Plan Type"
                  icon={<Package className="w-full h-full" />}
                  error={form.formState.errors.plan_type?.message}
                  options={[
                    { value: 'day_entry', label: 'Day Entry' },
                    { value: 'full', label: 'Full Membership' },
                    { value: 'student', label: 'Student Discount' }
                  ]}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label="Price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  icon={<DollarSign className="w-full h-full" />}
                  error={form.formState.errors.price?.message}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-3 sm:mt-0">
          <FormField
            control={form.control}
            name="duration_months"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label="Duration (0 = 1 DAY, 1+ = MONTHS)"
                    type="number"
                    min={0}
                    step="1"
                    placeholder="0"
                    icon={<Calendar className="w-full h-full" />}
                    error={form.formState.errors.duration_months?.message}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-3 sm:mt-0">
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative pt-1.5">
                    <label 
                      htmlFor="features-textarea"
                      className={`absolute -top-[18px] sm:-top-[25px] left-[5px] text-sm font-normal text-text/80 transition-all duration-200 translate-x-3 opacity-100 ${
                        form.formState.errors.features ? 'text-error' : ''
                      }`}
                    >
                      Features
                    </label>
                    <div 
                      className={`absolute -top-[16px] sm:-top-[22px] -left-[12px] w-3.5 h-3.5 transition-all duration-200 translate-x-3 opacity-100 ${
                        form.formState.errors.features ? 'text-error' : 'text-primary'
                      }`}
                    >
                      <ListChecks className="w-full h-full" />
                    </div>
                    <textarea
                      id="features-textarea"
                      rows={5}
                      placeholder="Enter features, one per line • Access to gym equipment • Personal training sessions • Group fitness classes"
                      className={`w-full rounded-2xl border-2 ${
                        form.formState.errors.features ? 'border-error' : 'border-surface/50 focus:border-primary'
                      } bg-surface/30 px-4 py-3 text-sm text-text placeholder:text-muted/40 outline-none transition-all duration-200 focus:bg-surface/50 resize-none`}
                      value={field.value?.join('\n') || ''}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n');
                        field.onChange(lines);
                      }}
                      onBlur={() => {
                        if (field.value) {
                          const filteredLines = field.value.filter((line: string) => line.trim() !== '');
                          field.onChange(filteredLines);
                        }
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-3 sm:mt-0">
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelSelect
                    label="Status"
                    icon={<ToggleLeft className="w-full h-full" />}
                    error={form.formState.errors.is_active?.message}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' }
                    ]}
                    value={field.value ? "active" : "inactive"}
                    onChange={(value) => field.onChange(value === "active")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {serverError ? <p className="text-xs sm:text-sm text-error">{serverError}</p> : null}
        
        <div className="flex justify-end pt-2 sm:pt-0">
          <AnimatedButton
            type="submit" 
            disabled={isPending}
            className="h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-slate-200 hover:text-white border-0 !ring-0 !outline-none transition-all duration-500 ease-out shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 backdrop-blur-sm font-medium"
          >
            {isPending ? "Saving..." : plan ? "Update Plan" : "Create Plan"}
          </AnimatedButton>
        </div>
      </form>
    </Form>
  );
}
