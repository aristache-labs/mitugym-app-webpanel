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
import { 
  createMemberAction, 
  updateMemberAction, 
  uploadMemberAvatarAction,
  deleteMemberAvatarAction,
  type ActionResult 
} from "@/app/(protected)/actions";
import type { Member, MembershipPlan } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { useToast } from "@/components/ui/toast";
import { calculateExpirationDate, calculateMemberStatus } from "@/lib/utils";
import { AvatarUpload } from "./avatar-upload";
import { AnimatedButton } from "@/components/ui/animated-button";

interface MemberFormProps {
  plans: MembershipPlan[];
  member?: Member;
  deleteButton?: React.ReactNode;
}

type FormValues = CreateMemberInput | UpdateMemberInput;

export function MemberForm({ plans, member, deleteButton }: MemberFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [shouldDeleteAvatar, setShouldDeleteAvatar] = useState(false);
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

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file);
    setShouldDeleteAvatar(false);
  };

  const handleAvatarDelete = () => {
    setAvatarFile(null);
    setShouldDeleteAvatar(true);
  };

  const handleAvatarUpload = async (memberId: string) => {
    if (shouldDeleteAvatar && member?.avatar_url) {
      // Delete avatar
      const deleteResult = await deleteMemberAvatarAction(memberId);
      if (deleteResult.success) {
        addToast({
          type: "success",
          title: "Avatar Removed",
          description: "Member avatar has been removed.",
          duration: 3000,
        });
      }
    } else if (avatarFile) {
      // Upload new/updated avatar
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const uploadResult = await uploadMemberAvatarAction(memberId, formData);
      if (uploadResult.success) {
        addToast({
          type: "success",
          title: "Avatar Updated",
          description: "Member avatar has been uploaded.",
          duration: 3000,
        });
      } else {
        addToast({
          type: "error",
          title: "Upload Failed",
          description: uploadResult.error || "Failed to upload avatar",
          duration: 5000,
        });
      }
    }
  };

  const handleResult = async (result: ActionResult) => {
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
    
    // Handle avatar upload/delete for existing members
    if (member && (avatarFile || shouldDeleteAvatar)) {
      setIsUploadingAvatar(true);
      await handleAvatarUpload(member.id);
      setIsUploadingAvatar(false);
    }
    
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
      await handleResult(result);
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
        {/* Avatar Upload Section */}
        <AvatarUpload
          currentAvatarUrl={member?.avatar_url}
          onAvatarChange={handleAvatarChange}
          onAvatarDelete={handleAvatarDelete}
          memberName={member?.full_name || form.watch('first_name') || 'Member'}
          isEditing={!!member}
        />

        <div className="border-t border-surface/20 pt-4 sm:pt-6">
          <h3 className="text-base sm:text-lg font-semibold text-text mb-3 sm:mb-4">Basic Information</h3>
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">First name</FormLabel>
                <FormControl>
                  <Input placeholder="Alex" {...field} className="h-9 sm:h-10" />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm">{form.formState.errors.first_name?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Johnson" {...field} className="h-9 sm:h-10" />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm">{form.formState.errors.last_name?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Gender</FormLabel>
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
                <FormMessage className="text-xs sm:text-sm">{form.formState.errors.gender?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="alex@mitugym.dev" {...field} className="h-9 sm:h-10" />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm">{form.formState.errors.email?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Phone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="0712345678" 
                    {...field} 
                    value={field.value ?? ""} 
                    className="h-9 sm:h-10"
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm">{form.formState.errors.phone?.message}</FormMessage>
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
                  <FormLabel className="text-sm sm:text-base">
                    Status
                    {isAutoCalculated && (
                      <span className="text-[10px] sm:text-xs text-muted-foreground ml-2">(auto-calculated)</span>
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
                  <FormMessage className="text-xs sm:text-sm">{form.formState.errors.status?.message}</FormMessage>
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="plan_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Membership plan</FormLabel>
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
                <FormMessage className="text-xs sm:text-sm">{form.formState.errors.plan_id?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="starts_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Start from</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value ?? ""} 
                      className="h-9 sm:h-10"
                      placeholder="Select date"
                    />
                    {!field.value && (
                      <div className="absolute inset-0 flex items-center px-3 sm:px-4 pointer-events-none text-muted/60 text-xs sm:text-sm sm:hidden">
                        Select start date
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-xs sm:text-sm">{form.formState.errors.starts_at?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expires_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Expires at
                  <span className="text-[10px] sm:text-xs text-muted-foreground ml-2">(auto-calculated)</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value ?? ""} 
                    readOnly
                    className="bg-muted/50 cursor-not-allowed h-9 sm:h-10"
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm">{form.formState.errors.expires_at?.message}</FormMessage>
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
                <FormLabel className="text-sm sm:text-base">Temporary password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Optional" {...field} className="h-9 sm:h-10" />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm">
                  {!member && form.formState.errors && 'password' in form.formState.errors 
                    ? form.formState.errors.password?.message 
                    : undefined}
                </FormMessage>
              </FormItem>
            )}
          />
        )}
        {serverError ? <p className="text-xs sm:text-sm text-error">{serverError}</p> : null}
        <div className="flex items-center justify-between gap-3 pt-2 sm:pt-0">
          <AnimatedButton
            type="submit" 
            disabled={isPending || isUploadingAvatar} 
            className="h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-slate-200 hover:text-white border-0 !ring-0 !outline-none transition-all duration-500 ease-out shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 backdrop-blur-sm font-medium"
          > 
            {isPending 
              ? "Saving..." 
              : isUploadingAvatar 
                ? "Uploading avatar..." 
                : member 
                  ? "Save changes" 
                  : "Create member"}
          </AnimatedButton>
          {deleteButton && <div>{deleteButton}</div>}
        </div>
      </form>
    </Form>
  );
}
