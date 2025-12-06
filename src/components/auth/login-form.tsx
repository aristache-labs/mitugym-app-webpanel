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

export function LoginForm() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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

  // Generate stars effect
  useEffect(() => {
    const createStars = () => {
      const starsContainer = document.getElementById('stars-container');
      if (!starsContainer) return;
      
      const numberOfStars = 100;
      for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'login-star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        starsContainer.appendChild(star);
      }
    };

    createStars();
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
    <>
      {/* Stars background */}
      <div id="stars-container" className="fixed inset-0 pointer-events-none z-[1]"></div>
      
      {/* Cyan gradient background - visible on mobile */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 pointer-events-none z-[1] sm:opacity-0"></div>
      
      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden px-4 sm:static sm:min-h-screen sm:overflow-visible sm:px-6 sm:py-8">
        {/* Logo */}
        <div className="mb-2 flex-shrink-0 sm:mb-8 animate-fade-in">
          <Image
            src="/logo.png"
            alt="MITUGYM Logo"
            width={60}
            height={60}
            className="mx-auto sm:w-[150px] sm:h-[150px]"
          />
        </div>
        
        <Card className="w-full max-w-md flex-shrink-0 !border-primary/40 sm:!border-primary/20 bg-surface/80 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] animate-scale-in relative overflow-hidden">
          {/* Input glow effect container */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="input-focus-glow opacity-0 transition-opacity duration-300"></div>
          </div>
          
          <CardHeader className="pb-1 pt-3 sm:pb-6 sm:pt-6 relative">
            <CardTitle className="text-center text-sm font-semibold text-primary sm:text-2xl relative">
              Staff Portal
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-2 sm:px-6 sm:pb-8 relative z-10">
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-2 sm:space-y-6">
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] leading-tight sm:text-sm text-muted transition-colors duration-300">Email</FormLabel>
                      <div className="relative">
                        <Input 
                          type="email" 
                          placeholder="staff@mitugym.dev" 
                          {...field}
                          className="h-8 text-[11px] sm:h-10 sm:text-sm bg-surface/50 border-surface/60 focus:border-primary focus:bg-primary/5 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 focus:-translate-y-0.5"
                        />
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-transparent to-primary rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                      </div>
                      <FormMessage className="text-[9px] sm:text-xs text-error">{form.formState.errors.email?.message}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] leading-tight sm:text-sm text-muted transition-colors duration-300">Password</FormLabel>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••" 
                          {...field}
                          className="h-8 text-[11px] sm:h-10 sm:text-sm bg-surface/50 border-surface/60 focus:border-primary focus:bg-primary/5 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 focus:-translate-y-0.5 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors duration-300 focus:outline-none"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <svg 
                              className="h-4 w-4 sm:h-5 sm:w-5" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          ) : (
                            <svg 
                              className="h-4 w-4 sm:h-5 sm:w-5" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      <FormMessage className="text-[9px] sm:text-xs text-error">{form.formState.errors.password?.message}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-center">
                        <label 
                          htmlFor="rememberMe" 
                          className="flex items-center gap-3 cursor-pointer group px-4 py-2.5 rounded-lg bg-surface/30 border border-surface/40 hover:border-primary/40 hover:bg-surface/50 transition-all duration-300"
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              id="rememberMe"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="peer sr-only"
                            />
                            <div 
                              className="h-5 w-5 sm:h-5 sm:w-5 rounded bg-surface/40 peer-checked:bg-primary/10 transition-all duration-300 group-hover:bg-surface/60 flex items-center justify-center"
                              style={{
                                border: field.value ? '2px solid #4dd4d4' : '2px solid rgba(77, 212, 212, 0.7)',
                              }}
                            >
                              {field.value && (
                                <svg 
                                  className="h-3.5 w-3.5 text-primary animate-scale-in" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={3} 
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            {field.value && (
                              <div className="absolute inset-0 bg-primary/20 rounded blur-sm -z-10 animate-pulse"></div>
                            )}
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-muted group-hover:text-primary transition-colors duration-300 leading-none">
                            Remember me
                          </span>
                        </label>
                      </div>
                    </FormItem>
                  )}
                />
                {error ? <p className="text-[9px] text-error sm:text-sm animate-shake">{error}</p> : null}
                <Button 
                  type="submit" 
                  className="h-8 w-full text-[11px] sm:h-10 sm:text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(6,182,212,0.3)] relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative">Sign in</span>
                </Button>
              </form>
            </Form>
            <p className="mt-2 text-center text-[8px] text-muted sm:mt-6 sm:text-xs">
              Need access? Contact <Link href="mailto:ops@mitugym.dev" className="underline text-primary hover:text-primary/80 transition-colors duration-300 relative inline-block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-primary after:transition-all after:duration-300 hover:after:w-full">ops@mitugym.dev</Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .login-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle 4s infinite;
        }
        
        .login-star:nth-child(odd) {
          background: #06b6d4;
          animation-delay: -2s;
        }
        
        .login-star:nth-child(3n) {
          animation-delay: -1s;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}
