"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FloatingLabelSelectProps {
  value?: string | null;
  onChange?: (value: string) => void;
  options: Option[];
  label: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
}

export const FloatingLabelSelect = React.forwardRef<HTMLDivElement, FloatingLabelSelectProps>(
  ({ value, onChange, options, label, className, disabled = false, error, icon }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedOption, setSelectedOption] = React.useState<Option | null>(
      options.find(option => option.value === value) || null
    );

    const toggleDropdown = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    const handleOptionClick = (option: Option) => {
      setSelectedOption(option);
      onChange?.(option.value);
      setIsOpen(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleDropdown();
      } else if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    React.useEffect(() => {
      const foundOption = options.find(option => option.value === value);
      setSelectedOption(foundOption || null);
    }, [value, options]);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen, ref]);

    const hasValue = !!(selectedOption && selectedOption.value);

    return (
      <div ref={ref} className={cn("relative pt-1.5 sm:pt-0", className)}>
        <button
          type="button"
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "peer w-full h-11 px-4 text-sm font-medium outline-none rounded-[16px] transition",
            disabled ? "bg-surface/50" : "bg-surface",
            "border border-surface/50 shadow-[0_0_0_1px_rgba(77,212,212,0.08)]",
            "flex items-center justify-between",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            "hover:border-primary/30",
            "disabled:cursor-not-allowed disabled:opacity-60",
            isOpen && "border-primary ring-2 ring-primary/40",
            hasValue && "border-primary ring-2 ring-primary/40",
            error && "border-error focus-visible:border-error ring-error/40",
            disabled ? "text-text/40" : "text-text"
          )}
        >
          <span className={cn(selectedOption ? (disabled ? "text-text/40" : "text-text") : (disabled ? "text-text/40" : "text-text"))}>
            {selectedOption ? selectedOption.label : (!isOpen && !hasValue ? label : "")}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              disabled ? "text-muted/40" : "text-muted",
              isOpen && "rotate-180"
            )}
          />
        </button>

        <label
          className={cn(
            "absolute -top-[18px] sm:-top-[23px] left-[5px] text-sm font-normal text-text/80 opacity-0 overflow-hidden transition-all duration-200 pointer-events-none",
            (isOpen || hasValue) && "translate-x-6 opacity-100",
            error && "text-error"
          )}
        >
          {label}
        </label>

        {icon ? (
          <div
            className={cn(
              "absolute -top-[16px] sm:-top-[21px] -left-[12px] w-3.5 h-3.5 opacity-0 transition-all duration-200 pointer-events-none",
              (isOpen || hasValue) && "translate-x-6 opacity-100",
              error ? "text-error" : "text-primary"
            )}
          >
            {icon}
          </div>
        ) : (
          <svg
            viewBox="0 0 448 512"
            className={cn(
              "absolute -top-[16px] sm:-top-[21px] -left-[12px] w-3.5 h-3.5 opacity-0 transition-all duration-200 pointer-events-none",
              (isOpen || hasValue) && "translate-x-6 opacity-100",
              error ? "fill-error" : "fill-primary"
            )}
          >
            <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"></path>
          </svg>
        )}

        {isOpen && (
          <div className="absolute z-[100] mt-2 w-full rounded-[12px] border border-surface/50 bg-surface/95 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden">
            <div className="max-h-60 overflow-auto">
              {options.filter(option => !option.disabled).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm transition-colors",
                    "hover:bg-primary/10 hover:text-primary",
                    "focus:bg-primary/10 focus:text-primary focus:outline-none",
                    selectedOption?.value === option.value && "bg-primary/20 text-primary font-medium"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-error mt-1 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

FloatingLabelSelect.displayName = "FloatingLabelSelect";

