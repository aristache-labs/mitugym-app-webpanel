"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronUp, ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string; // Format: "HH:MM"
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({ 
  value = "", 
  onChange, 
  placeholder = "HH:MM",
  disabled = false,
  className 
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState("06");
  const [minutes, setMinutes] = useState("00");
  const [inputValue, setInputValue] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, shouldOpenUpward: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Check if component is mounted (for portal)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse initial value
  useEffect(() => {
    if (value && value.includes(":")) {
      const [h, m] = value.split(":");
      setHours(h.padStart(2, "0"));
      setMinutes(m.padStart(2, "0"));
      setInputValue(value);
    }
  }, [value]);

  // Calculate dropdown position when opened or when scrolling
  const updateDropdownPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 400; // Approximate height of the dropdown
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      
      // Use fixed positioning (relative to viewport) instead of absolute
      // This works better with nested scroll containers
      setDropdownPosition({
        top: shouldOpenUpward 
          ? rect.top - dropdownHeight - 4
          : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        shouldOpenUpward
      });
    }
  }, []);

  // Update position when opened
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    }
  }, [isOpen, updateDropdownPosition]);

  // Find all scrollable parents
  const getScrollParents = useCallback((element: HTMLElement | null): HTMLElement[] => {
    const parents: HTMLElement[] = [];
    let current = element?.parentElement;
    
    while (current) {
      const overflow = window.getComputedStyle(current).overflow;
      const overflowY = window.getComputedStyle(current).overflowY;
      const overflowX = window.getComputedStyle(current).overflowX;
      
      if (
        overflow === 'auto' || overflow === 'scroll' ||
        overflowY === 'auto' || overflowY === 'scroll' ||
        overflowX === 'auto' || overflowX === 'scroll'
      ) {
        parents.push(current);
      }
      
      current = current.parentElement;
    }
    
    return parents;
  }, []);

  // Update position on scroll and resize
  useEffect(() => {
    if (isOpen) {
      // Use RAF for smooth updates
      let rafId: number;
      const handleUpdate = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          updateDropdownPosition();
        });
      };
      
      // Add listeners to window
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      
      // Add listeners to all scroll parents
      const scrollParents = getScrollParents(containerRef.current);
      scrollParents.forEach(parent => {
        parent.addEventListener('scroll', handleUpdate, true);
      });
      
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
        scrollParents.forEach(parent => {
          parent.removeEventListener('scroll', handleUpdate, true);
        });
      };
    }
  }, [isOpen, updateDropdownPosition, getScrollParents]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Check if click is inside the portal dropdown
        const dropdownElement = document.querySelector('[data-time-picker-dropdown]');
        if (!dropdownElement || !dropdownElement.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const updateTime = (newHours: string, newMinutes: string) => {
    const timeString = `${newHours}:${newMinutes}`;
    setInputValue(timeString);
    onChange?.(timeString);
  };

  const handleInputChange = (inputValue: string) => {
    setInputValue(inputValue);
    
    // Validate and update if valid
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(inputValue)) {
      const [h, m] = inputValue.split(":");
      const formattedHours = h.padStart(2, "0");
      const formattedMinutes = m.padStart(2, "0");
      setHours(formattedHours);
      setMinutes(formattedMinutes);
      onChange?.(inputValue);
    }
  };

  const incrementHours = () => {
    const newHours = ((parseInt(hours) + 1) % 24).toString().padStart(2, "0");
    setHours(newHours);
    updateTime(newHours, minutes);
  };

  const decrementHours = () => {
    const newHours = ((parseInt(hours) - 1 + 24) % 24).toString().padStart(2, "0");
    setHours(newHours);
    updateTime(newHours, minutes);
  };

  const incrementMinutes = () => {
    const newMinutes = ((parseInt(minutes) + 15) % 60).toString().padStart(2, "0");
    setMinutes(newMinutes);
    updateTime(hours, newMinutes);
  };

  const decrementMinutes = () => {
    const newMinutes = ((parseInt(minutes) - 15 + 60) % 60).toString().padStart(2, "0");
    setMinutes(newMinutes);
    updateTime(hours, newMinutes);
  };

  const presetTimes = [
    { label: "6:00 AM", value: "06:00" },
    { label: "7:00 AM", value: "07:00" },
    { label: "8:00 AM", value: "08:00" },
    { label: "9:00 AM", value: "09:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "6:00 PM", value: "18:00" },
    { label: "8:00 PM", value: "20:00" },
    { label: "9:00 PM", value: "21:00" },
    { label: "10:00 PM", value: "22:00" },
    { label: "11:00 PM", value: "23:00" },
  ];

  const renderDropdown = () => {
    if (!isOpen || !mounted) return null;

    return createPortal(
      <div 
        data-time-picker-dropdown
        className="fixed z-[9999] rounded-lg border-2 border-primary/20 bg-card shadow-2xl ring-1 ring-primary/10 max-h-[400px] overflow-auto"
        style={{ 
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          zIndex: 9999,
          backgroundColor: 'var(--card)',
          boxShadow: dropdownPosition.shouldOpenUpward
            ? '0 -25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(77, 212, 212, 0.2), 0 0 20px rgba(77, 212, 212, 0.1)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(77, 212, 212, 0.2), 0 0 20px rgba(77, 212, 212, 0.1)'
        }}
      >
          <div className="p-4 space-y-4">
            {/* Time Spinners */}
            <div className="flex items-center justify-center gap-4">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={incrementHours}
                  className="p-1 hover:bg-surface/60 rounded transition-colors"
                >
                  <ChevronUp className="w-4 h-4 text-muted" />
                </button>
                <div className="w-12 h-10 flex items-center justify-center bg-surface/40 rounded border border-surface/60 text-lg font-mono">
                  {hours}
                </div>
                <button
                  type="button"
                  onClick={decrementHours}
                  className="p-1 hover:bg-surface/60 rounded transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-muted" />
                </button>
              </div>

              {/* Separator */}
              <div className="text-2xl font-mono text-muted">:</div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={incrementMinutes}
                  className="p-1 hover:bg-surface/60 rounded transition-colors"
                >
                  <ChevronUp className="w-4 h-4 text-muted" />
                </button>
                <div className="w-12 h-10 flex items-center justify-center bg-surface/40 rounded border border-surface/60 text-lg font-mono">
                  {minutes}
                </div>
                <button
                  type="button"
                  onClick={decrementMinutes}
                  className="p-1 hover:bg-surface/60 rounded transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-muted" />
                </button>
              </div>
            </div>

            {/* Preset Times */}
            <div className="border-t border-surface/30 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                Quick Select
              </p>
              <div className="grid grid-cols-2 gap-1">
                {presetTimes.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      const [h, m] = preset.value.split(":");
                      setHours(h);
                      setMinutes(m);
                      updateTime(h, m);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "px-2 py-1 text-xs rounded hover:bg-surface/60 transition-colors text-left",
                      value === preset.value && "bg-primary/20 text-primary"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-surface/30 pt-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs bg-gradient-to-br from-slate-700/60 via-slate-800/50 to-slate-700/60 hover:from-slate-600/70 hover:via-slate-700/60 hover:to-slate-600/70 text-slate-300 hover:text-slate-100 !border-none hover:!border-none focus:!border-none focus-visible:!border-none !ring-0 hover:!ring-0 focus:!ring-0 focus-visible:!ring-0 !ring-offset-0 !outline-none transition-all duration-500 ease-out shadow-md shadow-black/15 hover:shadow-lg hover:shadow-black/25 backdrop-blur-sm font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateTime(hours, minutes);
                  setIsOpen(false);
                }}
                className="px-4 py-2 text-xs bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-slate-200 hover:text-white !border-none hover:!border-none focus:!border-none focus-visible:!border-none !ring-0 hover:!ring-0 focus:!ring-0 focus-visible:!ring-0 !ring-offset-0 !outline-none transition-all duration-500 ease-out shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 backdrop-blur-sm font-medium rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
      document.body
    );
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input with Picker Button */}
      <div className="flex">
        {/* Manual Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex-1 rounded-l-lg border border-r-0 px-3 py-2 transition-all",
            "bg-surface/40 border-surface/60 text-text font-mono",
            "focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none focus:z-10",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "placeholder:text-muted"
          )}
        />
        
        {/* Picker Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "rounded-r-lg border px-3 py-2 transition-all",
            "bg-surface/40 border-surface/60 text-muted",
            "hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isOpen && "border-primary/50 bg-primary/10 text-primary"
          )}
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>

      {/* Render dropdown via portal */}
      {renderDropdown()}
    </div>
  );
}
