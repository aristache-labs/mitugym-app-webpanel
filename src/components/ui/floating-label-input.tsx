"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, label, error, type = "text", icon, value, ...props }, ref) => {
    const [hasValue, setHasValue] = React.useState(false);

    React.useEffect(() => {
      setHasValue(!!(value || props.defaultValue));
    }, [value, props.defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="relative flex flex-col pt-1.5 sm:pt-0">
        <input
          id={`input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          type={type}
          className={cn(
            "peer w-full h-11 px-4 text-sm font-medium outline-none rounded-[16px] bg-surface text-text caret-primary transition",
            "border border-surface/50 shadow-[0_0_0_1px_rgba(77,212,212,0.08)]",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            "focus:border-primary focus:ring-2 focus:ring-primary/40",
            error && "border-error focus:border-error focus-visible:border-error focus:ring-error/40",
            className
          )}
          ref={ref}
          placeholder={label}
          value={value}
          onChange={handleChange}
          {...props}
        />
        <label
          htmlFor={`input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className={cn(
            "absolute -top-[18px] sm:-top-[25px] left-[5px] text-sm font-normal text-text/80 opacity-0 overflow-hidden transition-all duration-200 pointer-events-none",
            "peer-focus:translate-x-6 peer-focus:opacity-100",
            hasValue && "translate-x-6 opacity-100",
            error && "text-error"
          )}
        >
          {label}
        </label>
        {icon ? (
          <div
            className={cn(
              "absolute -top-[16px] sm:-top-[22px] -left-[12px] w-3.5 h-3.5 opacity-0 transition-all duration-200 pointer-events-none",
              "peer-focus:translate-x-6 peer-focus:opacity-100",
              hasValue && "translate-x-6 opacity-100",
              error ? "text-error" : "text-primary"
            )}
          >
            {icon}
          </div>
        ) : (
          <svg
            viewBox="0 0 448 512"
            className={cn(
              "absolute -top-[16px] sm:-top-[22px] -left-[12px] w-3.5 h-3.5 opacity-0 transition-all duration-200 pointer-events-none",
              "peer-focus:translate-x-6 peer-focus:opacity-100",
              hasValue && "translate-x-6 opacity-100",
              error ? "fill-error" : "fill-primary"
            )}
          >
            <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"></path>
          </svg>
        )}
        {error && (
          <p className="text-xs text-error mt-1 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };

