"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createNewsAction, updateNewsAction, type ActionResult } from "@/app/(protected)/actions";
import { newsSchema, type NewsInput } from "@/schemas/news";
import type { NewsItem } from "@/types";
import { AnimatedButton } from "@/components/ui/animated-button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { NewsEditor } from "@/components/news/news-editor";
import { useToast } from "@/components/ui/toast";
import { FileText, AlertCircle, Calendar, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsFormProps {
  item?: NewsItem | null;
  onCompleted?: () => void;
}

export function NewsForm({ item, onCompleted }: NewsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const { addToast } = useToast();

  const form = useForm<NewsInput>({
    resolver: zodResolver(newsSchema),
    defaultValues: item ?? {
      title: "",
      content: "",
      priority: "" as "low" | "medium" | "high",
      expires_at: null,
    },
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      form.reset({
        title: item.title,
        content: item.content,
        priority: item.priority,
        expires_at: item.expires_at,
      });
    } else {
      form.reset({
        title: "",
        content: "",
        priority: "" as "low" | "medium" | "high",
        expires_at: null,
      });
    }
  }, [item, form]);

  const handleResult = (result: ActionResult) => {
    if (!result.success) {
      setServerError(result.error);
      addToast({
        type: "error",
        title: item ? "Failed to Update Announcement" : "Failed to Create Announcement",
        description: result.error || "An unexpected error occurred. Please try again.",
      });
      return;
    }
    
    setServerError(null);
    
    // Show success toast
    addToast({
      type: "success",
      title: item ? "Announcement Updated" : "Announcement Created",
      description: item 
        ? "Your announcement has been successfully updated." 
        : "Your announcement has been successfully created.",
    });
    
    if (onCompleted) {
      onCompleted();
    } else {
      router.push("/news");
      router.refresh();
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      // Ensure priority has a default value if empty
      const formData = {
        ...values,
        priority: values.priority || "medium",
      };
      const payload = item ? { ...formData, id: item.id } : formData;
      const action = item ? updateNewsAction : createNewsAction;
      const result = await action(payload);
      handleResult(result);
    });
  });

  const priorityOptions = [
    { value: "", label: "Priority", disabled: true },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Title */}
      <div className="mb-3 sm:mb-0">
        <FloatingLabelInput
          id="title"
          label="Title"
          icon={<Megaphone className="h-4 w-4" />}
          type="text"
          value={form.watch("title")}
          onChange={(e) => form.setValue("title", e.target.value)}
          error={form.formState.errors.title?.message}
          placeholder="Title"
        />
      </div>

      {/* Priority */}
      <div className="mb-3 sm:mb-0 mt-6 sm:mt-8">
        <FloatingLabelSelect
          label="Priority"
          icon={<AlertCircle className="h-4 w-4" />}
          value={form.watch("priority")}
          onChange={(value) => form.setValue("priority", value as "low" | "medium" | "high")}
          options={priorityOptions}
          error={form.formState.errors.priority?.message}
        />
      </div>

      {/* Expires On */}
      <div className="mb-3 sm:mb-0 mt-6 sm:mt-8">
        <FloatingLabelInput
          id="expires_at"
          label="Expires On"
          icon={<Calendar className="h-4 w-4" />}
          type="date"
          value={form.watch("expires_at") ? form.watch("expires_at")!.split("T")[0] : ""}
          onChange={(e) => form.setValue("expires_at", e.target.value || null)}
          error={form.formState.errors.expires_at?.message}
          placeholder="Expires On"
        />
        <p className="text-xs text-muted/60 mt-2 ml-1">
          The announcement will expire at 11:59 PM on the selected date
        </p>
      </div>

      {/* Content */}
      <div className="relative flex flex-col pt-1.5 sm:pt-0 mb-3 sm:mb-0 mt-8">
        {/* Placeholder overlay */}
        {!form.watch("content") || form.watch("content") === "" || form.watch("content") === "<p></p>" ? (
          <div className="absolute top-0 left-0 w-full h-auto min-h-[200px] flex items-start px-4 pt-4 pointer-events-none z-10">
            <span className="text-sm font-medium text-muted/50">Description</span>
          </div>
        ) : null}
        <NewsEditor 
          value={form.watch("content")} 
          onChange={(value) => form.setValue("content", value)}
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
        />
        <label
          className={cn(
            "absolute -top-[18px] sm:-top-[25px] left-[10px] text-sm font-normal text-text/80 opacity-0 overflow-hidden transition-all duration-200 pointer-events-none flex items-center gap-1.5",
            (isEditorFocused || (form.watch("content") && form.watch("content").trim() !== "" && form.watch("content") !== "<p></p>")) && "translate-x-0 opacity-100",
            form.formState.errors.content && "text-error"
          )}
        >
          <div
            className={cn(
              "w-3.5 h-3.5 flex items-center justify-center",
              form.formState.errors.content ? "text-error" : "text-primary"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
          </div>
          <span>Description</span>
        </label>
        {form.formState.errors.content && (
          <p className="text-xs text-error mt-1 ml-1">{form.formState.errors.content.message}</p>
        )}
      </div>

      {serverError ? <p className="text-sm text-error mt-4">{serverError}</p> : null}
      
      <div className="flex items-center justify-between gap-3 pt-6 sm:pt-6 mt-4 sm:mt-0">
        <AnimatedButton
          type="submit"
          disabled={isPending}
          className="h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-slate-200 hover:text-white border-0 !ring-0 !outline-none transition-all duration-500 ease-out shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 backdrop-blur-sm font-medium"
        >
          {isPending ? (item ? "Updating..." : "Publishing...") : (item ? "Update Announcement" : "Publish Announcement")}
        </AnimatedButton>
      </div>
    </form>
  );
}
