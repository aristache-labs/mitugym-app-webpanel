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
            "peer w-full px-4 py-3 text-sm font-medium outline-none border-2 rounded-[10px] bg-transparent text-text caret-primary transition-all duration-300",
            "border-surface/50",
            "focus:border-primary focus:bg-primary/5",
            "valid:border-primary valid:bg-primary/5",
            error && "border-error focus:border-error focus:bg-error/5",
            className
          )}
          ref={ref}
          placeholder={label}
          {...props}
        />
        <label
          htmlFor={`input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className={cn(
            "absolute -top-[20px] left-[5px] text-sm font-normal text-text/80 opacity-0 overflow-hidden transition-all duration-200 pointer-events-none",
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
            "absolute -top-[17px] -left-[12px] w-3 h-3 opacity-0 transition-all duration-200 pointer-events-none",
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

