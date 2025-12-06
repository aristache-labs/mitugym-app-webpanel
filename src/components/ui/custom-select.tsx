"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CustomSelect = React.forwardRef<HTMLDivElement, CustomSelectProps>(
  ({ value, onChange, options, placeholder = "Select option", className, disabled = false }, ref) => {
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

    return (
      <div ref={ref} className={cn("relative", className)}>
        <button
          type="button"
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-[16px] border border-surface/50 bg-surface px-4 text-sm text-text shadow-[0_0_0_1px_rgba(77,212,212,0.08)] transition",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            "hover:border-primary/30",
            "disabled:cursor-not-allowed disabled:opacity-60",
            isOpen && "border-primary ring-2 ring-primary/40"
          )}
        >
          <span className={cn(selectedOption ? "text-text" : "text-muted")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-[100] mt-2 w-full rounded-[12px] border border-surface/50 bg-surface/95 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden">
            <div className="max-h-60 overflow-auto">
              {options.map((option) => (
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
      </div>
    );
  }
);

CustomSelect.displayName = "CustomSelect";
