"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const baseClasses = "relative overflow-hidden font-semibold uppercase tracking-wider transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variants = {
      default: "border border-primary bg-transparent text-text hover:bg-primary hover:text-background hover:shadow-[0_0_30px_5px_rgba(77,212,212,0.6)] focus:ring-primary",
      destructive: "border border-error bg-transparent text-text hover:bg-error hover:text-background hover:shadow-[0_0_30px_5px_rgba(255,107,107,0.6)] focus:ring-error",
      outline: "border border-surface bg-transparent text-text hover:bg-surface hover:shadow-[0_0_30px_5px_rgba(92,223,223,0.3)] focus:ring-surface"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded",
      md: "px-5 py-2.5 text-sm rounded-lg",
      lg: "px-6 py-3 text-base rounded-lg"
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          "before:content-[''] before:absolute before:top-[7%] before:left-0 before:w-0 before:h-[86%] before:opacity-0 before:bg-accent before:shadow-[0_0_50px_30px_rgb(68,228,228)] before:transform before:skew-x-[-20deg] before:transition-all before:duration-500",
          "hover:before:animate-shine",
          "active:shadow-none active:transition-shadow active:duration-200 active:ease-in",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };
