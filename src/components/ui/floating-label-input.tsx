"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, label, error, type = "text", ...props }, ref) => {
    return (
      <div className="relative flex flex-col">
        <input
          required
          id={`input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          type={type}
          className={cn(
            "peer w-full h-11 px-4 text-sm font-medium outline-none rounded-[16px] bg-surface text-text caret-primary transition",
            "border border-surface/50 shadow-[0_0_0_1px_rgba(77,212,212,0.08)]",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            "focus:border-primary focus:ring-2 focus:ring-primary/40",
            "valid:border-primary valid:ring-2 valid:ring-primary/40",
            error && "border-error focus:border-error focus-visible:border-error focus:ring-error/40",
            className
          )}
          ref={ref}
          placeholder={label}
          {...props}
        />
        <label
          htmlFor={`input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className={cn(
            "absolute -top-[23px] left-[5px] text-sm font-normal text-text/80 opacity-0 overflow-hidden transition-all duration-200 pointer-events-none",
            "peer-focus:translate-x-5 peer-focus:opacity-100",
            "peer-valid:translate-x-5 peer-valid:opacity-100",
            error && "text-error"
          )}
        >
          {label}
        </label>
        <svg
          viewBox="0 0 448 512"
          className={cn(
            "absolute -top-[20px] -left-[12px] w-3 h-3 opacity-0 transition-all duration-200 pointer-events-none",
            "peer-focus:translate-x-5 peer-focus:opacity-100",
            "peer-valid:translate-x-5 peer-valid:opacity-100",
            error ? "fill-error" : "fill-primary"
          )}
        >
          <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"></path>
        </svg>
        {error && (
          <p className="text-xs text-error mt-1 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };

