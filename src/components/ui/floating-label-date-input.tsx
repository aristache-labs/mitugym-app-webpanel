"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingLabelDateInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const FloatingLabelDateInput = React.forwardRef<HTMLInputElement, FloatingLabelDateInputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    const [hasValue, setHasValue] = React.useState(!!props.value);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      setHasValue(!!props.value);
    }, [props.value]);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handlePlaceholderClick = () => {
      if (props.readOnly || props.disabled) return;
      inputRef.current?.showPicker?.();
      inputRef.current?.focus();
    };

    return (
      <div className="relative flex flex-col">
        <input
          type="date"
          id={`input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className={cn(
            "peer w-full h-11 px-4 text-sm font-medium outline-none rounded-[16px] transition",
            !props.readOnly && !props.disabled && "cursor-pointer",
            props.readOnly || props.disabled ? "cursor-not-allowed bg-surface/50" : "bg-surface",
            props.readOnly || props.disabled ? "text-text/40" : "text-text",
            "caret-primary",
            "border border-surface/50 shadow-[0_0_0_1px_rgba(77,212,212,0.08)]",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            "focus:border-primary focus:ring-2 focus:ring-primary/40",
            hasValue && "border-primary ring-2 ring-primary/40",
            "[&::-webkit-datetime-edit]:opacity-0 [&::-webkit-datetime-edit]:peer-focus:opacity-100",
            hasValue && "[&::-webkit-datetime-edit]:opacity-100",
            !props.readOnly && !props.disabled && "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
            props.readOnly || props.disabled ? "[&::-webkit-calendar-picker-indicator]:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:opacity-40" : "",
            error && "border-error focus:border-error focus-visible:border-error focus:ring-error/40",
            className
          )}
          ref={inputRef}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          {...props}
        />
        
        {/* Placeholder text overlay - clickable to open date picker */}
        {!hasValue && (
          <span 
            onClick={handlePlaceholderClick}
            className={cn(
              "absolute inset-0 flex items-center px-4 text-sm peer-focus:opacity-0 transition-opacity",
              props.readOnly || props.disabled ? "cursor-not-allowed text-text/40" : "cursor-pointer text-text"
            )}
          >
            {label}
          </span>
        )}

        <label
          htmlFor={`input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className={cn(
            "absolute -top-[25px] left-[5px] text-sm font-normal text-text/80 opacity-0 overflow-hidden transition-all duration-200 pointer-events-none",
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
              "absolute -top-[22px] -left-[12px] w-3.5 h-3.5 opacity-0 transition-all duration-200 pointer-events-none",
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
              "absolute -top-[22px] -left-[12px] w-3.5 h-3.5 opacity-0 transition-all duration-200 pointer-events-none",
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

FloatingLabelDateInput.displayName = "FloatingLabelDateInput";

export { FloatingLabelDateInput };

