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
    const [hasValue, setHasValue] = React.useState(false);

    React.useEffect(() => {
      setHasValue(!!props.value);
    }, [props.value]);

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "peer w-full px-4 py-3 text-sm outline-none border-2 bg-transparent rounded-2xl transition-all duration-300",
            "border-primary/40 focus:border-primary",
            "text-text placeholder:text-transparent",
            error && "border-error focus:border-error",
            className
          )}
          ref={ref}
          placeholder={label}
          onBlur={(e) => {
            setHasValue(!!e.target.value);
            props.onBlur?.(e);
          }}
          {...props}
        />
        <label
          className={cn(
            "absolute left-0 ml-4 px-2 pointer-events-none transition-all duration-300",
            "text-text/80 text-sm",
            "peer-focus:-translate-y-1/2 peer-focus:scale-90 peer-focus:ml-5 peer-focus:bg-background",
            "peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-90 peer-[:not(:placeholder-shown)]:ml-5 peer-[:not(:placeholder-shown)]:bg-background",
            hasValue ? "-translate-y-1/2 scale-90 ml-5 bg-background" : "translate-y-3",
            error && "text-error"
          )}
        >
          {label}
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

