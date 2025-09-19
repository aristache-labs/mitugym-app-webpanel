"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword(values);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace("/dashboard");
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md border-primary/20 bg-surface/80">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-primary">Staff portal</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input type="email" placeholder="staff@mitugym.dev" {...field} />
                    <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <Input type="password" placeholder="••••••••" {...field} />
                    <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                  </FormItem>
                )}
              />
              {error ? <p className="text-sm text-error">{error}</p> : null}
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-xs text-muted">
            Need access? Contact <Link href="mailto:ops@mitugym.dev">ops@mitugym.dev</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
