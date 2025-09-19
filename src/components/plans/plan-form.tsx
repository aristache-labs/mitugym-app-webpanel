"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { createPlanAction, updatePlanAction, type ActionResult } from "@/app/(protected)/actions";
import { planSchema, type PlanInput } from "@/schemas/plans";
import type { MembershipPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PlanFormProps {
  plan?: MembershipPlan | null;
  onCompleted?: () => void;
}

export function PlanForm({ plan, onCompleted }: PlanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<PlanInput>({
    resolver: zodResolver(planSchema),
    defaultValues: plan ?? {
      name: "",
      price: 0,
      duration_days: 30,
      description: "",
      is_active: true,
    },
  });

  const handleResult = (result: ActionResult) => {
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setServerError(null);
    router.refresh();
    onCompleted?.();
  };

  const onSubmit = form.handleSubmit((values) => {
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
          name="duration_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (days)</FormLabel>
              <FormControl>
                <Input type="number" min={1} step="1" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.duration_days?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="What is included?" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.description?.message}</FormMessage>
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
        <Button type="submit" className="w-full" disabled={isPending}>
          {plan ? "Update plan" : "Create plan"}
        </Button>
      </form>
    </Form>
  );
}
