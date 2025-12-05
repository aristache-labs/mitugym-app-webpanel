"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSupabase } from "@/components/providers/supabase-provider";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    if (!supabase) {
      setError("Supabase is not configured");
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword(values);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    // Check if user is staff after successful login
    if (data.user) {
      const { data: staffProfile } = await supabase
        .from("staff_profiles")
        .select("id, role_id")
        .eq("id", data.user.id)
        .maybeSingle();
      
      if (!staffProfile || !["staff", "admin"].includes(staffProfile.role_id)) {
        // Sign out non-staff users
        await supabase.auth.signOut();
        setError("Access denied. This login is for staff members only.");
        return;
      }
    }

    router.replace("/dashboard");
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-4 sm:py-8 sm:px-6">
      {/* Logo */}
      <div className="mb-4 sm:mb-8">
        <Image
          src="/logo.png"
          alt="MITUGYM Logo"
          width={100}
          height={100}
          className="mx-auto sm:w-[150px] sm:h-[150px]"
        />
      </div>
      
      <Card className="w-full max-w-md border-primary/20 bg-surface/80 shadow-2xl">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-center text-lg font-semibold text-primary sm:text-2xl">Staff Portal</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-8">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Email</FormLabel>
                    <Input 
                      type="email" 
                      placeholder="staff@mitugym.dev" 
                      {...field}
                      className="h-11 sm:h-10"
                    />
                    <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Password</FormLabel>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field}
                      className="h-11 sm:h-10"
                    />
                    <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                  </FormItem>
                )}
              />
              {error ? <p className="text-sm text-error">{error}</p> : null}
              <Button type="submit" className="w-full h-11 sm:h-10 text-base sm:text-sm">
                Sign in
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-xs text-muted sm:mt-6">
            Need access? Contact <Link href="mailto:ops@mitugym.dev" className="underline">ops@mitugym.dev</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
