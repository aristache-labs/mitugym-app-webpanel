"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, Users, Calendar, Lock, ShieldCheck } from "lucide-react";
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
import { Form, FormField } from "@/components/ui/form";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { FloatingLabelDateInput } from "@/components/ui/floating-label-date-input";
import { useToast } from "@/components/ui/toast";
import { calculateExpirationDate } from "@/lib/utils";
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
          status: "" as "active" | "expired" | "frozen" | "pending" | "suspended",
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
        
        // If plan is "unassigned", clear dates and allow manual status selection
        if (plan_id === 'unassigned') {
          const currentExpiresAt = form.getValues('expires_at');
          const currentStartsAt = form.getValues('starts_at');
          
          if (currentExpiresAt) {
            form.setValue('expires_at', '', { shouldValidate: false });
          }
          if (currentStartsAt && name === 'plan_id') {
            form.setValue('starts_at', '', { shouldValidate: false });
          }
          return;
        }
        
        if (plan_id && plan_id !== 'unassigned' && starts_at) {
          const selectedPlan = plans.find(plan => plan.id === plan_id);
          if (selectedPlan) {
            const expirationDate = calculateExpirationDate(starts_at, selectedPlan.duration_months);
            const currentExpiresAt = form.getValues('expires_at');
            
            // Only update if the value actually changed
            if (currentExpiresAt !== expirationDate) {
              form.setValue('expires_at', expirationDate, { shouldValidate: false });
            }
            
            // Calculate status based on start date
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(starts_at);
            startDate.setHours(0, 0, 0, 0);
            
            const newStatus = startDate <= today ? 'active' : 'pending';
            const currentStatus = form.getValues('status');
            
            // Only update if the value actually changed
            if (currentStatus !== newStatus) {
              form.setValue('status', newStatus, { shouldValidate: false });
            }
          }
        } else if (!plan_id || plan_id === '' || !starts_at) {
          // Clear expiration date if either plan or start date is removed
          const currentExpiresAt = form.getValues('expires_at');
          if (currentExpiresAt) {
            form.setValue('expires_at', '', { shouldValidate: false });
          }
          
          // Clear status if no plan
          if (!plan_id || plan_id === '') {
            const currentStatus = form.getValues('status');
            if (currentStatus) {
              form.setValue('status', '' as "active" | "expired" | "frozen" | "pending" | "suspended", { shouldValidate: false });
            }
          }
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
        {/* Avatar Upload and Basic Information Section */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* Avatar Upload - Left Side Container */}
          <div className="flex-shrink-0 w-full sm:w-auto">
          <AvatarUpload
            currentAvatarUrl={member?.avatar_url}
            onAvatarChange={handleAvatarChange}
            onAvatarDelete={handleAvatarDelete}
            memberName={member?.full_name || form.watch('first_name') || 'Member'}
            isEditing={!!member}
          />
        </div>

          {/* Basic Information - Right Side Container */}
          <div className="flex-1 w-full max-w-3x2 space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-text -mb-2 sm:mb-1">Basic Information</h3>
            
            {/* Row 1: First Name | Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8 sm:mt-8">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
                  <FloatingLabelInput
                    label="First name"
                    icon={<User className="w-full h-full" />}
                    {...field}
                    error={form.formState.errors.first_name?.message}
                  />
            )}
          />
          <div className="mt-3 sm:mt-0">
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                    <FloatingLabelInput
                      label="Last name"
                      icon={<User className="w-full h-full" />}
                      {...field}
                      error={form.formState.errors.last_name?.message}
                    />
              )}
            />
          </div>
            </div>

            {/* Row 2: Email | Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8 sm:mt-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                  <FloatingLabelInput
                    type="email"
                    label="Email"
                    icon={<Mail className="w-full h-full" />}
                    {...field}
                    error={form.formState.errors.email?.message}
                  />
            )}
          />
          <div className="mt-3 sm:mt-0">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                    <FloatingLabelInput
                      label="Phone"
                      icon={<Phone className="w-full h-full" />}
                      {...field} 
                      value={field.value ?? ""} 
                      error={form.formState.errors.phone?.message}
                    />
                  )}
                    />
          </div>
            </div>

            {/* Row 3: Gender | Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8 sm:mt-8">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FloatingLabelSelect
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value || null)}
                    label="Gender"
                    icon={<Users className="w-full h-full" />}
                    options={[
                      { value: "", label: "Gender", disabled: true },
                      ...memberGenderEnum.options.map((gender) => ({
                        value: gender,
                        label: gender.charAt(0).toUpperCase() + gender.slice(1)
                      }))
                    ]}
                    error={form.formState.errors.gender?.message}
                  />
            )}
          />
          <div className="mt-3 sm:mt-0">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                const planId = form.watch('plan_id');
                const startsAt = form.watch('starts_at');
                    // Status is auto-calculated if plan (not unassigned) and start date are selected
                    const isAutoCalculated = Boolean(planId && planId !== 'unassigned' && startsAt);
                
                return (
                      <FloatingLabelSelect
                        value={field.value}
                        onChange={field.onChange}
                        label={isAutoCalculated ? "Status (auto)" : "Status"}
                        disabled={isAutoCalculated}
                        icon={<ShieldCheck className="w-full h-full" />}
                        options={[
                          { value: "", label: "Status", disabled: true },
                          ...memberStatusEnum.options.map((status) => ({
                          value: status,
                          label: status.charAt(0).toUpperCase() + status.slice(1)
                          }))
                        ]}
                        error={form.formState.errors.status?.message}
                      />
                );
              }}
            />
          </div>
            </div>

            {/* Row 4: Membership Plan | Start From */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8 sm:mt-8">
          <FormField
            control={form.control}
            name="plan_id"
            render={({ field }) => (
                  <FloatingLabelSelect
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value || null)}
                    label="Membership plan"
                    icon={<Calendar className="w-full h-full" />}
                    options={[
                      { value: "", label: "Membership plan", disabled: true },
                      { value: "unassigned", label: "Unassigned" },
                      ...plans.map((plan) => ({
                        value: plan.id,
                        label: plan.name
                      }))
                    ]}
                    error={form.formState.errors.plan_id?.message}
                  />
            )}
          />
          <div className="mt-3 sm:mt-0">
            <FormField
              control={form.control}
              name="starts_at"
              render={({ field }) => (
                    <FloatingLabelDateInput
                      label="Start from"
                      icon={<Calendar className="w-full h-full" />}
                      {...field}
                      value={field.value ?? ""}
                      error={form.formState.errors.starts_at?.message}
                    />
                  )}
                />
          </div>
            </div>

            {/* Row 5: Expires At | Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8 sm:mt-8">
          <FormField
            control={form.control}
            name="expires_at"
            render={({ field }) => (
                  <FloatingLabelDateInput
                    label="Expires at (auto)"
                    icon={<Calendar className="w-full h-full" />}
                    {...field} 
                    value={field.value ?? ""} 
                    readOnly
                    error={form.formState.errors.expires_at?.message}
                  />
            )}
          />
        {!member && (
          <div className="mt-3 sm:mt-0">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                      <FloatingLabelInput
                        type="password"
                        label="Temporary password"
                        icon={<Lock className="w-full h-full" />}
                        {...field}
                        error={!member && form.formState.errors && 'password' in form.formState.errors 
                      ? form.formState.errors.password?.message 
                      : undefined}
                      />
              )}
            />
          </div>
        )}
            </div>
          </div>
        </div>
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
