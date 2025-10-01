"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createNewsAction, updateNewsAction, type ActionResult } from "@/app/(protected)/actions";
import { newsSchema, type NewsInput } from "@/schemas/news";
import type { NewsItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { NewsEditor } from "@/components/news/news-editor";
import { useToast } from "@/components/ui/toast";

interface NewsFormProps {
  item?: NewsItem | null;
  onCompleted?: () => void;
}

export function NewsForm({ item, onCompleted }: NewsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { addToast } = useToast();

  const form = useForm<NewsInput>({
    resolver: zodResolver(newsSchema),
    defaultValues: item ?? {
      title: "",
      content: "<p>Welcome to MITUGYM.</p>",
      priority: "medium",
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
        content: "<p>Welcome to MITUGYM.</p>",
        priority: "medium",
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
      const payload = item ? { ...values, id: item.id } : values;
      const action = item ? updateNewsAction : createNewsAction;
      const result = await action(payload);
      handleResult(result);
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="New class launch" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.title?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <Select value={field.value} onChange={field.onChange}>
                  <option value="low" className="bg-surface text-text">
                    Low
                  </option>
                  <option value="medium" className="bg-surface text-text">
                    Medium
                  </option>
                  <option value="high" className="bg-surface text-text">
                    High
                  </option>
                </Select>
              </FormControl>
              <FormMessage>{form.formState.errors.priority?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expires_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expires on</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? field.value.split("T")[0] : ""}
                  onChange={(event) => field.onChange(event.target.value || null)}
                />
              </FormControl>
              <p className="text-xs text-muted/60 mt-1">
                The announcement will expire at 11:59 PM on the selected date
              </p>
              <FormMessage>{form.formState.errors.expires_at?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <NewsEditor value={field.value} onChange={field.onChange} />
              <FormMessage>{form.formState.errors.content?.message}</FormMessage>
            </FormItem>
          )}
        />
        {serverError ? <p className="text-sm text-error">{serverError}</p> : null}
        <Button type="submit" className="w-full" disabled={isPending}>
          {item ? "Update announcement" : "Publish announcement"}
        </Button>
      </form>
    </Form>
  );
}
