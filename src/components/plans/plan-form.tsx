"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createPlanAction, updatePlanAction, type ActionResult } from "@/app/(protected)/actions";
import { planSchema, type PlanInput, planTypeEnum } from "@/schemas/plans";
import type { MembershipPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

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
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Unlimited" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.name?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plan_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Type</FormLabel>
              <FormControl>
                <select
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  className="rounded-[16px] border border-surface/50 bg-surface px-4 py-2 text-sm w-full"
                >
                  {planTypeEnum.options.map((type) => {
                    const labels = {
                      'day_entry': 'Day Entry',
                      'full': 'Full Membership',
                      'student': 'Student Discount'
                    };
                    return (
                      <option key={type} value={type} className="bg-surface text-text">
                        {labels[type as keyof typeof labels]}
                      </option>
                    );
                  })}
                </select>
              </FormControl>
              <FormMessage>{form.formState.errors.plan_type?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.price?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration_months"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (0 = 1 day, 1+ = months)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="1" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.duration_months?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features</FormLabel>
              <FormControl>
                <Textarea 
                  rows={5} 
                  placeholder="Enter features, one per line&#10;• Access to gym equipment&#10;• Personal training sessions&#10;• Group fitness classes" 
                  value={field.value?.join('\n') || ''}
                  onChange={(e) => {
                    // Split by newlines but don't filter empty lines during typing
                    const lines = e.target.value.split('\n');
                    field.onChange(lines);
                  }}
                  onBlur={() => {
                    // Only filter out empty lines when user finishes editing
                    if (field.value) {
                      const filteredLines = field.value.filter((line: string) => line.trim() !== '');
                      field.onChange(filteredLines);
                    }
                  }}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.features?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  value={field.value ? "active" : "inactive"}
                  onChange={(event) => field.onChange(event.target.value === "active")}
                  className="rounded-[16px] border border-surface/50 bg-surface px-4 py-2 text-sm"
                >
                  <option value="active" className="bg-surface text-text">
                    Active
                  </option>
                  <option value="inactive" className="bg-surface text-text">
                    Inactive
                  </option>
                </select>
              </FormControl>
              <FormMessage>{form.formState.errors.is_active?.message}</FormMessage>
            </FormItem>
          )}
        />
        {serverError ? <p className="text-sm text-error">{serverError}</p> : null}
        <div className="flex justify-end">
          <Button type="submit" className="px-8" disabled={isPending}>
            {plan ? "Update Plan" : "Create Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
