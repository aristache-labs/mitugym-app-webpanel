"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-11 w-full appearance-none rounded-[16px] border border-surface/50 bg-surface px-4 text-sm text-text shadow-[0_0_0_1px_rgba(77,212,212,0.08)] transition focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60",
      // Custom styling for options
      "[&>option]:bg-surface [&>option]:text-text [&>option]:px-4 [&>option]:py-2 [&>option]:rounded-lg [&>option]:border-none",
      "[&>option:hover]:bg-primary/10 [&>option:hover]:text-primary",
      "[&>option:checked]:bg-primary/20 [&>option:checked]:text-primary [&>option:checked]:font-medium",
      "[&>option:disabled]:opacity-50 [&>option:disabled]:cursor-not-allowed",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
