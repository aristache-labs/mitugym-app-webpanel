"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  createMemberSchema,
  memberStatusEnum,
  memberGenderEnum,
  type CreateMemberInput,
  type UpdateMemberInput,
  updateMemberSchema,
} from "@/schemas/members";
import { createMemberAction, updateMemberAction, type ActionResult } from "@/app/(protected)/actions";
import type { Member, MembershipPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { useToast } from "@/components/ui/toast";
import { cn, calculateExpirationDate, calculateMemberStatus } from "@/lib/utils";

interface MemberFormProps {
  plans: MembershipPlan[];
  member?: Member;
}

type FormValues = CreateMemberInput | UpdateMemberInput;

export function MemberForm({ plans, member }: MemberFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { addToast } = useToast();
  const schema = member ? updateMemberSchema : createMemberSchema;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: member
      ? {
          id: member.id,
          first_name: member.full_name?.split(' ')[0] || '',
          last_name: member.full_name?.split(' ').slice(1).join(' ') || '',
          email: member.email,
          phone: member.phone ?? "",
          status: member.status,
          plan_id: member.plan_id ?? "",
          starts_at: member.starts_at ? member.starts_at.split("T")[0] : "",
        }
      : {
          first_name: "",
          last_name: "",
          gender: null,
          email: "",
          phone: "",
          status: "active",
          plan_id: null,
          starts_at: "",
          expires_at: "",
          password: "",
        },
  });

  // Reset form when member prop changes (for editing)
  useEffect(() => {
    if (member) {
      form.reset({
        id: member.id,
        first_name: member.full_name?.split(' ')[0] || '',
        last_name: member.full_name?.split(' ').slice(1).join(' ') || '',
        gender: member.gender ?? null,
        email: member.email,
        phone: member.phone ?? "",
        status: member.status,
        plan_id: member.plan_id ?? "",
        starts_at: member.starts_at ? member.starts_at.split("T")[0] : "",
        expires_at: member.expires_at ? member.expires_at.split("T")[0] : "",
      });
    }
  }, [member, form]);

  // Calculate expiration date and status when plan or start date changes
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === 'plan_id' || name === 'starts_at') {
        const { plan_id, starts_at } = values;
        
        if (plan_id && starts_at) {
          const selectedPlan = plans.find(plan => plan.id === plan_id);
          if (selectedPlan) {
            const expirationDate = calculateExpirationDate(starts_at, selectedPlan.duration_months);
            form.setValue('expires_at', expirationDate, { shouldValidate: true });
            
            // Calculate and set the appropriate status based on timing
            const calculatedStatus = calculateMemberStatus('active', starts_at, expirationDate);
            form.setValue('status', calculatedStatus, { shouldValidate: true });
          }
        } else if (!plan_id || !starts_at) {
          // Clear expiration date and reset status if either plan or start date is removed
          form.setValue('expires_at', '', { shouldValidate: true });
          form.setValue('status', 'active', { shouldValidate: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, plans]);

  const handleResult = (result: ActionResult) => {
    if (!result.success) {
      setServerError(result.error);
      addToast({
        type: "error",
        title: "Error",
        description: result.error,
        duration: 6000,
      });
      return;
    }
    setServerError(null);
    
    if (!member) {
      // For new member creation, redirect to members page
      addToast({
        type: "success",
        title: "Member Created",
        description: "New member has been successfully created.",
        duration: 4000,
      });
      form.reset();
      router.push("/members");
    } else {
      // For member updates, show success message and refresh
      addToast({
        type: "success",
        title: "Changes Saved",
        description: "Member information has been successfully updated.",
        duration: 4000,
      });
      router.refresh();
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const action = member ? updateMemberAction : createMemberAction;
      const result = await action(values);
      handleResult(result);
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input placeholder="Alex" {...field} />
                </FormControl>
                <FormMessage>{form.formState.errors.first_name?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Johnson" {...field} />
                </FormControl>
                <FormMessage>{form.formState.errors.last_name?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <CustomSelect
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value || null)}
                    placeholder="Select gender"
                    options={[
                      { value: "", label: "Select gender" },
                      ...memberGenderEnum.options.map((gender) => ({
                        value: gender,
                        label: gender.charAt(0).toUpperCase() + gender.slice(1)
                      }))
                    ]}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.gender?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="alex@mitugym.dev" {...field} />
                </FormControl>
                <FormMessage>{form.formState.errors.email?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="0712345678" 
                    {...field} 
                    value={field.value ?? ""} 
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.phone?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => {
              const planId = form.watch('plan_id');
              const startsAt = form.watch('starts_at');
              const isAutoCalculated = Boolean(planId && startsAt);
              
              return (
                <FormItem>
                  <FormLabel>
                    Status
                    {isAutoCalculated && (
                      <span className="text-xs text-muted-foreground ml-2">(auto-calculated)</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select status"
                      disabled={isAutoCalculated}
                      options={memberStatusEnum.options.map((status) => ({
                        value: status,
                        label: status.charAt(0).toUpperCase() + status.slice(1)
                      }))}
                      className={isAutoCalculated ? "bg-muted/50 cursor-not-allowed" : ""}
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.status?.message}</FormMessage>
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="plan_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Membership plan</FormLabel>
                <FormControl>
                  <CustomSelect
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value || null)}
                    placeholder="Unassigned"
                    options={[
                      { value: "", label: "Unassigned" },
                      ...plans.map((plan) => ({
                        value: plan.id,
                        label: plan.name
                      }))
                    ]}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.plan_id?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="starts_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start from</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage>{form.formState.errors.starts_at?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expires_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Expires at
                  <span className="text-xs text-muted-foreground ml-2">(auto-calculated)</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value ?? ""} 
                    readOnly
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.expires_at?.message}</FormMessage>
              </FormItem>
            )}
          />
        </div>
        {!member && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temporary password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage>
                  {!member && form.formState.errors && 'password' in form.formState.errors 
                    ? form.formState.errors.password?.message 
                    : undefined}
                </FormMessage>
              </FormItem>
            )}
          />
        )}
        {serverError ? <p className="text-sm text-error">{serverError}</p> : null}
        <div className="flex items-center justify-between">

          <Button type="submit" disabled={isPending} className={cn(isPending && "opacity-70")}> 
            {member ? "Save changes" : "Create member"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
