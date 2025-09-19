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
import { cn } from "@/lib/utils";

interface MemberFormProps {
  plans: MembershipPlan[];
  member?: Member;
}

type FormValues = CreateMemberInput | UpdateMemberInput;

export function MemberForm({ plans, member }: MemberFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
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
          expires_at: member.expires_at ? member.expires_at.split("T")[0] : "",
        }
      : {
          first_name: "",
          last_name: "",
          gender: null,
          email: "",
          phone: "",
          status: "active",
          plan_id: null,
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
        expires_at: member.expires_at ? member.expires_at.split("T")[0] : "",
      });
    }
  }, [member, form]);

  const handleResult = (result: ActionResult) => {
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setServerError(null);
    if (!member) {
      form.reset();
    }
    router.refresh();
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      let payload: Record<string, unknown> = values;
      if (values.expires_at) {
        payload = { ...values, expires_at: values.expires_at };
      }
      const action = member ? updateMemberAction : createMemberAction;
      const result = await action(payload);
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <CustomSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select status"
                    options={memberStatusEnum.options.map((status) => ({
                      value: status,
                      label: status.charAt(0).toUpperCase() + status.slice(1)
                    }))}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.status?.message}</FormMessage>
              </FormItem>
            )}
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
            name="expires_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expires at</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ""} />
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
