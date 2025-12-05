"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSupabase } from "@/components/providers/supabase-provider";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  // Prevent body scroll on mobile portrait only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Only disable scroll on mobile portrait mode
    const isPortraitMobile = window.matchMedia('(max-width: 640px) and (orientation: portrait)').matches;
    
    if (isPortraitMobile) {
      // Prevent scrolling on mobile portrait
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    }

    // Listen for orientation changes
    const handleOrientationChange = () => {
      const isStillPortraitMobile = window.matchMedia('(max-width: 640px) and (orientation: portrait)').matches;
      
      if (isStillPortraitMobile) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
      }
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    if (!supabase) {
      setError("Supabase is not configured");
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    
    if (signInError) {
      setError(signInError.message);
      return;
    }

    // If rememberMe is false, we need to clear the session on browser close
    // Supabase stores session in localStorage by default (persistent)
    // For "don't remember me", we'll need to manually handle session expiry
    if (!values.rememberMe && data.session) {
      // Store a flag to indicate this is a temporary session
      sessionStorage.setItem('tempSession', 'true');
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
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden px-4 sm:static sm:min-h-screen sm:overflow-visible sm:px-6 sm:py-8">
      {/* Logo */}
      <div className="mb-2 flex-shrink-0 sm:mb-8">
        <Image
          src="/logo.png"
          alt="MITUGYM Logo"
          width={60}
          height={60}
          className="mx-auto sm:w-[150px] sm:h-[150px]"
        />
      </div>
      
      <Card className="w-full max-w-md flex-shrink-0 border-primary/20 bg-surface/80 shadow-2xl">
        <CardHeader className="pb-1 pt-3 sm:pb-6 sm:pt-6">
          <CardTitle className="text-center text-sm font-semibold text-primary sm:text-2xl">Staff Portal</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2 sm:px-6 sm:pb-8">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-2 sm:space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] leading-tight sm:text-sm">Email</FormLabel>
                    <Input 
                      type="email" 
                      placeholder="staff@mitugym.dev" 
                      {...field}
                      className="h-8 text-[11px] sm:h-10 sm:text-sm"
                    />
                    <FormMessage className="text-[9px] sm:text-xs">{form.formState.errors.email?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] leading-tight sm:text-sm">Password</FormLabel>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field}
                      className="h-8 text-[11px] sm:h-10 sm:text-sm"
                    />
                    <FormMessage className="text-[9px] sm:text-xs">{form.formState.errors.password?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <Checkbox
                      id="rememberMe"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    />
                    <FormLabel
                      htmlFor="rememberMe"
                      className="text-[10px] leading-tight sm:text-sm font-normal cursor-pointer"
                    >
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />
              {error ? <p className="text-[9px] text-error sm:text-sm">{error}</p> : null}
              <Button type="submit" className="h-8 w-full text-[11px] sm:h-10 sm:text-sm">
                Sign in
              </Button>
            </form>
          </Form>
          <p className="mt-2 text-center text-[8px] text-muted sm:mt-6 sm:text-xs">
            Need access? Contact <Link href="mailto:ops@mitugym.dev" className="underline">ops@mitugym.dev</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
