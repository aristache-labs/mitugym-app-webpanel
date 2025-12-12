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
      // Check for value or defaultValue, treating 0 as a valid value
      setHasValue(value !== undefined && value !== null && value !== '' || 
                  props.defaultValue !== undefined && props.defaultValue !== null && props.defaultValue !== '');
    }, [value, props.defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Treat 0 as a valid value
      setHasValue(e.target.value !== '');
      props.onChange?.(e);
    };

    return (
      <div className="relative flex flex-col pt-1.5 sm:pt-0">
        {/* Placeholder overlay for datetime and date inputs */}
        {(type === "datetime-local" || type === "date") && !hasValue && (
          <div className="absolute inset-0 flex items-center px-4 pointer-events-none z-10">
            <span className="text-sm font-medium text-muted/50">{label}</span>
          </div>
        )}
        <input
          id={`input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          type={type}
          className={cn(
            "peer w-full h-11 px-4 text-sm font-medium outline-none rounded-[16px] bg-surface text-text caret-primary transition",
            "border border-surface/50 shadow-[0_0_0_1px_rgba(77,212,212,0.08)]",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            "focus:border-primary focus:ring-2 focus:ring-primary/40",
            error && "border-error focus:border-error focus-visible:border-error focus:ring-error/40",
            // Hide native datetime/date placeholder when showing custom overlay
            type === "datetime-local" && "[&::-webkit-datetime-edit-fields-wrapper]:opacity-0 [&::-webkit-datetime-edit-text]:opacity-0 [&::-webkit-datetime-edit]:opacity-0",
            type === "datetime-local" && hasValue && "[&::-webkit-datetime-edit-fields-wrapper]:opacity-100 [&::-webkit-datetime-edit-text]:opacity-100 [&::-webkit-datetime-edit]:opacity-100",
            type === "date" && !hasValue && "[&::-webkit-datetime-edit-fields-wrapper]:opacity-0 [&::-webkit-datetime-edit-text]:opacity-0 [&::-webkit-datetime-edit]:opacity-0 [&::-webkit-calendar-picker-indicator]:opacity-100",
            type === "date" && hasValue && "[&::-webkit-datetime-edit-fields-wrapper]:opacity-100 [&::-webkit-datetime-edit-text]:opacity-100 [&::-webkit-datetime-edit]:opacity-100 [&::-webkit-calendar-picker-indicator]:opacity-100",
            className
          )}
          ref={ref}
          placeholder={label}
          value={value}
          onChange={handleChange}
          onFocus={(e) => {
            // Show the native datetime/date picker on focus
            if (type === "datetime-local" || type === "date") {
              e.currentTarget.showPicker?.();
            }
            props.onFocus?.(e);
          }}
          {...props}
        />
        <label
          htmlFor={`input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className={cn(
            "absolute -top-[18px] sm:-top-[25px] left-[10px] text-sm font-normal text-text/80 opacity-0 overflow-hidden transition-all duration-200 pointer-events-none flex items-center gap-1.5",
            "peer-focus:translate-x-0 peer-focus:opacity-100",
            hasValue && "translate-x-0 opacity-100",
            error && "text-error"
          )}
        >
          {icon ? (
            <div
              className={cn(
                "w-3.5 h-3.5 flex items-center justify-center",
                error ? "text-error" : "text-primary"
              )}
            >
              {icon}
            </div>
          ) : (
            <svg
              viewBox="0 0 448 512"
              className={cn(
                "w-3.5 h-3.5",
                error ? "fill-error" : "fill-primary"
              )}
            >
              <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"></path>
            </svg>
          )}
          <span>{label}</span>
        </label>
        {error && (
          <p className="text-xs text-error mt-1 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };

