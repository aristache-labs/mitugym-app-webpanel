"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  createMemberSchema,
  memberStatusEnum,
  type CreateMemberInput,
  type UpdateMemberInput,
  updateMemberSchema,
} from "@/schemas/members";
import { createMemberAction, updateMemberAction, type ActionResult } from "@/app/(protected)/actions";
import type { Member, MembershipPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
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
          full_name: member.full_name,
          email: member.email,
          phone: member.phone ?? "",
          status: member.status,
          plan_id: member.plan_id ?? "",
          expires_at: member.expires_at ? member.expires_at.split("T")[0] : "",
          notes: member.notes ?? "",
        }
      : {
          full_name: "",
          email: "",
          phone: "",
          status: "active",
          plan_id: null,
          expires_at: "",
          notes: "",
          password: "",
        },
  });

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
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Alex Johnson" {...field} />
                </FormControl>
                <FormMessage>{form.formState.errors.full_name?.message}</FormMessage>
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
                  <Input placeholder="+1 555-0100" {...field} />
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
                  <Select value={field.value} onChange={field.onChange}>
                    {memberStatusEnum.options.map((status) => (
                      <option key={status} value={status} className="bg-surface text-text">
                        {status}
                      </option>
                    ))}
                  </Select>
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
                  <Select value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value || null)}>
                    <option value="" className="bg-surface text-text">
                      Unassigned
                    </option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id} className="bg-surface text-text">
                        {plan.name}
                      </option>
                    ))}
                  </Select>
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
                  <Input type="date" value={field.value ?? ""} onChange={field.onChange} />
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
                <FormMessage>{form.formState.errors.password?.message}</FormMessage>
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Context for front desk or coaches" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.notes?.message}</FormMessage>
            </FormItem>
          )}
        />
        {serverError ? <p className="text-sm text-error">{serverError}</p> : null}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">
            Member actions trigger an audit log entry. Passwords sync to the mobile app authentication service.
          </p>
          <Button type="submit" disabled={isPending} className={cn(isPending && "opacity-70")}> 
            {member ? "Save changes" : "Create member"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
